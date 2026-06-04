import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Home, Plane, Scale, Heart, BookOpen, ShoppingCart, Utensils, Hotel, DollarSign, Shield, HardHat, Factory } from 'lucide-react';
import styles from './Industries.module.css';

gsap.registerPlugin(ScrollTrigger);

const industries = [
  { name: 'Real Estate', icon: <Home size={36} color="#00D4FF" /> },
  { name: 'Tour & Travel', icon: <Plane size={36} color="#7B61FF" /> },
  { name: 'Legal Firms', icon: <Scale size={36} color="#00FFE0" /> },
  { name: 'Healthcare', icon: <Heart size={36} color="#FF5252" /> },
  { name: 'Education', icon: <BookOpen size={36} color="#00D4FF" /> },
  { name: 'E-Commerce', icon: <ShoppingCart size={36} color="#FF9800" /> },
  { name: 'Restaurants', icon: <Utensils size={36} color="#00FFE0" /> },
  { name: 'Hotels', icon: <Hotel size={36} color="#7B61FF" /> },
  { name: 'Finance', icon: <DollarSign size={36} color="#4CAF50" /> },
  { name: 'Insurance', icon: <Shield size={36} color="#00D4FF" /> },
  { name: 'Construction', icon: <HardHat size={36} color="#FFC107" /> },
  { name: 'Manufacturing', icon: <Factory size={36} color="#9E9E9E" /> },
];

const Industries: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        itemsRef.current,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }
  }, []);

  return (
    <section id="industries" className={`section ${styles.industriesSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">Industries We <span className="text-gradient">Empower</span></h2>
          <p className="text-lead">Tailored AI solutions across every major sector.</p>
        </div>

        <div className={styles.grid}>
          {industries.map((industry, index) => (
            <div
              key={index}
              className={styles.industryItem}
              ref={(el) => (itemsRef.current[index] = el)}
            >
              <div className={styles.iconContainer}>
                {industry.icon}
              </div>
              <span className={styles.industryName}>{industry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;
