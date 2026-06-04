import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Industries from '../components/Industries';
import Stats from '../components/Stats';
import Process from '../components/Process';
import Portfolio from '../components/Portfolio';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Contact from '../components/Contact';

const Home: React.FC = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <Hero />
      <Services />
      <Industries />
      <Stats />
      <Process />
      <Portfolio />
      <Testimonials />
      <Pricing />
      <Contact />
    </main>
  );
};

export default Home;
