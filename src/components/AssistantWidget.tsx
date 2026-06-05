import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import styles from './AssistantWidget.module.css';

const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! I am Aace, your AI assistant. How can I help you automate your business today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Thanks for reaching out! One of our human experts will review your request and get back to you shortly. In the meantime, feel free to browse our services.' 
      }]);
    }, 1000);
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        <div className={styles.chatHeader}>
          <div className={styles.botInfo}>
            <div className={styles.botAvatar}>
              <div className={styles.pulse}></div>
            </div>
            <div>
              <h4 className={styles.botName}>Aace AI</h4>
              <span className={styles.botStatus}>Online</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.chatBody}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${styles[msg.type]}`}>
              {msg.text}
            </div>
          ))}
        </div>
        
        <form className={styles.chatFooter} onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.chatInput}
          />
          <button type="submit" className={styles.sendBtn}>
            <Send size={18} />
          </button>
        </form>
      </div>

      <button className={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && <div className={styles.btnPulse}></div>}
      </button>
    </div>
  );
};

export default AssistantWidget;
