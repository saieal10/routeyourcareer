/*
=========================================================
ROUTE YOUR CAREER — CAREER GUIDANCE DATA
=========================================================

Student-first career guidance.

IMPORTANT:
Career recommendations are based on:
1. Academic background
2. Interests
3. Work style
4. Personal priorities

RYC's own courses DO NOT influence the career score.

Only after the career recommendation is generated
will we show relevant RYC programmes.
=========================================================
*/


// =====================================================
// 1. CURRENT EDUCATION STAGE
// =====================================================

export const EDUCATION_STAGES = [
  {
    id: "class10",
    label: "Class 10",
  },
  {
    id: "class11_12",
    label: "Class 11–12",
  },
  {
    id: "class12_done",
    label: "Completed Class 12",
  },
  {
    id: "undergraduate",
    label: "Undergraduate student",
  },
  {
    id: "graduate",
    label: "Graduate",
  },
  {
    id: "working",
    label: "Working professional",
  },
];


// =====================================================
// 2. ACADEMIC STREAM
// =====================================================

export const ACADEMIC_STREAMS = [
  {
    id: "pcb",
    label: "Science — PCB",
  },
  {
    id: "pcm",
    label: "Science — PCM",
  },
  {
    id: "pcmb",
    label: "Science — PCMB",
  },
  {
    id: "commerce",
    label: "Commerce",
  },
  {
    id: "arts",
    label: "Arts / Humanities",
  },
  {
    id: "vocational",
    label: "Vocational / Diploma",
  },
  {
    id: "other",
    label: "Other / Not sure",
  },
];


// =====================================================
// 3. INTEREST AREAS
// =====================================================

export const INTEREST_AREAS = [
  {
    id: "healthcare",
    label: "Medicine & Healthcare",
  },
  {
    id: "engineering",
    label: "Engineering & Technology",
  },
  {
    id: "computing",
    label: "Computer Science / AI / Data",
  },
  {
    id: "business",
    label: "Business & Management",
  },
  {
    id: "finance",
    label: "Finance / Accounting / Economics",
  },
  {
    id: "law",
    label: "Law",
  },
  {
    id: "psychology",
    label: "Psychology & Behaviour",
  },
  {
    id: "design",
    label: "Design / Architecture / Creative Arts",
  },
  {
    id: "media",
    label: "Media / Communication",
  },
  {
    id: "hospitality",
    label: "Hospitality & Tourism",
  },
  {
    id: "science",
    label: "Science & Research",
  },
  {
    id: "life_sciences",
    label: "Pharmacy / Biotechnology / Life Sciences",
  },
  {
    id: "agriculture",
    label: "Agriculture / Environment",
  },
  {
    id: "public_service",
    label: "Government / Civil Services / Public Policy",
  },
  {
    id: "education",
    label: "Education / Teaching",
  },
  {
    id: "aviation",
    label: "Aviation",
  },
  {
    id: "sports",
    label: "Sports & Fitness",
  },
  {
    id: "social_sciences",
    label: "Social Sciences / International Relations",
  },
  {
    id: "vocational",
    label: "Skilled / Vocational Careers",
  },
  {
    id: "unsure",
    label: "I genuinely don't know yet",
  },
];


// =====================================================
// 4. WORK STYLE QUESTIONS
//
// These will later be shown using a 1–5 scale.
// =====================================================

export const WORK_STYLE_QUESTIONS = [
  {
    id: "people",
    label: "I enjoy working directly with people.",
  },
  {
    id: "numbers",
    label: "I enjoy numbers, analysis and problem-solving.",
  },
  {
    id: "technology",
    label: "I enjoy technology, systems and building things.",
  },
  {
    id: "creativity",
    label: "I enjoy creativity, design and expressing ideas.",
  },
  {
    id: "science",
    label: "I enjoy science, experiments and understanding how things work.",
  },
  {
    id: "leadership",
    label: "I enjoy leading teams, organising and making decisions.",
  },
  {
    id: "helping",
    label: "Helping people is important to me.",
  },
  {
    id: "practical",
    label: "I prefer practical, hands-on work.",
  },
  {
    id: "structured",
    label: "I prefer structured work with clear rules and pathways.",
  },
  {
    id: "independent",
    label: "I enjoy independent thinking and self-directed work.",
  },
];


