from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import content_service, models, pickup_service, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(tags=["content"])


@router.get("/api/content")
def get_content(db: Session = Depends(get_db)):
    """Public — the full editable site content tree (menu, FAQ, history, etc.)."""
    return content_service.get_all_content(db)


@router.put("/api/admin/content/{key}")
def update_content(
    key: str,
    payload: schemas.ContentUpdate,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    if key not in content_service.VALID_KEYS:
        raise HTTPException(status_code=404, detail=f"Unknown content key '{key}'.")
    try:
        content_service.set_content(db, key, payload.lang, payload.data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if key == "parameters":
        # Re-sync upcoming pickup dates / caps to the new parameters.
        pickup_service.apply_parameters(db)

    return {"ok": True}
