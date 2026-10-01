"""Pydantic request/response schemas."""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class OrderItemCreate(BaseModel):
    item_id: str = Field(min_length=1, max_length=60)
    quantity: int = Field(ge=1, le=50)


class OrderItemOut(BaseModel):
    id: int
    item_id: str | None
    bread_item: str
    quantity: int
    unit_price: float
    line_total: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=40)
    pickup_date: str
    pickup_location: str = Field(min_length=1, max_length=120)
    notes: str | None = None
    policy_ack: bool
    lang: str = Field(default="en", max_length=5)
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    pickup_date: str
    pickup_location: str
    notes: str | None
    status: str
    created_at: datetime
    items: list[OrderItemOut]
    total_amount: float

    class Config:
        from_attributes = True


class BreadCatalogItemOut(BaseModel):
    id: str
    name: str
    price: float


class OrderStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=30)


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=120)
    message: str = Field(min_length=1, max_length=4000)


class ContactOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    subject: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ContactStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=30)


# ---------- Pickup dates ----------

class PickupDateOut(BaseModel):
    id: int
    date: str
    weekday: str
    max_breads: int
    ordered: int
    remaining: int
    is_open: bool
    available: bool  # is_open, not past, not past the order cutoff, and has remaining capacity

    class Config:
        from_attributes = True


class PickupDateCreate(BaseModel):
    date: str
    max_breads: int = Field(ge=1, le=1000, default=20)


class PickupDateUpdate(BaseModel):
    max_breads: int | None = Field(default=None, ge=1, le=1000)
    is_open: bool | None = None


class PickupDateReportOut(BaseModel):
    date: str
    max_breads: int
    ordered: int
    remaining: int
    is_open: bool
    bread_breakdown: dict[str, int]
    orders: list[OrderOut]


class PickupRangeReportOut(BaseModel):
    start: str
    end: str
    period: str  # "day" | "week" | "month" | "range"
    total_ordered: int
    total_capacity: int
    order_count: int
    bread_breakdown: dict[str, int]
    dates: list[PickupDateReportOut]


# ---------- Admin auth ----------

class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminOut(BaseModel):
    id: int
    username: str
    email: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class AuthStatusOut(BaseModel):
    setup_required: bool


class ForgotUsernameRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=255)  # username or email


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=200)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=200)


class MessageOut(BaseModel):
    message: str


# ---------- Content ----------

class ContentUpdate(BaseModel):
    lang: str | None = None
    data: Any


# ---------- Analytics ----------

class PageViewCreate(BaseModel):
    path: str = Field(min_length=1, max_length=255)
    referrer: str | None = Field(default=None, max_length=500)
    device_type: str = Field(default="desktop", max_length=20)
    lang: str | None = Field(default=None, max_length=5)
    visitor_id: str = Field(min_length=1, max_length=64)
