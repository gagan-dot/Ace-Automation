import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Sarah Jenkins',
    company: 'Global Retail Co.',
    rating: 5,
    text: 'Ace Automation completely transformed our customer service. Their AI chatbots handle thousands of inquiries daily, freeing up our team for complex issues.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop',
  },
  {
    name: 'Michael Chen',
    company: 'NextGen Finance',
    rating: 5,
    text: 'The custom CRM and WhatsApp automation they built for us increased our lead conversion rate by 40%. The ROI was immediate.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop',
  },
  {
    name: 'Elena Rodriguez',
    company: 'Prime Real Estate',
    rating: 5,
    text: 'Our new 3D website is lightyears ahead of our competitors. It’s not just beautiful; it’s a high-converting machine that books consultations automatically.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2670&auto=format&fit=crop',
  },
];

const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current) {
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        
        // Holographic float effect
        gsap.to(card, {
          y: -15,
          rotationY: 5,
          rotationX: 2,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.5,
        });

        // Scroll reveal
        gsap.fromTo(card,
          { opacity: 0, y: 100, rotationX: 45 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            }
          }
        );
      });
    }
  }, []);

  return (
    <section className={`section ${styles.testimonialsSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">Client <span className="text-gradient">Success</span></h2>
          <p className="text-lead">Don't just take our word for it.</p>
        </div>

        <div className={styles.grid}>
          {testimonials.map((item, index) => (
            <div 
              key={index} 
              className={styles.card}
              ref={(el) => { cardsRef.current[index] = el; }}
            >
              <div className={styles.holoOverlay}></div>
              
              <Quote className={styles.quoteIcon} size={40} />
              
              <div className={styles.stars}>
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="var(--accent)" color="var(--accent)" />
                ))}
              </div>
              
              <p className={styles.text}>"{item.text}"</p>
              
              <div className={styles.author}>
                <img src={item.image} alt={item.name} className={styles.authorImage} />
                <div className={styles.authorInfo}>
                  <h4 className={styles.authorName}>{item.name}</h4>
                  <span className={styles.authorCompany}>{item.company}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
