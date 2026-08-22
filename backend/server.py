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

from google import genai


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


# =========================================================
# MONGODB
# =========================================================

mongo_url = os.environ["MONGO_URL"]

client = AsyncIOMotorClient(
    mongo_url
)

db = client[
    os.environ["DB_NAME"]
]


# =========================================================
# ADMIN
# =========================================================

ADMIN_EMAILS = [
    email.strip().lower()
    for email in os.environ.get(
        "ADMIN_EMAILS",
        "inforouteyourcareer@gmail.com",
    ).split(",")
    if email.strip()
]


# =========================================================
# GOOGLE OAUTH
# =========================================================

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


# =========================================================
# GEMINI
# =========================================================

GEMINI_API_KEY = os.environ.get(
    "GEMINI_API_KEY"
)

GEMINI_MODEL = os.environ.get(
    "GEMINI_MODEL",
    "gemini-2.5-flash"
)

gemini_client = None

if GEMINI_API_KEY:
    gemini_client = genai.Client(
        api_key=GEMINI_API_KEY
    )



# =========================================================
# LIVE CURRENCY / FX
# =========================================================

EXCHANGERATE_API_KEY = os.environ.get(
    "EXCHANGERATE_API_KEY"
)

FX_API_URL = (
    "https://api.exchangerate.host/live"
)

FX_SUPPORTED_CURRENCIES = [
    "USD",
    "INR",
    "EUR",
    "GBP",
    "AUD",
    "RUB",
]

# Free exchangerate.host plans are updated daily.
# Cache for 12 hours so normal RYC traffic does not burn
# one provider request per student.
FX_CACHE_SECONDS = 12 * 60 * 60

_fx_cache = {
    "rates": None,
    "fetched_at": None,
    "source": None,
}


async def get_live_fx_rates(
    force: bool = False
):

    now = datetime.now(
        timezone.utc
    )

    cached_rates = (
        _fx_cache.get(
            "rates"
        )
    )

    fetched_at = (
        _fx_cache.get(
            "fetched_at"
        )
    )

    if (
        not force
        and cached_rates
        and fetched_at
        and (
            now - fetched_at
        ).total_seconds()
        < FX_CACHE_SECONDS
    ):
        return {
            "rates":
            cached_rates,

            "fetched_at":
            fetched_at,

            "provider":
            _fx_cache.get(
                "source"
            )
            or "exchangerate.host",

            "cached":
            True,
        }

    if not EXCHANGERATE_API_KEY:

        if cached_rates:
            return {
                "rates":
                cached_rates,

                "fetched_at":
                fetched_at,

                "provider":
                _fx_cache.get(
                    "source"
                )
                or "cached",

                "cached":
                True,
            }

        raise HTTPException(
            status_code=503,
            detail=(
                "Live currency conversion is not configured. "
                "Add EXCHANGERATE_API_KEY in Render."
            ),
        )

    params = {
        "access_key":
        EXCHANGERATE_API_KEY,

        "currencies":
        ",".join(
            [
                currency
                for currency
                in FX_SUPPORTED_CURRENCIES
                if currency != "USD"
            ]
        ),
    }

    try:

        async with httpx.AsyncClient(
            timeout=12.0
        ) as http:

            response = await http.get(
                FX_API_URL,
                params=params,
            )

        response.raise_for_status()

        data = response.json()

        if not data.get(
            "success"
        ):

            raise ValueError(
                str(
                    data.get(
                        "error"
                    )
                    or "FX provider returned an error"
                )
            )

        quotes = (
            data.get(
                "quotes"
            )
            or {}
        )

        rates = {
            "USD": 1.0
        }

        for currency in (
            FX_SUPPORTED_CURRENCIES
        ):

            if currency == "USD":
                continue

            quote_key = (
                f"USD{currency}"
            )

            value = quotes.get(
                quote_key
            )

            if value is not None:

                try:
                    rates[
                        currency
                    ] = float(
                        value
                    )
                except Exception:
                    pass

        missing = [
            currency
            for currency
            in FX_SUPPORTED_CURRENCIES
            if currency not in rates
        ]

        if missing:

            raise ValueError(
                "FX provider did not return: "
                + ", ".join(
                    missing
                )
            )

        _fx_cache[
            "rates"
        ] = rates

        _fx_cache[
            "fetched_at"
        ] = now

        _fx_cache[
            "source"
        ] = "exchangerate.host"

        return {
            "rates":
            rates,

            "fetched_at":
            now,

            "provider":
            "exchangerate.host",

            "cached":
            False,
        }

    except HTTPException:
        raise

    except Exception as exc:

        logging.exception(
            "Live FX fetch failed: %s",
            exc
        )

        if cached_rates:

            return {
                "rates":
                cached_rates,

                "fetched_at":
                fetched_at,

                "provider":
                _fx_cache.get(
                    "source"
                )
                or "cached",

                "cached":
                True,
            }

        raise HTTPException(
            status_code=503,
            detail=(
                "Live exchange rates are temporarily unavailable."
            ),
        )


def convert_currency(
    amount,
    from_currency: str,
    to_currency: str,
    rates: dict,
):

    if amount is None:
        return None

    source = str(
        from_currency
        or "USD"
    ).upper().strip()

    target = str(
        to_currency
        or "USD"
    ).upper().strip()

    try:
        amount = float(
            amount
        )
    except Exception:
        return None

    if source == target:
        return round(
            amount,
            2
        )

    if (
        source not in rates
        or target not in rates
    ):
        return None

    source_rate = float(
        rates[source]
    )

    target_rate = float(
        rates[target]
    )

    if source_rate <= 0:
        return None

    amount_usd = (
        amount
        / source_rate
    )

    return round(
        amount_usd
        * target_rate,
        2,
    )


# =========================================================
# FRONTEND
# =========================================================

FRONTEND_URL = (
    "https://routeyourcareer.netlify.app"
)


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI(
    title="Route Your Career API"
)

api_router = APIRouter(
    prefix="/api"
)


# =========================================================
# LEAD MODELS
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
            "build_route",
            "pre_application",
        ]
    ] = "quick"


class Lead(LeadCreate):

    id: str = Field(
        default_factory=lambda:
        str(uuid.uuid4())
    )

    created_at: datetime = Field(
        default_factory=lambda:
        datetime.now(
            timezone.utc
        )
    )


class NewsletterCreate(BaseModel):

    email: EmailStr
    source: Optional[str] = "footer"


class Newsletter(NewsletterCreate):

    id: str = Field(
        default_factory=lambda:
        str(uuid.uuid4())
    )

    created_at: datetime = Field(
        default_factory=lambda:
        datetime.now(
            timezone.utc
        )
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
    ] = Field(
        default_factory=list
    )

    cta: Optional[str] = "mbbs"
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None

    keywords: List[str] = Field(
        default_factory=list
    )

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
    body: List[BlogBodyBlock]
    cta: Optional[str] = None
    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None


# =========================================================
# UNIVERSITY MODELS
# =========================================================


class UniversityFAQ(BaseModel):

    question: str
    answer: str


class UniversityCreate(BaseModel):

    stream: Literal[
        "MBBS",
        "Management",
    ]

    name: str
    slug: Optional[str] = None
    country: str
    city: Optional[str] = None

    course: str
    course_level: Optional[str] = None
    duration: Optional[str] = None
    medium: Optional[str] = "English"
    intake: Optional[str] = None
    application_deadline: Optional[str] = None

    currency: str = "USD"

    tuition_fee_year: Optional[float] = None
    hostel_fee_year: Optional[float] = None
    food_fee_year: Optional[float] = None
    first_year_total: Optional[float] = None
    total_course_cost: Optional[float] = None
    application_fee: Optional[float] = None
    scholarship_info: Optional[str] = None

    eligibility: Optional[str] = None

    # MBBS
    neet_requirement: Optional[str] = None
    pcb_requirement: Optional[str] = None
    internship: Optional[str] = None
    recognition: Optional[str] = None
    nmc_notes: Optional[str] = None
    fmge_next_notes: Optional[str] = None

    # Management
    academic_requirement: Optional[str] = None
    english_requirement: Optional[str] = None
    ielts_requirement: Optional[str] = None
    toefl_requirement: Optional[str] = None
    gmat_gre_requirement: Optional[str] = None
    work_experience: Optional[str] = None

    specializations: List[str] = Field(
        default_factory=list
    )

    internship_opportunities: Optional[str] = None
    placement_info: Optional[str] = None
    post_study_opportunities: Optional[str] = None

    overview: Optional[str] = None
    accreditation: Optional[str] = None
    ranking: Optional[str] = None
    established_year: Optional[str] = None
    campus: Optional[str] = None

    hostel: Optional[str] = None
    indian_food: Optional[str] = None
    student_life: Optional[str] = None
    climate: Optional[str] = None
    airport_distance: Optional[str] = None

    pros: List[str] = Field(
        default_factory=list
    )

    cons: List[str] = Field(
        default_factory=list
    )

    documents_required: List[str] = Field(
        default_factory=list
    )

    admission_process: List[str] = Field(
        default_factory=list
    )

    faqs: List[
        UniversityFAQ
    ] = Field(
        default_factory=list
    )

    website: Optional[str] = None
    image_url: Optional[str] = None
    apply_link: Optional[str] = None

    featured: bool = False
    popular: bool = False
    budget_option: bool = False
    recommended: bool = False

    status: Literal[
        "draft",
        "published",
    ] = "draft"

    seo_title: Optional[str] = None
    meta_description: Optional[str] = None

    keywords: List[str] = Field(
        default_factory=list
    )


class UniversityUpdate(BaseModel):

    stream: Optional[
        Literal[
            "MBBS",
            "Management",
        ]
    ] = None

    name: Optional[str] = None
    slug: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None

    course: Optional[str] = None
    course_level: Optional[str] = None
    duration: Optional[str] = None
    medium: Optional[str] = None
    intake: Optional[str] = None
    application_deadline: Optional[str] = None

    currency: Optional[str] = None

    tuition_fee_year: Optional[float] = None
    hostel_fee_year: Optional[float] = None
    food_fee_year: Optional[float] = None
    first_year_total: Optional[float] = None
    total_course_cost: Optional[float] = None
    application_fee: Optional[float] = None
    scholarship_info: Optional[str] = None

    eligibility: Optional[str] = None

    neet_requirement: Optional[str] = None
    pcb_requirement: Optional[str] = None
    internship: Optional[str] = None
    recognition: Optional[str] = None
    nmc_notes: Optional[str] = None
    fmge_next_notes: Optional[str] = None

    academic_requirement: Optional[str] = None
    english_requirement: Optional[str] = None
    ielts_requirement: Optional[str] = None
    toefl_requirement: Optional[str] = None
    gmat_gre_requirement: Optional[str] = None
    work_experience: Optional[str] = None

    specializations: Optional[
        List[str]
    ] = None

    internship_opportunities: Optional[str] = None
    placement_info: Optional[str] = None
    post_study_opportunities: Optional[str] = None

    overview: Optional[str] = None
    accreditation: Optional[str] = None
    ranking: Optional[str] = None
    established_year: Optional[str] = None
    campus: Optional[str] = None

    hostel: Optional[str] = None
    indian_food: Optional[str] = None
    student_life: Optional[str] = None
    climate: Optional[str] = None
    airport_distance: Optional[str] = None

    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    documents_required: Optional[List[str]] = None
    admission_process: Optional[List[str]] = None
    faqs: Optional[List[UniversityFAQ]] = None

    website: Optional[str] = None
    image_url: Optional[str] = None
    apply_link: Optional[str] = None

    featured: Optional[bool] = None
    popular: Optional[bool] = None
    budget_option: Optional[bool] = None
    recommended: Optional[bool] = None

    status: Optional[
        Literal[
            "draft",
            "published",
        ]
    ] = None

    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: Optional[List[str]] = None


class University(BaseModel):

    id: str
    stream: str
    name: str
    slug: str
    country: str
    city: Optional[str] = None

    course: str
    course_level: Optional[str] = None
    duration: Optional[str] = None
    medium: Optional[str] = None
    intake: Optional[str] = None
    application_deadline: Optional[str] = None

    currency: str = "USD"

    tuition_fee_year: Optional[float] = None
    hostel_fee_year: Optional[float] = None
    food_fee_year: Optional[float] = None
    first_year_total: Optional[float] = None
    total_course_cost: Optional[float] = None
    application_fee: Optional[float] = None
    scholarship_info: Optional[str] = None

    eligibility: Optional[str] = None

    neet_requirement: Optional[str] = None
    pcb_requirement: Optional[str] = None
    internship: Optional[str] = None
    recognition: Optional[str] = None
    nmc_notes: Optional[str] = None
    fmge_next_notes: Optional[str] = None

    academic_requirement: Optional[str] = None
    english_requirement: Optional[str] = None
    ielts_requirement: Optional[str] = None
    toefl_requirement: Optional[str] = None
    gmat_gre_requirement: Optional[str] = None
    work_experience: Optional[str] = None

    specializations: List[str] = Field(default_factory=list)

    internship_opportunities: Optional[str] = None
    placement_info: Optional[str] = None
    post_study_opportunities: Optional[str] = None

    overview: Optional[str] = None
    accreditation: Optional[str] = None
    ranking: Optional[str] = None
    established_year: Optional[str] = None
    campus: Optional[str] = None

    hostel: Optional[str] = None
    indian_food: Optional[str] = None
    student_life: Optional[str] = None
    climate: Optional[str] = None
    airport_distance: Optional[str] = None

    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    documents_required: List[str] = Field(default_factory=list)
    admission_process: List[str] = Field(default_factory=list)
    faqs: List[UniversityFAQ] = Field(default_factory=list)

    website: Optional[str] = None
    image_url: Optional[str] = None
    apply_link: Optional[str] = None

    featured: bool = False
    popular: bool = False
    budget_option: bool = False
    recommended: bool = False

    status: str

    seo_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)

    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None



# =========================================================
# V2 COURSE MASTER MODELS
# =========================================================


class CourseCreate(BaseModel):

    university_id: str

    stream: Literal[
        "MBBS",
        "Management",
        "Other",
    ]

    name: str
    slug: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    medium: Optional[str] = "English"

    currency: str = "USD"
    tuition_fee_year: Optional[float] = None
    hostel_fee_year: Optional[float] = None
    living_cost_year: Optional[float] = None
    other_costs_total: Optional[float] = None
    total_course_cost: Optional[float] = None

    intake: Optional[str] = None
    application_deadline: Optional[str] = None

    eligibility: Optional[str] = None

    # MBBS matching
    neet_requirement: Optional[str] = None
    pcb_requirement: Optional[str] = None

    # Management / other matching
    academic_requirement: Optional[str] = None
    english_requirement: Optional[str] = None
    ielts_requirement: Optional[str] = None
    gmat_gre_requirement: Optional[str] = None
    work_experience: Optional[str] = None

    featured: bool = False
    recommended: bool = False
    budget_option: bool = False

    last_verified: Optional[datetime] = None
    source_url: Optional[str] = None

    status: Literal[
        "draft",
        "published",
    ] = "draft"


