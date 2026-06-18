import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, X, Phone, MessageCircle, FileText } from 'lucide-react';
import styles from './Pricing.module.css';

gsap.registerPlugin(ScrollTrigger);

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Custom',
    description: 'Perfect for small businesses looking to automate basic tasks.',
    features: [
      'Custom Website Development',
      'Basic AI Automation',
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
      'Advanced AI Sales Automation',
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
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (showModal && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }

    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const openModal = (planName: string) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0, scale: 0.9, y: 20, duration: 0.25, ease: 'power2.in',
        onComplete: () => {
          setShowModal(false);
        }
      });
    } else {
      setShowModal(false);
    }
  };

  const handleFormOption = () => {
    closeModal();
    setTimeout(() => navigate('/consultation'), 300);
  };

  return (
    <>
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

                <button
                  className={`btn ${plan.recommended ? 'btn-primary' : 'btn-outline'} ${styles.btn}`}
                  onClick={() => openModal(plan.name)}
                >
                  Custom Query
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Query Modal */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div
            className={styles.modal}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={closeModal}>
              <X size={22} />
            </button>

            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Get a <span className="text-gradient">Custom Quote</span>
              </h3>
              <p className={styles.modalSubtitle}>
                {selectedPlan} Plan — Choose how you'd like to connect with us
              </p>
            </div>

            <div className={styles.optionsGrid}>
              {/* Option 1: Fill Form */}
              <button className={styles.optionCard} onClick={handleFormOption}>
                <div className={`${styles.optionIcon} ${styles.iconForm}`}>
                  <FileText size={28} />
                </div>
                <h4>Fill a Form</h4>
                <p>Share your requirements and we'll get back to you with a tailored proposal.</p>
                <span className={styles.optionCta}>Fill Form →</span>
              </button>

              {/* Option 2: Call */}
              <a
                href="tel:8817441489"
                className={styles.optionCard}
                onClick={closeModal}
              >
                <div className={`${styles.optionIcon} ${styles.iconCall}`}>
                  <Phone size={28} />
                </div>
                <h4>Direct Call</h4>
                <p>Speak directly with our AI automation expert. Instant answers.</p>
                <span className={styles.optionCta}>Call +91 8817441489 →</span>
              </a>

              {/* Option 3: WhatsApp */}
              <a
                href="https://wa.me/918817441489"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.optionCard}
                onClick={closeModal}
              >
                <div className={`${styles.optionIcon} ${styles.iconWhatsapp}`}>
                  <MessageCircle size={28} />
                </div>
                <h4>WhatsApp Chat</h4>
                <p>Message us on WhatsApp for a quick reply. Response within 5 minutes.</p>
                <span className={styles.optionCta}>Chat on WhatsApp →</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pricing;
