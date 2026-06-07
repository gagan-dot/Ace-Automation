import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import styles from './AssistantWidget.module.css';

const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! I am Aace, your AI assistant. How can I help you automate your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const historyToSend = [
        ...messages.map(m => ({
          role: m.type === 'user' ? 'user' : 'model',
          content: m.text
        })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyToSend })
      });

      if (!response.ok) {
        throw new Error('API server error');
      }

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { type: 'bot', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an issue processing that. Please try again.' }]);
      }
    } catch (err) {
      console.error('Failed to communicate with AI Assistant:', err);
      setMessages(prev => [...prev, { type: 'bot', text: 'I am having trouble connecting right now. Please check your internet or try again later!' }]);
    } finally {
      setIsTyping(false);
    }
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
        
        <div className={styles.chatBody} ref={chatBodyRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${styles[msg.type]}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
        
        <form className={styles.chatFooter} onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.chatInput}
            disabled={isTyping}
          />
          <button type="submit" className={styles.sendBtn} disabled={isTyping || !input.trim()}>
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
