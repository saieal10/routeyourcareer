// Per-country visa + lifestyle details for the dynamic /country/:code page.
// Georgia and Italy have their own full deep pages; everything else uses this.

export const countryDetails = {
  uz: {
    visa: { type: 'Student visa D', processTime: '2–4 weeks', validity: 'Renewed yearly', notes: 'Invitation letter from the university, plus medical + financial docs.' },
    lifestyle: { climate: 'Continental — hot summers, cold winters', language: 'Uzbek + Russian (English on campus)', food: 'Muslim-majority — vegetarian & halal options widely available', community: 'Large and growing Indian student community' },
  },
  ie: {
    visa: { type: 'Stamp 2 student visa', processTime: '4–8 weeks', validity: 'Duration of course', notes: 'IELTS / TOEFL required; €10k+ funds proof; TB test for Indians.' },
    lifestyle: { climate: 'Mild Atlantic — rainy, cool summers', language: 'English (Irish co-official)', food: 'Cosmopolitan cities with Indian groceries and restaurants', community: 'Vibrant Indian community in Dublin, Cork and Galway' },
  },
  eg: {
    visa: { type: 'Student visa', processTime: '2–4 weeks', validity: 'Renewed yearly', notes: 'HEC / university invitation letter; embassy attestation of documents.' },
    lifestyle: { climate: 'Warm Mediterranean — mild winters', language: 'Arabic (classes in English)', food: 'Muslim-majority — vegetarian and halal easy to find', community: 'Established Indian student community in Cairo' },
  },
  md: {
    visa: { type: 'Long-stay student visa', processTime: '4–6 weeks', validity: 'Renewed yearly', notes: 'Invitation letter; apostilled documents; medical clearance.' },
    lifestyle: { climate: 'Cold winters, mild summers', language: 'Romanian + Russian (English on campus)', food: 'Vegetarian options improving in Chisinau', community: 'Small but tight-knit Indian student circle' },
  },
  ru: {
    visa: { type: 'Student visa — invitation-based', processTime: '3–4 weeks', validity: 'Renewed yearly', notes: 'FMS invitation, HIV test, notarised documents.' },
    lifestyle: { climate: 'Cold winters — warm hostels', language: 'Russian (medium of instruction English)', food: 'Indian mess on almost every partner campus', community: 'Very large Indian community across cities' },
  },
  kz: {
    visa: { type: 'Student visa', processTime: '3–4 weeks', validity: 'Renewed yearly', notes: 'Invitation letter; embassy interview; medical.' },
    lifestyle: { climate: 'Continental — hot summers, cold winters', language: 'Kazakh + Russian (classes in English)', food: 'Muslim-majority — halal & vegetarian easy', community: 'Growing Indian community in Almaty' },
  },
  kg: {
    visa: { type: 'Student visa', processTime: '2–3 weeks', validity: 'Renewed yearly', notes: 'One of the simpler visa processes for Indian students.' },
    lifestyle: { climate: 'Cold winters, mild summers', language: 'Kyrgyz + Russian (English on campus)', food: 'Vegetarian mess in most hostels', community: 'Large Indian student presence in Bishkek' },
  },
  np: {
    visa: { type: 'No visa needed for Indians', processTime: 'Instant', validity: 'Duration of course', notes: 'Passport/voter-ID sufficient; ID card issued on arrival.' },
    lifestyle: { climate: 'Himalayan — varies by city', language: 'Nepali + Hindi', food: 'Fully familiar Indian food', community: 'Cultural and linguistic overlap with India' },
  },
  us: {
    visa: { type: 'F-1 student visa', processTime: '4–12 weeks', validity: 'Duration of study + 60 days', notes: 'I-20 from university; SEVIS fee; consulate interview.' },
    lifestyle: { climate: 'Highly regional — pick your climate', language: 'English', food: 'Every cuisine including Indian, everywhere', community: 'Largest Indian diaspora abroad' },
  },
  gb: {
    visa: { type: 'Student Route visa', processTime: '3 weeks', validity: 'Duration of course + Graduate Route 2 yrs', notes: 'CAS letter; £9–£12k funds proof; TB test.' },
    lifestyle: { climate: 'Mild, rainy', language: 'English', food: 'Curry-mile in most cities', community: 'Very large Indian community' },
  },
  au: {
    visa: { type: 'Subclass 500 student visa', processTime: '4–12 weeks', validity: 'Course + 2–4 yr post-study visa', notes: 'GTE statement; funds proof; health insurance mandatory.' },
    lifestyle: { climate: 'Mediterranean / sub-tropical', language: 'English', food: 'Indian restaurants everywhere', community: 'Fastest-growing Indian community globally' },
  },
  de: {
    visa: { type: 'National (Type D) student visa', processTime: '6–12 weeks', validity: 'Duration of course + 18 mo job search', notes: 'APS certificate; blocked account €11,904; health insurance.' },
    lifestyle: { climate: 'Cool temperate', language: 'German (many programmes in English)', food: 'Indian groceries in every big city', community: 'Large and growing Indian student community' },
  },
  es: {
    visa: { type: 'Long-stay student visa', processTime: '4–8 weeks', validity: 'Duration of course', notes: 'Padrón registration on arrival; NIE within 30 days.' },
    lifestyle: { climate: 'Warm Mediterranean', language: 'Spanish (business schools in English)', food: 'Fresh Mediterranean + Indian restaurants in cities', community: 'Growing Indian presence in Madrid & Barcelona' },
  },
  ae: {
    visa: { type: 'Student residence visa', processTime: '2–4 weeks', validity: 'Renewed yearly', notes: 'Sponsored by the university; Emirates ID issued locally.' },
    lifestyle: { climate: 'Desert — hot summers, mild winters', language: 'Arabic + English everywhere', food: 'Huge Indian community & food scene', community: 'One of the largest Indian populations abroad' },
  },
  sg: {
    visa: { type: 'Student pass (ICA)', processTime: '3–4 weeks', validity: 'Duration of course', notes: 'IPA issued after admission; medicals in Singapore.' },
    lifestyle: { climate: 'Tropical — warm year-round', language: 'English + Tamil (official)', food: 'Full Indian food scene', community: 'Very large Tamil & Indian community' },
  },
};
