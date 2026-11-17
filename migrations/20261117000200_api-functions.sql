-- Forest Haven Farm — the "API", as Postgres functions.
--
-- Each public function here replaces one FastAPI endpoint and is called from
-- the React app with `insforge.database.rpc('<name>', {...})` (see
-- frontend/src/api.js). They return JSON in the same shape the old endpoints
-- did, so the pages didn't need to change.
--
-- Functions named admin_* start with fhf_require_admin(), so they refuse to run
-- for anyone who isn't listed in public.admins.
-- Internal helpers are prefixed fhf_ and are not callable by site visitors.

-- ===========================================================================
-- Internal helpers
-- ===========================================================================

-- The bakery's "today". Pickup dates and order cutoffs are calendar days on
-- the farm, not in UTC, so a late-evening order isn't counted as tomorrow.
create or replace function public.fhf_today()
returns date
language sql
stable
as $$
  select (now() at time zone 'America/New_York')::date;
$$;

create or replace function public.fhf_require_admin()
returns void
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authenticated.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.fhf_is_email(p text)
returns boolean
language sql
immutable
as $$
  select p is not null and p ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$';
$$;

-- Raises a 400-style error unless trimmed text length is within [min, max].
create or replace function public.fhf_check_text(p_value text, p_field text, p_min int, p_max int)
returns text
language plpgsql
immutable
as $$
declare
  v text := btrim(coalesce(p_value, ''));
begin
  if length(v) < p_min then
    raise exception '% is required.', p_field using errcode = '22023';
  end if;
  if length(v) > p_max then
    raise exception '% is too long (max % characters).', p_field, p_max using errcode = '22023';
  end if;
  return v;
end;
$$;

-- Python-style weekday (Monday = 0 … Sunday = 6), which is what the saved
-- "parameters" content uses.
create or replace function public.fhf_weekday(d date)
returns int
language sql
immutable
as $$
  select extract(isodow from d)::int - 1;
$$;

create or replace function public.fhf_weekday_name(d date)
returns text
language sql
immutable
as $$
  select (array['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'])[extract(isodow from d)::int];
$$;

-- Current operational parameters merged over the built-in defaults.
create or replace function public.fhf_parameters()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
           'orderNotifyEmail', 'epforest@yahoo.com',
           'orderCutoffDays', 3,
           'rollingWeeksAhead', 8,
           'pickupDays', jsonb_build_array(
             jsonb_build_object('weekday', 0, 'maxBreads', 20),
             jsonb_build_object('weekday', 2, 'maxBreads', 20)
           )
         )
         || coalesce((select data from public.content_blocks where key = 'parameters' and lang = ''), '{}'::jsonb);
$$;

create or replace function public.fhf_cutoff_days()
returns int
language sql
stable
as $$
  select coalesce((public.fhf_parameters() ->> 'orderCutoffDays')::int, 3);
$$;

-- Breads already ordered (not cancelled) for a pickup date.
create or replace function public.fhf_ordered_count(p_date date)
returns int
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(sum(oi.quantity), 0)::int
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.pickup_date = p_date and o.status <> 'cancelled';
$$;

