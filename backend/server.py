from fastapi import (
    FastAPI,
    APIRouter,
    HTTPException,
    Depends,
    Request,
    BackgroundTasks,
)
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

import os
import logging
import uuid
import httpx
import re

from pathlib import Path
from urllib.parse import urlencode
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal


from notifier import notify_new_lead


# =========================================================
# CONFIGURATION
# =========================================================

ROOT_DIR = Path(__file__).parent

load_dotenv(
    ROOT_DIR / ".env"
)


# -------------------- MongoDB --------------------

mongo_url = os.environ["MONGO_URL"]

client = AsyncIOMotorClient(
    mongo_url
)

db = client[
    os.environ["DB_NAME"]
]


# -------------------- Admin Emails --------------------

ADMIN_EMAILS = [
    email.strip().lower()
    for email in os.environ.get(
        "ADMIN_EMAILS",
        "inforouteyourcareer@gmail.com",
    ).split(",")
    if email.strip()
]


# -------------------- Google OAuth --------------------

GOOGLE_CLIENT_ID = os.environ.get(
    "GOOGLE_CLIENT_ID"
)

GOOGLE_CLIENT_SECRET = os.environ.get(
    "GOOGLE_CLIENT_SECRET"
)

GOOGLE_REDIRECT_URI = (
    "https://routeyourcareer.onrender.com"
    "/api/auth/google/callback"
)

GOOGLE_AUTH_URL = (
    "https://accounts.google.com/o/oauth2/v2/auth"
)

GOOGLE_TOKEN_URL = (
    "https://oauth2.googleapis.com/token"
)

GOOGLE_USERINFO_URL = (
    "https://openidconnect.googleapis.com/v1/userinfo"
)


# -------------------- Frontend --------------------

FRONTEND_URL = (
    "https://routeyourcareer.netlify.app"
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Route Your Career API"
)

api_router = APIRouter(
    prefix="/api"
)


# =========================================================
# MODELS
# =========================================================


class LeadCreate(BaseModel):
    name: str
    phone: str

    email: Optional[str] = None
    country: Optional[str] = None
    neet_score: Optional[str] = None
    message: Optional[str] = None

    source: Optional[str] = Field(
        default="website"
    )

    type: Optional[
        Literal[
            "apply",
            "callback",
            "quick",
            "newsletter",
            "chat_lead",
        ]
    ] = "quick"


class Lead(LeadCreate):
    id: str = Field(
        default_factory=lambda: str(
            uuid.uuid4()
        )
    )

    created_at: datetime = Field(
        default_factory=lambda:
        datetime.now(timezone.utc)
    )


class NewsletterCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = "footer"


class Newsletter(NewsletterCreate):
    id: str = Field(
        default_factory=lambda: str(
            uuid.uuid4()
        )
    )

    created_at: datetime = Field(
        default_factory=lambda:
        datetime.now(timezone.utc)
    )


class ChatIn(BaseModel):
    session_id: str
    message: str


class ChatOut(BaseModel):
    session_id: str
    reply: str


class LeadListItem(BaseModel):
    id: str
    name: str
    phone: str

    email: Optional[str] = None
    country: Optional[str] = None
    neet_score: Optional[str] = None
    message: Optional[str] = None
    source: Optional[str] = None
    type: Optional[str] = None

    created_at: datetime


class User(BaseModel):
    user_id: str
    email: str
    name: str

    picture: Optional[str] = None
    is_admin: bool = False


class ChatLeadIn(BaseModel):
    session_id: str
    name: str
    phone: str

    country: Optional[str] = None
    neet_score: Optional[str] = None


# =========================================================
# BLOG MODELS
# =========================================================


class BlogBodyBlock(BaseModel):
    type: Literal[
        "heading",
        "paragraph",
        "list",
        "image",
    ]

    text: Optional[str] = None

    items: Optional[
        List[str]
    ] = None

    image_url: Optional[str] = None

    image_alt: Optional[str] = None


class BlogCreate(BaseModel):

    title: str

    slug: Optional[str] = None

    category: str

    author: str = "RYC Editorial"

    read_time: int = 5

    hero_image: Optional[str] = None

    excerpt: str

    body: List[
        BlogBodyBlock
    ] = []

    cta: Optional[str] = "mbbs"

    seo_title: Optional[str] = None

    meta_description: Optional[str] = None

    keywords: List[str] = []

    status: Literal[
        "draft",
        "published",
    ] = "draft"


