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
import CountryUzbekistan from './pages/CountryUzbekistan';

import DynamicCountryPage from './pages/DynamicCountryPage';

import ItalyCourses from './pages/ItalyCourses';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';

import CountryDetail from './pages/CountryDetail';

import BlogsPage from './pages/BlogsPage';
import BlogPost from './pages/BlogPost';

import CourseFinderQuiz from './pages/CourseFinderQuiz';

import BuildMyRoute from './pages/BuildMyRoute';
import TrackApplication from './pages/TrackApplication';
import StartApplication from './pages/StartApplication';

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


  /* GOOGLE AUTH CALLBACK */

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


      {/* MBBS */}

      <Route
        path="/mbbs"
        element={
          <Navigate
            to="/#featured"
            replace
          />
        }
      />


      {/* MANAGEMENT */}

      <Route
        path="/management"
        element={
          <Navigate
            to="/#management"
            replace
          />
        }
      />


      {/* START APPLICATION */}

      <Route
        path="/start-application"
        element={<StartApplication />}
      />


      {/* CAREER GUIDE */}

      <Route
        path="/build-my-route"
        element={<BuildMyRoute />}
      />


      {/* TRACK APPLICATION */}

      <Route
        path="/track-application"
        element={<TrackApplication />}
      />


      {/* GEORGIA */}

      <Route
        path="/countries/georgia"
        element={<CountryGeorgia />}
      />


      {/* ITALY */}

      <Route
        path="/countries/italy"
        element={<CountryItaly />}
      />


      {/* UZBEKISTAN */}

      <Route
        path="/countries/uzbekistan"
        element={<CountryUzbekistan />}
      />


      {/* ITALY COURSE FINDER */}

      <Route
        path="/countries/italy/courses"
        element={<ItalyCourses />}
      />


      {/* DYNAMIC COUNTRIES */}

      <Route
        path="/countries/:country"
        element={<DynamicCountryPage />}
      />


      {/* OLD COUNTRY LINKS */}

      <Route
        path="/country/:code"
        element={<DynamicCountryRoute />}
      />


      {/* ===================================================
          ALL BLOGS
      =================================================== */}

      <Route
        path="/blogs"
        element={<BlogsPage />}
      />


      {/* INDIVIDUAL BLOG */}

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
