import React from 'react';
import { brand } from '../mock';
import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  ArrowUpRight
} from 'lucide-react';

/*
=========================================================
COUNTRIES
=========================================================
Add/remove countries here.

IMPORTANT:
Country links use:
/countries/russia
/countries/armenia
/countries/tajikistan
etc.
=========================================================
*/

const countries = [
  'Georgia',
  'Russia',
  'Uzbekistan',
  'Armenia',
  'Tajikistan',
  'Kazakhstan',
  'Kyrgyzstan',
  'Moldova',
  'Philippines'
];


/*
=========================================================
CREATE COUNTRY SLUG
=========================================================
Example:
"Russia" -> "russia"
"United Arab Emirates" -> "united-arab-emirates"
=========================================================
*/

const countrySlug = (country) =>
  country
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');


export default function Footer() {

  return (

    <footer className="bg-ink text-cream/80">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">


        <div className="grid lg:grid-cols-12 gap-10">


          {/* =====================================================
              BRAND + CONTACT
          ===================================================== */}

          <div className="lg:col-span-5">


            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-full bg-cream text-ink grid place-items-center serif italic text-lg font-medium">
                r
              </div>


              <div>

                <div className="serif text-[20px] font-medium text-cream">
                  Route Your Career
                </div>

                <div className="text-[10px] mono uppercase tracking-[0.22em] text-coral">
                  Your pathway · MBBS Abroad
                </div>

              </div>

            </div>


            {/* DESCRIPTION */}

            <p className="mt-6 text-[14px] leading-relaxed max-w-md text-cream/60">

              Route Your Career helps students explore international medical
              education, compare universities and understand their pathway
              from counselling to application.

            </p>


            {/* CONTACT */}

            <div className="mt-8 space-y-3 text-[13px]">


              {/* PHONE */}

              <a
                href={`tel:${brand.phone}`}
                className="flex items-center gap-3 hover:text-coral transition-colors"
              >

                <Phone className="h-4 w-4 text-coral" />

                {brand.phoneDisplay}

              </a>


              {/* EMAIL */}

              <a
                href={`mailto:${brand.email}`}
                className="flex items-center gap-3 hover:text-coral transition-colors"
              >

                <Mail className="h-4 w-4 text-coral" />

                {brand.email}

              </a>


              {/* LOCATION */}

              <div className="flex items-center gap-3">

                <MapPin className="h-4 w-4 text-coral" />

                <span>
                  Serving students across India
                </span>

              </div>


            </div>


            {/* =====================================================
                SOCIAL MEDIA
            ===================================================== */}

            <div className="mt-6 flex items-center gap-2">


              {/* FACEBOOK */}

              <a
                href="https://www.facebook.com/share/1HFXZJteo1/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-10 w-10 rounded-full border border-cream/15 grid place-items-center hover:bg-coral hover:border-coral hover:text-white transition-colors"
              >

                <Facebook className="h-4 w-4" />

              </a>


              {/* INSTAGRAM */}

              <a
                href="https://www.instagram.com/route_your_career"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-10 w-10 rounded-full border border-cream/15 grid place-items-center hover:bg-coral hover:border-coral hover:text-white transition-colors"
              >

                <Instagram className="h-4 w-4" />

              </a>


              {/* YOUTUBE */}

              <a
                href="https://www.youtube.com/@route_your_career"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="h-10 w-10 rounded-full border border-cream/15 grid place-items-center hover:bg-coral hover:border-coral hover:text-white transition-colors"
              >

                <Youtube className="h-4 w-4" />

              </a>


            </div>

          </div>



          {/* =====================================================
              EXPLORE
          ===================================================== */}

          <div className="lg:col-span-2">


            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">
              Explore
            </div>


            <ul className="mt-5 space-y-2.5 text-[13px]">


              <li>
                <a
                  href="/#featured"
                  className="hover:text-coral transition-colors"
                >
                  All Countries
                </a>
              </li>


              <li>
                <a
                  href="/build-my-route"
                  className="hover:text-coral transition-colors"
                >
                  Build My Route
                </a>
              </li>


              <li>
                <a
                  href="/quiz"
                  className="hover:text-coral transition-colors"
                >
                  Course Finder
                </a>
              </li>


              <li>
                <a
                  href="/track-application"
                  className="hover:text-coral transition-colors"
                >
                  Track Application
                </a>
              </li>


              <li>
                <a
                  href="/#blog"
                  className="hover:text-coral transition-colors"
                >
                  Blog
                </a>
              </li>


            </ul>

          </div>



          {/* =====================================================
              COUNTRIES
          ===================================================== */}

          <div className="lg:col-span-2">


            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">
              Countries
            </div>


            <ul className="mt-5 space-y-2.5 text-[13px]">


              {countries.map((country) => (

                <li key={country}>

                  <a
                    href={`/countries/${countrySlug(country)}`}
                    className="hover:text-coral transition-colors"
                  >

                    MBBS in {country}

                  </a>

                </li>

              ))}


            </ul>

          </div>



          {/* =====================================================
              CTA
          ===================================================== */}

          <div className="lg:col-span-3">


            <div className="text-cream font-semibold text-[12px] mono uppercase tracking-widest">

              Ready to route your career?

            </div>


            {/* APPLY */}

            <a
              href={brand.applyLink}
              target="_blank"
              rel="noreferrer"
              className="mt-5 group inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold hover:bg-[#d94a26]"
            >

              Apply Online

              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />

            </a>


            <br />


            {/* CALLBACK */}

            <a
              href={brand.callbackLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-cream/20 text-cream px-5 py-3 text-[13px] font-semibold hover:bg-cream/5"
            >

              Request Callback

            </a>


            {/* HOURS */}

            <div className="mt-6 text-[11px] mono uppercase tracking-widest text-cream/50">

              {brand.hours}

            </div>


          </div>


        </div>



        {/* =====================================================
            BOTTOM
        ===================================================== */}

        <div className="mt-14 pt-6 border-t border-cream/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-cream/50">


          <div>

            © {new Date().getFullYear()} Route Your Career. All rights reserved.

          </div>


          <div className="flex items-center gap-5">


            <a
              href="/privacy"
              className="hover:text-coral transition-colors"
            >
              Privacy
            </a>


            <a
              href="/terms"
              className="hover:text-coral transition-colors"
            >
              Terms
            </a>


            <a
              href="/refund"
              className="hover:text-coral transition-colors"
            >
              Refund
            </a>


          </div>


        </div>


      </div>

    </footer>

  );

}
