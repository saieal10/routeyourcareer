import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CountryGeorgia from './pages/CountryGeorgia';
import { Toaster } from './components/ui/toaster';

function App() {
  useEffect(() => {
    document.title = 'Route Your Career — Your pathway to a global MBBS';
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/countries/georgia" element={<CountryGeorgia />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
