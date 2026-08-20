import { useEffect } from 'react';
import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';

import Home from './pages/Home';
import CountryGeorgia from './pages/CountryGeorgia';
import CountryItaly from './pages/CountryItaly';
import ItalyCourses from './pages/ItalyCourses';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';

import CountryDetail from './pages/CountryDetail';
import BlogPost from './pages/BlogPost';
import CourseFinderQuiz from './pages/CourseFinderQuiz';

import { Toaster } from './components/ui/toaster';


/*
=========================================================
COUNTRY ROUTER

Georgia and Italy already have dedicated deep pages.

Instead of showing duplicate content:

/country/ge
/country/it

we redirect them to:

/countries/georgia
/countries/italy

All other countries continue using CountryDetail.
=========================================================
*/

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


  return <CountryDetail />;

}


/*
=========================================================
APP ROUTER
=========================================================
*/

function AppRouter() {

  const location = useLocation();


  /*
  ---------------------------------------------------------
  GOOGLE AUTH CALLBACK

  Keep this exactly because your authentication system
  uses session_id inside the URL hash.
  ---------------------------------------------------------
  */

  if (
    location.hash &&
    location.hash.includes('session_id=')
  ) {

    return <AuthCallback />;

  }


  return (

    <Routes>


      {/* =========================
          HOME
      ========================= */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* =========================
          DEDICATED COUNTRY PAGES
      ========================= */}

      <Route
        path="/countries/georgia"
        element={<CountryGeorgia />}
      />


      <Route
        path="/countries/italy"
        element={<CountryItaly />}
      />


      {/* =========================
          ITALY COURSE FINDER
      ========================= */}

      <Route
        path="/countries/italy/courses"
        element={<ItalyCourses />}
      />


      {/* =========================
          DYNAMIC COUNTRY PAGES

          Examples:
          /country/uz
          /country/ie
          /country/eg
          /country/de
          /country/au
      ========================= */}

      <Route
        path="/country/:code"
        element={<DynamicCountryRoute />}
      />


      {/* =========================
          BLOG
      ========================= */}

      <Route
        path="/blog/:slug"
        element={<BlogPost />}
      />


      {/* =========================
          COURSE FINDER
      ========================= */}

      <Route
        path="/quiz"
        element={<CourseFinderQuiz />}
      />


      {/* =========================
          ADMIN
      ========================= */}

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


    </Routes>

  );

}


/*
=========================================================
MAIN APP
=========================================================
*/

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