class CourseUpdate(BaseModel):

    university_id: Optional[str] = None

    stream: Optional[
        Literal[
            "MBBS",
            "Management",
            "Other",
        ]
    ] = None

    name: Optional[str] = None
    slug: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    medium: Optional[str] = None

    currency: Optional[str] = None
    tuition_fee_year: Optional[float] = None
    hostel_fee_year: Optional[float] = None
    living_cost_year: Optional[float] = None
    other_costs_total: Optional[float] = None
    total_course_cost: Optional[float] = None

    intake: Optional[str] = None
    application_deadline: Optional[str] = None

    eligibility: Optional[str] = None

    neet_requirement: Optional[str] = None
    pcb_requirement: Optional[str] = None

    academic_requirement: Optional[str] = None
    english_requirement: Optional[str] = None
    ielts_requirement: Optional[str] = None
    gmat_gre_requirement: Optional[str] = None
    work_experience: Optional[str] = None

    featured: Optional[bool] = None
    recommended: Optional[bool] = None
    budget_option: Optional[bool] = None

    last_verified: Optional[datetime] = None
    source_url: Optional[str] = None

    status: Optional[
        Literal[
            "draft",
            "published",
        ]
    ] = None


class Course(BaseModel):

    id: str
    university_id: str

    # Snapshot fields copied from university master so course
    # search remains fast and easy to render.
    university_name: str
    country: str
    city: Optional[str] = None

    stream: str
    name: str
    slug: str
    level: Optional[str] = None
    duration: Optional[str] = None
    medium: Optional[str] = None

    currency: str = "USD"
    tuition_fee_year: Optional[float] = None
    hostel_fee_year: Optional[float] = None
    living_cost_year: Optional[float] = None
    other_costs_total: Optional[float] = None
    total_course_cost: Optional[float] = None

    intake: Optional[str] = None
    application_deadline: Optional[str] = None

    eligibility: Optional[str] = None

    neet_requirement: Optional[str] = None
    pcb_requirement: Optional[str] = None

    academic_requirement: Optional[str] = None
    english_requirement: Optional[str] = None
    ielts_requirement: Optional[str] = None
    gmat_gre_requirement: Optional[str] = None
    work_experience: Optional[str] = None

    featured: bool = False
    recommended: bool = False
    budget_option: bool = False

    last_verified: Optional[datetime] = None
    source_url: Optional[str] = None

    status: str

    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None



# =========================================================
# BUILD MY ROUTE MODELS
# =========================================================


class BuildMyRouteRequest(BaseModel):

    stream: Literal[
        "MBBS",
        "Management",
        "Other",
    ]

    preferred_countries: List[str] = Field(
        default_factory=list
    )

    budget_total: Optional[float] = None
    budget_currency: str = "USD"

    # Kept for API compatibility, but not used as a hard filter.
    intake: Optional[str] = None

    max_results: int = Field(
        default=12,
        ge=1,
        le=30,
    )

    # MBBS
    neet_status: Optional[str] = None
    neet_score: Optional[float] = None
    pcb_percentage: Optional[float] = None

    # Management / Other
    desired_level: Optional[str] = None
    academic_percentage: Optional[float] = None
    english_test: Optional[str] = None
    ielts_score: Optional[float] = None
    work_experience_years: Optional[float] = None


class BuildMyRouteMatch(BaseModel):

    course_id: str
    course_slug: str
    course_name: str

    university_id: str
    university_name: str
    country: str
    city: Optional[str] = None

    stream: str
    level: Optional[str] = None
    duration: Optional[str] = None
    medium: Optional[str] = None

    currency: str = "USD"
    tuition_fee_year: Optional[float] = None
    total_course_cost: Optional[float] = None
    estimated_total_cost: Optional[float] = None
    intake: Optional[str] = None

    match_type: Literal[
        "best_match",
        "possible_match",
    ]

    score: int

    reasons: List[str] = Field(
        default_factory=list
    )

    cautions: List[str] = Field(
        default_factory=list
    )

    featured: bool = False
    recommended: bool = False
    budget_option: bool = False

    last_verified: Optional[datetime] = None

    tuition_fee_inr: Optional[float] = None
    estimated_total_cost_inr: Optional[float] = None


class BuildMyRouteResponse(BaseModel):

    stream: str
    matches_found: int
    returned: int

    results: List[
        BuildMyRouteMatch
    ]

    note: str

    fx_provider: Optional[str] = None
    fx_updated_at: Optional[datetime] = None



class BuildRouteLeadCreate(BaseModel):

    # If this lead started before Build My Route, pass the
    # application_id here so the same lead is updated instead
    # of creating a duplicate.
    application_id: Optional[str] = None

    name: str
    phone: str
    email: Optional[str] = None
    state: Optional[str] = None
    preferred_contact: Optional[str] = "WhatsApp"

    stream: Literal[
        "MBBS",
        "Management",
        "Other",
    ]

    preferred_countries: List[str] = Field(default_factory=list)
    budget_total: Optional[float] = None
    budget_currency: str = "USD"
    intake: Optional[str] = None

    neet_status: Optional[str] = None
    neet_score: Optional[float] = None
    pcb_percentage: Optional[float] = None

    desired_level: Optional[str] = None
    academic_percentage: Optional[float] = None
    english_test: Optional[str] = None
    ielts_score: Optional[float] = None
    work_experience_years: Optional[float] = None

    selected_course_id: str
    selected_course_name: str
    selected_course_slug: Optional[str] = None
    selected_university_id: str
    selected_university_name: str
    selected_country: str
    selected_city: Optional[str] = None

    route_score: Optional[int] = Field(default=None, ge=0, le=100)
    match_type: Optional[str] = None

    shortlisted_routes: List[dict] = Field(default_factory=list)


class BuildRouteLeadResponse(BaseModel):

    ok: bool = True
    lead_id: str
    message: str



class PreApplicationCreate(BaseModel):

    name: str
    phone: str

    email: Optional[str] = None
    state: Optional[str] = None
    preferred_contact: Optional[str] = "WhatsApp"

    stream: Literal[
        "MBBS",
        "Management",
        "Other",
    ]

    preferred_country: Optional[str] = None


class PreApplicationResponse(BaseModel):

    ok: bool = True
    application_id: str
    lead_id: str
    status: str
    message: str


class ApplicationRouteProfileUpdate(BaseModel):

    stream: Literal[
        "MBBS",
        "Management",
        "Other",
    ]

    preferred_countries: List[str] = Field(
        default_factory=list
    )

    budget_total: Optional[float] = None
    budget_currency: str = "USD"
    intake: Optional[str] = None

    neet_status: Optional[str] = None
    neet_score: Optional[float] = None
    pcb_percentage: Optional[float] = None

    desired_level: Optional[str] = None
    academic_percentage: Optional[float] = None
    english_test: Optional[str] = None
    ielts_score: Optional[float] = None
    work_experience_years: Optional[float] = None

    shortlisted_routes: List[dict] = Field(
        default_factory=list
    )


class ApplicationRouteProfileResponse(BaseModel):

    ok: bool = True
    application_id: str
    message: str



# =========================================================
# APPLICATION DOCUMENT MODELS
# =========================================================

DocumentStatus = Literal[
    "pending",
    "received",
    "verified",
    "rejected",
]


class ApplicationDocumentStatusUpdate(BaseModel):

    status: DocumentStatus
    note: Optional[str] = None


# =========================================================
# HELPERS
# =========================================================


def _clean_mongo(doc):

    if not doc:
        return doc

    doc.pop("_id", None)

    return doc


def make_slug(text: str) -> str:

    text = text.strip().lower()

    text = re.sub(
        r"[^a-z0-9]+",
        "-",
        text
    )

    return text.strip("-")



# =========================================================
# BUILD MY ROUTE HELPERS
# =========================================================


def _route_text(value) -> str:

    return str(
        value or ""
    ).strip().lower()


def _route_first_number(
    value
) -> Optional[float]:

    if value is None:
        return None

    if isinstance(
        value,
        (int, float)
    ):
        return float(value)

    match = re.search(
        r"(\d+(?:\.\d+)?)",
        str(value)
    )

    if not match:
        return None

    try:
        return float(
            match.group(1)
        )

    except Exception:
        return None


def _route_percentage(
    value
) -> Optional[float]:

    if value is None:
        return None

    match = re.search(
        r"(\d+(?:\.\d+)?)\s*%",
        str(value)
    )

    if not match:
        return None

    try:
        return float(
            match.group(1)
        )

    except Exception:
        return None


def _route_neet_required(
    value
) -> bool:

    text = _route_text(
        value
    )

    if not text:
        return False

    negative = [
        "not required",
        "no neet",
        "neet not required",
        "not mandatory",
    ]

    if any(
        phrase in text
        for phrase in negative
    ):
        return False

    return (
        "neet" in text
        or "required for indian" in text
        or "qualified" in text
        or "qualification" in text
        or "mandatory" in text
    )


def _route_recently_verified(
    value
) -> bool:

    if not value:
        return False

    last_verified = value

    if isinstance(
        last_verified,
        str
    ):

        try:
            last_verified = (
                datetime.fromisoformat(
                    last_verified.replace(
                        "Z",
                        "+00:00"
                    )
                )
            )

        except Exception:
            return False

    if not isinstance(
        last_verified,
        datetime
    ):
        return False

    if (
        last_verified.tzinfo
        is None
    ):
        last_verified = (
            last_verified.replace(
                tzinfo=timezone.utc
            )
        )

    return (
        datetime.now(
            timezone.utc
        )
        - last_verified
        <= timedelta(
            days=90
        )
    )


def _route_total_cost(
    course: dict
) -> Optional[float]:

    # Prefer the broader study estimate when present.
    existing_estimate = course.get(
        "estimated_study_cost"
    )

    if existing_estimate is not None:

        try:
            return float(
                existing_estimate
            )

        except Exception:
            pass

    years = _route_first_number(
        course.get(
            "duration"
        )
    )

    tuition = course.get(
        "tuition_fee_year"
    )

    if (
        years is not None
        and tuition is not None
    ):

        try:

            return round(
                (
                    float(tuition)
                    + float(
                        course.get(
                            "hostel_fee_year"
                        )
                        or 0
                    )
                    + float(
                        course.get(
                            "living_cost_year"
                        )
                        or 0
                    )
                )
                * float(years)
                + float(
                    course.get(
                        "other_costs_total"
                    )
                    or 0
                ),
                2
            )

        except Exception:
            pass

    total_course_cost = (
        course.get(
            "total_course_cost"
        )
    )

    if total_course_cost is not None:

        try:
            return float(
                total_course_cost
            )

        except Exception:
            pass

    return None


