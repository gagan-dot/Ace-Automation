import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import styles from './Hero.module.css';
import { ArrowRight, BrainCircuit, Globe, MessageCircle, BarChart, Mic, CheckCircle } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const visualsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(titleRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, delay: 0.2 }
    )
    .fromTo(subtitleRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8 }, 
      '-=0.6'
    )
    .fromTo(buttonsRef.current, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8 }, 
      '-=0.6'
    )
    .fromTo(trustRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      '-=0.4'
    )
    .fromTo(statsRef.current?.children ? Array.from(statsRef.current.children) : [],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
      '-=0.4'
    );

    // Floating animation for 3D visual cards
    if (visualsRef.current) {
      const cards = visualsRef.current.querySelectorAll(`.${styles.floatingCard}`);
      cards.forEach((card, i) => {
        gsap.to(card, {
          y: `-=${15 + i * 5}`,
          duration: 2 + i * 0.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      });
      
      const brain = visualsRef.current.querySelector(`.${styles.centerBrain}`);
      gsap.to(brain, {
        y: '-=10',
        rotation: 5,
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }

  }, []);

  return (
    <section className={styles.heroSection} id="home">
      {/* Background 3D Ambient Orbs */}
      <div className={styles.ambientOrb} style={{ top: '10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 60%)' }}></div>
      <div className={styles.ambientOrb} style={{ bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 60%)' }}></div>
      
      <div className={`container ${styles.heroContainer}`}>
        
        {/* Left Column: Content */}
        <div className={styles.textContent}>
          <div className={`${styles.badge} ${styles.highlightBadge}`}>
            <span className={styles.badgeDot}></span> PAY IF U LIKE
          </div>
          <h1 ref={titleRef} className="heading-xl">
            Automate Your Business.<br /><span className="text-gradient">Scale Without Limits.</span>
          </h1>
          <p ref={subtitleRef} className="text-lead">
            We help businesses grow faster with AI Automation, AI Chatbots, WhatsApp Automation, AI Voice Agents, and High-Converting Websites that work 24/7 to generate leads, serve customers, and increase revenue.
          </p>
          
          <div ref={buttonsRef} className={styles.buttonGroup}>
            <button className="btn btn-primary" onClick={() => navigate('/consultation')}>
              Book Free Consultation <ArrowRight size={20} />
            </button>
          </div>

          <div className={styles.guaranteeBadge}>
            <span className={styles.guaranteeIcon}>✨</span>
            <strong>Pay If You Like</strong> - 100% Risk-Free Guarantee
          </div>

          <div ref={trustRef} className={styles.trustLine}>
            <CheckCircle size={20} className={styles.trustIcon} />
            <span>Trusted by Businesses Looking to Save Time, Reduce Costs & Increase Sales Through AI.</span>
          </div>

          <div ref={statsRef} className={styles.statsRow}>
            <div className={styles.statItem}>
              <h3>3</h3>
              <p>Projects Delivered</p>
            </div>
            <div className={styles.statItem}>
              <h3>40%</h3>
              <p>Time Saved</p>
            </div>
            <div className={styles.statItem}>
              <h3>24/7</h3>
              <p>AI Operations</p>
            </div>
            <div className={styles.statItem}>
              <h3>3X</h3>
              <p>Faster Response</p>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Visuals */}
        <div className={styles.visualsColumn} ref={visualsRef}>
          <div className={styles.visualsWrapper}>
            {/* Center Brain Orb */}
            <div className={styles.centerBrain}>
              <div className={styles.brainGlow}></div>
              <div className={styles.brainCore}>
                <BrainCircuit size={48} color="#00D4FF" />
              </div>
            </div>

            {/* Orbiting / Floating Mockup Cards */}
            <div className={`${styles.floatingCard} ${styles.cardWeb}`}>
              <Globe size={20} className={styles.cardIcon} />
              <div className={styles.cardDetails}>
                <h4>Website Mockups</h4>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine} style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className={`${styles.floatingCard} ${styles.cardWa}`}>
              <MessageCircle size={20} className={styles.cardIcon} />
              <div className={styles.cardDetails}>
                <h4>WhatsApp Flow</h4>
                <div className={styles.chatBubble}>Automated reply...</div>
              </div>
            </div>

            <div className={`${styles.floatingCard} ${styles.cardCrm}`}>
              <BarChart size={20} className={styles.cardIcon} />
              <div className={styles.cardDetails}>
                <h4>CRM Dashboard</h4>
                <div className={styles.chartBars}>
                  <div className={styles.bar} style={{ height: '40%' }}></div>
                  <div className={styles.bar} style={{ height: '70%' }}></div>
                  <div className={styles.bar} style={{ height: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className={`${styles.floatingCard} ${styles.cardVoice}`}>
              <Mic size={20} className={styles.cardIcon} />
              <div className={styles.cardDetails}>
                <h4>AI Voice Assistant</h4>
                <div className={styles.waveForm}>
                  <span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
