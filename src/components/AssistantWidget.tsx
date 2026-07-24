import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Phone, PhoneOff, Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import styles from './AssistantWidget.module.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const AssistantWidget: React.FC = () => {
  // ─── Chat State ───────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! Main Aace hoon, aapka AI assistant. 👋\nHindi ya English dono mein baat kar sakte hain!\nHow can I help you automate your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Voice Call State (100% Free Browser AI Engine) ───────
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [liveSubtitle, setLiveSubtitle] = useState('');

  const recognitionRef = useRef<any>(null);
  const isCallActiveRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  // Keep refs updated for async events
  useEffect(() => {
    isCallActiveRef.current = callStatus === 'connected';
  }, [callStatus]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-focus input field when chat opens or finishes typing
  useEffect(() => {
    if (isChatOpen && !isTyping) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, isTyping]);

  // Timer for call duration
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Text To Speech Helper ─────────────────────────────
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Stop previous speech & recognition while speaking
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }

    setIsSpeaking(true);

    // Clean markdown stars/bullets for natural speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose Hindi or Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('HI') || v.name.includes('Hindi') || v.name.includes('Swara') || v.name.includes('Heera'));
    if (hiVoice) {
      utterance.voice = hiVoice;
      utterance.lang = hiVoice.lang;
    } else {
      utterance.lang = 'hi-IN';
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // ─── Speech Recognition Listening Loop ─────────────────
  const listenToUser = () => {
    if (!isCallActiveRef.current || isMutedRef.current) return;

    if (!SpeechRecognition) {
      setErrorMsg('Browser speech recognition not supported. Please use Chrome or Edge.');
      setCallStatus('error');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }

      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'hi-IN';

      rec.onstart = () => {
        setLiveSubtitle('Suno, bol sakte hain... 🎙️');
      };

      rec.onresult = async (event: any) => {
        const userTranscript = event.results[0][0].transcript;
        if (!userTranscript || !userTranscript.trim()) {
          if (isCallActiveRef.current && !isMutedRef.current) listenToUser();
          return;
        }

        setLiveSubtitle(`Aap: "${userTranscript}"`);
        voiceHistoryRef.current.push({ role: 'user', content: userTranscript });

        // Send to Gemini AI Backend
        try {
          setLiveSubtitle('Aace AI soch rahi hai...');
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: voiceHistoryRef.current, source: 'Call' })
          });

          if (!res.ok) throw new Error('Network response failed');
          const data = await res.json();
          const aiReply = data.text || 'Main samajh nahi paayi, kripya fir se kahein.';

          voiceHistoryRef.current.push({ role: 'model', content: aiReply });
          setLiveSubtitle(`Aace: "${aiReply}"`);

          // Speak AI response out loud
          speakText(aiReply, () => {
            if (isCallActiveRef.current && !isMutedRef.current) {
              listenToUser();
            }
          });

        } catch (err) {
          console.error('Voice AI Error:', err);
          speakText('Connection problem. Kya aap fir se bolenge?', () => {
            if (isCallActiveRef.current && !isMutedRef.current) {
              listenToUser();
            }
          });
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          if (isCallActiveRef.current && !isMutedRef.current) {
            setTimeout(() => listenToUser(), 400);
          }
          return;
        }
        if (event.error !== 'aborted') {
          console.warn('Speech Rec Error:', event.error);
        }
      };

      rec.start();

    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  };

  // ─── Start Call ──────────────────────────────────────────
  const startCall = async () => {
    setErrorMsg('');
    setCallStatus('connecting');

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.');
      setCallStatus('error');
      return;
    }

    setCallStatus('connected');
    setCallDuration(0);
    setIsMuted(false);
    voiceHistoryRef.current = [];

    // Greeting
    const greeting = 'Namaste! Aace Automation mein aapka swagat hai! Main Aace hoon, aapki personal AI assistant. Aap mujhse Hindi ya English kisi me bhi baat kar sakte hain. Batayein, aaj aapki kya madad karoon?';
    setLiveSubtitle(`Aace: "${greeting}"`);

    speakText(greeting, () => {
      listenToUser();
    });
  };

  // ─── End Call ────────────────────────────────────────────
  const endCall = () => {
    isCallActiveRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallStatus('idle');
    setCallDuration(0);
    setIsSpeaking(false);
    setIsMuted(false);
    setErrorMsg('');
    setLiveSubtitle('');
  };

  const closeVoice = () => {
    endCall();
    setIsVoiceOpen(false);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (nextMuted) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      setLiveSubtitle('Microphone muted 🔇');
    } else {
      if (!isSpeaking) {
        listenToUser();
      }
    }
  };

  // ─── Chat send ────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Retain input focus immediately
    inputRef.current?.focus();

    try {
      const historyToSend = [
        ...messages.map(m => ({ role: m.type === 'user' ? 'user' : 'model', content: m.text })),
        { role: 'user', content: userMessage }
      ];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyToSend, source: 'Chatbot' })
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.text || 'Sorry, try again.' }]);
    } catch {
      setMessages(prev => [...prev, { type: 'bot', text: 'Connection issue. Please try again!' }]);
    } finally {
      setIsTyping(false);
      // Re-focus after response completes
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // ─── Status text for voice UI ─────────────────────────────
  const statusText = () => {
    if (callStatus === 'connecting') return 'Connecting to Aace AI...';
    if (callStatus === 'error') return errorMsg || 'Connection Error';
    if (callStatus === 'connected') {
      if (isMuted) return 'Microphone Muted 🔇';
      if (isSpeaking) return 'Aace AI is speaking... 🔊';
      return liveSubtitle || 'Listening... Bol sakte hain 🎙️';
    }
    return '100% Free Voice AI (Hindi & English)';
  };

  return (
    <>
      {/* 15% Background Blur Overlay when Chat or Voice is open */}
      {(isChatOpen || isVoiceOpen) && (
        <div 
          className={styles.backdropOverlay}
          onClick={() => {
            setIsChatOpen(false);
            if (isVoiceOpen) endCall();
            setIsVoiceOpen(false);
          }}
        />
      )}

      {/* ══════════════════════════════════════════
          VOICE CALL PANEL
      ══════════════════════════════════════════ */}
      <div className={`${styles.voicePanel} ${isVoiceOpen ? styles.voicePanelOpen : ''}`}>
        {/* Header */}
        <div className={styles.voicePanelHeader}>
          <div className={styles.voicePanelTitle}>
            <div className={styles.voicePanelDot}></div>
            <span>Aace AI — Voice Call</span>
          </div>
          <button className={styles.closeBtn} onClick={closeVoice}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className={styles.voiceBody}>
          {/* Avatar with ripples */}
          <div className={styles.voiceAvatarWrap}>
            <div className={styles.voiceRippleArea}>
              {callStatus === 'connected' && (
                <>
                  <div className={`${styles.ripple} ${isSpeaking ? styles.rippleFast : ''}`} />
                  <div className={`${styles.ripple} ${isSpeaking ? styles.rippleFast : ''}`} />
                  <div className={`${styles.ripple} ${isSpeaking ? styles.rippleFast : ''}`} />
                </>
              )}
            </div>
            <div className={styles.voiceAvatar}>
              {callStatus === 'connecting' && <div className={styles.spinnerRing} />}
              {callStatus === 'connected' && isSpeaking
                ? <Volume2 size={34} color="#fff" />
                : callStatus === 'error'
                  ? <AlertCircle size={34} color="#fff" />
                  : <Phone size={34} color="#fff" />
              }
            </div>
          </div>

          {/* Name */}
          <div className={styles.voiceName}>Aace AI Assistant</div>

          {/* Status / Live Subtitle */}
          <div className={`${styles.voiceStatusText} ${callStatus === 'error' ? styles.voiceError : ''}`}>
            {statusText()}
          </div>

          {/* Timer */}
          {callStatus === 'connected' && (
            <div className={styles.voiceTimer}>{formatTime(callDuration)}</div>
          )}

          {/* Language badge */}
          {callStatus !== 'error' && (
            <div className={styles.langBadge}>🇮🇳 Hindi &nbsp;·&nbsp; 🇬🇧 English (Free AI Engine)</div>
          )}

          {/* Controls */}
          <div className={styles.voiceControls}>
            {callStatus === 'idle' && (
              <button className={styles.callStartBtn} onClick={startCall}>
                <Phone size={22} />
                <span>Start Call</span>
              </button>
            )}

            {callStatus === 'connecting' && (
              <button className={`${styles.voiceControlBtn} ${styles.endCallBtn}`} onClick={endCall} title="Cancel">
                <PhoneOff size={20} />
              </button>
            )}

            {callStatus === 'connected' && (
              <>
                <button
                  className={`${styles.voiceControlBtn} ${isMuted ? styles.mutedActive : ''}`}
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button className={`${styles.voiceControlBtn} ${styles.endCallBtn}`} onClick={endCall} title="End Call">
                  <PhoneOff size={20} />
                </button>
              </>
            )}

            {callStatus === 'error' && (
              <button className={styles.callStartBtn} onClick={startCall}>
                <Phone size={20} />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CHAT PANEL
      ══════════════════════════════════════════ */}
      <div className={`${styles.chatWindow} ${isChatOpen ? styles.open : ''}`}>
        <div className={styles.chatHeader}>
          <div className={styles.botInfo}>
            <div className={styles.botAvatar}><div className={styles.pulse} /></div>
            <div>
              <h4 className={styles.botName}>Aace AI</h4>
              <span className={styles.botStatus}>🟢 Online · Hindi & English</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsChatOpen(false)}><X size={20} /></button>
        </div>

        <div className={styles.chatBody} ref={chatBodyRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${styles[msg.type]}`}>
              {msg.text.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
              ))}
            </div>
          ))}
          {isTyping && (
            <div className={styles.typingIndicator}>
              <span /><span /><span />
            </div>
          )}
        </div>

        <form className={styles.chatFooter} onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type in Hindi or English..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className={styles.chatInput}
            disabled={isTyping}
          />
          <button type="submit" className={styles.sendBtn} disabled={isTyping || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* ══════════════════════════════════════════
          TWO FLOATING BUTTONS (stacked)
      ══════════════════════════════════════════ */}
      <div className={styles.fabStack}>
        {/* Voice Button */}
        <div className={styles.fabWrapper}>
          <span className={`${styles.fabLabel} ${styles.fabLabelLeft}`}>AI Voice Call</span>
          <button
            className={`${styles.fab} ${styles.fabVoice} ${isVoiceOpen ? styles.fabActive : ''} ${callStatus === 'connected' ? styles.fabCalling : ''}`}
            onClick={() => {
              if (isChatOpen) setIsChatOpen(false);
              setIsVoiceOpen(v => !v);
              if (isVoiceOpen) endCall();
            }}
            title="AI Voice Call – Hindi & English"
          >
            {isVoiceOpen ? <X size={24} /> : <Phone size={24} />}
            {!isVoiceOpen && callStatus !== 'connected' && <div className={styles.fabPulse} />}
          </button>
        </div>

        {/* Chat Button */}
        <div className={styles.fabWrapper}>
          <span className={`${styles.fabLabel} ${styles.fabLabelLeft}`}>Chat with AI</span>
          <button
            className={`${styles.fab} ${styles.fabChat} ${isChatOpen ? styles.fabActive : ''}`}
            onClick={() => {
              if (isVoiceOpen) { endCall(); setIsVoiceOpen(false); }
              setIsChatOpen(c => !c);
            }}
            title="Chat with Aace AI"
          >
            {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
            {!isChatOpen && <div className={styles.fabPulse} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default AssistantWidget;
