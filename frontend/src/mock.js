// Route Your Career - MBBS + Management Abroad Guidance & Lead-Gen Platform

export const brand = {
  name: 'Route Your Career',
  short: 'RYC',
  tagline: 'Route Your Career is your pathway — for future planning.',
  slogan: 'MBBS abroad + Management abroad · New startup, old experience.',
  whatsapp: '+919326082141',
  whatsappDisplay: '+91 93260 82141',
  phone: '+919326082141',
  phoneDisplay: '+91 93260 82141',
  email: 'inforouteyourcareer@gmail.com',
  hours: 'Mon-Sat · 10am – 7pm IST',
  applyLink: 'https://forms.gle/8Yuz9wmpKuSM1Vee9',
  callbackLink: 'https://forms.gle/i9Xm6RAWXvLyLKG48',
  socials: { facebook: '#', instagram: '#', youtube: '#', linkedin: '#' },
};

export const announcements = [
  'Route Your Career is your pathway — for future planning',
  'Two tracks — MBBS Abroad and Management Abroad · UG + PG programmes',
  'MBBS priority: Georgia 🇬🇪 and Uzbekistan 🇺🇿 · English-medium, NMC-recognised',
  'Italy 🇮🇹 — UG and PG courses with ZERO tuition fees at public universities',
  'Present across Karnataka · Maharashtra · Kerala · Tamil Nadu · Telangana',
  'Call +91 93260 82141 or request a callback — Mon–Sat, 10am–7pm IST',
];

export const heroStats = [
  { value: '17', label: 'Countries covered (MBBS + Mgmt)' },
  { value: '2', label: 'Tracks: MBBS + Management' },
  { value: 'Italy', label: 'Zero-tuition UG + PG' },
  { value: '100% Free', label: 'Consultation on request' },
];

export const recognitions = ['NMC', 'WHO', 'ECFMG', 'AACSB', 'QS-Ranked'];

export const programs = [
  {
    key: 'mbbs',
    label: 'MBBS Abroad',
    tag: 'MEDICAL',
    intent: 'Become a doctor',
    duration: '5–6 years',
    priceRange: '₹15–45L total',
    priority: ['Georgia', 'Uzbekistan'],
    countries: ['Georgia', 'Uzbekistan', 'Ireland', 'Egypt', 'Moldova', 'Russia', 'Kazakhstan', 'Kyrgyzstan', 'Nepal'],
    img: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&q=80',
    bullets: ['NMC-recognised universities', 'English-medium teaching', 'Direct admission on qualifying NEET', 'FMGE / NExT ready curriculum'],
  },
  {
    key: 'management',
    label: 'Management Abroad',
    tag: 'BUSINESS',
    intent: 'UG or PG in business/tech',
    duration: '1–4 years',
    priceRange: 'Tuition-free → ₹55L',
    priority: ['Italy · zero-fee', 'Germany', 'Singapore'],
    countries: ['USA', 'UK', 'Australia', 'Germany', 'Italy', 'Spain', 'UAE', 'Singapore'],
    img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
    bullets: ['BBA, BSc, MSc, MBA, MIM programmes', 'QS-ranked universities and AACSB-accredited b-schools', 'Post-study work visas in most destinations', 'Special: Italy public universities — zero tuition fees'],
  },
];

export const whyPoints = [
  { tag: 'CURATED', title: 'One-stop shortlist', body: 'Tell us your score, budget and career goal — we return a hand-picked country and university shortlist for MBBS OR management.', icon: 'ListChecks' },
  { tag: 'UNBIASED', title: 'Zero commission agents', body: 'We are guidance & lead-generation only. We help you find your dream university — not the highest-paying one.', icon: 'ShieldCheck' },
  { tag: 'HONEST FEES', title: 'Transparent, written fees', body: 'Every option comes with a written fee breakdown from the partner university, before you commit.', icon: 'FileText' },
  { tag: 'FOCUS', title: 'Italy · zero-tuition secret', body: 'Deep expertise in Italy’s public UG and PG programmes — pay only living costs, not tuition. Yes, really.', icon: 'Sparkles' },
  { tag: 'END-TO-END', title: 'Guidance through visa', body: 'From application docs to embassy mock interviews — we walk with you until you land at your campus.', icon: 'Plane' },
  { tag: 'PAN-INDIA', title: '5 South-Indian states', body: 'Karnataka, Maharashtra, Kerala, Tamil Nadu, Telangana — walk-in, video, phone or home visit.', icon: 'MapPin' },
];

