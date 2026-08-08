import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import CountryGeorgia from './pages/CountryGeorgia';
import CountryItaly from './pages/CountryItaly';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthCallback from './pages/AuthCallback';
import CountryDetail from './pages/CountryDetail';
import BlogPost from './pages/BlogPost';
import CourseFinderQuiz from './pages/CourseFinderQuiz';
import { Toaster } from './components/ui/toaster';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
function AppRouter() {
  const location = useLocation();
  if (location.hash && location.hash.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/countries/georgia" element={<CountryGeorgia />} />
      <Route path="/countries/italy" element={<CountryItaly />} />
      <Route path="/country/:code" element={<CountryDetail />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/quiz" element={<CourseFinderQuiz />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/callback" element={<AuthCallback />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    document.title = 'Route Your Career — Your pathway to a global career';
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
