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
# COUNTRY PAGE MODELS
# =========================================================


class CountryPageCreate(BaseModel):

    country: str

    slug: Optional[str] = None

    stream: Literal[
        "MBBS",
        "Management",
        "Other",
    ] = "MBBS"

    hero_image_url: Optional[str] = None

    headline: Optional[str] = None

    description: Optional[str] = None

    status: Literal[
        "draft",
        "published",
    ] = "draft"


class CountryPageUpdate(BaseModel):

    country: Optional[str] = None

    slug: Optional[str] = None

    stream: Optional[
        Literal[
            "MBBS",
            "Management",
            "Other",
        ]
    ] = None

    hero_image_url: Optional[str] = None

    headline: Optional[str] = None

    description: Optional[str] = None

    status: Optional[
        Literal[
            "draft",
            "published",
        ]
    ] = None


class CountryPage(BaseModel):

    id: str

    country: str

    slug: str

    stream: str

    hero_image_url: Optional[str] = None

    headline: Optional[str] = None

    description: Optional[str] = None

    status: str

    created_at: datetime

    updated_at: datetime

    published_at: Optional[datetime] = None


# =========================================================
# HELPERS
# =========================================================


def make_country_slug(text: str) -> str:

    text = str(
        text or ""
    ).strip().lower()

    text = re.sub(
        r"[^a-z0-9]+",
        "-",
        text
    )

    return text.strip("-")


def clean_text(value):

    if value is None:
        return None

    value = str(
        value
    ).strip()

    return value or None


# =========================================================
# ROUTER FACTORY
# =========================================================


