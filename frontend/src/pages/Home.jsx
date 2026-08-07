import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CountryMarquee from '../components/CountryMarquee';
import WhyChoose from '../components/WhyChoose';
import FeaturedCountries from '../components/FeaturedCountries';
import Countries from '../components/Countries';
import JourneyTimeline from '../components/JourneyTimeline';
import AboutUs from '../components/AboutUs';
import AiAgents from '../components/AiAgents';
import Comparison from '../components/Comparison';
import Offices from '../components/Offices';
import FAQ from '../components/FAQ';
import CTABanner from '../components/CTABanner';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

export default function Home() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <CountryMarquee />
      <WhyChoose />
      <FeaturedCountries />
      <Countries />
      <JourneyTimeline />
      <AboutUs />
      <AiAgents />
      <Comparison />
      <Offices />
      <FAQ />
      <CTABanner />
      <Newsletter />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
