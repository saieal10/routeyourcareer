from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import httpx

from notifier import notify_new_lead

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_EMAILS = [
    e.strip().lower()
    for e in os.environ.get(
        'ADMIN_EMAILS',
        'inforouteyourcareer@gmail.com'
    ).split(',')
    if e.strip()
]

EMERGENT_AUTH_SESSION_URL = (
    'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data'
)

app = FastAPI(title="Route Your Career API")
api_router = APIRouter(prefix="/api")


# -------------------- Models --------------------

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    country: Optional[str] = None
    neet_score: Optional[str] = None
    message: Optional[str] = None
    source: Optional[str] = Field(default="website")
    type: Optional[
        Literal["apply", "callback", "quick", "newsletter", "chat_lead"]
    ] = "quick"


class Lead(LeadCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class NewsletterCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = "footer"


class Newsletter(NewsletterCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
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


# -------------------- Helpers --------------------

def _clean_mongo(doc):
    if not doc:
        return doc
    doc.pop('_id', None)
    return doc


# -------------------- Authentication --------------------

async def get_current_user(request: Request) -> User:
    token = request.cookies.get('session_token')

    if not token:
        auth = request.headers.get('authorization') or ''

        if auth.lower().startswith('bearer '):
            token = auth.split(' ', 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail='Not authenticated'
        )

    sess = await db.user_sessions.find_one(
        {'session_token': token},
        {'_id': 0}
    )

    if not sess:
        raise HTTPException(
            status_code=401,
            detail='Invalid session'
        )

    expires_at = sess.get('expires_at')

    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)

    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=401,
            detail='Session expired'
        )

    user_doc = await db.users.find_one(
        {'user_id': sess['user_id']},
        {'_id': 0}
    )

    if not user_doc:
        raise HTTPException(
            status_code=401,
            detail='User not found'
        )

    user_doc['is_admin'] = (
        user_doc.get('email', '').lower() in ADMIN_EMAILS
    )

    return User(**user_doc)


async def require_admin(
    user: User = Depends(get_current_user)
) -> User:

    if not user.is_admin:
        raise HTTPException(
            status_code=403,
            detail='Not authorised'
        )

    return user


# -------------------- Public routes --------------------

@api_router.get("/")
async def root():
    return {
        "message": "Route Your Career API is live",
        "version": "1.2"
    }


@api_router.post("/leads", response_model=Lead)
async def create_lead(
    payload: LeadCreate,
    background: BackgroundTasks
):
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()

    await db.leads.insert_one(doc)

    background.add_task(
        notify_new_lead,
        {
            **doc,
            'created_at': doc['created_at'].isoformat()
        }
    )

    return lead


@api_router.post("/newsletter", response_model=Newsletter)
async def newsletter_signup(
    payload: NewsletterCreate,
    background: BackgroundTasks
):
    existing = await db.newsletter.find_one({
        "email": payload.email
    })

    if existing:
        return Newsletter(**_clean_mongo(existing))

    sub = Newsletter(**payload.model_dump())

    await db.newsletter.insert_one(
        sub.model_dump()
    )

    lead = Lead(
        name="Newsletter subscriber",
        phone="-",
        email=payload.email,
        source=payload.source or "footer",
        type="newsletter",
    )

    lead_doc = lead.model_dump()

    await db.leads.insert_one(lead_doc)

    background.add_task(
        notify_new_lead,
        {
            **lead_doc,
            'created_at': lead_doc['created_at'].isoformat()
        }
    )

    return sub


# -------------------- AI Chat --------------------
# Emergent AI has been disabled.
# This keeps the rest of the backend independent and deployable.

@api_router.post("/chat", response_model=ChatOut)
async def chat(payload: ChatIn):
    raise HTTPException(
        status_code=503,
        detail="AI chat is temporarily unavailable"
    )


@api_router.post("/chat/lead", response_model=Lead)
async def chat_capture_lead(
    payload: ChatLeadIn,
    background: BackgroundTasks
):
    lead = Lead(
        name=payload.name,
        phone=payload.phone,
        country=payload.country,
        neet_score=payload.neet_score,
        source=f"chat:{payload.session_id}",
        type="chat_lead",
    )

    doc = lead.model_dump()

    await db.leads.insert_one(doc)

    await db.chat_sessions.update_one(
        {
            "session_id": payload.session_id
        },
        {
            "$set": {
                "session_id": payload.session_id,
                "lead_id": lead.id,
                "qualified_at": datetime.now(timezone.utc)
            }
        },
        upsert=True,
    )

    background.add_task(
        notify_new_lead,
        {
            **doc,
            'created_at': doc['created_at'].isoformat()
        }
    )

    return lead


# -------------------- Auth routes --------------------
# TEMPORARILY still uses Emergent Google auth.
# We will replace this after Render backend is live.

