import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  GraduationCap,
  Stethoscope,
  Route
} from 'lucide-react';

import { programs } from '../mock';

export default function Programs() {

  return (
    <section
      id="programs"
      className="py-24 bg-cream"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6">


        {/* =====================================================
            INTRO
        ===================================================== */}

        <div className="max-w-4xl">

          <div className="text-[11px] mono uppercase tracking-widest text-coral">
            / 02 — Choose your study track
          </div>


          <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">

            Two routes.
            <br />

            <em className="font-light">
              One clear decision process.
            </em>

          </h2>


          <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-3xl">

            Route Your Career helps students compare international
            study options based on academics, budget, destination,
            course structure and long-term career plans.

            Choose your study track first, then explore countries,
            universities and programmes that fit your profile.

          </p>

        </div>



        {/* =====================================================
            TRACK CARDS
        ===================================================== */}

        <div className="mt-12 grid md:grid-cols-2 gap-6">


          {programs.map((program, index) => {

            const isMbbs =
              program.key === 'mbbs';


            return (

              <article
                key={program.key}
                className="group relative rounded-[32px] overflow-hidden bg-ink text-cream card-lift flex flex-col"
              >


                {/* =============================================
                    IMAGE
                ============================================= */}

                <div className="relative aspect-[16/10] overflow-hidden">

                  <img
                    src={program.img}
                    alt={program.label}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-[1.03] transition-all duration-700"
                  />


                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/15" />


                  {/* TRACK BADGE */}

                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-coral text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5">

                    {isMbbs ? (
                      <Stethoscope className="h-3.5 w-3.5" />
                    ) : (
                      <GraduationCap className="h-3.5 w-3.5" />
                    )}

                    {isMbbs
                      ? 'Medical Education'
                      : 'Business & Management'}

                  </div>


                  {/* NUMBER */}

                  <div className="absolute top-4 right-4 text-[10px] mono uppercase tracking-widest text-cream/60">

                    {String(index + 1).padStart(2, '0')}
                    {' / '}
                    02

                  </div>


                  {/* TITLE */}

                  <div className="absolute bottom-5 left-5 right-5">

                    <div className="text-[10px] mono uppercase tracking-widest text-coral">

                      {isMbbs
                        ? 'For students pursuing medicine abroad'
                        : 'For UG & PG international business pathways'}

                    </div>


                    <div className="serif text-4xl sm:text-5xl font-light leading-none mt-2">

                      {program.label}

                    </div>

                  </div>

                </div>



                {/* =============================================
                    CONTENT
                ============================================= */}

                <div className="p-6 lg:p-8 flex flex-col flex-1">


                  {/* DESCRIPTION */}

                  <p className="text-[13px] leading-relaxed text-cream/70">

                    {isMbbs
                      ? 'Compare medical universities by tuition, programme structure, teaching language, eligibility, clinical environment and long-term licensing considerations.'
                      : 'Explore international undergraduate and postgraduate management programmes based on academics, career goals, budget, destination and future work opportunities.'}

                  </p>



                  {/* DURATION + COST */}

                  <div className="mt-6 grid grid-cols-2 gap-3">


                    <div className="rounded-2xl bg-white/5 border border-cream/10 p-4">

                      <div className="text-[9px] mono uppercase tracking-widest text-cream/45">

                        Typical duration

                      </div>

                      <div className="serif text-[19px] mt-1">

                        {program.duration}

                      </div>

                    </div>


                    <div className="rounded-2xl bg-white/5 border border-cream/10 p-4">

                      <div className="text-[9px] mono uppercase tracking-widest text-cream/45">

                        Budget range

                      </div>

                      <div className="serif text-[19px] mt-1 text-coral">

                        {program.priceRange}

                      </div>

                    </div>

                  </div>



                  {/* WHY THIS TRACK */}

                  <div className="mt-6">

                    <div className="text-[10px] mono uppercase tracking-widest text-cream/45">

                      What we compare

                    </div>


                    <ul className="mt-3 space-y-2">

                      {program.bullets.map(item => (

                        <li
                          key={item}
                          className="flex items-start gap-2 text-[13px] text-cream/80"
                        >

                          <Check className="h-4 w-4 text-coral shrink-0 mt-0.5" />

                          {item}

                        </li>

                      ))}

                    </ul>

                  </div>



                  {/* PRIORITY */}

                  <div className="mt-6">

                    <div className="text-[10px] mono uppercase tracking-widest text-cream/45">

                      Best suited for

                    </div>


                    <div className="mt-2 flex flex-wrap gap-2">

                      {program.priority.map(item => (

                        <span
                          key={item}
                          className="inline-flex items-center rounded-full bg-white/5 border border-cream/15 text-cream text-[11px] px-3 py-1.5"
                        >

                          {item}

                        </span>

                      ))}

                    </div>

                  </div>



                  {/* COUNTRIES */}

                  <div className="mt-6">

                    <div className="text-[10px] mono uppercase tracking-widest text-cream/45">

                      Explore destinations

                    </div>


                    <div className="mt-2 flex flex-wrap gap-1.5">

                      {program.countries.map(country => (

                        <span
                          key={country}
                          className="inline-flex items-center rounded-full bg-white/5 text-cream/80 text-[11px] px-2.5 py-1"
                        >

                          {country}

                        </span>

                      ))}

                    </div>

                  </div>



                  {/* =============================================
                      CTA
                  ============================================= */}

                  <div className="mt-auto pt-8 flex flex-wrap gap-3">


                    <a
                      href={
                        isMbbs
                          ? '#featured'
                          : '#management'
                      }
                      className="group inline-flex items-center gap-2 rounded-full bg-coral hover:bg-[#d94a26] text-white px-5 py-3 text-[13px] font-bold"
                    >

                      Explore {isMbbs ? 'MBBS' : 'Management'}

                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

                    </a>


                    <Link
                      to="/build-my-route"
                      className="inline-flex items-center gap-2 rounded-full border border-cream/25 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/10"
                    >

                      <Route className="h-4 w-4" />

                      Build My Route

                    </Link>


                    <Link
                      to="/start-application"
                      className="inline-flex items-center gap-2 text-[12px] font-semibold text-cream/60 hover:text-cream px-2 py-3"
                    >

                      Start Application →

                    </Link>

                  </div>

                </div>

              </article>

            );

          })}

        </div>



        {/* =====================================================
            GUIDANCE NOTE
        ===================================================== */}

        <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">

          <div className="flex items-start gap-3">

            <div className="h-9 w-9 rounded-full bg-forest/10 text-forest grid place-items-center shrink-0">

              <Route className="h-4 w-4" />

            </div>


            <div>

              <div className="text-[13px] font-semibold text-ink">

                Not sure which route fits you?

              </div>


              <p className="mt-1 text-[12px] leading-relaxed text-ink/55 max-w-3xl">

                Use Build My Route to compare options using your
                academics, preferred destination and budget instead
                of choosing a university only from advertisements
                or tuition price.

              </p>


              <Link
                to="/build-my-route"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-coral"
              >

                Build your route

                <ArrowUpRight className="h-3.5 w-3.5" />

              </Link>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
