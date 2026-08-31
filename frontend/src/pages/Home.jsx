import React from 'react';

import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CountryMarquee from '../components/CountryMarquee';
import Programs from '../components/Programs';
import ManagementCountries from '../components/ManagementCountries';
import MediaHub from '../components/MediaHub';
import FeeCalculator from '../components/FeeCalculator';
import CTABanner from '../components/CTABanner';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';


export default function Home() {

  return (

    <div className="min-h-screen bg-cream text-ink">

      <AnnouncementBar />

      <Navbar />

      <Hero />

      <CountryMarquee />


      {/* ===================================================
          02 — CHOOSE YOUR STUDY TRACK

          Medical Education + Management
      =================================================== */}

      <Programs />


      {/* ===================================================
          STUDENT TESTIMONIALS + RYC YOUTUBE

          Moved directly after "Choose your study track"
      =================================================== */}

      <MediaHub />


      {/* ===================================================
          MANAGEMENT ABROAD

          KEEP THIS SECTION
      =================================================== */}

      <ManagementCountries />


      {/* ===================================================
          FEE / BUDGET TOOL
      =================================================== */}

      <FeeCalculator />


      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <CTABanner />


      {/* ===================================================
          NEWSLETTER
      =================================================== */}

      <Newsletter />


      {/* ===================================================
          FOOTER
      =================================================== */}

      <Footer />


      {/* ===================================================
          FLOATING RYCe GUIDANCE BOT
      =================================================== */}

      <AiChatWidget />

    </div>

  );

}
