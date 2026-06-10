import React, { useState, useEffect } from 'react';
import styles from './AdminLogin.module.css';
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, User, Mail, Phone, KeyRound, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

type FlowStep = 'loading' | 'setup' | 'login' | 'forgot-choose' | 'forgot-verify' | 'forgot-otp' | 'forgot-reset' | 'success';

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<FlowStep>('loading');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Admin info (masked, from server)
  const [adminName, setAdminName] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  // Setup form
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');

  // Login form
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [forgotValue, setForgotValue] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirm, setNewConfirm] = useState('');

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/status');
      const data = await res.json();
      if (data.exists) {
        setAdminName(data.name || 'Admin');
        setMaskedEmail(data.maskedEmail || '');
        setMaskedPhone(data.maskedPhone || '');
        setStep('login');
      } else {
        setStep('setup');
      }
    } catch {
      setStep('setup');
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // ============ SETUP HANDLER ============
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!setupName.trim() || !setupEmail.trim() || !setupPhone.trim() || !setupPassword) {
      setError('All fields are required.');
      triggerShake();
      return;
    }
    if (setupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      triggerShake();
      return;
    }
    if (setupPassword !== setupConfirm) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: setupName.trim(),
          email: setupEmail.trim(),
          phone: setupPhone.trim(),
          password: setupPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage('Admin account created! Redirecting to dashboard...');
      setStep('success');
      setTimeout(() => {
        sessionStorage.setItem('ace_admin_auth', 'true');
        onLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Setup failed.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ LOGIN HANDLER ============
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginPassword) {
      setError('Please enter your password.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sessionStorage.setItem('ace_admin_auth', 'true');
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      triggerShake();
      setLoginPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ FORGOT PASSWORD: VERIFY IDENTITY ============
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forgotValue.trim()) {
      setError(`Please enter your ${forgotMethod === 'email' ? 'email address' : 'phone number'}.`);
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: forgotMethod, value: forgotValue.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDevOtp(data._devOtp || '');
      setStep('forgot-otp');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ FORGOT PASSWORD: VERIFY OTP ============
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim() || otpCode.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep('forgot-reset');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ FORGOT PASSWORD: RESET ============
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      triggerShake();
      return;
    }
    if (newPassword !== newConfirm) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMessage('Password reset successful! Redirecting...');
      setStep('success');
      setTimeout(() => {
        sessionStorage.setItem('ace_admin_auth', 'true');
        onLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForgotFlow = () => {
    setForgotValue('');
    setOtpCode('');
    setDevOtp('');
    setNewPassword('');
    setNewConfirm('');
    setError('');
    setForgotMethod('email');
  };

  // ============ RENDER ============
  return (
    <div className={styles.loginPage}>
      {/* Background Effects */}
      <div className={styles.ambientOrb} style={{ top: '10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)' }}></div>
      <div className={styles.ambientOrb} style={{ bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)' }}></div>
      <div className={styles.gridOverlay}></div>

      <div className={`${styles.loginCard} ${isShaking ? styles.shake : ''}`}>

        {/* ========== LOADING ========== */}
        {step === 'loading' && (
          <div className={styles.loadingState}>
            <Loader2 size={36} className={styles.spinner} />
            <p>Checking admin status...</p>
          </div>
        )}

        {/* ========== SUCCESS ========== */}
        {step === 'success' && (
          <div className={styles.successState}>
            <div className={styles.successIconWrap}>
              <CheckCircle size={48} className={styles.successIcon} />
            </div>
            <h2 className={styles.title}>{successMessage}</h2>
          </div>
        )}

        {/* ========== FIRST-TIME SETUP ========== */}
        {step === 'setup' && (
          <>
            <div className={styles.iconWrapper}>
              <div className={styles.iconGlow}></div>
              <ShieldCheck size={40} className={styles.shieldIcon} />
            </div>
            <h1 className={styles.title}>Create Admin Account</h1>
            <p className={styles.subtitle}>First time? Set up your admin credentials to secure the CRM dashboard.</p>

            <form onSubmit={handleSetup} className={styles.form}>
              <div className={styles.inputGroup}>
                <User size={18} className={styles.inputIcon} />
                <input type="text" value={setupName} onChange={(e) => setSetupName(e.target.value)} placeholder="Full Name" className={styles.input} autoFocus />
              </div>
              <div className={styles.inputGroup}>
                <Mail size={18} className={styles.inputIcon} />
                <input type="email" value={setupEmail} onChange={(e) => setSetupEmail(e.target.value)} placeholder="Email Address" className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <Phone size={18} className={styles.inputIcon} />
                <input type="tel" value={setupPhone} onChange={(e) => setSetupPhone(e.target.value)} placeholder="Phone Number" className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <Lock size={18} className={styles.inputIcon} />
                <input type={showPassword ? 'text' : 'password'} value={setupPassword} onChange={(e) => setSetupPassword(e.target.value)} placeholder="Create Password (min 6 chars)" className={styles.input} />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className={styles.inputGroup}>
                <KeyRound size={18} className={styles.inputIcon} />
                <input type={showConfirmPassword ? 'text' : 'password'} value={setupConfirm} onChange={(e) => setSetupConfirm(e.target.value)} placeholder="Confirm Password" className={styles.input} />
                <button type="button" className={styles.togglePassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className={styles.errorMsg}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={18} className={styles.spinner} /> Creating Account...</> : 'Create Admin Account'}
              </button>
            </form>

            <a href="/" className={styles.backLink}>← Return to Website</a>
          </>
        )}

        {/* ========== LOGIN ========== */}
        {step === 'login' && (
          <>
            <div className={styles.iconWrapper}>
              <div className={styles.iconGlow}></div>
              <ShieldCheck size={40} className={styles.shieldIcon} />
            </div>
            <h1 className={styles.title}>Welcome Back{adminName ? `, ${adminName}` : ''}</h1>
            <p className={styles.subtitle}>Enter your admin password to access the CRM dashboard.</p>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.inputGroup}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className={styles.input}
                  autoFocus
                />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className={styles.errorMsg}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={18} className={styles.spinner} /> Authenticating...</> : 'Authenticate & Enter'}
              </button>
            </form>

            <button className={styles.forgotLink} onClick={() => { resetForgotFlow(); setStep('forgot-choose'); }}>
              Forgot Password?
            </button>

            <a href="/" className={styles.backLink}>← Return to Website</a>
          </>
        )}

        {/* ========== FORGOT: CHOOSE METHOD ========== */}
        {step === 'forgot-choose' && (
          <>
            <div className={styles.iconWrapper}>
              <div className={styles.iconGlowOrange}></div>
              <KeyRound size={40} className={styles.keyIcon} />
            </div>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Verify your identity to reset your admin password. Choose a method below.</p>

            <div className={styles.methodCards}>
              <button
                className={`${styles.methodCard} ${forgotMethod === 'email' ? styles.methodActive : ''}`}
                onClick={() => setForgotMethod('email')}
              >
                <Mail size={24} />
                <div>
                  <strong>Email</strong>
                  <span>{maskedEmail || 'Registered email'}</span>
                </div>
              </button>
              <button
                className={`${styles.methodCard} ${forgotMethod === 'phone' ? styles.methodActive : ''}`}
                onClick={() => setForgotMethod('phone')}
              >
                <Phone size={24} />
                <div>
                  <strong>Phone</strong>
                  <span>{maskedPhone || 'Registered phone'}</span>
                </div>
              </button>
            </div>

            <button className={styles.loginBtn} onClick={() => setStep('forgot-verify')}>
              Continue with {forgotMethod === 'email' ? 'Email' : 'Phone'}
            </button>

            <button className={styles.backBtn} onClick={() => { setError(''); setStep('login'); }}>
              <ArrowLeft size={16} /> Back to Login
            </button>
          </>
        )}

        {/* ========== FORGOT: ENTER EMAIL/PHONE ========== */}
        {step === 'forgot-verify' && (
          <>
            <div className={styles.iconWrapper}>
              <div className={styles.iconGlowOrange}></div>
              {forgotMethod === 'email' ? <Mail size={40} className={styles.keyIcon} /> : <Phone size={40} className={styles.keyIcon} />}
            </div>
            <h1 className={styles.title}>Verify {forgotMethod === 'email' ? 'Email' : 'Phone'}</h1>
            <p className={styles.subtitle}>
              Enter your registered {forgotMethod === 'email' ? 'email address' : 'phone number'} to receive a verification OTP.
            </p>

            <form onSubmit={handleVerifyIdentity} className={styles.form}>
              <div className={styles.inputGroup}>
                {forgotMethod === 'email' ? <Mail size={18} className={styles.inputIcon} /> : <Phone size={18} className={styles.inputIcon} />}
                <input
                  type={forgotMethod === 'email' ? 'email' : 'tel'}
                  value={forgotValue}
                  onChange={(e) => { setForgotValue(e.target.value); setError(''); }}
                  placeholder={forgotMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                  className={styles.input}
                  autoFocus
                />
              </div>

              {error && (
                <div className={styles.errorMsg}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={18} className={styles.spinner} /> Verifying...</> : 'Send OTP'}
              </button>
            </form>

            <button className={styles.backBtn} onClick={() => { setError(''); setStep('forgot-choose'); }}>
              <ArrowLeft size={16} /> Choose Different Method
            </button>
          </>
        )}

        {/* ========== FORGOT: ENTER OTP ========== */}
        {step === 'forgot-otp' && (
          <>
            <div className={styles.iconWrapper}>
              <div className={styles.iconGlowGreen}></div>
              <ShieldCheck size={40} className={styles.otpIcon} />
            </div>
            <h1 className={styles.title}>Enter OTP</h1>
            <p className={styles.subtitle}>
              A 6-digit verification code has been generated. Check your server console for the OTP.
            </p>

            {devOtp && (
              <div className={styles.devOtpBox}>
                <span className={styles.devOtpLabel}>🔐 Dev OTP</span>
                <span className={styles.devOtpCode}>{devOtp}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <div className={styles.inputGroup}>
                <KeyRound size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="Enter 6-digit OTP"
                  className={`${styles.input} ${styles.otpInput}`}
                  maxLength={6}
                  autoFocus
                />
              </div>

              {error && (
                <div className={styles.errorMsg}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={18} className={styles.spinner} /> Verifying...</> : 'Verify OTP'}
              </button>
            </form>

            <button className={styles.backBtn} onClick={() => { setError(''); setStep('forgot-verify'); }}>
              <ArrowLeft size={16} /> Resend OTP
            </button>
          </>
        )}

        {/* ========== FORGOT: SET NEW PASSWORD ========== */}
        {step === 'forgot-reset' && (
          <>
            <div className={styles.iconWrapper}>
              <div className={styles.iconGlowGreen}></div>
              <CheckCircle size={40} className={styles.otpIcon} />
            </div>
            <h1 className={styles.title}>Create New Password</h1>
            <p className={styles.subtitle}>Identity verified! Set a new password for your admin account.</p>

            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.inputGroup}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="New Password (min 6 chars)"
                  className={styles.input}
                  autoFocus
                />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className={styles.inputGroup}>
                <KeyRound size={18} className={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={newConfirm}
                  onChange={(e) => { setNewConfirm(e.target.value); setError(''); }}
                  placeholder="Confirm New Password"
                  className={styles.input}
                />
                <button type="button" className={styles.togglePassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className={styles.errorMsg}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={18} className={styles.spinner} /> Resetting...</> : 'Reset Password & Login'}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminLogin;