def create_country_pages_router(
    db,
    require_admin,
):

    router = APIRouter(
        prefix="/api"
    )


    # =====================================================
    # PUBLIC COUNTRY PAGE
    # =====================================================

    @router.get(
        "/country-pages/{slug}",
        response_model=CountryPage,
    )
    async def get_public_country_page(
        slug: str,
    ):

        clean_slug = make_country_slug(
            slug
        )

        doc = await db.country_pages.find_one(
            {
                "slug": clean_slug,
                "status": "published",
            },
            {
                "_id": 0,
            },
        )

        if not doc:

            raise HTTPException(
                status_code=404,
                detail="Country page not found",
            )

        return CountryPage(
            **doc
        )


    # =====================================================
    # ADMIN — LIST COUNTRY PAGES
    # =====================================================

    @router.get(
        "/admin/country-pages",
        response_model=List[CountryPage],
    )
    async def admin_get_country_pages(
        user=Depends(
            require_admin
        ),
    ):

        docs = (
            await db.country_pages
            .find(
                {},
                {
                    "_id": 0,
                },
            )
            .sort(
                "country",
                1,
            )
            .to_list(
                500
            )
        )

        return [
            CountryPage(
                **doc
            )
            for doc in docs
        ]


    # =====================================================
    # ADMIN — CREATE COUNTRY PAGE
    # =====================================================

    @router.post(
        "/admin/country-pages",
        response_model=CountryPage,
    )
    async def admin_create_country_page(
        payload: CountryPageCreate,
        user=Depends(
            require_admin
        ),
    ):

        country = (
            payload.country
            or ""
        ).strip()


        if not country:

            raise HTTPException(
                status_code=400,
                detail="Country is required",
            )


        slug = make_country_slug(
            payload.slug
            or country
        )


        if not slug:

            raise HTTPException(
                status_code=400,
                detail="Invalid country slug",
            )


        existing = (
            await db.country_pages.find_one(
                {
                    "slug": slug,
                }
            )
        )


        if existing:

            raise HTTPException(
                status_code=409,
                detail=(
                    "A country page with this "
                    "slug already exists"
                ),
            )


        now = datetime.now(
            timezone.utc
        )


        page_id = str(
            uuid.uuid4()
        )


        published_at = (
            now
            if payload.status == "published"
            else None
        )


        doc = {

            "id":
                page_id,

            "country":
                country,

            "slug":
                slug,

            "stream":
                payload.stream,

            "hero_image_url":
                clean_text(
                    payload.hero_image_url
                ),

            "headline":
                clean_text(
                    payload.headline
                ),

            "description":
                clean_text(
                    payload.description
                ),

            "status":
                payload.status,

            "created_at":
                now,

            "updated_at":
                now,

            "published_at":
                published_at,
        }


        await db.country_pages.insert_one(
            doc
        )


        doc.pop(
            "_id",
            None
        )


        return CountryPage(
            **doc
        )


    # =====================================================
    # ADMIN — UPDATE COUNTRY PAGE
    # =====================================================

    @router.put(
        "/admin/country-pages/{page_id}",
        response_model=CountryPage,
    )
    async def admin_update_country_page(
        page_id: str,
        payload: CountryPageUpdate,
        user=Depends(
            require_admin
        ),
    ):

        existing = (
            await db.country_pages.find_one(
                {
                    "id": page_id,
                },
                {
                    "_id": 0,
                },
            )
        )


        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Country page not found",
            )


        updates = payload.model_dump(
            exclude_unset=True
        )


        # ---------------------------------------------
        # COUNTRY
        # ---------------------------------------------

        if "country" in updates:

            country = str(
                updates.get(
                    "country"
                )
                or ""
            ).strip()


            if not country:

                raise HTTPException(
                    status_code=400,
                    detail="Country is required",
                )


            updates[
                "country"
            ] = country


        # ---------------------------------------------
        # SLUG
        # ---------------------------------------------

        if "slug" in updates:

            new_slug = (
                make_country_slug(
                    updates.get(
                        "slug"
                    )
                    or updates.get(
                        "country"
                    )
                    or existing.get(
                        "country"
                    )
                )
            )


            if not new_slug:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid country slug",
                )


            duplicate = (
                await db.country_pages.find_one(
                    {
                        "slug":
                            new_slug,

                        "id":
                            {
                                "$ne":
                                    page_id
                            },
                    }
                )
            )


            if duplicate:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "A country page with this "
                        "slug already exists"
                    ),
                )


            updates[
                "slug"
            ] = new_slug


        # ---------------------------------------------
        # AUTO SLUG WHEN COUNTRY CHANGES
        # ---------------------------------------------

        elif "country" in updates:

            new_slug = (
                make_country_slug(
                    updates[
                        "country"
                    ]
                )
            )


            duplicate = (
                await db.country_pages.find_one(
                    {
                        "slug":
                            new_slug,

                        "id":
                            {
                                "$ne":
                                    page_id
                            },
                    }
                )
            )


            if duplicate:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "A country page with this "
                        "slug already exists"
                    ),
                )


            updates[
                "slug"
            ] = new_slug


        # ---------------------------------------------
        # CLEAN OPTIONAL TEXT
        # ---------------------------------------------

        for field in [
            "hero_image_url",
            "headline",
            "description",
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


        await db.country_pages.update_one(
            {
                "id":
                    page_id,
            },
            {
                "$set":
                    updates,
            },
        )


        updated = (
            await db.country_pages.find_one(
                {
                    "id":
                        page_id,
                },
                {
                    "_id":
                        0,
                },
            )
        )


        return CountryPage(
            **updated
        )


    # =====================================================
    # ADMIN — DELETE COUNTRY PAGE
    # =====================================================

    @router.delete(
        "/admin/country-pages/{page_id}"
    )
    async def admin_delete_country_page(
        page_id: str,
        user=Depends(
            require_admin
        ),
    ):

        result = (
            await db.country_pages.delete_one(
                {
                    "id":
                        page_id,
                }
            )
        )


        if (
            result.deleted_count
            == 0
        ):

            raise HTTPException(
                status_code=404,
                detail="Country page not found",
            )


        return {
            "ok": True,
        }


    return router
