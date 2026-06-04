import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';
import styles from './Pricing.module.css';

gsap.registerPlugin(ScrollTrigger);

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Custom',
    description: 'Perfect for small businesses looking to automate basic tasks.',
    features: [
      'Custom Website Development',
      'Basic AI Chatbot',
      'Standard WhatsApp Automation',
      'Email Support',
    ],
    recommended: false,
  },
  {
    name: 'Growth',
    price: 'Custom',
    description: 'Advanced AI solutions for scaling companies.',
    features: [
      'Premium 3D Website',
      'Advanced AI Sales Chatbot',
      'Full WhatsApp Automation',
      'Basic CRM Integration',
      'Priority 24/7 Support',
    ],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Complete digital transformation and custom AI development.',
    features: [
      'Custom AI Solutions',
      'AI Voice Agents',
      'Full Workflow Automation',
      'Advanced CRM Automation',
      'Dedicated Account Manager',
    ],
    recommended: false,
  },
];

const Pricing: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
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
    <section id="pricing" className={`section ${styles.pricingSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">Investment in <span className="text-gradient">Growth</span></h2>
          <p className="text-lead">Choose the right automation package for your business needs.</p>
        </div>

        <div className={styles.grid}>
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`${styles.card} ${plan.recommended ? styles.recommended : ''}`}
              ref={(el) => { cardsRef.current[index] = el; }}
            >
              {plan.recommended && <div className={styles.badge}>Recommended</div>}
              
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.priceContainer}>
                <span className={styles.price}>{plan.price}</span>
              </div>
              <p className={styles.description}>{plan.description}</p>
              
              <ul className={styles.features}>
                {plan.features.map((feature, i) => (
                  <li key={i} className={styles.featureItem}>
                    <Check size={20} className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`btn ${plan.recommended ? 'btn-primary' : 'btn-outline'} ${styles.btn}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