-- Public view of one pickup date (counts + availability).
create or replace function public.fhf_annotate_pickup(p_row public.pickup_dates, p_today date default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_today     date := coalesce(p_today, public.fhf_today());
  v_ordered   int  := public.fhf_ordered_count(p_row.date);
  v_remaining int  := greatest(p_row.max_breads - v_ordered, 0);
  v_cutoff    date := p_row.date - public.fhf_cutoff_days();
begin
  return jsonb_build_object(
    'id', p_row.id,
    'date', to_char(p_row.date, 'YYYY-MM-DD'),
    'weekday', public.fhf_weekday_name(p_row.date),
    'max_breads', p_row.max_breads,
    'ordered', v_ordered,
    'remaining', v_remaining,
    'is_open', p_row.is_open,
    'available', p_row.is_open and p_row.date >= v_today and v_today <= v_cutoff and v_remaining > 0
  );
end;
$$;

-- Makes sure every upcoming pickup weekday in the rolling window has a row.
create or replace function public.fhf_ensure_rolling_dates()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_params  jsonb := public.fhf_parameters();
  v_today   date  := public.fhf_today();
  v_horizon date  := v_today + (coalesce((v_params ->> 'rollingWeeksAhead')::int, 8) * 7);
begin
  insert into public.pickup_dates (date, max_breads, is_open)
  select d::date, (pd ->> 'maxBreads')::int, true
  from generate_series(v_today, v_horizon, interval '1 day') as d
  join jsonb_array_elements(v_params -> 'pickupDays') as pd
    on (pd ->> 'weekday')::int = public.fhf_weekday(d::date)
  on conflict (date) do nothing;
end;
$$;

-- Re-syncs upcoming pickup dates after the parameters change:
--   * dates on a still-configured weekday get the new bread cap;
--   * dates on a weekday that's no longer offered are deleted if they have no
--     orders, otherwise closed (so order history is kept);
--   * any newly added weekday's dates are generated.
create or replace function public.fhf_apply_parameters()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_params jsonb := public.fhf_parameters();
  v_today  date  := public.fhf_today();
  r        record;
  v_cap    int;
begin
  for r in select * from public.pickup_dates where date >= v_today loop
    select (pd ->> 'maxBreads')::int into v_cap
    from jsonb_array_elements(v_params -> 'pickupDays') pd
    where (pd ->> 'weekday')::int = public.fhf_weekday(r.date);

    if v_cap is not null then
      update public.pickup_dates set max_breads = v_cap where id = r.id;
    elsif exists (select 1 from public.orders where pickup_date = r.date and status <> 'cancelled') then
      update public.pickup_dates set is_open = false where id = r.id;
    else
      delete from public.pickup_dates where id = r.id;
    end if;
  end loop;

  perform public.fhf_ensure_rolling_dates();
end;
$$;

-- One order as JSON, with its items and total (same shape as the old OrderOut).
create or replace function public.fhf_order_json(p_order public.orders)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'id', p_order.id,
    'name', p_order.name,
    'email', p_order.email,
    'phone', p_order.phone,
    'pickup_date', to_char(p_order.pickup_date, 'YYYY-MM-DD'),
    'pickup_location', p_order.pickup_location,
    'notes', p_order.notes,
    'status', p_order.status,
    'created_at', p_order.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', oi.id,
               'item_id', oi.item_id,
               'bread_item', oi.bread_item,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price::float8,
               'line_total', round(oi.unit_price * oi.quantity, 2)::float8
             ) order by oi.id)
      from public.order_items oi where oi.order_id = p_order.id
    ), '[]'::jsonb),
    'total_amount', coalesce((
      select round(sum(oi.unit_price * oi.quantity), 2)::float8
      from public.order_items oi where oi.order_id = p_order.id
    ), 0)
  );
$$;

-- Report for one pickup date: capacity, per-bread totals, and its orders.
create or replace function public.fhf_date_report(p_row public.pickup_dates)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.fhf_annotate_pickup(p_row) - 'id' - 'weekday' - 'available'
         || jsonb_build_object(
              'bread_breakdown', coalesce((
                select jsonb_object_agg(bread_item, qty)
                from (
                  select oi.bread_item, sum(oi.quantity)::int as qty
                  from public.order_items oi
                  join public.orders o on o.id = oi.order_id
                  where o.pickup_date = p_row.date and o.status <> 'cancelled'
                  group by oi.bread_item
                ) b
              ), '{}'::jsonb),
              'orders', coalesce((
                select jsonb_agg(public.fhf_order_json(o) order by o.created_at)
                from public.orders o
                where o.pickup_date = p_row.date
              ), '[]'::jsonb)
            );
$$;

-- Orderable menu items (fixed numeric price) for one language.
create or replace function public.fhf_bread_catalog(p_lang text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with menu as (
    select coalesce(
      (select data from public.content_blocks
        where key = 'menu_items' and lang = case when p_lang in ('en', 'es') then p_lang else 'en' end),
      '[]'::jsonb
    ) as items
  ),
  priced as (
    select item ->> 'id' as id,
           item ->> 'name' as name,
           nullif(replace(substring(item ->> 'price' from '[0-9,]+\.?[0-9]*'), ',', ''), '') as price_text,
           ord
    from menu, jsonb_array_elements(menu.items) with ordinality as t(item, ord)
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'price', price_text::float8) order by ord), '[]'::jsonb)
  from priced
  where price_text is not null and coalesce(id, '') <> '' and coalesce(name, '') <> '';
