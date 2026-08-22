import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';

import { brand } from '../mock';


/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://routeyourcareer.onrender.com';


/* =========================================================
   FALLBACK COUNTRIES

   These are shown if Render/API is temporarily unavailable.
========================================================= */

const fallbackMbbsCountries = [
  'Georgia',
  'Uzbekistan',
  'Russia'
];

const fallbackManagementCountries = [
  'Italy',
  'Germany',
  'United Kingdom',
  'United States',
  'Australia',
  'Singapore',
  'Spain',
  'UAE'
];


/* =========================================================
   NORMAL NAVIGATION
========================================================= */

const normalNav = [
  {
    label: 'Build My Route',
    to: '/build-my-route'
  },
  {
    label: 'Quiz',
    to: '/quiz'
  },
  {
    label: 'Calculator',
    href: '/#calculator'
  },
  {
    label: 'Blog',
    href: '/#blog'
  },
  {
    label: 'States',
    href: '/#offices'
  },
  {
    label: 'Track Application',
    to: '/track-application'
  }
];


/* =========================================================
   HELPERS
========================================================= */

function countrySlug(country) {
  return String(country || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


function makeCountryItems(countries) {
  return countries.map(country => ({
    label: country,
    to: `/countries/${countrySlug(country)}`
  }));
}


function uniqueCountries(universities, stream) {

  const countries = universities
    .filter(university => {

      const universityStream =
        String(university.stream || '')
          .trim()
          .toLowerCase();

      const status =
        String(university.status || '')
          .trim()
          .toLowerCase();

      return (
        universityStream === stream.toLowerCase() &&
        status === 'published' &&
        university.country
      );

    })
    .map(university =>
      String(university.country).trim()
    );

  return [...new Set(countries)]
    .sort((a, b) =>
      a.localeCompare(b)
    );
}


/* =========================================================
   DESKTOP DROPDOWN
========================================================= */

function DesktopDropdown({
  label,
  items,
  footerLabel,
  footerHref
}) {

  return (
    <div className="relative group">

      <button
        type="button"
        className="
          px-3 py-2
          inline-flex
          items-center
          gap-1
          text-[13px]
          font-medium
          text-ink/70
          hover:text-ink
        "
      >

        {label}

        <ChevronDown
          className="
            h-3.5 w-3.5
            transition-transform
            duration-200
            group-hover:rotate-180
          "
        />

      </button>


      {/* Hover bridge */}
      <div className="absolute left-0 top-full h-3 w-full" />


      <div
        className="
          absolute
          left-0
          top-[calc(100%+8px)]
          min-w-[230px]
          max-h-[420px]
          overflow-y-auto
          rounded-2xl
          bg-white
          border
          border-ink/10
          shadow-xl
          p-2
          opacity-0
          invisible
          translate-y-1
          group-hover:opacity-100
          group-hover:visible
          group-hover:translate-y-0
          transition-all
          duration-200
          z-[100]
        "
      >

        <div
          className="
            px-3
            pt-2
            pb-1
            text-[9px]
            mono
            uppercase
            tracking-[0.18em]
            text-ink/35
          "
        >
          Study destinations
        </div>


        {items.map(item => (

          <Link
            key={item.label}
            to={item.to}
            className="
              flex
              items-center
              justify-between
              rounded-xl
              px-3
              py-2.5
              text-[12px]
              font-medium
              text-ink/70
              hover:bg-cream
              hover:text-ink
              transition
            "
          >

            {item.label}

            <ArrowUpRight
              className="h-3.5 w-3.5 text-ink/25"
            />

          </Link>

        ))}


        <div className="border-t border-ink/10 mt-2 pt-2">

          <a
            href={footerHref}
            className="
              flex
              items-center
              justify-between
              rounded-xl
              px-3
              py-2.5
              text-[11px]
              font-semibold
              text-coral
              hover:bg-coral/5
            "
          >

            {footerLabel}

            <ArrowUpRight className="h-3.5 w-3.5" />

          </a>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {

  const [open, setOpen] =
    useState(false);

  const [mobileMbbsOpen, setMobileMbbsOpen] =
    useState(false);

  const [
    mobileManagementOpen,
    setMobileManagementOpen
  ] = useState(false);


  /*
   * Start with fallback countries.
   *
   * Once the API responds successfully,
   * these are replaced by countries from MongoDB.
   */

  const [
    mbbsCountries,
    setMbbsCountries
  ] = useState(
    makeCountryItems(
      fallbackMbbsCountries
    )
  );


  const [
    managementCountries,
    setManagementCountries
  ] = useState(
    makeCountryItems(
      fallbackManagementCountries
    )
  );


  /* =======================================================
     LOAD COUNTRIES FROM ADMIN DATABASE
  ======================================================= */

  useEffect(() => {

    let cancelled = false;


    async function loadCountries() {

      try {

        const response = await fetch(
          `${API_URL}/api/universities`
        );


        if (!response.ok) {
          throw new Error(
            `University API returned ${response.status}`
          );
        }


        const data =
          await response.json();


        /*
         * Supports either:
         *
         * [...]
         *
         * OR
         *
         * {
         *   universities: [...]
         * }
         */

        const universities =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.universities)
              ? data.universities
              : [];


        if (
          cancelled ||
          universities.length === 0
        ) {
          return;
        }


        const mbbs =
          uniqueCountries(
            universities,
            'MBBS'
          );


        const management =
          uniqueCountries(
            universities,
            'Management'
          );


        /*
         * Only replace fallback lists if
         * database actually returned countries.
         */

        if (mbbs.length > 0) {

          setMbbsCountries(
            makeCountryItems(mbbs)
          );

        }


        if (management.length > 0) {

          setManagementCountries(
            makeCountryItems(management)
          );

        }

      } catch (error) {

        /*
         * Keep fallback countries.
         *
         * Navbar must continue working even
         * if Render is temporarily waking up.
         */

        console.warn(
          'Navbar country loading failed:',
          error
        );

      }

    }


    loadCountries();


    return () => {
      cancelled = true;
    };

  }, []);


  /* =======================================================
     CLOSE MOBILE MENU
  ======================================================= */

  const closeMenu = () => {

    setOpen(false);

    setMobileMbbsOpen(false);

    setMobileManagementOpen(false);

  };


  return (

    <header
      className="
        sticky
        top-0
        z-50
        bg-cream/90
        backdrop-blur-md
        border-b
        border-ink/10
      "
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between py-4">


          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="flex items-center gap-3 shrink-0"
            onClick={closeMenu}
          >

            <div className="relative">

              <div
                className="
                  h-10
                  w-10
                  rounded-full
                  bg-ink
                  text-cream
                  grid
                  place-items-center
                  serif
                  italic
                  text-lg
                  font-medium
                "
              >
                r
              </div>

              <div
                className="
                  absolute
                  -bottom-1
                  -right-1
                  h-3
                  w-3
                  rounded-full
                  bg-coral
                  ring-2
                  ring-cream
                "
              />

            </div>


            <div className="leading-tight">

              <div
                className="
                  serif
                  text-[19px]
                  font-medium
                  text-ink
                  tracking-tight
                "
              >
                Route Your Career
              </div>

              <div
                className="
                  text-[10px]
                  mono
                  uppercase
                  tracking-[0.22em]
                  text-ink/50
                "
              >
                Your pathway · MBBS + Management
              </div>

            </div>

          </Link>


          {/* =================================================
              DESKTOP NAV
          ================================================= */}

          <nav className="hidden lg:flex items-center gap-0">

            <DesktopDropdown
              label="MBBS"
              items={mbbsCountries}
              footerLabel="Explore MBBS Abroad"
              footerHref="/#featured"
            />


            <DesktopDropdown
              label="Management"
              items={managementCountries}
              footerLabel="Explore Management"
              footerHref="/#management"
            />


            {normalNav.map(item => {

              if (item.to) {

                return (

                  <Link
                    key={item.label}
                    to={item.to}
                    className="
                      px-3
                      py-2
                      text-[13px]
                      font-medium
                      text-ink/70
                      hover:text-ink
                      link-uline
                      whitespace-nowrap
                    "
                  >
                    {item.label}
                  </Link>

                );

              }


              return (

                <a
                  key={item.label}
                  href={item.href}
                  className="
                    px-3
                    py-2
                    text-[13px]
                    font-medium
                    text-ink/70
                    hover:text-ink
                    link-uline
                    whitespace-nowrap
                  "
                >
                  {item.label}
                </a>

              );

            })}

          </nav>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="hidden md:flex items-center gap-3 shrink-0">

            <a
              href={`tel:${brand.phone}`}
              className="
                text-[13px]
                font-medium
                text-ink/70
                hover:text-ink
                hidden
                2xl:inline
              "
            >
              {brand.phoneDisplay}
            </a>


            <Link
              to="/start-application"
              className="
                group
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-ink
                text-cream
                px-4
                py-2.5
                text-[13px]
                font-semibold
                hover:bg-forest
                transition
                whitespace-nowrap
              "
            >

              Start Application

              <ArrowUpRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  group-hover:rotate-45
                "
              />

            </Link>

          </div>


          {/* =================================================
              MOBILE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setOpen(!open)
            }
            className="
              lg:hidden
              p-2
              rounded-md
              hover:bg-ink/5
            "
            aria-label="menu"
          >

            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}

          </button>

        </div>


        {/* ===================================================
            MOBILE MENU
        =================================================== */}

        {open && (

          <div
            className="
              lg:hidden
              pb-5
              border-t
              border-ink/10
              pt-3
            "
          >


            {/* MBBS */}

            <button
              type="button"
              onClick={() =>
                setMobileMbbsOpen(
                  !mobileMbbsOpen
                )
              }
              className="
                w-full
                flex
                items-center
                justify-between
                px-2
                py-3
                text-[14px]
                font-semibold
                text-ink
              "
            >

              MBBS

              <ChevronDown
                className={`
                  h-4
                  w-4
                  transition-transform
                  ${
                    mobileMbbsOpen
                      ? 'rotate-180'
                      : ''
                  }
                `}
              />

            </button>


            {mobileMbbsOpen && (

              <div
                className="
                  ml-2
                  mb-2
                  rounded-2xl
                  bg-white
                  border
                  border-ink/10
                  p-2
                  max-h-[320px]
                  overflow-y-auto
                "
              >

                {mbbsCountries.map(item => (

                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={closeMenu}
                    className="
                      block
                      rounded-xl
                      px-3
                      py-2.5
                      text-[13px]
                      text-ink/65
                      hover:bg-cream
                    "
                  >
                    {item.label}
                  </Link>

                ))}


                <a
                  href="/#featured"
                  onClick={closeMenu}
                  className="
                    block
                    border-t
                    border-ink/10
                    mt-1
                    pt-3
                    px-3
                    pb-2
                    text-[12px]
                    font-semibold
                    text-coral
                  "
                >
                  Explore MBBS Abroad
                </a>

              </div>

            )}


            {/* MANAGEMENT */}

            <button
              type="button"
              onClick={() =>
                setMobileManagementOpen(
                  !mobileManagementOpen
                )
              }
              className="
                w-full
                flex
                items-center
                justify-between
                px-2
                py-3
                text-[14px]
                font-semibold
                text-ink
              "
            >

              Management

              <ChevronDown
                className={`
                  h-4
                  w-4
                  transition-transform
                  ${
                    mobileManagementOpen
                      ? 'rotate-180'
                      : ''
                  }
                `}
              />

            </button>


            {mobileManagementOpen && (

              <div
                className="
                  ml-2
                  mb-2
                  rounded-2xl
                  bg-white
                  border
                  border-ink/10
                  p-2
                  max-h-[320px]
                  overflow-y-auto
                "
              >

                {managementCountries.map(item => (

                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={closeMenu}
                    className="
                      block
                      rounded-xl
                      px-3
                      py-2.5
                      text-[13px]
                      text-ink/65
                      hover:bg-cream
                    "
                  >
                    {item.label}
                  </Link>

                ))}


                <a
                  href="/#management"
                  onClick={closeMenu}
                  className="
                    block
                    border-t
                    border-ink/10
                    mt-1
                    pt-3
                    px-3
                    pb-2
                    text-[12px]
                    font-semibold
                    text-coral
                  "
                >
                  Explore Management
                </a>

              </div>

            )}


            {/* OTHER LINKS */}

            {normalNav.map(item => {

              if (item.to) {

                return (

                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={closeMenu}
                    className="
                      block
                      px-2
                      py-2.5
                      text-[14px]
                      font-medium
                      text-ink/75
                    "
                  >
                    {item.label}
                  </Link>

                );

              }


              return (

                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="
                    block
                    px-2
                    py-2.5
                    text-[14px]
                    font-medium
                    text-ink/75
                  "
                >
                  {item.label}
                </a>

              );

            })}


            {/* MOBILE CTA */}

            <Link
              to="/start-application"
              onClick={closeMenu}
              className="
                mt-4
                block
                text-center
                rounded-full
                bg-ink
                text-cream
                px-4
                py-3
                text-[13px]
                font-semibold
              "
            >
              Start Application
            </Link>

          </div>

        )}

      </div>

    </header>
  );
}
