import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>AACE <span className="text-gradient">AUTOMATION</span></span>
        </Link>

        <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.open : ''}`}>
          <a href="#home" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#services" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#portfolio" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Portfolio</a>
          <a href="#about" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#contact" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <a href="tel:7000563768" className={`btn btn-primary ${styles.ctaBtn}`} onClick={() => setMobileMenuOpen(false)}>
            Book Free Strategy Call
          </a>
        </div>

        <button className={styles.mobileToggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
