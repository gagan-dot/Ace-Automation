import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <h2 className={styles.logo}>ACE <span className="text-gradient">AUTOMATION</span></h2>
            <p className={styles.tagline}>"Automating Businesses. Accelerating Growth."</p>
          </div>
          
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Company</h4>
            <a href="#services">Services</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </div>
          
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Ace Automation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
