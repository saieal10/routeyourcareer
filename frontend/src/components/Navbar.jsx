import React, { useEffect, useMemo, useState } from 'react';

import {
  Link,
  useLocation
} from 'react-router-dom';

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Compass,
  FileCheck2,
  GraduationCap,
  MapPin,
  Menu,
  MessageSquareQuote,
  Newspaper,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';


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

  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [mbbsOpen, setMbbsOpen] = useState(false);

  const [managementOpen, setManagementOpen] =
    useState(false);

  const [exploreOpen, setExploreOpen] =
    useState(false);

  const [universities, setUniversities] =
    useState([]);


  /* =======================================================
     LOAD MBBS UNIVERSITIES FROM ADMIN
  ======================================================= */

  useEffect(() => {

    let cancelled = false;


    async function loadCountries() {

      try {

        const response = await fetch(
          `${API_URL}/api/universities?stream=MBBS`
        );


        if (!response.ok) {

          throw new Error(
            'Could not load MBBS countries'
          );

        }


        const data = await response.json();


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
     BUILD DYNAMIC COUNTRY LIST
  ======================================================= */

  const mbbsCountries = useMemo(() => {

    const map = new Map();


    universities.forEach(university => {

      const country =
        String(
          university.country || ''
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

    });


    return Array.from(
      map.values()
    ).sort(
      (a, b) =>
        a.name.localeCompare(b.name)
    );

  }, [universities]);


  /* =======================================================
     MANAGEMENT MENU
  ======================================================= */

  const managementLinks = [

    {
      title: 'Management Abroad',
      description:
        'Explore global undergraduate and postgraduate options.',
      path: '/management',
      icon: BriefcaseBusiness
    },

    {
      title: 'Italy Course Finder',
      description:
        'Search UG and PG programmes available in Italy.',
      path: '/countries/italy/courses',
      icon: Compass,
      featured: true
    },

    {
      title: 'Undergraduate',
      description:
        'Bachelor’s and undergraduate study pathways.',
      path: '/management?level=undergraduate',
      icon: GraduationCap
    },

    {
      title: 'Postgraduate',
      description:
        'Master’s and postgraduate study pathways.',
      path: '/management?level=postgraduate',
      icon: BookOpen
    }

  ];


  /* =======================================================
     EXPLORE MENU
  ======================================================= */

  const exploreGroups = [

    {
      heading: 'About',

      links: [

        {
          title: 'About Us',
          description:
            'Meet Route Your Career and our approach.',
          path: '/about',
          icon: Sparkles
        },

        {
          title: 'Why RYC',
          description:
            'Why students choose our guidance.',
          path: '/about#why-ryc',
          icon: ShieldCheck
        },

        {
          title: 'Our Presence',
          description:
            'Explore our student support network.',
          path: '/about#presence',
          icon: MapPin
        }

      ]
    },


    {
      heading: 'Discover',

      links: [

        {
          title: 'Student Stories',
          description:
            'Real experiences from students abroad.',
          path: '/#stories',
          icon: MessageSquareQuote
        },

        {
          title: 'RYC on YouTube',
          description:
            'University guides, explainers and updates.',
          url:
            'https://www.youtube.com/@route_your_career',
          icon: PlayCircle,
          external: true
        },

        {
          title: 'Course Finder Quiz',
          description:
            'Find a starting point for your study options.',
          path: '/quiz',
          icon: Compass
        }

      ]
    },


    {
      heading: 'Resources',

      links: [

        {
          title: 'Blogs',
          description:
            'MBBS, management and study-abroad guides.',
          path: '/blogs',
          icon: Newspaper
        },

        {
          title: 'FAQ',
          description:
            'Answers to common student questions.',
          path: '/faq',
          icon: CircleHelp
        },

        {
          title: 'Career Guide',
          description:
            'Build a route around your career goals.',
          path: '/build-my-route',
          icon: Route
        }

      ]
    }

  ];


  /* =======================================================
     CLOSE MENUS
  ======================================================= */

  const closeAll = () => {

    setMobileOpen(false);

    setMbbsOpen(false);

    setManagementOpen(false);

    setExploreOpen(false);

  };


  /* =======================================================
     CLOSE WHEN PAGE CHANGES
  ======================================================= */

  useEffect(() => {

    closeAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [
    location.pathname,
    location.search
  ]);


  /* =======================================================
     HANDLE HASH LINKS
  ======================================================= */

  useEffect(() => {

    if (!location.hash) {
      return;
    }


    const id =
      location.hash.replace('#', '');


    const timer =
      setTimeout(() => {

        const element =
          document.getElementById(id);


        if (element) {

          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

        }

      }, 150);


    return () =>
      clearTimeout(timer);

  }, [
    location.pathname,
    location.hash
  ]);


  /* =======================================================
     DESKTOP LINK STYLE
  ======================================================= */

  const desktopLink = `
    inline-flex
    items-center
    gap-1.5

    rounded-full

    px-3
    py-2.5

    text-[12px]
    font-semibold

    text-ink/65

    hover:text-ink
    hover:bg-ink/[0.045]

    transition
  `;


  return (

    <header
      className="
        sticky
        top-0
        z-50

        border-b
        border-ink/[0.08]

        bg-cream/90

        backdrop-blur-xl
      "
    >

      <div
        className="
          max-w-[1440px]
          mx-auto

          px-4
          sm:px-6
          xl:px-8
        "
      >

        <div
          className="
            min-h-[76px]

            flex
            items-center

            gap-3
          "
        >


          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            onClick={closeAll}

            className="
              group

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

                  rounded-[15px]

                  bg-ink
                  text-cream

                  grid
                  place-items-center

                  serif
                  italic

                  text-xl

                  shadow-sm

                  transition-transform

                  group-hover:-rotate-3
                "
              >
                r
              </div>


              <span
                className="
                  absolute

                  -bottom-1
                  -right-1

                  h-4
                  w-4

                  rounded-full

                  bg-coral

                  border-[3px]
                  border-cream
                "
              />

            </div>


            <div
              className="
                hidden
                sm:block
              "
            >

              <div
                className="
                  serif

                  text-[19px]
                  xl:text-[20px]

                  leading-none

                  whitespace-nowrap
                "
              >
                Route Your Career
              </div>


              <div
                className="
                  mt-1.5

                  text-[7px]

                  mono
                  uppercase

                  tracking-[0.2em]

                  text-ink/40

                  whitespace-nowrap
                "
              >
                Global Education · Your Route
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

              ml-auto

              gap-0.5
            "
          >


            {/* =================================================
                MBBS DROPDOWN
            ================================================= */}

            <div
              className="relative"

              onMouseEnter={() => {

                setMbbsOpen(true);

                setManagementOpen(false);

                setExploreOpen(false);

              }}

              onMouseLeave={() =>
                setMbbsOpen(false)
              }
            >

              <button
                type="button"
                className={desktopLink}
              >

                <GraduationCap
                  className="
                    h-3.5
                    w-3.5

                    text-coral
                  "
                />

                MBBS Abroad


                <ChevronDown
                  className={`
                    h-3
                    w-3

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
                    absolute

                    left-0
                    top-full

                    pt-3

                    w-[330px]
                  "
                >

                  <div
                    className="
                      overflow-hidden

                      rounded-[24px]

                      border
                      border-ink/10

                      bg-white/95

                      backdrop-blur-xl

                      shadow-2xl
                      shadow-black/10
                    "
                  >


                    {/* MBBS HEADER */}

                    <div
                      className="
                        p-5

                        border-b
                        border-ink/[0.07]

                        bg-cream/50
                      "
                    >

                      <div
                        className="
                          text-[9px]

                          mono
                          uppercase

                          tracking-[0.2em]

                          text-coral
                        "
                      >
                        Medical Education
                      </div>


                      <div
                        className="
                          serif

                          text-[23px]

                          mt-1
                        "
                      >
                        Study MBBS Abroad
                      </div>


                      <p
                        className="
                          mt-1.5

                          text-[11px]
                          leading-relaxed

                          text-ink/45
                        "
                      >
                        Explore countries and universities
                        published through Route Your Career.
                      </p>

                    </div>


                    {/* DYNAMIC COUNTRIES */}

                    <div
                      className="
                        p-2

                        max-h-[390px]

                        overflow-y-auto
                      "
                    >

                      {mbbsCountries.length === 0 ? (

                        <div
                          className="
                            px-4
                            py-7

                            text-center

                            text-[11px]

                            text-ink/40
                          "
                        >
                          Loading destinations…
                        </div>

                      ) : (

                        mbbsCountries.map(
                          country => (

                            <Link
                              key={country.slug}

                              to={
                                `/countries/${country.slug}`
                              }

                              onClick={closeAll}

                              className="
                                group/country

                                flex
                                items-center
                                justify-between

                                gap-3

                                rounded-xl

                                px-3
                                py-2.5

                                text-[12px]
                                font-semibold

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

                                  text-ink/25

                                  transition

                                  group-hover/country:text-coral
                                "
                              />

                            </Link>

                          )
                        )

                      )}

                    </div>


                    {/* COUNTRY FINDER CTA */}

                    <div
                      className="
                        p-3

                        border-t
                        border-ink/[0.07]
                      "
                    >

                      <Link
                        to="/build-my-route"
                        onClick={closeAll}

                        className="
                          flex
                          items-center
                          justify-between

                          rounded-xl

                          bg-ink

                          px-4
                          py-3

                          text-[11px]
                          font-semibold

                          text-cream

                          hover:bg-forest

                          transition
                        "
                      >

                        Not sure which country?

                        <ArrowRight
                          className="
                            h-3.5
                            w-3.5
                          "
                        />

                      </Link>

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                MANAGEMENT DROPDOWN
            ================================================= */}

            <div
              className="relative"

              onMouseEnter={() => {

                setManagementOpen(true);

                setMbbsOpen(false);

                setExploreOpen(false);

              }}

              onMouseLeave={() =>
                setManagementOpen(false)
              }
            >

              <button
                type="button"
                className={desktopLink}
              >

                <BriefcaseBusiness
                  className="
                    h-3.5
                    w-3.5

                    text-coral
                  "
                />

                Management


                <ChevronDown
                  className={`
                    h-3
                    w-3

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
                    absolute

                    left-1/2
                    -translate-x-1/2

                    top-full

                    pt-3

                    w-[400px]
                  "
                >

                  <div
                    className="
                      rounded-[24px]

                      border
                      border-ink/10

                      bg-white/95

                      backdrop-blur-xl

                      p-2

                      shadow-2xl
                      shadow-black/10
                    "
                  >

                    <div
                      className="
                        px-3
                        pt-3
                        pb-2
                      "
                    >

                      <div
                        className="
                          text-[9px]

                          mono
                          uppercase

                          tracking-[0.2em]

                          text-coral
                        "
                      >
                        Business & Management
                      </div>


                      <div
                        className="
                          serif

                          text-[22px]

                          mt-1
                        "
                      >
                        Find your global course.
                      </div>

                    </div>


                    <div className="mt-1">

                      {managementLinks.map(
                        item => {

                          const Icon =
                            item.icon;


                          return (

                            <Link
                              key={item.title}

                              to={item.path}

                              onClick={closeAll}

                              className={`
                                group

                                flex
                                items-center

                                gap-3

                                rounded-2xl

                                p-3

                                transition

                                ${
                                  item.featured
                                    ? 'bg-coral/[0.08] hover:bg-coral/[0.13]'
                                    : 'hover:bg-cream'
                                }
                              `}
                            >

                              <div
                                className={`
                                  h-10
                                  w-10

                                  shrink-0

                                  rounded-xl

                                  grid
                                  place-items-center

                                  ${
                                    item.featured
                                      ? 'bg-coral text-white'
                                      : 'bg-cream text-ink'
                                  }
                                `}
                              >

                                <Icon
                                  className="
                                    h-4
                                    w-4
                                  "
                                />

                              </div>


                              <div
                                className="
                                  min-w-0
                                  flex-1
                                "
                              >

                                <div
                                  className="
                                    text-[12px]
                                    font-bold
                                  "
                                >
                                  {item.title}
                                </div>


                                <div
                                  className="
                                    mt-0.5

                                    text-[10px]
                                    leading-relaxed

                                    text-ink/45
                                  "
                                >
                                  {item.description}
                                </div>

                              </div>


                              <ArrowUpRight
                                className="
                                  h-3.5
                                  w-3.5

                                  text-ink/20

                                  group-hover:text-coral
                                "
                              />

                            </Link>

                          );

                        }
                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                EXPLORE
            ================================================= */}

            <div
              className="relative"

              onMouseEnter={() => {

                setExploreOpen(true);

                setMbbsOpen(false);

                setManagementOpen(false);

              }}

              onMouseLeave={() =>
                setExploreOpen(false)
              }
            >

              <button
                type="button"
                className={desktopLink}
              >

                Explore

                <ChevronDown
                  className={`
                    h-3
                    w-3

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
                    absolute

                    left-1/2
                    -translate-x-1/2

                    top-full

                    pt-3

                    w-[720px]
                  "
                >

                  <div
                    className="
                      rounded-[26px]

                      border
                      border-ink/10

                      bg-white/95

                      backdrop-blur-xl

                      overflow-hidden

                      shadow-2xl
                      shadow-black/10
                    "
                  >

                    <div
                      className="
                        grid
                        grid-cols-3

                        gap-1

                        p-4
                      "
                    >

                      {exploreGroups.map(
                        group => (

                          <div
                            key={group.heading}
                            className="p-2"
                          >

                            <div
                              className="
                                px-2
                                pb-2

                                text-[8px]

                                mono
                                uppercase

                                tracking-[0.2em]

                                text-coral
                              "
                            >
                              {group.heading}
                            </div>


                            <div className="space-y-1">

                              {group.links.map(
                                item => {

                                  const Icon =
                                    item.icon;


                                  const content = (

                                    <>

                                      <div
                                        className="
                                          h-9
                                          w-9

                                          shrink-0

                                          rounded-xl

                                          bg-cream

                                          grid
                                          place-items-center

                                          group-hover:bg-ink
                                          group-hover:text-cream

                                          transition
                                        "
                                      >

                                        <Icon
                                          className="
                                            h-4
                                            w-4
                                          "
                                        />

                                      </div>


                                      <div className="min-w-0">

                                        <div
                                          className="
                                            text-[11px]
                                            font-bold
                                          "
                                        >
                                          {item.title}
                                        </div>


                                        <div
                                          className="
                                            mt-0.5

                                            text-[9px]
                                            leading-relaxed

                                            text-ink/40
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
                                        key={item.title}

                                        href={item.url}

                                        target="_blank"
                                        rel="noreferrer"

                                        onClick={closeAll}

                                        className="
                                          group

                                          flex
                                          items-start

                                          gap-2.5

                                          rounded-xl

                                          p-2

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
                                      key={item.title}

                                      to={item.path}

                                      onClick={closeAll}

                                      className="
                                        group

                                        flex
                                        items-start

                                        gap-2.5

                                        rounded-xl

                                        p-2

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


                    {/* EXPLORE BOTTOM */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between

                        gap-4

                        border-t
                        border-ink/[0.07]

                        bg-ink

                        px-5
                        py-4

                        text-cream
                      "
                    >

                      <div>

                        <div
                          className="
                            text-[8px]

                            mono
                            uppercase

                            tracking-[0.2em]

                            text-coral
                          "
                        >
                          Need direction?
                        </div>


                        <div
                          className="
                            mt-1

                            text-[11px]

                            text-cream/60
                          "
                        >
                          Build a personalised study route.
                        </div>

                      </div>


                      <Link
                        to="/build-my-route"
                        onClick={closeAll}

                        className="
                          inline-flex
                          items-center
                          gap-2

                          rounded-full

                          bg-coral

                          px-4
                          py-2.5

                          text-[10px]
                          font-bold

                          text-white

                          hover:bg-white
                          hover:text-ink

                          transition
                        "
                      >

                        Build My Route

                        <ArrowRight
                          className="
                            h-3.5
                            w-3.5
                          "
                        />

                      </Link>

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                CAREER GUIDE
            ================================================= */}

            <Link
              to="/build-my-route"
              className={desktopLink}
            >

              <Route
                className="
                  h-3.5
                  w-3.5

                  text-coral
                "
              />

              Career Guide

            </Link>


            {/* =================================================
                BLOGS
            ================================================= */}

            <Link
              to="/blogs"
              className={desktopLink}
            >

              <Newspaper
                className="
                  h-3.5
                  w-3.5

                  text-coral
                "
              />

              Blogs

            </Link>

          </nav>


          {/* =================================================
              RIGHT ACTIONS
          ================================================= */}

          <div
            className="
              hidden
              lg:flex

              items-center
              gap-2

              ml-auto
              xl:ml-2

              shrink-0
            "
          >

            <Link
              to="/track-application"

              className="
                hidden
                2xl:inline-flex

                items-center
                gap-2

                rounded-full

                px-3
                py-2.5

                text-[11px]
                font-semibold

                text-ink/55

                hover:bg-ink/[0.04]
                hover:text-ink

                transition
              "
            >

              <FileCheck2
                className="
                  h-3.5
                  w-3.5
                "
              />

              Track

            </Link>


            <Link
              to="/start-application"

              className="
                group

                inline-flex
                items-center
                gap-2

                rounded-full

                bg-coral

                px-4
                py-2.5

                text-[11px]
                font-bold

                text-white

                shadow-sm

                hover:-translate-y-0.5
                hover:shadow-lg

                transition-all
              "
            >

              Start Application

              <ArrowUpRight
                className="
                  h-3.5
                  w-3.5
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
                value => !value
              )
            }

            className="
              ml-auto

              lg:hidden

              h-11
              w-11

              rounded-full

              border
              border-ink/10

              bg-white/60

              grid
              place-items-center
            "

            aria-label="Toggle navigation"
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
            lg:hidden

            border-t
            border-ink/[0.08]

            bg-cream
          "
        >

          <div
            className="
              px-4
              sm:px-6

              py-4

              max-h-[calc(100vh-76px)]

              overflow-y-auto
            "
          >


            {/* =================================================
                MOBILE MBBS
            ================================================= */}

            <div
              className="
                border-b
                border-ink/10
              "
            >

              <button
                type="button"

                onClick={() => {

                  setMbbsOpen(
                    value => !value
                  );

                  setManagementOpen(false);

                  setExploreOpen(false);

                }}

                className="
                  w-full

                  flex
                  items-center
                  justify-between

                  py-4

                  text-left
                "
              >

                <span
                  className="
                    flex
                    items-center
                    gap-2

                    text-[13px]
                    font-bold
                  "
                >

                  <GraduationCap
                    className="
                      h-4
                      w-4

                      text-coral
                    "
                  />

                  MBBS Abroad

                </span>


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
                    pb-4

                    grid
                    sm:grid-cols-2

                    gap-1
                  "
                >

                  {mbbsCountries.length === 0 ? (

                    <div
                      className="
                        col-span-full

                        py-4

                        text-[11px]

                        text-ink/40
                      "
                    >
                      Loading destinations…
                    </div>

                  ) : (

                    mbbsCountries.map(
                      country => (

                        <Link
                          key={country.slug}

                          to={
                            `/countries/${country.slug}`
                          }

                          onClick={closeAll}

                          className="
                            flex
                            items-center
                            justify-between

                            rounded-xl

                            bg-white/60

                            px-3
                            py-3

                            text-[11px]
                            font-semibold
                          "
                        >

                          MBBS in {country.name}

                          <ArrowUpRight
                            className="
                              h-3
                              w-3

                              text-ink/25
                            "
                          />

                        </Link>

                      )
                    )

                  )}

                </div>

              )}

            </div>


            {/* =================================================
                MOBILE MANAGEMENT
            ================================================= */}

            <div
              className="
                border-b
                border-ink/10
              "
            >

              <button
                type="button"

                onClick={() => {

                  setManagementOpen(
                    value => !value
                  );

                  setMbbsOpen(false);

                  setExploreOpen(false);

                }}

                className="
                  w-full

                  flex
                  items-center
                  justify-between

                  py-4

                  text-left
                "
              >

                <span
                  className="
                    flex
                    items-center
                    gap-2

                    text-[13px]
                    font-bold
                  "
                >

                  <BriefcaseBusiness
                    className="
                      h-4
                      w-4

                      text-coral
                    "
                  />

                  Management Abroad

                </span>


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
                    pb-4

                    space-y-1
                  "
                >

                  {managementLinks.map(
                    item => {

                      const Icon =
                        item.icon;


                      return (

                        <Link
                          key={item.title}

                          to={item.path}

                          onClick={closeAll}

                          className="
                            flex
                            items-center

                            gap-3

                            rounded-xl

                            bg-white/60

                            p-3
                          "
                        >

                          <div
                            className="
                              h-9
                              w-9

                              rounded-xl

                              bg-ink
                              text-cream

                              grid
                              place-items-center

                              shrink-0
                            "
                          >

                            <Icon
                              className="
                                h-4
                                w-4
                              "
                            />

                          </div>


                          <div>

                            <div
                              className="
                                text-[11px]
                                font-bold
                              "
                            >
                              {item.title}
                            </div>


                            <div
                              className="
                                mt-0.5

                                text-[9px]

                                text-ink/40
                              "
                            >
                              {item.description}
                            </div>

                          </div>

                        </Link>

                      );

                    }
                  )}

                </div>

              )}

            </div>


            {/* =================================================
                MOBILE EXPLORE
            ================================================= */}

            <div
              className="
                border-b
                border-ink/10
              "
            >

              <button
                type="button"

                onClick={() => {

                  setExploreOpen(
                    value => !value
                  );

                  setMbbsOpen(false);

                  setManagementOpen(false);

                }}

                className="
                  w-full

                  flex
                  items-center
                  justify-between

                  py-4

                  text-left
                "
              >

                <span
                  className="
                    flex
                    items-center
                    gap-2

                    text-[13px]
                    font-bold
                  "
                >

                  <Compass
                    className="
                      h-4
                      w-4

                      text-coral
                    "
                  />

                  Explore

                </span>


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
                    pb-5

                    space-y-5
                  "
                >

                  {exploreGroups.map(
                    group => (

                      <div key={group.heading}>

                        <div
                          className="
                            mb-2

                            text-[8px]

                            mono
                            uppercase

                            tracking-[0.2em]

                            text-coral
                          "
                        >
                          {group.heading}
                        </div>


                        <div
                          className="
                            grid
                            sm:grid-cols-2

                            gap-1
                          "
                        >

                          {group.links.map(
                            item => {

                              const Icon =
                                item.icon;


                              const content = (

                                <>

                                  <Icon
                                    className="
                                      h-4
                                      w-4

                                      shrink-0

                                      text-ink/40
                                    "
                                  />

                                  <span>
                                    {item.title}
                                  </span>

                                </>

                              );


                              if (item.external) {

                                return (

                                  <a
                                    key={item.title}

                                    href={item.url}

                                    target="_blank"
                                    rel="noreferrer"

                                    onClick={closeAll}

                                    className="
                                      flex
                                      items-center

                                      gap-2.5

                                      rounded-xl

                                      bg-white/60

                                      px-3
                                      py-3

                                      text-[11px]
                                      font-semibold
                                    "
                                  >

                                    {content}

                                  </a>

                                );

                              }


                              return (

                                <Link
                                  key={item.title}

                                  to={item.path}

                                  onClick={closeAll}

                                  className="
                                    flex
                                    items-center

                                    gap-2.5

                                    rounded-xl

                                    bg-white/60

                                    px-3
                                    py-3

                                    text-[11px]
                                    font-semibold
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

              )}

            </div>


            {/* =================================================
                MOBILE BLOG + CAREER GUIDE
            ================================================= */}

            <div
              className="
                grid
                grid-cols-2

                gap-2

                pt-4
              "
            >

              <Link
                to="/blogs"
                onClick={closeAll}

                className="
                  rounded-2xl

                  bg-white

                  border
                  border-ink/10

                  p-4
                "
              >

                <Newspaper
                  className="
                    h-4
                    w-4

                    text-coral
                  "
                />

                <div
                  className="
                    mt-3

                    text-[11px]
                    font-bold
                  "
                >
                  Blogs
                </div>

              </Link>


              <Link
                to="/build-my-route"
                onClick={closeAll}

                className="
                  rounded-2xl

                  bg-white

                  border
                  border-ink/10

                  p-4
                "
              >

                <Route
                  className="
                    h-4
                    w-4

                    text-coral
                  "
                />

                <div
                  className="
                    mt-3

                    text-[11px]
                    font-bold
                  "
                >
                  Career Guide
                </div>

              </Link>


              <Link
                to="/track-application"
                onClick={closeAll}

                className="
                  col-span-2

                  flex
                  items-center
                  justify-between

                  rounded-2xl

                  bg-white

                  border
                  border-ink/10

                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <FileCheck2
                    className="
                      h-4
                      w-4

                      text-coral
                    "
                  />

                  <span
                    className="
                      text-[11px]
                      font-bold
                    "
                  >
                    Track Application
                  </span>

                </div>


                <ArrowRight
                  className="
                    h-4
                    w-4

                    text-ink/30
                  "
                />

              </Link>

            </div>


            {/* =================================================
                MOBILE APPLICATION CTA
            ================================================= */}

            <Link
              to="/start-application"
              onClick={closeAll}

              className="
                mt-3

                flex
                items-center
                justify-between

                rounded-2xl

                bg-coral

                px-5
                py-4

                text-[12px]
                font-bold

                text-white
              "
            >

              Start Your Application

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

  );

}
