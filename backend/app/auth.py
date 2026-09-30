"""Password hashing + JWT session handling for the single admin account."""
import os
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from . import models
from .database import get_db

JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "dev-only-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_DAYS = 7
RESET_TOKEN_EXPIRES_MINUTES = 60

_bearer = HTTPBearer(auto_error=False)


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(username: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRES_DAYS)
    payload = {"sub": username, "exp": expires_at}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> models.AdminUser:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise unauthorized

    username = payload.get("sub")
    admin = db.query(models.AdminUser).filter(models.AdminUser.username == username).first()
    if admin is None:
        raise unauthorized
    return admin
