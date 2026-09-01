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
import ManagementPage from './pages/ManagementPage';


/* =========================================================
   COUNTRY PAGES
========================================================= */

/*
IMPORTANT:

Georgia and Uzbekistan are NO LONGER imported here.

They will now use DynamicCountryPage so university data,
images, tuition, programme information and future Admin
updates can come from your backend.

Italy keeps its dedicated custom-designed page.
*/

import CountryItaly from './pages/CountryItaly';

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

   Keeps old links working:

   /country/ge
   /country/uz
   /country/it
   /country/ru
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


  /* UZBEKISTAN */

  if (code === 'uz') {

    return (
      <Navigate
        to="/countries/uzbekistan"
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


  /* RUSSIA */

  if (code === 'ru') {

    return (
      <Navigate
        to="/countries/russia"
        replace
      />
    );

  }


  /*
  Any other old /country/xx link can continue through
  your existing CountryDetail fallback.
  */

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
          ABOUT
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
      =================================================== */}

      <Route
        path="/blogs"
        element={<BlogsPage />}
      />


      {/* ===================================================
          INDIVIDUAL BLOG
      =================================================== */}

      <Route
        path="/blog/:slug"
        element={<BlogPost />}
      />


      {/* ===================================================
          MANAGEMENT
      =================================================== */}

      <Route
        path="/management"
        element={<ManagementPage />}
      />


      {/* ===================================================
          MBBS
      =================================================== */}

      <Route
        path="/mbbs"
        element={
          <Navigate
            to="/"
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
          ITALY COURSE FINDER

          IMPORTANT:
          Keep this before /countries/:country.
      =================================================== */}

      <Route
        path="/countries/italy/courses"
        element={<ItalyCourses />}
      />


      {/* ===================================================
          ITALY SPECIAL COUNTRY PAGE

          Italy remains your dedicated designed page.
      =================================================== */}

      <Route
        path="/countries/italy"
        element={<CountryItaly />}
      />


      {/* ===================================================
          ALL ADMIN-DRIVEN COUNTRIES

          THIS NOW HANDLES:

          /countries/georgia
          /countries/uzbekistan
          /countries/philippines
          /countries/russia
          /countries/kazakhstan
          /countries/kyrgyzstan
          /countries/egypt
          /countries/moldova
          etc.

          Any future country can work automatically.
      =================================================== */}

      <Route
        path="/countries/:country"
        element={<DynamicCountryPage />}
      />


      {/* ===================================================
          LEGACY COUNTRY LINKS
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
          ADMIN CALLBACK
      =================================================== */}

      <Route
        path="/admin/callback"
        element={<AuthCallback />}
      />


      {/* ===================================================
          FALLBACK
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
