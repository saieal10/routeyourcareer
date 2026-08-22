"""
Route Your Career — Russia MBBS university migration

Adds the Russia university list supplied by the admin into the existing
MongoDB universities collection and creates one linked General Medicine
course record per university in the V2 courses collection.

Safe to run more than once: it reuses existing universities/courses.
"""

import os
import re
import uuid
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

RUSSIA_UNIVERSITIES = ['Altai State Medical University', 'Astrakhan State Medical University', 'Bashkir State Medical University', 'Belgorod State National Research University', 'Crimean Federal University', 'Dagestan State Medical University', 'Far Eastern Federal University', 'I.M. Sechenov First Moscow State Medical University', 'Immanuel Kant Baltic Federal University', 'Irkutsk State Medical University', 'Kazan Federal University', 'Kazan State Medical University', 'Kemerovo State Medical University', 'Kuban State Medical University', 'Kursk State Medical University', 'Lomonosov Moscow State University', 'Mari State University', 'National Research Ogarev Mordovia State University', 'North Ossetian State Medical Academy', 'Northern State Medical University', 'Novosibirsk State University', 'Omsk State Medical University', 'Orel State University', 'Orenburg State Medical University', 'Penza State University', 'Perm State Medical University', 'Pirogov Russian National Research Medical University (RMNMU)', 'Privolzhsky Research Medical University', 'Pskov State University', 'Rostov State Medical University', "Russian Peoples' Friendship University (RUDN)", 'Ryazan State Medical University', 'Saint Petersburg State Pediatric Medical University', 'Saratov State Medical University', 'Siberian State Medical University', 'Smolensk State Medical University', 'St. Petersburg State University / Pavlov First St. Petersburg State Medical University', 'Stavropol State Medical University', 'Tambov State University', 'Tula State University', 'Tver State Medical University', 'Ulyanovsk State University', 'Volgograd State Medical University', 'Voronezh State Medical University', 'Yaroslavl State Medical University']


def slugify(value):
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def university_defaults(name):
    now = datetime.now(timezone.utc)
    return {
        "id": str(uuid.uuid4()),
        "stream": "MBBS",
        "name": name,
        "slug": slugify(name),
        "country": "Russia",
        "city": None,

        # Legacy compatibility fields required by the existing University model.
        "course": "MBBS",
        "course_level": None,
        "duration": None,
        "medium": "English",
        "intake": None,
        "application_deadline": None,

        "currency": "USD",
        "tuition_fee_year": None,
        "hostel_fee_year": None,
        "food_fee_year": None,
        "first_year_total": None,
        "total_course_cost": None,
        "application_fee": None,
        "scholarship_info": None,

        "eligibility": None,
        "neet_requirement": None,
        "pcb_requirement": None,
        "internship": None,
        "recognition": None,
        "nmc_notes": None,
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

        "overview": None,
        "accreditation": None,
        "ranking": None,
        "established_year": None,
        "campus": None,

        "hostel": None,
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

        # Keep new records in draft until you verify the current programme details.
        "status": "draft",

        "seo_title": name,
        "meta_description": f"Explore {name} in Russia.",
        "keywords": [],

        "created_at": now,
        "updated_at": now,
        "published_at": None,
    }


async def get_or_create_university(db, name):
    existing = await db.universities.find_one(
        {
            "name": {"$regex": f"^{re.escape(name)}$", "$options": "i"},
            "country": {"$regex": "^Russia$", "$options": "i"},
        },
        {"_id": 0},
    )

    if existing:
        return existing["id"], False

    doc = university_defaults(name)
    await db.universities.insert_one(doc)
    return doc["id"], True


async def get_or_create_course(db, university_id, university_name):
    existing = await db.courses.find_one(
        {
            "university_id": university_id,
            "name": {"$regex": "^General Medicine$", "$options": "i"},
            "level": {"$regex": "^Medical$", "$options": "i"},
        },
        {"_id": 0},
    )

    if existing:
        return False

    now = datetime.now(timezone.utc)

    doc = {
        "id": str(uuid.uuid4()),
        "university_id": university_id,
        "university_name": university_name,
        "country": "Russia",
        "city": None,

        "stream": "MBBS",
        "name": "General Medicine",
        "slug": slugify(f"{university_name}-general-medicine-medical"),
        "level": "Medical",
        "duration": None,
        "medium": "English",

        "currency": "USD",
        "tuition_fee_year": None,
        "total_course_cost": None,

        "intake": None,
        "application_deadline": None,
        "eligibility": None,
        "neet_requirement": None,
        "pcb_requirement": None,

        "academic_requirement": None,
        "english_requirement": None,
        "ielts_requirement": None,
        "gmat_gre_requirement": None,
        "work_experience": None,

        "featured": False,
        "recommended": False,
        "budget_option": False,

        "last_verified": None,
        "source_url": None,

        # Draft because only the university list was supplied;
        # fees/intake/eligibility/current programme details still need verification.
        "status": "draft",

        "created_at": now,
        "updated_at": now,
        "published_at": None,
    }

    await db.courses.insert_one(doc)
    return True


async def main():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    universities_created = 0
    universities_reused = 0
    courses_created = 0
    courses_reused = 0

    print("\n=== RYC RUSSIA MIGRATION ===\n")

    for name in RUSSIA_UNIVERSITIES:
        university_id, created = await get_or_create_university(db, name)

        if created:
            universities_created += 1
        else:
            universities_reused += 1

        course_created = await get_or_create_course(
            db,
            university_id,
            name,
        )

        if course_created:
            courses_created += 1
        else:
            courses_reused += 1

    print("=== RUSSIA MIGRATION COMPLETE ===")
    print(f"Universities supplied: {len(RUSSIA_UNIVERSITIES)}")
    print(f"Universities created: {universities_created}")
    print(f"Existing universities reused: {universities_reused}")
    print(f"Courses created: {courses_created}")
    print(f"Existing courses reused: {courses_reused}")
    print(f"Total universities in database: {await db.universities.count_documents({})}")
    print(f"Total courses in database: {await db.courses.count_documents({})}")
    print("\nRussia records were imported as DRAFT.")
    print("Verify current fees, duration, medium, intake and eligibility in Admin before publishing.")

    client.close()


if __name__ == "__main__":
    asyncio.run(main())
