import React from 'react';
import { Link } from 'react-router-dom';

import {
  spotlightGeorgia,
  spotlightUzbekistan
} from '../mock';

import {
  ArrowUpRight,
  Check,
  Star,
  Route
} from 'lucide-react';


/*
=========================================================
RUSSIA HOMEPAGE SPOTLIGHT

Keep detailed university/fee information on the Russia
country page and in the Admin/Courses database.
=========================================================
*/

const spotlightRussia = {

  name: 'Russia',

  flag:
    'https://flagcdn.com/w80/ru.png',

  hero:
    '/universities/russia/russia-medical.jpg',

  gallery: [
    '/universities/russia/russia-campus.jpg',
    '/universities/russia/russia-medical-2.jpg',
    '/universities/russia/russia-city.jpg'
  ],

  headline:
    'A broad medical university landscape with fees in RUB.',

  intro:
    'Russia offers multiple General Medicine options for international students. Compare universities carefully by programme language, clinical training, city, tuition and your long-term licensing pathway.',

  fee:
    'RUB + ₹',

  duration:
    '6 years',

  medium:
    'Programme specific',

  highlights: [
    'Tuition compared in Russian Rubles (RUB)',
    'Approximate INR conversion for budget planning',
    'Multiple cities and university options',
    'Programme language verified university by university'
  ],

  universities: [
    'Sechenov University',
    'Pirogov University',
    'Rostov State Medical University',
    'Kazan State Medical University',
    'Bashkir State Medical University',
    'Orenburg State Medical University'
  ]

};



/*
=========================================================
SPOTLIGHT CARD
=========================================================
*/