@api_router.post("/auth/session")
async def auth_exchange(
    request: Request,
    response: Response
):
    session_id = request.headers.get('X-Session-ID')

    if not session_id:
        raise HTTPException(
            status_code=400,
            detail='Missing X-Session-ID header'
        )

    try:
        async with httpx.AsyncClient(timeout=20) as c:
            r = await c.get(
                EMERGENT_AUTH_SESSION_URL,
                headers={
                    'X-Session-ID': session_id
                }
            )

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f'Auth provider error: {e}'
        )

    if r.status_code >= 300:
        raise HTTPException(
            status_code=401,
            detail='Session exchange failed'
        )

    data = r.json()

    email = (
        data.get('email') or ''
    ).lower()

    if email not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=403,
            detail=f'Email {email} is not on the admin allowlist.'
        )

    user_doc = await db.users.find_one(
        {'email': email},
        {'_id': 0}
    )

    if user_doc:
        user_id = user_doc['user_id']

        await db.users.update_one(
            {'user_id': user_id},
            {
                '$set': {
                    'name': (
                        data.get('name')
                        or user_doc.get('name')
                    ),
                    'picture': (
                        data.get('picture')
                        or user_doc.get('picture')
                    ),
                    'updated_at': datetime.now(timezone.utc),
                }
            }
        )

    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"

        await db.users.insert_one({
            'user_id': user_id,
            'email': email,
            'name': data.get('name') or email,
            'picture': data.get('picture'),
            'created_at': datetime.now(timezone.utc),
        })

    session_token = (
        data.get('session_token')
        or uuid.uuid4().hex
    )

    expires = (
        datetime.now(timezone.utc)
        + timedelta(days=7)
    )

    await db.user_sessions.insert_one({
        'user_id': user_id,
        'session_token': session_token,
        'expires_at': expires,
        'created_at': datetime.now(timezone.utc),
    })

    response.set_cookie(
        key='session_token',
        value=session_token,
        httponly=True,
        secure=True,
        samesite='none',
        path='/',
        max_age=7 * 24 * 3600,
    )

    return {
        'user_id': user_id,
        'email': email,
        'name': data.get('name'),
        'picture': data.get('picture'),
        'is_admin': email in ADMIN_EMAILS,
        'session_token': session_token
    }


@api_router.get("/auth/me", response_model=User)
async def auth_me(
    user: User = Depends(get_current_user)
):
    return user


@api_router.post("/auth/logout")
async def auth_logout(
    request: Request,
    response: Response
):
    token = request.cookies.get(
        'session_token'
    )

    if token:
        await db.user_sessions.delete_one({
            'session_token': token
        })

    response.delete_cookie(
        key='session_token',
        path='/'
    )

    return {
        'ok': True
    }


# -------------------- Admin routes --------------------

@api_router.get(
    "/admin/leads",
    response_model=List[LeadListItem]
)
async def admin_list_leads(
    limit: int = 500,
    type: Optional[str] = None,
    user: User = Depends(require_admin)
):
    q = {}

    if type:
        q["type"] = type

    docs = (
        await db.leads
        .find(q)
        .sort("created_at", -1)
        .to_list(limit)
    )

    return [
        LeadListItem(
            **_clean_mongo(d)
        )
        for d in docs
    ]


@api_router.get("/admin/stats")
async def admin_stats(
    user: User = Depends(require_admin)
):
    total = await db.leads.count_documents({})

    by_type = {}

    for t in [
        "apply",
        "callback",
        "quick",
        "chat_lead",
        "newsletter"
    ]:
        by_type[t] = (
            await db.leads.count_documents({
                "type": t
            })
        )

    subs = (
        await db.newsletter.count_documents({})
    )

    since = (
        datetime.now(timezone.utc)
        - timedelta(days=7)
    )

    last7 = (
        await db.leads.count_documents({
            "created_at": {
                "$gte": since
            }
        })
    )

    return {
        "total_leads": total,
        "by_type": by_type,
        "newsletter_subscribers": subs,
        "last_7_days": last7
    }


@api_router.get(
    "/admin/newsletter",
    response_model=List[Newsletter]
)
async def admin_newsletter(
    limit: int = 500,
    user: User = Depends(require_admin)
):
    docs = (
        await db.newsletter
        .find()
        .sort("created_at", -1)
        .to_list(limit)
    )

    return [
        Newsletter(
            **_clean_mongo(d)
        )
        for d in docs
    ]


# Legacy public stats
@api_router.get("/leads/stats")
async def lead_stats_public():
    total = (
        await db.leads.count_documents({})
    )

    subs = (
        await db.newsletter.count_documents({})
    )

    return {
        "total_leads": total,
        "newsletter_subscribers": subs
    }


# -------------------- Application setup --------------------

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format=(
        '%(asctime)s - %(name)s - '
        '%(levelname)s - %(message)s'
    )
)

logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
