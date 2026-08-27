import React from 'react';

import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  ArrowUpRight
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { brand } from '../mock';


export default function Footer() {

  const countries = [
    { name: 'Georgia', slug: 'georgia' },
    { name: 'Russia', slug: 'russia' },
    { name: 'Uzbekistan', slug: 'uzbekistan' },
    { name: 'Armenia', slug: 'armenia' },
    { name: 'Tajikistan', slug: 'tajikistan' },
    { name: 'Kazakhstan', slug: 'kazakhstan' },
    { name: 'Kyrgyzstan', slug: 'kyrgyzstan' },
    { name: 'Moldova', slug: 'moldova' },
    { name: 'Egypt', slug: 'egypt' },
    { name: 'Ireland', slug: 'ireland' },
    { name: 'Nepal', slug: 'nepal' }
  ];


  return (

    <footer className="bg-ink text-cream/80">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">


        <div className="grid lg:grid-cols-12 gap-10">


          {/* =================================================
              BRAND
          ================================================= */}

          <div className="lg:col-span-5">

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-full bg-cream text-ink grid place-items-center serif italic text-lg font-medium">
                r
              </div>


              <div>

                <div className="serif text-[20px] font-medium text-cream">
                  Route Your Career
                </div>

                <div className="text-[10px] mono uppercase tracking-[0.22em] text-coral">
                  Your pathway · MBBS + Management
                </div>

              </div>

            </div>


            <p className="mt-6 text-[14px] leading-relaxed max-w-md text-cream/60">

              Route Your Career helps students explore international
              education, compare universities and understand their
              pathway from career guidance to application.

            </p>


            <div className="mt-8 space-y-3 text-[13px]">


              <a
                href={`tel:${brand.phone}`}
                className="flex items-center gap-3 hover:text-coral"
              >
                <Phone className="h-4 w-4 text-coral" />

                {brand.phoneDisplay}
              </a>


              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-3 hover:text-coral"
              >
                <Mail className="h-4 w-4 text-coral" />

                {brand.email}
              </a>


              <div className="flex items-center gap-3">

                <MapPin className="h-4 w-4 text-coral" />

                Serving students across India

              </div>


            </div>


            {/* SOCIAL */}

            <div className="mt-6 flex items-center gap-2">


              <a
                href="https://www.facebook.com/share/1HFXZJteo1/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-10 w-10 rounded-full border border-cream/15 grid place-items-center hover:bg-coral hover:border-coral hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>


              <a
                href="https://www.instagram.com/route_your_career"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full border border-cream/15 grid place-items-center hover:bg-coral hover:border-coral hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>


              <a
                href="https://www.youtube.com/@route_your_career"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="h-10 w-10 rounded-full border border-cream/15 grid place-items-center hover:bg-coral hover:border-coral hover:text-white"
              >
                <Youtube className="h-4 w-4" />
              </a>


            </div>

          </div>


          {/* =================================================
              EXPLORE
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">
              Explore
            </div>


            <ul className="mt-5 space-y-2.5 text-[13px]">

              <li>
                <Link
                  to="/build-my-route"
                  className="hover:text-coral"
                >
                  Career Guide
                </Link>
              </li>


              <li>
                <a
                  href="/#featured"
                  className="hover:text-coral"
                >
                  MBBS Abroad
                </a>
              </li>


              <li>
                <a
                  href="/#management"
                  className="hover:text-coral"
                >
                  Management Abroad
                </a>
              </li>


              <li>
                <Link
                  to="/quiz"
                  className="hover:text-coral"
                >
                  Course Finder
                </Link>
              </li>


              <li>
                <Link
                  to="/track-application"
                  className="hover:text-coral"
                >
                  Track Application
                </Link>
              </li>


              <li>
                <a
                  href="/#blog"
                  className="hover:text-coral"
                >
                  Blog
                </a>
              </li>

            </ul>

          </div>


          {/* =================================================
              COUNTRIES
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">
              Countries
            </div>


            <ul className="mt-5 space-y-2.5 text-[13px]">

              {countries.map((country) => (

                <li key={country.slug}>

                  <Link
                    /* IMPORTANT:
                       SAME DATABASE ROUTE AS NAVBAR
                    */
                    to={`/countries/${country.slug}`}
                    className="hover:text-coral"
                  >
                    MBBS in {country.name}
                  </Link>

                </li>

              ))}

            </ul>

          </div>


          {/* =================================================
              CTA
          ================================================= */}

          <div className="lg:col-span-3">

            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">
              Ready to route your career?
            </div>


            <Link
              to="/start-application"
              className="mt-5 group inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold hover:bg-[#d94a26]"
            >
              Apply Online

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>


            <br />


            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-cream/20 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/5"
            >
              Request Callback
            </a>


            <div className="mt-6 text-[11px] mono uppercase tracking-widest text-cream/50">
              {brand.hours}
            </div>

          </div>


        </div>


        {/* BOTTOM */}

        <div className="mt-14 pt-6 border-t border-cream/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-cream/50">

          <div>
            © {new Date().getFullYear()} Route Your Career. All rights reserved.
          </div>


          <div className="flex items-center gap-5">

            <a
              href="#"
              className="hover:text-coral"
            >
              Privacy
            </a>


            <a
              href="#"
              className="hover:text-coral"
            >
              Terms
            </a>


            <a
              href="#"
              className="hover:text-coral"
            >
              Refund
            </a>

          </div>

        </div>


      </div>

    </footer>

  );

}