function SpotlightCard({
  data,
  side = 'left',
  deepLink,
  badge = 'Explore destination'
}) {

  const isLeft =
    side === 'left';


  return (

    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">


      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className={`lg:col-span-6 ${
          !isLeft
            ? 'lg:order-2'
            : ''
        }`}
      >

        <div className="relative">


          {/* BACKGROUND SHAPE */}

          <div
            className={`absolute -inset-4 ${
              isLeft
                ? 'bg-coral/10'
                : 'bg-forest/10'
            } blob`}
          />


          {/* MAIN IMAGE */}

          <div className="relative rounded-3xl overflow-hidden bg-ink/5 aspect-[5/6]">

            <img
              src={data.hero}
              alt={`Study MBBS in ${data.name}`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              onError={event => {
                event.currentTarget.style.display =
                  'none';
              }}
            />

          </div>


          {/* BADGE */}

          <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur text-ink text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5">

            <Star className="h-3 w-3 fill-coral text-coral" />

            {badge}

          </div>


          {/* GALLERY */}

          {Array.isArray(data.gallery) &&
            data.gallery.length > 0 && (

              <div className="absolute -bottom-4 -right-2 sm:-right-4 grid grid-cols-3 gap-2">

                {data.gallery
                  .slice(0, 3)
                  .map((image, index) => (

                    <div
                      key={index}
                      className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden ring-4 ring-cream bg-ink/5"
                    >

                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={event => {
                          event.currentTarget.style.display =
                            'none';
                        }}
                      />

                    </div>

                  ))}

              </div>

            )}

        </div>

      </div>



      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className={`lg:col-span-6 ${
          !isLeft
            ? 'lg:order-1'
            : ''
        }`}
      >


        {/* COUNTRY */}

        <div className="flex items-center gap-3">

          <img
            src={data.flag}
            alt={`${data.name} flag`}
            className="h-6 w-9 rounded-sm ring-1 ring-black/10 object-cover"
          />


          <div className="text-[11px] mono uppercase tracking-widest text-coral">

            MBBS in {data.name}

          </div>

        </div>



        {/* HEADLINE */}

        <h3 className="mt-4 serif text-4xl sm:text-5xl font-normal leading-[0.98] text-ink">

          {data.headline}

        </h3>



        {/* INTRO */}

        <p className="mt-5 text-ink/70 text-[14px] sm:text-[15px] leading-relaxed max-w-xl">

          {data.intro}

        </p>



        {/* =================================================
            QUICK FACTS
        ================================================= */}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">

          {[
            {
              k: data.fee,
              v: 'Fee planning'
            },

            {
              k: data.duration,
              v: 'Duration'
            },

            {
              k: data.medium,
              v: 'Medium'
            }

          ].map(item => (

            <div
              key={item.v}
              className="rounded-2xl border border-ink/10 bg-white p-4"
            >

              <div className="serif text-[19px] font-medium text-ink leading-tight">

                {item.k}

              </div>


              <div className="text-[9px] mono uppercase tracking-widest text-ink/45 mt-2">

                {item.v}

              </div>

            </div>

          ))}

        </div>



        {/* =================================================
            HIGHLIGHTS
        ================================================= */}

        <div className="mt-6">

          <div className="text-[10px] mono uppercase tracking-widest text-ink/45">

            What to compare

          </div>


          <ul className="mt-3 space-y-2.5">

            {data.highlights.map(item => (

              <li
                key={item}
                className="flex items-start gap-2.5 text-[13px] sm:text-[14px] text-ink/75"
              >

                <div className="h-5 w-5 rounded-full bg-forest text-cream grid place-items-center shrink-0 mt-0.5">

                  <Check className="h-3 w-3" />

                </div>

                <span>
                  {item}
                </span>

              </li>

            ))}

          </ul>

        </div>



        {/* =================================================
            UNIVERSITIES
        ================================================= */}

        {Array.isArray(data.universities) &&
          data.universities.length > 0 && (

            <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-4">

              <div className="text-[10px] mono uppercase tracking-widest text-ink/45 mb-3">

                Universities to explore

              </div>


              <div className="flex flex-wrap gap-2">

                {data.universities.map(
                  university => (

                    <span
                      key={university}
                      className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink/75 text-[11px] px-3 py-1.5"
                    >

                      {university}

                    </span>

                  )
                )}

              </div>

            </div>

          )}



        {/* =================================================
            CTA
        ================================================= */}

        <div className="mt-7 flex flex-wrap gap-3">


          <Link
            to={deepLink}
            className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold hover:bg-forest transition"
          >

            Explore MBBS in {data.name}

            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

          </Link>


          <Link
            to="/build-my-route"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 text-ink px-5 py-3 text-[13px] font-semibold hover:bg-ink hover:text-cream transition"
          >

            <Route className="h-4 w-4" />

            Compare My Route

          </Link>


          <Link
            to="/start-application"
            className="inline-flex items-center px-2 py-3 text-[12px] font-semibold text-coral hover:text-ink"
          >

            Start Application →

          </Link>

        </div>

      </div>

    </div>

  );

}



/*
=========================================================
FEATURED MBBS COUNTRIES
=========================================================
*/

export default function FeaturedCountries() {

  return (

    <section
      id="featured"
      className="py-24 bg-cream"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6">


        {/* =================================================
            SECTION HEADING
        ================================================= */}

        <div className="max-w-4xl">

          <div className="text-[11px] mono uppercase tracking-widest text-coral">

            / 03 — MBBS Abroad

          </div>


          <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">

            Compare the destination.

            <br />

            <em className="font-light">

              Then choose the university.

            </em>

          </h2>


          <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-3xl">

            Start with the factors that actually affect your
            medical pathway — programme structure, eligibility,
            teaching language, clinical environment, total cost
            and your plans after graduation.

          </p>


          <div className="mt-6 flex flex-wrap gap-2">

            {[
              'Georgia',
              'Uzbekistan',
              'Russia'
            ].map(country => (

              <span
                key={country}
                className="rounded-full bg-white border border-ink/10 px-4 py-2 text-[11px] font-semibold"
              >

                {country}

              </span>

            ))}

          </div>

        </div>



        {/* =================================================
            GEORGIA
        ================================================= */}

        <div className="mt-16">

          <SpotlightCard
            data={spotlightGeorgia}
            side="left"
            deepLink="/countries/georgia"
            badge="Featured MBBS destination"
          />

        </div>



        {/* =================================================
            UZBEKISTAN
        ================================================= */}

        <div className="mt-24">

          <SpotlightCard
            data={spotlightUzbekistan}
            side="right"
            deepLink="/countries/uzbekistan"
            badge="Featured MBBS destination"
          />

        </div>



        {/* =================================================
            RUSSIA
        ================================================= */}

        <div className="mt-24">

          <SpotlightCard
            data={spotlightRussia}
            side="left"
            deepLink="/countries/russia"
            badge="Explore Russia"
          />

        </div>



        {/* =================================================
            MBBS ROUTE CTA
        ================================================= */}

        <div className="mt-20 rounded-[32px] bg-ink text-cream p-7 sm:p-10">

          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">

            <div className="max-w-3xl">

              <div className="text-[10px] mono uppercase tracking-widest text-coral">

                Don't choose from a country list alone

              </div>


              <h3 className="serif text-3xl sm:text-4xl mt-2">

                Find the medical route that fits your profile.

              </h3>


              <p className="mt-3 text-[13px] leading-relaxed text-cream/60">

                Enter your academics, NEET status, budget and
                destination preferences. Build My Route compares
                the published course information available on RYC
                and shows what still needs verification.

              </p>

            </div>


            <Link
              to="/build-my-route"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-coral text-white px-6 py-3.5 text-[13px] font-bold whitespace-nowrap"
            >

              Build My MBBS Route

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

            </Link>

          </div>

        </div>


      </div>

    </section>

  );

}
