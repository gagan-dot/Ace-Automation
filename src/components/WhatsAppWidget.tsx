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
      {/* SVG Icon for WhatsApp */}
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.002 1.332A14.668 14.668 0 001.334 16c0 2.61.683 5.06 1.868 7.218l-1.87 6.84 6.996-1.834a14.62 14.62 0 007.674 2.11 14.668 14.668 0 0014.666-14.668A14.668 14.668 0 0016.002 1.332zm0 24.602c-2.14 0-4.148-.55-5.882-1.508l-.422-.25-4.37 1.146 1.166-4.26-.276-.44a12.164 12.164 0 01-1.884-6.62C4.334 7.674 9.67 2.334 16.002 2.334c6.332 0 11.666 5.34 11.666 11.668 0 6.33-5.334 11.666-11.666 11.666zm6.398-8.47c-.352-.176-2.078-1.026-2.4-1.144-.322-.116-.558-.176-.792.176-.234.352-.91 1.144-1.114 1.378-.206.234-.41.264-.762.088-.352-.176-1.482-.546-2.824-1.744-1.044-.932-1.748-2.08-1.952-2.432-.206-.352-.022-.544.154-.718.158-.158.352-.41.528-.616.176-.206.234-.352.352-.586.116-.234.058-.44-.03-.616-.088-.176-.792-1.908-1.084-2.612-.284-.686-.576-.594-.792-.604-.206-.01-.44-.01-.674-.01-.234 0-.616.088-.94.44-.322.352-1.23 1.202-1.23 2.932 0 1.73 1.26 3.4 1.436 3.634.176.234 2.478 3.782 6.002 5.304.838.36 1.492.576 2.002.738.84.268 1.606.23 2.21.14.678-.1 2.078-.85 2.37-1.672.294-.82.294-1.524.206-1.672-.088-.146-.322-.234-.674-.41z"/>
      </svg>
      <span className={styles.tooltip}>Chat on WhatsApp</span>
    </a>
  );
};

export default WhatsAppWidget;
