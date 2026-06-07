import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Pages
import Home from './pages/Home';
import Consultation from './pages/Consultation';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AssistantWidget from './components/AssistantWidget';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!isAdmin && <div className="cyber-grid"></div>}
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      {!isAdmin && <Footer />}
      {!isAdmin && <AssistantWidget />}
    </div>
  );
};

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
      <div ref={appRef} style={{ opacity: 0 }}>
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
