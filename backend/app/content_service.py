"""Reads/writes the editable site content stored in `content_blocks`."""
import json
import re
from datetime import datetime

from sqlalchemy.orm import Session

from . import models, seed_content

LANG_KEYS = list(seed_content.DEFAULTS_BY_KEY.keys())
LANG_INDEPENDENT_KEYS = list(seed_content.DEFAULTS_LANG_INDEPENDENT.keys())
LANGS = ["en", "es"]


def seed_defaults(db: Session) -> None:
    """Insert default content for any key/lang combo not already in the DB.

    Safe to call on every startup — existing rows (including ones an admin
    has edited) are left untouched.
    """
    existing = {(row.key, row.lang) for row in db.query(models.ContentBlock.key, models.ContentBlock.lang)}

    for key, per_lang in seed_content.DEFAULTS_BY_KEY.items():
        for lang, default_value in per_lang.items():
            if (key, lang) not in existing:
                db.add(models.ContentBlock(key=key, lang=lang, data=json.dumps(default_value)))

    for key, default_value in seed_content.DEFAULTS_LANG_INDEPENDENT.items():
        if (key, "") not in existing:
            db.add(models.ContentBlock(key=key, lang="", data=json.dumps(default_value)))

    db.commit()


def get_all_content(db: Session) -> dict:
    """Returns the full content tree the frontend needs in one shot."""
    rows = db.query(models.ContentBlock).all()
    by_key_lang = {(row.key, row.lang): json.loads(row.data) for row in rows}

    result = {}
    for key in LANG_KEYS:
        result[key] = {
            lang: by_key_lang.get((key, lang), seed_content.DEFAULTS_BY_KEY[key][lang])
            for lang in LANGS
        }
    for key in LANG_INDEPENDENT_KEYS:
        result[key] = by_key_lang.get((key, ""), seed_content.DEFAULTS_LANG_INDEPENDENT[key])

    return result


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _as_int(value, field: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"'{field}' must be a whole number.")


def validate_parameters(data) -> dict:
    """Validate and normalise the operational-parameters payload.

    Raises ValueError with a human-readable message on any problem.
    """
    if not isinstance(data, dict):
        raise ValueError("Parameters must be an object.")

    email = str(data.get("orderNotifyEmail", "")).strip()
    if not _EMAIL_RE.match(email):
        raise ValueError("Order notification email is not a valid email address.")

    cutoff = _as_int(data.get("orderCutoffDays", 3), "orderCutoffDays")
    if not 0 <= cutoff <= 14:
        raise ValueError("Order cutoff must be between 0 and 14 days before pickup.")

    weeks_ahead = _as_int(data.get("rollingWeeksAhead", 8), "rollingWeeksAhead")
    if not 1 <= weeks_ahead <= 52:
        raise ValueError("Rolling weeks ahead must be between 1 and 52.")

    days = data.get("pickupDays")
    if not isinstance(days, list) or len(days) != 2:
        raise ValueError("Exactly two pickup days are required.")

    norm_days = []
    for entry in days:
        if not isinstance(entry, dict):
            raise ValueError("Each pickup day must be an object.")
        weekday = _as_int(entry.get("weekday"), "weekday")
        if not 0 <= weekday <= 6:
            raise ValueError("Pickup weekday must be between Monday and Sunday.")
        max_breads = _as_int(entry.get("maxBreads"), "maxBreads")
        if not 1 <= max_breads <= 1000:
            raise ValueError("Max breads per day must be between 1 and 1000.")
        norm_days.append({"weekday": weekday, "maxBreads": max_breads})

    w0, w1 = norm_days[0]["weekday"], norm_days[1]["weekday"]
    if w0 == w1:
        raise ValueError("The two pickup days must fall on different weekdays.")
    diff = abs(w0 - w1)
    if min(diff, 7 - diff) < 2:
        raise ValueError("The two pickup days must be at least 2 days apart.")

    return {
        "orderNotifyEmail": email,
        "orderCutoffDays": cutoff,
        "rollingWeeksAhead": weeks_ahead,
        "pickupDays": sorted(norm_days, key=lambda d: d["weekday"]),
    }


def get_parameters(db: Session) -> dict:
    """Current operational parameters, merged over the built-in defaults."""
    defaults = dict(seed_content.DEFAULTS_LANG_INDEPENDENT["parameters"])
    row = (
        db.query(models.ContentBlock)
        .filter(models.ContentBlock.key == "parameters", models.ContentBlock.lang == "")
        .first()
    )
    if row is not None:
        try:
            defaults.update(json.loads(row.data))
        except (ValueError, TypeError):
            pass
    return defaults


def set_content(db: Session, key: str, lang: str | None, data) -> None:
    if key == "parameters":
        data = validate_parameters(data)
    normalized_lang = lang or ""
    if key in LANG_KEYS and normalized_lang not in LANGS:
        raise ValueError(f"'{key}' requires lang to be one of {LANGS}.")
    if key in LANG_INDEPENDENT_KEYS:
        normalized_lang = ""

    block = (
        db.query(models.ContentBlock)
        .filter(models.ContentBlock.key == key, models.ContentBlock.lang == normalized_lang)
        .first()
    )
    payload = json.dumps(data)
    if block:
        block.data = payload
        block.updated_at = datetime.utcnow()
    else:
        db.add(models.ContentBlock(key=key, lang=normalized_lang, data=payload))
    db.commit()


VALID_KEYS = set(LANG_KEYS) | set(LANG_INDEPENDENT_KEYS)


def _parse_price(price_str) -> float | None:
    """Extracts a numeric price from strings like "$9" or "$12.50".

    Returns None for non-numeric prices (e.g. "Market Price") — those items
    aren't orderable through the online form since they have no fixed cost.
    """
    if not isinstance(price_str, str):
        return None
    match = re.search(r"[\d,]+\.?\d*", price_str)
    if not match:
        return None
    try:
        return float(match.group().replace(",", ""))
    except ValueError:
        return None


def get_menu_items(db: Session, lang: str) -> list[dict]:
    """The live Menu page content for one language (admin-editable)."""
    normalized_lang = lang if lang in LANGS else "en"
    row = (
        db.query(models.ContentBlock)
        .filter(models.ContentBlock.key == "menu_items", models.ContentBlock.lang == normalized_lang)
        .first()
    )
    if row is not None:
        return json.loads(row.data)
    return seed_content.DEFAULTS_BY_KEY["menu_items"][normalized_lang]


def get_orderable_menu_items(db: Session, lang: str) -> list[dict]:
    """Menu items with a fixed numeric price — what the Orders page can sell.

    Sourced from the same `menu_items` content block the admin Menu editor
    writes to, so a price/name change there is reflected immediately.
    """
    catalog = []
    for item in get_menu_items(db, lang):
        price = _parse_price(item.get("price"))
        if price is None or not item.get("id") or not item.get("name"):
            continue
        catalog.append({"id": item["id"], "name": item["name"], "price": price})
    return catalog


def get_menu_item(db: Session, item_id: str, lang: str) -> dict | None:
    """Looks up one orderable menu item by id — used to price an order server-side."""
    for item in get_orderable_menu_items(db, lang):
        if item["id"] == item_id:
            return item
    return None
