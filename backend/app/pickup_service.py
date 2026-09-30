"""Pickup-date generation, capacity, and order-cutoff rules.

Which weekdays pickup is offered on, the per-day bread cap, how far ahead
dates are opened, and the order cutoff are all set in the admin "Parameters"
panel (see content_service.get_parameters). The values below are only
fallbacks used before anything has been saved.
"""
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from . import content_service, models

DEFAULT_MAX_BREADS = 20
ROLLING_WEEKS_AHEAD = 8
PICKUP_WEEKDAYS = (0, 2)  # Monday, Wednesday
DEFAULT_CUTOFF_DAYS = 3
WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _weekday_caps(db: Session) -> dict[int, int]:
    """{weekday -> max_breads} from the current parameters."""
    params = content_service.get_parameters(db)
    return {int(d["weekday"]): int(d["maxBreads"]) for d in params.get("pickupDays", [])}


def _cutoff_days(db: Session) -> int:
    return int(content_service.get_parameters(db).get("orderCutoffDays", DEFAULT_CUTOFF_DAYS))


def _weeks_ahead(db: Session) -> int:
    return int(content_service.get_parameters(db).get("rollingWeeksAhead", ROLLING_WEEKS_AHEAD))


def ensure_rolling_dates(db: Session, today: date | None = None) -> None:
    """Make sure every upcoming pickup weekday within the rolling window exists."""
    today = today or date.today()
    caps = _weekday_caps(db) or {wd: DEFAULT_MAX_BREADS for wd in PICKUP_WEEKDAYS}
    horizon = today + timedelta(weeks=_weeks_ahead(db))
    existing = {
        row.date
        for row in db.query(models.PickupDate.date).filter(models.PickupDate.date >= today.isoformat()).all()
    }

    d = today
    to_add = []
    while d <= horizon:
        if d.weekday() in caps:
            iso = d.isoformat()
            if iso not in existing:
                to_add.append(models.PickupDate(date=iso, max_breads=caps[d.weekday()], is_open=True))
        d += timedelta(days=1)

    if to_add:
        db.add_all(to_add)
        db.commit()


def apply_parameters(db: Session, today: date | None = None) -> None:
    """Re-sync upcoming PickupDate rows after the parameters change.

    - Dates on a still-configured weekday get the new bread cap.
    - Dates on a weekday that's no longer a pickup day are removed if they have
      no orders, otherwise closed (so the historical order data is kept).
    - Any newly-added weekday's dates are generated.
    """
    today = today or date.today()
    caps = _weekday_caps(db)
    future = (
        db.query(models.PickupDate)
        .filter(models.PickupDate.date >= today.isoformat())
        .all()
    )
    for row in future:
        weekday = date.fromisoformat(row.date).weekday()
        if weekday in caps:
            row.max_breads = caps[weekday]
        else:
            has_orders = (
                db.query(models.Order)
                .filter(models.Order.pickup_date == row.date, models.Order.status != "cancelled")
                .first()
            )
            if has_orders:
                row.is_open = False
            else:
                db.delete(row)
    db.commit()
    ensure_rolling_dates(db, today)


def cutoff_date(pickup_date: date, cutoff_days: int = DEFAULT_CUTOFF_DAYS) -> date:
    """Last date an order may be placed for the given pickup date."""
    return pickup_date - timedelta(days=cutoff_days)


def ordered_count(db: Session, iso_date: str) -> int:
    rows = (
        db.query(models.OrderItem.quantity)
        .join(models.Order, models.OrderItem.order_id == models.Order.id)
        .filter(models.Order.pickup_date == iso_date, models.Order.status != "cancelled")
        .all()
    )
    return sum(q for (q,) in rows)


def annotate(db: Session, row: models.PickupDate, today: date | None = None) -> dict:
    """Build the public-facing view of a PickupDate row (counts + availability)."""
    today = today or date.today()
    d = date.fromisoformat(row.date)
    ordered = ordered_count(db, row.date)
    remaining = max(row.max_breads - ordered, 0)
    cutoff = cutoff_date(d, _cutoff_days(db))
    available = row.is_open and d >= today and today <= cutoff and remaining > 0
    return {
        "id": row.id,
        "date": row.date,
        "weekday": WEEKDAY_NAMES[d.weekday()],
        "max_breads": row.max_breads,
        "ordered": ordered,
        "remaining": remaining,
        "is_open": row.is_open,
        "available": available,
    }


def validate_order_capacity(db: Session, iso_date: str, quantity: int, today: date | None = None) -> models.PickupDate:
    """Raise-free lookup: returns the PickupDate row if the order is placeable, else None."""
    today = today or date.today()
    row = db.query(models.PickupDate).filter(models.PickupDate.date == iso_date).first()
    if row is None or not row.is_open:
        return None
    d = date.fromisoformat(row.date)
    if d < today or today > cutoff_date(d, _cutoff_days(db)):
        return None
    remaining = max(row.max_breads - ordered_count(db, iso_date), 0)
    if quantity > remaining:
        return None
    return row
