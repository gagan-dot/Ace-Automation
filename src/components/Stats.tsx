import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Stats.module.css';

gsap.registerPlugin(ScrollTrigger);

const statsData = [
  { value: 500, suffix: '+', label: 'Processes Automated' },
  { value: 100, suffix: '+', label: 'Projects Delivered' },
  { value: 24, suffix: '/7', label: 'AI Support' },
  { value: 70, suffix: '%', label: 'Time Saved' },
  { value: 3, suffix: 'x', label: 'Faster Response Times' },
  { value: 40, suffix: '%', label: 'Increase In Lead Conversion' },
];

const Stats: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const countersRef = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current) {
      countersRef.current.forEach((counter, index) => {
        if (!counter) return;
        const targetValue = statsData[index].value;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: targetValue,
          duration: 2,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          onUpdate: () => {
            if (counter) {
              counter.innerText = Math.ceil(obj.val) + statsData[index].suffix;
            }
          }
        });
      });
    }
  }, []);

  return (
    <section className={`section ${styles.statsSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">Why Choose <span className="text-gradient">Ace Automation</span></h2>
        </div>
        
        <div className={styles.grid}>
          {statsData.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <h3 
                className={styles.statValue}
                ref={(el) => (countersRef.current[index] = el)}
              >
                0{stat.suffix}
              </h3>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
