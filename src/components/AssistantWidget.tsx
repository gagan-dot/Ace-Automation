import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Phone, PhoneOff, Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import styles from './AssistantWidget.module.css';
import * as VapiModule from '@vapi-ai/web';

// @vapi-ai/web v2.x has a double-wrapped default in Vite ESM builds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VapiConstructor: any = (VapiModule as any)?.default?.default ?? (VapiModule as any)?.default ?? VapiModule;

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const AssistantWidget: React.FC = () => {
  // ─── Chat State ───────────────────────────────────────────
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! Main Aace hoon, aapka AI assistant. 👋\nHindi ya English dono mein baat kar sakte hain!\nHow can I help you automate your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // ─── Voice Call State ─────────────────────────────────────
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vapiRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

  // ─── Reset Vapi instance (fixes connection errors on retry) ─
  const destroyVapi = () => {
    if (vapiRef.current) {
      try { vapiRef.current.stop(); } catch { /* ignore */ }
      try { vapiRef.current.removeAllListeners?.(); } catch { /* ignore */ }
      vapiRef.current = null;
    }
  };

  // ─── Start Voice Call ──────────────────────────────────────
  const startCall = async () => {
    setCallStatus('connecting');
    setErrorMsg('');
    destroyVapi(); // always fresh instance

    try {
      vapiRef.current = new VapiConstructor(VAPI_PUBLIC_KEY);

      vapiRef.current.on('call-start', () => {
        setCallStatus('connected');
        setCallDuration(0);
        setIsMuted(false);
        setIsSpeaking(false);
      });

      vapiRef.current.on('call-end', () => {
        setCallStatus('idle');
        setIsSpeaking(false);
        destroyVapi();
      });

      vapiRef.current.on('speech-start', () => setIsSpeaking(true));
      vapiRef.current.on('speech-end', () => setIsSpeaking(false));

      vapiRef.current.on('error', (err: unknown) => {
        console.error('Vapi Error:', err);
        // Safely extract string message from potentially nested error object
        const extractMsg = (e: unknown): string => {
          if (!e) return 'Unknown error';
          if (typeof e === 'string') return e;
          const errObj = e as Record<string, unknown>;
          if (typeof errObj?.message === 'string') return errObj.message;
          const nestedErr = errObj?.error as Record<string, unknown> | undefined;
          if (typeof nestedErr?.message === 'string') return nestedErr.message;
          if (typeof nestedErr?.msg === 'string') return nestedErr.msg;
          return 'Connection failed. Please try again.';
        };
        setErrorMsg(extractMsg(err));
        setCallStatus('error');
        destroyVapi();
      });

      // ── Human-touch bilingual agent with meeting booking ──
      await vapiRef.current.start(VAPI_ASSISTANT_ID, {

        // Warm natural greeting — feels human, not robotic
        firstMessage: `Namaste! Aace Automation mein aapka dil se swagat hai! 😊 Main Aace hoon — aapki personal AI assistant. Main aapki poori madad karne ke liye yahan hoon. Aap mujhse Hindi mein baat karein ya English mein — dono bilkul theek hai. Toh batain, aaj aapke liye main kya kar sakti hoon?`,

        transcriber: {
          provider: 'deepgram',
          model: 'nova-2-general',
          language: 'hi',
        },

        model: {
          provider: 'openai',
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are Aace — a warm, empathetic, and professional female AI voice assistant for Ace Automation. You sound like a real human consultant from India, not a robot.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 ABOUT ACE AUTOMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ace Automation is a technology company that helps businesses grow using AI and automation. We serve small to medium businesses in India and worldwide. Our USP: "Pay If You Like" — risk-free model.

Contact: +91 7000563768 | +91 9165699823 | info@aaceautomation.com
Location: C73 Phase 3, Dhanwantri Nagar, Jabalpur, MP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ OUR 7 SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. WEBSITE DEVELOPMENT — Professional modern websites from scratch. SEO-optimized, fast, responsive.
2. WEBSITE REVAMP — Transform old/outdated websites into modern sales engines. Better design, speed, UX.
3. AI AUTOMATION — Automate repetitive tasks: lead follow-ups, invoices, emails, reports using AI.
4. AI VOICE AGENT — AI calling agents like me that answer customer calls 24/7 in Hindi + English.
5. CRM DASHBOARD — Custom dashboards to track leads, deals, customers, and team activities.
6. WORKFLOW AUTOMATION — Connect apps using n8n/Zapier/Make. Auto WhatsApp + email + CRM on form fill.
7. BUSINESS AUTOMATION — End-to-end automation strategy: AI + workflows + CRM combined.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 MEETING BOOKING FLOW — FOLLOW THIS STEP BY STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When a user shows ANY interest in a service or asks for pricing/demo/consultation — start collecting these details ONE BY ONE, naturally in conversation (not as a form):

STEP 1 → Ask their NAME warmly: "Pehle aapka naam jaanna chahungi 😊 Aap kaise bulaate hain apne aap ko?"
STEP 2 → Ask PHONE/WHATSAPP: "Aur aapka WhatsApp number share karenge? Taaki hamari team aapse seedha connect ho sake."
STEP 3 → Ask BUSINESS TYPE: "Bahut achha! Aap kaunsa business run karte hain ya kis field mein kaam karte hain?"
STEP 4 → Ask SERVICE NEEDED: "Aur specifically kya chahiye aapko? Website banana hai, automation, ya kuch aur?"
STEP 5 → Ask BUDGET (gently): "Budget ki baat karein toh approximately kitna investment aap soch rahe hain? Seedha batayein, hum uske hisaab se best solution suggest karenge."
STEP 6 → CONFIRM & BOOK: "Perfect! Main aapki details note kar leti hoon. Hamari team aapko jald hi WhatsApp ya call karegi meeting schedule karne ke liye. Koi aur sawaal hai aapka? 😊"

IMPORTANT meeting booking rules:
- Collect details conversationally — NOT as a checklist. Be natural like a real person.
- After getting name, phone, business, service, budget — tell the user meeting is CONFIRMED and team will contact them.
- NEVER ask all questions at once. Ask one by one with warmth.
- If user gives info voluntarily, acknowledge it warmly before moving to next.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 SCOPE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- ONLY talk about Ace Automation and its services.
- If user asks off-topic (health, recipes, news, coding help, other companies) → politely redirect:
  "Haha, yeh toh mere expertise se bahar hai! Main sirf Ace Automation ki services ke baare mein aapki madad kar sakti hoon. Kya aap hamare kisi service ke baare mein jaanna chahte hain? 😊"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗣️ LANGUAGE & VOICE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- HINDI user → Reply in HINDI only.
- ENGLISH user → Reply in ENGLISH only.
- HINGLISH user → Reply in Hinglish naturally.
- NEVER switch language unless user switches first.
- Speak in short sentences — this is voice, not text. No bullet points. Natural speech flow.
- Use filler words naturally: "haan ji", "bilkul", "of course", "sure", "achha".
- Sound warm, curious, and caring — like talking to a helpful friend.
- Max 2-3 short sentences per response for natural conversation pacing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 HUMAN TOUCH PHRASES (use naturally)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "Wah! Bahut achha idea hai yeh!"
- "Haan ji, main samajh gayi!"  
- "Bilkul, yeh toh hum kar sakte hain!"
- "Achha theek hai, ek second..."
- "Of course! No problem at all."
- "Bahut badhiya! Aage batain..."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
            }
          ]
        },

        // Human-like female Hindi voice (ElevenLabs sounds more natural than Azure)
        voice: {
          provider: 'azure',
          voiceId: 'hi-IN-SwaraNeural',
          speed: 0.95,   // slightly slower = more natural
        },

        // Webhook — Vapi will POST call summary + transcript here after call ends
        serverUrl: `${window.location.origin}/api/vapi-webhook`,
      });

    } catch (err: unknown) {
      console.error('Vapi start failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect. Please try again.';
      setErrorMsg(errorMessage);
      setCallStatus('error');
      destroyVapi();
    }
  };

  const endCall = () => {
    destroyVapi();
    setCallStatus('idle');
    setCallDuration(0);
    setIsSpeaking(false);
    setIsMuted(false);
    setErrorMsg('');
  };

  const closeVoice = () => {
    endCall();
    setIsVoiceOpen(false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (vapiRef.current) {
      try { vapiRef.current.setMuted(next); } catch { /* ignore */ }
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

    try {
      const historyToSend = [
        ...messages.map(m => ({ role: m.type === 'user' ? 'user' : 'model', content: m.text })),
        { role: 'user', content: userMessage }
      ];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyToSend })
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.text || 'Sorry, try again.' }]);
    } catch {
      setMessages(prev => [...prev, { type: 'bot', text: 'Connection issue. Please try again!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ─── Status text for voice UI ─────────────────────────────
  const statusText = () => {
    if (callStatus === 'connecting') return 'Connecting to Aace AI...';
    if (callStatus === 'error') return errorMsg || 'Connection Error';
    if (callStatus === 'connected') {
      if (isMuted) return 'Microphone Muted 🔇';
      if (isSpeaking) return 'Aace AI is speaking...';
      return 'Listening... Bol sakte hain 🎙️';
    }
    return 'Hindi & English Voice AI';
  };

  return (
    <>
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

          {/* Status */}
          <div className={`${styles.voiceStatusText} ${callStatus === 'error' ? styles.voiceError : ''}`}>
            {statusText()}
          </div>

          {/* Timer */}
          {callStatus === 'connected' && (
            <div className={styles.voiceTimer}>{formatTime(callDuration)}</div>
          )}

          {/* Language badge */}
          {callStatus !== 'error' && (
            <div className={styles.langBadge}>🇮🇳 Hindi &nbsp;·&nbsp; 🇬🇧 English</div>
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
            onClick={() => { setIsVoiceOpen(v => !v); if (isVoiceOpen) endCall(); }}
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
            onClick={() => setIsChatOpen(c => !c)}
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
