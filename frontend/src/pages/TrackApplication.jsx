import React from 'react';
import { Search, ArrowUpRight } from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { brand } from '../mock';


export default function TrackApplication() {

  return (

    <div className="min-h-screen bg-cream text-ink">

      <Navbar />


      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-20">

        <div className="max-w-2xl">

          <div className="text-[10px] mono uppercase tracking-widest text-coral">
            Student Services
          </div>


          <h1 className="serif text-5xl sm:text-7xl leading-[0.95] mt-3">
            Track your
            <br />
            <em className="font-light">
              application.
            </em>
          </h1>


          <p className="mt-6 text-[15px] text-ink/60 leading-relaxed">

            Online application tracking is being connected
            to the Route Your Career admissions system.

          </p>

        </div>


        <div className="mt-10 max-w-2xl rounded-3xl bg-white border border-ink/10 p-6 sm:p-8">

          <div className="h-12 w-12 rounded-2xl bg-ink text-cream grid place-items-center">

            <Search className="h-5 w-5" />

          </div>


          <h2 className="serif text-3xl mt-5">
            Already applied?
          </h2>


          <p className="mt-3 text-[13px] text-ink/55 leading-relaxed">

            Until self-service tracking goes live,
            contact the RYC admissions team for the
            latest status of your application.

          </p>


          <a
            href={brand.applyLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-5 py-3 text-[13px] font-semibold"
          >

            Contact admissions

            <ArrowUpRight className="h-4 w-4" />

          </a>

        </div>

      </main>


      <Footer />

    </div>

  );

}
