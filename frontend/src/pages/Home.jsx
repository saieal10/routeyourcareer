import React from 'react';

import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Programs from '../components/Programs';
import FeaturedCountries from '../components/FeaturedCountries';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import AiChatWidget from '../components/AiChatWidget';

import MediaHub from '../components/MediaHub';


export default function Home() {

  return (

    <div className="min-h-screen bg-cream text-ink">

      {/* TOP */}

      <AnnouncementBar />

      <Navbar />


      {/* 1. HERO */}

      <Hero />


      {/* 2. TWO STUDY ROUTES
          Medical Education + Management
      */}

      <Programs />


      {/* 3. POPULAR / FEATURED DESTINATIONS */}

      <FeaturedCountries />


      {/* 4. YOUTUBE + TESTIMONIALS */}

      <MediaHub />


      {/* 5. FINAL CTA */}

      <CTABanner />


      {/* FOOTER */}

      <Footer />


      {/* FLOATING AI GUIDE */}

      <AiChatWidget />

    </div>

  );

}
