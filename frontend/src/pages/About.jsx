import React from 'react';

import Navbar from '../components/Navbar';
import AboutUs from '../components/AboutUs';
import WhyChoose from '../components/WhyChoose';
import Offices from '../components/Offices';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';

export default function About() {
  return (
    <div className="min-h-screen bg-cream text-ink">

      <Navbar />

      {/* PAGE INTRO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-8">

        <div className="max-w-4xl">

          <div className="text-[10px] mono uppercase tracking-[0.2em] text-coral">
            About Route Your Career
          </div>

          <h1 className="serif text-5xl sm:text-6xl lg:text-7xl leading-[0.96] mt-4">
            Guidance before
            <br />
            <span className="italic">the decision.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[14px] sm:text-[15px] leading-relaxed text-ink/60">
            Route Your Career helps students understand their study
            options before choosing a university, country or application
            route. The goal is simple: make the pathway easier to
            understand and let the student make an informed decision.
          </p>

        </div>

      </section>


      {/* EXISTING ABOUT SECTION */}
      <AboutUs />


      {/* WHY RYC */}
      <div id="why-ryc">
        <WhyChoose />
      </div>


      {/* PRESENCE */}
      <div id="presence">
        <Offices />
      </div>


      {/* PROMISE */}
      <section
        id="promise"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16"
      >

        <div className="rounded-[32px] bg-ink text-cream p-8 sm:p-12">

          <div className="text-[9px] mono uppercase tracking-[0.2em] text-coral">
            Our Promise
          </div>

          <h2 className="serif text-4xl sm:text-5xl mt-3 max-w-3xl">
            Student interest comes before the application.
          </h2>

          <p className="mt-5 max-w-2xl text-[13px] sm:text-[14px] leading-relaxed text-cream/65">
            We aim to explain available routes, costs, requirements and
            practical considerations clearly before asking a student to
            proceed. A university should fit the student's academic,
            financial and career situation — not the other way around.
          </p>

        </div>

      </section>


      <CTABanner />

      <Footer />

      <AiChatWidget />

    </div>
  );
}
