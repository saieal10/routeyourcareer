import React from 'react';

import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';

import AboutUs from '../components/AboutUs';
import WhyChoose from '../components/WhyChoose';
import Comparison from '../components/Comparison';
import Offices from '../components/Offices';

import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


export default function AboutPage() {

  return (

    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />

      <Navbar />


      {/* ===================================================
          ABOUT PAGE HERO
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden

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

            {/* SMALL LABEL */}

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

              About Route Your Career

            </div>


            {/* MAIN TITLE */}

            <h1
              className="
                serif

                mt-6

                text-5xl
                sm:text-6xl
                lg:text-7xl

                leading-[0.95]

                text-ink
              "
            >

              Education abroad,

              <br />

              <span className="italic text-coral">

                with a clearer route.

              </span>

            </h1>


            {/* DESCRIPTION */}

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

              Route Your Career helps students understand
              international education options before making
              major academic and financial decisions.

              We focus on clear information, university
              options, application guidance and practical
              support throughout the study-abroad journey.

            </p>


            {/* MINI INFORMATION ROW */}

            <div
              className="
                mt-10

                flex
                flex-wrap

                gap-3
              "
            >

              <div
                className="
                  rounded-full

                  border
                  border-ink/10

                  bg-white

                  px-4
                  py-2.5

                  text-[10px]
                  font-semibold
                "
              >
                MBBS Abroad
              </div>


              <div
                className="
                  rounded-full

                  border
                  border-ink/10

                  bg-white

                  px-4
                  py-2.5

                  text-[10px]
                  font-semibold
                "
              >
                Management Abroad
              </div>


              <div
                className="
                  rounded-full

                  border
                  border-ink/10

                  bg-white

                  px-4
                  py-2.5

                  text-[10px]
                  font-semibold
                "
              >
                University Guidance
              </div>


              <div
                className="
                  rounded-full

                  border
                  border-ink/10

                  bg-white

                  px-4
                  py-2.5

                  text-[10px]
                  font-semibold
                "
              >
                Application Support
              </div>

            </div>

          </div>

        </div>


        {/* DECORATIVE BACKGROUND */}

        <div
          className="
            absolute

            -right-32
            -top-32

            h-[420px]
            w-[420px]

            rounded-full

            border
            border-coral/10

            pointer-events-none
          "
        />

        <div
          className="
            absolute

            -right-16
            -top-16

            h-[280px]
            w-[280px]

            rounded-full

            border
            border-ink/[0.05]

            pointer-events-none
          "
        />

      </section>


      {/* ===================================================
          EXISTING ABOUT US SECTION
      =================================================== */}

      <section id="about">

        <AboutUs />

      </section>


      {/* ===================================================
          EXISTING WHY RYC SECTION

          Navbar:
          Explore → Why RYC
          goes here.
      =================================================== */}

      <section
        id="why-ryc"
        className="scroll-mt-28"
      >

        <WhyChoose />

      </section>


      {/* ===================================================
          EXISTING COMPARISON / PROMISE SECTION
      =================================================== */}

      <section
        id="promise"
        className="scroll-mt-28"
      >

        <Comparison />

      </section>


      {/* ===================================================
          EXISTING OFFICES / PRESENCE

          Navbar:
          Explore → Our Presence
          goes here.
      =================================================== */}

      <section
        id="presence"
        className="scroll-mt-28"
      >

        <Offices />

      </section>


      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <CTABanner />


      {/* ===================================================
          FOOTER
      =================================================== */}

      <Footer />


      {/* ===================================================
          GUIDANCE BOT
      =================================================== */}

      <AiChatWidget />

    </div>

  );

}
