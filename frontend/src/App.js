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
========================================================= */

function DynamicCountryRoute() {

  const location = useLocation();

  const code =
    location.pathname
      .split('/')
      .filter(Boolean)[1];


  if (code === 'ge') {

    return (
      <Navigate
        to="/countries/georgia"
        replace
      />
    );

  }


  if (code === 'it') {

    return (
      <Navigate
        to="/countries/italy"
        replace
      />
    );

  }


  if (code === 'uz') {

    return (
      <Navigate
        to="/countries/uzbekistan"
        replace
      />
    );

  }


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
          BLOGS
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

          Dedicated Management page
      =================================================== */}

      <Route
        path="/management"
        element={<ManagementPage />}
      />


      {/* ===================================================
          MBBS

          Keeps existing MBBS navigation behaviour.
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

          Keep before dynamic country route.
      =================================================== */}

      <Route
        path="/countries/italy/courses"
        element={<ItalyCourses />}
      />


      {/* ===================================================
          GEORGIA
      =================================================== */}

      <Route
        path="/countries/georgia"
        element={<CountryGeorgia />}
      />


      {/* ===================================================
          ITALY
      =================================================== */}

      <Route
        path="/countries/italy"
        element={<CountryItaly />}
      />


      {/* ===================================================
          UZBEKISTAN
      =================================================== */}

      <Route
        path="/countries/uzbekistan"
        element={<CountryUzbekistan />}
      />


      {/* ===================================================
          DYNAMIC ADMIN COUNTRIES

          Examples:
          /countries/philippines
          /countries/russia
          /countries/kazakhstan
          /countries/kyrgyzstan

          DO NOT REMOVE.
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
          ADMIN
      =================================================== */}

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />


      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


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