$$;

-- Validates/normalises the admin "Parameters" payload (same rules as before).
create or replace function public.fhf_validate_parameters(p_data jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_email   text;
  v_cutoff  int;
  v_weeks   int;
  v_days    jsonb;
  v_norm    jsonb := '[]'::jsonb;
  v_entry   jsonb;
  v_weekday int;
  v_max     int;
  v_w0      int;
  v_w1      int;
  v_diff    int;
begin
  if jsonb_typeof(p_data) is distinct from 'object' then
    raise exception 'Parameters must be an object.' using errcode = '22023';
  end if;

  v_email := btrim(coalesce(p_data ->> 'orderNotifyEmail', ''));
  if not public.fhf_is_email(v_email) then
    raise exception 'Order notification email is not a valid email address.' using errcode = '22023';
  end if;

  begin
    v_cutoff := coalesce(p_data ->> 'orderCutoffDays', '3')::int;
    v_weeks  := coalesce(p_data ->> 'rollingWeeksAhead', '8')::int;
  exception when others then
    raise exception 'Cutoff days and weeks ahead must be whole numbers.' using errcode = '22023';
  end;
  if v_cutoff not between 0 and 14 then
    raise exception 'Order cutoff must be between 0 and 14 days before pickup.' using errcode = '22023';
  end if;
  if v_weeks not between 1 and 52 then
    raise exception 'Rolling weeks ahead must be between 1 and 52.' using errcode = '22023';
  end if;

  v_days := p_data -> 'pickupDays';
  if jsonb_typeof(v_days) is distinct from 'array' or jsonb_array_length(v_days) <> 2 then
    raise exception 'Exactly two pickup days are required.' using errcode = '22023';
  end if;

  for v_entry in select * from jsonb_array_elements(v_days) loop
    if jsonb_typeof(v_entry) is distinct from 'object' then
      raise exception 'Each pickup day must be an object.' using errcode = '22023';
    end if;
    begin
      v_weekday := (v_entry ->> 'weekday')::int;
      v_max     := (v_entry ->> 'maxBreads')::int;
    exception when others then
      raise exception 'Pickup weekday and max breads must be whole numbers.' using errcode = '22023';
    end;
    if v_weekday is null or v_weekday not between 0 and 6 then
      raise exception 'Pickup weekday must be between Monday and Sunday.' using errcode = '22023';
    end if;
    if v_max is null or v_max not between 1 and 1000 then
      raise exception 'Max breads per day must be between 1 and 1000.' using errcode = '22023';
    end if;
    v_norm := v_norm || jsonb_build_array(jsonb_build_object('weekday', v_weekday, 'maxBreads', v_max));
  end loop;

  v_w0 := (v_norm -> 0 ->> 'weekday')::int;
  v_w1 := (v_norm -> 1 ->> 'weekday')::int;
  if v_w0 = v_w1 then
    raise exception 'The two pickup days must fall on different weekdays.' using errcode = '22023';
  end if;
  v_diff := abs(v_w0 - v_w1);
  if least(v_diff, 7 - v_diff) < 2 then
    raise exception 'The two pickup days must be at least 2 days apart.' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'orderNotifyEmail', v_email,
    'orderCutoffDays', v_cutoff,
    'rollingWeeksAhead', v_weeks,
    'pickupDays', (select jsonb_agg(e order by (e ->> 'weekday')::int) from jsonb_array_elements(v_norm) e)
  );
end;
$$;

-- ===========================================================================
-- Public site
-- ===========================================================================

-- GET /api/content — the whole editable content tree in one shot.
create or replace function public.get_site_content()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select jsonb_object_agg(key, data) from public.content_blocks where lang = ''),
    '{}'::jsonb
  )
  || coalesce(
    (select jsonb_object_agg(key, per_lang)
       from (select key, jsonb_object_agg(lang, data) as per_lang
               from public.content_blocks where lang <> '' group by key) k),
    '{}'::jsonb
  );
$$;

-- GET /api/orders/catalog
create or replace function public.get_bread_catalog(p_lang text default 'en')
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.fhf_bread_catalog(p_lang);
$$;

