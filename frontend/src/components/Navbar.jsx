import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  Link,
  useLocation,
  useNavigate
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
  FileText,
  GraduationCap,
  MapPin,
  Menu,
  MessageSquareQuote,
  Newspaper,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  X
} from 'lucide-react';


/* =========================================================
   BACKEND
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
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

}


/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {

  const location = useLocation();
  const navigate = useNavigate();

  const navRef = useRef(null);


  /* =======================================================
     MENU STATE
  ======================================================= */

  const [activeMenu, setActiveMenu] =
    useState(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);


  /* =======================================================
     MBBS ADMIN DATA
  ======================================================= */

  const [
    universities,
    setUniversities
  ] = useState([]);

  const [
    countriesLoading,
    setCountriesLoading
  ] = useState(true);

  const [
    countriesError,
    setCountriesError
  ] = useState('');


  /* =======================================================
     LOAD UNIVERSITIES FROM ADMIN / BACKEND
  ======================================================= */

  useEffect(() => {

    let active = true;


    async function loadUniversities() {

      try {

        setCountriesLoading(true);
        setCountriesError('');


        const response = await fetch(
          `${API_URL}/api/universities?stream=MBBS`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json'
            }
          }
        );


        if (!response.ok) {

          throw new Error(
            `University request failed: ${response.status}`
          );

        }


        const data =
          await response.json();


        if (!active) {
          return;
        }


        /*
        -------------------------------------------------------
        Support either:

        [
          {...},
          {...}
        ]

        OR

        {
          universities: [...]
        }

        OR

        {
          items: [...]
        }
        -------------------------------------------------------
        */

        let list = [];


        if (Array.isArray(data)) {

          list = data;

        }

        else if (
          Array.isArray(data?.universities)
        ) {

          list = data.universities;

        }

        else if (
          Array.isArray(data?.items)
        ) {

          list = data.items;

        }


        setUniversities(list);

      }

      catch (error) {

        console.error(
          'Navbar university loading error:',
          error
        );


        if (active) {

          setCountriesError(
            'Destinations temporarily unavailable.'
          );

          setUniversities([]);

        }

      }

      finally {

        if (active) {

          setCountriesLoading(false);

        }

      }

    }


    loadUniversities();


    return () => {

      active = false;

    };

  }, []);


  /* =======================================================
     CREATE DYNAMIC COUNTRY LIST

     NO COUNTRIES ARE HARD-CODED HERE.

     Any country represented by an MBBS university from Admin
     can appear automatically.
  ======================================================= */

  const mbbsCountries =
    useMemo(() => {

      const countryMap =
        new Map();


      universities.forEach(
        university => {

          /*
          -----------------------------------------------------
          OPTIONAL PUBLISHED FILTER

          If your backend supplies status / published fields,
          don't show explicitly unpublished records.

          Records without these fields are still allowed.
          -----------------------------------------------------
          */

          const status =
            String(
              university?.status || ''
            )
              .trim()
              .toLowerCase();


          const explicitlyDraft =
            status === 'draft' ||
            status === 'unpublished' ||
            status === 'inactive';


          const explicitlyFalse =
            university?.published === false ||
            university?.is_published === false;


          if (
            explicitlyDraft ||
            explicitlyFalse
          ) {

            return;

          }


          const country =
            String(
              university?.country || ''
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

                slug:
                  university?.country_slug
                    ? slugify(
                        university.country_slug
                      )
                    : slugify(country),

                count: 1
              }
            );

          }

          else {

            const existing =
              countryMap.get(key);


            countryMap.set(
              key,
              {
                ...existing,
                count:
                  existing.count + 1
              }
            );

          }

        }
      );


      return Array
        .from(
          countryMap.values()
        )
        .sort(
          (a, b) =>
            a.name.localeCompare(
              b.name
            )
        );

    }, [universities]);


  /* =======================================================
     MANAGEMENT MENU
  ======================================================= */

  const managementLinks = [

    {
      title:
        'Management Abroad',

      description:
        'Explore international undergraduate and postgraduate options.',

      path:
        '/management',

      icon:
        BriefcaseBusiness
    },

    {
      title:
        'Undergraduate',

      description:
        'Bachelor’s and undergraduate study pathways abroad.',

      path:
        '/management#undergraduate',

      icon:
        GraduationCap
    },

    {
      title:
        'Postgraduate',

      description:
        'Master’s, MBA and postgraduate study pathways.',

      path:
        '/management#postgraduate',

      icon:
        BookOpen
    },

    {
      title:
        'Italy Course Finder',

      description:
        'Search undergraduate and postgraduate programmes in Italy.',

      path:
        '/countries/italy/courses',

      icon:
        Compass,

      featured:
        true
    }

  ];


  /* =======================================================
     EXPLORE MENU

     KEEPING THE WORKING ROUTES
  ======================================================= */

  const exploreGroups = [

    {
      heading:
        'About',

      links: [

        {
          title:
            'About Us',

          description:
            'Meet Route Your Career and our approach.',

          type:
            'route',

          path:
            '/about',

          icon:
            Sparkles
        },

        {
          title:
            'Why RYC',

          description:
            'Why students choose our guidance.',

          type:
            'section',

          path:
            '/about',

          section:
            'why-ryc',

          icon:
            ShieldCheck
        },

        {
          title:
            'Our Promise',

          description:
            'Our approach to student guidance.',

          type:
            'section',

          path:
            '/about',

          section:
            'promise',

          icon:
            Target
        },

        {
          title:
            'Our Presence',

          description:
            'Explore our student support network.',

          type:
            'section',

          path:
            '/about',

          section:
            'presence',

          icon:
            MapPin
        }

      ]
    },


    {
      heading:
        'Discover',

      links: [

        {
          title:
            'Student Testimonials',

          description:
            'Real experiences from students abroad.',

          type:
            'section',

          path:
            '/',

          section:
            'stories',

          icon:
            MessageSquareQuote
        },

        {
          title:
            'RYC on YouTube',

          description:
            'University guides, explainers and updates.',

          type:
            'external',

          url:
            'https://www.youtube.com/@route_your_career',

          icon:
            PlayCircle
        },

        {
          title:
            'Course Finder Quiz',

          description:
            'Find a starting point for your study options.',

          type:
            'route',

          path:
            '/quiz',

          icon:
            Compass
        }

      ]
    },


    {
      heading:
        'Resources',

      links: [

        {
          title:
            'Blogs',

          description:
            'MBBS, management and study-abroad guides.',

          type:
            'route',

          path:
            '/blogs',

          icon:
            Newspaper
        },

        {
          title:
            'FAQ',

          description:
            'Answers to common student questions.',

          type:
            'route',

          path:
            '/faq',

          icon:
            CircleHelp
        },

        {
          title:
            'Career Guide',

          description:
            'Build a route around your career goals.',

          type:
            'route',

          path:
            '/build-my-route',

          icon:
            Route
        }

      ]
    }

  ];


  /* =======================================================
     CLOSE ALL MENUS
  ======================================================= */

  const closeAll = () => {

    setActiveMenu(null);

    setMobileOpen(false);

  };


  /* =======================================================
     TOGGLE MENU
  ======================================================= */

  const toggleMenu =
    menu => {

      setActiveMenu(
        current =>
          current === menu
            ? null
            : menu
      );

    };


  /* =======================================================
     NORMAL NAVIGATION
  ======================================================= */

  const goTo =
    path => {

      closeAll();

      navigate(path);

    };


  /* =======================================================
     SECTION NAVIGATION

     Works for:
     /about#why-ryc
     /about#promise
     /about#presence
     /#stories
     /management#undergraduate
     /management#postgraduate
  ======================================================= */

  const goToSection =
    (
      path,
      sectionId
    ) => {

      closeAll();


      /*
      -------------------------------------------------------
      ALREADY ON SAME PAGE
      -------------------------------------------------------
      */

      if (
        location.pathname === path
      ) {

        window.history.replaceState(
          null,
          '',
          `${path}#${sectionId}`
        );


        setTimeout(
          () => {

            const element =
              document.getElementById(
                sectionId
              );


            if (element) {

              element.scrollIntoView({
                behavior:
                  'smooth',

                block:
                  'start'
              });

            }

          },
          100
        );


        return;

      }


      /*
      -------------------------------------------------------
      DIFFERENT PAGE
      -------------------------------------------------------
      */

      navigate(
        `${path}#${sectionId}`
      );

    };


  /* =======================================================
     HASH SCROLL AFTER ROUTE LOAD
  ======================================================= */

  useEffect(() => {

    if (!location.hash) {
      return;
    }


    const sectionId =
      location.hash.replace(
        '#',
        ''
      );


    const timer =
      setTimeout(
        () => {

          const element =
            document.getElementById(
              sectionId
            );


          if (element) {

            element.scrollIntoView({
              behavior:
                'smooth',

              block:
                'start'
            });

          }

        },
        300
      );


    return () =>
      clearTimeout(timer);

  }, [
    location.pathname,
    location.hash
  ]);


  /* =======================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ======================================================= */

  useEffect(() => {

    function handleOutsideClick(
      event
    ) {

      if (
        navRef.current &&
        !navRef.current.contains(
          event.target
        )
      ) {

        setActiveMenu(null);

      }

    }


    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );

    };

  }, []);


  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {

    function handleEscape(
      event
    ) {

      if (
        event.key === 'Escape'
      ) {

        closeAll();

      }

    }


    document.addEventListener(
      'keydown',
      handleEscape
    );


    return () => {

      document.removeEventListener(
        'keydown',
        handleEscape
      );

    };

  }, []);


  /* =======================================================
     GENERIC EXPLORE ACTION
  ======================================================= */

  const handleExploreItem =
    item => {

      if (
        item.type === 'external'
      ) {

        closeAll();

        window.open(
          item.url,
          '_blank',
          'noopener,noreferrer'
        );

        return;

      }


      if (
        item.type === 'section'
      ) {

        goToSection(
          item.path,
          item.section
        );

        return;

      }


      goTo(
        item.path
      );

    };


  /* =======================================================
     REUSABLE EXPLORE ITEM
  ======================================================= */

  function ExploreItem({
    item
  }) {

    const Icon =
      item.icon;


    return (

      <button
        type="button"

        onClick={() =>
          handleExploreItem(item)
        }

        className="
          group

          w-full

          flex
          items-start
          gap-3

          rounded-2xl

          p-3

          text-left

          transition-all
          duration-200

          hover:bg-[#f5f1e9]
        "
      >

        <div
          className="
            flex

            h-10
            w-10

            shrink-0

            items-center
            justify-center

            rounded-xl

            bg-[#f3efe7]

            text-[#0d1824]

            transition

            group-hover:bg-[#0d1824]
            group-hover:text-white
          "
        >

          <Icon
            size={17}
            strokeWidth={1.8}
          />

        </div>


        <div className="min-w-0">

          <div
            className="
              text-[13px]

              font-semibold

              text-[#0d1824]
            "
          >
            {item.title}
          </div>


          <div
            className="
              mt-1

              text-[11px]

              leading-[1.45]

              text-[#0d1824]/45
            "
          >
            {item.description}
          </div>

        </div>

      </button>

    );

  }


  /* =======================================================
     COUNTRY INITIALS

     Avoid relying on emoji flags.
  ======================================================= */

  function countryInitials(
    country
  ) {

    const words =
      String(country || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (
      words.length === 1
    ) {

      return words[0]
        .slice(0, 2)
        .toUpperCase();

    }


    return words
      .slice(0, 2)
      .map(
        word =>
          word.charAt(0)
      )
      .join('')
      .toUpperCase();

  }


  /* =========================================================
     JSX
  ========================================================= */

  return (

    <header
      ref={navRef}

      className="
        sticky
        top-0

        z-[100]

        border-b
        border-[#0d1824]/10

        bg-[#f8f5ee]/95

        backdrop-blur-xl
      "
    >

      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div
        className="
          mx-auto

          flex

          min-h-[80px]

          max-w-[1500px]

          items-center
          justify-between

          gap-4

          px-5

          lg:px-8
          xl:px-10
        "
      >

        {/* ===================================================
            LOGO
        =================================================== */}

        <Link
          to="/"

          onClick={closeAll}

          className="
            flex

            shrink-0

            items-center

            gap-3
          "
        >

          <div
            className="
              relative

              flex

              h-12
              w-12

              items-center
              justify-center

              rounded-2xl

              bg-[#0d1824]

              text-white
            "
          >

            <span
              className="
                serif

                text-xl

                italic
              "
            >
              r
            </span>


            <span
              className="
                absolute

                -bottom-1
                -right-1

                h-3
                w-3

                rounded-full

                border-2
                border-[#f8f5ee]

                bg-[#f25f3a]
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

                whitespace-nowrap

                text-[22px]

                leading-none

                text-[#0d1824]
              "
            >
              Route Your Career
            </div>


            <div
              className="
                mt-2

                whitespace-nowrap

                text-[7px]

                uppercase

                tracking-[0.32em]

                text-[#0d1824]/40
              "
            >
              Global Education · Your Route
            </div>

          </div>

        </Link>


        {/* ===================================================
            DESKTOP NAV
        =================================================== */}

        <nav
          className="
            hidden

            lg:flex

            items-center

            gap-1
          "
        >

          {/* =================================================
              MBBS ABROAD
          ================================================= */}

          <div className="relative">

            <button
              type="button"

              onClick={() =>
                toggleMenu('mbbs')
              }

              className={`
                flex
                items-center
                gap-2

                rounded-full

                px-4
                py-3

                text-[13px]
                font-semibold

                transition

                ${
                  activeMenu === 'mbbs'
                    ? 'bg-[#eee9df] text-[#0d1824]'
                    : 'text-[#0d1824]/65 hover:bg-[#f0ece4] hover:text-[#0d1824]'
                }
              `}
            >

              <GraduationCap
                size={16}

                className="
                  text-[#f25f3a]
                "
              />

              MBBS Abroad


              <ChevronDown
                size={13}

                className={`
                  transition-transform

                  ${
                    activeMenu === 'mbbs'
                      ? 'rotate-180'
                      : ''
                  }
                `}
              />

            </button>


            {/* =================================================
                MBBS DROPDOWN
            ================================================= */}

            {activeMenu === 'mbbs' && (

              <div
                className="
                  absolute

                  left-0

                  top-[58px]

                  w-[460px]

                  overflow-hidden

                  rounded-[26px]

                  border
                  border-[#0d1824]/10

                  bg-white

                  shadow-[0_25px_80px_rgba(13,24,36,0.16)]
                "
              >

                <div className="p-5">

                  <div
                    className="
                      flex
                      items-end
                      justify-between

                      gap-4

                      mb-4
                    "
                  >

                    <div>

                      <div
                        className="
                          text-[8px]

                          uppercase

                          tracking-[0.25em]

                          text-[#f25f3a]
                        "
                      >
                        Medical Destinations
                      </div>


                      <div
                        className="
                          serif

                          mt-1

                          text-[23px]

                          text-[#0d1824]
                        "
                      >
                        Study MBBS Abroad
                      </div>

                    </div>


                    {!countriesLoading && (

                      <div
                        className="
                          text-[9px]

                          uppercase

                          tracking-[0.15em]

                          text-[#0d1824]/35
                        "
                      >

                        {mbbsCountries.length}{' '}

                        {mbbsCountries.length === 1
                          ? 'country'
                          : 'countries'}

                      </div>

                    )}

                  </div>


                  {/* =========================================
                      LOADING
                  ========================================= */}

                  {countriesLoading && (

                    <div
                      className="
                        grid

                        grid-cols-2

                        gap-2
                      "
                    >

                      {[1, 2, 3, 4].map(
                        item => (

                          <div
                            key={item}

                            className="
                              h-[105px]

                              rounded-2xl

                              bg-[#f3efe7]

                              animate-pulse
                            "
                          />

                        )
                      )}

                    </div>

                  )}


                  {/* =========================================
                      ERROR
                  ========================================= */}

                  {!countriesLoading &&
                    countriesError && (

                    <div
                      className="
                        rounded-2xl

                        border
                        border-red-100

                        bg-red-50

                        px-4
                        py-5

                        text-[11px]

                        text-red-700
                      "
                    >

                      {countriesError}

                    </div>

                  )}


                  {/* =========================================
                      NO COUNTRIES
                  ========================================= */}

                  {!countriesLoading &&
                    !countriesError &&
                    mbbsCountries.length === 0 && (

                    <div
                      className="
                        rounded-2xl

                        border
                        border-dashed
                        border-[#0d1824]/15

                        px-5
                        py-7

                        text-center
                      "
                    >

                      <div
                        className="
                          text-[12px]

                          font-semibold

                          text-[#0d1824]
                        "
                      >
                        No published MBBS destinations found.
                      </div>


                      <div
                        className="
                          mt-1

                          text-[10px]

                          text-[#0d1824]/40
                        "
                      >
                        Add or publish universities from Admin.
                      </div>

                    </div>

                  )}


                  {/* =========================================
                      DYNAMIC COUNTRY GRID
                  ========================================= */}

                  {!countriesLoading &&
                    !countriesError &&
                    mbbsCountries.length > 0 && (

                    <div
                      className="
                        grid

                        grid-cols-2

                        gap-2

                        max-h-[380px]

                        overflow-y-auto

                        pr-1
                      "
                    >

                      {mbbsCountries.map(
                        country => (

                          <button
                            type="button"

                            key={country.slug}

                            onClick={() =>
                              goTo(
                                `/countries/${country.slug}`
                              )
                            }

                            className="
                              group

                              rounded-2xl

                              border
                              border-[#0d1824]/10

                              p-4

                              text-left

                              transition-all

                              hover:border-[#f25f3a]/35

                              hover:bg-[#f8f5ee]
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between

                                gap-3
                              "
                            >

                              <div
                                className="
                                  flex

                                  h-9
                                  w-9

                                  shrink-0

                                  items-center
                                  justify-center

                                  rounded-xl

                                  bg-[#f3efe7]

                                  text-[11px]
                                  font-bold

                                  text-[#0d1824]
                                "
                              >

                                {countryInitials(
                                  country.name
                                )}

                              </div>


                              <ArrowUpRight
                                size={14}

                                className="
                                  text-[#0d1824]/20

                                  transition

                                  group-hover:text-[#f25f3a]
                                "
                              />

                            </div>


                            <div
                              className="
                                mt-3

                                text-[13px]

                                font-semibold

                                text-[#0d1824]
                              "
                            >

                              {country.name}

                            </div>


                            <div
                              className="
                                mt-1

                                text-[10px]

                                text-[#0d1824]/40
                              "
                            >

                              {country.count}{' '}

                              {country.count === 1
                                ? 'published university'
                                : 'published universities'}

                            </div>

                          </button>

                        )
                      )}

                    </div>

                  )}

                </div>


                {/* ===========================================
                    MBBS BOTTOM CTA
                =========================================== */}

                <button
                  type="button"

                  onClick={() =>
                    goTo(
                      '/build-my-route'
                    )
                  }

                  className="
                    flex

                    w-full

                    items-center
                    justify-between

                    bg-[#0d1824]

                    px-5
                    py-4

                    text-left

                    text-white
                  "
                >

                  <div>

                    <div
                      className="
                        text-[8px]

                        uppercase

                        tracking-[0.22em]

                        text-[#f25f3a]
                      "
                    >
                      Need help choosing?
                    </div>


                    <div
                      className="
                        mt-1

                        text-[12px]

                        font-semibold
                      "
                    >
                      Build your MBBS route
                    </div>

                  </div>


                  <ArrowRight
                    size={16}
                  />

                </button>

              </div>

            )}

          </div>


          {/* =================================================
              MANAGEMENT
          ================================================= */}

          <div className="relative">

            <button
              type="button"

              onClick={() =>
                toggleMenu(
                  'management'
                )
              }

              className={`
                flex
                items-center
                gap-2

                rounded-full

                px-4
                py-3

                text-[13px]
                font-semibold

                transition

                ${
                  activeMenu === 'management'
                    ? 'bg-[#eee9df] text-[#0d1824]'
                    : 'text-[#0d1824]/65 hover:bg-[#f0ece4] hover:text-[#0d1824]'
                }
              `}
            >

              <BriefcaseBusiness
                size={15}

                className="
                  text-[#f25f3a]
                "
              />

              Management


              <ChevronDown
                size={13}

                className={`
                  transition-transform

                  ${
                    activeMenu === 'management'
                      ? 'rotate-180'
                      : ''
                  }
                `}
              />

            </button>


            {activeMenu ===
              'management' && (

              <div
                className="
                  absolute

                  left-1/2

                  top-[58px]

                  w-[430px]

                  -translate-x-1/2

                  overflow-hidden

                  rounded-[26px]

                  border
                  border-[#0d1824]/10

                  bg-white

                  shadow-[0_25px_80px_rgba(13,24,36,0.16)]
                "
              >

                <div className="p-3">

                  <div
                    className="
                      px-3
                      pt-2
                      pb-3
                    "
                  >

                    <div
                      className="
                        text-[8px]

                        uppercase

                        tracking-[0.25em]

                        text-[#f25f3a]
                      "
                    >
                      Business & Management
                    </div>


                    <div
                      className="
                        serif

                        mt-1

                        text-[24px]

                        text-[#0d1824]
                      "
                    >
                      Find your global course.
                    </div>

                  </div>


                  <div className="space-y-1">

                    {managementLinks.map(
                      item => {

                        const Icon =
                          item.icon;


                        return (

                          <button
                            type="button"

                            key={
                              item.title
                            }

                            onClick={() => {

                              if (
                                item.path.includes(
                                  '#'
                                )
                              ) {

                                const [
                                  path,
                                  hash
                                ] =
                                  item.path.split(
                                    '#'
                                  );


                                goToSection(
                                  path,
                                  hash
                                );

                              }

                              else {

                                goTo(
                                  item.path
                                );

                              }

                            }}

                            className={`
                              group

                              w-full

                              flex
                              items-center

                              gap-3

                              rounded-2xl

                              p-3

                              text-left

                              transition

                              ${
                                item.featured
                                  ? 'bg-[#f25f3a]/[0.08] hover:bg-[#f25f3a]/[0.13]'
                                  : 'hover:bg-[#f8f5ee]'
                              }
                            `}
                          >

                            <div
                              className={`
                                flex

                                h-10
                                w-10

                                shrink-0

                                items-center
                                justify-center

                                rounded-xl

                                ${
                                  item.featured
                                    ? 'bg-[#f25f3a] text-white'
                                    : 'bg-[#f3efe7] text-[#0d1824]'
                                }
                              `}
                            >

                              <Icon
                                size={16}
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

                                  font-semibold

                                  text-[#0d1824]
                                "
                              >
                                {item.title}
                              </div>


                              <div
                                className="
                                  mt-1

                                  text-[10px]

                                  leading-relaxed

                                  text-[#0d1824]/40
                                "
                              >
                                {item.description}
                              </div>

                            </div>


                            <ArrowUpRight
                              size={14}

                              className="
                                text-[#0d1824]/20

                                group-hover:text-[#f25f3a]
                              "
                            />

                          </button>

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

          <div className="relative">

            <button
              type="button"

              onClick={() =>
                toggleMenu('explore')
              }

              className={`
                flex
                items-center
                gap-2

                rounded-full

                px-4
                py-3

                text-[13px]
                font-semibold

                transition

                ${
                  activeMenu === 'explore'
                    ? 'bg-[#eee9df] text-[#0d1824]'
                    : 'text-[#0d1824]/65 hover:bg-[#f0ece4] hover:text-[#0d1824]'
                }
              `}
            >

              <Compass
                size={15}

                className="
                  text-[#f25f3a]
                "
              />

              Explore


              <ChevronDown
                size={13}

                className={`
                  transition-transform

                  ${
                    activeMenu === 'explore'
                      ? 'rotate-180'
                      : ''
                  }
                `}
              />

            </button>


            {activeMenu ===
              'explore' && (

              <div
                className="
                  absolute

                  left-1/2

                  top-[58px]

                  w-[760px]

                  -translate-x-1/2

                  overflow-hidden

                  rounded-[28px]

                  border
                  border-[#0d1824]/10

                  bg-white/95

                  shadow-[0_30px_100px_rgba(13,24,36,0.18)]

                  backdrop-blur-xl
                "
              >

                {/* ===========================================
                    EXPLORE HEADER
                =========================================== */}

                <div
                  className="
                    border-b
                    border-[#0d1824]/[0.07]

                    bg-[#f8f5ee]/60

                    px-6
                    py-4
                  "
                >

                  <div
                    className="
                      text-[8px]

                      uppercase

                      tracking-[0.25em]

                      text-[#f25f3a]
                    "
                  >
                    Explore Route Your Career
                  </div>


                  <div
                    className="
                      serif

                      mt-1

                      text-[24px]

                      text-[#0d1824]
                    "
                  >
                    Everything you need,
                    in one place.
                  </div>

                </div>


                {/* ===========================================
                    EXPLORE GRID
                =========================================== */}

                <div
                  className="
                    grid

                    grid-cols-3

                    gap-5

                    p-5
                  "
                >

                  {exploreGroups.map(
                    group => (

                      <div
                        key={
                          group.heading
                        }
                      >

                        <div
                          className="
                            mb-2

                            px-3

                            text-[8px]

                            uppercase

                            tracking-[0.25em]

                            text-[#f25f3a]
                          "
                        >
                          {group.heading}
                        </div>


                        {group.links.map(
                          item => (

                            <ExploreItem
                              key={
                                item.title
                              }

                              item={item}
                            />

                          )
                        )}

                      </div>

                    )
                  )}

                </div>


                {/* ===========================================
                    EXPLORE FOOTER
                =========================================== */}

                <div
                  className="
                    flex

                    items-center
                    justify-between

                    bg-[#0d1824]

                    px-6
                    py-4

                    text-white
                  "
                >

                  <div>

                    <div
                      className="
                        text-[8px]

                        uppercase

                        tracking-[0.23em]

                        text-[#f25f3a]
                      "
                    >
                      Need direction?
                    </div>


                    <div
                      className="
                        mt-1

                        text-[11px]

                        text-white/60
                      "
                    >
                      Build a personalised study route.
                    </div>

                  </div>


                  <button
                    type="button"

                    onClick={() =>
                      goTo(
                        '/build-my-route'
                      )
                    }

                    className="
                      flex

                      items-center

                      gap-3

                      rounded-full

                      bg-[#f25f3a]

                      px-5
                      py-3

                      text-[11px]

                      font-bold

                      text-white

                      transition

                      hover:scale-[1.02]
                    "
                  >

                    Build My Route

                    <ArrowRight
                      size={15}
                    />

                  </button>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              CAREER GUIDE
          ================================================= */}

          <button
            type="button"

            onClick={() =>
              goTo(
                '/build-my-route'
              )
            }

            className="
              rounded-full

              px-3
              py-3

              text-[13px]
              font-semibold

              text-[#0d1824]/65

              transition

              hover:bg-[#f0ece4]
              hover:text-[#0d1824]
            "
          >
            Career Guide
          </button>


          {/* =================================================
              BLOGS
          ================================================= */}

          <button
            type="button"

            onClick={() =>
              goTo('/blogs')
            }

            className="
              flex

              items-center

              gap-2

              rounded-full

              px-3
              py-3

              text-[13px]
              font-semibold

              text-[#0d1824]/65

              transition

              hover:bg-[#f0ece4]
              hover:text-[#0d1824]
            "
          >

            <Newspaper
              size={15}

              className="
                text-[#f25f3a]
              "
            />

            Blogs

          </button>


          {/* =================================================
              TRACK
          ================================================= */}

          <button
            type="button"

            onClick={() =>
              goTo(
                '/track-application'
              )
            }

            className="
              rounded-full

              px-3
              py-3

              text-[13px]
              font-semibold

              text-[#0d1824]/55

              transition

              hover:bg-[#f0ece4]
              hover:text-[#0d1824]
            "
          >
            Track
          </button>

        </nav>


        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div
          className="
            flex

            items-center

            gap-2
          "
        >

          <button
            type="button"

            onClick={() =>
              goTo(
                '/start-application'
              )
            }

            className="
              hidden
              sm:flex

              items-center

              gap-3

              rounded-full

              bg-[#f25f3a]

              px-5
              py-3.5

              text-[12px]
              font-bold

              text-white

              shadow-sm

              transition

              hover:-translate-y-0.5
              hover:shadow-lg
            "
          >

            Start Application

            <ArrowUpRight
              size={15}
            />

          </button>


          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"

            onClick={() =>
              setMobileOpen(
                current =>
                  !current
              )
            }

            className="
              flex

              h-11
              w-11

              items-center
              justify-center

              rounded-full

              border
              border-[#0d1824]/10

              text-[#0d1824]

              lg:hidden
            "
          >

            {mobileOpen ? (

              <X size={20} />

            ) : (

              <Menu size={20} />

            )}

          </button>

        </div>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      {mobileOpen && (

        <div
          className="
            max-h-[calc(100vh-80px)]

            overflow-y-auto

            border-t
            border-[#0d1824]/10

            bg-[#f8f5ee]

            px-5
            py-5

            lg:hidden
          "
        >

          <div className="space-y-3">


            {/* =================================================
                MOBILE MBBS
            ================================================= */}

            <div
              className="
                rounded-2xl

                bg-white

                p-4
              "
            >

              <div
                className="
                  flex

                  items-center

                  gap-2

                  text-[12px]

                  font-bold

                  text-[#0d1824]
                "
              >

                <GraduationCap
                  size={16}

                  className="
                    text-[#f25f3a]
                  "
                />

                MBBS Abroad

              </div>


              {countriesLoading ? (

                <div
                  className="
                    mt-3

                    text-[10px]

                    text-[#0d1824]/40
                  "
                >
                  Loading destinations…
                </div>

              ) : (

                <div
                  className="
                    mt-3

                    grid

                    grid-cols-2

                    gap-2
                  "
                >

                  {mbbsCountries.map(
                    country => (

                      <button
                        type="button"

                        key={
                          country.slug
                        }

                        onClick={() =>
                          goTo(
                            `/countries/${country.slug}`
                          )
                        }

                        className="
                          rounded-xl

                          border
                          border-[#0d1824]/10

                          px-3
                          py-3

                          text-left
                        "
                      >

                        <div
                          className="
                            text-[10px]

                            uppercase

                            tracking-[0.15em]

                            text-[#f25f3a]
                          "
                        >
                          {countryInitials(
                            country.name
                          )}
                        </div>


                        <div
                          className="
                            mt-1

                            text-[11px]

                            font-semibold
                          "
                        >
                          {country.name}
                        </div>

                      </button>

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
                rounded-2xl

                bg-white

                p-4
              "
            >

              <div
                className="
                  flex

                  items-center

                  gap-2

                  text-[12px]

                  font-bold
                "
              >

                <BriefcaseBusiness
                  size={16}

                  className="
                    text-[#f25f3a]
                  "
                />

                Management

              </div>


              <div
                className="
                  mt-3

                  space-y-1
                "
              >

                {managementLinks.map(
                  item => (

                    <button
                      key={
                        item.title
                      }

                      type="button"

                      onClick={() => {

                        if (
                          item.path.includes(
                            '#'
                          )
                        ) {

                          const [
                            path,
                            hash
                          ] =
                            item.path.split(
                              '#'
                            );


                          goToSection(
                            path,
                            hash
                          );

                        }

                        else {

                          goTo(
                            item.path
                          );

                        }

                      }}

                      className="
                        w-full

                        rounded-xl

                        bg-[#f8f5ee]

                        px-3
                        py-3

                        text-left

                        text-[11px]

                        font-semibold
                      "
                    >
                      {item.title}
                    </button>

                  )
                )}

              </div>

            </div>


            {/* =================================================
                MOBILE EXPLORE
            ================================================= */}

            <div
              className="
                rounded-2xl

                bg-white

                p-4
              "
            >

              <div
                className="
                  flex

                  items-center

                  gap-2

                  text-[12px]

                  font-bold
                "
              >

                <Compass
                  size={16}

                  className="
                    text-[#f25f3a]
                  "
                />

                Explore

              </div>


              <div
                className="
                  mt-4

                  space-y-5
                "
              >

                {exploreGroups.map(
                  group => (

                    <div
                      key={
                        group.heading
                      }
                    >

                      <div
                        className="
                          mb-2

                          text-[8px]

                          uppercase

                          tracking-[0.2em]

                          text-[#f25f3a]
                        "
                      >
                        {group.heading}
                      </div>


                      <div
                        className="
                          space-y-1
                        "
                      >

                        {group.links.map(
                          item => (

                            <button
                              key={
                                item.title
                              }

                              type="button"

                              onClick={() =>
                                handleExploreItem(
                                  item
                                )
                              }

                              className="
                                w-full

                                rounded-xl

                                bg-[#f8f5ee]

                                px-3
                                py-3

                                text-left

                                text-[11px]

                                font-semibold
                              "
                            >
                              {item.title}
                            </button>

                          )
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* =================================================
                MOBILE TRACK
            ================================================= */}

            <button
              type="button"

              onClick={() =>
                goTo(
                  '/track-application'
                )
              }

              className="
                w-full

                rounded-2xl

                bg-white

                p-4

                text-left

                text-[12px]

                font-bold
              "
            >

              <span
                className="
                  inline-flex

                  items-center

                  gap-2
                "
              >

                <FileCheck2
                  size={16}

                  className="
                    text-[#f25f3a]
                  "
                />

                Track Application

              </span>

            </button>


            {/* =================================================
                MOBILE APPLICATION CTA
            ================================================= */}

            <button
              type="button"

              onClick={() =>
                goTo(
                  '/start-application'
                )
              }

              className="
                w-full

                rounded-2xl

                bg-[#f25f3a]

                p-4

                text-center

                text-[12px]

                font-bold

                text-white
              "
            >

              Start Application →

            </button>

          </div>

        </div>

      )}

    </header>

  );

}
