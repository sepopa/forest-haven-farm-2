"""SQLAlchemy ORM models.

Order and ContactMessage are intentionally simple — this is the seed for the
CRM described in the project brief. Add a `status` workflow, a Customer
table, or an admin-only router on top of these as the CRM phase starts.
"""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(40), nullable=False)
    pickup_date = Column(String(20), nullable=False, index=True)  # ISO date string, e.g. 2026-08-29
    pickup_location = Column(String(120), nullable=False)
    notes = Column(Text, nullable=True)
    policy_ack = Column(String(10), nullable=False, default="false")
    status = Column(String(30), nullable=False, default="new")  # new -> confirmed -> fulfilled
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    @property
    def total_amount(self) -> float:
        return round(sum(item.line_total for item in self.items), 2)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    item_id = Column(String(60), nullable=True)
    bread_item = Column(String(120), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)

    order = relationship("Order", back_populates="items")

    @property
    def line_total(self) -> float:
        return round(self.unit_price * self.quantity, 2)


class PickupDate(Base):
    """A Monday/Wednesday pickup slot customers can order against.

    Rows are auto-generated on a rolling basis (see pickup_service.py) so the
    Orders page always has upcoming dates without admin upkeep, but the admin
    panel can add extra dates, close/reopen one, or change its cap.
    """

    __tablename__ = "pickup_dates"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(20), nullable=False, unique=True, index=True)  # ISO date string
    max_breads = Column(Integer, nullable=False, default=20)
    is_open = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    subject = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="new")  # new -> replied
    created_at = Column(DateTime, default=datetime.utcnow)


class AdminUser(Base):
    """Single admin account (site owner). Signup is disabled once one exists."""

    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContentBlock(Base):
    """Editable site content, keyed by section name (+ language where relevant).

    `lang` is an empty string for language-independent content (e.g. site
    settings). `data` holds a JSON-encoded value whose shape matches what the
    frontend expects for that key (see app/seed_content.py for the schema of
    each key and the defaults used to seed this table on first run).
    """

    __tablename__ = "content_blocks"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(60), nullable=False, index=True)
    lang = Column(String(5), nullable=False, default="")
    data = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PageView(Base):
    """One row per page load — the raw log behind the admin SEO dashboard."""

    __tablename__ = "page_views"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String(255), nullable=False, index=True)
    referrer = Column(String(500), nullable=True)
    device_type = Column(String(20), nullable=False, default="desktop")  # desktop | mobile | tablet
    lang = Column(String(5), nullable=True)
    visitor_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
