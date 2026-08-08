import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CountryMarquee from '../components/CountryMarquee';
import Programs from '../components/Programs';
import WhyChoose from '../components/WhyChoose';
import FeaturedCountries from '../components/FeaturedCountries';
import ManagementCountries from '../components/ManagementCountries';
import ItalySpotlight from '../components/ItalySpotlight';
import FeeCalculator from '../components/FeeCalculator';
import Countries from '../components/Countries';
import AboutUs from '../components/AboutUs';
import Comparison from '../components/Comparison';
import Blogs from '../components/Blogs';
import Offices from '../components/Offices';
import FAQ from '../components/FAQ';
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
      <Programs />
      <WhyChoose />
      <FeaturedCountries />
      <ManagementCountries />
      <ItalySpotlight />
      <FeeCalculator />
      <Countries />
      <AboutUs />
      <Comparison />
      <Blogs />
      <Offices />
      <FAQ />
      <CTABanner />
      <Newsletter />
      <Footer />
      <AiChatWidget />
    </div>
  );
}
