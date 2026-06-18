import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, MessageCircle, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Contact.module.css';
import { trackLead, trackWhatsAppClick, trackCallClick } from '../utils/crm';

gsap.registerPlugin(ScrollTrigger);

const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        formRef.current,
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
        infoRef.current,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const companyName = formData.get('companyName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const service = formData.get('service') as string;
    const message = formData.get('message') as string;

    const success = await trackLead({
      name: fullName,
      company: companyName,
      phone,
      email,
      service,
      message,
      source: 'Form',
      status: 'New'
    });

    if (success) {
      alert('Thank you! We will contact you soon.');
      e.currentTarget.reset();
    } else {
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <section id="contact" className={`section ${styles.contactSection}`} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="heading-lg">Let's <span className="text-gradient">Connect</span></h2>
          <p className="text-lead">Ready to automate? Reach out to us today.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.formContainer} ref={formRef}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input type="text" name="fullName" placeholder="Name" required className={styles.input} />
                <input type="text" name="companyName" placeholder="Company Name" className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <input type="tel" name="phone" placeholder="Phone" required className={styles.input} />
                <input type="email" name="email" placeholder="Email" required className={styles.input} />
              </div>
              
              <select name="service" className={styles.select} required defaultValue="">
                <option value="" disabled>Service Interested In</option>
                <option value="Website Development">Website Development</option>
                <option value="AI Chatbots">AI Chatbots</option>
                <option value="WhatsApp Automation">WhatsApp Automation</option>
                <option value="Workflow Automation">Workflow Automation</option>
                <option value="Other">Other</option>
              </select>
              
              <textarea name="message" placeholder="Message" rows={5} required className={styles.textarea}></textarea>
              
              <button type="submit" className="btn btn-primary">
                Send Message <Send size={20} />
              </button>
            </form>
          </div>

          <div className={styles.infoContainer} ref={infoRef}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Fast Track Your Growth</h3>
              <p className={styles.infoDesc}>Connect with our AI experts directly through your preferred channel.</p>
              
              <div className={styles.actionButtons}>
                <a 
                  href="https://wa.me/918817441489" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.actionBtn}
                  onClick={trackWhatsAppClick}
                >
                  <div className={`${styles.iconWrapper} ${styles.whatsapp}`}>
                    <MessageCircle size={24} />
                  </div>
                  <div className={styles.actionText}>
                    <span>Chat on WhatsApp</span>
                    <small>Typical reply &lt; 5 mins</small>
                  </div>
                </a>
                
                <Link to="/consultation" className={styles.actionBtn}>
                  <div className={`${styles.iconWrapper} ${styles.calendar}`}>
                    <Calendar size={24} />
                  </div>
                  <div className={styles.actionText}>
                    <span>Schedule Meeting</span>
                    <small>Book a free consultation</small>
                  </div>
                </Link>

                <a href="mailto:info@aaceautomation.com" className={styles.actionBtn}>
                  <div className={`${styles.iconWrapper} ${styles.mail}`}>
                    <Mail size={24} />
                  </div>
                  <div className={styles.actionText}>
                    <span>Email Us</span>
                    <small>info@aaceautomation.com</small>
                  </div>
                </a>
              </div>
            </div>

            <div className={styles.infoCard} style={{ marginTop: '2rem' }}>
              <h3 className={styles.infoTitle}>Contact Details & Location</h3>
              
              <div className={styles.detailsGroup}>
                <div className={styles.detailItem}>
                  <MapPin size={20} className={styles.detailIcon} />
                  <div>
                    <h4>Location</h4>
                    <p>C73 phase 3 Dhanwantri Nagar, Jabalpur, MP, 482003</p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Phone size={20} className={styles.detailIcon} />
                  <div>
                    <h4>Phone Numbers</h4>
                    <p style={{ marginBottom: '0.25rem' }}><a href="tel:8817441489" className={styles.detailLink} onClick={trackCallClick}>+91 8817441489</a></p>
                    <p><a href="tel:9165699823" className={styles.detailLink} onClick={trackCallClick}>+91 9165699823</a></p>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <Mail size={20} className={styles.detailIcon} />
                  <div>
                    <h4>Official Mail</h4>
                    <p><a href="mailto:info@aaceautomation.com" className={styles.detailLink}>info@aaceautomation.com</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
