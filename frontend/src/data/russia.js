// =========================================================
// ROUTE YOUR CAREER
// RUSSIA — MBBS / MEDICAL STUDY HUB
// =========================================================
//
// IMPORTANT:
// Russian university tuition varies by university,
// programme/language track and academic year.
//
// Store Russian course fees in RUB in the Admin/Courses
// system. INR equivalents should come from the live
// currency conversion system.
//
// =========================================================

export const russiaData = {

  code: 'ru',

  name: 'Russia',

  flag:
    'https://flagcdn.com/w80/ru.png',


  // =====================================================
  // SEO
  // =====================================================

  seo: {

    title:
      'MBBS in Russia for Indian Students | Universities, Fees & Admission',

    description:
      'Explore MBBS in Russia for Indian students. Compare medical universities, tuition fees in Russian Rubles, eligibility, admission process, living costs and student support.'

  },


  // =====================================================
  // HERO
  // =====================================================

  tagline:
    'MBBS in Russia for Indian Students',

  intro:
    'Russia offers multiple medical universities for international students, including six-year General Medicine programmes. Tuition is normally charged in Russian Rubles (RUB). Programme language, clinical training, internship structure and eligibility should be checked university by university before admission.',

  hero:
    '/universities/russia/russia-medical.jpg',


  // =====================================================
  // GALLERY
  // =====================================================

  gallery: [

    '/universities/russia/russia-campus.jpg',

    '/universities/russia/russia-medical-2.jpg',

    '/universities/russia/russia-city.jpg'

  ],


  // =====================================================
  // QUICK FACTS
  // =====================================================

  quickFacts: [

    {
      k: 'Duration',
      v: 'Generally 6 years'
    },

    {
      k: 'Fee currency',
      v: 'Russian Ruble (₽ RUB)'
    },

    {
      k: 'Medium',
      v: 'English / Russian — programme specific'
    },

    {
      k: 'Budget',
      v: 'University-specific · live ₹ conversion'
    },

    {
      k: 'Intake',
      v: 'Usually annual · university specific'
    },

    {
      k: 'Climate',
      v: 'Cold winters · varies by region'
    }

  ],


  // =====================================================
  // ELIGIBILITY
  // =====================================================

  eligibility: [

    {
      k: 'NEET',

      v:
        'Indian students planning to obtain a primary medical qualification abroad and later seek registration in India should satisfy the applicable NEET and NMC requirements for their admission year.'
    },

    {
      k: 'Class XII',

      v:
        'Applicants generally need Physics, Chemistry and Biology in Class XII. Exact marks and entrance requirements vary by university.'
    },

    {
      k: 'Programme structure',

      v:
        'Do not select a university only because it advertises an English-medium course. Confirm the complete programme, clinical training and internship structure for your long-term licensing plan.'
    },

    {
      k: 'Language',

      v:
        'Some universities offer General Medicine in English, while others use Russian or mixed-language arrangements. Russian-language skills are important for communication with patients during clinical training.'
    },

    {
      k: 'Passport',

      v:
        'A valid passport is required for university admission, invitation, visa and migration procedures.'
    }

  ],


  // =====================================================
  // UNIVERSITIES
  // =====================================================
  //
  // We will later move the main university display to
  // your Admin/Courses database.
  //
  // Keep RUB as the original fee currency.
  // =====================================================

  universities: [

    {

      name:
        'Sechenov University',

      short:
        'Sechenov',

      city:
        'Moscow',

      fee:
        'Current RUB fee to be confirmed',

      duration:
        '6 years',

      medium:
        'English / Russian — track specific',

      notes:
        'Major medical university in Moscow. Confirm the current international tuition, programme language and admission conditions before application.',

      img:
        '/universities/russia/sechenov.jpg'

    },


    {

      name:
        'Pirogov University',

      short:
        'Pirogov',

      city:
        'Moscow',

      fee:
        'Current RUB fee to be confirmed',

      duration:
        '6 years',

      medium:
        'Programme specific',

      notes:
        'Medical university in Moscow. Tuition and language track should be verified for the relevant academic year and international applicant category.',

      img:
        '/universities/russia/pirogov.jpg'

    },


    {

      name:
        'Rostov State Medical University',

      short:
        'RostSMU',

      city:
        'Rostov-on-Don',

      fee:
        '₽373,900 first year (2026–27 English General Medicine)',

      duration:
        '6 years',

      medium:
        'English',

      notes:
        'The university currently lists a six-year English-medium General Medicine programme. Current fees and admission terms should always be reconfirmed before payment.',

      img:
        '/universities/russia/rostov.jpg'

    },


    {

      name:
        'Kazan State Medical University',

      short:
        'KSMU',

      city:
        'Kazan',

      fee:
        'Current RUB fee to be confirmed',

      duration:
        '6 years',

      medium:
        'Programme specific',

      notes:
        'Established medical university in Kazan. Confirm the current General Medicine language track, tuition, admission requirements and clinical structure before application.',

      img:
        '/universities/russia/kazan.jpg'

    },


    {

      name:
        'Bashkir State Medical University',

      short:
        'BSMU',

      city:
        'Ufa',

      fee:
        'Current RUB fee to be confirmed',

      duration:
        '6 years',

      medium:
        'Programme specific',

      notes:
        'Medical university in Ufa with international students. Current tuition, programme language and admission terms should be confirmed for the relevant intake.',

      img:
        '/universities/russia/bashkir.jpg'

    },


    {

      name:
        'Orenburg State Medical University',

      short:
        'OrSMU',

      city:
        'Orenburg',

      fee:
        'Current RUB fee to be confirmed',

      duration:
        '6 years',

      medium:
        'Programme specific',

      notes:
        'State medical university in Orenburg. Verify current tuition in RUB, programme language, clinical training and admission conditions before application.',

      img:
        '/universities/russia/orenburg.jpg'

    }

  ],


  // =====================================================
  // COST PLANNING
  // =====================================================

  feeBreakdown: [

    {

      head:
        'Tuition',

      value:
        'Stored and compared in Russian Rubles (RUB). Fees vary significantly by university and academic year.'

    },

    {

      head:
        'INR equivalent',

      value:
        'Shown approximately using the RYC live currency system. Exchange rates change, so INR values are planning estimates rather than university invoices.'

    },

    {

      head:
        'Accommodation',

      value:
        'University dormitory or private accommodation costs vary by city and room type.'

    },

    {

      head:
        'Food & transport',

      value:
        'Monthly living expenses depend heavily on city and student lifestyle.'

    },

    {

      head:
        'Other costs',

      value:
        'Visa, migration registration, insurance, medical checks, documentation and travel may be additional.'

    }

  ],


  // =====================================================
  // DOCUMENTS
  // =====================================================

  documents: [

    'Valid passport',

    'Class X marksheet and certificate',

    'Class XII marksheet and certificate',

    'NEET scorecard / qualification document',

    'Passport-size photographs',

    'Birth certificate where required',

    'Medical fitness and medical test documents where required',

    'University application documents',

    'Translated / notarised / legalised documents where applicable',

    'Admission / invitation documents',

    'Visa and migration documents'

  ],


  // =====================================================
  // ADMISSION TIMELINE
  // =====================================================

  timeline: [

    {

      m:
        'Step 1',

      title:
        'Student profile review',

      body:
        'Review NEET status, Class XII academics, budget, preferred city and long-term licensing plan.'

    },

    {

      m:
        'Step 2',

      title:
        'University and programme verification',

      body:
        'Compare universities and verify programme duration, teaching language, clinical structure, tuition in RUB and admission requirements.'

    },

    {

      m:
        'Step 3',

      title:
        'Application and documents',

      body:
        'Submit the selected university application and prepare the required academic and identification documents.'

    },

    {

      m:
        'Step 4',

      title:
        'Admission and invitation',

      body:
        'After university approval, complete the admission and invitation process required for the student visa.'

    },

    {

      m:
        'Step 5',

      title:
        'Visa and travel preparation',

      body:
        'Complete visa formalities, insurance and travel planning, and confirm accommodation before departure.'

    },

    {

      m:
        'Step 6',

      title:
        'Arrival and registration',

      body:
        'Complete university enrolment, migration registration, accommodation check-in and other required post-arrival formalities.'

    }

  ],


  // =====================================================
  // FAQ
  // =====================================================

  faqs: [

    {

      q:
        'In which currency are MBBS fees paid in Russia?',

      a:
        'Russian universities generally publish and collect tuition in Russian Rubles (RUB). Route Your Career therefore stores Russian course fees in RUB and shows INR only as an approximate live conversion.'

    },

    {

      q:
        'How long is General Medicine in Russia?',

      a:
        'Many Russian General Medicine specialist programmes are six years. The exact programme structure should still be checked with the selected university.'

    },

    {

      q:
        'Is medicine in Russia taught in English?',

      a:
        'English-medium General Medicine is available at some universities, but language arrangements are university and programme specific. Students should verify the complete course language rather than relying on a general country-level claim.'

    },

    {

      q:
        'Do medical students need to learn Russian?',

      a:
        'Russian is important for daily life and especially for communication with patients and hospital staff during clinical training, even when academic teaching is offered in English.'

    },

    {

      q:
        'Is NEET required for Indian students?',

      a:
        'Indian students intending to pursue a primary medical qualification abroad and later seek registration in India should follow the NEET and Foreign Medical Graduate requirements applicable to their admission year.'

    },

    {

      q:
        'Are Russian universities NMC approved?',

      a:
        'Students should not select a foreign university merely because an agent describes it as NMC approved. Students should verify that the foreign medical programme satisfies the applicable requirements for their intended licensing pathway.'

    },

    {

      q:
        'Why does RYC show both RUB and INR?',

      a:
        'RUB is the university fee currency. INR is shown only as a planning conversion so Indian families can understand the approximate cost. The actual payable amount and exchange rate can change.'

    },

    {

      q:
        'How should I choose a Russian medical university?',

      a:
        'Compare the programme language, total duration, clinical training and internship structure, current tuition, city, accommodation, patient communication environment and your future licensing requirements before deciding.'

    }

  ]

};
