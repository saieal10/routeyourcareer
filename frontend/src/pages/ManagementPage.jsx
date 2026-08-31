import React from 'react';

import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';

import ManagementCountries from '../components/ManagementCountries';
import ItalySpotlight from '../components/ItalySpotlight';
import FeeCalculator from '../components/FeeCalculator';

import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


export default function ManagementPage() {

  return (

    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />

      <Navbar />


      {/* ===================================================
          MANAGEMENT HERO
      =================================================== */}

      <section
        className="
          border-b
          border-ink/10

          bg-cream
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto

            px-4
            sm:px-6

            py-16
            sm:py-20
            lg:py-24
          "
        >

          <div
            className="
              max-w-4xl
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-2

                rounded-full

                border
                border-coral/20

                bg-coral/[0.06]

                px-4
                py-2

                text-[9px]

                mono
                uppercase

                tracking-[0.2em]

                text-coral
              "
            >
              Management Abroad
            </div>


            <h1
              className="
                serif

                mt-6

                text-5xl
                sm:text-6xl
                lg:text-7xl

                leading-[0.94]
              "
            >

              Find the right course.

              <br />

              <span className="italic text-coral">

                Then choose the country.

              </span>

            </h1>


            <p
              className="
                mt-7

                max-w-2xl

                text-[14px]
                sm:text-[15px]

                leading-[1.8]

                text-ink/55
              "
            >

              Explore undergraduate and postgraduate
              management programmes, compare study
              destinations and discover course options
              that match your academic background,
              budget and career goals.

            </p>


            <div
              className="
                mt-8

                flex
                flex-wrap

                gap-3
              "
            >

              <a
                href="#undergraduate"

                className="
                  rounded-full

                  bg-ink

                  px-5
                  py-3

                  text-[11px]
                  font-bold

                  text-cream
                "
              >
                Undergraduate
              </a>


              <a
                href="#postgraduate"

                className="
                  rounded-full

                  border
                  border-ink/10

                  bg-white

                  px-5
                  py-3

                  text-[11px]
                  font-bold
                "
              >
                Postgraduate
              </a>


              <a
                href="/countries/italy/courses"

                className="
                  rounded-full

                  border
                  border-coral/20

                  bg-coral/[0.07]

                  px-5
                  py-3

                  text-[11px]
                  font-bold

                  text-coral
                "
              >
                Italy Course Finder
              </a>

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          MANAGEMENT DESTINATIONS
      =================================================== */}

      <section
        id="management-destinations"
        className="scroll-mt-28"
      >

        <ManagementCountries />

      </section>


      {/* ===================================================
          UNDERGRADUATE
      =================================================== */}

      <section
        id="undergraduate"
        className="
          scroll-mt-28

          max-w-7xl
          mx-auto

          px-4
          sm:px-6

          py-14
        "
      >

        <div
          className="
            rounded-[30px]

            bg-white

            border
            border-ink/10

            p-7
            sm:p-10
          "
        >

          <div
            className="
              text-[9px]

              mono
              uppercase

              tracking-[0.2em]

              text-coral
            "
          >
            Undergraduate
          </div>


          <h2
            className="
              serif

              mt-2

              text-3xl
              sm:text-4xl
            "
          >
            Bachelor’s pathways abroad
          </h2>


          <p
            className="
              mt-4

              max-w-2xl

              text-[13px]
              leading-relaxed

              text-ink/55
            "
          >

            Explore business, management, finance,
            marketing, hospitality, economics and related
            undergraduate programmes across international
            universities.

          </p>

        </div>

      </section>


      {/* ===================================================
          POSTGRADUATE
      =================================================== */}

      <section
        id="postgraduate"
        className="
          scroll-mt-28

          max-w-7xl
          mx-auto

          px-4
          sm:px-6

          pb-14
        "
      >

        <div
          className="
            rounded-[30px]

            bg-ink

            text-cream

            p-7
            sm:p-10
          "
        >

          <div
            className="
              text-[9px]

              mono
              uppercase

              tracking-[0.2em]

              text-coral
            "
          >
            Postgraduate
          </div>


          <h2
            className="
              serif

              mt-2

              text-3xl
              sm:text-4xl
            "
          >
            Master’s & management pathways
          </h2>


          <p
            className="
              mt-4

              max-w-2xl

              text-[13px]
              leading-relaxed

              text-cream/60
            "
          >

            Explore MBA, MSc Management, Finance,
            International Business, Marketing and related
            postgraduate programmes based on your profile
            and career plan.

          </p>

        </div>

      </section>


      {/* ===================================================
          ITALY
      =================================================== */}

      <ItalySpotlight />


      {/* ===================================================
          FEE / BUDGET TOOL
      =================================================== */}

      <FeeCalculator />


      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <CTABanner />


      <Footer />

      <AiChatWidget />

    </div>

  );

}