class BlogUpdate(BaseModel):

    title: Optional[str] = None

    slug: Optional[str] = None

    category: Optional[str] = None

    author: Optional[str] = None

    read_time: Optional[int] = None

    hero_image: Optional[str] = None

    excerpt: Optional[str] = None

    body: Optional[
        List[BlogBodyBlock]
    ] = None

    cta: Optional[str] = None

    seo_title: Optional[str] = None

    meta_description: Optional[str] = None

    keywords: Optional[
        List[str]
    ] = None

    status: Optional[
        Literal[
            "draft",
            "published",
        ]
    ] = None


class Blog(BaseModel):

    id: str

    title: str

    slug: str

    category: str

    author: str

    read_time: int

    hero_image: Optional[str] = None

    excerpt: str

    body: List[
        BlogBodyBlock
    ]

    cta: Optional[str] = None

    seo_title: Optional[str] = None

    meta_description: Optional[str] = None

    keywords: List[str] = []

    status: str

    created_at: datetime

    updated_at: datetime

    published_at: Optional[
        datetime
    ] = None


# =========================================================
# HELPERS
# =========================================================


def _clean_mongo(doc):

    if not doc:
        return doc

    doc.pop(
        "_id",
        None
    )

    return doc


def make_slug(
    text: str
) -> str:

    text = (
        text.strip()
        .lower()
    )

    text = re.sub(
        r"[^a-z0-9]+",
        "-",
        text
    )

    text = text.strip(
        "-"
    )

    return text


# =========================================================
# AUTHENTICATION HELPERS
# =========================================================


async def get_current_user(
    request: Request
) -> User:

    token = request.cookies.get(
        "session_token"
    )

    if not token:

        auth = (
            request.headers.get(
                "authorization"
            )
            or ""
        )

        if auth.lower().startswith(
            "bearer "
        ):

            token = auth.split(
                " ",
                1
            )[1].strip()

    if not token:

        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    sess = await db.user_sessions.find_one(
        {
            "session_token":
            token
        },
        {
            "_id": 0
        },
    )

    if not sess:

        raise HTTPException(
            status_code=401,
            detail="Invalid session",
        )

    expires_at = sess.get(
        "expires_at"
    )

    if isinstance(
        expires_at,
        str
    ):

        expires_at = (
            datetime.fromisoformat(
                expires_at
            )
        )

    if (
        expires_at
        and expires_at.tzinfo is None
    ):

        expires_at = (
            expires_at.replace(
                tzinfo=timezone.utc
            )
        )

    if (
        expires_at
        and expires_at
        < datetime.now(timezone.utc)
    ):

        await db.user_sessions.delete_one(
            {
                "session_token":
                token
            }
        )

        raise HTTPException(
            status_code=401,
            detail="Session expired",
        )

    user_doc = (
        await db.users.find_one(
            {
                "user_id":
                sess["user_id"]
            },
            {
                "_id": 0
            },
        )
    )

    if not user_doc:

        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    user_doc[
        "is_admin"
    ] = (
        user_doc.get(
            "email",
            ""
        ).lower()
        in ADMIN_EMAILS
    )

    return User(
        **user_doc
    )


async def require_admin(
    user: User = Depends(
        get_current_user
    )
) -> User:

    if not user.is_admin:

        raise HTTPException(
            status_code=403,
            detail="Not authorised",
        )

    return user


# =========================================================
# ROOT
# =========================================================


@api_router.get("/")
async def root():

    return {
        "message":
        "Route Your Career API is live",

        "version":
        "3.0",

        "google_auth":
        True,

        "blog_system":
        True,
    }


# =========================================================
# LEADS
# =========================================================


@api_router.post(
    "/leads",
    response_model=Lead
)
async def create_lead(
    payload: LeadCreate,
    background: BackgroundTasks,
):

    lead = Lead(
        **payload.model_dump()
    )

    doc = lead.model_dump()

    await db.leads.insert_one(
        doc
    )

    background.add_task(
        notify_new_lead,
        {
            **doc,
            "created_at":
            doc[
                "created_at"
            ].isoformat(),
        },
    )

    return lead


# =========================================================
# NEWSLETTER
# =========================================================


