import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Link,
  useParams
} from 'react-router-dom';

import {
  ArrowUpRight,
  Building2,
  GraduationCap,
  MapPin,
  Route,
  WalletCards
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://routeyourcareer.onrender.com';


/* =========================================================
   HELPERS
========================================================= */

function titleCase(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    );
}


function money(value, currency) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'Needs verification';
  }

  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return 'Needs verification';
  }

  const symbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    RUB: '₽'
  };

  const symbol =
    symbols[currency] ||
    currency ||
    '';

  return `${symbol} ${number.toLocaleString()}`;
}


/* =========================================================
   UNIVERSITY CARD
========================================================= */

function UniversityCard({
  university,
  courses
}) {

  const linkedCourses =
    courses.filter(
      course =>
        course.university_id ===
        university.id
    );


  const primaryCourse =
    linkedCourses[0];


  const image =
    university.image_url ||
    university.image ||
    university.hero_image ||
    university.photo_url ||
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80';


  return (

    <article
      className="
        rounded-[28px]
        bg-white
        border
        border-ink/10
        overflow-hidden
        card-lift
        flex
        flex-col
      "
    >

      {/* IMAGE */}

      <div
        className="
          relative
          aspect-[16/10]
          bg-ink/5
          overflow-hidden
        "
      >

        <img
          src={image}
          alt={university.name}
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-700
            hover:scale-105
          "
          onError={event => {

            event.currentTarget.src =
              'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80';

          }}
        />

      </div>


      {/* CONTENT */}

      <div className="p-5 flex flex-col flex-1">

        <div
          className="
            flex
            items-center
            gap-2

            text-[9px]
            mono
            uppercase
            tracking-widest

            text-coral
          "
        >

          <MapPin className="h-3.5 w-3.5" />

          {university.city || university.country}

        </div>


        <h3
          className="
            serif
            text-2xl
            mt-2
            leading-tight
          "
        >
          {university.name}
        </h3>


        {university.overview && (

          <p
            className="
              mt-3
              text-[11px]
              leading-relaxed
              text-ink/50
              line-clamp-3
            "
          >
            {university.overview}
          </p>

        )}


        {/* COURSE */}

        <div className="mt-5">

          <div
            className="
              text-[9px]
              mono
              uppercase
              tracking-widest
              text-ink/35
            "
          >
            Programme
          </div>


          <div className="mt-1 text-[12px] font-semibold">

            {primaryCourse?.name ||
              university.course ||
              'Programme details available'}

          </div>


          <div className="mt-1 text-[10px] text-ink/45">

            {primaryCourse?.duration ||
              university.duration ||
              'Duration to verify'}

            {(primaryCourse?.medium ||
              university.medium)
              ? ` · ${
                  primaryCourse?.medium ||
                  university.medium
                }`
              : ''}

          </div>

        </div>


        {/* TUITION */}

        <div
          className="
            mt-5
            rounded-2xl
            bg-cream
            border
            border-ink/10
            p-4
          "
        >

          <div
            className="
              text-[9px]
              mono
              uppercase
              tracking-widest
              text-ink/35
            "
          >
            Tuition / year
          </div>


          <div className="serif text-xl mt-1">

            {money(
              primaryCourse?.tuition_fee_year ??
                university.tuition_fee_year,

              primaryCourse?.currency ??
                university.currency
            )}

          </div>


          {primaryCourse?.tuition_fee_inr && (

            <div className="mt-1 text-[10px] text-ink/45">

              Approx. ₹
              {Number(
                primaryCourse.tuition_fee_inr
              ).toLocaleString('en-IN')}

            </div>

          )}

        </div>


        {/* CTA */}

        <div className="mt-auto pt-5 flex flex-wrap gap-2">

          <Link
            to="/build-my-route"
            className="
              inline-flex
              items-center
              gap-2

              rounded-full

              bg-ink
              text-cream

              px-4
              py-2.5

              text-[11px]
              font-semibold
            "
          >

            Career Guide

            <ArrowUpRight className="h-3.5 w-3.5" />

          </Link>


          <Link
            to="/start-application"
            className="
              inline-flex
              items-center
              gap-2

              rounded-full

              border
              border-ink/15

              px-4
              py-2.5

              text-[11px]
              font-semibold
            "
          >
            Start Application
          </Link>

        </div>

      </div>

    </article>

  );

}