def _score_route_course(
    course: dict,
    payload: BuildMyRouteRequest,
    fx_rates: Optional[dict] = None,
):

    score = 50

    reasons = []
    cautions = []

    hard_fail = False

    preferred_countries = {
        _route_text(country)
        for country
        in payload.preferred_countries
        if _route_text(country)
    }

    course_country = _route_text(
        course.get(
            "country"
        )
    )

    # -----------------------------------------------------
    # COUNTRY PREFERENCE
    # -----------------------------------------------------

    if preferred_countries:

        if (
            course_country
            in preferred_countries
        ):

            score += 15

            reasons.append(
                "Matches your preferred country"
            )

        else:

            score -= 5

            cautions.append(
                "Outside your selected country preferences"
            )

    # -----------------------------------------------------
    # BUDGET
    # -----------------------------------------------------

    estimated_total = (
        _route_total_cost(
            course
        )
    )

    if (
        payload.budget_total
        is not None
    ):

        course_currency = (
            str(
                course.get(
                    "currency"
                )
                or "USD"
            )
            .upper()
            .strip()
        )

        budget_currency = (
            str(
                payload.budget_currency
                or "USD"
            )
            .upper()
            .strip()
        )

        comparable_budget = float(
            payload.budget_total
        )

        if (
            course_currency
            != budget_currency
        ):

            comparable_budget = (
                convert_currency(
                    payload.budget_total,
                    budget_currency,
                    course_currency,
                    fx_rates,
                )
                if fx_rates
                else None
            )

        if comparable_budget is None:

            cautions.append(
                "Live budget conversion is temporarily unavailable"
            )

        elif estimated_total is None:

            cautions.append(
                "Complete comparable programme cost is not verified"
            )

        elif (
            estimated_total
            <= comparable_budget
        ):

            score += 20

            reasons.append(
                "Estimated programme cost fits your budget after live currency conversion"
            )

        else:

            difference = (
                estimated_total
                - comparable_budget
            )

            ratio = (
                difference
                / comparable_budget
                if comparable_budget
                else 1
            )

            if ratio <= 0.10:

                score -= 5

                cautions.append(
                    "Estimated programme cost is slightly above your budget after currency conversion"
                )

            else:

                score -= 20

                cautions.append(
                    "Estimated programme cost is above your budget after currency conversion"
                )

    # -----------------------------------------------------
    # MEDIUM
    # -----------------------------------------------------

    medium = _route_text(
        course.get(
            "medium"
        )
    )

    if "english" in medium:

        score += 5

        reasons.append(
            "Recorded as English-medium"
        )

    elif not medium:

        cautions.append(
            "Teaching medium needs verification"
        )

    # -----------------------------------------------------
    # MBBS
    # -----------------------------------------------------

    if (
        payload.stream
        == "MBBS"
    ):

        requirement = (
            course.get(
                "neet_requirement"
            )
        )

        if _route_neet_required(
            requirement
        ):

            status = _route_text(
                payload.neet_status
            )

            if status in [
                "qualified",
                "yes",
            ]:

                score += 15

                reasons.append(
                    "Your NEET status appears compatible"
                )

            elif status in [
                "not_qualified",
                "not qualified",
                "not_taken",
                "not taken",
                "no",
            ]:

                hard_fail = True

        elif requirement:

            cautions.append(
                "NEET requirement should be reconfirmed"
            )

        else:

            cautions.append(
                "NEET requirement needs verification"
            )

        required_pcb = (
            _route_percentage(
                course.get(
                    "pcb_requirement"
                )
            )
        )

        if (
            required_pcb
            is not None
            and payload.pcb_percentage
            is not None
        ):

            if (
                payload.pcb_percentage
                >= required_pcb
            ):

                score += 12

                reasons.append(
                    "Your PCB percentage meets the recorded requirement"
                )

            else:

                hard_fail = True

        elif (
            payload.pcb_percentage
            is not None
        ):

            cautions.append(
                "PCB requirement needs verification"
            )

    # -----------------------------------------------------
    # MANAGEMENT / OTHER
    # -----------------------------------------------------

    if (
        payload.stream
        in [
            "Management",
            "Other",
        ]
    ):

        desired_level = (
            _route_text(
                payload.desired_level
            )
        )

        course_level = (
            _route_text(
                course.get(
                    "level"
                )
            )
        )

        if desired_level:

            if course_level:

                if (
                    desired_level
                    in course_level
                    or course_level
                    in desired_level
                ):

                    score += 15

                    reasons.append(
                        "Matches your preferred study level"
                    )

                else:

                    score -= 8

                    cautions.append(
                        "Course level differs from your preferred level"
                    )

            else:

                cautions.append(
                    "Course level needs verification"
                )

        required_academic = (
            _route_percentage(
                course.get(
                    "academic_requirement"
                )
            )
        )

        if (
            required_academic
            is not None
            and payload.academic_percentage
            is not None
        ):

            if (
                payload.academic_percentage
                >= required_academic
            ):

                score += 10

                reasons.append(
                    "Your academic score meets the recorded requirement"
                )

            else:

                hard_fail = True

        elif (
            payload.academic_percentage
            is not None
        ):

            cautions.append(
                "Academic eligibility needs verification"
            )

        required_ielts = (
            _route_first_number(
                course.get(
                    "ielts_requirement"
                )
            )
        )

        if (
            required_ielts
            is not None
            and payload.ielts_score
            is not None
        ):

            if (
                payload.ielts_score
                >= required_ielts
            ):

                score += 8

                reasons.append(
                    "Your IELTS score meets the recorded requirement"
                )

            else:

                hard_fail = True

        elif (
            payload.ielts_score
            is not None
        ):

            cautions.append(
                "IELTS requirement needs verification"
            )

    # -----------------------------------------------------
    # EDITORIAL SIGNALS
    # -----------------------------------------------------

    if course.get(
        "recommended"
    ):

        score += 5

        reasons.append(
            "Marked as recommended by Route Your Career"
        )

    if course.get(
        "featured"
    ):

        score += 2

    if course.get(
        "budget_option"
    ):

        score += 3

        reasons.append(
            "Marked as a budget option"
        )

    # -----------------------------------------------------
    # VERIFICATION
    # -----------------------------------------------------

    if _route_recently_verified(
        course.get(
            "last_verified"
        )
    ):

        score += 5

        reasons.append(
            "Course information was recently verified"
        )

    else:

        cautions.append(
            "Some current details should be reconfirmed before applying"
        )

    # -----------------------------------------------------
    # IMPORTANT: INTAKE DOES NOT FILTER OR PENALISE
    # -----------------------------------------------------

    if payload.intake:

        stored_intake = _route_text(
            course.get(
                "intake"
            )
        )

        requested_intake = _route_text(
            payload.intake
        )

        if (
            stored_intake
            and (
                requested_intake
                in stored_intake
                or stored_intake
                in requested_intake
            )
        ):

            reasons.append(
                "Requested intake appears to match the recorded intake"
            )

        elif stored_intake:

            cautions.append(
                f"Recorded intake: {course.get('intake')}"
            )

        else:

            cautions.append(
                "Latest intake needs verification"
            )

    if hard_fail:
        return None

    score = max(
        0,
        min(
            100,
            int(
                round(score)
            )
        )
    )

    match_type = (
        "best_match"
        if (
            score >= 75
            and len(cautions) <= 2
        )
        else "possible_match"
    )

    return {
        "course_id":
        course.get(
            "id"
        )
        or "",

        "course_slug":
        course.get(
            "slug"
        )
        or "",

        "course_name":
        course.get(
            "name"
        )
        or "",

        "university_id":
        course.get(
            "university_id"
        )
        or "",

        "university_name":
        course.get(
            "university_name"
        )
        or "",

        "country":
        course.get(
            "country"
        )
        or "",

        "city":
        course.get(
            "city"
        ),

        "stream":
        course.get(
            "stream"
        )
        or "",

        "level":
        course.get(
            "level"
        ),

        "duration":
        course.get(
            "duration"
        ),

        "medium":
        course.get(
            "medium"
        ),

        "currency":
        course.get(
            "currency"
        )
        or "USD",

        "tuition_fee_year":
        course.get(
            "tuition_fee_year"
        ),

        "total_course_cost":
        course.get(
            "total_course_cost"
        ),

        "estimated_total_cost":
        estimated_total,

        "intake":
        course.get(
            "intake"
        ),

        "match_type":
        match_type,

        "score":
        score,

        "reasons":
        reasons[:6],

        "cautions":
        cautions[:6],

        "featured":
        bool(
            course.get(
                "featured"
            )
        ),

        "recommended":
        bool(
            course.get(
                "recommended"
            )
        ),

        "budget_option":
        bool(
            course.get(
                "budget_option"
            )
        ),

        "last_verified":
        course.get(
            "last_verified"
        ),

        "tuition_fee_inr":
        (
            convert_currency(
                course.get(
                    "tuition_fee_year"
                ),
                course.get(
                    "currency"
                )
                or "USD",
                "INR",
                fx_rates,
            )
            if fx_rates
            else None
        ),

        "estimated_total_cost_inr":
        (
            convert_currency(
                estimated_total,
                course.get(
                    "currency"
                )
                or "USD",
                "INR",
                fx_rates,
            )
            if (
                fx_rates
                and estimated_total
                is not None
            )
            else None
        ),
    }


# =========================================================
# AUTH HELPERS
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
            "session_token": token
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
        expires_at = datetime.fromisoformat(
            expires_at
        )

    if (
        expires_at
        and expires_at.tzinfo is None
    ):
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
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

    user_doc = await db.users.find_one(
        {
            "user_id":
            sess["user_id"]
        },
        {
            "_id": 0
        },
    )

    if not user_doc:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    user_doc["is_admin"] = (
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
        "7.9-dynamic-university-images",

        "google_auth":
        True,

        "blog_system":
        True,

        "university_system":
        True,

        "course_system":
        True,

        "build_my_route":
        True,

        "build_route_leads":
        True,

        "pre_application":
        True,

        "application_sessions":
        True,

        "admin_applications_crm":
        True,

        "public_application_tracking":
        True,

        "application_document_checklist":
        True,

        "live_currency":
        True,

        "russia_fee_import":
        True,

        "supported_currencies":
        FX_SUPPORTED_CURRENCIES,

        "ai_chat":
        bool(GEMINI_API_KEY),

        "ai_model":
        GEMINI_MODEL,
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
            doc["created_at"].isoformat(),
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

    existing = await db.newsletter.find_one(
        {
            "email":
            payload.email
        }
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

    lead_doc = lead.model_dump()

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


RYC_SYSTEM_PROMPT = """
You are the Route Your Career AI Guidance Assistant.

Route Your Career is an education guidance platform for Indian students.

You help with:

- MBBS abroad
- Management and business education abroad
- MBBS in Georgia
- MBBS in Uzbekistan
- MBBS in other international destinations
- MBA, BBA and MSc Management abroad
- University selection
- Eligibility
- NEET guidance
- Fees and living costs
- Scholarships
- Admissions
- Student life
- Career guidance

STYLE:

Speak naturally like an experienced education counsellor.

Do not sound like a scripted chatbot.

Answer the student's actual question first.

Keep most answers clear and relatively concise.

Ask a follow-up question only when it genuinely helps.

Do not tell every student to contact WhatsApp.

Do not repeatedly advertise Route Your Career.

IMPORTANT ACCURACY RULES:

Never invent exact current tuition fees, admission deadlines,
visa rules, university rankings, scholarships, medical recognition
or licensing requirements.

If the information is likely to change, say that the exact current
information should be verified.

For MBBS questions, distinguish:
1. university admission eligibility
2. Indian NEET/NMC requirements
3. licensing after graduation

Do not guarantee FMGE/NExT success, admission, visa approval,
scholarships, jobs or medical registration.

For Management questions, distinguish courses such as MBA,
BBA, MSc Management, Finance, Marketing, Business Analytics
and International Business.

If a student gives their budget, academic score, NEET score,
preferred country or career goal, use those details naturally
in the answer.

You may suggest speaking with a Route Your Career counsellor
when the student needs a personalised shortlist, document review,
admission processing or application support.

Never request or reveal passwords, API keys, OTPs or banking
information.
"""


async def get_chat_history(
    session_id: str
):

    doc = await db.chat_sessions.find_one(
        {
            "session_id":
            session_id
        },
        {
            "_id": 0
        },
    )

    if not doc:
        return []

    return doc.get(
        "messages",
        []
    )[-12:]


async def get_university_context(
    message: str
):

    words = (
        message
        .lower()
        .strip()
    )

    query = {
        "status":
        "published"
    }

    if "georgia" in words:
        query["country"] = {
            "$regex":
            "^Georgia$",
            "$options":
            "i"
        }

    elif "uzbekistan" in words:
        query["country"] = {
            "$regex":
            "^Uzbekistan$",
            "$options":
            "i"
        }

    if (
        "mbbs" in words
        or "neet" in words
        or "medical" in words
    ):
        query["stream"] = "MBBS"

    elif (
        "mba" in words
        or "management" in words
        or "business" in words
        or "bba" in words
    ):
        query["stream"] = "Management"

    docs = (
        await db.universities
        .find(
            query,
            {
                "_id": 0
            }
        )
        .limit(8)
        .to_list(8)
    )

    if not docs:
        return ""

    pieces = []

    for u in docs:

        pieces.append(
            f"""
University: {u.get('name')}
Country: {u.get('country')}
City: {u.get('city')}
Stream: {u.get('stream')}
Course: {u.get('course')}
Duration: {u.get('duration')}
Currency: {u.get('currency')}
Tuition/year: {u.get('tuition_fee_year')}
Hostel/year: {u.get('hostel_fee_year')}
Eligibility: {u.get('eligibility')}
NEET requirement: {u.get('neet_requirement')}
Scholarship: {u.get('scholarship_info')}
Overview: {u.get('overview')}
"""
        )

    return "\n".join(
        pieces
    )


@api_router.post(
    "/chat",
    response_model=ChatOut
)
async def chat(
    payload: ChatIn
):

    if not gemini_client:

        raise HTTPException(
            status_code=503,
            detail=(
                "Gemini API is not configured"
            ),
        )

    user_message = (
        payload.message
        or ""
    ).strip()

    if not user_message:

        raise HTTPException(
            status_code=400,
            detail="Message is required",
        )

    try:

        history = await get_chat_history(
            payload.session_id
        )

        university_context = (
            await get_university_context(
                user_message
            )
        )

        prompt = RYC_SYSTEM_PROMPT

        if university_context:

            prompt += """

The following university information comes from the
Route Your Career database.

Use it when relevant.

Do not change or invent exact numbers.

ROUTE YOUR CAREER UNIVERSITY DATA:
"""

            prompt += university_context

        prompt += "\n\nConversation:\n"

        for item in history:

            role = item.get(
                "role"
            )

            content = item.get(
                "content"
            )

            if not content:
                continue

            if role == "user":
                prompt += (
                    "\nStudent: "
                    + str(content)
                )

            elif role == "assistant":
                prompt += (
                    "\nAssistant: "
                    + str(content)
                )

        prompt += (
            "\nStudent: "
            + user_message
            + "\nAssistant:"
        )

        response = await gemini_client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )

        reply = (
            response.text
            or ""
        ).strip()

        if not reply:

            reply = (
                "I couldn't generate a useful answer "
                "just now. Please try asking again."
            )

        now = datetime.now(
            timezone.utc
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

                    "updated_at":
                    now,
                },

                "$setOnInsert": {
                    "created_at":
                    now,
                },

                "$push": {
                    "messages": {
                        "$each": [
                            {
                                "role":
                                "user",

                                "content":
                                user_message,

                                "created_at":
                                now,
                            },
                            {
                                "role":
                                "assistant",

                                "content":
                                reply,

                                "created_at":
                                now,
                            },
                        ],

                        "$slice":
                        -30,
                    }
                },
            },

            upsert=True,
        )

        return ChatOut(
            session_id=
            payload.session_id,

            reply=
            reply,
        )

    except Exception as exc:

        logging.exception(
            "Gemini AI chat error: %s",
            exc
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "AI assistant temporarily unavailable"
            ),
        )


# =========================================================
# CHAT LEAD CAPTURE
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

    doc = lead.model_dump()

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
# PUBLIC BLOGS
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
        Blog(**doc)
        for doc in docs
    ]


