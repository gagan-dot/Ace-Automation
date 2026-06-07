import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Pages
import Home from './pages/Home';
import Consultation from './pages/Consultation';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AssistantWidget from './components/AssistantWidget';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic global entry animation
    if (appRef.current) {
      gsap.fromTo(appRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 1.5, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <Router>
      <div className="app-container" ref={appRef} style={{ opacity: 0 }}>
        <div className="cyber-grid"></div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/consultation" element={<Consultation />} />
        </Routes>
        <Footer />
        <AssistantWidget />
      </div>
    </Router>
  );
};

export default App;