@api_router.post(
    "/newsletter",
    response_model=Newsletter
)
async def newsletter_signup(
    payload: NewsletterCreate,
    background: BackgroundTasks,
):

    existing = (
        await db.newsletter.find_one(
            {
                "email":
                payload.email
            }
        )
    )

    if existing:

        return Newsletter(
            **_clean_mongo(
                existing
            )
        )

    sub = Newsletter(
        **payload.model_dump()
    )

    await db.newsletter.insert_one(
        sub.model_dump()
    )

    lead = Lead(
        name="Newsletter subscriber",
        phone="-",
        email=payload.email,
        source=(
            payload.source
            or "footer"
        ),
        type="newsletter",
    )

    lead_doc = (
        lead.model_dump()
    )

    await db.leads.insert_one(
        lead_doc
    )

    background.add_task(
        notify_new_lead,
        {
            **lead_doc,
            "created_at":
            lead_doc[
                "created_at"
            ].isoformat(),
        },
    )

    return sub


# =========================================================
# AI CHAT
# =========================================================


@api_router.post(
    "/chat",
    response_model=ChatOut
)
async def chat(
    payload: ChatIn
):

    raise HTTPException(
        status_code=503,
        detail=(
            "AI chat is temporarily "
            "unavailable"
        ),
    )


# =========================================================
# CHAT LEAD
# =========================================================


@api_router.post(
    "/chat/lead",
    response_model=Lead
)
async def chat_capture_lead(
    payload: ChatLeadIn,
    background: BackgroundTasks,
):

    lead = Lead(
        name=payload.name,

        phone=payload.phone,

        country=payload.country,

        neet_score=payload.neet_score,

        source=(
            f"chat:"
            f"{payload.session_id}"
        ),

        type="chat_lead",
    )

    doc = (
        lead.model_dump()
    )

    await db.leads.insert_one(
        doc
    )

    await db.chat_sessions.update_one(

        {
            "session_id":
            payload.session_id
        },

        {
            "$set": {

                "session_id":
                payload.session_id,

                "lead_id":
                lead.id,

                "qualified_at":
                datetime.now(
                    timezone.utc
                ),
            }
        },

        upsert=True,
    )

    background.add_task(
        notify_new_lead,
        {
            **doc,
            "created_at":
            doc[
                "created_at"
            ].isoformat(),
        },
    )

    return lead


# =========================================================
# PUBLIC BLOG ROUTES
# =========================================================


@api_router.get(
    "/blogs",
    response_model=List[Blog]
)
async def public_blogs():

    docs = (
        await db.blogs
        .find(
            {
                "status":
                "published"
            },
            {
                "_id": 0
            }
        )
        .sort(
            "published_at",
            -1
        )
        .to_list(
            500
        )
    )

    return [
        Blog(
            **doc
        )
        for doc in docs
    ]


@api_router.get(
    "/blogs/{slug}",
    response_model=Blog
)
async def public_blog(
    slug: str
):

    doc = (
        await db.blogs.find_one(
            {
                "slug":
                slug,

                "status":
                "published",
            },
            {
                "_id": 0
            },
        )
    )

    if not doc:

        raise HTTPException(
            status_code=404,
            detail="Blog not found",
        )

    return Blog(
        **doc
    )


# =========================================================
# GOOGLE LOGIN
# =========================================================


@api_router.get(
    "/auth/google"
)
async def google_login():

    if not GOOGLE_CLIENT_ID:

        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_CLIENT_ID "
                "is not configured"
            ),
        )

    if not GOOGLE_CLIENT_SECRET:

        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_CLIENT_SECRET "
                "is not configured"
            ),
        )

    params = {

        "client_id":
        GOOGLE_CLIENT_ID,

        "redirect_uri":
        GOOGLE_REDIRECT_URI,

        "response_type":
        "code",

        "scope":
        "openid email profile",

        "access_type":
        "online",

        "prompt":
        "select_account",
    }

    google_url = (
        GOOGLE_AUTH_URL
        + "?"
        + urlencode(params)
    )

    return RedirectResponse(
        url=google_url,
        status_code=302,
    )


# =========================================================
# GOOGLE CALLBACK
# =========================================================


