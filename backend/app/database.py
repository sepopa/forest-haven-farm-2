"""Database engine/session setup.

Uses SQLite by default so the project runs with zero external services.
Swap DATABASE_URL (in .env) for a Postgres/MySQL URL later — nothing else
in the app needs to change since we go through SQLAlchemy's ORM.
"""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./forest_haven.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
# pool_pre_ping: tests each pooled connection with a lightweight query before
# reusing it, and transparently reconnects if it was dropped. Needed for
# managed Postgres providers (e.g. Neon) that suspend/close idle connections
# after inactivity — without this, the first request after a quiet period
# fails with "SSL connection has been closed unexpectedly" instead of just
# silently reconnecting.
# pool_recycle: also proactively recycles connections older than 5 minutes,
# as a second safety net against the same kind of silent server-side close.
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True, pool_recycle=300)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
