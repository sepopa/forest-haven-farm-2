"""Admin media uploads: product photos and short video clips.

Saved to Cloudinary (a free media-hosting service) when CLOUDINARY_CLOUD_NAME,
CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are all set, so files survive
restarts and redeploys on hosts with an ephemeral filesystem (e.g. Render's
free tier). If Cloudinary isn't configured (e.g. local dev with no account
set up yet), falls back to saving on local disk under UPLOAD_DIR exactly as
before — so nothing breaks for anyone still running this locally.
"""
import logging
import os
import uuid

import cloudinary
import cloudinary.api
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile

from .. import models
from ..auth import get_current_admin

logger = logging.getLogger("forest_haven.uploads")

router = APIRouter(prefix="/api/admin/uploads", tags=["uploads"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
CLOUDINARY_FOLDER = os.getenv("CLOUDINARY_FOLDER", "forest-haven-farm")
CLOUDINARY_ENABLED = bool(CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET)

if CLOUDINARY_ENABLED:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )
else:
    logger.warning(
        "Cloudinary not configured — admin uploads will be saved to local disk "
        "instead, and won't survive a restart on hosts with an ephemeral filesystem."
    )


def _resource_type_for(content_type: str) -> str:
    return "video" if content_type == "video/mp4" else "image"


@router.post("")
async def upload_file(
    request: Request,
    file: UploadFile,
    admin: models.AdminUser = Depends(get_current_admin),
):
    ext = ALLOWED_CONTENT_TYPES.get(file.content_type)
    if ext is None:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use JPEG, PNG, WebP, GIF, or MP4.")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File is too large (15 MB max).")

    # Same "<uuid><ext>" identifier either way, so the frontend (which sniffs
    # the extension to tell photos from video clips) doesn't need to change.
    stem = uuid.uuid4().hex
    filename = f"{stem}{ext}"

    if CLOUDINARY_ENABLED:
        result = cloudinary.uploader.upload(
            contents,
            public_id=stem,
            folder=CLOUDINARY_FOLDER,
            resource_type=_resource_type_for(file.content_type),
        )
        return {"url": result["secure_url"], "filename": filename}

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as out:
        out.write(contents)

    url = f"{str(request.base_url).rstrip('/')}/uploads/{filename}"
    return {"url": url, "filename": filename}


@router.get("")
def list_uploads(request: Request, admin: models.AdminUser = Depends(get_current_admin)):
    """Media library listing — every file previously uploaded, newest first."""
    if CLOUDINARY_ENABLED:
        entries = []
        for resource_type in ("image", "video"):
            result = cloudinary.api.resources(
                type="upload",
                resource_type=resource_type,
                prefix=f"{CLOUDINARY_FOLDER}/",
                max_results=200,
            )
            for res in result.get("resources", []):
                stem = res["public_id"].rsplit("/", 1)[-1]
                entries.append(
                    {
                        "filename": f"{stem}.{res['format']}",
                        "url": res["secure_url"],
                        "size": res.get("bytes", 0),
                        "modified_at": res.get("created_at", ""),
                    }
                )
        entries.sort(key=lambda e: e["modified_at"], reverse=True)
        return entries

    if not os.path.isdir(UPLOAD_DIR):
        return []
    base = str(request.base_url).rstrip("/")
    entries = []
    for filename in os.listdir(UPLOAD_DIR):
        path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.isfile(path):
            continue
        stat = os.stat(path)
        entries.append(
            {
                "filename": filename,
                "url": f"{base}/uploads/{filename}",
                "size": stat.st_size,
                "modified_at": stat.st_mtime,
            }
        )
    entries.sort(key=lambda e: e["modified_at"], reverse=True)
    return entries


@router.delete("/{filename}")
def delete_upload(filename: str, admin: models.AdminUser = Depends(get_current_admin)):
    safe_name = os.path.basename(filename)

    if CLOUDINARY_ENABLED:
        stem, _, ext = safe_name.rpartition(".")
        public_id = f"{CLOUDINARY_FOLDER}/{stem or safe_name}"
        resource_type = _resource_type_for("video/mp4" if ext.lower() == "mp4" else "image/jpeg")
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        if result.get("result") != "ok":
            raise HTTPException(status_code=404, detail="File not found.")
        return {"ok": True}

    path = os.path.join(UPLOAD_DIR, safe_name)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File not found.")
    os.remove(path)
    return {"ok": True}
