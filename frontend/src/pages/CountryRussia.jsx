import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  WalletCards
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { russiaData } from '../data/russia';


const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || '';


/*
=========================================================
SECTION TITLE
=========================================================
*/

function SectionTitle({
  eyebrow,
  title,
  body
}) {

  return (

    <div className="max-w-3xl">

      <div className="text-[10px] mono uppercase tracking-[0.2em] text-coral">
        {eyebrow}
      </div>

      <h2 className="serif text-3xl sm:text-4xl mt-2 text-ink">
        {title}
      </h2>

      {body && (

        <p className="mt-3 text-[13px] sm:text-[14px] leading-relaxed text-ink/55">
          {body}
        </p>

      )}

    </div>

  );

}


/*
=========================================================
COUNTRY RUSSIA
=========================================================
*/

export default function CountryRussia() {

  const [openFaq, setOpenFaq] =
    useState(0);

  const [fx, setFx] =
    useState(null);


  /*
  ---------------------------------------------------------
  SEO + LIVE CURRENCY
  ---------------------------------------------------------
  */

  useEffect(() => {

    document.title =
      russiaData.seo.title;


    let meta =
      document.querySelector(
        'meta[name="description"]'
      );


    if (!meta) {

      meta =
        document.createElement(
          'meta'
        );

      meta.setAttribute(
        'name',
        'description'
      );

      document.head.appendChild(
        meta
      );

    }


    meta.setAttribute(
      'content',
      russiaData.seo.description
    );


    /*
    -------------------------------------------------------
    LOAD LIVE FX
    -------------------------------------------------------
    */

    fetch(
      `${BACKEND_URL}/api/currency/rates`
    )

      .then(response => {

        if (!response.ok) {
          return null;
        }

        return response.json();

      })

      .then(data => {

        if (
          data?.rates?.RUB &&
          data?.rates?.INR
        ) {

          setFx(data);

        }

      })

      .catch(() => {

        // Russia page still works if
        // currency provider is unavailable.

      });


  }, []);


  /*
  ---------------------------------------------------------
  RUB → INR
  ---------------------------------------------------------
  */

  const rubToInr =

    fx?.rates?.RUB &&
    fx?.rates?.INR

      ? fx.rates.INR /
        fx.rates.RUB

      : null;


  return (

    <div className="min-h-screen bg-cream text-ink">

      <Navbar />


      <main>


        {/* =================================================
            HERO
        ================================================= */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10">

          <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-12 items-center">


            {/* LEFT */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/10 px-3 py-2 text-[10px] mono uppercase tracking-widest text-ink/55">

                <img
                  src={russiaData.flag}
                  alt="Russia flag"
                  className="h-4 w-6 object-cover rounded-sm"
                />

                Russia · Medicine Abroad

              </div>


              <h1 className="serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mt-6">

                {russiaData.tagline}

              </h1>


              <p className="mt-6 max-w-2xl text-[14px] sm:text-[15px] leading-relaxed text-ink/60">

                {russiaData.intro}

              </p>


              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  to="/start-application"
                  className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[12px] font-semibold"
                >

                  Start Application

                  <ArrowRight className="h-4 w-4" />

                </Link>


                <Link
                  to="/build-my-route"
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/15 px-5 py-3 text-[12px] font-semibold"
                >

                  Build My Route

                </Link>

              </div>

            </div>


            {/* HERO IMAGE */}

            <div className="rounded-[34px] overflow-hidden bg-ink/5 aspect-[4/3]">

              <img
                src={russiaData.hero}
                alt="Study medicine in Russia"
                className="w-full h-full object-cover"

                onError={event => {

                  event.currentTarget.style.display =
                    'none';

                }}
              />

            </div>

          </div>

        </section>



        {/* =================================================
            QUICK FACTS
        ================================================= */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 rounded-[28px] bg-white border border-ink/10 overflow-hidden">

            {russiaData.quickFacts.map(
              item => (

                <div
                  key={item.k}
                  className="p-5 border-r border-b lg:border-b-0 border-ink/10 last:border-r-0"
                >

                  <div className="text-[9px] mono uppercase tracking-widest text-ink/35">

                    {item.k}

                  </div>


                  <div className="mt-2 text-[12px] font-semibold">

                    {item.v}

                  </div>

                </div>

              )
            )}

          </div>

        </section>



        {/* =================================================
            ELIGIBILITY
        ================================================= */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

          <SectionTitle

            eyebrow="Eligibility"

            title="Check the programme, not just the country."

            body="For Indian students, the long-term licensing pathway matters as much as the admission itself."

          />


          <div className="mt-8 grid md:grid-cols-2 gap-4">

            {russiaData.eligibility.map(
              item => (

                <div
                  key={item.k}
                  className="rounded-3xl bg-white border border-ink/10 p-5"
                >

                  <div className="flex gap-3">

                    <div className="h-8 w-8 rounded-full bg-forest/10 text-forest grid place-items-center shrink-0">

                      <Check className="h-4 w-4" />

                    </div>


                    <div>

                      <div className="text-[12px] font-semibold">

                        {item.k}

                      </div>


                      <p className="mt-1 text-[11px] leading-relaxed text-ink/55">

                        {item.v}

                      </p>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </section>



        {/* =================================================
            COST + LIVE CURRENCY
        ================================================= */}

        <section className="bg-ink text-cream">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">


            <div className="max-w-3xl">

              <div className="text-[10px] mono uppercase tracking-[0.2em] text-coral">

                Cost planning

              </div>


              <h2 className="serif text-3xl sm:text-4xl mt-2">

                Russia stays in RUB.
                <br />
                You plan in INR.

              </h2>


              <p className="mt-3 text-[13px] sm:text-[14px] leading-relaxed text-cream/60">

                University fees should be stored in Russian Rubles.
                RYC uses exchange-rate data only to provide an
                approximate Indian Rupee planning value.

              </p>

            </div>


            {/* LIVE RATE */}

            {rubToInr && (

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px]">

                <WalletCards className="h-4 w-4" />

                Current planning rate:

                <strong>
                  ₽1 ≈ ₹
                  {rubToInr.toFixed(2)}
                </strong>

              </div>

            )}


            {/* COST ITEMS */}

            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-5 gap-3">

              {russiaData.feeBreakdown.map(
                item => (

                  <div
                    key={item.head}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >

                    <div className="text-[9px] mono uppercase tracking-widest text-cream/40">

                      {item.head}

                    </div>


                    <div className="mt-2 text-[11px] leading-relaxed text-cream/70">

                      {item.value}

                    </div>

                  </div>

                )
              )}

            </div>


            <div className="mt-5 flex items-start gap-2 text-[10px] text-cream/45">

              <CircleAlert className="h-4 w-4 shrink-0" />

              <span>

                Exchange-rate conversions are approximate.
                University invoices and bank/payment-provider
                exchange rates may differ.

              </span>

            </div>

          </div>

        </section>



        {/* =================================================
            UNIVERSITIES
        ================================================= */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

          <SectionTitle

            eyebrow="Universities"

            title="Explore Russian medical universities."

            body="These are starting points for comparison. Current fees, programme language and programme structure should be verified before application."

          />


          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {russiaData.universities.map(
              university => (

                <div
                  key={university.name}
                  className="rounded-[28px] bg-white border border-ink/10 overflow-hidden"
                >


                  {/* UNIVERSITY IMAGE */}

                  <div className="aspect-[16/9] bg-ink/5">

                    <img
                      src={university.img}
                      alt={university.name}
                      className="w-full h-full object-cover"

                      onError={event => {

                        event.currentTarget.style.display =
                          'none';

                      }}
                    />

                  </div>


                  <div className="p-5">

                    <div className="text-[9px] mono uppercase tracking-widest text-coral">

                      {university.city}

                    </div>


                    <h3 className="serif text-2xl mt-1">

                      {university.name}

                    </h3>


                    <div className="mt-4 grid grid-cols-2 gap-2">


                      {/* TUITION */}

                      <div className="rounded-xl bg-cream p-3">

                        <div className="text-[8px] mono uppercase tracking-widest text-ink/35">

                          Tuition

                        </div>


                        <div className="mt-1 text-[10px] font-semibold">

                          {university.fee}

                        </div>

                      </div>


                      {/* DURATION */}

                      <div className="rounded-xl bg-cream p-3">

                        <div className="text-[8px] mono uppercase tracking-widest text-ink/35">

                          Duration

                        </div>


                        <div className="mt-1 text-[10px] font-semibold">

                          {university.duration}

                        </div>

                      </div>


                      {/* MEDIUM */}

                      <div className="rounded-xl bg-cream p-3 col-span-2">

                        <div className="text-[8px] mono uppercase tracking-widest text-ink/35">

                          Teaching language

                        </div>


                        <div className="mt-1 text-[10px] font-semibold">

                          {university.medium}

                        </div>

                      </div>

                    </div>


                    <p className="mt-4 text-[11px] leading-relaxed text-ink/50">

                      {university.notes}

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </section>



        {/* =================================================
            ADMISSION + DOCUMENTS
        ================================================= */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

          <div className="grid lg:grid-cols-2 gap-10">


            {/* TIMELINE */}

            <div>

              <SectionTitle

                eyebrow="Admission"

                title="From shortlist to arrival."

              />


              <div className="mt-7 space-y-3">

                {russiaData.timeline.map(
                  item => (

                    <div
                      key={item.m}
                      className="rounded-2xl bg-white border border-ink/10 p-5"
                    >

                      <div className="text-[9px] mono uppercase tracking-widest text-coral">

                        {item.m}

                      </div>


                      <div className="mt-1 text-[13px] font-semibold">

                        {item.title}

                      </div>


                      <p className="mt-1 text-[11px] leading-relaxed text-ink/50">

                        {item.body}

                      </p>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* DOCUMENTS */}

            <div>

              <SectionTitle

                eyebrow="Documents"

                title="Prepare the basics early."

              />


              <div className="mt-7 rounded-[28px] bg-white border border-ink/10 p-5">

                {russiaData.documents.map(
                  document => (

                    <div
                      key={document}
                      className="flex items-start gap-3 py-3 border-b last:border-b-0 border-ink/5"
                    >

                      <Check className="h-4 w-4 text-forest shrink-0 mt-0.5" />


                      <div className="text-[11px] text-ink/65">

                        {document}

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </section>



        {/* =================================================
            FAQ
        ================================================= */}

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">

          <SectionTitle

            eyebrow="FAQ"

            title="Questions students ask about MBBS in Russia."

          />


          <div className="mt-7 space-y-2">

            {russiaData.faqs.map(
              (item, index) => (

                <div
                  key={item.q}
                  className="rounded-2xl bg-white border border-ink/10 overflow-hidden"
                >


                  <button

                    type="button"

                    onClick={() =>
                      setOpenFaq(
                        openFaq === index
                          ? -1
                          : index
                      )
                    }

                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >

                    <span className="text-[12px] font-semibold">

                      {item.q}

                    </span>


                    <ChevronDown

                      className={`h-4 w-4 transition-transform ${
                        openFaq === index
                          ? 'rotate-180'
                          : ''
                      }`}

                    />

                  </button>


                  {openFaq === index && (

                    <div className="px-5 pb-5 text-[11px] leading-relaxed text-ink/55">

                      {item.a}

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        </section>



        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">

          <div className="rounded-[34px] bg-coral p-7 sm:p-10 text-white">

            <div className="max-w-3xl">

              <div className="text-[10px] mono uppercase tracking-widest text-white/60">

                Route Your Career

              </div>


              <h2 className="serif text-4xl sm:text-5xl mt-2">

                Compare Russia with your complete route.

              </h2>


              <p className="mt-4 text-[13px] text-white/75 leading-relaxed">

                Tell us your academics, budget and preferences.
                RYC can compare published course records instead
                of choosing a university only from an advertised
                fee.

              </p>


              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/start-application"
                  className="rounded-full bg-ink text-cream px-5 py-3 text-[12px] font-semibold"
                >

                  Start Application

                </Link>


                <Link
                  to="/build-my-route"
                  className="rounded-full bg-white text-ink px-5 py-3 text-[12px] font-semibold"
                >

                  Build My Route

                </Link>

              </div>

            </div>

          </div>

        </section>


      </main>


      <Footer />

    </div>

  );

}
