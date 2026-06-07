import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Ramesh Kumar',
    company: 'RK Builders & Developers',
    rating: 5,
    text: 'Aace Automation ne humari construction company ke liye ek kamal ka WhatsApp automation aur AI chatbot banaya. Ab hamare site inquiries khud follow up ho jaati hain aur lead conversion mein bhi bahut fark aaya hai.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop',
  },
  {
    name: 'Radha Rani',
    company: 'Radha Rani Tour & Travels',
    rating: 5,
    text: 'Pehle booking ke liye baar baar call karna padta tha. Ab Aace Automation ka WhatsApp automation system sab kuch handle karta hai — booking confirmation, reminders aur cancellations bhi. Business 2x ho gaya!',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2574&auto=format&fit=crop',
  },
  {
    name: 'Dr. Suresh Agarwal',
    company: 'Agarwal Health & Wellness Clinic',
    rating: 5,
    text: 'Clinic ke appointments, reminders aur patient follow-ups sab AI automation se manage ho rahe hain. Staff ka kaafi time bach raha hai aur patients bhi bahut khush hain. Sach mein ek zabardast solution hai.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2670&auto=format&fit=crop',
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