@api_router.get(
    "/auth/google/callback"
)
async def google_callback(
    code: Optional[str] = None,
    error: Optional[str] = None,
):

    if error:

        return RedirectResponse(
            url=(
                FRONTEND_URL
                + "/admin/login"
                + "?e=Google%20sign-in%20cancelled"
            ),
            status_code=302,
        )

    if not code:

        return RedirectResponse(
            url=(
                FRONTEND_URL
                + "/admin/login"
                + "?e=Missing%20Google%20code"
            ),
            status_code=302,
        )

    try:

        async with httpx.AsyncClient(
            timeout=20
        ) as http_client:

            token_response = (
                await http_client.post(

                    GOOGLE_TOKEN_URL,

                    data={

                        "code":
                        code,

                        "client_id":
                        GOOGLE_CLIENT_ID,

                        "client_secret":
                        GOOGLE_CLIENT_SECRET,

                        "redirect_uri":
                        GOOGLE_REDIRECT_URI,

                        "grant_type":
                        "authorization_code",
                    },
                )
            )

            if (
                token_response.status_code
                >= 300
            ):

                logging.error(
                    "Google token error: %s",
                    token_response.text,
                )

                return RedirectResponse(
                    url=(
                        FRONTEND_URL
                        + "/admin/login"
                        + "?e=Google%20token%20failed"
                    ),
                    status_code=302,
                )

            token_data = (
                token_response.json()
            )

            access_token = (
                token_data.get(
                    "access_token"
                )
            )

            if not access_token:

                return RedirectResponse(
                    url=(
                        FRONTEND_URL
                        + "/admin/login"
                        + "?e=No%20Google%20access%20token"
                    ),
                    status_code=302,
                )

            user_response = (
                await http_client.get(

                    GOOGLE_USERINFO_URL,

                    headers={
                        "Authorization":
                        f"Bearer {access_token}"
                    },
                )
            )

            if (
                user_response.status_code
                >= 300
            ):

                return RedirectResponse(
                    url=(
                        FRONTEND_URL
                        + "/admin/login"
                        + "?e=Could%20not%20read%20Google%20account"
                    ),
                    status_code=302,
                )

            data = (
                user_response.json()
            )

    except Exception:

        logging.exception(
            "Google OAuth error"
        )

        return RedirectResponse(
            url=(
                FRONTEND_URL
                + "/admin/login"
                + "?e=Google%20authentication%20failed"
            ),
            status_code=302,
        )


    email = (
        data.get(
            "email"
        )
        or ""
    ).strip().lower()


    email_verified = (
        data.get(
            "email_verified"
        )
    )


    if not email:

        return RedirectResponse(
            url=(
                FRONTEND_URL
                + "/admin/login"
                + "?e=Google%20email%20missing"
            ),
            status_code=302,
        )


    if email_verified is False:

        return RedirectResponse(
            url=(
                FRONTEND_URL
                + "/admin/login"
                + "?e=Google%20email%20not%20verified"
            ),
            status_code=302,
        )


    if email not in ADMIN_EMAILS:

        return RedirectResponse(
            url=(
                FRONTEND_URL
                + "/admin/login"
                + "?e=Account%20not%20authorised"
            ),
            status_code=302,
        )


    user_doc = (
        await db.users.find_one(
            {
                "email":
                email
            },
            {
                "_id": 0
            },
        )
    )


    if user_doc:

        user_id = (
            user_doc[
                "user_id"
            ]
        )

        await db.users.update_one(

            {
                "user_id":
                user_id
            },

            {
                "$set": {

                    "name":
                    (
                        data.get(
                            "name"
                        )
                        or email
                    ),

                    "picture":
                    data.get(
                        "picture"
                    ),

                    "updated_at":
                    datetime.now(
                        timezone.utc
                    ),
                }
            },
        )

    else:

        user_id = (
            "user_"
            + uuid.uuid4().hex[:12]
        )

        await db.users.insert_one({

            "user_id":
            user_id,

            "email":
            email,

            "name":
            (
                data.get(
                    "name"
                )
                or email
            ),

            "picture":
            data.get(
                "picture"
            ),

            "created_at":
            datetime.now(
                timezone.utc
            ),
        })


    session_token = (
        uuid.uuid4().hex
    )

    expires = (
        datetime.now(
            timezone.utc
        )
        + timedelta(
            days=7
        )
    )


    await db.user_sessions.insert_one({

        "user_id":
        user_id,

        "session_token":
        session_token,

        "expires_at":
        expires,

        "created_at":
        datetime.now(
            timezone.utc
        ),
    })


    redirect = RedirectResponse(

        url=(
            FRONTEND_URL
            + "/admin"
        ),

        status_code=302,
    )


    redirect.set_cookie(

        key="session_token",

        value=session_token,

        httponly=True,

        secure=True,

        samesite="none",

        path="/",

        max_age=(
            7
            * 24
            * 60
            * 60
        ),
    )


    return redirect


