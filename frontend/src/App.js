import { useEffect } from 'react';
import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';


/* =========================================================
   MAIN PAGES
========================================================= */

import Home from './pages/Home';

import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import BlogsPage from './pages/BlogsPage';


/* =========================================================
   COUNTRY PAGES
========================================================= */

import CountryGeorgia from './pages/CountryGeorgia';
import CountryItaly from './pages/CountryItaly';
import CountryUzbekistan from './pages/CountryUzbekistan';

import DynamicCountryPage from './pages/DynamicCountryPage';
import CountryDetail from './pages/CountryDetail';

import ItalyCourses from './pages/ItalyCourses';


/* =========================================================
   BLOG
========================================================= */

import BlogPost from './pages/BlogPost';


/* =========================================================
   STUDENT TOOLS
========================================================= */

import CourseFinderQuiz from './pages/CourseFinderQuiz';

import BuildMyRoute from './pages/BuildMyRoute';
import TrackApplication from './pages/TrackApplication';
import StartApplication from './pages/StartApplication';


/* =========================================================
   ADMIN
========================================================= */

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';


/* =========================================================
   UI
========================================================= */

import { Toaster } from './components/ui/toaster';


/* =========================================================
   LEGACY COUNTRY ROUTER

   Keeps old links such as:

   /country/ge
   /country/it
   /country/uz
   /country/ru

   working.
========================================================= */

function DynamicCountryRoute() {

  const location = useLocation();


  const code =
    location.pathname
      .split('/')
      .filter(Boolean)[1];


  /* GEORGIA */

  if (code === 'ge') {

    return (
      <Navigate
        to="/countries/georgia"
        replace
      />
    );

  }


  /* ITALY */

  if (code === 'it') {

    return (
      <Navigate
        to="/countries/italy"
        replace
      />
    );

  }


  /* UZBEKISTAN */

  if (code === 'uz') {

    return (
      <Navigate
        to="/countries/uzbekistan"
        replace
      />
    );

  }


  /* RUSSIA */

  if (code === 'ru') {

    return (
      <Navigate
        to="/countries/russia"
        replace
      />
    );

  }


  return <CountryDetail />;

}


/* =========================================================
   APP ROUTER
========================================================= */

function AppRouter() {

  const location = useLocation();


  /* =======================================================
     GOOGLE AUTH CALLBACK
  ======================================================= */

  if (
    location.hash &&
    location.hash.includes('session_id=')
  ) {

    return <AuthCallback />;

  }


  return (

    <Routes>


      {/* ===================================================
          HOME
      =================================================== */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* ===================================================
          ABOUT ROUTE

          Explore → About Us
          Explore → Why RYC
          Explore → Our Promise
          Explore → Our Presence
      =================================================== */}

      <Route
        path="/about"
        element={<AboutPage />}
      />


      {/* ===================================================
          FAQ
      =================================================== */}

      <Route
        path="/faq"
        element={<FAQPage />}
      />


      {/* ===================================================
          BLOG LIBRARY

          All blogs published from Admin appear here.
      =================================================== */}

      <Route
        path="/blogs"
        element={<BlogsPage />}
      />


      {/* ===================================================
          INDIVIDUAL BLOG ARTICLE

          Example:

          /blog/mbbs-in-georgia
      =================================================== */}

      <Route
        path="/blog/:slug"
        element={<BlogPost />}
      />


      {/* ===================================================
          MBBS TRACK

          DO NOT CHANGE.

          Takes student to existing MBBS section.
      =================================================== */}

      <Route
        path="/mbbs"
        element={
          <Navigate
            to="/#featured"
            replace
          />
        }
      />


      {/* ===================================================
          MANAGEMENT TRACK

          DO NOT CHANGE.
      =================================================== */}

      <Route
        path="/management"
        element={
          <Navigate
            to="/#management"
            replace
          />
        }
      />


      {/* ===================================================
          START APPLICATION
      =================================================== */}

      <Route
        path="/start-application"
        element={<StartApplication />}
      />


      {/* ===================================================
          CAREER GUIDE / BUILD MY ROUTE
      =================================================== */}

      <Route
        path="/build-my-route"
        element={<BuildMyRoute />}
      />


      {/* ===================================================
          TRACK APPLICATION
      =================================================== */}

      <Route
        path="/track-application"
        element={<TrackApplication />}
      />


      {/* ===================================================
          COURSE FINDER QUIZ
      =================================================== */}

      <Route
        path="/quiz"
        element={<CourseFinderQuiz />}
      />


      {/* ===================================================
          GEORGIA

          Existing custom page stays untouched.
      =================================================== */}

      <Route
        path="/countries/georgia"
        element={<CountryGeorgia />}
      />


      {/* ===================================================
          ITALY

          Existing custom page stays untouched.
      =================================================== */}

      <Route
        path="/countries/italy"
        element={<CountryItaly />}
      />


      {/* ===================================================
          UZBEKISTAN

          Existing custom page stays untouched.
      =================================================== */}

      <Route
        path="/countries/uzbekistan"
        element={<CountryUzbekistan />}
      />


      {/* ===================================================
          ITALY COURSE FINDER

          IMPORTANT:
          Must stay BEFORE /countries/:country
      =================================================== */}

      <Route
        path="/countries/italy/courses"
        element={<ItalyCourses />}
      />


      {/* ===================================================
          DYNAMIC COUNTRY SYSTEM

          Countries added through Admin can use this route.

          Examples:

          /countries/philippines
          /countries/russia
          /countries/kazakhstan
          /countries/kyrgyzstan
          /countries/germany

          DO NOT REMOVE.
      =================================================== */}

      <Route
        path="/countries/:country"
        element={<DynamicCountryPage />}
      />


      {/* ===================================================
          LEGACY COUNTRY URLS
      =================================================== */}

      <Route
        path="/country/:code"
        element={<DynamicCountryRoute />}
      />


      {/* ===================================================
          ADMIN DASHBOARD
      =================================================== */}

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />


      {/* ===================================================
          ADMIN LOGIN
      =================================================== */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* ===================================================
          ADMIN AUTH CALLBACK
      =================================================== */}

      <Route
        path="/admin/callback"
        element={<AuthCallback />}
      />


      {/* ===================================================
          FALLBACK

          Unknown URL → Home
      =================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />


    </Routes>

  );

}


/* =========================================================
   MAIN APP
========================================================= */

function App() {

  useEffect(() => {

    document.title =
      'Route Your Career — Your pathway to a global career';

  }, []);


  return (

    <div className="App">

      <BrowserRouter>

        <AppRouter />

      </BrowserRouter>


      <Toaster />

    </div>

  );

}


export default App;
