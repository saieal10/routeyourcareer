import React from 'react';

import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import FAQ from '../components/FAQ';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';

import {
  CircleHelp,
  GraduationCap,
  Globe2,
  MessageCircle
} from 'lucide-react';


export default function FAQPage() {

  return (

    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />

      <Navbar />


      {/* ===================================================
          FAQ HERO
      =================================================== */}

      <section
        className="
          relative
          overflow-hidden

          border-b
          border-ink/10
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
              grid
              lg:grid-cols-[1fr_0.65fr]

              gap-12

              items-end
            "
          >


            {/* ===============================================
                LEFT SIDE
            =============================================== */}

            <div>

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

                <CircleHelp className="h-3.5 w-3.5" />

                Student Help Centre

              </div>


              <h1
                className="
                  serif

                  mt-6

                  text-5xl
                  sm:text-6xl
                  lg:text-7xl

                  leading-[0.92]
                "
              >

                Questions before

                <br />

                <span className="italic text-coral">

                  choosing your route?

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

                Find answers to common questions about
                studying abroad, MBBS admissions,
                universities, eligibility, applications
                and the Route Your Career process.

              </p>

            </div>


            {/* ===============================================
                RIGHT SIDE CARDS
            =============================================== */}

            <div
              className="
                grid
                grid-cols-2

                gap-3
              "
            >


              {/* MBBS */}

              <div
                className="
                  rounded-[22px]

                  border
                  border-ink/10

                  bg-white

                  p-5
                "
              >

                <div
                  className="
                    h-10
                    w-10

                    rounded-xl

                    bg-coral/10

                    grid
                    place-items-center

                    text-coral
                  "
                >

                  <GraduationCap className="h-5 w-5" />

                </div>


                <div
                  className="
                    mt-4

                    text-[12px]
                    font-bold
                  "
                >
                  MBBS Abroad
                </div>


                <div
                  className="
                    mt-1

                    text-[10px]
                    leading-relaxed

                    text-ink/45
                  "
                >
                  Eligibility, countries, fees and admissions.
                </div>

              </div>


              {/* GLOBAL STUDY */}

              <div
                className="
                  rounded-[22px]

                  border
                  border-ink/10

                  bg-white

                  p-5
                "
              >

                <div
                  className="
                    h-10
                    w-10

                    rounded-xl

                    bg-ink

                    grid
                    place-items-center

                    text-cream
                  "
                >

                  <Globe2 className="h-5 w-5" />

                </div>


                <div
                  className="
                    mt-4

                    text-[12px]
                    font-bold
                  "
                >
                  Study Abroad
                </div>


                <div
                  className="
                    mt-1

                    text-[10px]
                    leading-relaxed

                    text-ink/45
                  "
                >
                  Courses, universities and global options.
                </div>

              </div>


              {/* GUIDANCE */}

              <div
                className="
                  col-span-2

                  rounded-[22px]

                  bg-ink

                  p-5

                  text-cream
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-4
                  "
                >

                  <div
                    className="
                      h-10
                      w-10

                      shrink-0

                      rounded-xl

                      bg-coral

                      grid
                      place-items-center
                    "
                  >

                    <MessageCircle className="h-5 w-5" />

                  </div>


                  <div>

                    <div
                      className="
                        text-[12px]
                        font-bold
                      "
                    >
                      Still have a question?
                    </div>


                    <div
                      className="
                        mt-1

                        text-[10px]
                        leading-relaxed

                        text-cream/60
                      "
                    >
                      Use the RYC Guidance Bot available on
                      this page for quick guidance.
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* DECORATIVE CIRCLE */}

        <div
          className="
            absolute

            -right-32
            -top-32

            h-[430px]
            w-[430px]

            rounded-full

            border
            border-coral/10

            pointer-events-none
          "
        />

      </section>


      {/* ===================================================
          YOUR EXISTING FAQ COMPONENT

          We are reusing the FAQ that was previously
          displayed on the homepage.
      =================================================== */}

      <section
        id="questions"
        className="scroll-mt-28"
      >

        <FAQ />

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
