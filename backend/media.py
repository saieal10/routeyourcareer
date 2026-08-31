from datetime import datetime, timezone
from typing import List, Optional, Literal
import uuid
import re

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)

from pydantic import BaseModel


# =========================================================
# MODELS
# =========================================================

class MediaCreate(BaseModel):

    title: str

    youtube_url: str

    type: Literal[
        "youtube",
        "testimonial",
    ]

    description: Optional[str] = None

    student_name: Optional[str] = None

    university: Optional[str] = None

    country: Optional[str] = None

    sort_order: int = 0

    status: Literal[
        "draft",
        "published",
    ] = "draft"


class MediaUpdate(BaseModel):

    title: Optional[str] = None

    youtube_url: Optional[str] = None

    type: Optional[
        Literal[
            "youtube",
            "testimonial",
        ]
    ] = None

    description: Optional[str] = None

    student_name: Optional[str] = None

    university: Optional[str] = None

    country: Optional[str] = None

    sort_order: Optional[int] = None

    status: Optional[
        Literal[
            "draft",
            "published",
        ]
    ] = None


class MediaItem(BaseModel):

    id: str

    title: str

    youtube_url: str

    youtube_id: str

    thumbnail_url: str

    type: str

    description: Optional[str] = None

    student_name: Optional[str] = None

    university: Optional[str] = None

    country: Optional[str] = None

    sort_order: int = 0

    status: str

    created_at: datetime

    updated_at: datetime

    published_at: Optional[datetime] = None


# =========================================================
# HELPERS
# =========================================================

def clean_text(value):

    if value is None:
        return None

    value = str(value).strip()

    return value or None


def extract_youtube_id(url: str):

    url = str(url or "").strip()

    if not url:
        return None


    patterns = [

        r"(?:youtube\.com/watch\?v=)([^&?/]+)",

        r"(?:youtu\.be/)([^&?/]+)",

        r"(?:youtube\.com/shorts/)([^&?/]+)",

        r"(?:youtube\.com/embed/)([^&?/]+)",

    ]


    for pattern in patterns:

        match = re.search(
            pattern,
            url,
            re.IGNORECASE,
        )

        if match:

            return match.group(1)


    # Allow raw YouTube ID too

    if re.fullmatch(
        r"[A-Za-z0-9_-]{6,20}",
        url,
    ):

        return url


    return None


def make_thumbnail(
    youtube_id: str,
):

    return (
        "https://img.youtube.com/vi/"
        f"{youtube_id}/hqdefault.jpg"
    )


# =========================================================
# ROUTER FACTORY
# =========================================================

