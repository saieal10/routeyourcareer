import React from 'react';
import AnnouncementBar from '../components/AnnouncementBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CountryMarquee from '../components/CountryMarquee';
import WhyChoose from '../components/WhyChoose';
import JourneyTimeline from '../components/JourneyTimeline';
import Countries from '../components/Countries';
import Testimonials from '../components/Testimonials';
import Founder from '../components/Founder';
import Counsellors from '../components/Counsellors';
import Universities from '../components/Universities';
import VideoStories from '../components/VideoStories';
import AiAgents from '../components/AiAgents';
import Offices from '../components/Offices';
import Comparison from '../components/Comparison';
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
      <JourneyTimeline />
      <Countries />
      <Testimonials />
      <Founder />
      <Universities />
      <Counsellors />
      <AiAgents />
      <Comparison />
      <VideoStories />
      <Offices />
      <CTABanner />
      <Newsletter />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
