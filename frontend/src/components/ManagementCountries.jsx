import React from 'react';
import { Link } from 'react-router-dom';

import {
  managementCountries
} from '../mock';

import {
  ArrowUpRight,
  Star,
  GraduationCap,
  Route,
  Globe2
} from 'lucide-react';


export default function ManagementCountries() {

  return (

    <section
      id="management"
      className="py-24 bg-sand grain-bg"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6">


        {/* =====================================================
            HEADING
        ===================================================== */}

        <div className="flex flex-wrap justify-between items-end gap-6">


          <div className="max-w-3xl">

            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              / 05 — Management Abroad

            </div>


            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">

              Study business globally.

              <br />

              <em className="font-light">
                Build the career route around you.
              </em>

            </h2>


            <p className="mt-5 text-ink/70 text-[15px] leading-relaxed max-w-3xl">

              Explore international undergraduate and postgraduate
              management programmes across leading study destinations.

              Compare course level, tuition, academics, English
              requirements, career goals, location and budget before
              deciding where to apply.

            </p>

          </div>


          <Link
            to="/build-my-route"
            className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold"
          >

            <Route className="h-4 w-4" />

            Build My Management Route

          </Link>

        </div>



        {/* =====================================================
            PROGRAMME TYPES
        ===================================================== */}

        <div className="mt-8 flex flex-wrap gap-2">

          {[
            'BBA',
            'BSc Business',
            'MSc Management',
            'Master in Management',
            'MBA',
            'Finance',
            'Marketing',
            'Business Analytics',
            'International Business'
          ].map(item => (

            <span
              key={item}
              className="rounded-full bg-white border border-ink/10 px-3 py-1.5 text-[10px] font-semibold text-ink/65"
            >

              {item}

            </span>

          ))}

        </div>



        {/* =====================================================
            COUNTRY CARDS
        ===================================================== */}

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">


          {managementCountries.map(
            (country, index) => {

              const countryLink =

                country.code === 'it'
                  ? '/countries/italy'
                  : `/country/${country.code}`;


              return (

                <Link
                  key={country.code}
                  to={countryLink}
                  className="group relative rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift block"
                >


                  {/* IMAGE */}

                  <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">

                    <img
                      src={country.img}
                      alt={`Study management in ${country.name}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />


                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />



                    {/* BADGE */}

                    {country.tag && (

                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-coral text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1">

                        {country.featured && (

                          <Star className="h-3 w-3 fill-current" />

                        )}

                        {country.tag}

                      </div>

                    )}



                    {/* NUMBER */}

                    <div className="absolute top-3 right-3 text-[9px] mono uppercase tracking-widest text-cream/70">

                      {String(index + 1).padStart(2, '0')}
                      {' / '}
                      {String(
                        managementCountries.length
                      ).padStart(2, '0')}

                    </div>



                    {/* COUNTRY */}

                    <div className="absolute bottom-4 left-4 right-4">

                      <div className="flex items-center gap-2 text-cream">

                        <img
                          src={country.flag}
                          alt={`${country.name} flag`}
                          className="h-4 w-6 rounded-sm ring-1 ring-white/20"
                        />

                        <div className="serif text-2xl font-light leading-none">

                          {country.name}

                        </div>

                      </div>

                    </div>

                  </div>



                  {/* CONTENT */}

                  <div className="p-5">


                    {/* TUITION */}

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <div className="text-[9px] mono uppercase tracking-widest text-ink/40">

                          Tuition planning

                        </div>

                        <div className="serif text-[17px] font-medium text-ink mt-1">

                          {country.fee}

                        </div>

                      </div>


                      <ArrowUpRight className="h-4 w-4 text-ink/25 transition-transform group-hover:rotate-45" />

                    </div>



                    {/* DESCRIPTION */}

                    <p className="mt-3 text-[12px] text-ink/65 leading-relaxed">

                      {country.desc}

                    </p>



                    {/* PROGRAMS */}

                    {Array.isArray(
                      country.programs
                    ) &&
                    country.programs.length > 0 && (

                      <div className="mt-4">

                        <div className="text-[9px] mono uppercase tracking-widest text-ink/35 mb-2">

                          Programme examples

                        </div>


                        <div className="flex flex-wrap gap-1.5">

                          {country.programs.map(
                            program => (

                              <span
                                key={program}
                                className="inline-flex items-center rounded-full bg-cream border border-ink/10 text-ink/70 text-[9px] px-2.5 py-1"
                              >

                                {program}

                              </span>

                            )
                          )}

                        </div>

                      </div>

                    )}



                    {/* EXPLORE */}

                    <div className="mt-5 pt-4 border-t border-ink/10 flex items-center gap-2 text-[10px] font-semibold text-coral">

                      Explore programmes

                      <ArrowUpRight className="h-3.5 w-3.5" />

                    </div>

                  </div>

                </Link>

              );

            }
          )}

        </div>



        {/* =====================================================
            ITALY SPOTLIGHT NOTE
        ===================================================== */}

        <div
          id="italy-management"
          className="mt-12 rounded-[32px] bg-white border border-ink/10 p-6 sm:p-8"
        >

          <div className="grid lg:grid-cols-[auto_1fr_auto] gap-5 items-center">


            <div className="h-12 w-12 rounded-full bg-coral/10 text-coral grid place-items-center">

              <GraduationCap className="h-5 w-5" />

            </div>


            <div>

              <div className="text-[10px] mono uppercase tracking-widest text-coral">

                Italy Spotlight

              </div>


              <h3 className="serif text-2xl sm:text-3xl mt-1">

                Public-university management options with scholarship potential.

              </h3>


              <p className="mt-2 text-[12px] leading-relaxed text-ink/55 max-w-3xl">

                Italy can be attractive for students exploring public
                universities and regional scholarship opportunities,
                but tuition and scholarship outcomes depend on the
                university, programme, family-income documentation
                and eligibility.

                Do not treat “zero tuition” as guaranteed.

              </p>

            </div>


            <Link
              to="/countries/italy"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[12px] font-semibold whitespace-nowrap"
            >

              Explore Italy

              <ArrowUpRight className="h-4 w-4" />

            </Link>

          </div>

        </div>



        {/* =====================================================
            MANAGEMENT CTA
        ===================================================== */}

        <div className="mt-10 rounded-[32px] bg-ink text-cream p-7 sm:p-9">

          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">


            <div>

              <div className="text-[10px] mono uppercase tracking-widest text-coral flex items-center gap-2">

                <Globe2 className="h-3.5 w-3.5" />

                Compare your route

              </div>


              <h3 className="serif text-3xl sm:text-4xl mt-2">

                Not every management destination fits every student.

              </h3>


              <p className="mt-3 text-[12px] sm:text-[13px] leading-relaxed text-cream/60 max-w-3xl">

                Your academics, degree level, English profile,
                budget, preferred destination and career objective
                can change which programmes make sense.

                Build My Route helps you compare your options before
                you start applying.

              </p>

            </div>


            <div className="flex flex-wrap gap-3">

              <Link
                to="/build-my-route"
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[12px] font-bold"
              >

                Build My Route

                <ArrowUpRight className="h-4 w-4" />

              </Link>


              <Link
                to="/start-application"
                className="inline-flex items-center gap-2 rounded-full bg-white text-ink px-5 py-3 text-[12px] font-semibold"
              >

                Start Application

              </Link>

            </div>

          </div>

        </div>


      </div>

    </section>

  );

}