export const compare = {
  abroad: [
    { t: 'Total Cost: ₹15L–45L (MBBS) / tuition-free Italy', s: 'Public universities keep fees low or zero' },
    { t: 'No Capitation Fees', s: 'Transparent, one-time fees only' },
    { t: 'Direct Admission', s: 'No competitive tests in most destinations' },
    { t: 'Low NEET or 12th Score OK', s: 'Qualifying scores are enough for most partner unis' },
    { t: 'Global Exposure', s: 'International curriculum, work-visa pathways' },
  ],
  india: [
    { t: 'Total Cost: ₹1 Cr+ (Private MBBS / top B-schools)', s: 'Tuition + capitation/donation' },
    { t: 'Heavy Capitation Fees', s: 'Donation required for admission' },
    { t: 'Limited Seats', s: 'Very tight seat-to-aspirant ratio' },
    { t: 'High Cutoffs', s: 'Extremely competitive entrance rounds' },
    { t: 'Limited Global Exposure', s: 'Local curriculum only' },
  ],
};

// MBBS countries
export const countries = [
  { code: 'ge', name: 'Georgia', track: 'mbbs', fee: '₹20–28L', desc: 'European-quality MBBS at 4 government universities, English-medium, Schengen-adjacent lifestyle.', flag: 'https://flagcdn.com/w80/ge.png', img: 'https://images.unsplash.com/photo-1603350576276-24747f7bbf40?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85', tag: 'PRIORITY', featured: true },
  { code: 'uz', name: 'Uzbekistan', track: 'mbbs', fee: '₹16–20L', desc: 'Affordable English-medium MBBS at reputed public universities, vegetarian-friendly cities.', flag: 'https://flagcdn.com/w80/uz.png', img: 'https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85', tag: 'PRIORITY', featured: true },
  { code: 'ie', name: 'Ireland', track: 'mbbs', fee: '₹35–45L', desc: 'Premium European MBBS pathway — Trinity, RCSI, UCC — English-medium.', flag: 'https://flagcdn.com/w80/ie.png', img: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=80', tag: 'PREMIUM' },
  { code: 'eg', name: 'Egypt', track: 'mbbs', fee: '₹18–24L', desc: 'MBBS at Cairo University & Ain Shams — English-medium, WHO & NMC listed.', flag: 'https://flagcdn.com/w80/eg.png', img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=80' },
  { code: 'md', name: 'Moldova', track: 'mbbs', fee: '₹15–19L', desc: 'MBBS at Nicolae Testemitanu SUMPh — EU framework, budget-friendly.', flag: 'https://flagcdn.com/w80/md.png', img: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=1200&q=80' },
  { code: 'ru', name: 'Russia', track: 'mbbs', fee: '₹17–25L', desc: '12 partner universities, FMGE-tuned curriculum.', flag: 'https://flagcdn.com/w80/ru.png', img: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&q=80' },
  { code: 'kz', name: 'Kazakhstan', track: 'mbbs', fee: '₹18–22L', desc: 'Eight NMC-recognised universities, English-medium MBBS.', flag: 'https://flagcdn.com/w80/kz.png', img: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=1200&q=80' },
  { code: 'kg', name: 'Kyrgyzstan', track: 'mbbs', fee: '₹15–19L', desc: 'Budget-friendly MBBS at International Medical University.', flag: 'https://flagcdn.com/w80/kg.png', img: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?w=1200&q=80' },
  { code: 'np', name: 'Nepal', track: 'mbbs', fee: '₹35–45L', desc: 'Cultural similarity, shared geography, FMGE-ready curriculum.', flag: 'https://flagcdn.com/w80/np.png', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80' },
];

// Management countries
export const managementCountries = [
  { code: 'it', name: 'Italy', track: 'management', fee: 'Tuition FREE — public unis', desc: 'RYC’s biggest secret — UG and PG at public Italian universities with ZERO tuition fees. Living from ₹6–8L/yr.', flag: 'https://flagcdn.com/w80/it.png', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80', tag: 'ZERO-FEE', featured: true, programs: ['BBA / BSc', 'MSc', 'MBA', 'MIM'] },
  { code: 'de', name: 'Germany', track: 'management', fee: '₹0–10L tuition', desc: 'Public universities with almost-zero tuition, strong engineering + management schools, post-study work visa.', flag: 'https://flagcdn.com/w80/de.png', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80', tag: 'LOW-FEE', programs: ['Bachelors', 'MSc', 'MBA'] },
  { code: 'sg', name: 'Singapore', track: 'management', fee: '₹20–50L', desc: 'World-class B-schools (NUS, NTU, SMU), 1-year MBA options, strong Asia placement.', flag: 'https://flagcdn.com/w80/sg.png', img: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&q=80', tag: 'ASIA HUB', programs: ['Bachelors', 'MBA', 'MSc'] },
  { code: 'us', name: 'USA', track: 'management', fee: '₹30–₹55L / yr', desc: 'The gold standard — Ivies and top MBA schools, OPT/H1-B pathway to a career.', flag: 'https://flagcdn.com/w80/us.png', img: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80', tag: 'PREMIUM', programs: ['Bachelors', 'MS', 'MBA'] },
  { code: 'gb', name: 'UK', track: 'management', fee: '₹20–₹40L / yr', desc: '1-year MSc / MBA, Russell Group universities, Graduate Route work visa.', flag: 'https://flagcdn.com/w80/gb.png', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80', tag: 'FAST', programs: ['Bachelors', 'MSc', 'MBA'] },
  { code: 'au', name: 'Australia', track: 'management', fee: '₹22–₹40L / yr', desc: 'Group of Eight universities, 2–4 year post-study work visa, safe multi-cultural cities.', flag: 'https://flagcdn.com/w80/au.png', img: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&q=80', tag: 'WORK VISA', programs: ['Bachelors', 'MSc', 'MBA'] },
  { code: 'es', name: 'Spain', track: 'management', fee: '₹15–₹30L / yr', desc: 'European degree at Latin-Mediterranean cost — IE, ESADE, IESE for MBA aspirants.', flag: 'https://flagcdn.com/w80/es.png', img: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1200&q=80', tag: 'EU', programs: ['Bachelors', 'MSc', 'MBA'] },
  { code: 'ae', name: 'UAE', track: 'management', fee: '₹12–₹30L / yr', desc: 'Global campus branches in Dubai/Abu Dhabi, close-to-India logistics, growing job market.', flag: 'https://flagcdn.com/w80/ae.png', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80', tag: 'CLOSE', programs: ['Bachelors', 'MSc', 'MBA'] },
];

// Italy deep spotlight - the star of management
export const italySpotlight = {
  code: 'it',
  name: 'Italy',
  flag: 'https://flagcdn.com/w80/it.png',
  headline: 'UG + PG in Italy with ZERO tuition fees.',
  intro: 'Italy’s public universities offer world-class Bachelor’s and Master’s programmes to Indian students for a symbolic annual admin fee — not lakhs. You budget only for living, not tuition. This is our best-kept secret.',
  fee: '₹0 tuition',
  duration: 'UG 3 yr / PG 2 yr',
  medium: 'English',
  hero: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=800&q=80',
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
    'https://images.unsplash.com/photo-1527142879-95b61a0b8226?w=800&q=80',
  ],
  highlights: [
    'Zero tuition at public universities (only €150–€800/yr admin fee)',
    'English-medium UG and PG programmes',
    'Schengen student visa · EU-wide travel',
    'Living from ₹6–8L / year (Milan, Bologna, Rome)',
    'Post-study work-search visa · pathway to EU jobs',
  ],
  courses: ['BBA / Business Administration (UG)', 'MSc Management / Finance / Marketing (PG)', 'MBA (1–2 yr)', 'BSc Engineering & Data (UG)', 'MSc Computer Science (PG)'],
  universities: ['University of Bologna', 'Sapienza University of Rome', 'Politecnico di Milano', 'University of Milan (Statale)', 'University of Padua'],
};

// 5 Indian states we serve
export const offices = [
  { city: 'Bengaluru', state: 'Karnataka', area: '', img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80' },
  { city: 'Mumbai', state: 'Maharashtra', area: '', img: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=800&q=80' },
  { city: 'Kochi', state: 'Kerala', area: '', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80' },
  { city: 'Chennai', state: 'Tamil Nadu', area: '', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80' },
  { city: 'Hyderabad', state: 'Telangana', area: '', img: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80' },
];

// Blogs — mocked for now
export const blogs = [
  { slug: 'italy-tuition-free', title: 'How Indian students study in Italy without paying tuition', cat: 'Italy', mins: 6, img: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&q=80', excerpt: 'A step-by-step guide to Italy’s public universities — how the admin fee works, DSU scholarships, and living cost breakdown.' },
  { slug: 'georgia-vs-uzbekistan-mbbs', title: 'MBBS in Georgia vs Uzbekistan — which fits you?', cat: 'MBBS', mins: 8, img: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&q=80', excerpt: 'A side-by-side of fees, duration, universities, FMGE readiness and everyday life. Which is right for your NEET score?' },
  { slug: 'mba-abroad-2026', title: 'Best MBA-abroad destinations for Indians in 2026', cat: 'Management', mins: 7, img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80', excerpt: 'Singapore, UK, USA, Australia and Germany — how to pick by ROI, work-visa policy and career pivot goals.' },
  { slug: 'germany-tuition-free', title: 'Germany is (mostly) still tuition-free — here’s the fine print', cat: 'Germany', mins: 5, img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80', excerpt: 'Semester fees, blocked accounts, APS certificate — what an Indian student actually needs to plan and pay for.' },
  { slug: 'neet-low-score', title: 'Your NEET score is low. Here are 4 real options.', cat: 'MBBS', mins: 6, img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80', excerpt: 'From repeating, to Georgia, to Uzbekistan, to a pivot into management — how RYC counsellors think through low-NEET cases.' },
  { slug: 'career-planning-class-12', title: 'Planning your career after Class 12 — an RYC framework', cat: 'Guidance', mins: 9, img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80', excerpt: 'Not sure between medicine and management? Use the same 5-question framework we use in every first counselling call.' },
];

export const faqs = [
  { q: 'What does RYC do exactly?', a: 'Route Your Career is a guidance & lead-generation platform for Indian students. We help you find your dream university abroad — across MBBS and Management — and support you through admission and visa. Consultation is free on request.' },
  { q: 'Which is cheaper — MBBS Georgia or UG Italy?', a: 'For pure tuition, Italy’s public universities are cheaper (near-zero tuition). MBBS Georgia is ₹20–28L total for 6 years. Georgia is a medical degree; Italy programmes are UG or PG in business / tech / management.' },
  { q: 'Is UG in Italy really tuition-free?', a: 'Yes — at Italian public universities, tuition ranges from €0–€800 a year for eligible international students (much less than most European countries). You still budget for living costs (₹6–8L/yr).' },
  { q: 'Do you serve students outside South India?', a: 'Yes. Our five physical states are Karnataka, Maharashtra, Kerala, Tamil Nadu and Telangana — but we fully support students from any Indian state over WhatsApp, phone and video.' },
  { q: 'How is the consultation free?', a: 'Free consultation is provided on request. As a lead-generation platform, we’re paid by our partner universities for verified admissions — never by students.' },
  { q: 'How do I get started?', a: 'Two ways: (1) Apply Online — fill our short form and we’ll get back within 24 hours. (2) Request a Callback — leave your number and preferred time, we call you.' },
];

export const aboutBullets = [
  { k: 'Two full tracks', v: 'MBBS abroad AND Management abroad — UG + PG both.' },
  { k: 'Italy zero-tuition', v: 'Our special expertise — UG + PG in Italy at zero tuition.' },
  { k: 'Guidance-only', v: 'We are a lead-gen & guidance platform — not a commission agency.' },
  { k: 'Free for students', v: 'Universities pay us on verified admission. You never do.' },
];

// AI Agents section removed from home; retained for optional future use.
export const aiAgents = [];

// Deep spotlight data for Georgia & Uzbekistan (used by FeaturedCountries)
export const spotlightGeorgia = {
  code: 'ge', name: 'Georgia',
  flag: 'https://flagcdn.com/w80/ge.png',
  headline: 'A European-quality MBBS \u2014 without the European fee.',
  intro: 'Georgia has become the go-to MBBS destination for Indian students who want a Western curriculum, English-medium classes, and a safe, Schengen-adjacent lifestyle at a fraction of Ireland or UK fees.',
  fee: '\u20b920\u201328L', duration: '6 years', medium: 'English',
  hero: 'https://images.unsplash.com/photo-1603350576276-24747f7bbf40?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
  gallery: [
    'https://images.unsplash.com/photo-1505294399615-2479253a4990?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    'https://images.unsplash.com/photo-1561731172-9d906d7b13bf?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    'https://images.unsplash.com/photo-1597395529362-361ba4b8ec24?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
  ],
  highlights: ['NMC, WHO, ECFMG & GMC listed universities', 'English-medium from day one', 'European Credit Transfer System', 'Warm Mediterranean climate, safe cities', 'Vibrant Indian community & vegetarian mess'],
  universities: ['Alte University', 'Caucasus International University (CIU)', 'Caucasus University (CU)', 'University of Georgia'],
};

export const spotlightUzbekistan = {
  code: 'uz', name: 'Uzbekistan',
  flag: 'https://flagcdn.com/w80/uz.png',
  headline: 'Affordable, English-medium MBBS \u2014 next door to India.',
  intro: 'Uzbekistan is one of the fastest growing MBBS-abroad destinations for Indian students \u2014 short flight, low fees, English-medium teaching at government universities, and a vegetarian-friendly culture.',
  fee: '\u20b916\u201320L', duration: '5.5\u20136 years', medium: 'English',
  hero: 'https://images.unsplash.com/photo-1664602078796-68ee76b3fc59?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85',
  gallery: [
    'https://images.unsplash.com/photo-1733586092622-1b3201e802a5?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    'https://images.unsplash.com/photo-1622021109028-8ba1d5374161?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    'https://images.unsplash.com/photo-1715966743489-0ac1138420a5?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
  ],
  highlights: ['Government universities, NMC recognised', 'Fees start at just \u20b916L total', 'Direct 5\u20136 hour flight from India', 'English-medium MBBS curriculum', 'Vegetarian Indian mess in every hostel'],
  universities: ['Tashkent Medical Academy', 'Samarkand State Medical University', 'Andijan State Medical Institute', 'Fergana Public Health Medical Institute'],
};
