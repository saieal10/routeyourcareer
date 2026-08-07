from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

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
    source: Optional[str] = Field(default="website", description="hero, cta, chat, calculator, newsletter, apply, callback, georgia-page")
    type: Optional[Literal["apply", "callback", "quick", "newsletter", "chat_lead"]] = "quick"


class Lead(LeadCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NewsletterCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = "footer"


class Newsletter(NewsletterCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatIn(BaseModel):
    session_id: str
    message: str
    lead_hint: Optional[dict] = None  # optional context RYC website sends (page, country focus etc)


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


# -------------------- Helpers --------------------
def _clean_mongo(doc):
    if not doc:
        return doc
    doc.pop('_id', None)
    return doc


RYC_SYSTEM_PROMPT = """You are the RYC AI Assistant for Route Your Career — an India-based one-stop guidance & lead-generation platform that helps students find their dream MBBS university abroad.

CORE FACTS (never contradict):
- Route Your Career is a new startup with a core team of a decade of MBBS-abroad experience.
- We are NOT an agent or a university. We are a free guidance & lead-generation platform for Indian students.
- Free consultation is provided on request. Universities pay us on verified admission, students never pay us.
- We cover 9 countries: Georgia, Uzbekistan, Ireland, Egypt, Moldova, Russia, Kazakhstan, Kyrgyzstan, Nepal.
- Our two PRIORITY destinations are Georgia (₹20–28L total) and Uzbekistan (₹16–20L total). These are English-medium, NMC-recognised.
- We have partner offices in 5 Indian states: Karnataka (Bengaluru), Maharashtra (Mumbai), Kerala (Kochi), Tamil Nadu (Chennai), Telangana (Hyderabad).
- Office hours: Mon–Sat, 10am–7pm IST.
- WhatsApp / Phone: +91 93260 82141. Email: inforouteyourcareer@gmail.com.
- Apply Online: https://forms.gle/8Yuz9wmpKuSM1Vee9
- Request Callback: https://forms.gle/i9Xm6RAWXvLyLKG48

STYLE:
- Warm, friendly, concise. Use short sentences. Avoid over-promising.
- If a student shares their name, phone, NEET score or preferred country, acknowledge it and offer next-step CTAs.
- Encourage students to Apply Online or Request a Callback for a real counsellor conversation.
- Always answer in the same language as the student (English / Hindi / Hinglish / Kannada / Tamil / Telugu / Malayalam).

GEORGIA PARTNER UNIVERSITIES (only recommend these when asked about Georgia):
- Alte University
- Caucasus International University (CIU)
- Caucasus University (CU)
- University of Georgia

GUARDRAILS:
- Never invent university names outside our known partner list.
- Never quote fees outside the ranges above.
- Never promise admission — say "our counsellor will confirm eligibility".
- If asked about anything outside MBBS-abroad guidance, gently redirect.
"""


# -------------------- Routes --------------------
@api_router.get("/")
async def root():
    return {"message": "Route Your Career API is live", "version": "1.0"}


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    return lead


@api_router.get("/leads", response_model=List[LeadListItem])
async def list_leads(limit: int = 200, type: Optional[str] = None):
    q = {}
    if type:
        q["type"] = type
    docs = await db.leads.find(q).sort("created_at", -1).to_list(limit)
    return [LeadListItem(**_clean_mongo(d)) for d in docs]


@api_router.get("/leads/stats")
async def lead_stats():
    total = await db.leads.count_documents({})
    by_type = {}
    for t in ["apply", "callback", "quick", "chat_lead", "newsletter"]:
        by_type[t] = await db.leads.count_documents({"type": t})
    subs = await db.newsletter.count_documents({})
    return {"total_leads": total, "by_type": by_type, "newsletter_subscribers": subs}


@api_router.post("/newsletter", response_model=Newsletter)
async def newsletter_signup(payload: NewsletterCreate):
    # dedupe by email
    existing = await db.newsletter.find_one({"email": payload.email})
    if existing:
        return Newsletter(**_clean_mongo(existing))
    sub = Newsletter(**payload.model_dump())
    await db.newsletter.insert_one(sub.model_dump())
    # Also drop into leads with type=newsletter (unified inbox)
    lead = Lead(
        name="Newsletter subscriber",
        phone="-",
        email=payload.email,
        source=payload.source or "footer",
        type="newsletter",
    )
    await db.leads.insert_one(lead.model_dump())
    return sub


@api_router.post("/chat", response_model=ChatOut)
async def chat(payload: ChatIn):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    # Load existing history so we're multi-turn even across HTTP calls
    history_docs = await db.chat_messages.find({"session_id": payload.session_id}).sort("created_at", 1).to_list(200)

    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=payload.session_id,
        system_message=RYC_SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-6")

    # Replay past user/assistant messages so the library keeps context.
    # emergentintegrations LlmChat has internal state per-instance; we replay via send_message quickly
    # by feeding only the latest turn (the library will store this one only). To keep persistence
    # across pods, we manually pass the whole history as a compact context in the user message when needed.
    context_prefix = ""
    if history_docs:
        recent = history_docs[-8:]
        lines = []
        for m in recent:
            role = "Student" if m.get("role") == "user" else "You (RYC AI)"
            lines.append(f"{role}: {m.get('content','')}")
        context_prefix = "Recent conversation so far:\n" + "\n".join(lines) + "\n\nNew student message: "

    user_text = context_prefix + payload.message

    try:
        response = await chat_client.send_message(UserMessage(text=user_text))
    except Exception as e:
        logging.exception("LLM error")
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)[:200]}")

    reply = str(response) if response is not None else ""

    # persist both turns
    now = datetime.now(timezone.utc)
    await db.chat_messages.insert_many([
        {"session_id": payload.session_id, "role": "user", "content": payload.message, "created_at": now},
        {"session_id": payload.session_id, "role": "assistant", "content": reply, "created_at": now},
    ])
    return ChatOut(session_id=payload.session_id, reply=reply)


class ChatLeadIn(BaseModel):
    session_id: str
    name: str
    phone: str
    country: Optional[str] = None
    neet_score: Optional[str] = None


@api_router.post("/chat/lead", response_model=Lead)
async def chat_capture_lead(payload: ChatLeadIn):
    """Called by the chat widget when the AI qualifies a student.
    Also tags the chat session with the captured lead id for counsellor handoff."""
    lead = Lead(
        name=payload.name,
        phone=payload.phone,
        country=payload.country,
        neet_score=payload.neet_score,
        source=f"chat:{payload.session_id}",
        type="chat_lead",
    )
    await db.leads.insert_one(lead.model_dump())
    await db.chat_sessions.update_one(
        {"session_id": payload.session_id},
        {"$set": {"session_id": payload.session_id, "lead_id": lead.id, "qualified_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    return lead


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
