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
  ArrowUpRight,
  Building2,
  CircleHelp,
  MapPin,
  Scale,
  ShieldCheck,
  Youtube,
  UsersRound,
  Compass,
  BookOpen
} from 'lucide-react';

import { brand } from '../mock';


/* =========================================================
   API
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://routeyourcareer.onrender.com';


/* =========================================================
   HELPERS
========================================================= */

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {

  const location =
    useLocation();


  /* =======================================================
     STATE
  ======================================================= */

  const [
    mobileOpen,
    setMobileOpen
  ] = useState(false);


  const [
    mbbsOpen,
    setMbbsOpen
  ] = useState(false);


  const [
    managementOpen,
    setManagementOpen
  ] = useState(false);


  const [
    exploreOpen,
    setExploreOpen
  ] = useState(false);


  const [
    universities,
    setUniversities
  ] = useState([]);


  /* =======================================================
     LOAD PUBLISHED MBBS UNIVERSITIES

     Countries are generated from your Admin database.
  ======================================================= */

  useEffect(() => {

    let cancelled = false;


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


  /* =======================================================
     DYNAMIC MBBS COUNTRIES
  ======================================================= */

  const mbbsCountries =
    useMemo(() => {

      const countryMap =
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


          if (!countryMap.has(key)) {

            countryMap.set(
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
        countryMap.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    }, [
      universities
    ]);


  /* =======================================================
     MANAGEMENT
  ======================================================= */

  const managementLinks = [

    {
      name: 'Management Abroad',
      description: 'Explore international business programmes',
      path: '/management'
    },

    {
      name: 'Italy — UG + PG',
      description: 'Explore universities and programmes in Italy',
      path: '/countries/italy'
    },

    {
      name: 'Italy Course Finder',
      description: 'Search available Italian programmes',
      path: '/countries/italy/courses'
    }

  ];


  /* =======================================================
     EXPLORE MENU
  ======================================================= */

  const exploreGroups = [

    {
      title: 'About Route Your Career',

      items: [

        {
          name: 'About Us',
          description: 'Who we are and how RYC works',
          path: '/about',
          icon: Building2
        },

        {
          name: 'Why Route Your Career',
          description: 'Our approach to student guidance',
          path: '/about#why-ryc',
          icon: ShieldCheck
        },

        {
          name: 'Our Promise',
          description: 'Transparency and student-first guidance',
          path: '/about#promise',
          icon: UsersRound
        }

      ]

    },

    {
      title: 'Explore',

      items: [

        {
          name: 'Compare Study Options',
          description: 'Compare destinations before choosing',
          path: '/compare',
          icon: Scale
        },

        {
          name: 'Countries & Destinations',
          description: 'Explore available study destinations',
          path: '/countries',
          icon: Compass
        },

        {
          name: 'Our Presence in India',
          description: 'RYC guidance network across India',
          path: '/about#presence',
          icon: MapPin
        }

      ]

    },

    {
      title: 'Help & Resources',

      items: [

        {
          name: 'FAQ',
          description: 'Straight answers to common questions',
          path: '/faq',
          icon: CircleHelp
        },

        {
          name: 'Student Stories',
          description: 'Watch student experiences and testimonials',
          path: '/student-stories',
          icon: UsersRound
        },

        {
          name: 'YouTube',
          description: 'Guides, updates and study-abroad videos',
          path: 'https://www.youtube.com/@route_your_career',
          external: true,
          icon: Youtube
        }

      ]

    }

  ];


  /* =======================================================
     ACTIVE
  ======================================================= */

  const isActive =
    path => {

      if (path === '/') {

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


  /* =======================================================
     CLOSE EVERYTHING
  ======================================================= */

  const closeMenus =
    () => {

      setMbbsOpen(false);
      setManagementOpen(false);
      setExploreOpen(false);

    };


  const closeMobile =
    () => {

      setMobileOpen(false);

      closeMenus();

    };


  /* =======================================================
     UI
  ======================================================= */

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

              gap-4
            "
          >


            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              to="/"

              onClick={
                closeMobile
              }

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

                gap-0.5

                text-[13px]
              "
            >


              {/* ===============================================
                  MBBS
              =============================================== */}

              <div
                className="relative"

                onMouseEnter={() => {

                  closeMenus();

                  setMbbsOpen(true);

                }}

                onMouseLeave={() =>
                  setMbbsOpen(false)
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

                      w-[260px]
                    "
                  >

                    <div
                      className="
                        rounded-2xl

                        border
                        border-ink/10

                        bg-white

                        shadow-2xl

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

                        {mbbsCountries.length === 0 ? (

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
                                  closeMenus
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

                onMouseEnter={() => {

                  closeMenus();

                  setManagementOpen(true);

                }}

                onMouseLeave={() =>
                  setManagementOpen(false)
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

                      w-[300px]
                    "
                  >

                    <div
                      className="
                        rounded-2xl

                        border
                        border-ink/10

                        bg-white

                        shadow-2xl

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
                              closeMenus
                            }

                            className="
                              block

                              rounded-xl

                              px-3
                              py-3

                              hover:bg-cream

                              transition
                            "
                          >

                            <div
                              className="
                                text-[12px]

                                font-semibold

                                text-ink
                              "
                            >
                              {item.name}
                            </div>


                            <div
                              className="
                                mt-0.5

                                text-[10px]

                                text-ink/45
                              "
                            >
                              {item.description}
                            </div>

                          </Link>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>


              {/* ===============================================
                  EXPLORE MEGA DROPDOWN
              =============================================== */}

              <div
                className="relative"

                onMouseEnter={() => {

                  closeMenus();

                  setExploreOpen(true);

                }}

                onMouseLeave={() =>
                  setExploreOpen(false)
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

                  Explore

                  <ChevronDown
                    className="
                      h-3.5
                      w-3.5
                    "
                  />

                </button>


                {exploreOpen && (

                  <div
                    className="
                      absolute

                      left-1/2
                      -translate-x-1/2

                      top-full

                      pt-2

                      w-[720px]
                    "
                  >

                    <div
                      className="
                        grid
                        grid-cols-3

                        gap-2

                        rounded-[24px]

                        border
                        border-ink/10

                        bg-white

                        p-4

                        shadow-2xl
                      "
                    >

                      {exploreGroups.map(
                        group => (

                          <div
                            key={
                              group.title
                            }
                          >

                            <div
                              className="
                                px-2
                                pb-2

                                text-[8px]

                                mono
                                uppercase

                                tracking-[0.18em]

                                text-coral
                              "
                            >
                              {group.title}
                            </div>


                            <div className="space-y-1">

                              {group.items.map(
                                item => {

                                  const Icon =
                                    item.icon;


                                  const content = (

                                    <>
                                      <div
                                        className="
                                          h-8
                                          w-8

                                          shrink-0

                                          rounded-xl

                                          bg-cream

                                          grid
                                          place-items-center
                                        "
                                      >

                                        <Icon
                                          className="
                                            h-3.5
                                            w-3.5

                                            text-forest
                                          "
                                        />

                                      </div>


                                      <div>

                                        <div
                                          className="
                                            text-[11px]

                                            font-semibold

                                            text-ink
                                          "
                                        >
                                          {item.name}
                                        </div>


                                        <div
                                          className="
                                            mt-0.5

                                            text-[9px]

                                            leading-relaxed

                                            text-ink/45
                                          "
                                        >
                                          {item.description}
                                        </div>

                                      </div>
                                    </>

                                  );


                                  if (item.external) {

                                    return (

                                      <a
                                        key={
                                          item.name
                                        }

                                        href={
                                          item.path
                                        }

                                        target="_blank"

                                        rel="noreferrer"

                                        className="
                                          flex
                                          items-start
                                          gap-2.5

                                          rounded-xl

                                          px-2
                                          py-2.5

                                          hover:bg-cream

                                          transition
                                        "
                                      >
                                        {content}
                                      </a>

                                    );

                                  }


                                  return (

                                    <Link
                                      key={
                                        item.name
                                      }

                                      to={
                                        item.path
                                      }

                                      onClick={
                                        closeMenus
                                      }

                                      className="
                                        flex
                                        items-start
                                        gap-2.5

                                        rounded-xl

                                        px-2
                                        py-2.5

                                        hover:bg-cream

                                        transition
                                      "
                                    >
                                      {content}
                                    </Link>

                                  );

                                }
                              )}

                            </div>

                          </div>

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


              {/* ===============================================
                  QUIZ
              =============================================== */}

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


              {/* ===============================================
                  BLOG
              =============================================== */}

              <Link
                to="/blog"

                className="
                  rounded-full

                  px-3
                  py-2

                  hover:bg-ink/5

                  transition
                "
              >
                Blog
              </Link>


              {/* ===============================================
                  TRACK
              =============================================== */}

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
                DESKTOP RIGHT
            ================================================= */}

            <div
              className="
                hidden
                xl:flex

                items-center

                gap-3

                shrink-0
              "
            >

              <a
                href={`tel:${brand.phone}`}

                className="
                  text-[12px]

                  text-ink/65

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
                MOBILE BUTTON
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

                  rounded-2xl

                  border
                  border-ink/10

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

                  rounded-2xl

                  border
                  border-ink/10

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

                            border-b
                            border-ink/5

                            last:border-0
                          "
                        >

                          <div
                            className="
                              text-[12px]

                              font-semibold
                            "
                          >
                            {item.name}
                          </div>


                          <div
                            className="
                              text-[10px]

                              text-ink/45

                              mt-0.5
                            "
                          >
                            {item.description}
                          </div>

                        </Link>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* =============================================
                  MOBILE EXPLORE
              ============================================= */}

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

                <button
                  type="button"

                  onClick={() =>
                    setExploreOpen(
                      !exploreOpen
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

                  Explore

                  <ChevronDown
                    className={`
                      h-4
                      w-4

                      transition-transform

                      ${
                        exploreOpen
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />

                </button>


                {exploreOpen && (

                  <div
                    className="
                      border-t
                      border-ink/10

                      p-2
                    "
                  >

                    {exploreGroups.map(
                      group => (

                        <div
                          key={
                            group.title
                          }

                          className="
                            mb-4
                            last:mb-0
                          "
                        >

                          <div
                            className="
                              px-2
                              py-2

                              text-[8px]

                              mono
                              uppercase

                              tracking-widest

                              text-coral
                            "
                          >
                            {group.title}
                          </div>


                          {group.items.map(
                            item => {

                              const Icon =
                                item.icon;


                              if (item.external) {

                                return (

                                  <a
                                    key={
                                      item.name
                                    }

                                    href={
                                      item.path
                                    }

                                    target="_blank"

                                    rel="noreferrer"

                                    className="
                                      flex
                                      items-center
                                      gap-3

                                      rounded-xl

                                      px-3
                                      py-3

                                      hover:bg-cream
                                    "
                                  >

                                    <Icon
                                      className="
                                        h-4
                                        w-4

                                        text-forest
                                      "
                                    />

                                    <span
                                      className="
                                        text-[12px]

                                        font-semibold
                                      "
                                    >
                                      {item.name}
                                    </span>

                                  </a>

                                );

                              }


                              return (

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
                                    flex
                                    items-center
                                    gap-3

                                    rounded-xl

                                    px-3
                                    py-3

                                    hover:bg-cream
                                  "
                                >

                                  <Icon
                                    className="
                                      h-4
                                      w-4

                                      text-forest
                                    "
                                  />

                                  <span
                                    className="
                                      text-[12px]

                                      font-semibold
                                    "
                                  >
                                    {item.name}
                                  </span>

                                </Link>

                              );

                            }
                          )}

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* =============================================
                  BASIC LINKS
              ============================================= */}

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


                <Link
                  to="/blog"

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
                </Link>


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


              {/* PHONE */}

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


              {/* START */}

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