# =========================================================
# AUTH ME
# =========================================================


@api_router.get(
    "/auth/me",
    response_model=User
)
async def auth_me(
    user: User = Depends(
        get_current_user
    )
):

    return user


# =========================================================
# LOGOUT
# =========================================================


@api_router.post(
    "/auth/logout"
)
async def auth_logout(
    request: Request,
):

    token = (
        request.cookies.get(
            "session_token"
        )
    )

    if token:

        await db.user_sessions.delete_one(
            {
                "session_token":
                token
            }
        )

    redirect = RedirectResponse(
        url=(
            FRONTEND_URL
            + "/admin/login"
        ),
        status_code=302,
    )

    redirect.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none",
    )

    return redirect


# =========================================================
# ADMIN LEADS
# =========================================================


@api_router.get(
    "/admin/leads",
    response_model=List[
        LeadListItem
    ]
)
async def admin_list_leads(

    limit: int = 500,

    type: Optional[
        str
    ] = None,

    user: User = Depends(
        require_admin
    ),
):

    query = {}

    if type:

        query[
            "type"
        ] = type


    docs = (

        await db.leads

        .find(
            query
        )

        .sort(
            "created_at",
            -1
        )

        .to_list(
            limit
        )
    )


    return [

        LeadListItem(
            **_clean_mongo(
                doc
            )
        )

        for doc in docs
    ]


# =========================================================
# ADMIN STATS
# =========================================================


@api_router.get(
    "/admin/stats"
)
async def admin_stats(

    user: User = Depends(
        require_admin
    )
):

    total = (
        await db.leads.count_documents(
            {}
        )
    )


    by_type = {}


    for lead_type in [

        "apply",

        "callback",

        "quick",

        "chat_lead",

        "newsletter",

    ]:

        by_type[
            lead_type
        ] = (

            await db.leads.count_documents(
                {
                    "type":
                    lead_type
                }
            )
        )


    subs = (

        await db.newsletter.count_documents(
            {}
        )
    )


    since = (

        datetime.now(
            timezone.utc
        )

        - timedelta(
            days=7
        )
    )


    last7 = (

        await db.leads.count_documents(

            {
                "created_at":
                {
                    "$gte":
                    since
                }
            }
        )
    )


    return {

        "total_leads":
        total,

        "by_type":
        by_type,

        "newsletter_subscribers":
        subs,

        "last_7_days":
        last7,
    }


# =========================================================
# ADMIN NEWSLETTER
# =========================================================


@api_router.get(
    "/admin/newsletter",
    response_model=List[
        Newsletter
    ]
)
async def admin_newsletter(

    limit: int = 500,

    user: User = Depends(
        require_admin
    ),
):

    docs = (

        await db.newsletter

        .find()

        .sort(
            "created_at",
            -1
        )

        .to_list(
            limit
        )
    )


    return [

        Newsletter(
            **_clean_mongo(
                doc
            )
        )

        for doc in docs
    ]


# =========================================================
# ADMIN BLOGS
# =========================================================


@api_router.get(
    "/admin/blogs",
    response_model=List[Blog]
)
async def admin_get_blogs(
    user: User = Depends(
        require_admin
    )
):

    docs = (
        await db.blogs
        .find(
            {},
            {
                "_id": 0
            }
        )
        .sort(
            "updated_at",
            -1
        )
        .to_list(
            500
        )
    )

    return [
        Blog(
            **doc
        )
        for doc in docs
    ]


@api_router.post(
    "/admin/blogs",
    response_model=Blog
)
async def admin_create_blog(
    payload: BlogCreate,
    user: User = Depends(
        require_admin
    ),
):

    now = (
        datetime.now(
            timezone.utc
        )
    )

    slug = (
        payload.slug
        or make_slug(
            payload.title
        )
    )

    slug = make_slug(
        slug
    )

    if not slug:

        raise HTTPException(
            status_code=400,
            detail="Invalid blog slug",
        )


    existing = (
        await db.blogs.find_one(
            {
                "slug":
                slug
            }
        )
    )

    if existing:

        raise HTTPException(
            status_code=409,
            detail=(
                "A blog with this "
                "slug already exists"
            ),
        )


    blog_id = str(
        uuid.uuid4()
    )


    published_at = None

    if (
        payload.status
        == "published"
    ):

        published_at = now


    doc = {

        "id":
        blog_id,

        "title":
        payload.title,

        "slug":
        slug,

        "category":
        payload.category,

        "author":
        payload.author,

        "read_time":
        payload.read_time,

        "hero_image":
        payload.hero_image,

        "excerpt":
        payload.excerpt,

        "body":
        [
            block.model_dump()
            for block
            in payload.body
        ],

        "cta":
        payload.cta,

        "seo_title":
        (
            payload.seo_title
            or payload.title
        ),

        "meta_description":
        (
            payload.meta_description
            or payload.excerpt
        ),

        "keywords":
        payload.keywords,

        "status":
        payload.status,

        "created_at":
        now,

        "updated_at":
        now,

        "published_at":
        published_at,
    }


    await db.blogs.insert_one(
        doc
    )


    return Blog(
        **_clean_mongo(
            doc
        )
    )


