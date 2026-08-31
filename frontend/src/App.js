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


/* =========================================================
   COUNTRY PAGES
========================================================= */

import CountryGeorgia from './pages/CountryGeorgia';
import CountryItaly from './pages/CountryItaly';
import CountryUzbekistan from './pages/CountryUzbekistan';

import DynamicCountryPage from './pages/DynamicCountryPage';

import ItalyCourses from './pages/ItalyCourses';

import CountryDetail from './pages/CountryDetail';


/* =========================================================
   ABOUT + FAQ
========================================================= */

import About from './pages/About';
import FAQPage from './pages/FAQPage';


/* =========================================================
   BLOG + QUIZ
========================================================= */

import BlogPost from './pages/BlogPost';
import CourseFinderQuiz from './pages/CourseFinderQuiz';


/* =========================================================
   ADMIN
========================================================= */

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';


/* =========================================================
   V2 PAGES
========================================================= */

import BuildMyRoute from './pages/BuildMyRoute';
import TrackApplication from './pages/TrackApplication';
import StartApplication from './pages/StartApplication';


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

  const location =
    useLocation();


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


  /* FALLBACK FOR OLD COUNTRY LINKS */

  return <CountryDetail />;

}


/* =========================================================
   APP ROUTER
========================================================= */

function AppRouter() {

  const location =
    useLocation();


  /* =======================================================
     GOOGLE AUTH CALLBACK

     Keeps your existing Google Admin login callback working.
  ======================================================= */

  if (
    location.hash &&
    location.hash.includes(
      'session_id='
    )
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
          ABOUT ROUTE YOUR CAREER
      =================================================== */}

      <Route
        path="/about"
        element={<About />}
      />


      {/* ===================================================
          FAQ
      =================================================== */}

      <Route
        path="/faq"
        element={<FAQPage />}
      />


      {/* ===================================================
          PRIMARY STUDY TRACKS
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
          CAREER GUIDE

          URL stays /build-my-route for compatibility.
          Navbar can display the name "Career Guide".
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
          DEDICATED COUNTRY PAGES

          These preserve your existing custom pages.
      =================================================== */}

      <Route
        path="/countries/georgia"
        element={<CountryGeorgia />}
      />


      <Route
        path="/countries/italy"
        element={<CountryItaly />}
      />


      <Route
        path="/countries/uzbekistan"
        element={<CountryUzbekistan />}
      />


      {/* ===================================================
          ITALY COURSE FINDER

          IMPORTANT:
          Keep this ABOVE /countries/:country.

          Otherwise "italy/courses" can interfere with
          dynamic country routing.
      =================================================== */}

      <Route
        path="/countries/italy/courses"
        element={<ItalyCourses />}
      />


      {/* ===================================================
          UNIVERSAL DYNAMIC COUNTRY PAGE

          Countries added through Admin can use this.

          Examples:

          /countries/russia
          /countries/philippines
          /countries/kazakhstan
          /countries/kyrgyzstan
          /countries/armenia
          /countries/germany
          /countries/australia

          DynamicCountryPage loads the country information,
          hero and published universities from your backend.
      =================================================== */}

      <Route
        path="/countries/:country"
        element={<DynamicCountryPage />}
      />


      {/* ===================================================
          LEGACY COUNTRY ROUTES
      =================================================== */}

      <Route
        path="/country/:code"
        element={<DynamicCountryRoute />}
      />


      {/* ===================================================
          BLOG POSTS
      =================================================== */}

      <Route
        path="/blog/:slug"
        element={<BlogPost />}
      />


      {/* ===================================================
          COURSE / CAREER QUIZ
      =================================================== */}

      <Route
        path="/quiz"
        element={<CourseFinderQuiz />}
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
          ADMIN GOOGLE AUTH CALLBACK
      =================================================== */}

      <Route
        path="/admin/callback"
        element={<AuthCallback />}
      />


      {/* ===================================================
          FALLBACK

          Any completely unknown URL returns home.
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
