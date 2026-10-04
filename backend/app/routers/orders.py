from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import content_service, email_service, models, pickup_service, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("/catalog", response_model=list[schemas.BreadCatalogItemOut])
def get_bread_catalog(lang: str = "en", db: Session = Depends(get_db)):
    """Orderable breads + authoritative prices for the Orders page cart.

    Sourced from the same admin-editable Menu content the Menu page renders,
    so a price/name change in the admin panel shows up here immediately.
    """
    return content_service.get_orderable_menu_items(db, lang)


@router.post("", response_model=schemas.OrderOut, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Receive an order request from the Orders page.

    This does not take payment — it just records the request so the bakery
    can confirm it (matches how most small-batch bakeries actually operate).
    """
    if not order.policy_ack:
        raise HTTPException(status_code=400, detail="Pickup policy must be acknowledged.")

    total_quantity = sum(item.quantity for item in order.items)
    pickup_row = pickup_service.validate_order_capacity(db, order.pickup_date, total_quantity)
    if pickup_row is None:
        raise HTTPException(
            status_code=400,
            detail="That pickup date is no longer available — it may be full, closed, or past its order cutoff. Please choose another date.",
        )

    order_items = []
    for item in order.items:
        catalog_entry = content_service.get_menu_item(db, item.item_id, order.lang)
        if catalog_entry is None:
            raise HTTPException(status_code=400, detail=f"Unknown bread item: {item.item_id}")
        order_items.append(
            models.OrderItem(
                item_id=catalog_entry["id"],
                bread_item=catalog_entry["name"],
                quantity=item.quantity,
                unit_price=catalog_entry["price"],
            )
        )

    db_order = models.Order(
        name=order.name,
        email=order.email,
        phone=order.phone,
        pickup_date=order.pickup_date,
        pickup_location=order.pickup_location,
        notes=order.notes,
        policy_ack="true",
    )
    db_order.items = order_items
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    email_service.send_order_notification(db_order, db)
    email_service.send_order_confirmation(db_order, db)

    return db_order


@router.get("", response_model=list[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db), admin: models.AdminUser = Depends(get_current_admin)):
    """List all order requests, newest first — admin-only (see admin/Orders)."""
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), admin: models.AdminUser = Depends(get_current_admin)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return db_order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found.")
    db_order.status = payload.status
    db.commit()
    db.refresh(db_order)
    return db_order
