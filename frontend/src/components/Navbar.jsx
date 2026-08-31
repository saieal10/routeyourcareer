import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  GraduationCap,
  BriefcaseBusiness,
  Compass,
  Sparkles,
  ShieldCheck,
  MapPin,
  MessageSquareQuote,
  Youtube,
  Search,
  Newspaper,
  CircleHelp,
  Route,
  FileText,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navRef = useRef(null);

  // =========================================================
  // CLOSE ALL MENUS
  // =========================================================

  const closeAll = () => {
    setActiveMenu(null);
    setMobileOpen(false);
  };

  // =========================================================
  // TOGGLE DESKTOP DROPDOWN
  // =========================================================

  const toggleMenu = (menu) => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };

  // =========================================================
  // NORMAL NAVIGATION
  // =========================================================

  const goTo = (path) => {
    closeAll();
    navigate(path);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 50);
  };

  // =========================================================
  // ABOUT PAGE SECTION NAVIGATION
  //
  // IMPORTANT:
  // This fixes:
  // Explore -> Why RYC
  // Explore -> Our Promise
  // Explore -> Our Presence
  // =========================================================

  const goToSection = (path, sectionId) => {
    closeAll();

    // Already on same page
    if (location.pathname === path) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });

          window.history.replaceState(
            null,
            '',
            `${path}#${sectionId}`
          );
        }
      }, 100);

      return;
    }

    // Going to another page
    navigate(`${path}#${sectionId}`);
  };

  // =========================================================
  // SCROLL TO HASH AFTER PAGE LOAD
  // =========================================================

  useEffect(() => {
    if (!location.hash) return;

    const sectionId = location.hash.replace('#', '');

    const timer = setTimeout(() => {
      const element = document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  // =========================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // ESC KEY
  // =========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // =========================================================
  // MBBS COUNTRIES
  //
  // These can later be loaded dynamically from admin.
  // Keep your current working country URLs here.
  // =========================================================

  const mbbsCountries = [
    {
      name: 'Georgia',
      description: 'European medical education',
      path: '/countries/georgia',
      flag: '🇬🇪',
    },
    {
      name: 'Uzbekistan',
      description: 'Affordable MBBS pathway',
      path: '/countries/uzbekistan',
      flag: '🇺🇿',
    },
    {
      name: 'Russia',
      description: 'Established medical universities',
      path: '/countries/russia',
      flag: '🇷🇺',
    },
    {
      name: 'Philippines',
      description: 'Explore medical universities',
      path: '/countries/philippines',
      flag: '🇵🇭',
    },
  ];

  // =========================================================
  // MANAGEMENT COUNTRIES
  // =========================================================

  const managementCountries = [
    'Italy',
    'United Kingdom',
    'Germany',
    'United States',
    'Australia',
    'Spain',
    'UAE',
    'Singapore',
  ];

  // =========================================================
  // REUSABLE EXPLORE ITEM
  // =========================================================

  const ExploreItem = ({
    icon: Icon,
    title,
    description,
    onClick,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
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
          <Icon size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <div
            className="
              text-[13px]
              font-semibold
              text-[#0d1824]
            "
          >
            {title}
          </div>

          <div
            className="
              mt-1
              text-[11px]
              leading-[1.45]
              text-[#0d1824]/45
            "
          >
            {description}
          </div>
        </div>
      </button>
    );
  };

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
          DESKTOP / MAIN NAVBAR
      ===================================================== */}

      <div
        className="
          mx-auto
          flex
          min-h-[80px]
          max-w-[1500px]
          items-center
          justify-between
          gap-5
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
            <span className="serif text-xl italic">
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

          <div className="hidden sm:block">
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
            DESKTOP NAVIGATION
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
              onClick={() => toggleMenu('mbbs')}
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
                className="text-[#f25f3a]"
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

            {activeMenu === 'mbbs' && (
              <div
                className="
                  absolute
                  left-0
                  top-[58px]
                  w-[410px]
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
                      mb-3
                      text-[8px]
                      uppercase
                      tracking-[0.25em]
                      text-[#f25f3a]
                    "
                  >
                    Medical destinations
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {mbbsCountries.map((country) => (
                      <button
                        type="button"
                        key={country.name}
                        onClick={() => goTo(country.path)}
                        className="
                          group
                          rounded-2xl
                          border
                          border-[#0d1824]/8
                          p-4
                          text-left
                          transition
                          hover:border-[#f25f3a]/30
                          hover:bg-[#f8f5ee]
                        "
                      >
                        <div className="text-xl">
                          {country.flag}
                        </div>

                        <div
                          className="
                            mt-2
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
                            leading-relaxed
                            text-[#0d1824]/45
                          "
                        >
                          {country.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goTo('/countries')}
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
                      Explore
                    </div>

                    <div className="mt-1 text-[12px] font-semibold">
                      View all MBBS destinations
                    </div>
                  </div>

                  <ExternalLink size={15} />
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
              onClick={() => toggleMenu('management')}
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
                className="text-[#f25f3a]"
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

            {activeMenu === 'management' && (
              <div
                className="
                  absolute
                  left-0
                  top-[58px]
                  w-[430px]
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
                      mt-2
                      serif
                      text-[25px]
                      leading-tight
                      text-[#0d1824]
                    "
                  >
                    Build your international
                    <br />
                    business route.
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {managementCountries.map((country) => (
                      <button
                        type="button"
                        key={country}
                        onClick={() =>
                          goTo('/management')
                        }
                        className="
                          rounded-xl
                          border
                          border-[#0d1824]/8
                          px-4
                          py-3
                          text-left
                          text-[11px]
                          font-semibold
                          text-[#0d1824]/70
                          transition
                          hover:border-[#f25f3a]/30
                          hover:bg-[#f8f5ee]
                          hover:text-[#0d1824]
                        "
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goTo('/management')}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    bg-[#0d1824]
                    px-5
                    py-4
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
                      UG + PG
                    </div>

                    <div className="mt-1 text-[12px] font-semibold">
                      Explore management programmes
                    </div>
                  </div>

                  <ExternalLink size={15} />
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              EXPLORE MEGA MENU
          ================================================= */}

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('explore')}
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
                className="text-[#f25f3a]"
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

            {activeMenu === 'explore' && (
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
                <div className="grid grid-cols-3 gap-5 p-6">
                  {/* ABOUT */}

                  <div>
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
                      About
                    </div>

                    <ExploreItem
                      icon={Sparkles}
                      title="About Us"
                      description="Meet Route Your Career and our approach."
                      onClick={() => goTo('/about')}
                    />

                    <ExploreItem
                      icon={ShieldCheck}
                      title="Why RYC"
                      description="Why students choose our guidance."
                      onClick={() =>
                        goToSection('/about', 'why-ryc')
                      }
                    />

                    <ExploreItem
                      icon={FileText}
                      title="Our Promise"
                      description="How we approach student guidance."
                      onClick={() =>
                        goToSection('/about', 'promise')
                      }
                    />

                    <ExploreItem
                      icon={MapPin}
                      title="Our Presence"
                      description="Explore our student support network."
                      onClick={() =>
                        goToSection('/about', 'presence')
                      }
                    />
                  </div>

                  {/* DISCOVER */}

                  <div>
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
                      Discover
                    </div>

                    <ExploreItem
                      icon={MessageSquareQuote}
                      title="Student Stories"
                      description="Real experiences from students abroad."
                      onClick={() =>
                        goTo('/student-stories')
                      }
                    />

                    <ExploreItem
                      icon={Youtube}
                      title="RYC on YouTube"
                      description="University guides, explainers and updates."
                      onClick={() => goTo('/videos')}
                    />

                    <ExploreItem
                      icon={Search}
                      title="Course Finder Quiz"
                      description="Find a starting point for your study options."
                      onClick={() => goTo('/quiz')}
                    />
                  </div>

                  {/* RESOURCES */}

                  <div>
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
                      Resources
                    </div>

                    <ExploreItem
                      icon={Newspaper}
                      title="Blogs"
                      description="MBBS, management and study-abroad guides."
                      onClick={() => goTo('/blogs')}
                    />

                    <ExploreItem
                      icon={CircleHelp}
                      title="FAQ"
                      description="Answers to common student questions."
                      onClick={() => goTo('/faq')}
                    />

                    <ExploreItem
                      icon={Route}
                      title="Career Guide"
                      description="Build a route around your career goals."
                      onClick={() =>
                        goTo('/career-guide')
                      }
                    />
                  </div>
                </div>

                {/* BOTTOM BAR */}

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
                      goTo('/build-my-route')
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
                    <span>→</span>
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
            onClick={() => goTo('/career-guide')}
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
            onClick={() => goTo('/blogs')}
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
              className="text-[#f25f3a]"
            />

            Blogs
          </button>

          {/* =================================================
              TRACK APPLICATION
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              goTo('/track-application')
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goTo('/start-application')}
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
            <span>↗</span>
          </button>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen((current) => !current)
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
          <div className="space-y-2">
            {/* MBBS */}

            <div className="rounded-2xl bg-white p-4">
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
                  className="text-[#f25f3a]"
                />

                MBBS Abroad
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {mbbsCountries.map((country) => (
                  <button
                    type="button"
                    key={country.name}
                    onClick={() => goTo(country.path)}
                    className="
                      rounded-xl
                      border
                      border-[#0d1824]/8
                      px-3
                      py-3
                      text-left
                      text-[11px]
                      font-semibold
                    "
                  >
                    {country.flag} {country.name}
                  </button>
                ))}
              </div>
            </div>

            {/* MANAGEMENT */}

            <button
              type="button"
              onClick={() => goTo('/management')}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                bg-white
                p-4
                text-left
                text-[12px]
                font-bold
                text-[#0d1824]
              "
            >
              <BriefcaseBusiness
                size={16}
                className="text-[#f25f3a]"
              />

              Management Abroad
            </button>

            {/* ABOUT */}

            <button
              type="button"
              onClick={() => goTo('/about')}
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
              About Us
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection('/about', 'why-ryc')
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
              Why RYC
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection('/about', 'promise')
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
              Our Promise
            </button>

            <button
              type="button"
              onClick={() =>
                goToSection('/about', 'presence')
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
              Our Presence
            </button>

            {/* OTHER */}

            <button
              type="button"
              onClick={() => goTo('/student-stories')}
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
              Student Stories
            </button>

            <button
              type="button"
              onClick={() => goTo('/videos')}
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
              RYC on YouTube
            </button>

            <button
              type="button"
              onClick={() => goTo('/blogs')}
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
              Blogs
            </button>

            <button
              type="button"
              onClick={() => goTo('/faq')}
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
              FAQ
            </button>

            <button
              type="button"
              onClick={() => goTo('/career-guide')}
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
              Career Guide
            </button>

            <button
              type="button"
              onClick={() =>
                goTo('/track-application')
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
              Track Application
            </button>

            <button
              type="button"
              onClick={() =>
                goTo('/start-application')
              }
              className="
                mt-4
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
