import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, RefreshCw, MessageSquare, Phone, Mic, Database, Settings, Zap } from 'lucide-react';
import styles from './Services.module.css';

gsap.registerPlugin(ScrollTrigger);

const servicesData = [
  {
    icon: <Globe size={40} color="#00D4FF" />,
    title: 'Website Development',
    description: 'Modern websites that convert visitors into customers.',
  },
  {
    icon: <RefreshCw size={40} color="#7B61FF" />,
    title: 'Website Revamp',
    description: 'Transform outdated websites into modern sales machines.',
  },
  {
    icon: <MessageSquare size={40} color="#00FFE0" />,
    title: 'AI Automation',
    description: '24/7 customer support and lead qualification.',
  },
  {
    icon: <Phone size={40} color="#25D366" />,
    title: 'WhatsApp Automation',
    description: 'Automate customer conversations and sales.',
  },
  {
    icon: <Mic size={40} color="#00D4FF" />,
    title: 'AI Voice Agents',
    description: 'Human-like AI calling and customer interaction.',
  },
  {
    icon: <Database size={40} color="#7B61FF" />,
    title: 'CRM Automation',
    description: 'Automate lead tracking and customer management.',
  },
  {
    icon: <Settings size={40} color="#00FFE0" />,
    title: 'Workflow Automation',
    description: 'Automate repetitive business processes using AI.',
  },
  {
    icon: <Zap size={40} color="#00D4FF" />,
    title: 'Business Automation',
    description: 'Connect all systems into one intelligent workflow.',
  },
];

const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        cardsRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }
  }, []);

  return (
    <section id="services" className="section" ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">Premium <span className="text-gradient">Services</span></h2>
          <p className="text-lead">Intelligent solutions designed to scale your operations.</p>
        </div>

        <div className={styles.grid}>
          {servicesData.map((service, index) => (
            <div
              key={index}
              className={`glass-card ${styles.card}`}
              ref={(el) => { cardsRef.current[index] = el; }}
            >
              <div className={styles.iconWrapper}>{service.icon}</div>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardDescription}>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
