import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './Consultation.module.css';
import { trackLead } from '../utils/crm';

const Consultation: React.FC = () => {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [requirement, setRequirement] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6 }
    )
    .fromTo(headerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      '-=0.3'
    )
    .fromTo(formCardRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      '-=0.5'
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || !requirement) {
      setError('Please fill in all required fields.');
      return;
    }

    const success = await trackLead({
      name,
      company: businessName || 'N/A',
      phone,
      email: 'N/A',
      service: requirement,
      message: message || 'AI Consultation Booking Request',
      source: 'Consultation',
      status: 'New'
    });

    if (success) {
      setIsSubmitted(true);
    } else {
      setError('Failed to submit request. Please try again.');
    }
  };

  return (
    <div className={styles.pageContainer} ref={pageRef}>
      {/* Background Ambient Orbs */}
      <div className={styles.ambientOrb} style={{ top: '10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 60%)' }}></div>
      <div className={styles.ambientOrb} style={{ bottom: '10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 60%)' }}></div>

      <div className="container">
        {/* Back Button */}
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back to Home
        </button>

        <div className={styles.contentWrapper}>
          <div className={styles.header} ref={headerRef}>
            <h1 className="heading-lg">Book Your Free <span className="text-gradient">AI Consultation</span></h1>
            <p className="text-lead">
              Fill in your details below. Our automation architects will analyze your business and draft a custom blueprint.
            </p>
          </div>

          <div className={`${styles.formCard} glass-panel`} ref={formCardRef}>
            {isSubmitted ? (
              <div className={styles.successWrapper}>
                <div className={styles.successIcon}>
                  <CheckCircle2 size={64} />
                </div>
                <h2>Consultation Booked!</h2>
                <p>
                  Thank you, <strong>{name}</strong>. We have received your request for <strong>{requirement}</strong>. Our team will reach out to you at <strong>{phone}</strong> within the next 24 hours to schedule our call.
                </p>
                <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
                  Go Back to Home
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                {error && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="phone" className={styles.label}>Contact Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="businessName" className={styles.label}>Business Name</label>
                  <input
                    type="text"
                    id="businessName"
                    placeholder="Enter your business/company name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="requirement" className={styles.label}>What do you need? *</label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="requirement"
                      value={requirement}
                      onChange={(e) => setRequirement(e.target.value)}
                      required
                      className={styles.select}
                    >
                      <option value="" disabled>Select a service</option>
                      <option value="Website Development">Website Development</option>
                      <option value="Website Revamp">Website Revamp</option>
                      <option value="AI Automation">AI Automation</option>
                      <option value="WhatsApp Automation">WhatsApp Automation</option>
                      <option value="AI Voice Agents">AI Voice Agents</option>
                      <option value="CRM Automation">CRM Automation</option>
                      <option value="Workflow Automation">Workflow Automation</option>
                      <option value="Business Automation">Business Automation</option>
                      <option value="Other">Other Services / Custom Requirements</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="message" className={styles.label}>Custom Query / Additional Details</label>
                  <textarea
                    id="message"
                    placeholder="Tell us more about your requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={styles.input}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
                  Submit Consultation Request <Send size={20} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