// =====================================================
// 5. CAREER PRIORITIES
// =====================================================

export const PRIORITIES = [
  {
    id: "income",
    label: "High earning potential",
  },
  {
    id: "stability",
    label: "Job stability",
  },
  {
    id: "work_life",
    label: "Work-life balance",
  },
  {
    id: "international",
    label: "International mobility",
  },
  {
    id: "prestige",
    label: "Professional prestige",
  },
  {
    id: "entrepreneurship",
    label: "Entrepreneurship / own business",
  },
  {
    id: "helping",
    label: "Helping people / social impact",
  },
  {
    id: "fast_entry",
    label: "Quicker entry into work",
  },
  {
    id: "research",
    label: "Research / academic growth",
  },
  {
    id: "creativity",
    label: "Creative freedom",
  },
];


// =====================================================
// 6. STUDY LOCATION PREFERENCE
// =====================================================

export const STUDY_PREFERENCES = [
  {
    id: "india",
    label: "Prefer India",
  },
  {
    id: "abroad",
    label: "Prefer abroad",
  },
  {
    id: "either",
    label: "Open to India or abroad",
  },
];


// =====================================================
// 7. CAREER FAMILIES
// =====================================================

export const CAREER_FAMILIES = [

  // ---------------------------------------------------
  // MEDICINE
  // ---------------------------------------------------

  {
    id: "medicine_healthcare",

    title: "Medicine & Clinical Healthcare",

    summary:
      "Careers focused on diagnosis, treatment and direct patient care.",

    interests: [
      "healthcare",
      "science",
    ],

    traits: [
      "people",
      "science",
      "helping",
      "structured",
    ],

    priorities: [
      "stability",
      "prestige",
      "helping",
      "international",
    ],

    streams: [
      "pcb",
      "pcmb",
    ],

    degrees: [
      "MBBS",
      "BDS",
      "BAMS",
      "BHMS",
      "BPT",
      "BOT",
      "BSc Nursing",
    ],

    careers: [
      "Doctor",
      "Dentist",
      "Physiotherapist",
      "Nurse",
      "Clinical Healthcare Professional",
    ],

    caution:
      "Many clinical careers require long study, licensing examinations and regulated training.",

    ryc_tags: [
      "MBBS",
    ],
  },


  // ---------------------------------------------------
  // ALLIED HEALTH
  // ---------------------------------------------------

  {
    id: "allied_health",

    title: "Allied Health & Rehabilitation",

    summary:
      "Patient-facing healthcare careers outside the physician pathway.",

    interests: [
      "healthcare",
      "life_sciences",
    ],

    traits: [
      "people",
      "helping",
      "practical",
    ],

    priorities: [
      "stability",
      "helping",
      "fast_entry",
    ],

    streams: [
      "pcb",
      "pcmb",
    ],

    degrees: [
      "Physiotherapy",
      "Occupational Therapy",
      "Medical Lab Technology",
      "Radiology",
      "Optometry",
    ],

    careers: [
      "Physiotherapist",
      "Occupational Therapist",
      "Radiology Technologist",
      "Optometrist",
      "Medical Laboratory Professional",
    ],

    caution:
      "Scope and licensing requirements vary by profession and country.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // LIFE SCIENCE
  // ---------------------------------------------------

  {
    id: "life_sciences",

    title: "Life Sciences, Pharmacy & Biotechnology",

    summary:
      "Science-based careers involving medicines, biology, laboratories and research.",

    interests: [
      "life_sciences",
      "science",
    ],

    traits: [
      "science",
      "independent",
      "structured",
    ],

    priorities: [
      "research",
      "stability",
      "international",
    ],

    streams: [
      "pcb",
      "pcmb",
    ],

    degrees: [
      "BPharm",
      "Biotechnology",
      "Biochemistry",
      "Microbiology",
      "Biomedical Science",
    ],

    careers: [
      "Pharmacist",
      "Biotechnologist",
      "Research Associate",
      "Clinical Research Professional",
    ],

    caution:
      "Research-heavy careers may require postgraduate study.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // ENGINEERING
  // ---------------------------------------------------

  {
    id: "engineering",

    title: "Engineering & Technology",

    summary:
      "Designing, building and improving machines, infrastructure, products and technology.",

    interests: [
      "engineering",
      "computing",
    ],

    traits: [
      "technology",
      "numbers",
      "practical",
      "structured",
    ],

    priorities: [
      "income",
      "stability",
      "international",
    ],

    streams: [
      "pcm",
      "pcmb",
    ],

    degrees: [
      "BTech",
      "BE",
      "Engineering Science",
    ],

    careers: [
      "Engineer",
      "Product Engineer",
      "Systems Engineer",
      "Technical Consultant",
    ],

    caution:
      "Most engineering degrees require strong mathematics.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // COMPUTER SCIENCE
  // ---------------------------------------------------

  {
    id: "computing_ai",

    title: "Computer Science, AI & Data",

    summary:
      "Technology careers in software, artificial intelligence, data, cybersecurity and digital products.",

    interests: [
      "computing",
      "engineering",
    ],

    traits: [
      "technology",
      "numbers",
      "independent",
    ],

    priorities: [
      "income",
      "international",
      "entrepreneurship",
    ],

    streams: [
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "other",
    ],

    degrees: [
      "Computer Science",
      "Artificial Intelligence",
      "Data Science",
      "Cybersecurity",
      "BCA",
    ],

    careers: [
      "Software Engineer",
      "Data Analyst",
      "AI Engineer",
      "Cybersecurity Analyst",
      "Product Developer",
    ],

    caution:
      "Practical skills and projects can matter as much as the degree.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // BUSINESS
  // ---------------------------------------------------

  {
    id: "business_management",

    title: "Business & Management",

    summary:
      "Careers involving business strategy, operations, marketing, leadership and entrepreneurship.",

    interests: [
      "business",
      "finance",
      "hospitality",
    ],

    traits: [
      "leadership",
      "people",
      "numbers",
    ],

    priorities: [
      "income",
      "entrepreneurship",
      "international",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "vocational",
      "other",
    ],

    degrees: [
      "BBA",
      "BMS",
      "Business Management",
      "International Business",
      "MBA",
    ],

    careers: [
      "Manager",
      "Consultant",
      "Entrepreneur",
      "Business Analyst",
      "Marketing Professional",
    ],

    caution:
      "Career outcomes depend strongly on practical experience, communication skills and institution quality.",

    ryc_tags: [
      "Management",
    ],
  },


  // ---------------------------------------------------
  // FINANCE
  // ---------------------------------------------------

  {
    id: "finance_economics",

    title: "Finance, Accounting & Economics",

    summary:
      "Careers involving money, markets, accounting, financial decisions and economic analysis.",

    interests: [
      "finance",
      "business",
    ],

    traits: [
      "numbers",
      "structured",
      "independent",
    ],

    priorities: [
      "income",
      "stability",
      "international",
    ],

    streams: [
      "commerce",
      "pcm",
      "pcmb",
      "arts",
    ],

    degrees: [
      "BCom",
      "Finance",
      "Economics",
      "Accounting",
      "Actuarial Science",
    ],

    careers: [
      "Accountant",
      "Financial Analyst",
      "Economist",
      "Investment Analyst",
      "Actuary",
    ],

    caution:
      "Some careers require additional qualifications such as CA, CFA or actuarial examinations.",

    ryc_tags: [
      "Management",
    ],
  },


  // ---------------------------------------------------
  // LAW
  // ---------------------------------------------------

  {
    id: "law",

    title: "Law & Legal Careers",

    summary:
      "Careers involving advocacy, regulation, contracts, policy and dispute resolution.",

    interests: [
      "law",
      "public_service",
      "social_sciences",
    ],

    traits: [
      "people",
      "independent",
      "structured",
    ],

    priorities: [
      "prestige",
      "stability",
      "helping",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "other",
    ],

    degrees: [
      "BA LLB",
      "BBA LLB",
      "BCom LLB",
      "LLB",
    ],

    careers: [
      "Lawyer",
      "Legal Consultant",
      "Corporate Counsel",
      "Judicial Services",
    ],

    caution:
      "Legal qualification and practice requirements differ between countries.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // PSYCHOLOGY
  // ---------------------------------------------------

  {
    id: "psychology",

    title: "Psychology & Behavioural Sciences",

    summary:
      "Understanding behaviour, mental processes, people and organisations.",

    interests: [
      "psychology",
      "social_sciences",
      "healthcare",
    ],

    traits: [
      "people",
      "helping",
      "independent",
    ],

    priorities: [
      "helping",
      "research",
      "work_life",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "other",
    ],

    degrees: [
      "Psychology",
      "Applied Psychology",
      "Behavioural Science",
    ],

    careers: [
      "Psychologist",
      "Counsellor",
      "Behavioural Researcher",
      "Organisational Psychology Professional",
    ],

    caution:
      "Clinical psychology usually requires postgraduate training and professional licensing.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // DESIGN
  // ---------------------------------------------------

  {
    id: "design_architecture",

    title: "Design, Architecture & Creative Arts",

    summary:
      "Creative careers involving visual thinking, spaces, products, communication and aesthetics.",

    interests: [
      "design",
      "media",
    ],

    traits: [
      "creativity",
      "practical",
      "independent",
    ],

    priorities: [
      "creativity",
      "entrepreneurship",
      "work_life",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "vocational",
      "other",
    ],

    degrees: [
      "Design",
      "Architecture",
      "Fine Arts",
      "Visual Communication",
      "Interior Design",
    ],

    careers: [
      "Designer",
      "Architect",
      "Creative Director",
      "Visual Artist",
      "Interior Designer",
    ],

    caution:
      "Portfolio quality can be as important as academic marks.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // MEDIA
  // ---------------------------------------------------

  {
    id: "media_communication",

    title: "Media, Communication & Journalism",

    summary:
      "Careers in journalism, content creation, media, advertising, PR and communication.",

    interests: [
      "media",
      "design",
      "social_sciences",
    ],

    traits: [
      "creativity",
      "people",
      "independent",
    ],

    priorities: [
      "creativity",
      "international",
      "entrepreneurship",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "other",
    ],

    degrees: [
      "Mass Communication",
      "Journalism",
      "Media Studies",
      "Advertising",
      "Public Relations",
    ],

    careers: [
      "Journalist",
      "Content Strategist",
      "PR Professional",
      "Media Producer",
      "Copywriter",
    ],

    caution:
      "Career growth is often portfolio and network driven.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // HOSPITALITY
  // ---------------------------------------------------

  {
    id: "hospitality_tourism",

    title: "Hospitality, Tourism & Events",

    summary:
      "Service and management careers in hotels, travel, food, events and guest experience.",

    interests: [
      "hospitality",
      "business",
    ],

    traits: [
      "people",
      "leadership",
      "practical",
    ],

    priorities: [
      "international",
      "entrepreneurship",
      "fast_entry",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "vocational",
      "other",
    ],

    degrees: [
      "Hotel Management",
      "Hospitality Management",
      "Tourism",
      "Culinary Arts",
      "Event Management",
    ],

    careers: [
      "Hotel Manager",
      "Chef",
      "Travel Manager",
      "Event Manager",
      "Guest Experience Professional",
    ],

    caution:
      "Many hospitality careers involve irregular hours and strong service orientation.",

    ryc_tags: [
      "Management",
    ],
  },


  // ---------------------------------------------------
  // PURE SCIENCE
  // ---------------------------------------------------

  {
    id: "science_research",

    title: "Pure Science & Research",

    summary:
      "Careers centred on scientific discovery, laboratories, data and academic research.",

    interests: [
      "science",
      "life_sciences",
      "engineering",
    ],

    traits: [
      "science",
      "numbers",
      "independent",
    ],

    priorities: [
      "research",
      "international",
      "stability",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
    ],

    degrees: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology",
      "Statistics",
    ],

    careers: [
      "Scientist",
      "Researcher",
      "Academic",
      "Laboratory Analyst",
    ],

    caution:
      "Independent research careers commonly require MSc or PhD training.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // AGRICULTURE
  // ---------------------------------------------------

  {
    id: "agriculture_environment",

    title: "Agriculture, Food & Environment",

    summary:
      "Careers involving agriculture, sustainability, food systems and natural resources.",

    interests: [
      "agriculture",
      "science",
      "life_sciences",
    ],

    traits: [
      "science",
      "practical",
      "independent",
    ],

    priorities: [
      "stability",
      "helping",
      "research",
    ],

    streams: [
      "pcb",
      "pcmb",
      "pcm",
    ],

    degrees: [
      "Agriculture",
      "Environmental Science",
      "Food Technology",
      "Forestry",
      "Fisheries",
    ],

    careers: [
      "Agricultural Scientist",
      "Environmental Consultant",
      "Food Technologist",
      "Sustainability Professional",
    ],

    caution:
      "Some careers are location-dependent and may require fieldwork.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // GOVERNMENT
  // ---------------------------------------------------

  {
    id: "public_policy",

    title: "Government, Civil Services & Public Policy",

    summary:
      "Careers focused on administration, governance, policy, diplomacy and public service.",

    interests: [
      "public_service",
      "law",
      "social_sciences",
    ],

    traits: [
      "people",
      "leadership",
      "structured",
    ],

    priorities: [
      "stability",
      "prestige",
      "helping",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "other",
    ],

    degrees: [
      "Political Science",
      "Public Administration",
      "Economics",
      "Law",
      "International Relations",
    ],

    careers: [
      "Civil Servant",
      "Policy Analyst",
      "Diplomat",
      "Public Administrator",
    ],

    caution:
      "Competitive government careers may require separate entrance examinations.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // EDUCATION
  // ---------------------------------------------------

  {
    id: "education",

    title: "Education & Teaching",

    summary:
      "Careers focused on teaching, learning, training and educational development.",

    interests: [
      "education",
      "psychology",
      "social_sciences",
    ],

    traits: [
      "people",
      "helping",
      "structured",
    ],

    priorities: [
      "stability",
      "helping",
      "work_life",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "other",
    ],

    degrees: [
      "Education",
      "Teaching",
      "Subject Degree + BEd",
      "Early Childhood Education",
    ],

    careers: [
      "Teacher",
      "Lecturer",
      "Trainer",
      "Education Consultant",
    ],

    caution:
      "Teaching qualification requirements differ between states and countries.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // AVIATION
  // ---------------------------------------------------

  {
    id: "aviation",

    title: "Aviation & Aerospace Careers",

    summary:
      "Careers involving aircraft, airports, flight operations and aerospace systems.",

    interests: [
      "aviation",
      "engineering",
    ],

    traits: [
      "technology",
      "structured",
      "practical",
    ],

    priorities: [
      "income",
      "international",
      "prestige",
    ],

    streams: [
      "pcm",
      "pcmb",
      "commerce",
      "arts",
    ],

    degrees: [
      "Aviation",
      "Aeronautical Engineering",
      "Airport Management",
      "Pilot Training",
    ],

    careers: [
      "Pilot",
      "Aerospace Engineer",
      "Airport Manager",
      "Flight Operations Professional",
    ],

    caution:
      "Pilot and technical aviation careers can have strict medical, licensing and cost requirements.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // SPORTS
  // ---------------------------------------------------

  {
    id: "sports_fitness",

    title: "Sports, Fitness & Performance",

    summary:
      "Careers in sport, coaching, fitness, performance and sports management.",

    interests: [
      "sports",
      "healthcare",
      "business",
    ],

    traits: [
      "people",
      "practical",
      "leadership",
    ],

    priorities: [
      "work_life",
      "helping",
      "entrepreneurship",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "vocational",
      "other",
    ],

    degrees: [
      "Sports Science",
      "Physical Education",
      "Sports Management",
      "Exercise Science",
    ],

    careers: [
      "Coach",
      "Fitness Professional",
      "Sports Manager",
      "Performance Analyst",
    ],

    caution:
      "Practical experience and professional certifications can be very important.",

    ryc_tags: [
      "Management",
    ],
  },


  // ---------------------------------------------------
  // SOCIAL SCIENCES
  // ---------------------------------------------------

  {
    id: "social_sciences",

    title: "Social Sciences & International Relations",

    summary:
      "Careers focused on society, policy, culture, international affairs and development.",

    interests: [
      "social_sciences",
      "public_service",
      "psychology",
    ],

    traits: [
      "people",
      "independent",
      "helping",
    ],

    priorities: [
      "helping",
      "international",
      "research",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "other",
    ],

    degrees: [
      "International Relations",
      "Sociology",
      "Political Science",
      "Development Studies",
      "Anthropology",
    ],

    careers: [
      "Policy Researcher",
      "Development Professional",
      "International Affairs Professional",
      "Social Researcher",
    ],

    caution:
      "Many specialised careers benefit from postgraduate study.",

    ryc_tags: [],
  },


  // ---------------------------------------------------
  // VOCATIONAL
  // ---------------------------------------------------

  {
    id: "vocational_skilled",

    title: "Skilled & Vocational Careers",

    summary:
      "Practical careers built around technical skills, trades and job-ready training.",

    interests: [
      "vocational",
      "engineering",
      "hospitality",
    ],

    traits: [
      "practical",
      "technology",
      "structured",
    ],

    priorities: [
      "fast_entry",
      "stability",
      "entrepreneurship",
    ],

    streams: [
      "pcb",
      "pcm",
      "pcmb",
      "commerce",
      "arts",
      "vocational",
      "other",
    ],

    degrees: [
      "Diploma",
      "ITI",
      "Technical Certification",
      "Apprenticeship",
    ],

    careers: [
      "Technician",
      "Skilled Trade Professional",
      "Technical Operator",
      "Service Entrepreneur",
    ],

    caution:
      "Recognition and earning potential depend on the trade, certification and location.",

    ryc_tags: [],
  },
];


// =====================================================
// 8. CAREER SCORING ENGINE
// =====================================================

export function scoreCareerFamily(profile, family) {

  let score = 0;
  let possible = 0;


  // ---------------------------------------------------
  // INTEREST MATCH
  // Highest importance
  // ---------------------------------------------------

  family.interests.forEach((id) => {

    possible += 6;

    if ((profile.interests || []).includes(id)) {
      score += 6;
    }

  });


  // ---------------------------------------------------
  // PERSONAL / WORK STYLE MATCH
  //
  // Answers will later use:
  // 1 = strongly disagree
  // 2 = disagree
  // 3 = neutral
  // 4 = agree
  // 5 = strongly agree
  // ---------------------------------------------------

  family.traits.forEach((id) => {

    possible += 5;

    const value = Number(
      (profile.trait_scores || {})[id] || 0
    );

    score += Math.max(
      0,
      Math.min(5, value)
    );

  });


  // ---------------------------------------------------
  // CAREER PRIORITIES
  // ---------------------------------------------------

  family.priorities.forEach((id) => {

    possible += 3;

    if ((profile.priorities || []).includes(id)) {
      score += 3;
    }

  });


  // ---------------------------------------------------
  // ACADEMIC COMPATIBILITY
  //
  // Important:
  // This helps determine academic fit.
  //
  // It DOES NOT automatically prevent us from showing
  // the career. The results page can explain that the
  // student may need another academic pathway.
  // ---------------------------------------------------

  possible += 8;

  if (
    !profile.academic_stream ||
    family.streams.includes(profile.academic_stream)
  ) {
    score += 8;
  }


  // ---------------------------------------------------
  // FINAL PERCENTAGE
  // ---------------------------------------------------

  if (!possible) {
    return 0;
  }

  return Math.round(
    (score / possible) * 100
  );
}


// =====================================================
// 9. GENERATE CAREER RECOMMENDATIONS
// =====================================================

export function getCareerRecommendations(
  profile,
  limit = 6
) {

  return CAREER_FAMILIES

    .map((family) => {

      return {

        ...family,

        fit_score: scoreCareerFamily(
          profile,
          family
        ),

      };

    })

    .sort(
      (a, b) =>
        b.fit_score - a.fit_score
    )

    .slice(
      0,
      limit
    );
}
