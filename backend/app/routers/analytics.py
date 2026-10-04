from datetime import datetime, timedelta
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import get_current_admin
from ..database import get_db

router = APIRouter(tags=["analytics"])


def _referrer_domain(referrer: str | None) -> str | None:
    if not referrer:
        return None
    try:
        host = urlparse(referrer).netloc
        return host or None
    except ValueError:
        return None


@router.post("/api/analytics/pageview", status_code=201)
def record_pageview(payload: schemas.PageViewCreate, db: Session = Depends(get_db)):
    """Public — the frontend calls this once per route change (see Layout.jsx)."""
    db.add(
        models.PageView(
            path=payload.path,
            referrer=payload.referrer,
            device_type=payload.device_type,
            lang=payload.lang,
            visitor_id=payload.visitor_id,
        )
    )
    db.commit()
    return {"ok": True}


@router.get("/api/admin/analytics/summary")
def analytics_summary(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    admin: models.AdminUser = Depends(get_current_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    base = db.query(models.PageView).filter(models.PageView.created_at >= since)

    total_views = base.count()
    unique_visitors = base.with_entities(models.PageView.visitor_id).distinct().count()

    top_pages = (
        base.with_entities(models.PageView.path, func.count(models.PageView.id).label("views"))
        .group_by(models.PageView.path)
        .order_by(func.count(models.PageView.id).desc())
        .limit(10)
        .all()
    )

    device_rows = (
        base.with_entities(models.PageView.device_type, func.count(models.PageView.id).label("views"))
        .group_by(models.PageView.device_type)
        .all()
    )

    lang_rows = (
        base.with_entities(models.PageView.lang, func.count(models.PageView.id).label("views"))
        .group_by(models.PageView.lang)
        .all()
    )

    # func.date() works on both SQLite (returns 'YYYY-MM-DD' text) and Postgres
    # (returns a date). strftime() is SQLite-only and crashed on Postgres/Neon.
    day_expr = func.date(models.PageView.created_at)
    daily_rows = (
        base.with_entities(
            day_expr.label("day"),
            func.count(models.PageView.id).label("views"),
            func.count(func.distinct(models.PageView.visitor_id)).label("unique_visitors"),
        )
        .group_by(day_expr)
        .order_by(day_expr)
        .all()
    )

    referrer_rows = (
        base.filter(models.PageView.referrer.isnot(None))
        .with_entities(models.PageView.referrer)
        .all()
    )
    referrer_counts: dict[str, int] = {}
    direct_count = 0
    for (referrer,) in referrer_rows:
        domain = _referrer_domain(referrer)
        if domain:
            referrer_counts[domain] = referrer_counts.get(domain, 0) + 1
        else:
            direct_count += 1
    direct_count += total_views - len(referrer_rows)  # rows with no referrer at all = direct
    top_referrers = sorted(referrer_counts.items(), key=lambda kv: kv[1], reverse=True)[:10]

    return {
        "range_days": days,
        "total_views": total_views,
        "unique_visitors": unique_visitors,
        "top_pages": [{"path": path, "views": views} for path, views in top_pages],
        "device_breakdown": [{"device_type": d or "unknown", "views": v} for d, v in device_rows],
        "lang_breakdown": [{"lang": l or "unknown", "views": v} for l, v in lang_rows],
        "daily": [
            {"date": str(day), "views": views, "unique_visitors": uniques}
            for day, views, uniques in daily_rows
        ],
        "top_referrers": [{"domain": domain, "views": views} for domain, views in top_referrers],
        "direct_views": direct_count,
    }