@api_router.get(
    "/blogs/{slug}",
    response_model=Blog
)
async def public_blog(
    slug: str
):

    doc = await db.blogs.find_one(
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

    if not doc:

        raise HTTPException(
            status_code=404,
            detail="Blog not found",
        )

    return Blog(
        **doc
    )


# =========================================================
# PUBLIC UNIVERSITIES
# =========================================================


@api_router.get(
    "/universities",
    response_model=List[University]
)
async def public_universities(
    stream: Optional[str] = None,
    country: Optional[str] = None,
    featured: Optional[bool] = None,
    popular: Optional[bool] = None,
    recommended: Optional[bool] = None,
    budget_option: Optional[bool] = None,
    q: Optional[str] = None,
):

    query = {
        "status":
        "published"
    }

    if stream:

        query["stream"] = {
            "$regex":
            f"^{re.escape(stream)}$",
            "$options":
            "i"
        }

    if country:

        query["country"] = {
            "$regex":
            f"^{re.escape(country)}$",
            "$options":
            "i"
        }

    if featured is not None:
        query["featured"] = featured

    if popular is not None:
        query["popular"] = popular

    if recommended is not None:
        query["recommended"] = recommended

    if budget_option is not None:
        query["budget_option"] = budget_option

    if q:

        search = re.escape(
            q.strip()
        )

        query["$or"] = [
            {
                "name": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "country": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "city": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "course": {
                    "$regex": search,
                    "$options": "i"
                }
            },
        ]

    docs = (
        await db.universities
        .find(
            query,
            {
                "_id": 0
            }
        )
        .sort(
            [
                ("featured", -1),
                ("recommended", -1),
                ("name", 1),
            ]
        )
        .to_list(1000)
    )

    return [
        University(**doc)
        for doc in docs
    ]


@api_router.get(
    "/universities/{slug}",
    response_model=University
)
async def public_university(
    slug: str
):

    doc = await db.universities.find_one(
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

    if not doc:

        raise HTTPException(
            status_code=404,
            detail="University not found",
        )

    return University(
        **doc
    )



# =========================================================
# V2 PUBLIC COURSES
# =========================================================


@api_router.get(
    "/courses",
    response_model=List[Course]
)
async def public_courses(
    stream: Optional[str] = None,
    country: Optional[str] = None,
    university_id: Optional[str] = None,
    level: Optional[str] = None,
    featured: Optional[bool] = None,
    recommended: Optional[bool] = None,
    budget_option: Optional[bool] = None,
    q: Optional[str] = None,
):

    query = {
        "status":
        "published"
    }

    if stream:
        query["stream"] = {
            "$regex":
            f"^{re.escape(stream)}$",
            "$options":
            "i"
        }

    if country:
        query["country"] = {
            "$regex":
            f"^{re.escape(country)}$",
            "$options":
            "i"
        }

    if university_id:
        query["university_id"] = university_id

    if level:
        query["level"] = {
            "$regex":
            f"^{re.escape(level)}$",
            "$options":
            "i"
        }

    if featured is not None:
        query["featured"] = featured

    if recommended is not None:
        query["recommended"] = recommended

    if budget_option is not None:
        query["budget_option"] = budget_option

    if q:
        search = re.escape(
            q.strip()
        )

        query["$or"] = [
            {
                "name": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "university_name": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "country": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "city": {
                    "$regex": search,
                    "$options": "i"
                }
            },
        ]

    docs = (
        await db.courses
        .find(
            query,
            {
                "_id": 0
            }
        )
        .sort(
            [
                ("featured", -1),
                ("recommended", -1),
                ("university_name", 1),
                ("name", 1),
            ]
        )
        .to_list(5000)
    )

    return [
        Course(**doc)
        for doc in docs
    ]


@api_router.get(
    "/courses/{slug}",
    response_model=Course
)
async def public_course(
    slug: str
):

    doc = await db.courses.find_one(
        {
            "slug": slug,
            "status": "published",
        },
        {
            "_id": 0
        },
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    return Course(**doc)




# =========================================================
# PUBLIC LIVE CURRENCY
# =========================================================


@api_router.get(
    "/currency/rates"
)
async def public_currency_rates():

    fx = await get_live_fx_rates()

    return {
        "ok":
        True,

        "base":
        "USD",

        "rates":
        fx["rates"],

        "provider":
        fx.get(
            "provider"
        ),

        "updated_at":
        fx.get(
            "fetched_at"
        ),

        "cached":
        bool(
            fx.get(
                "cached"
            )
        ),
    }


@api_router.get(
    "/currency/convert"
)
async def public_currency_convert(
    amount: float,
    from_currency: str,
    to_currency: str,
):

    source = (
        from_currency
        .upper()
        .strip()
    )

    target = (
        to_currency
        .upper()
        .strip()
    )

    if (
        source
        not in FX_SUPPORTED_CURRENCIES
        or target
        not in FX_SUPPORTED_CURRENCIES
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported currency. Supported: "
                + ", ".join(
                    FX_SUPPORTED_CURRENCIES
                )
            ),
        )

    fx = await get_live_fx_rates()

    converted = (
        convert_currency(
            amount,
            source,
            target,
            fx["rates"],
        )
    )

    if converted is None:

        raise HTTPException(
            status_code=503,
            detail="Currency conversion unavailable",
        )

    return {
        "ok":
        True,

        "amount":
        amount,

        "from":
        source,

        "to":
        target,

        "converted":
        converted,

        "provider":
        fx.get(
            "provider"
        ),

        "updated_at":
        fx.get(
            "fetched_at"
        ),
    }


# =========================================================
# PRE-APPLICATION / APPLICATION SESSION
# =========================================================


@api_router.post(
    "/applications/start",
    response_model=PreApplicationResponse
)
async def start_application(
    payload: PreApplicationCreate,
    background: BackgroundTasks,
):

    name = payload.name.strip()
    phone = payload.phone.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required",
        )

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number is required",
        )

    now = datetime.now(
        timezone.utc
    )

    # Public/session identifier that can later become the base
    # for Track Application without exposing Mongo internals.
    application_id = (
        "RYC-"
        + now.strftime("%Y%m%d")
        + "-"
        + uuid.uuid4().hex[:8].upper()
    )

    lead_id = str(
        uuid.uuid4()
    )

    preferred_country = (
        payload.preferred_country.strip()
        if payload.preferred_country
        else None
    )

    message_parts = [
        "Application started before Build My Route",
        f"Track: {payload.stream}",
    ]

    if preferred_country:
        message_parts.append(
            f"Preferred country: {preferred_country}"
        )

    if payload.state:
        message_parts.append(
            f"State: {payload.state.strip()}"
        )

    if payload.preferred_contact:
        message_parts.append(
            f"Preferred contact: {payload.preferred_contact}"
        )

    doc = {
        "id":
        lead_id,

        "application_id":
        application_id,

        "name":
        name,

        "phone":
        phone,

        "email":
        (
            payload.email.strip()
            if payload.email
            else None
        ),

        "country":
        preferred_country,

        "neet_score":
        None,

        "message":
        " | ".join(message_parts),

        "source":
        "start_application",

        "type":
        "pre_application",

        "created_at":
        now,

        "updated_at":
        now,

        "state":
        (
            payload.state.strip()
            if payload.state
            else None
        ),

        "preferred_contact":
        payload.preferred_contact,

        "stream":
        payload.stream,

        "preferred_country":
        preferred_country,

        # Admissions journey fields.
        "lead_status":
        "new",

        "application_status":
        "started",

        "journey_stage":
        "contact_captured",

        "route_profile":
        None,

        "selected_route":
        None,

        "shortlisted_routes":
        [],

        "route_started_at":
        None,

        "route_completed_at":
        None,

        "selected_at":
        None,
    }

    await db.leads.insert_one(
        doc
    )

    background.add_task(
        notify_new_lead,
        {
            "id":
            lead_id,

            "name":
            name,

            "phone":
            phone,

            "email":
            doc["email"],

            "country":
            preferred_country,

            "neet_score":
            None,

            "message":
            doc["message"],

            "source":
            "start_application",

            "type":
            "pre_application",

            "created_at":
            now.isoformat(),
        },
    )

    return PreApplicationResponse(
        ok=True,
        application_id=application_id,
        lead_id=lead_id,
        status="started",
        message=(
            "Application started successfully. "
            "Continue to Build My Route."
        ),
    )


