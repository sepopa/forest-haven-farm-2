"""Forest Haven Farm — FastAPI backend entry point.

Run locally with:
    uvicorn main:app --reload

Interactive API docs are then available at http://localhost:8000/docs
"""
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import content_service, migrate, models, pickup_service
from app.database import Base, SessionLocal, engine
from app.routers import analytics, auth, contact, content, orders, pickup_dates, uploads

load_dotenv()

# Creates tables on first run if they don't exist yet. For anything beyond
# this prototype, switch to a migration tool (e.g. Alembic) instead.
Base.metadata.create_all(bind=engine)
migrate.run_migrations(engine)

# Seeds default site copy (menu, FAQ, history, etc.) into content_blocks the
# first time the app runs, so the admin panel has something to edit and the
# public site has real content on a fresh install.
_seed_db = SessionLocal()
try:
    content_service.seed_defaults(_seed_db)
    pickup_service.ensure_rolling_dates(_seed_db)
finally:
    _seed_db.close()

app = FastAPI(
    title="Forest Haven Farm API",
    description="Backend for order requests, contact messages, site content, and the admin panel.",
    version="0.2.0",
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(orders.router)
app.include_router(pickup_dates.router)
app.include_router(contact.router)
app.include_router(auth.router)
app.include_router(content.router)
app.include_router(uploads.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"service": "Forest Haven Farm API", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
