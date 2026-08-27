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

import CountryItaly from './pages/CountryItaly';

import DynamicCountryPage from './pages/DynamicCountryPage';

import ItalyCourses from './pages/ItalyCourses';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';

import CountryDetail from './pages/CountryDetail';
import BlogPost from './pages/BlogPost';
import CourseFinderQuiz from './pages/CourseFinderQuiz';

import BuildMyRoute from './pages/BuildMyRoute';
import TrackApplication from './pages/TrackApplication';
import StartApplication from './pages/StartApplication';

import { Toaster } from './components/ui/toaster';


/* =========================================================
   OLD COUNTRY URL REDIRECTOR
========================================================= */

function LegacyCountryRoute() {

  const location = useLocation();

  const code =
    location.pathname
      .split('/')
      .filter(Boolean)[1]
      ?.toLowerCase();


  const oldCodeMap = {

    ge: 'georgia',
    georgia: 'georgia',

    ru: 'russia',
    russia: 'russia',

    uz: 'uzbekistan',
    uzbekistan: 'uzbekistan',

    am: 'armenia',
    armenia: 'armenia',

    tj: 'tajikistan',
    tajikistan: 'tajikistan',

    kz: 'kazakhstan',
    kazakhstan: 'kazakhstan',

    kg: 'kyrgyzstan',
    kyrgyzstan: 'kyrgyzstan',

    md: 'moldova',
    moldova: 'moldova',

    eg: 'egypt',
    egypt: 'egypt',

    ie: 'ireland',
    ireland: 'ireland',

    np: 'nepal',
    nepal: 'nepal',

    it: 'italy',
    italy: 'italy'

  };


  const country =
    oldCodeMap[code];


  if (country) {

    return (
      <Navigate
        to={`/countries/${country}`}
        replace
      />
    );

  }


  return <CountryDetail />;

}


/* =========================================================
   ROUTER
========================================================= */

function AppRouter() {

  const location = useLocation();


  /* GOOGLE CALLBACK */

  if (
    location.hash &&
    location.hash.includes('session_id=')
  ) {

    return <AuthCallback />;

  }


  return (

    <Routes>


      {/* HOME */}

      <Route
        path="/"
        element={<Home />}
      />


      {/* MBBS HOME SECTION */}

      <Route
        path="/mbbs"
        element={
          <Navigate
            to="/#featured"
            replace
          />
        }
      />


      {/* MANAGEMENT HOME SECTION */}

      <Route
        path="/management"
        element={
          <Navigate
            to="/#management"
            replace
          />
        }
      />


      {/* APPLICATION */}

      <Route
        path="/start-application"
        element={<StartApplication />}
      />


      {/* CAREER GUIDE */}

      <Route
        path="/build-my-route"
        element={<BuildMyRoute />}
      />


      {/* TRACK */}

      <Route
        path="/track-application"
        element={<TrackApplication />}
      />


      {/* ===================================================
          ITALY SPECIAL PAGE

          Italy remains custom because it has its own
          management / tuition-free design.
      =================================================== */}

      <Route
        path="/countries/italy"
        element={<CountryItaly />}
      />


      {/* ITALY COURSE FINDER */}

      <Route
        path="/countries/italy/courses"
        element={<ItalyCourses />}
      />


      {/* ===================================================
          ALL OTHER COUNTRIES

          IMPORTANT:

          Georgia
          Uzbekistan
          Russia
          Armenia
          Tajikistan
          Kazakhstan
          Kyrgyzstan
          Moldova
          Egypt
          Ireland
          Nepal

          ALL use MongoDB/Admin data.
      =================================================== */}

      <Route
        path="/countries/:country"
        element={<DynamicCountryPage />}
      />


      {/* OLD LINKS */}

      <Route
        path="/country/:code"
        element={<LegacyCountryRoute />}
      />


      {/* BLOG POSTS */}

      <Route
        path="/blog/:slug"
        element={<BlogPost />}
      />


      {/* QUIZ */}

      <Route
        path="/quiz"
        element={<CourseFinderQuiz />}
      />


      {/* ADMIN */}

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


      {/* FALLBACK */}

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
   APP
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