/* =========================================================
   PAGE
========================================================= */

export default function DynamicCountryPage() {

  const { country } =
    useParams();


  const countryName =
    titleCase(country);


  /* =======================================================
     STATE
  ======================================================= */

  const [universities, setUniversities] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [countryPage, setCountryPage] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /* =======================================================
     LOAD COUNTRY
  ======================================================= */

  useEffect(() => {

    let cancelled =
      false;


    async function loadCountry() {

      setLoading(true);
      setError('');


      try {

        const [
          universityResponse,
          courseResponse,
          countryPageResponse
        ] = await Promise.all([

          fetch(
            `${API_URL}/api/universities?country=${encodeURIComponent(
              countryName
            )}`
          ),

          fetch(
            `${API_URL}/api/courses?country=${encodeURIComponent(
              countryName
            )}`
          ),

          fetch(
            `${API_URL}/api/country-pages/${encodeURIComponent(
              country
            )}`
          )

        ]);


        /* Universities + courses are required */

        if (!universityResponse.ok) {

          throw new Error(
            'Could not load universities.'
          );

        }


        if (!courseResponse.ok) {

          throw new Error(
            'Could not load programmes.'
          );

        }


        const universityData =
          await universityResponse.json();


        const courseData =
          await courseResponse.json();


        /*
        -------------------------------------------------------
        COUNTRY PAGE

        404 is allowed.

        It simply means the admin has not added a hero yet.
        -------------------------------------------------------
        */

        let pageData =
          null;


        if (countryPageResponse.ok) {

          pageData =
            await countryPageResponse.json();

        }


        const universityList =
          Array.isArray(universityData)
            ? universityData
            : universityData?.universities ||
              [];


        const courseList =
          Array.isArray(courseData)
            ? courseData
            : courseData?.courses ||
              [];


        if (!cancelled) {

          setUniversities(
            universityList
          );

          setCourses(
            courseList
          );

          setCountryPage(
            pageData
          );

        }

      }

      catch (err) {

        console.error(
          'Country page load error:',
          err
        );


        if (!cancelled) {

          setError(
            err.message ||
            'Could not load this destination.'
          );

        }

      }

      finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }


    loadCountry();


    return () => {
      cancelled = true;
    };

  }, [
    country,
    countryName
  ]);


  /* =======================================================
     STUDY TRACK
  ======================================================= */

  const stream =
    useMemo(() => {

      return (
        countryPage?.stream ||
        universities[0]?.stream ||
        'International Study'
      );

    }, [
      countryPage,
      universities
    ]);


  /* =======================================================
     HERO CONTENT
  ======================================================= */

  const heroImage =
    countryPage?.hero_image_url ||
    null;


  const headline =
    countryPage?.headline ||
    (
      stream === 'MBBS'
        ? `Study MBBS in ${countryName}.`
        : `Study in ${countryName}.`
    );


  const description =
    countryPage?.description ||
    `Explore published universities and programmes currently available through Route Your Career. Compare location, programme, duration and tuition before building your route.`;


  /* =======================================================
     PAGE TITLE
  ======================================================= */

  useEffect(() => {

    document.title =
      `${stream} in ${countryName} | Route Your Career`;

  }, [
    stream,
    countryName
  ]);


  return (

    <div className="min-h-screen bg-cream text-ink">

      <Navbar />


      {/* ===================================================
          HERO
      =================================================== */}

      <section
        className="
          max-w-7xl
          mx-auto

          px-4
          sm:px-6

          pt-10
          sm:pt-14

          pb-10
          sm:pb-12
        "
      >

        <div
          className={`
            grid

            gap-8
            lg:gap-12

            items-center

            ${
              heroImage
                ? 'lg:grid-cols-[0.88fr_1.12fr]'
                : 'grid-cols-1'
            }
          `}
        >


          {/* =================================================
              HERO TEXT
          ================================================= */}

          <div
            className={
              heroImage
                ? ''
                : 'max-w-4xl'
            }
          >

            <div
              className="
                text-[10px]

                mono
                uppercase

                tracking-[0.20em]

                text-coral
              "
            >

              {stream} · {countryName}

            </div>


            <h1
              className="
                serif

                text-5xl
                sm:text-6xl
                lg:text-[72px]

                leading-[0.96]

                mt-4
              "
            >

              {headline}

            </h1>


            <p
              className="
                mt-5

                text-[14px]
                sm:text-[15px]

                leading-relaxed

                text-ink/60

                max-w-2xl
              "
            >

              {description}

            </p>


            <div
              className="
                mt-7

                flex
                flex-wrap

                gap-3
              "
            >

              <Link
                to="/build-my-route"
                className="
                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  bg-ink
                  hover:bg-forest

                  text-cream

                  px-5
                  py-3

                  text-[12px]
                  font-semibold

                  transition
                "
              >

                <Route className="h-4 w-4" />

                Career Guide

              </Link>


              <Link
                to="/start-application"
                className="
                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  border
                  border-ink/15

                  bg-white

                  px-5
                  py-3

                  text-[12px]
                  font-semibold

                  hover:border-coral

                  transition
                "
              >

                Start Application

                <ArrowUpRight className="h-3.5 w-3.5" />

              </Link>

            </div>

          </div>


          {/* =================================================
              HERO IMAGE
          ================================================= */}

          {heroImage && (

            <div className="relative">

              <div
                className="
                  relative

                  rounded-[30px]

                  overflow-hidden

                  bg-ink/5

                  aspect-[16/10]

                  shadow-sm

                  border
                  border-ink/10
                "
              >

                <img
                  src={heroImage}
                  alt={`Study in ${countryName}`}
                  className="
                    absolute
                    inset-0

                    w-full
                    h-full

                    object-cover
                  "
                  onError={event => {

                    console.error(
                      'Hero image failed:',
                      heroImage
                    );

                    event.currentTarget.style.display =
                      'none';

                  }}
                />


                {/* GRADIENT */}

                <div
                  className="
                    absolute
                    inset-x-0
                    bottom-0

                    h-[38%]

                    bg-gradient-to-t
                    from-black/45
                    via-black/10
                    to-transparent

                    pointer-events-none
                  "
                />


                {/* COUNTRY LABEL */}

                <div
                  className="
                    absolute

                    left-5
                    bottom-5
                  "
                >

                  <div
                    className="
                      rounded-full

                      bg-white/90

                      backdrop-blur

                      px-4
                      py-2

                      text-[9px]

                      mono
                      uppercase

                      tracking-widest

                      text-ink

                      shadow-sm
                    "
                  >

                    Explore {countryName}

                  </div>

                </div>

              </div>


              {/* CORAL ACCENT */}

              <div
                className="
                  absolute

                  -bottom-3
                  -left-3

                  hidden
                  sm:block

                  rounded-2xl

                  bg-coral

                  text-white

                  px-4
                  py-3

                  shadow-lg
                "
              >

                <div
                  className="
                    text-[8px]

                    mono
                    uppercase

                    tracking-widest
                  "
                >
                  Route Your Career
                </div>


                <div
                  className="
                    text-[11px]

                    font-semibold

                    mt-1
                  "
                >
                  Compare before you apply
                </div>

              </div>

            </div>

          )}

        </div>

      </section>


      {/* ===================================================
          STATS
      =================================================== */}

      {!loading &&
        universities.length > 0 && (

          <section
            className="
              max-w-7xl
              mx-auto

              px-4
              sm:px-6

              pb-12
            "
          >

            <div
              className="
                grid
                sm:grid-cols-3

                rounded-3xl

                bg-white

                border
                border-ink/10

                overflow-hidden
              "
            >


              <div
                className="
                  p-5
                  sm:p-6

                  sm:border-r
                  border-ink/10
                "
              >

                <div
                  className="
                    text-[9px]

                    mono
                    uppercase

                    tracking-widest

                    text-ink/35
                  "
                >
                  Universities
                </div>


                <div className="serif text-3xl mt-1">

                  {universities.length}

                </div>

              </div>


              <div
                className="
                  p-5
                  sm:p-6

                  border-t
                  sm:border-t-0

                  sm:border-r

                  border-ink/10
                "
              >

                <div
                  className="
                    text-[9px]

                    mono
                    uppercase

                    tracking-widest

                    text-ink/35
                  "
                >
                  Published programmes
                </div>


                <div className="serif text-3xl mt-1">

                  {courses.length}

                </div>

              </div>


              <div
                className="
                  p-5
                  sm:p-6

                  border-t
                  sm:border-t-0
                "
              >

                <div
                  className="
                    text-[9px]

                    mono
                    uppercase

                    tracking-widest

                    text-ink/35
                  "
                >
                  Study track
                </div>


                <div className="serif text-2xl mt-1">

                  {stream}

                </div>

              </div>


            </div>

          </section>

        )}


      {/* ===================================================
          UNIVERSITIES
      =================================================== */}

      <section
        className="
          max-w-7xl
          mx-auto

          px-4
          sm:px-6

          pb-20
        "
      >

        <div>

          <div
            className="
              text-[10px]

              mono
              uppercase

              tracking-widest

              text-coral

              flex
              items-center
              gap-2
            "
          >

            <Building2 className="h-4 w-4" />

            Universities

          </div>


          <h2
            className="
              serif

              text-4xl
              sm:text-5xl

              mt-2
            "
          >

            Explore universities in {countryName}.

          </h2>

        </div>


        {/* LOADING */}

        {loading && (

          <div
            className="
              mt-8

              rounded-3xl

              bg-white

              border
              border-ink/10

              p-10

              text-center

              text-[13px]

              text-ink/50
            "
          >
            Loading universities…
          </div>

        )}


        {/* ERROR */}

        {error && (

          <div
            className="
              mt-8

              rounded-3xl

              bg-red-50

              border
              border-red-200

              p-6

              text-[12px]

              text-red-700
            "
          >
            {error}
          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          universities.length === 0 && (

            <div
              className="
                mt-8

                rounded-3xl

                bg-white

                border
                border-ink/10

                p-8
                sm:p-10
              "
            >

              <GraduationCap className="h-7 w-7 text-coral" />


              <h3 className="serif text-2xl mt-4">

                Universities are being updated.

              </h3>


              <p
                className="
                  mt-2

                  text-[12px]

                  text-ink/55

                  max-w-xl
                "
              >

                There are currently no published university
                records for {countryName}. Use Career Guide
                to discuss available options.

              </p>


              <Link
                to="/build-my-route"
                className="
                  mt-5

                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  bg-ink
                  text-cream

                  px-5
                  py-3

                  text-[11px]
                  font-semibold
                "
              >

                Career Guide

              </Link>

            </div>

          )}


        {/* UNIVERSITY GRID */}

        {!loading &&
          !error &&
          universities.length > 0 && (

            <div
              className="
                mt-8

                grid

                md:grid-cols-2
                lg:grid-cols-3

                gap-5
              "
            >

              {universities.map(
                university => (

                  <UniversityCard
                    key={university.id}
                    university={university}
                    courses={courses}
                  />

                )
              )}

            </div>

          )}


        {/* NOTE */}

        <div
          className="
            mt-8

            flex
            items-start
            gap-2

            text-[10px]

            text-ink/40

            max-w-3xl
          "
        >

          <WalletCards className="h-4 w-4 shrink-0" />

          Tuition displayed on RYC is based on the current
          published database record and may change by academic
          year or university. Confirm current fees before
          payment or admission.

        </div>

      </section>


      <Footer />

    </div>

  );

}
