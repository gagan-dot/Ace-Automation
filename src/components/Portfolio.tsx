import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './Portfolio.module.css';

gsap.registerPlugin(ScrollTrigger);

const portfolioItems = [
  {
    category: 'Website Development',
    title: 'NexGen Tech Redesign',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    description: 'A complete modern revamp for a B2B SaaS company increasing conversions by 150%.',
  },
  {
    category: 'AI Chatbot',
    title: 'Support Automata',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop',
    description: 'Intelligent customer service bot handling 80% of tier 1 queries automatically.',
  },
  {
    category: 'WhatsApp Automation',
    title: 'RetailFlow',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop',
    description: 'Automated WhatsApp sales funnel for an e-commerce brand generating 5x ROI.',
  },
  {
    category: 'CRM Systems',
    title: 'SyncLead',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2370&auto=format&fit=crop',
    description: 'Custom AI CRM integration syncing multiple data sources for real estate agents.',
  },
];

const Portfolio: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(sectionRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          }
        }
      );
    }
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === portfolioItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? portfolioItems.length - 1 : prev - 1));
  };

  return (
    <section id="portfolio" className={`section ${styles.portfolioSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">Featured <span className="text-gradient">Work</span></h2>
          <p className="text-lead">Delivering excellence through AI and intelligent design.</p>
        </div>

        <div className={styles.carouselContainer}>
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevSlide}>
            <ChevronLeft size={32} />
          </button>
          
          <div className={styles.carouselInner} ref={sliderRef}>
            {portfolioItems.map((item, index) => {
              let offset = index - activeIndex;
              if (offset < 0) offset += portfolioItems.length;
              
              const isActive = offset === 0;
              const isNext = offset === 1 || (activeIndex === portfolioItems.length - 1 && index === 0);
              const isPrev = offset === portfolioItems.length - 1 || (activeIndex === 0 && index === portfolioItems.length - 1);
              
              let cardClass = styles.cardHidden;
              if (isActive) cardClass = styles.cardActive;
              if (isNext) cardClass = styles.cardNext;
              if (isPrev) cardClass = styles.cardPrev;

              return (
                <div key={index} className={`${styles.card} ${cardClass}`}>
                  <div className={styles.imageContainer}>
                    <img src={item.image} alt={item.title} className={styles.image} />
                    <div className={styles.imageOverlay}></div>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.category}>{item.category}</span>
                    <h3 className={styles.title}>{item.title}</h3>
                    <p className={styles.description}>{item.description}</p>
                    <a href="#" className={styles.viewLink}>
                      View Case Study <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextSlide}>
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
