from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, pickup_service, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(tags=["pickup-dates"])


@router.get("/api/pickup-dates", response_model=list[schemas.PickupDateOut])
def list_pickup_dates(db: Session = Depends(get_db)):
    """Upcoming Monday/Wednesday pickup slots for the Orders page calendar."""
    pickup_service.ensure_rolling_dates(db)
    today = date.today()
    rows = (
        db.query(models.PickupDate)
        .filter(models.PickupDate.date >= today.isoformat())
        .order_by(models.PickupDate.date)
        .all()
    )
    return [pickup_service.annotate(db, row, today) for row in rows]


@router.get("/api/admin/pickup-dates", response_model=list[schemas.PickupDateOut])
def admin_list_pickup_dates(db: Session = Depends(get_db), admin: models.AdminUser = Depends(get_current_admin)):
    pickup_service.ensure_rolling_dates(db)
    today = date.today()
    rows = db.query(models.PickupDate).order_by(models.PickupDate.date).all()
    return [pickup_service.annotate(db, row, today) for row in rows]


@router.post("/api/admin/pickup-dates", response_model=schemas.PickupDateOut, status_code=201)
def admin_create_pickup_date(
    payload: schemas.PickupDateCreate,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    try:
        parsed = date.fromisoformat(payload.date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD.")

    existing = db.query(models.PickupDate).filter(models.PickupDate.date == parsed.isoformat()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A pickup date already exists for that day.")

    row = models.PickupDate(date=parsed.isoformat(), max_breads=payload.max_breads, is_open=True)
    db.add(row)
    db.commit()
    db.refresh(row)
    return pickup_service.annotate(db, row)


@router.patch("/api/admin/pickup-dates/{pickup_date_id}", response_model=schemas.PickupDateOut)
def admin_update_pickup_date(
    pickup_date_id: int,
    payload: schemas.PickupDateUpdate,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    row = db.query(models.PickupDate).filter(models.PickupDate.id == pickup_date_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Pickup date not found.")
    if payload.max_breads is not None:
        row.max_breads = payload.max_breads
    if payload.is_open is not None:
        row.is_open = payload.is_open
    db.commit()
    db.refresh(row)
    return pickup_service.annotate(db, row)


@router.delete("/api/admin/pickup-dates/{pickup_date_id}", status_code=204)
def admin_delete_pickup_date(
    pickup_date_id: int,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    row = db.query(models.PickupDate).filter(models.PickupDate.id == pickup_date_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Pickup date not found.")
    has_orders = db.query(models.Order).filter(models.Order.pickup_date == row.date).first()
    if has_orders:
        raise HTTPException(
            status_code=400,
            detail="This date already has orders — close it instead of deleting it.",
        )
    db.delete(row)
    db.commit()
    return None


def _build_date_report(db: Session, row: models.PickupDate) -> dict:
    orders = (
        db.query(models.Order)
        .filter(models.Order.pickup_date == row.date)
        .order_by(models.Order.created_at)
        .all()
    )

    breakdown: dict[str, int] = {}
    for order in orders:
        if order.status == "cancelled":
            continue
        for item in order.items:
            breakdown[item.bread_item] = breakdown.get(item.bread_item, 0) + item.quantity

    info = pickup_service.annotate(db, row)
    return {
        "date": row.date,
        "max_breads": row.max_breads,
        "ordered": info["ordered"],
        "remaining": info["remaining"],
        "is_open": row.is_open,
        "bread_breakdown": breakdown,
        "orders": orders,
    }


@router.get("/api/admin/pickup-dates/report/range", response_model=schemas.PickupRangeReportOut)
def admin_pickup_range_report(
    start: str = Query(..., description="First pickup date in range, YYYY-MM-DD"),
    end: str = Query(..., description="Last pickup date in range, YYYY-MM-DD"),
    period: str = Query("range", description="day | week | month | range (labelling only)"),
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    try:
        start_d = date.fromisoformat(start)
        end_d = date.fromisoformat(end)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD.")
    if end_d < start_d:
        raise HTTPException(status_code=400, detail="end must be on or after start.")
    if (end_d - start_d) > timedelta(days=366):
        raise HTTPException(status_code=400, detail="Range too large (max 1 year).")

    rows = (
        db.query(models.PickupDate)
        .filter(models.PickupDate.date >= start, models.PickupDate.date <= end)
        .order_by(models.PickupDate.date)
        .all()
    )

    dates = [_build_date_report(db, row) for row in rows]

    combined: dict[str, int] = {}
    for rep in dates:
        for bread, qty in rep["bread_breakdown"].items():
            combined[bread] = combined.get(bread, 0) + qty

    return {
        "start": start,
        "end": end,
        "period": period,
        "total_ordered": sum(r["ordered"] for r in dates),
        "total_capacity": sum(r["max_breads"] for r in dates),
        "order_count": sum(len(r["orders"]) for r in dates),
        "bread_breakdown": combined,
        "dates": dates,
    }


@router.get("/api/admin/pickup-dates/{iso_date}/report", response_model=schemas.PickupDateReportOut)
def admin_pickup_date_report(
    iso_date: str,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    row = db.query(models.PickupDate).filter(models.PickupDate.date == iso_date).first()
    if not row:
        raise HTTPException(status_code=404, detail="Pickup date not found.")
    return _build_date_report(db, row)
