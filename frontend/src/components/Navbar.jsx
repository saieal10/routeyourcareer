import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Link,
  useLocation
} from 'react-router-dom';

import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight
} from 'lucide-react';

import { brand } from '../mock';


const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://routeyourcareer.onrender.com';


function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


export default function Navbar() {

  const location =
    useLocation();

  const [
    mobileOpen,
    setMobileOpen
  ] =
    useState(false);

  const [
    mbbsOpen,
    setMbbsOpen
  ] =
    useState(false);

  const [
    managementOpen,
    setManagementOpen
  ] =
    useState(false);

  const [
    universities,
    setUniversities
  ] =
    useState([]);


  /* =========================================================
     LOAD PUBLISHED UNIVERSITIES
  ========================================================= */

  useEffect(() => {

    let cancelled =
      false;


    async function loadCountries() {

      try {

        const response =
          await fetch(
            `${API_URL}/api/universities?stream=MBBS`
          );


        if (!response.ok) {
          throw new Error(
            'Could not load MBBS countries'
          );
        }


        const data =
          await response.json();


        if (!cancelled) {

          setUniversities(
            Array.isArray(data)
              ? data
              : []
          );

        }

      }

      catch (error) {

        console.error(
          'Navbar MBBS countries error:',
          error
        );

      }

    }


    loadCountries();


    return () => {
      cancelled = true;
    };

  }, []);


  /* =========================================================
     DYNAMIC MBBS COUNTRY LIST
  ========================================================= */

  const mbbsCountries =
    useMemo(() => {

      const map =
        new Map();


      universities.forEach(
        university => {

          const country =
            String(
              university.country ||
              ''
            ).trim();


          if (!country) {
            return;
          }


          const key =
            country.toLowerCase();


          if (!map.has(key)) {

            map.set(
              key,
              {
                name: country,
                slug: slugify(country)
              }
            );

          }

        }
      );


      return Array.from(
        map.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    }, [
      universities
    ]);


  /* =========================================================
     MANAGEMENT LINKS
  ========================================================= */

  const managementLinks = [

    {
      name:
        'Management Abroad',

      path:
        '/management'
    },

    {
      name:
        'Italy — Course Finder',

      path:
        '/countries/italy/courses'
    },

    {
      name:
        'Undergraduate Management',

      path:
        '/management?level=undergraduate'
    },

    {
      name:
        'Postgraduate Management',

      path:
        '/management?level=postgraduate'
    }

  ];


  /* =========================================================
     ACTIVE STATE
  ========================================================= */

  const isActive =
    path => {

      if (
        path === '/'
      ) {
        return (
          location.pathname === '/'
        );
      }


      return (
        location.pathname.startsWith(
          path
        )
      );

    };


  /* =========================================================
     CLOSE MOBILE
  ========================================================= */

  const closeMobile =
    () => {

      setMobileOpen(
        false
      );

      setMbbsOpen(
        false
      );

      setManagementOpen(
        false
      );

    };


  return (
    <>

      <header
        className="
          sticky
          top-0
          z-50

          bg-cream/95

          backdrop-blur

          border-b
          border-ink/10
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto

            px-4
            sm:px-6
          "
        >

          <div
            className="
              h-[78px]

              flex
              items-center
              justify-between

              gap-5
            "
          >


            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              to="/"
              onClick={closeMobile}
              className="
                flex
                items-center
                gap-3

                shrink-0
              "
            >

              <div className="relative">

                <div
                  className="
                    h-11
                    w-11

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
                    right-0

                    h-3.5
                    w-3.5

                    rounded-full

                    bg-coral

                    border-2
                    border-cream
                  "
                />

              </div>


              <div>

                <div
                  className="
                    serif

                    text-[20px]
                    sm:text-[22px]

                    font-medium

                    text-ink

                    leading-none
                  "
                >
                  Route Your Career
                </div>


                <div
                  className="
                    mt-1

                    text-[9px]

                    mono
                    uppercase

                    tracking-[0.24em]

                    text-ink/45

                    whitespace-nowrap
                  "
                >
                  Your pathway · MBBS + Management
                </div>

              </div>

            </Link>


            {/* =================================================
                DESKTOP NAV
            ================================================= */}

            <nav
              className="
                hidden
                xl:flex

                items-center

                gap-1

                text-[13px]
              "
            >


              {/* ===============================================
                  MBBS DROPDOWN
              =============================================== */}

              <div
                className="relative"

                onMouseEnter={() =>
                  setMbbsOpen(
                    true
                  )
                }

                onMouseLeave={() =>
                  setMbbsOpen(
                    false
                  )
                }
              >

                <button
                  type="button"
                  className="
                    flex
                    items-center
                    gap-1

                    rounded-full

                    px-3
                    py-2

                    hover:bg-ink/5

                    transition
                  "
                >

                  MBBS

                  <ChevronDown
                    className="
                      h-3.5
                      w-3.5
                    "
                  />

                </button>


                {mbbsOpen && (

                  <div
                    className="
                      absolute

                      left-0
                      top-full

                      pt-2

                      w-[250px]
                    "
                  >

                    <div
                      className="
                        rounded-2xl

                        border
                        border-ink/10

                        bg-white

                        shadow-xl

                        overflow-hidden
                      "
                    >

                      <div
                        className="
                          px-4
                          pt-4
                          pb-2

                          text-[9px]

                          mono
                          uppercase

                          tracking-widest

                          text-coral
                        "
                      >
                        Study MBBS Abroad
                      </div>


                      <div
                        className="
                          max-h-[430px]

                          overflow-y-auto

                          pb-2
                        "
                      >

                        {mbbsCountries.length ===
                        0 ? (

                          <div
                            className="
                              px-4
                              py-4

                              text-[11px]

                              text-ink/40
                            "
                          >
                            Loading countries…
                          </div>

                        ) : (

                          mbbsCountries.map(
                            country => (

                              <Link
                                key={
                                  country.slug
                                }

                                to={`/countries/${country.slug}`}

                                onClick={
                                  closeMobile
                                }

                                className="
                                  flex

                                  items-center
                                  justify-between

                                  px-4
                                  py-2.5

                                  hover:bg-cream

                                  transition
                                "
                              >

                                <span>
                                  MBBS in {country.name}
                                </span>


                                <ArrowUpRight
                                  className="
                                    h-3.5
                                    w-3.5

                                    text-ink/30
                                  "
                                />

                              </Link>

                            )
                          )

                        )}

                      </div>

                    </div>

                  </div>

                )}

              </div>


              {/* ===============================================
                  MANAGEMENT
              =============================================== */}

              <div
                className="relative"

                onMouseEnter={() =>
                  setManagementOpen(
                    true
                  )
                }

                onMouseLeave={() =>
                  setManagementOpen(
                    false
                  )
                }
              >

                <button
                  type="button"
                  className="
                    flex
                    items-center
                    gap-1

                    rounded-full

                    px-3
                    py-2

                    hover:bg-ink/5

                    transition
                  "
                >

                  Management

                  <ChevronDown
                    className="
                      h-3.5
                      w-3.5
                    "
                  />

                </button>


                {managementOpen && (

                  <div
                    className="
                      absolute

                      left-0
                      top-full

                      pt-2

                      w-[270px]
                    "
                  >

                    <div
                      className="
                        rounded-2xl

                        border
                        border-ink/10

                        bg-white

                        shadow-xl

                        overflow-hidden

                        p-2
                      "
                    >

                      {managementLinks.map(
                        item => (

                          <Link
                            key={
                              item.name
                            }

                            to={
                              item.path
                            }

                            onClick={
                              closeMobile
                            }

                            className={`
                              block

                              rounded-xl

                              px-3
                              py-2.5

                              transition

                              ${
                                item.name ===
                                'Italy — Course Finder'

                                  ? `
                                    bg-coral/5
                                    text-coral
                                    font-semibold
                                    hover:bg-coral/10
                                  `

                                  : `
                                    hover:bg-cream
                                  `
                              }
                            `}
                          >
                            {item.name}
                          </Link>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>


              {/* ===============================================
                  CAREER GUIDE
              =============================================== */}

              <Link
                to="/build-my-route"
                className={`
                  rounded-full

                  px-3
                  py-2

                  transition

                  ${
                    isActive(
                      '/build-my-route'
                    )

                      ? `
                        bg-ink
                        text-cream
                      `

                      : `
                        hover:bg-ink/5
                      `
                  }
                `}
              >
                Career Guide
              </Link>


              {/* QUIZ */}

              <Link
                to="/quiz"
                className={`
                  rounded-full

                  px-3
                  py-2

                  transition

                  ${
                    isActive(
                      '/quiz'
                    )

                      ? `
                        bg-ink
                        text-cream
                      `

                      : `
                        hover:bg-ink/5
                      `
                  }
                `}
              >
                Quiz
              </Link>


              {/* CALCULATOR */}

              <Link
                to="/calculator"
                className="
                  rounded-full

                  px-3
                  py-2

                  hover:bg-ink/5

                  transition
                "
              >
                Calculator
              </Link>


              {/* BLOG */}

              <a
                href="/#blog"
                className="
                  rounded-full

                  px-3
                  py-2

                  hover:bg-ink/5

                  transition
                "
              >
                Blog
              </a>


              {/* STATES */}

              <a
                href="/#states"
                className="
                  rounded-full

                  px-3
                  py-2

                  hover:bg-ink/5

                  transition
                "
              >
                States
              </a>


              {/* TRACK */}

              <Link
                to="/track-application"
                className={`
                  rounded-full

                  px-3
                  py-2

                  transition

                  ${
                    isActive(
                      '/track-application'
                    )

                      ? `
                        bg-ink
                        text-cream
                      `

                      : `
                        hover:bg-ink/5
                      `
                  }
                `}
              >
                Track Application
              </Link>

            </nav>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div
              className="
                hidden
                xl:flex

                items-center

                gap-4

                shrink-0
              "
            >

              <a
                href={`tel:${brand.phone}`}
                className="
                  text-[13px]

                  text-ink/70

                  hover:text-coral

                  whitespace-nowrap
                "
              >
                {brand.phoneDisplay}
              </a>


              <Link
                to="/start-application"
                className="
                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  bg-ink

                  text-cream

                  px-5
                  py-3

                  text-[12px]

                  font-bold

                  hover:bg-coral

                  transition
                "
              >

                Start Application

                <ArrowUpRight
                  className="
                    h-4
                    w-4
                  "
                />

              </Link>

            </div>


            {/* =================================================
                MOBILE MENU BUTTON
            ================================================= */}

            <button
              type="button"

              onClick={() =>
                setMobileOpen(
                  !mobileOpen
                )
              }

              className="
                xl:hidden

                h-10
                w-10

                rounded-full

                border
                border-ink/15

                grid
                place-items-center
              "

              aria-label="Menu"
            >

              {mobileOpen ? (

                <X
                  className="
                    h-5
                    w-5
                  "
                />

              ) : (

                <Menu
                  className="
                    h-5
                    w-5
                  "
                />

              )}

            </button>

          </div>

        </div>


        {/* ===================================================
            MOBILE MENU
        =================================================== */}

        {mobileOpen && (

          <div
            className="
              xl:hidden

              border-t
              border-ink/10

              bg-cream
            "
          >

            <div
              className="
                max-w-7xl
                mx-auto

                px-4
                sm:px-6

                py-5
              "
            >


              {/* CAREER GUIDE */}

              <Link
                to="/build-my-route"

                onClick={
                  closeMobile
                }

                className="
                  flex

                  items-center
                  justify-between

                  rounded-2xl

                  bg-ink

                  text-cream

                  px-4
                  py-4

                  font-semibold
                "
              >

                Career Guide

                <ArrowUpRight
                  className="
                    h-4
                    w-4
                  "
                />

              </Link>


              {/* =============================================
                  MOBILE MBBS
              ============================================= */}

              <div
                className="
                  mt-3

                  border
                  border-ink/10

                  rounded-2xl

                  bg-white

                  overflow-hidden
                "
              >

                <button
                  type="button"

                  onClick={() =>
                    setMbbsOpen(
                      !mbbsOpen
                    )
                  }

                  className="
                    w-full

                    flex

                    items-center
                    justify-between

                    px-4
                    py-4

                    font-semibold
                  "
                >

                  MBBS Abroad


                  <ChevronDown
                    className={`
                      h-4
                      w-4

                      transition-transform

                      ${
                        mbbsOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />

                </button>


                {mbbsOpen && (

                  <div
                    className="
                      border-t
                      border-ink/10

                      max-h-[360px]

                      overflow-y-auto
                    "
                  >

                    {mbbsCountries.map(
                      country => (

                        <Link
                          key={
                            country.slug
                          }

                          to={`/countries/${country.slug}`}

                          onClick={
                            closeMobile
                          }

                          className="
                            block

                            px-4
                            py-3

                            text-[13px]

                            border-b
                            border-ink/5

                            last:border-0
                          "
                        >

                          MBBS in {country.name}

                        </Link>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* =============================================
                  MOBILE MANAGEMENT
              ============================================= */}

              <div
                className="
                  mt-3

                  border
                  border-ink/10

                  rounded-2xl

                  bg-white

                  overflow-hidden
                "
              >

                <button
                  type="button"

                  onClick={() =>
                    setManagementOpen(
                      !managementOpen
                    )
                  }

                  className="
                    w-full

                    flex

                    items-center
                    justify-between

                    px-4
                    py-4

                    font-semibold
                  "
                >

                  Management


                  <ChevronDown
                    className={`
                      h-4
                      w-4

                      transition-transform

                      ${
                        managementOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />

                </button>


                {managementOpen && (

                  <div
                    className="
                      border-t
                      border-ink/10
                    "
                  >

                    {managementLinks.map(
                      item => (

                        <Link
                          key={
                            item.name
                          }

                          to={
                            item.path
                          }

                          onClick={
                            closeMobile
                          }

                          className="
                            block

                            px-4
                            py-3

                            text-[13px]

                            border-b
                            border-ink/5

                            last:border-0
                          "
                        >
                          {item.name}
                        </Link>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* OTHER LINKS */}

              <div
                className="
                  mt-3

                  rounded-2xl

                  border
                  border-ink/10

                  bg-white

                  overflow-hidden
                "
              >

                <Link
                  to="/quiz"

                  onClick={
                    closeMobile
                  }

                  className="
                    block

                    px-4
                    py-3.5

                    border-b
                    border-ink/5
                  "
                >
                  Quiz
                </Link>


                <a
                  href="/#blog"

                  onClick={
                    closeMobile
                  }

                  className="
                    block

                    px-4
                    py-3.5

                    border-b
                    border-ink/5
                  "
                >
                  Blog
                </a>


                <a
                  href="/#states"

                  onClick={
                    closeMobile
                  }

                  className="
                    block

                    px-4
                    py-3.5

                    border-b
                    border-ink/5
                  "
                >
                  States
                </a>


                <Link
                  to="/track-application"

                  onClick={
                    closeMobile
                  }

                  className="
                    block

                    px-4
                    py-3.5
                  "
                >
                  Track Application
                </Link>

              </div>


              <a
                href={`tel:${brand.phone}`}
                className="
                  mt-5

                  block

                  text-center

                  text-[13px]

                  font-semibold
                "
              >
                {brand.phoneDisplay}
              </a>


              <Link
                to="/start-application"

                onClick={
                  closeMobile
                }

                className="
                  mt-3

                  flex

                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  bg-coral

                  text-white

                  px-5
                  py-3.5

                  text-[13px]

                  font-bold
                "
              >

                Start Application

                <ArrowUpRight
                  className="
                    h-4
                    w-4
                  "
                />

              </Link>

            </div>

          </div>

        )}

      </header>

    </>
  );

}
