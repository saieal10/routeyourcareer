import React from 'react';
import { offices, brand } from '../mock';

import {
  MapPin,
  Phone,
  Star
} from 'lucide-react';


/*
=========================================================
ADDITIONAL RYC PRESENCE

Existing states continue coming from mock.js.
These four are added here so you don't need to edit
mock.js right now.
=========================================================
*/

const additionalStates = [

  {
    state: 'Gujarat',
    city: 'Gujarat',
    img: null,
    hq: false
  },

  {
    state: 'Delhi NCR',
    city: 'Delhi',
    img: null,
    hq: false
  },

  {
    state: 'Bihar',
    city: 'Bihar',
    img: null,
    hq: false
  },

  {
    state: 'Uttar Pradesh',
    city: 'Uttar Pradesh',
    img: null,
    hq: false
  }

];


/*
=========================================================
BUILD COMPLETE STATE LIST

Prevents duplicate states if you later add any of these
to mock.js.
=========================================================
*/

const allStates = [

  ...offices,

  ...additionalStates.filter(
    extra =>
      !offices.some(
        existing =>
          String(
            existing.state || ''
          ).toLowerCase() ===
          extra.state.toLowerCase()
      )
  )

];


export default function Offices() {

  return (

    <section
      id="offices"
      className="py-24 bg-sand grain-bg"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="grid lg:grid-cols-12 gap-8 items-end">


          <div className="lg:col-span-7">

            <div className="text-[11px] mono uppercase tracking-widest text-coral">

              / 07 — RYC Across India

            </div>


            <h2 className="serif mt-3 text-5xl sm:text-6xl font-normal leading-[0.95] text-ink">

              Nine regions.

              <br />

              <em className="font-light">

                One guidance network.

              </em>

            </h2>

          </div>


          <div className="lg:col-span-5">

            <p className="text-ink/70 text-[15px] leading-relaxed">

              Route Your Career is currently present across
              Karnataka, Maharashtra, Kerala, Tamil Nadu,
              Telangana, Gujarat, Delhi NCR, Bihar and
              Uttar Pradesh.

            </p>


            <p className="mt-3 text-[12px] leading-relaxed text-ink/50">

              Students can connect with RYC digitally through
              WhatsApp, calls and online counselling regardless
              of their location.

            </p>

          </div>

        </div>



        {/* =================================================
            STATE GRID
        ================================================= */}

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">


          {allStates.map(
            (office, index) => (

              <div
                key={`${office.state}-${index}`}
                className="group relative rounded-3xl overflow-hidden bg-white border border-ink/10 card-lift"
              >


                <div className="relative aspect-[3/4] overflow-hidden">


                  {/* =========================================
                      IMAGE OR FALLBACK
                  ========================================= */}

                  {office.img ? (

                    <img
                      src={office.img}
                      alt={`Route Your Career presence in ${office.state}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                  ) : (

                    <div className="absolute inset-0 bg-ink">

                      <div className="absolute inset-0 opacity-[0.08]">

                        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full border-[32px] border-cream" />

                        <div className="absolute bottom-10 -left-12 w-40 h-40 rounded-full border-[24px] border-coral" />

                      </div>


                      <div className="absolute inset-0 grid place-items-center">

                        <div className="h-20 w-20 rounded-full border border-cream/20 bg-white/5 grid place-items-center">

                          <MapPin className="h-8 w-8 text-coral" />

                        </div>

                      </div>

                    </div>

                  )}



                  {/* =========================================
                      OVERLAY
                  ========================================= */}

                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />



                  {/* =========================================
                      HQ BADGE
                  ========================================= */}

                  {office.hq && (

                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-coral text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1">

                      <Star className="h-3 w-3 fill-current" />

                      HQ

                    </div>

                  )}



                  {/* =========================================
                      NUMBER
                  ========================================= */}

                  <div className="absolute top-3 left-3 text-[9px] mono uppercase tracking-widest text-cream/75">

                    {String(
                      index + 1
                    ).padStart(2, '0')}

                    {' / '}

                    {String(
                      allStates.length
                    ).padStart(2, '0')}

                  </div>



                  {/* =========================================
                      STATE INFO
                  ========================================= */}

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-cream">


                    <div className="flex items-center gap-1.5 text-[9px] mono uppercase tracking-widest text-coral">

                      <MapPin className="h-3.5 w-3.5" />

                      RYC Presence

                    </div>


                    <div className="serif text-3xl font-medium leading-tight mt-2">

                      {office.state}

                    </div>


                    {office.city &&
                      office.city !==
                        office.state && (

                        <div className="text-[11px] text-cream/55 mt-1">

                          {office.city}

                        </div>

                      )}


                    <a
                      href={`tel:${brand.phone}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-coral"
                    >

                      <Phone className="h-3.5 w-3.5" />

                      {brand.phoneDisplay}

                    </a>

                  </div>

                </div>

              </div>

            )
          )}

        </div>



        {/* =================================================
            NATIONAL ONLINE GUIDANCE
        ================================================= */}

        <div className="mt-10 rounded-[32px] bg-white border border-ink/10 p-6 sm:p-8">


          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">


            <div>

              <div className="text-[10px] mono uppercase tracking-widest text-coral">

                Outside these states?

              </div>


              <div className="mt-2 serif text-2xl sm:text-3xl text-ink">

                RYC guidance is available across India.

              </div>


              <p className="mt-2 text-[12px] sm:text-[13px] text-ink/55 leading-relaxed max-w-3xl">

                You can complete counselling, university
                shortlisting, application planning and admission
                guidance remotely through WhatsApp, phone and
                online consultation.

              </p>

            </div>



            <div className="flex flex-wrap gap-3">


              <a
                href={`https://wa.me/${brand.whatsapp.replace(
                  '+',
                  ''
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-ink text-cream px-5 py-3 text-[12px] font-semibold hover:bg-forest"
              >

                Message on WhatsApp →

              </a>


              <a
                href={`tel:${brand.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-[12px] font-semibold"
              >

                <Phone className="h-4 w-4" />

                Call RYC

              </a>

            </div>

          </div>

        </div>


      </div>

    </section>

  );

}