def create_media_router(
    db,
    require_admin,
):

    router = APIRouter(
        prefix="/api"
    )


    # =====================================================
    # PUBLIC — GET ALL PUBLISHED MEDIA
    # =====================================================

    @router.get(
        "/media",
        response_model=List[MediaItem],
    )
    async def get_public_media(
        type: Optional[str] = None,
    ):

        query = {
            "status": "published"
        }


        if type in [
            "youtube",
            "testimonial",
        ]:

            query["type"] = type


        docs = (
            await db.media
            .find(
                query,
                {
                    "_id": 0,
                },
            )
            .sort(
                [
                    ("sort_order", 1),
                    ("created_at", -1),
                ]
            )
            .to_list(
                500
            )
        )


        return [
            MediaItem(
                **doc
            )
            for doc in docs
        ]


    # =====================================================
    # ADMIN — LIST EVERYTHING
    # =====================================================

    @router.get(
        "/admin/media",
        response_model=List[MediaItem],
    )
    async def admin_get_media(
        user=Depends(
            require_admin
        ),
    ):

        docs = (
            await db.media
            .find(
                {},
                {
                    "_id": 0,
                },
            )
            .sort(
                [
                    ("sort_order", 1),
                    ("created_at", -1),
                ]
            )
            .to_list(
                1000
            )
        )


        return [
            MediaItem(
                **doc
            )
            for doc in docs
        ]


    # =====================================================
    # ADMIN — CREATE
    # =====================================================

    @router.post(
        "/admin/media",
        response_model=MediaItem,
    )
    async def admin_create_media(
        payload: MediaCreate,
        user=Depends(
            require_admin
        ),
    ):

        title = (
            payload.title
            or ""
        ).strip()


        if not title:

            raise HTTPException(
                status_code=400,
                detail="Title is required",
            )


        youtube_id = (
            extract_youtube_id(
                payload.youtube_url
            )
        )


        if not youtube_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Please enter a valid "
                    "YouTube video URL"
                ),
            )


        now = datetime.now(
            timezone.utc
        )


        published_at = (

            now

            if payload.status ==
            "published"

            else None

        )


        doc = {

            "id":
                str(
                    uuid.uuid4()
                ),

            "title":
                title,

            "youtube_url":
                payload.youtube_url.strip(),

            "youtube_id":
                youtube_id,

            "thumbnail_url":
                make_thumbnail(
                    youtube_id
                ),

            "type":
                payload.type,

            "description":
                clean_text(
                    payload.description
                ),

            "student_name":
                clean_text(
                    payload.student_name
                ),

            "university":
                clean_text(
                    payload.university
                ),

            "country":
                clean_text(
                    payload.country
                ),

            "sort_order":
                payload.sort_order,

            "status":
                payload.status,

            "created_at":
                now,

            "updated_at":
                now,

            "published_at":
                published_at,

        }


        await db.media.insert_one(
            doc
        )


        doc.pop(
            "_id",
            None
        )


        return MediaItem(
            **doc
        )


    # =====================================================
    # ADMIN — UPDATE
    # =====================================================

    @router.put(
        "/admin/media/{media_id}",
        response_model=MediaItem,
    )
    async def admin_update_media(
        media_id: str,
        payload: MediaUpdate,
        user=Depends(
            require_admin
        ),
    ):

        existing = (
            await db.media.find_one(
                {
                    "id":
                        media_id
                },
                {
                    "_id":
                        0
                },
            )
        )


        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Media item not found",
            )


        updates = (
            payload.model_dump(
                exclude_unset=True
            )
        )


        # ---------------------------------------------
        # TITLE
        # ---------------------------------------------

        if "title" in updates:

            title = str(
                updates.get(
                    "title"
                )
                or ""
            ).strip()


            if not title:

                raise HTTPException(
                    status_code=400,
                    detail="Title is required",
                )


            updates[
                "title"
            ] = title


        # ---------------------------------------------
        # YOUTUBE URL
        # ---------------------------------------------

        if "youtube_url" in updates:

            youtube_url = str(
                updates.get(
                    "youtube_url"
                )
                or ""
            ).strip()


            youtube_id = (
                extract_youtube_id(
                    youtube_url
                )
            )


            if not youtube_id:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Please enter a valid "
                        "YouTube video URL"
                    ),
                )


            updates[
                "youtube_url"
            ] = youtube_url


            updates[
                "youtube_id"
            ] = youtube_id


            updates[
                "thumbnail_url"
            ] = make_thumbnail(
                youtube_id
            )


        # ---------------------------------------------
        # CLEAN OPTIONAL TEXT
        # ---------------------------------------------

        for field in [

            "description",

            "student_name",

            "university",

            "country",

        ]:

            if field in updates:

                updates[
                    field
                ] = clean_text(
                    updates[
                        field
                    ]
                )


        # ---------------------------------------------
        # PUBLISHING
        # ---------------------------------------------

        old_status = (
            existing.get(
                "status"
            )
        )


        new_status = (
            updates.get(
                "status",
                old_status
            )
        )


        if (
            new_status == "published"
            and old_status != "published"
        ):

            updates[
                "published_at"
            ] = datetime.now(
                timezone.utc
            )


        if new_status == "draft":

            updates[
                "published_at"
            ] = None


        updates[
            "updated_at"
        ] = datetime.now(
            timezone.utc
        )


        await db.media.update_one(

            {
                "id":
                    media_id
            },

            {
                "$set":
                    updates
            },

        )


        updated = (
            await db.media.find_one(
                {
                    "id":
                        media_id
                },
                {
                    "_id":
                        0
                },
            )
        )


        return MediaItem(
            **updated
        )


    # =====================================================
    # ADMIN — DELETE
    # =====================================================

    @router.delete(
        "/admin/media/{media_id}"
    )
    async def admin_delete_media(
        media_id: str,
        user=Depends(
            require_admin
        ),
    ):

        result = (
            await db.media.delete_one(
                {
                    "id":
                        media_id
                }
            )
        )


        if (
            result.deleted_count
            == 0
        ):

            raise HTTPException(
                status_code=404,
                detail="Media item not found",
            )


        return {
            "ok": True
        }


    return router