@api_router.put(
    "/admin/blogs/{blog_id}",
    response_model=Blog
)
async def admin_update_blog(
    blog_id: str,
    payload: BlogUpdate,
    user: User = Depends(
        require_admin
    ),
):

    existing = (
        await db.blogs.find_one(
            {
                "id":
                blog_id
            },
            {
                "_id": 0
            },
        )
    )

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="Blog not found",
        )


    updates = (
        payload.model_dump(
            exclude_none=True
        )
    )


    if "body" in updates:

        updates[
            "body"
        ] = [
            (
                item.model_dump()
                if hasattr(
                    item,
                    "model_dump"
                )
                else item
            )

            for item
            in updates[
                "body"
            ]
        ]


    if "slug" in updates:

        new_slug = make_slug(
            updates[
                "slug"
            ]
        )

        duplicate = (
            await db.blogs.find_one(
                {
                    "slug":
                    new_slug,

                    "id":
                    {
                        "$ne":
                        blog_id
                    },
                }
            )
        )

        if duplicate:

            raise HTTPException(
                status_code=409,
                detail=(
                    "A blog with this "
                    "slug already exists"
                ),
            )

        updates[
            "slug"
        ] = new_slug


    if (
        "title" in updates
        and "slug"
        not in updates
        and not existing.get(
            "slug"
        )
    ):

        updates[
            "slug"
        ] = make_slug(
            updates[
                "title"
            ]
        )


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
        new_status
        == "published"
        and old_status
        != "published"
    ):

        updates[
            "published_at"
        ] = (
            datetime.now(
                timezone.utc
            )
        )


    if (
        new_status
        == "draft"
    ):

        updates[
            "published_at"
        ] = None


    updates[
        "updated_at"
    ] = (
        datetime.now(
            timezone.utc
        )
    )


    await db.blogs.update_one(

        {
            "id":
            blog_id
        },

        {
            "$set":
            updates
        },
    )


    updated = (
        await db.blogs.find_one(
            {
                "id":
                blog_id
            },
            {
                "_id": 0
            },
        )
    )


    return Blog(
        **updated
    )


@api_router.delete(
    "/admin/blogs/{blog_id}"
)
async def admin_delete_blog(
    blog_id: str,
    user: User = Depends(
        require_admin
    ),
):

    result = (
        await db.blogs.delete_one(
            {
                "id":
                blog_id
            }
        )
    )

    if (
        result.deleted_count
        == 0
    ):

        raise HTTPException(
            status_code=404,
            detail="Blog not found",
        )

    return {
        "ok": True
    }


# =========================================================
# LEGACY PUBLIC STATS
# =========================================================


@api_router.get(
    "/leads/stats"
)
async def lead_stats_public():

    total = (

        await db.leads.count_documents(
            {}
        )
    )

    subscribers = (

        await db.newsletter.count_documents(
            {}
        )
    )

    return {

        "total_leads":
        total,

        "newsletter_subscribers":
        subscribers,
    }


# =========================================================
# ROUTER
# =========================================================


app.include_router(
    api_router
)


# =========================================================
# CORS
# =========================================================


app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "https://routeyourcareer.netlify.app"
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# =========================================================
# LOGGING
# =========================================================


logging.basicConfig(

    level=logging.INFO,

    format=(
        "%(asctime)s - "
        "%(name)s - "
        "%(levelname)s - "
        "%(message)s"
    ),
)

logger = logging.getLogger(
    __name__
)


# =========================================================
# SHUTDOWN
# =========================================================


@app.on_event(
    "shutdown"
)
async def shutdown_db_client():

    client.close()