-- GET /api/pickup-dates — upcoming slots for the Orders page calendar.
create or replace function public.list_pickup_dates()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := public.fhf_today();
begin
  perform public.fhf_ensure_rolling_dates();
  return coalesce(
    (select jsonb_agg(public.fhf_annotate_pickup(p, v_today) order by p.date)
       from public.pickup_dates p where p.date >= v_today),
    '[]'::jsonb
  );
end;
$$;

-- POST /api/orders — records an order request (no payment taken).
-- Prices come from the live menu, never from the browser.
create or replace function public.place_order(p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name     text := public.fhf_check_text(p_order ->> 'name', 'Name', 1, 120);
  v_email    text := lower(public.fhf_check_text(p_order ->> 'email', 'Email', 3, 255));
  v_phone    text := public.fhf_check_text(p_order ->> 'phone', 'Phone', 1, 40);
  v_location text := public.fhf_check_text(p_order ->> 'pickup_location', 'Pickup location', 1, 120);
  v_notes    text := nullif(btrim(coalesce(p_order ->> 'notes', '')), '');
  v_lang     text := case when p_order ->> 'lang' in ('en', 'es') then p_order ->> 'lang' else 'en' end;
  v_items    jsonb := p_order -> 'items';
  v_catalog  jsonb;
  v_pickup   public.pickup_dates;
  v_date     date;
  v_today    date := public.fhf_today();
  v_total    int := 0;
  v_item     jsonb;
  v_qty      int;
  v_entry    jsonb;
  v_order    public.orders;
begin
  if not public.fhf_is_email(v_email) then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;
  if length(coalesce(v_notes, '')) > 2000 then
    raise exception 'Notes are too long (max 2000 characters).' using errcode = '22023';
  end if;
  if coalesce((p_order ->> 'policy_ack')::boolean, false) is not true then
    raise exception 'Pickup policy must be acknowledged.' using errcode = '22023';
  end if;
  if jsonb_typeof(v_items) is distinct from 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'Please add at least one bread to your order.' using errcode = '22023';
  end if;
  if jsonb_array_length(v_items) > 50 then
    raise exception 'Too many different items in one order.' using errcode = '22023';
  end if;

  begin
    v_date := (p_order ->> 'pickup_date')::date;
  exception when others then
    raise exception 'Invalid pickup date.' using errcode = '22023';
  end;

  for v_item in select * from jsonb_array_elements(v_items) loop
    begin
      v_qty := (v_item ->> 'quantity')::int;
    exception when others then
      v_qty := null;
    end;
    if v_qty is null or v_qty not between 1 and 50 then
      raise exception 'Each item quantity must be between 1 and 50.' using errcode = '22023';
    end if;
    v_total := v_total + v_qty;
  end loop;

  -- Lock the pickup date so two orders can't both take the last loaves.
  select * into v_pickup from public.pickup_dates where date = v_date for update;
  if v_pickup.id is null
     or not v_pickup.is_open
     or v_date < v_today
     or v_today > v_date - public.fhf_cutoff_days()
     or v_total > greatest(v_pickup.max_breads - public.fhf_ordered_count(v_date), 0) then
    raise exception 'That pickup date is no longer available — it may be full, closed, or past its order cutoff. Please choose another date.'
      using errcode = '22023';
  end if;

  v_catalog := public.fhf_bread_catalog(v_lang);

  insert into public.orders (name, email, phone, pickup_date, pickup_location, notes, policy_ack, lang)
  values (v_name, v_email, v_phone, v_date, v_location, v_notes, true, v_lang)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(v_items) loop
    select e into v_entry from jsonb_array_elements(v_catalog) e where e ->> 'id' = v_item ->> 'item_id';
    if v_entry is null then
      raise exception 'Unknown bread item: %', coalesce(v_item ->> 'item_id', '(missing)') using errcode = '22023';
    end if;
    insert into public.order_items (order_id, item_id, bread_item, quantity, unit_price)
    values (v_order.id, v_entry ->> 'id', v_entry ->> 'name', (v_item ->> 'quantity')::int, (v_entry ->> 'price')::numeric);
    v_entry := null;
  end loop;

  return public.fhf_order_json(v_order);
end;
$$;

-- POST /api/contact
create or replace function public.submit_contact(p_name text, p_email text, p_subject text, p_message text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.contact_messages;
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if not public.fhf_is_email(v_email) or length(v_email) > 255 then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;
  insert into public.contact_messages (name, email, subject, message)
  values (
    public.fhf_check_text(p_name, 'Name', 1, 120),
    v_email,
    public.fhf_check_text(p_subject, 'Subject', 1, 120),
    public.fhf_check_text(p_message, 'Message', 1, 4000)
  )
  returning * into v_row;
  return jsonb_build_object('id', v_row.id, 'status', v_row.status, 'created_at', v_row.created_at);
end;
$$;

-- POST /api/analytics/pageview
create or replace function public.record_pageview(
  p_path text,
  p_visitor_id text,
  p_referrer text default null,
  p_device_type text default 'desktop',
  p_lang text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(p_path, '') = '' or coalesce(p_visitor_id, '') = '' then
    return;
  end if;
  insert into public.page_views (path, referrer, device_type, lang, visitor_id)
  values (
    left(p_path, 255),
    nullif(left(coalesce(p_referrer, ''), 500), ''),
    case when p_device_type in ('desktop', 'mobile', 'tablet') then p_device_type else 'desktop' end,
    left(p_lang, 5),
    left(p_visitor_id, 64)
  );
end;
$$;

-- ===========================================================================
-- Admin account
-- ===========================================================================

-- GET /api/auth/status — true until the first admin has been set up.
create or replace function public.admin_setup_required()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select not exists (select 1 from public.admins);
$$;

-- Makes the signed-in user the site's admin — only works while there is none.
create or replace function public.claim_first_admin(p_username text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated.' using errcode = '42501';
  end if;
  lock table public.admins in exclusive mode;
  if exists (select 1 from public.admins where user_id = v_uid) then
    return public.admin_me();
  end if;
  if exists (select 1 from public.admins) then
    raise exception 'An admin account already exists. Please log in.' using errcode = '42501';
  end if;
  insert into public.admins (user_id, username, email)
  values (v_uid, nullif(btrim(coalesce(p_username, '')), ''), auth.email());
  return public.admin_me();
end;
$$;

-- GET /api/auth/me
create or replace function public.admin_me()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.admins;
begin
  select * into v_row from public.admins where user_id = auth.uid();
  if v_row.user_id is null then
    raise exception 'Not authenticated.' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'id', v_row.user_id,
    'username', coalesce(v_row.username, split_part(coalesce(v_row.email, ''), '@', 1)),
    'email', coalesce(v_row.email, auth.email()),
    'created_at', v_row.created_at
  );
end;
$$;

-- ===========================================================================
-- Admin: content
-- ===========================================================================

-- PUT /api/admin/content/{key}
create or replace function public.admin_update_content(p_key text, p_lang text, p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lang_indep boolean;
  v_lang       text := coalesce(p_lang, '');
  v_data       jsonb := p_data;
begin
  perform public.fhf_require_admin();

  select bool_or(lang = '') into v_lang_indep from public.content_blocks where key = p_key;
  if v_lang_indep is null then
    raise exception 'Unknown content key ''%''.', p_key using errcode = '22023';
  end if;

  if v_lang_indep then
    v_lang := '';
  elsif v_lang not in ('en', 'es') then
    raise exception '''%'' requires lang to be one of [en, es].', p_key using errcode = '22023';
  end if;

  if p_key = 'parameters' then
    v_data := public.fhf_validate_parameters(p_data);
  end if;

  insert into public.content_blocks (key, lang, data, updated_at)
  values (p_key, v_lang, v_data, now())
  on conflict (key, lang) do update set data = excluded.data, updated_at = now();

  if p_key = 'parameters' then
    perform public.fhf_apply_parameters();
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- ===========================================================================
-- Admin: orders & messages
-- ===========================================================================

create or replace function public.admin_list_orders()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.fhf_require_admin();
  return coalesce((select jsonb_agg(public.fhf_order_json(o) order by o.created_at desc) from public.orders o), '[]'::jsonb);
end;
$$;

create or replace function public.admin_get_order(p_id bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders;
begin
  perform public.fhf_require_admin();
  select * into v_order from public.orders where id = p_id;
  if v_order.id is null then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;
  return public.fhf_order_json(v_order);
end;
$$;

create or replace function public.admin_update_order_status(p_id bigint, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders;
begin
  perform public.fhf_require_admin();
  update public.orders set status = public.fhf_check_text(p_status, 'Status', 1, 30)
  where id = p_id returning * into v_order;
  if v_order.id is null then
    raise exception 'Order not found.' using errcode = 'P0002';
  end if;
  return public.fhf_order_json(v_order);
end;
$$;

create or replace function public.admin_list_contact_messages()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.fhf_require_admin();
  return coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at desc) from public.contact_messages m), '[]'::jsonb);
end;
$$;

create or replace function public.admin_update_contact_status(p_id bigint, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.contact_messages;
begin
  perform public.fhf_require_admin();
  update public.contact_messages set status = public.fhf_check_text(p_status, 'Status', 1, 30)
  where id = p_id returning * into v_row;
  if v_row.id is null then
    raise exception 'Message not found.' using errcode = 'P0002';
  end if;
  return to_jsonb(v_row);
end;
$$;

-- ===========================================================================
-- Admin: pickup dates
-- ===========================================================================

create or replace function public.admin_list_pickup_dates()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := public.fhf_today();
begin
  perform public.fhf_require_admin();
  perform public.fhf_ensure_rolling_dates();
  return coalesce((select jsonb_agg(public.fhf_annotate_pickup(p, v_today) order by p.date) from public.pickup_dates p), '[]'::jsonb);
end;
$$;

create or replace function public.admin_create_pickup_date(p_date text, p_max_breads int default 20)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_date date;
  v_row  public.pickup_dates;
begin
  perform public.fhf_require_admin();
  begin
    v_date := p_date::date;
  exception when others then
    raise exception 'Invalid date format, expected YYYY-MM-DD.' using errcode = '22023';
  end;
  if coalesce(p_max_breads, 0) not between 1 and 1000 then
    raise exception 'Max breads must be between 1 and 1000.' using errcode = '22023';
  end if;
  if exists (select 1 from public.pickup_dates where date = v_date) then
    raise exception 'A pickup date already exists for that day.' using errcode = '22023';
  end if;
  insert into public.pickup_dates (date, max_breads, is_open) values (v_date, p_max_breads, true)
  returning * into v_row;
  return public.fhf_annotate_pickup(v_row);
end;
$$;

create or replace function public.admin_update_pickup_date(p_id bigint, p_max_breads int default null, p_is_open boolean default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.pickup_dates;
begin
  perform public.fhf_require_admin();
  if p_max_breads is not null and p_max_breads not between 1 and 1000 then
    raise exception 'Max breads must be between 1 and 1000.' using errcode = '22023';
  end if;
  update public.pickup_dates
     set max_breads = coalesce(p_max_breads, max_breads),
         is_open    = coalesce(p_is_open, is_open)
   where id = p_id
  returning * into v_row;
  if v_row.id is null then
    raise exception 'Pickup date not found.' using errcode = 'P0002';
  end if;
  return public.fhf_annotate_pickup(v_row);
end;
$$;

create or replace function public.admin_delete_pickup_date(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.pickup_dates;
begin
  perform public.fhf_require_admin();
  select * into v_row from public.pickup_dates where id = p_id;
  if v_row.id is null then
    raise exception 'Pickup date not found.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.orders where pickup_date = v_row.date) then
    raise exception 'This date already has orders — close it instead of deleting it.' using errcode = '22023';
  end if;
  delete from public.pickup_dates where id = p_id;
end;
$$;

create or replace function public.admin_pickup_date_report(p_date text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.pickup_dates;
begin
  perform public.fhf_require_admin();
  select * into v_row from public.pickup_dates where date = p_date::date;
  if v_row.id is null then
    raise exception 'Pickup date not found.' using errcode = 'P0002';
  end if;
  return public.fhf_date_report(v_row);
end;
$$;

create or replace function public.admin_pickup_range_report(p_start text, p_end text, p_period text default 'range')
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_start date;
  v_end   date;
  v_dates jsonb;
begin
  perform public.fhf_require_admin();
  begin
    v_start := p_start::date;
    v_end   := p_end::date;
  exception when others then
    raise exception 'Invalid date format, expected YYYY-MM-DD.' using errcode = '22023';
  end;
  if v_end < v_start then
    raise exception 'end must be on or after start.' using errcode = '22023';
  end if;
  if v_end - v_start > 366 then
    raise exception 'Range too large (max 1 year).' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(public.fhf_date_report(p) order by p.date), '[]'::jsonb) into v_dates
  from public.pickup_dates p where p.date between v_start and v_end;

  return jsonb_build_object(
    'start', p_start,
    'end', p_end,
    'period', coalesce(p_period, 'range'),
    'total_ordered', coalesce((select sum((d ->> 'ordered')::int) from jsonb_array_elements(v_dates) d), 0),
    'total_capacity', coalesce((select sum((d ->> 'max_breads')::int) from jsonb_array_elements(v_dates) d), 0),
    'order_count', coalesce((select sum(jsonb_array_length(d -> 'orders')) from jsonb_array_elements(v_dates) d), 0),
    'bread_breakdown', coalesce((
      select jsonb_object_agg(k, total)
      from (
        select kv.key as k, sum(kv.value::int) as total
        from jsonb_array_elements(v_dates) d, jsonb_each_text(d -> 'bread_breakdown') kv
        group by kv.key
      ) s
    ), '{}'::jsonb),
    'dates', v_dates
  );
end;
$$;

-- ===========================================================================
-- Admin: analytics
-- ===========================================================================

create or replace function public.admin_analytics_summary(p_days int default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_days  int := least(greatest(coalesce(p_days, 30), 1), 365);
  v_since timestamptz := now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
  v_total int;
begin
  perform public.fhf_require_admin();

  select count(*) into v_total from public.page_views where created_at >= v_since;

  return jsonb_build_object(
    'range_days', v_days,
    'total_views', v_total,
    'unique_visitors', (select count(distinct visitor_id) from public.page_views where created_at >= v_since),
    'top_pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', path, 'views', views) order by views desc, path)
      from (select path, count(*) as views from public.page_views where created_at >= v_since
            group by path order by count(*) desc, path limit 10) t
    ), '[]'::jsonb),
    'device_breakdown', coalesce((
      select jsonb_agg(jsonb_build_object('device_type', coalesce(device_type, 'unknown'), 'views', views))
      from (select device_type, count(*) as views from public.page_views where created_at >= v_since group by device_type) t
    ), '[]'::jsonb),
    'lang_breakdown', coalesce((
      select jsonb_agg(jsonb_build_object('lang', coalesce(lang, 'unknown'), 'views', views))
      from (select lang, count(*) as views from public.page_views where created_at >= v_since group by lang) t
    ), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('date', to_char(day, 'YYYY-MM-DD'), 'views', views, 'unique_visitors', uniques) order by day)
      from (select (created_at at time zone 'America/New_York')::date as day,
                   count(*) as views, count(distinct visitor_id) as uniques
            from public.page_views where created_at >= v_since group by 1) t
    ), '[]'::jsonb),
    'top_referrers', coalesce((
      select jsonb_agg(jsonb_build_object('domain', domain, 'views', views) order by views desc, domain)
      from (select domain, count(*) as views
            from (select substring(referrer from '^[a-zA-Z][a-zA-Z0-9+.-]*://([^/?#]+)') as domain
                  from public.page_views where created_at >= v_since and referrer is not null) r
            where domain is not null
            group by domain order by count(*) desc, domain limit 10) t
    ), '[]'::jsonb),
    'direct_views', v_total - (
      select count(*) from public.page_views
      where created_at >= v_since and referrer is not null
        and substring(referrer from '^[a-zA-Z][a-zA-Z0-9+.-]*://([^/?#]+)') is not null
    )
  );
end;
$$;

-- ===========================================================================
-- Permissions: site visitors may only call the public API functions above.
-- ===========================================================================
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'fhf\_%'
  loop
    execute format('revoke execute on function %s from public', f.sig);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke execute on function %s from anon', f.sig);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke execute on function %s from authenticated', f.sig);
    end if;
  end loop;
end
$$;
