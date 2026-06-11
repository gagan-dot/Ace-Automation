import React from 'react';
import styles from './WhatsAppWidget.module.css';

const WhatsAppWidget: React.FC = () => {
  // Using the Ace Automation official WhatsApp number
  const phoneNumber = '917000563768'; 
  const message = encodeURIComponent("Hello Aace AI! I am interested in your automation services.");

  return (
    <a 
      href={`https://wa.me/${phoneNumber}?text=${message}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.whatsappWidget}
      aria-label="Chat with us on WhatsApp"
    >
      {/* Modern Sleek Outlined WhatsApp SVG */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ width: '32px', height: '32px', stroke: '#fff', fill: 'none' }}
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        <path d="M16.5 14.5c0 1.5-2.5 1.5-2.5 1.5-4.5 0-6-3.5-6-3.5s-.5-2.5 1-2.5 1.5 0 1.5 0 1.5 1.5 1.5 2-.5 1-.5 1 .5 1.5 2 2.5 1 0 1-.5 1.5-1.5 2-.5 0 1.5 0 1.5z"></path>
      </svg>
      <span className={styles.tooltip}>Chat on WhatsApp</span>
    </a>
  );
};

export default WhatsAppWidget;
