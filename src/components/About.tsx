import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, ShieldCheck, Cpu, Flame } from 'lucide-react';
import styles from './About.module.css';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );

      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }
  }, []);

  return (
    <section id="about" className={`section ${styles.aboutSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.grid}>
          {/* Left Column: Story and mission */}
          <div className={styles.leftCol} ref={leftRef}>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span> WHO WE ARE
            </div>
            <h2 className="heading-lg">
              Pioneering the <span className="text-gradient">AI-Driven</span> Operations Era
            </h2>
            <p className={styles.description}>
              We are an elite team of developers, automation architects, and AI specialists dedicated to reshaping how modern businesses function. We believe in replacing repetitive manual grind with intelligent, self-learning digital workflows that run 24/7.
            </p>
            <div className={styles.taglineHighlight}>
              <h3>Our Philosophy: "Pay If U Like"</h3>
              <p>
                We operate on a unique, risk-free model. We demonstrate our commitment to value by building, integrating, and deploying custom systems. If you aren't completely satisfied with the results, you don't pay us. It's that simple.
              </p>
            </div>
          </div>

          {/* Right Column: Values cards */}
          <div className={styles.rightCol} ref={rightRef}>
            <div className={styles.valuesGrid}>
              <div className={`glass-card ${styles.valueCard}`}>
                <div className={`${styles.iconWrapper} ${styles.blue}`}>
                  <Brain size={24} />
                </div>
                <h4>AI-First Architecture</h4>
                <p>Engineered from the ground up to integrate advanced LLMs and voice agents.</p>
              </div>

              <div className={`glass-card ${styles.valueCard}`}>
                <div className={`${styles.iconWrapper} ${styles.purple}`}>
                  <Flame size={24} />
                </div>
                <h4>Zero Risk Integration</h4>
                <p>Our "Pay if U like" philosophy ensures absolute alignment with your goals.</p>
              </div>

              <div className={`glass-card ${styles.valueCard}`}>
                <div className={`${styles.iconWrapper} ${styles.green}`}>
                  <Cpu size={24} />
                </div>
                <h4>Custom Blueprints</h4>
                <p>Every workflow is tailor-made to sync with your specific tools and CRMs.</p>
              </div>

              <div className={`glass-card ${styles.valueCard}`}>
                <div className={`${styles.iconWrapper} ${styles.cyan}`}>
                  <ShieldCheck size={24} />
                </div>
                <h4>Enterprise Security</h4>
                <p>Guaranteed data confidentiality, privacy, and compliance at every step.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
