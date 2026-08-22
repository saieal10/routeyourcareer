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


class BuildMyRouteResponse(BaseModel):

    stream: str
    matches_found: int
    returned: int

    results: List[
        BuildMyRouteMatch
    ]

    note: str



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

        same_currency = (
            _route_text(
                course.get(
                    "currency"
                )
                or "USD"
            )
            ==
            _route_text(
                payload.budget_currency
                or "USD"
            )
        )

        if not same_currency:

            cautions.append(
                "Budget comparison needs currency conversion"
            )

        elif estimated_total is None:

            cautions.append(
                "Complete comparable programme cost is not verified"
            )

        elif (
            estimated_total
            <= payload.budget_total
        ):

            score += 20

            reasons.append(
                "Estimated programme cost fits your stated budget"
            )

        else:

            difference = (
                estimated_total
                - payload.budget_total
            )

            ratio = (
                difference
                / payload.budget_total
                if payload.budget_total
                else 1
            )

            if ratio <= 0.10:

                score -= 5

                cautions.append(
                    "Estimated programme cost is slightly above your budget"
                )

            else:

                score -= 20

                cautions.append(
                    "Estimated programme cost is above your budget"
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
        "7.3-pre-application",

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
                payload
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
            "as needing verification rather than being invented."
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
