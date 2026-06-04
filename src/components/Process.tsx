import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Process.module.css';

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  { step: '01', title: 'Business Analysis', desc: 'Deep dive into your current operations to identify automation opportunities.' },
  { step: '02', title: 'Automation Strategy', desc: 'Custom blueprint designing the perfect AI and automation architecture.' },
  { step: '03', title: 'Development', desc: 'Building your custom AI agents, websites, and automation workflows.' },
  { step: '04', title: 'Testing', desc: 'Rigorous QA to ensure seamless integration and flawless execution.' },
  { step: '05', title: 'Deployment', desc: 'Launching your new automated systems into your live business environment.' },
  { step: '06', title: 'Optimization', desc: 'Continuous monitoring and refinement for maximum ROI.' },
];

const Process: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current && lineRef.current) {
      // Animate the central line drawing down
      gsap.fromTo(lineRef.current, 
        { height: '0%' },
        {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            end: 'bottom 80%',
            scrub: true,
          }
        }
      );

      // Animate steps fading in
      stepsRef.current.forEach((step, i) => {
        if (!step) return;
        gsap.fromTo(step,
          { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 75%',
            }
          }
        );
      });
    }
  }, []);

  return (
    <section className={`section ${styles.processSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">AI Automation <span className="text-gradient">Process</span></h2>
          <p className="text-lead">From concept to fully automated reality in 6 steps.</p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineLineBg}></div>
          <div className={styles.timelineLineProgress} ref={lineRef}></div>

          {processSteps.map((item, index) => (
            <div 
              key={index} 
              className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`}
              ref={(el) => { stepsRef.current[index] = el; }}
            >
              <div className={styles.timelineContent}>
                <div className={styles.stepNumber}>{item.step}</div>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
              <div className={styles.timelineDot}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
