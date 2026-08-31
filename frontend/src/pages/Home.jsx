import React from 'react';

import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CountryMarquee from '../components/CountryMarquee';
import Programs from '../components/Programs';
import FeaturedCountries from '../components/FeaturedCountries';
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


      {/* MAIN STUDY ROUTES */}

      <Programs />


      {/* MBBS DESTINATIONS */}

      <FeaturedCountries />


      {/* MANAGEMENT DESTINATIONS */}

      <ManagementCountries />


      {/* 
        NEW DYNAMIC SECTION

        Left:
        Student testimonials

        Right:
        RYC YouTube videos

        Everything comes from Admin → Media.
      */}

      <MediaHub />


      {/* FEE / BUDGET TOOL */}

      <FeeCalculator />


      {/* FINAL CTA */}

      <CTABanner />


      <Newsletter />

      <Footer />

      <AiChatWidget />

    </div>

  );

}
