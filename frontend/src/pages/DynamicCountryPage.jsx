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

    <article className="rounded-[28px] bg-white border border-ink/10 overflow-hidden card-lift flex flex-col">

      {/* IMAGE */}

      <div className="relative aspect-[16/10] bg-ink/5 overflow-hidden">

        <img
          src={image}
          alt={university.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          onError={event => {
            event.currentTarget.src =
              'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80';
          }}
        />

      </div>


      {/* CONTENT */}

      <div className="p-5 flex flex-col flex-1">

        <div className="flex items-center gap-2 text-[9px] mono uppercase tracking-widest text-coral">

          <MapPin className="h-3.5 w-3.5" />

          {university.city || university.country}

        </div>


        <h3 className="serif text-2xl mt-2 leading-tight">

          {university.name}

        </h3>


        {university.overview && (

          <p className="mt-3 text-[11px] leading-relaxed text-ink/50 line-clamp-3">

            {university.overview}

          </p>

        )}


        {/* COURSE */}

        <div className="mt-5">

          <div className="text-[9px] mono uppercase tracking-widest text-ink/35">

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

            {primaryCourse?.medium ||
            university.medium
              ? ` · ${
                  primaryCourse?.medium ||
                  university.medium
                }`
              : ''}

          </div>

        </div>


        {/* TUITION */}

        <div className="mt-5 rounded-2xl bg-cream border border-ink/10 p-4">

          <div className="text-[9px] mono uppercase tracking-widest text-ink/35">

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
            className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-4 py-2.5 text-[11px] font-semibold"
          >

            Compare Route

            <ArrowUpRight className="h-3.5 w-3.5" />

          </Link>


          <Link
            to="/start-application"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[11px] font-semibold"
          >

            Start Application

          </Link>

        </div>

      </div>

    </article>

  );

}



export default function DynamicCountryPage() {

  const { country } =
    useParams();


  const countryName =
    titleCase(country);


  const [universities, setUniversities] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {

    let cancelled =
      false;


    async function loadCountry() {

      setLoading(true);
      setError('');


      try {

        const [
          universityResponse,
          courseResponse
        ] = await Promise.all([

          fetch(
            `${API_URL}/api/universities`
          ),

          fetch(
            `${API_URL}/api/courses`
          )

        ]);


        if (
          !universityResponse.ok ||
          !courseResponse.ok
        ) {

          throw new Error(
            'Could not load country data.'
          );

        }


        const universityData =
          await universityResponse.json();

        const courseData =
          await courseResponse.json();


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


        const filteredUniversities =
          universityList.filter(
            item => {

              const sameCountry =
                String(
                  item.country || ''
                )
                  .trim()
                  .toLowerCase() ===
                countryName
                  .trim()
                  .toLowerCase();


              const published =
                String(
                  item.status || ''
                )
                  .trim()
                  .toLowerCase() ===
                'published';


              return (
                sameCountry &&
                published
              );

            }
          );


        const universityIds =
          new Set(
            filteredUniversities.map(
              item => item.id
            )
          );


        const filteredCourses =
          courseList.filter(
            course =>
              universityIds.has(
                course.university_id
              ) &&
              String(
                course.status || ''
              )
                .trim()
                .toLowerCase() ===
                'published'
          );


        if (!cancelled) {

          setUniversities(
            filteredUniversities
          );

          setCourses(
            filteredCourses
          );

        }

      }
      catch (err) {

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

  }, [countryName]);


  const stream =
    useMemo(() => {

      const first =
        universities[0];

      return (
        first?.stream ||
        'International Study'
      );

    }, [universities]);


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


      {/* HERO */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12">

        <div className="max-w-4xl">

          <div className="text-[10px] mono uppercase tracking-[0.2em] text-coral">

            {stream} · {countryName}

          </div>


          <h1 className="serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mt-4">

            Study in {countryName}.

          </h1>


          <p className="mt-5 text-[14px] sm:text-[15px] leading-relaxed text-ink/60 max-w-3xl">

            Explore published universities and programmes
            currently available through Route Your Career.

            Compare location, programme, duration and tuition
            before building your route.

          </p>


          <div className="mt-7 flex flex-wrap gap-3">

            <Link
              to="/build-my-route"
              className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[12px] font-semibold"
            >

              <Route className="h-4 w-4" />

              Build My Route

            </Link>


            <Link
              to="/start-application"
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-3 text-[12px] font-semibold"
            >

              Start Application

            </Link>

          </div>

        </div>

      </section>



      {/* STATS */}

      {!loading &&
        universities.length > 0 && (

          <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">

            <div className="grid sm:grid-cols-3 rounded-3xl bg-white border border-ink/10 overflow-hidden">

              <div className="p-5 border-r border-ink/10">

                <div className="text-[9px] mono uppercase tracking-widest text-ink/35">

                  Universities

                </div>

                <div className="serif text-3xl mt-1">

                  {universities.length}

                </div>

              </div>


              <div className="p-5 border-r border-ink/10">

                <div className="text-[9px] mono uppercase tracking-widest text-ink/35">

                  Published programmes

                </div>

                <div className="serif text-3xl mt-1">

                  {courses.length}

                </div>

              </div>


              <div className="p-5">

                <div className="text-[9px] mono uppercase tracking-widest text-ink/35">

                  Study track

                </div>

                <div className="serif text-2xl mt-1">

                  {stream}

                </div>

              </div>

            </div>

          </section>

        )}



      {/* UNIVERSITIES */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">

        <div className="flex items-end justify-between gap-4 flex-wrap">

          <div>

            <div className="text-[10px] mono uppercase tracking-widest text-coral flex items-center gap-2">

              <Building2 className="h-4 w-4" />

              Universities

            </div>


            <h2 className="serif text-4xl sm:text-5xl mt-2">

              Explore universities in {countryName}.

            </h2>

          </div>

        </div>



        {loading && (

          <div className="mt-8 rounded-3xl bg-white border border-ink/10 p-10 text-center text-[13px] text-ink/50">

            Loading universities…

          </div>

        )}



        {error && (

          <div className="mt-8 rounded-3xl bg-red-50 border border-red-200 p-6 text-[12px] text-red-700">

            {error}

          </div>

        )}



        {!loading &&
          !error &&
          universities.length === 0 && (

            <div className="mt-8 rounded-3xl bg-white border border-ink/10 p-8 sm:p-10">

              <GraduationCap className="h-7 w-7 text-coral" />


              <h3 className="serif text-2xl mt-4">

                Universities are being updated.

              </h3>


              <p className="mt-2 text-[12px] text-ink/55 max-w-xl">

                There are currently no published university
                records for {countryName}. Contact RYC or use
                Build My Route to discuss available options.

              </p>


              <Link
                to="/build-my-route"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[11px] font-semibold"
              >

                Build My Route

              </Link>

            </div>

          )}



        {!loading &&
          !error &&
          universities.length > 0 && (

            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">

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

        <div className="mt-8 flex items-start gap-2 text-[10px] text-ink/40 max-w-3xl">

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