@api_router.patch(
    "/applications/{application_id}/route-profile",
    response_model=ApplicationRouteProfileResponse
)
async def update_application_route_profile(
    application_id: str,
    payload: ApplicationRouteProfileUpdate,
):

    existing = await db.leads.find_one(
        {
            "application_id":
            application_id
        },
        {
            "_id": 0
        },
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    now = datetime.now(
        timezone.utc
    )

    route_profile = {
        "stream":
        payload.stream,

        "preferred_countries":
        payload.preferred_countries,

        "budget_total":
        payload.budget_total,

        "budget_currency":
        payload.budget_currency,

        "intake":
        payload.intake,

        "neet_status":
        payload.neet_status,

        "neet_score":
        payload.neet_score,

        "pcb_percentage":
        payload.pcb_percentage,

        "desired_level":
        payload.desired_level,

        "academic_percentage":
        payload.academic_percentage,

        "english_test":
        payload.english_test,

        "ielts_score":
        payload.ielts_score,

        "work_experience_years":
        payload.work_experience_years,
    }

    update_doc = {
        "route_profile":
        route_profile,

        "shortlisted_routes":
        payload.shortlisted_routes[:3],

        "journey_stage":
        "route_built",

        "application_status":
        "route_built",

        "route_completed_at":
        now,

        "updated_at":
        now,
    }

    # Keep useful top-level fields aligned with the current
    # admin Leads UI for backward compatibility.
    if payload.neet_score is not None:
        update_doc["neet_score"] = str(
            payload.neet_score
        )

    if payload.preferred_countries:
        update_doc["country"] = (
            payload.preferred_countries[0]
        )

    await db.leads.update_one(
        {
            "application_id":
            application_id
        },
        {
            "$set":
            update_doc
        },
    )

    return ApplicationRouteProfileResponse(
        ok=True,
        application_id=application_id,
        message=(
            "Build My Route profile attached "
            "to the existing application."
        ),
    )




# =========================================================
# APPLICATION DOCUMENT CHECKLIST
# =========================================================

MBBS_DOCUMENTS = [
    ("passport", "Passport"),
    ("class_10_marksheet", "10th Marksheet"),
    ("class_12_marksheet", "12th Marksheet"),
    ("neet_result", "NEET Result / Scorecard"),
    ("passport_photo", "Passport-size Photograph"),
    ("birth_certificate", "Birth Certificate"),
]

MANAGEMENT_DOCUMENTS = [
    ("passport", "Passport"),
    ("academic_transcripts", "Academic Transcripts"),
    ("degree_certificate", "Degree / Provisional Certificate"),
    ("english_test", "English Language Test Result"),
    ("cv", "CV / Resume"),
    ("sop", "Statement of Purpose"),
    ("work_experience", "Work Experience Documents"),
]

OTHER_DOCUMENTS = [
    ("passport", "Passport"),
    ("academic_documents", "Academic Documents"),
    ("passport_photo", "Passport-size Photograph"),
]


def _default_application_documents(
    stream: Optional[str]
):

    normalized = str(
        stream or ""
    ).strip().lower()

    if normalized == "mbbs":
        source = MBBS_DOCUMENTS

    elif normalized == "management":
        source = MANAGEMENT_DOCUMENTS

    else:
        source = OTHER_DOCUMENTS

    return [
        {
            "key": key,
            "label": label,
            "status": "pending",
            "note": None,
            "updated_at": None,
        }
        for key, label in source
    ]


async def _ensure_application_documents(
    application_id: str,
):

    doc = await db.leads.find_one(
        {
            "application_id":
            application_id
        },
        {
            "_id": 0,
            "stream": 1,
            "documents": 1,
        },
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    documents = doc.get(
        "documents"
    )

    if isinstance(
        documents,
        list
    ) and documents:
        return documents

    documents = (
        _default_application_documents(
            doc.get("stream")
        )
    )

    now = datetime.now(
        timezone.utc
    )

    await db.leads.update_one(
        {
            "application_id":
            application_id
        },
        {
            "$set": {
                "documents":
                documents,

                "documents_initialized_at":
                now,

                "updated_at":
                now,
            }
        },
    )

    return documents


def _document_summary(
    documents: list
):

    counts = {
        "total": len(documents),
        "pending": 0,
        "received": 0,
        "verified": 0,
        "rejected": 0,
    }

    for item in documents:

        status = str(
            item.get(
                "status",
                "pending"
            )
        ).strip().lower()

        if status in counts:
            counts[status] += 1

    counts["submitted"] = (
        counts["received"]
        + counts["verified"]
    )

    return counts


@api_router.get(
    "/admin/applications/{application_id}/documents"
)
async def admin_application_documents(
    application_id: str,
    user: User = Depends(
        require_admin
    ),
):

    normalized_id = (
        application_id
        .strip()
        .upper()
    )

    documents = (
        await _ensure_application_documents(
            normalized_id
        )
    )

    return {
        "ok": True,
        "application_id":
        normalized_id,
        "documents":
        documents,
        "summary":
        _document_summary(
            documents
        ),
    }


@api_router.patch(
    "/admin/applications/{application_id}/documents/{document_key}"
)
async def admin_update_application_document(
    application_id: str,
    document_key: str,
    payload: ApplicationDocumentStatusUpdate,
    user: User = Depends(
        require_admin
    ),
):

    normalized_id = (
        application_id
        .strip()
        .upper()
    )

    documents = (
        await _ensure_application_documents(
            normalized_id
        )
    )

    target_index = None

    for index, item in enumerate(
        documents
    ):

        if (
            str(
                item.get("key", "")
            ).strip().lower()
            ==
            document_key.strip().lower()
        ):
            target_index = index
            break

    if target_index is None:

        raise HTTPException(
            status_code=404,
            detail="Document item not found",
        )

    now = datetime.now(
        timezone.utc
    )

    documents[target_index][
        "status"
    ] = payload.status

    documents[target_index][
        "note"
    ] = (
        payload.note.strip()
        if payload.note
        else None
    )

    documents[target_index][
        "updated_at"
    ] = now

    summary = (
        _document_summary(
            documents
        )
    )

    update_fields = {
        "documents":
        documents,

        "document_summary":
        summary,

        "updated_at":
        now,
    }

    # Enter the Documents journey stage once an admin records
    # the first meaningful document action. Do not move an
    # application backwards if it is already beyond Documents.
    current = await db.leads.find_one(
        {
            "application_id":
            normalized_id
        },
        {
            "_id": 0,
            "application_status": 1,
        },
    )

    stage_order = [
        "started",
        "route_built",
        "university_selected",
        "contacted",
        "documents",
        "applied",
        "offer_received",
        "visa",
        "enrolled",
    ]

    current_stage = str(
        (current or {}).get(
            "application_status",
            "started"
        )
    ).strip().lower()

    aliases = {
        "contact_captured": "started",
        "selected": "university_selected",
    }

    current_stage = aliases.get(
        current_stage,
        current_stage
    )

    if (
        payload.status
        != "pending"
        and (
            current_stage not in stage_order
            or stage_order.index(
                current_stage
            )
            < stage_order.index(
                "documents"
            )
        )
    ):
        update_fields[
            "application_status"
        ] = "documents"

        update_fields[
            "journey_stage"
        ] = "documents"

        update_fields[
            "documents_at"
        ] = now

    await db.leads.update_one(
        {
            "application_id":
            normalized_id
        },
        {
            "$set":
            update_fields
        },
    )

    return {
        "ok": True,
        "application_id":
        normalized_id,
        "document":
        documents[
            target_index
        ],
        "documents":
        documents,
        "summary":
        summary,
        "message":
        "Document status updated.",
    }


# =========================================================
# PUBLIC APPLICATION TRACKING
# =========================================================

TRACKING_STAGES = [
    ("started", "Application Started"),
    ("route_built", "Route Built"),
    ("university_selected", "University Selected"),
    ("contacted", "Contacted"),
    ("documents", "Documents"),
    ("applied", "Applied"),
    ("offer_received", "Offer Received"),
    ("visa", "Visa"),
    ("enrolled", "Enrolled"),
]


def _public_application_stage(doc: dict) -> str:

    stage = (
        doc.get("application_status")
        or doc.get("journey_stage")
        or "started"
    )

    aliases = {
        "contact_captured": "started",
        "selected": "university_selected",
        "university selected": "university_selected",
        "route built": "route_built",
        "offer received": "offer_received",
    }

    stage = str(stage).strip().lower()

    stage = aliases.get(
        stage,
        stage,
    )

    valid = {
        item[0]
        for item in TRACKING_STAGES
    }

    if stage not in valid:
        return "started"

    return stage


def _tracking_timeline(
    doc: dict,
    current_stage: str,
):

    stage_keys = [
        item[0]
        for item in TRACKING_STAGES
    ]

    try:
        current_index = stage_keys.index(
            current_stage
        )
    except ValueError:
        current_index = 0

    timestamp_fields = {
        "started":
        "created_at",

        "route_built":
        "route_completed_at",

        "university_selected":
        "selected_at",

        "contacted":
        "contacted_at",

        "documents":
        "documents_at",

        "applied":
        "applied_at",

        "offer_received":
        "offer_received_at",

        "visa":
        "visa_at",

        "enrolled":
        "enrolled_at",
    }

    timeline = []

    for index, (
        key,
        label,
    ) in enumerate(
        TRACKING_STAGES
    ):

        if index < current_index:
            status = "completed"

        elif index == current_index:
            status = "current"

        else:
            status = "upcoming"

        timeline.append(
            {
                "key":
                key,

                "label":
                label,

                "status":
                status,

                "completed":
                index < current_index,

                "current":
                index == current_index,

                "date":
                doc.get(
                    timestamp_fields.get(
                        key
                    )
                ),
            }
        )

    return timeline


@api_router.get(
    "/applications/{application_id}/track"
)
async def public_track_application(
    application_id: str
):

    normalized_id = (
        application_id
        .strip()
        .upper()
    )

    if not normalized_id:

        raise HTTPException(
            status_code=400,
            detail="Application ID is required",
        )

    doc = await db.leads.find_one(
        {
            "application_id":
            normalized_id
        },
        {
            "_id": 0,

            "application_id": 1,
            "name": 1,
            "stream": 1,
            "country": 1,
            "application_status": 1,
            "journey_stage": 1,
            "created_at": 1,
            "updated_at": 1,

            "route_completed_at": 1,
            "selected_at": 1,
            "contacted_at": 1,
            "documents_at": 1,
            "applied_at": 1,
            "offer_received_at": 1,
            "visa_at": 1,
            "enrolled_at": 1,

            "selected_route": 1,
            "documents": 1,
            "document_summary": 1,
        },
    )

    if not doc:

        raise HTTPException(
            status_code=404,
            detail=(
                "Application not found. "
                "Please check your Route Your Career "
                "application ID and try again."
            ),
        )

    stage = _public_application_stage(
        doc
    )

    selected_route = (
        doc.get(
            "selected_route"
        )
        or {}
    )

    # Intentionally return a restricted public payload.
    # Phone, email, internal message, lead status, admin
    # fields, route profile and shortlisted routes are not
    # exposed by this endpoint.
    return {
        "ok":
        True,

        "application_id":
        doc.get(
            "application_id"
        ),

        "student_name":
        doc.get(
            "name"
        ),

        "stream":
        doc.get(
            "stream"
        ),

        "stage":
        stage,

        "stage_label":
        dict(
            TRACKING_STAGES
        ).get(
            stage,
            "Application Started",
        ),

        "selected_route": {
            "university_name":
            selected_route.get(
                "university_name"
            ),

            "course_name":
            selected_route.get(
                "course_name"
            ),

            "country":
            selected_route.get(
                "country"
            ),

            "city":
            selected_route.get(
                "city"
            ),
        },

        "created_at":
        doc.get(
            "created_at"
        ),

        "updated_at":
        doc.get(
            "updated_at"
        ),

        # Public tracking exposes counts only, never admin
        # notes or document contents.
        "document_progress":
        _document_summary(
            doc.get("documents")
            or []
        ),

        "timeline":
        _tracking_timeline(
            doc,
            stage,
        ),
    }


# =========================================================
# BUILD MY ROUTE
# =========================================================


@api_router.post(
    "/build-my-route",
    response_model=
    BuildMyRouteResponse
)
async def build_my_route(
    payload:
    BuildMyRouteRequest
):

    fx = None

    try:
        fx = await get_live_fx_rates()
    except HTTPException:
        fx = None

    fx_rates = (
        fx.get(
            "rates"
        )
        if fx
        else None
    )

    query = {
        "status":
        "published",

        "stream": {
            "$regex":
            f"^{re.escape(payload.stream)}$",

            "$options":
            "i",
        },
    }

    docs = (
        await db.courses
        .find(
            query,
            {
                "_id": 0
            }
        )
        .to_list(
            5000
        )
    )

    ranked = []

    for course in docs:

        result = (
            _score_route_course(
                course,
                payload,
                fx_rates
            )
        )

        if result is not None:

            ranked.append(
                result
            )

    ranked.sort(
        key=lambda item: (
            item[
                "match_type"
            ]
            == "best_match",

            item[
                "score"
            ],

            item[
                "recommended"
            ],

            item[
                "featured"
            ],
        ),

        reverse=True,
    )

    limited = ranked[
        :payload.max_results
    ]

    return BuildMyRouteResponse(

        stream=
        payload.stream,

        matches_found=
        len(ranked),

        returned=
        len(limited),

        results=[
            BuildMyRouteMatch(
                **item
            )
            for item
            in limited
        ],

        note=(
            "Matches use only published Route Your Career "
            "course records. Intake is not used as a hard "
            "filter. Missing or older information is shown "
            "as needing verification rather than being invented. "
            "When live FX is available, budgets are converted "
            "before comparison."
        ),

        fx_provider=(
            fx.get(
                "provider"
            )
            if fx
            else None
        ),

        fx_updated_at=(
            fx.get(
                "fetched_at"
            )
            if fx
            else None
        ),
    )



# =========================================================
# BUILD MY ROUTE LEAD CAPTURE
# =========================================================


@api_router.post(
    "/build-my-route/lead",
    response_model=BuildRouteLeadResponse
)
async def capture_build_route_lead(
    payload: BuildRouteLeadCreate,
    background: BackgroundTasks,
):

    name = payload.name.strip()
    phone = payload.phone.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required",
        )

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number is required",
        )

    course = await db.courses.find_one(
        {
            "id":
            payload.selected_course_id
        },
        {
            "_id": 0
        },
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Selected course was not found",
        )

    now = datetime.now(
        timezone.utc
    )

    selected_route = {
        "course_id":
        course.get("id"),

        "course_name":
        (
            course.get("name")
            or payload.selected_course_name
        ),

        "course_slug":
        (
            course.get("slug")
            or payload.selected_course_slug
        ),

        "university_id":
        (
            course.get("university_id")
            or payload.selected_university_id
        ),

        "university_name":
        (
            course.get("university_name")
            or payload.selected_university_name
        ),

        "country":
        (
            course.get("country")
            or payload.selected_country
        ),

        "city":
        (
            course.get("city")
            or payload.selected_city
        ),

        "currency":
        (
            course.get("currency")
            or payload.budget_currency
        ),

        "tuition_fee_year":
        course.get("tuition_fee_year"),

        "total_course_cost":
        course.get("total_course_cost"),

        "route_score":
        payload.route_score,

        "match_type":
        payload.match_type,
    }

    route_profile = {
        "stream":
        payload.stream,

        "preferred_countries":
        payload.preferred_countries,

        "budget_total":
        payload.budget_total,

        "budget_currency":
        payload.budget_currency,

        "intake":
        payload.intake,

        "neet_status":
        payload.neet_status,

        "neet_score":
        payload.neet_score,

        "pcb_percentage":
        payload.pcb_percentage,

        "desired_level":
        payload.desired_level,

        "academic_percentage":
        payload.academic_percentage,

        "english_test":
        payload.english_test,

        "ielts_score":
        payload.ielts_score,

        "work_experience_years":
        payload.work_experience_years,
    }

    message_parts = [
        "Build My Route application",
        (
            f"Selected: "
            f"{selected_route['university_name']} — "
            f"{selected_route['course_name']}"
        ),
        (
            f"Destination: "
            f"{selected_route['country']}"
        ),
    ]

    if payload.route_score is not None:
        message_parts.append(
            f"Route score: {payload.route_score}/100"
        )

    if payload.state:
        message_parts.append(
            f"State: {payload.state}"
        )

    if payload.preferred_contact:
        message_parts.append(
            f"Preferred contact: {payload.preferred_contact}"
        )

    # -----------------------------------------------------
    # EXISTING PRE-APPLICATION: UPDATE SAME LEAD
    # -----------------------------------------------------
    if payload.application_id:

        existing = await db.leads.find_one(
            {
                "application_id":
                payload.application_id
            },
            {
                "_id": 0
            },
        )

        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Application not found",
            )

        update_doc = {
            "name":
            name,

            "phone":
            phone,

            "email":
            (
                payload.email.strip()
                if payload.email
                else existing.get("email")
            ),

            "country":
            selected_route["country"],

            "neet_score":
            (
                str(payload.neet_score)
                if payload.neet_score is not None
                else existing.get("neet_score")
            ),

            "message":
            " | ".join(message_parts),

            "source":
            "build_my_route",

            "type":
            "build_route",

            "state":
            (
                payload.state.strip()
                if payload.state
                else existing.get("state")
            ),

            "preferred_contact":
            (
                payload.preferred_contact
                or existing.get(
                    "preferred_contact"
                )
            ),

            "stream":
            payload.stream,

            "route_profile":
            route_profile,

            "selected_route":
            selected_route,

            "shortlisted_routes":
            payload.shortlisted_routes[:3],

            "lead_status":
            existing.get(
                "lead_status",
                "new"
            ),

            "application_status":
            "university_selected",

            "journey_stage":
            "university_selected",

            "route_completed_at":
            (
                existing.get(
                    "route_completed_at"
                )
                or now
            ),

            "selected_at":
            now,

            "updated_at":
            now,
        }

        await db.leads.update_one(
            {
                "application_id":
                payload.application_id
            },
            {
                "$set":
                update_doc
            },
        )

        background.add_task(
            notify_new_lead,
            {
                "id":
                existing["id"],

                "name":
                name,

                "phone":
                phone,

                "email":
                update_doc["email"],

                "country":
                selected_route["country"],

                "neet_score":
                update_doc["neet_score"],

                "message":
                update_doc["message"],

                "source":
                "build_my_route",

                "type":
                "build_route",

                "created_at":
                now.isoformat(),
            },
        )

        return BuildRouteLeadResponse(
            ok=True,
            lead_id=existing["id"],
            message=(
                "Your selected university was attached "
                "to the existing application."
            ),
        )

    # -----------------------------------------------------
    # DIRECT BUILD MY ROUTE: CREATE NEW LEAD
    # -----------------------------------------------------
    lead_id = str(
        uuid.uuid4()
    )

    application_id = (
        "RYC-"
        + now.strftime("%Y%m%d")
        + "-"
        + uuid.uuid4().hex[:8].upper()
    )

    doc = {
        "id":
        lead_id,

        "application_id":
        application_id,

        "name":
        name,

        "phone":
        phone,

        "email":
        (
            payload.email.strip()
            if payload.email
            else None
        ),

        "country":
        selected_route["country"],

        "neet_score":
        (
            str(payload.neet_score)
            if payload.neet_score is not None
            else None
        ),

        "message":
        " | ".join(message_parts),

        "source":
        "build_my_route",

        "type":
        "build_route",

        "created_at":
        now,

        "updated_at":
        now,

        "state":
        (
            payload.state.strip()
            if payload.state
            else None
        ),

        "preferred_contact":
        payload.preferred_contact,

        "stream":
        payload.stream,

        "route_profile":
        route_profile,

        "selected_route":
        selected_route,

        "shortlisted_routes":
        payload.shortlisted_routes[:3],

        "lead_status":
        "new",

        "application_status":
        "university_selected",

        "journey_stage":
        "university_selected",

        "route_completed_at":
        now,

        "selected_at":
        now,
    }

    await db.leads.insert_one(
        doc
    )

    background.add_task(
        notify_new_lead,
        {
            "id":
            lead_id,

            "name":
            name,

            "phone":
            phone,

            "email":
            doc["email"],

            "country":
            selected_route["country"],

            "neet_score":
            doc["neet_score"],

            "message":
            doc["message"],

            "source":
            "build_my_route",

            "type":
            "build_route",

            "created_at":
            now.isoformat(),
        },
    )

    return BuildRouteLeadResponse(
        ok=True,
        lead_id=lead_id,
        message=(
            "Application interest saved successfully. "
            "A Route Your Career counsellor can now follow up."
        ),
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
            detail="GOOGLE_CLIENT_ID is not configured",
        )

    if not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_SECRET is not configured",
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

    email_verified = data.get(
        "email_verified"
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

    user_doc = await db.users.find_one(
        {
            "email":
            email
        },
        {
            "_id": 0
        },
    )

    if user_doc:

        user_id = (
            user_doc["user_id"]
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

        await db.users.insert_one(
            {
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
            }
        )

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

    await db.user_sessions.insert_one(
        {
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
        }
    )

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

    token = request.cookies.get(
        "session_token"
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
    type: Optional[str] = None,
    user: User = Depends(
        require_admin
    ),
):

    query = {}

    if type:
        query["type"] = type

    docs = (
        await db.leads
        .find(query)
        .sort(
            "created_at",
            -1
        )
        .to_list(limit)
    )

    return [
        LeadListItem(
            **_clean_mongo(doc)
        )
        for doc in docs
    ]




# =========================================================
# EMBEDDED RUSSIA FEE DATA + IMPORT HELPERS
# =========================================================
#
# Kept inside server.py so Render startup does not depend on
# importing migrate_russia.py. This avoids deployment failure
# if the standalone migration file is stale.
# =========================================================

RUSSIA_FEE_DATA = [{'name': 'Altai State University',
  'city': 'Barnaul',
  'tuition': [380000, 380000, 380000, 380000, 380000, 380000],
  'currency': 'RUB',
  'hostel': [90000, 90000, 90000, 90000, 90000, 90000],
  'admin_usd': 1200,
  'academic_year': '2026-27',
  'source_document': 'ALTAI STATE UNIVERSITY.pdf'},
 {'name': 'Amur State Medical Academy',
  'city': 'Blagoveshchensk',
  'tuition': [315000, 315000, 315000, 315000, 315000, 315000],
  'currency': 'RUB',
  'hostel': [24000, 24000, 24000, 24000, 24000, 24000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'AMUR STATE MEDICAL UNIVERSITY FEES STRUCTURE.pdf'},
 {'name': 'Astrakhan State Medical University',
  'city': 'Astrakhan',
  'tuition': [5000, 5000, 5000, 5000, 5000, 5000],
  'currency': 'USD',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'Astrakhan State Medical University, RUSSIA.pdf'},
 {'name': 'Bashkir State Medical University',
  'city': 'Ufa',
  'tuition': [405000, 405000, 405000, 405000, 405000, 405000],
  'currency': 'RUB',
  'hostel': [30000, 30000, 30000, 30000, 30000, 30000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'BASHKIR STATE MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Chechen State University',
  'city': 'Grozny',
  'tuition': [325000, 325000, 325000, 325000, 325000, 325000],
  'currency': 'RUB',
  'hostel': [81600, 81600, 81600, 81600, 81600, 81600],
  'admin_usd': 1300,
  'academic_year': '2026-27',
  'source_document': 'CHECHEN STATE UNIVERSITY FEES.pdf'},
 {'name': 'Chita State Medical Academy',
  'city': 'Chita',
  'tuition': [320000, 320000, 320000, 320000, 320000, 320000],
  'currency': 'RUB',
  'hostel': [100000, 100000, 100000, 100000, 100000, 100000],
  'admin_usd': 1200,
  'academic_year': '2026-27',
  'source_document': 'CHITA STATE MEDICAL UNIVERSITY.pdf'},
 {'name': 'Chuvash State University',
  'city': 'Cheboksary',
  'tuition': [300000, 300000, 300000, 300000, 300000, 300000],
  'currency': 'RUB',
  'hostel': [75000, 75000, 75000, 75000, 75000, 75000],
  'admin_usd': 2300,
  'academic_year': '2026-27',
  'source_document': 'CHUVASH STATE MEDICAL UNIVERSITY FEES.pdf'},
 {'name': 'Crimean Federal University',
  'city': 'Simferopol',
  'tuition': [344000, 344000, 344000, 344000, 344000, 344000],
  'currency': 'RUB',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'CRIMEA FEDERAL UNIVERSITY (2).pdf'},
 {'name': 'Dagestan State Medical University',
  'city': 'Makhachkala',
  'tuition': [420000, 420000, 420000, 420000, 420000, 420000],
  'currency': 'RUB',
  'hostel': [25000, 25000, 25000, 25000, 25000, 25000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'DAGESTAN STATE MEDICAL UNIVERSITY (3).pdf'},
 {'name': 'Far Eastern Federal University',
  'city': 'Vladivostok',
  'tuition': [500000, 500000, 500000, 500000, 500000, 500000],
  'currency': 'RUB',
  'hostel': [54000, 54000, 54000, 54000, 54000, 54000],
  'admin_usd': 1300,
  'academic_year': '2026-27',
  'source_document': 'FAR EASTERN FEDERAL UNIVERSITY (2).pdf'},
 {'name': 'I.M. Sechenov First Moscow State Medical University',
  'city': 'Moscow',
  'tuition': [900000, 900000, 900000, 900000, 900000, 900000],
  'currency': 'RUB',
  'hostel': [20000, 20000, 20000, 20000, 20000, 20000],
  'admin_usd': 2000,
  'academic_year': '2024-25',
  'source_document': 'IM SECHENOV 1ST MOSCOW MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Immanuel Kant Baltic Federal University',
  'city': 'Kaliningrad',
  'tuition': [347000, 347000, 347000, 347000, 347000, 347000],
  'currency': 'RUB',
  'hostel': [15000, 15000, 15000, 15000, 15000, 15000],
  'admin_usd': 1700,
  'academic_year': '2026-27',
  'source_document': 'IMMANUEL KANT BALTIC FEDERAL UNIVERSITY (4).pdf'},
 {'name': 'Ingush State University',
  'city': 'Magas',
  'tuition_schedule': [{'year': 1, 'amount': 7000, 'currency': 'USD'},
                       {'year': 2, 'amount': 200000, 'currency': 'RUB'},
                       {'year': 3, 'amount': 200000, 'currency': 'RUB'},
                       {'year': 4, 'amount': 200000, 'currency': 'RUB'},
                       {'year': 5, 'amount': 200000, 'currency': 'RUB'},
                       {'year': 6, 'amount': 200000, 'currency': 'RUB'}],
  'currency': 'MIXED',
  'hostel': None,
  'admin_usd': None,
  'academic_year': '2026-27',
  'source_document': 'INGUSH STATE MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Irkutsk State Medical University',
  'city': 'Irkutsk',
  'tuition': [380000, 380000, 380000, 380000, 380000, 380000],
  'currency': 'RUB',
  'hostel': [20000, 20000, 20000, 20000, 20000, 20000],
  'admin_usd': 1300,
  'academic_year': '2026-27',
  'source_document': 'IRTUSK STATE MEDICAL UNIVERSITY,RUSSIA (3).pdf'},
 {'name': 'Ivanovo State Medical University',
  'city': 'Ivanovo',
  'tuition': [330000, 330000, 330000, 330000, 330000, 330000],
  'currency': 'RUB',
  'hostel': [25000, 25000, 25000, 25000, 25000, 25000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'IVANOVO STATE MEDICAL UNIVERSITY.pdf'},
 {'name': 'Izhevsk State Medical Academy',
  'city': 'Izhevsk',
  'tuition': [4500, 4500, 4500, 4500, 4500, 4500],
  'currency': 'USD',
  'hostel': [500, 500, 500, 500, 500, 500],
  'admin_usd': 5300,
  'academic_year': '2026-27',
  'source_document': 'IZHEVSK STATE MEDICAL ACADEMY.pdf'},
 {'name': 'Kabardino-Balkarian State University',
  'city': 'Nalchik',
  'tuition': [395000, 395000, 395000, 395000, 395000, 395000],
  'currency': 'RUB',
  'hostel': None,
  'hostel_note': '10,000-18,000 RUB/year',
  'admin_usd': 1300,
  'academic_year': '2026-27',
  'source_document': 'kabardino fees structure 2026-2027 (1).pdf'},
 {'name': 'Kalmyk State University',
  'city': 'Elista',
  'tuition': [5000, 3500, 3500, 3500, 3500, 3500],
  'currency': 'USD',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'KALMYK STATE UNIVERSITY ,RUSSIA.pdf'},
 {'name': 'Kazan Federal University',
  'city': 'Kazan',
  'tuition': [653400, 653400, 653400, 653400, 653400, 653400],
  'currency': 'RUB',
  'hostel': [16000, 16000, 16000, 16000, 16000, 16000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'KAZAN FEDERAL UNIVERSITY, RUSSIA (2).pdf'},
 {'name': 'Kazan State Medical University',
  'city': 'Kazan',
  'tuition': [636000, 636000, 636000, 636000, 636000, 636000],
  'currency': 'RUB',
  'hostel': None,
  'admin_usd': 1000,
  'academic_year': '2026-27',
  'source_document': 'KAZAN STATE MEDICAL UNIVERSITY (3).pdf'},
 {'name': 'Kemerovo State Medical University',
  'city': 'Kemerovo',
  'tuition': [335000, 335000, 335000, 335000, 335000, 335000],
  'currency': 'RUB',
  'hostel': None,
  'admin_usd': 1300,
  'academic_year': '2026-27',
  'source_document': 'KEMEROVO STATE MEDICAL UNIVERSITY.pdf'},
 {'name': 'Kemerovo State University',
  'city': 'Kemerovo',
  'tuition': [299000, 299000, 299000, 299000, 299000, 299000],
  'currency': 'RUB',
  'hostel': [37500, 37500, 37500, 37500, 37500, 37500],
  'admin_usd': 2000,
  'academic_year': '2026-27',
  'source_document': 'KEMEROVO STATE UNIVERSITY 1.pdf'},
 {'name': 'Kirov State Medical University',
  'city': 'Kirov',
  'tuition': [360000, 360000, 360000, 360000, 360000, 360000],
  'currency': 'RUB',
  'hostel': [85000, 70000, 70000, 70000, 70000, 70000],
  'admin_usd': 1400,
  'academic_year': '2026-27',
  'source_document': 'KIROV STATE MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Krasnoyarsk State Medical University',
  'city': 'Krasnoyarsk',
  'tuition': [440000, 440000, 440000, 440000, 440000, 440000],
  'currency': 'RUB',
  'hostel': [12000, 12000, 12000, 12000, 12000, 12000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'KRASNOYARSK STATE MEDICAL UNIVERSITY.pdf'},
 {'name': 'Kuban State Medical University',
  'city': 'Krasnodar',
  'tuition': [510000, 510000, 510000, 510000, 510000, 510000],
  'currency': 'RUB',
  'hostel': [20000, 20000, 20000, 20000, 20000, 20000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'KUBAN STATE MEDICAL UNIVERSITY (5).pdf'},
 {'name': 'Kursk State Medical University',
  'city': 'Kursk',
  'tuition': [6900, 6900, 6900, 6900, 6900, 6900],
  'currency': 'USD',
  'hostel': None,
  'admin_usd': None,
  'academic_year': '2026-27',
  'source_document': 'KURSK STATE MEDICAL UNIVERSITY.pdf'},
 {'name': 'Maikop State Technological University',
  'city': 'Maykop',
  'tuition': [340000, 340000, 340000, 340000, 340000, 340000],
  'currency': 'RUB',
  'hostel': [16000, 16000, 16000, 16000, 16000, 70000],
  'admin_usd': 1000,
  'academic_year': '2025-26',
  'source_document': 'MAIKOP STATE MEDICAL UNIVERSITY (3).pdf'},
 {'name': 'Mari State University',
  'city': 'Yoshkar-Ola',
  'tuition': [6500, 5500, 5500, 5500, 5500, 5500],
  'currency': 'USD',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'MARI STATE UNIVERSITY.pdf'},
 {'name': 'N.I. Lobachevsky State University of Nizhny Novgorod',
  'city': 'Nizhny Novgorod',
  'tuition': [410000, 410000, 410000, 410000, 410000, 410000],
  'currency': 'RUB',
  'hostel': None,
  'admin_usd': None,
  'academic_year': '2025-26',
  'source_document': 'N. I. LOBACHEVSKY STATE UNIVERSITY OF NIZHNY NOVGOROD,RUSSIA.pdf'},
 {'name': 'National Research Ogarev Mordovia State University',
  'city': 'Saransk',
  'tuition': [426000, 426000, 426000, 426000, 426000, 426000],
  'currency': 'RUB',
  'hostel': [75000, 40000, 40000, 40000, 40000, 40000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'N.P. Ogarev Mordovia State UNIVERSITY.pdf'},
 {'name': 'National Research Nuclear University MEPhI - Moscow',
  'city': 'Moscow',
  'tuition': [760000, 760000, 760000, 760000, 760000, 760000],
  'currency': 'RUB',
  'hostel': [18000, 18000, 18000, 18000, 18000, 18000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'NATIONAL RESEARCH NUCLEAR UNIVERSITY MEPHI MOSCOW, RUSSIA.pdf'},
 {'name': 'National Research Nuclear University MEPhI - Obninsk',
  'city': 'Obninsk',
  'tuition': [544000, 544000, 544000, 544000, 544000, 544000],
  'currency': 'RUB',
  'hostel': [12000, 12000, 12000, 12000, 12000, 12000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'NATIONAL RESEARCH NUCLEAR UNIVERSITYMEPHI OBNINSHK.pdf'},
 {'name': 'North Caucasian State Academy',
  'city': 'Cherkessk',
  'tuition': [350000, 350000, 350000, 350000, 350000, 350000],
  'currency': 'RUB',
  'hostel': [30000, 20000, 20000, 20000, 20000, 20000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'NORTH CAUCASIAN STATE ACADEMY 2026-27 FEES STRUCTURE.pdf'},
 {'name': 'North Caucasus Federal University',
  'city': 'Stavropol',
  'tuition': [320000, 320000, 320000, 320000, 320000, 320000],
  'currency': 'RUB',
  'hostel': None,
  'hostel_note': '25,000-42,000 RUB/year',
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'NORTH CAUCASUS FEDERAL UNIVERSITY.pdf'},
 {'name': 'North Ossetian State Medical Academy',
  'city': 'Vladikavkaz',
  'tuition': [360000, 360000, 360000, 360000, 360000, 360000],
  'currency': 'RUB',
  'hostel': [48000, 48000, 48000, 48000, 48000, 48000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'NORTH OSSETIAN STATE MEDICAL UNIVERSITY.pdf'},
 {'name': 'North-Western State Medical University',
  'city': 'Saint Petersburg',
  'tuition': [580000, 580000, 580000, 580000, 580000, 580000],
  'currency': 'RUB',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'NORTH WESTERN STATE MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Northern State Medical University',
  'city': 'Arkhangelsk',
  'tuition': [350000, 350000, 350000, 350000, 350000, 350000],
  'currency': 'RUB',
  'hostel': [25000, 25000, 25000, 25000, 25000, 25000],
  'admin_usd': 1000,
  'academic_year': '2026-27',
  'source_document': 'NORTHERN STATE MEDCIAL UNIVERSITY (2) (1).pdf'},
 {'name': 'Novosibirsk State University',
  'city': 'Novosibirsk',
  'tuition': [6500, 6500, 6500, 6500, 6500, 6500],
  'currency': 'USD',
  'hostel': [200, 200, 200, 200, 200, 200],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'NOVOSIBIRSK STATE UNIVERSITY 2026-27 FEES STRUCTURE.pdf'},
 {'name': 'Omsk State Medical University',
  'city': 'Omsk',
  'tuition': [303000, 303000, 303000, 303000, 303000, 303000],
  'currency': 'RUB',
  'hostel': [120000, 120000, 120000, 120000, 120000, 120000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'OMSK STATE MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Orel State University',
  'city': 'Oryol',
  'tuition': [325100, 325100, 325100, 325100, 325100, 325100],
  'currency': 'RUB',
  'hostel': [70000, 70000, 70000, 70000, 70000, 70000],
  'admin_usd': 1200,
  'academic_year': '2025-26',
  'source_document': 'OREL STATE UNIVERSITY (2).pdf'},
 {'name': 'Orenburg State Medical University',
  'city': 'Orenburg',
  'tuition': [6500, 6500, 6500, 6500, 6500, 6500],
  'currency': 'USD',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'ORENBURG STATE MEDCIAL UNIVERSITY.pdf'},
 {'name': 'Perm State Medical University',
  'city': 'Perm',
  'tuition': [6500, 6500, 6500, 6500, 6500, 6500],
  'currency': 'USD',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'PERM STATE MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Saint Petersburg State Pediatric Medical University',
  'city': 'Saint Petersburg',
  'tuition': [350000, 350000, 350000, 350000, 350000, 350000],
  'currency': 'RUB',
  'hostel': [60000, 60000, 60000, 60000, 60000, 60000],
  'admin_usd': 1500,
  'academic_year': '2024-25',
  'source_document': 'PETERSBURG STATE PEDIATRIC MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Petrozavodsk State University',
  'city': 'Petrozavodsk',
  'tuition': [344000, 344000, 344000, 344000, 344000, 344000],
  'currency': 'RUB',
  'hostel': [20000, 20000, 20000, 20000, 20000, 20000],
  'admin_usd': None,
  'academic_year': '2026-27',
  'source_document': 'PETROZAVODSK STATE MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Pitirim Sorokin Syktyvkar State University',
  'city': 'Syktyvkar',
  'tuition': [300150, 300150, 300150, 300150, 300150, 300150],
  'currency': 'RUB',
  'hostel': [15000, 15000, 15000, 15000, 15000, 15000],
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'PITIRIM SOROKIN SYKTYVKAR STATE UNIVERSITY.pdf'},
 {'name': 'Privolzhsky Research Medical University',
  'city': 'Nizhny Novgorod',
  'tuition': [470000, 470000, 470000, 470000, 470000, 470000],
  'currency': 'RUB',
  'hostel': None,
  'admin_usd': 1400,
  'academic_year': '2026-27',
  'source_document': 'PRIVOLZHSKY RESEARCH MEDICAL UNIVERSITY (2).pdf'},
 {'name': 'Pskov State University',
  'city': 'Pskov',
  'tuition': [4500, 4500, 4500, 4500, 4500, 4500],
  'currency': 'USD',
  'hostel': None,
  'admin_usd': 1500,
  'academic_year': '2026-27',
  'source_document': 'PSKOV STATE UNIVERSITY (5).pdf'},
 {'name': 'Rostov State Medical University',
  'city': 'Rostov-on-Don',
  'tuition': [375000, 375000, 375000, 375000, 375000, 375000],
  'currency': 'RUB',
  'hostel': [35000, 35000, 35000, 35000, 35000, 35000],
  'admin_usd': None,
  'academic_year': '2026-27',
  'source_document': 'ROSTOV STATE MEDICAL UNIVERSITY (3).pdf'},
 {'name': 'Ryazan State Medical University',
  'city': 'Ryazan',
  'tuition': [414000, 360520, 349440, 358590, 358590, 358590],
  'currency': 'RUB',
  'hostel': [20000, 20000, 20000, 20000, 20000, 20000],
  'admin_usd': 1800,
  'academic_year': '2025-26',
  'source_document': 'RYAZAN STATE MEDICAL UNIVERSITY.pdf'}]

RUSSIA_FEE_ALIASES = {'Altai State University': ['Altai State Medical University'],
 'Amur State Medical Academy': ['Amur State Medical University'],
 'Chita State Medical Academy': ['Chita State Medical University'],
 'Chuvash State University': ['Chuvash State Medical University'],
 'Ingush State University': ['Ingush State Medical University'],
 'North Ossetian State Medical Academy': ['North Ossetian State Medical University'],
 'North-Western State Medical University': ['North Western State Medical University'],
 'Petrozavodsk State University': ['Petrozavodsk State Medical University'],
 'I.M. Sechenov First Moscow State Medical University': ['IM Sechenov 1st Moscow Medical University',
                                                         'Sechenov University'],
 'National Research Ogarev Mordovia State University': ['N.P. Ogarev Mordovia State University']}


def slugify(value):
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def russia_name_candidates(name):
    return [name] + RUSSIA_FEE_ALIASES.get(name, [])


def can_auto_publish_russia_fee(record):
    return (
        record.get("academic_year") == "2026-27"
        and record.get("currency") in {"RUB", "USD"}
        and isinstance(record.get("tuition"), list)
        and len(record.get("tuition")) == 6
    )


def russia_total_if_single_currency(record):
    tuition = record.get("tuition")
    currency = record.get("currency")

    if (
        currency not in {"RUB", "USD", "EUR", "GBP", "AUD", "INR"}
        or not isinstance(tuition, list)
        or len(tuition) != 6
    ):
        return None

    return float(sum(tuition))


def russia_hostel_year_one(record):
    hostel = record.get("hostel")

    if isinstance(hostel, list) and hostel:
        return float(hostel[0])

    return None


def russia_university_defaults(record):
    now = datetime.now(timezone.utc)
    name = record["name"]
    published = can_auto_publish_russia_fee(record)

    return {
        "id": str(uuid.uuid4()),
        "stream": "MBBS",
        "name": name,
        "slug": slugify(name),
        "country": "Russia",
        "city": record.get("city"),

        "course": "MBBS",
        "course_level": "Medical",
        "duration": "6 years",
        "medium": "English",
        "intake": None,
        "application_deadline": None,

        "currency": (
            record.get("currency")
            if record.get("currency") != "MIXED"
            else "USD"
        ),
        "tuition_fee_year": (
            float(record["tuition"][0])
            if isinstance(record.get("tuition"), list)
            and record.get("tuition")
            else None
        ),
        "hostel_fee_year": russia_hostel_year_one(record),
        "food_fee_year": None,
        "first_year_total": None,
        "total_course_cost": russia_total_if_single_currency(record),
        "application_fee": None,
        "scholarship_info": None,

        "eligibility":
            "Physics, Chemistry and Biology in Class XII; university-specific requirements apply.",
        "neet_requirement":
            "Required for Indian students subject to applicable regulations.",
        "pcb_requirement":
            "University-specific requirement.",
        "internship": None,
        "recognition": None,
        "nmc_notes":
            "Students should verify the programme against the Foreign Medical Graduate requirements applicable to their admission year.",
        "fmge_next_notes": None,

        "academic_requirement": None,
        "english_requirement": None,
        "ielts_requirement": None,
        "toefl_requirement": None,
        "gmat_gre_requirement": None,
        "work_experience": None,

        "specializations": [],
        "internship_opportunities": None,
        "placement_info": None,
        "post_study_opportunities": None,

        "overview":
            f"General Medicine option in {record.get('city') or 'Russia'}. Fee data currently uses the RYC-supplied {record.get('academic_year') or 'fee'} sheet.",
        "accreditation": None,
        "ranking": None,
        "established_year": None,
        "campus": None,

        "hostel": (
            record.get("hostel_note")
            or (
                f"Approx. {russia_hostel_year_one(record):,.0f} {record.get('currency')} / year in the supplied fee sheet."
                if russia_hostel_year_one(record) is not None
                else None
            )
        ),
        "indian_food": None,
        "student_life": None,
        "climate": None,
        "airport_distance": None,

        "pros": [],
        "cons": [],
        "documents_required": [],
        "admission_process": [],
        "faqs": [],

        "website": None,
        "apply_link": None,

        "featured": False,
        "popular": False,
        "budget_option": False,
        "recommended": False,

        "status": "published" if published else "draft",

        "seo_title": f"{name} | MBBS in Russia",
        "meta_description":
            f"Explore General Medicine at {name}, Russia, including tuition and admission guidance.",
        "keywords": ["MBBS Russia", name, "General Medicine Russia"],

        # Extra fee-audit fields. MongoDB safely stores these
        # even if older frontend models do not display them yet.
        "fee_academic_year": record.get("academic_year"),
        "tuition_schedule": record.get("tuition"),
        "tuition_schedule_currency": record.get("currency"),
        "hostel_schedule": record.get("hostel"),
        "hostel_note": record.get("hostel_note"),
        "administration_charge_usd": record.get("admin_usd"),
        "fee_source_type": "RYC admin supplied fee sheet",
        "fee_source_document": record.get("source_document"),
        "fee_officially_verified": False,

        "created_at": now,
        "updated_at": now,
        "published_at": now if published else None,
    }


async def find_existing_russia_university(db, record):
    names = russia_name_candidates(record["name"])

    for candidate in names:
        doc = await db.universities.find_one(
            {
                "name": {
                    "$regex": f"^{re.escape(candidate)}$",
                    "$options": "i",
                },
                "country": {
                    "$regex": "^Russia$",
                    "$options": "i",
                },
            },
            {"_id": 0},
        )

        if doc:
            return doc

    return None


async def upsert_russia_university(db, record):
    existing = await find_existing_russia_university(db, record)
    defaults = russia_university_defaults(record)
    now = datetime.now(timezone.utc)

    if not existing:
        await db.universities.insert_one(defaults)
        return defaults["id"], True

    university_id = existing["id"]

    update_fields = {
        "stream": "MBBS",
        "country": "Russia",
        "city": record.get("city") or existing.get("city"),
        "course": "MBBS",
        "course_level": "Medical",
        "duration": existing.get("duration") or "6 years",
        "medium": existing.get("medium") or "English",

        "currency": defaults["currency"],
        "tuition_fee_year": defaults["tuition_fee_year"],
        "hostel_fee_year": defaults["hostel_fee_year"],
        "total_course_cost": defaults["total_course_cost"],

        "eligibility": existing.get("eligibility") or defaults["eligibility"],
        "neet_requirement":
            existing.get("neet_requirement") or defaults["neet_requirement"],
        "pcb_requirement":
            existing.get("pcb_requirement") or defaults["pcb_requirement"],

        "fee_academic_year": record.get("academic_year"),
        "tuition_schedule": record.get("tuition"),
        "tuition_schedule_currency": record.get("currency"),
        "hostel_schedule": record.get("hostel"),
        "hostel_note": record.get("hostel_note"),
        "administration_charge_usd": record.get("admin_usd"),
        "fee_source_type": "RYC admin supplied fee sheet",
        "fee_source_document": record.get("source_document"),
        "fee_officially_verified": False,

        "updated_at": now,
    }

    # Do not downgrade an already published/curated university.
    if can_auto_publish_russia_fee(record) and existing.get("status") != "published":
        update_fields["status"] = "published"
        update_fields["published_at"] = now

    await db.universities.update_one(
        {"id": university_id},
        {"$set": update_fields},
    )

    return university_id, False


async def upsert_russia_course(db, university_id, record):
    name = record["name"]
    now = datetime.now(timezone.utc)
    published = can_auto_publish_russia_fee(record)

    existing = await db.courses.find_one(
        {
            "university_id": university_id,
            "name": {
                "$regex": "^General Medicine$",
                "$options": "i",
            },
            "level": {
                "$regex": "^Medical$",
                "$options": "i",
            },
        },
        {"_id": 0},
    )

    currency = (
        record.get("currency")
        if record.get("currency") != "MIXED"
        else "USD"
    )

    annual = (
        float(record["tuition"][0])
        if isinstance(record.get("tuition"), list)
        and record.get("tuition")
        else None
    )

    total = russia_total_if_single_currency(record)

    common = {
        "university_id": university_id,
        "university_name": name,
        "country": "Russia",
        "city": record.get("city"),

        "stream": "MBBS",
        "name": "General Medicine",
        "level": "Medical",
        "duration": "6 years",
        "medium": "English",

        "currency": currency,
        "tuition_fee_year": annual,
        "hostel_fee_year": russia_hostel_year_one(record),
        "total_course_cost": total,

        "intake": None,
        "application_deadline": None,

        "eligibility":
            "Physics, Chemistry and Biology in Class XII; university-specific requirements apply.",
        "neet_requirement":
            "Required for Indian students subject to applicable regulations.",
        "pcb_requirement":
            "University-specific requirement.",

        "academic_requirement": None,
        "english_requirement": None,
        "ielts_requirement": None,
        "gmat_gre_requirement": None,
        "work_experience": None,

        "featured": False,
        "recommended": False,
        "budget_option": False,

        "last_verified": now,
        "source_url": None,

        "status": "published" if published else "draft",

        # Fee audit / year-by-year data.
        "fee_academic_year": record.get("academic_year"),
        "tuition_schedule": record.get("tuition"),
        "tuition_schedule_currency": record.get("currency"),
        "tuition_schedule_mixed":
            record.get("tuition_schedule"),
        "hostel_schedule": record.get("hostel"),
        "hostel_note": record.get("hostel_note"),
        "administration_charge_usd": record.get("admin_usd"),
        "fee_source_type": "RYC admin supplied fee sheet",
        "fee_source_document": record.get("source_document"),
        "fee_officially_verified": False,

        "updated_at": now,
    }

    if existing:
        # Preserve any existing admin curation flags instead of resetting them.
        for key in ["featured", "recommended", "budget_option"]:
            common.pop(key, None)

        # Do not downgrade a previously published course because an older sheet exists.
        if not published and existing.get("status") == "published":
            common.pop("status", None)

        await db.courses.update_one(
            {"id": existing["id"]},
            {"$set": common},
        )

        return False

    doc = {
        "id": str(uuid.uuid4()),
        "slug": slugify(f"{name}-general-medicine-medical"),
        "created_at": now,
        "published_at": now if published else None,
        **common,
    }

    await db.courses.insert_one(doc)
    return True




# =========================================================
# ADMIN — ONE-CLICK RUSSIA FEE MIGRATION
# =========================================================
#
# Protected by the existing require_admin dependency.
# Safe to run more than once because migrate_russia.py uses
# upsert/update logic rather than blind inserts.
#
# After the import succeeds you may leave this endpoint in
# place for future fee refreshes, or remove it if preferred.
# =========================================================


@api_router.post(
    "/admin/migrations/russia-fees"
)
async def admin_run_russia_fee_migration(
    user: User = Depends(
        require_admin
    ),
):

    universities_created = 0
    universities_updated = 0
    courses_created = 0
    courses_updated = 0
    published = 0
    draft_or_review = 0

    results = []

    try:

        for record in RUSSIA_FEE_DATA:

            university_id, created = (
                await upsert_russia_university(
                    db,
                    record,
                )
            )

            if created:
                universities_created += 1
            else:
                universities_updated += 1

            course_created = (
                await upsert_russia_course(
                    db,
                    university_id,
                    record,
                )
            )

            if course_created:
                courses_created += 1
            else:
                courses_updated += 1

            auto_published = (
                can_auto_publish_russia_fee(
                    record
                )
            )

            if auto_published:
                published += 1
                state = "published"
            else:
                draft_or_review += 1
                state = "draft_review"

            annual_tuition = None

            tuition_list = record.get(
                "tuition"
            )

            if (
                isinstance(
                    tuition_list,
                    list
                )
                and tuition_list
            ):
                annual_tuition = (
                    tuition_list[0]
                )

            results.append(
                {
                    "university":
                    record.get(
                        "name"
                    ),

                    "city":
                    record.get(
                        "city"
                    ),

                    "academic_year":
                    record.get(
                        "academic_year"
                    ),

                    "currency":
                    record.get(
                        "currency"
                    ),

                    "year_1_tuition":
                    annual_tuition,

                    "status":
                    state,

                    "source_document":
                    record.get(
                        "source_document"
                    ),
                }
            )

        return {
            "ok":
            True,

            "message":
            "Russia fee migration completed.",

            "records_processed":
            len(
                RUSSIA_FEE_DATA
            ),

            "universities_created":
            universities_created,

            "universities_updated":
            universities_updated,

            "courses_created":
            courses_created,

            "courses_updated":
            courses_updated,

            "auto_published_2026_27":
            published,

            "draft_or_review":
            draft_or_review,

            "results":
            results,
        }

    except Exception as exc:

        logging.exception(
            "Russia fee migration failed: %s",
            exc,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Russia fee migration failed. "
                "Check Render logs for the exact error."
            ),
        )


# =========================================================
# ADMIN APPLICATIONS CRM
# =========================================================

APPLICATION_STAGES = [
    "started",
    "route_built",
    "university_selected",
    "contacted",
    "documents",
    "applied",
    "offer_received",
    "visa",
    "enrolled",
]


class ApplicationStageUpdate(BaseModel):
    stage: Literal[
        "started",
        "route_built",
        "university_selected",
        "contacted",
        "documents",
        "applied",
        "offer_received",
        "visa",
        "enrolled",
    ]


def _application_stage(doc: dict) -> str:
    stage = (
        doc.get("application_status")
        or doc.get("journey_stage")
        or "started"
    )

    aliases = {
        "contact_captured": "started",
        "selected": "university_selected",
        "university selected": "university_selected",
        "route built": "route_built",
        "offer received": "offer_received",
    }

    stage = aliases.get(
        str(stage).strip().lower(),
        str(stage).strip().lower(),
    )

    if stage not in APPLICATION_STAGES:
        return "started"

    return stage


def _admin_application_doc(doc: dict) -> dict:
    clean = _clean_mongo(doc)

    clean["stage"] = _application_stage(clean)

    # Keep both names available for frontend compatibility.
    clean["application_status"] = clean["stage"]
    clean["journey_stage"] = clean["stage"]

    return clean


@api_router.get(
    "/admin/applications"
)
async def admin_list_applications(
    limit: int = 500,
    stage: Optional[str] = None,
    q: Optional[str] = None,
    user: User = Depends(require_admin),
):
    query = {
        "application_id": {
            "$exists": True,
            "$ne": None,
        }
    }

    if stage:
        requested_stage = stage.strip().lower()

        if requested_stage not in APPLICATION_STAGES:
            raise HTTPException(
                status_code=400,
                detail="Invalid application stage",
            )

        if requested_stage == "started":
            query["$or"] = [
                {"application_status": "started"},
                {"journey_stage": "started"},
                {"journey_stage": "contact_captured"},
            ]
        else:
            query["$or"] = [
                {"application_status": requested_stage},
                {"journey_stage": requested_stage},
            ]

    if q:
        search = re.escape(q.strip())
        search_query = [
            {"application_id": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"country": {"$regex": search, "$options": "i"}},
            {"selected_route.university_name": {"$regex": search, "$options": "i"}},
            {"selected_route.course_name": {"$regex": search, "$options": "i"}},
        ]

        if "$or" in query:
            stage_or = query.pop("$or")
            query["$and"] = [
                {"$or": stage_or},
                {"$or": search_query},
            ]
        else:
            query["$or"] = search_query

    limit = max(1, min(limit, 2000))

    docs = (
        await db.leads
        .find(query, {"_id": 0})
        .sort("updated_at", -1)
        .to_list(limit)
    )

    return [
        _admin_application_doc(doc)
        for doc in docs
    ]


@api_router.get(
    "/admin/applications/{application_id}"
)
async def admin_get_application(
    application_id: str,
    user: User = Depends(require_admin),
):
    doc = await db.leads.find_one(
        {"application_id": application_id},
        {"_id": 0},
    )

    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return _admin_application_doc(doc)


@api_router.patch(
    "/admin/applications/{application_id}/stage"
)
async def admin_update_application_stage(
    application_id: str,
    payload: ApplicationStageUpdate,
    user: User = Depends(require_admin),
):
    existing = await db.leads.find_one(
        {"application_id": application_id},
        {"_id": 0},
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    now = datetime.now(timezone.utc)

    update_doc = {
        "application_status": payload.stage,
        "journey_stage": payload.stage,
        "updated_at": now,
    }

    # Useful timestamps for later CRM reporting.
    timestamp_fields = {
        "started": "started_at",
        "route_built": "route_completed_at",
        "university_selected": "selected_at",
        "contacted": "contacted_at",
        "documents": "documents_at",
        "applied": "applied_at",
        "offer_received": "offer_received_at",
        "visa": "visa_at",
        "enrolled": "enrolled_at",
    }

    timestamp_field = timestamp_fields.get(payload.stage)

    if timestamp_field and not existing.get(timestamp_field):
        update_doc[timestamp_field] = now

    await db.leads.update_one(
        {"application_id": application_id},
        {"$set": update_doc},
    )

    updated = await db.leads.find_one(
        {"application_id": application_id},
        {"_id": 0},
    )

    return {
        "ok": True,
        "application_id": application_id,
        "stage": payload.stage,
        "application": _admin_application_doc(updated),
    }


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

    total = await db.leads.count_documents(
        {}
    )

    by_type = {}

    for lead_type in [
        "apply",
        "callback",
        "quick",
        "chat_lead",
        "newsletter",
        "build_route",
        "pre_application",
    ]:

        by_type[
            lead_type
        ] = await db.leads.count_documents(
            {
                "type":
                lead_type
            }
        )

    subscribers = (
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
                "created_at": {
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
        subscribers,

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
        .to_list(limit)
    )

    return [
        Newsletter(
            **_clean_mongo(doc)
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
        Blog(**doc)
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

    now = datetime.now(
        timezone.utc
    )

    slug = make_slug(
        payload.slug
        or payload.title
    )

    if not slug:

        raise HTTPException(
            status_code=400,
            detail="Invalid blog slug",
        )

    existing = await db.blogs.find_one(
        {
            "slug":
            slug
        }
    )

    if existing:

        raise HTTPException(
            status_code=409,
            detail=(
                "A blog with this slug already exists"
            ),
        )

    blog_id = str(
        uuid.uuid4()
    )

    published_at = (
        now
        if payload.status ==
        "published"
        else None
    )

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
            for block in payload.body
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
        **_clean_mongo(doc)
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

    existing = await db.blogs.find_one(
        {
            "id":
            blog_id
        },
        {
            "_id": 0
        },
    )

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="Blog not found",
        )

    updates = payload.model_dump(
        exclude_none=True
    )

    if "body" in updates:

        updates["body"] = [
            (
                item.model_dump()
                if hasattr(
                    item,
                    "model_dump"
                )
                else item
            )
            for item
            in updates["body"]
        ]

    if "slug" in updates:

        new_slug = make_slug(
            updates["slug"]
        )

        duplicate = await db.blogs.find_one(
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

        if duplicate:

            raise HTTPException(
                status_code=409,
                detail=(
                    "A blog with this slug already exists"
                ),
            )

        updates["slug"] = new_slug

    old_status = existing.get(
        "status"
    )

    new_status = updates.get(
        "status",
        old_status
    )

    if (
        new_status == "published"
        and old_status != "published"
    ):
        updates["published_at"] = (
            datetime.now(
                timezone.utc
            )
        )

    if new_status == "draft":
        updates["published_at"] = None

    updates["updated_at"] = (
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

    updated = await db.blogs.find_one(
        {
            "id":
            blog_id
        },
        {
            "_id": 0
        },
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

    result = await db.blogs.delete_one(
        {
            "id":
            blog_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Blog not found",
        )

    return {
        "ok":
        True
    }


# =========================================================
# ADMIN UNIVERSITIES
# =========================================================


@api_router.get(
    "/admin/universities",
    response_model=List[University]
)
async def admin_get_universities(
    stream: Optional[str] = None,
    country: Optional[str] = None,
    user: User = Depends(
        require_admin
    ),
):

    query = {}

    if stream:

        query["stream"] = {
            "$regex":
            f"^{re.escape(stream)}$",
            "$options":
            "i"
        }

    if country:

        query["country"] = {
            "$regex":
            f"^{re.escape(country)}$",
            "$options":
            "i"
        }

    docs = (
        await db.universities
        .find(
            query,
            {
                "_id": 0
            }
        )
        .sort(
            "updated_at",
            -1
        )
        .to_list(
            1000
        )
    )

    return [
        University(**doc)
        for doc in docs
    ]


@api_router.post(
    "/admin/universities",
    response_model=University
)
async def admin_create_university(
    payload: UniversityCreate,
    user: User = Depends(
        require_admin
    ),
):

    now = datetime.now(
        timezone.utc
    )

    slug = make_slug(
        payload.slug
        or payload.name
    )

    if not slug:

        raise HTTPException(
            status_code=400,
            detail="Invalid university slug",
        )

    existing = await db.universities.find_one(
        {
            "slug":
            slug
        }
    )

    if existing:

        raise HTTPException(
            status_code=409,
            detail=(
                "A university with this slug already exists"
            ),
        )

    university_id = str(
        uuid.uuid4()
    )

    published_at = (
        now
        if payload.status ==
        "published"
        else None
    )

    doc = payload.model_dump()

    doc.update(
        {
            "id":
            university_id,

            "slug":
            slug,

            "seo_title":
            (
                payload.seo_title
                or payload.name
            ),

            "meta_description":
            (
                payload.meta_description
                or payload.overview
                or (
                    f"Explore {payload.name} "
                    f"in {payload.country}."
                )
            ),

            "created_at":
            now,

            "updated_at":
            now,

            "published_at":
            published_at,
        }
    )

    doc["faqs"] = [
        faq.model_dump()
        for faq in payload.faqs
    ]

    await db.universities.insert_one(
        doc
    )

    return University(
        **_clean_mongo(doc)
    )


@api_router.put(
    "/admin/universities/{university_id}",
    response_model=University
)
async def admin_update_university(
    university_id: str,
    payload: UniversityUpdate,
    user: User = Depends(
        require_admin
    ),
):

    existing = await db.universities.find_one(
        {
            "id":
            university_id
        },
        {
            "_id": 0
        },
    )

    if not existing:

        raise HTTPException(
            status_code=404,
            detail="University not found",
        )

    updates = payload.model_dump(
        exclude_none=True
    )

    if "slug" in updates:

        new_slug = make_slug(
            updates["slug"]
        )

        if not new_slug:

            raise HTTPException(
                status_code=400,
                detail="Invalid university slug",
            )

        duplicate = await db.universities.find_one(
            {
                "slug":
                new_slug,

                "id":
                {
                    "$ne":
                    university_id
                },
            }
        )

        if duplicate:

            raise HTTPException(
                status_code=409,
                detail=(
                    "A university with this slug already exists"
                ),
            )

        updates["slug"] = new_slug

    if "faqs" in updates:

        updates["faqs"] = [
            (
                faq.model_dump()
                if hasattr(
                    faq,
                    "model_dump"
                )
                else faq
            )
            for faq in updates["faqs"]
        ]

    old_status = existing.get(
        "status"
    )

    new_status = updates.get(
        "status",
        old_status
    )

    if (
        new_status == "published"
        and old_status != "published"
    ):
        updates["published_at"] = (
            datetime.now(
                timezone.utc
            )
        )

    if new_status == "draft":
        updates["published_at"] = None

    updates["updated_at"] = (
        datetime.now(
            timezone.utc
        )
    )

    await db.universities.update_one(
        {
            "id":
            university_id
        },

        {
            "$set":
            updates
        },
    )

    updated = await db.universities.find_one(
        {
            "id":
            university_id
        },
        {
            "_id": 0
        },
    )

    return University(
        **updated
    )


@api_router.delete(
    "/admin/universities/{university_id}"
)
async def admin_delete_university(
    university_id: str,
    user: User = Depends(
        require_admin
    ),
):

    result = await db.universities.delete_one(
        {
            "id":
            university_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="University not found",
        )

    return {
        "ok":
        True
    }



# =========================================================
# V2 ADMIN COURSES
# =========================================================



def derive_course_costs(doc: dict) -> dict:
    """Derive totals from source facts; avoids duplicate manual maintenance."""
    out = dict(doc or {})
    match = re.search(r"(\d+(?:\.\d+)?)", str(out.get("duration") or ""))
    years = float(match.group(1)) if match else None

    tuition = out.get("tuition_fee_year")
    hostel = out.get("hostel_fee_year")
    living = out.get("living_cost_year")
    other = out.get("other_costs_total")

    if years is not None and tuition is not None:
        out["total_course_cost"] = round(float(tuition) * years, 2)
        out["estimated_study_cost"] = round(
            (
                float(tuition)
                + float(hostel or 0)
                + float(living or 0)
            ) * years
            + float(other or 0),
            2,
        )

    return out


@api_router.get(
    "/admin/courses",
    response_model=List[Course]
)
async def admin_get_courses(
    stream: Optional[str] = None,
    country: Optional[str] = None,
    university_id: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    user: User = Depends(
        require_admin
    ),
):

    query = {}

    if stream:
        query["stream"] = {
            "$regex":
            f"^{re.escape(stream)}$",
            "$options":
            "i"
        }

    if country:
        query["country"] = {
            "$regex":
            f"^{re.escape(country)}$",
            "$options":
            "i"
        }

    if university_id:
        query["university_id"] = university_id

    if status:
        query["status"] = status

    if q:
        search = re.escape(
            q.strip()
        )

        query["$or"] = [
            {
                "name": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "university_name": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "country": {
                    "$regex": search,
                    "$options": "i"
                }
            },
        ]

    docs = (
        await db.courses
        .find(
            query,
            {
                "_id": 0
            }
        )
        .sort(
            "updated_at",
            -1
        )
        .to_list(5000)
    )

    return [
        Course(**doc)
        for doc in docs
    ]


@api_router.post(
    "/admin/courses",
    response_model=Course
)
async def admin_create_course(
    payload: CourseCreate,
    user: User = Depends(
        require_admin
    ),
):

    university = await db.universities.find_one(
        {
            "id": payload.university_id
        },
        {
            "_id": 0
        },
    )

    if not university:
        raise HTTPException(
            status_code=404,
            detail="University not found",
        )

    now = datetime.now(
        timezone.utc
    )

    base_slug = (
        payload.slug
        or f"{university.get('name', '')}-{payload.name}"
    )

    slug = make_slug(base_slug)

    if not slug:
        raise HTTPException(
            status_code=400,
            detail="Invalid course slug",
        )

    existing = await db.courses.find_one(
        {
            "slug": slug
        }
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A course with this slug already exists",
        )

    doc = derive_course_costs(
        payload.model_dump()
    )

    doc.update(
        {
            "id": str(uuid.uuid4()),
            "slug": slug,
            "university_name": university.get("name") or "",
            "country": university.get("country") or "",
            "city": university.get("city"),
            "created_at": now,
            "updated_at": now,
            "published_at": (
                now
                if payload.status == "published"
                else None
            ),
        }
    )

    await db.courses.insert_one(doc)

    created = await db.courses.find_one(
        {
            "id": doc["id"]
        },
        {
            "_id": 0
        },
    )

    return Course(**created)


@api_router.put(
    "/admin/courses/{course_id}",
    response_model=Course
)
async def admin_update_course(
    course_id: str,
    payload: CourseUpdate,
    user: User = Depends(
        require_admin
    ),
):

    current = await db.courses.find_one(
        {
            "id": course_id
        },
        {
            "_id": 0
        },
    )

    if not current:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    updates = payload.model_dump(
        exclude_unset=True
    )

    if "university_id" in updates:

        university = await db.universities.find_one(
            {
                "id": updates["university_id"]
            },
            {
                "_id": 0
            },
        )

        if not university:
            raise HTTPException(
                status_code=404,
                detail="University not found",
            )

        updates["university_name"] = (
            university.get("name")
            or ""
        )

        updates["country"] = (
            university.get("country")
            or ""
        )

        updates["city"] = (
            university.get("city")
        )

    if "slug" in updates and updates["slug"]:
        updates["slug"] = make_slug(
            updates["slug"]
        )

    if "name" in updates and not updates.get("slug"):
        # Keep an existing custom slug stable during normal title edits.
        pass

    if "status" in updates:

        old_status = current.get("status")
        new_status = updates["status"]

        if (
            new_status == "published"
            and old_status != "published"
        ):
            updates["published_at"] = datetime.now(
                timezone.utc
            )

        if new_status == "draft":
            updates["published_at"] = None

    merged_for_costs = dict(current)
    merged_for_costs.update(updates)
    derived = derive_course_costs(merged_for_costs)

    if derived.get("total_course_cost") is not None:
        updates["total_course_cost"] = derived["total_course_cost"]

    if derived.get("estimated_study_cost") is not None:
        updates["estimated_study_cost"] = derived["estimated_study_cost"]

    updates["updated_at"] = datetime.now(
        timezone.utc
    )

    await db.courses.update_one(
        {
            "id": course_id
        },
        {
            "$set": updates
        },
    )

    updated = await db.courses.find_one(
        {
            "id": course_id
        },
        {
            "_id": 0
        },
    )

    return Course(**updated)


@api_router.delete(
    "/admin/courses/{course_id}"
)
async def admin_delete_course(
    course_id: str,
    user: User = Depends(
        require_admin
    ),
):

    result = await db.courses.delete_one(
        {
            "id": course_id
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Course not found",
        )

    return {
        "ok": True
    }


# =========================================================
# PUBLIC STATS
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
        "https://routeyourcareer.in",
        "https://www.routeyourcareer.in",
        "https://routeyourcareer.netlify.app",
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
