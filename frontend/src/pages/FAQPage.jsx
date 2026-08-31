import React from 'react';

import Navbar from '../components/Navbar';
import FAQ from '../components/FAQ';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">

      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-4">

        <div className="max-w-4xl">

          <div className="text-[10px] mono uppercase tracking-[0.2em] text-coral">
            Help Centre
          </div>

          <h1 className="serif text-5xl sm:text-6xl lg:text-7xl leading-[0.96] mt-4">
            Questions deserve
            <br />
            <span className="italic">clear answers.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[14px] sm:text-[15px] leading-relaxed text-ink/60">
            Find answers about studying abroad, admissions, fees,
            eligibility, applications and the Route Your Career process.
          </p>

        </div>

      </section>


      {/* YOUR EXISTING FAQ ACCORDION */}
      <FAQ />


      <CTABanner />

      <Footer />

      <AiChatWidget />

    </div>
  );
}
