from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=schemas.ContactOut, status_code=201)
def create_contact_message(payload: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_message = models.ContactMessage(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


@router.get("", response_model=list[schemas.ContactOut])
def list_contact_messages(db: Session = Depends(get_db), admin: models.AdminUser = Depends(get_current_admin)):
    """List all contact messages, newest first — admin-only."""
    return db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()


@router.get("/{message_id}", response_model=schemas.ContactOut)
def get_contact_message(
    message_id: int, db: Session = Depends(get_db), admin: models.AdminUser = Depends(get_current_admin)
):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found.")
    return db_message


@router.patch("/{message_id}/status", response_model=schemas.ContactOut)
def update_contact_status(
    message_id: int,
    payload: schemas.ContactStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    db_message = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_message:
        raise HTTPException(status_code=404, detail="Message not found.")
    db_message.status = payload.status
    db.commit()
    db.refresh(db_message)
    return db_message
