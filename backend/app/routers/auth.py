import os
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import email_service, models, schemas
from ..auth import (
    RESET_TOKEN_EXPIRES_MINUTES,
    create_access_token,
    generate_reset_token,
    get_current_admin,
    hash_password,
    verify_password,
)
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Generic responses so these endpoints never reveal whether an account exists.
_FORGOT_USERNAME_GENERIC_MESSAGE = "If that email matches our records, we've sent your username to it."
_FORGOT_PASSWORD_GENERIC_MESSAGE = "If an account matches that username or email, reset instructions have been sent."


@router.get("/status", response_model=schemas.AuthStatusOut)
def auth_status(db: Session = Depends(get_db)):
    """Tells the frontend whether to show the signup form or the login form."""
    admin_exists = db.query(models.AdminUser).first() is not None
    return {"setup_required": not admin_exists}


@router.post("/signup", response_model=schemas.TokenOut, status_code=201)
def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    """Creates the one and only admin account. Locked once an admin exists."""
    if db.query(models.AdminUser).first() is not None:
        raise HTTPException(status_code=403, detail="An admin account already exists. Please log in.")

    admin = models.AdminUser(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return {"access_token": create_access_token(admin.username)}


@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.username == payload.username).first()
    if admin is None or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")
    return {"access_token": create_access_token(admin.username)}


@router.get("/me", response_model=schemas.AdminOut)
def me(admin: models.AdminUser = Depends(get_current_admin)):
    return admin


@router.post("/forgot-username", response_model=schemas.MessageOut)
def forgot_username(payload: schemas.ForgotUsernameRequest, db: Session = Depends(get_db)):
    """Emails the admin their username — the first step before resetting a password.

    Always returns the same message regardless of whether a match was found,
    so this endpoint can't be used to check which emails have an account.
    """
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == payload.email).first()
    if admin is not None:
        email_service.send_username_reminder(admin)
    return {"message": _FORGOT_USERNAME_GENERIC_MESSAGE}


@router.post("/forgot-password", response_model=schemas.MessageOut)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Emails a password-reset link if the identifier matches the admin account.

    Always returns the same message regardless of whether a match was found,
    so this endpoint can't be used to check which usernames/emails exist.
    """
    admin = (
        db.query(models.AdminUser)
        .filter(or_(models.AdminUser.username == payload.identifier, models.AdminUser.email == payload.identifier))
        .first()
    )
    if admin is not None and admin.email:
        admin.reset_token = generate_reset_token()
        admin.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRES_MINUTES)
        db.commit()
        reset_link = f"{FRONTEND_URL}/admin/reset-password?token={admin.reset_token}"
        email_service.send_password_reset(admin, reset_link)
    return {"message": _FORGOT_PASSWORD_GENERIC_MESSAGE}


@router.post("/reset-password", response_model=schemas.MessageOut)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.reset_token == payload.token).first()
    if admin is None or admin.reset_token_expires is None:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    expires_at = admin.reset_token_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    admin.password_hash = hash_password(payload.new_password)
    admin.reset_token = None
    admin.reset_token_expires = None
    db.commit()
    return {"message": "Your password has been reset. You can now log in."}
