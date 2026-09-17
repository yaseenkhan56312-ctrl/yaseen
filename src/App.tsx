/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Zap,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SupportedLanguage, AuthMode, UserSession, ThemeMode } from './types';
import { TRANSLATIONS } from './data/translations';
import { Waveform } from './components/Waveform';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { SocialLoginModal } from './components/SocialLoginModal';
import { MainDashboard } from './components/MainDashboard';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
  speakText,
} from './utils/speech';

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [mode, setMode] = useState<AuthMode>('login');

  // Theme state: dark (default) or light (high contrast)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('vca_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vca_theme', next);
      return next;
    });
  };

  // Form fields
  const [username, setUsername] = useState('yaseenkhan56312@gmail.com');
  const [password, setPassword] = useState('VoiceMaster#2026');
  const [fullName, setFullName] = useState('Yaseen Khan');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modals & session
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [socialModalProvider, setSocialModalProvider] = useState<'Google' | 'Microsoft' | null>(null);

  // User session: start as null so user can see the login screen with the requested light/dark mode toggle,
  // or they can click "Enter Dashboard as Yaseen Khan" or "LOGIN"
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const speechRecognizerRef = useRef<any>(null);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ur' || language === 'ps';
  const isDark = theme === 'dark';

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Toggle show/hide password
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Switch language
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    let langNotice = 'English language selected';
    if (newLang === 'ur') {
      langNotice = 'اردو زبان منتخب کی گئی ہے';
    } else if (newLang === 'ps') {
      langNotice = 'پښتو ژبه وټاکل شوه';
    }
    showToast(langNotice, 'info');
  };

  // Handle Login
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalName = fullName.trim() || 'Yaseen Khan';
    const finalEmail = username.trim() || 'yaseenkhan56312@gmail.com';

    // Success login
    const session: UserSession = {
      username: finalName,
      email: finalEmail.includes('@') ? finalEmail : `${finalEmail}@gmail.com`,
      fullName: finalName,
      loginMethod: 'credentials',
      loginTime: new Date().toLocaleTimeString(),
      role: 'Administrator',
      status: 'Online',
    };

    setUserSession(session);
    showToast(t.loginSuccess, 'success');
    speakText(`Welcome back, ${session.fullName}`, language);
  };

  // Direct login as Yaseen Khan
  const handleInstantDemoLogin = () => {
    const session: UserSession = {
      username: 'Yaseen Khan',
      email: 'yaseenkhan56312@gmail.com',
      fullName: 'Yaseen Khan',
      loginMethod: 'credentials',
      loginTime: new Date().toLocaleTimeString(),
      role: 'Administrator',
      status: 'Online',
    };
    setUserSession(session);
    showToast('Signed in as Yaseen Khan', 'success');
    speakText('Welcome back, Yaseen Khan', language);
  };

  // Handle Signup
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showToast(t.fillRequiredFields, 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast(t.passwordMismatch, 'error');
      speakText('Passwords do not match. Please verify.', language);
      return;
    }

    const session: UserSession = {
      username: username.trim(),
      email: username.includes('@') ? username.trim() : `${username.trim()}@voiceassistant.ai`,
      fullName: fullName.trim() || username.trim(),
      loginMethod: 'credentials',
      loginTime: new Date().toLocaleTimeString(),
      role: 'Administrator',
      status: 'Online',
    };

    setUserSession(session);
    showToast('Account created successfully!', 'success');
    speakText(`Account created. Welcome ${session.fullName}`, language);
  };

  // Fill demo credentials
  const fillDemoCredentials = () => {
    setUsername('yaseenkhan56312@gmail.com');
    setPassword('VoiceMaster#2026');
    setFullName('Yaseen Khan');
    showToast('Yaseen Khan credentials populated', 'info');
    speakText('Credentials populated for Yaseen Khan', language);
  };

  // Voice command processor
  const handleVoiceCommand = (transcript: string) => {
    const text = transcript.toLowerCase();

    if (text.includes('demo') || text.includes('fill')) {
      fillDemoCredentials();
      return;
    }

    if (text.includes('login') || text.includes('log in') || text.includes('sign in') || text.includes('ننوتل') || text.includes('لاگ ان')) {
      handleInstantDemoLogin();
      return;
    }

    if (text.includes('theme') || text.includes('light mode') || text.includes('dark mode')) {
      toggleTheme();
      speakText('Theme mode switched', language);
      return;
    }

    if (text.includes('create account') || text.includes('register') || text.includes('sign up')) {
      setMode('signup');
      speakText('Switched to create account', language);
      return;
    }

    if (text.includes('forgot') || text.includes('reset password')) {
      setShowForgotModal(true);
      speakText('Opening password recovery', language);
      return;
    }

    if (text.includes('english')) {
      handleLanguageChange('en');
      return;
    }

    if (text.includes('urdu')) {
      handleLanguageChange('ur');
      return;
    }

    if (text.includes('pashto')) {
      handleLanguageChange('ps');
      return;
    }
  };

  // Toggle Microphone
  const toggleSpeech = () => {
    if (!isSpeechRecognitionSupported()) {
      showToast(t.voiceError, 'error');
      speakText('Speech recognition is not available in this browser.', language);
      return;
    }

    if (isListening) {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      setSpeechTranscript('');
    } else {
      setIsListening(true);
      const langCode = language === 'ur' ? 'ur-PK' : language === 'ps' ? 'ps-AF' : 'en-US';

      const recognizer = createSpeechRecognizer(
        langCode,
        (transcript, isFinal) => {
          setSpeechTranscript(transcript);
          if (isFinal) {
            handleVoiceCommand(transcript);
          }
        },
        (error) => {
          console.warn('Speech error:', error);
          setIsListening(false);
          showToast(`Voice input: ${error}`, 'info');
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognizer) {
        try {
          recognizer.start();
          speechRecognizerRef.current = recognizer;
          showToast(t.voiceActive, 'info');
          speakText('Listening. Say login or switch theme.', language);
        } catch (err) {
          setIsListening(false);
          showToast('Could not access microphone.', 'error');
        }
      }
    }
  };

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 relative overflow-x-hidden ${
        isDark ? 'bg-[#05080f] text-white' : 'bg-[#f4f7fb] text-slate-900'
      }`}
    >
      {/* Floating Status / Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className={`fixed top-5 z-50 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl text-xs sm:text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                : isDark
                ? 'bg-slate-900/90 border-blue-500/30 text-blue-200'
                : 'bg-white border-blue-300 text-blue-900 shadow-lg'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Radio className="w-4 h-4 text-[#397cff] shrink-0 animate-pulse" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View: Either the Complete Main Screen Dashboard or the Login Screen */}
      {userSession ? (
        <MainDashboard
          session={userSession}
          theme={theme}
          onToggleTheme={toggleTheme}
          language={language}
          onLanguageChange={handleLanguageChange}
          onLogout={() => {
            setUserSession(null);
            showToast('Logged out of session', 'info');
          }}
          onShowToast={showToast}
        />
      ) : (
        <div
          className="min-h-screen w-full flex items-center justify-center relative p-4 select-none"
          style={{
            background: isDark
              ? `
                radial-gradient(circle at top left, #182848, transparent 40%),
                radial-gradient(circle at bottom right, #101d35, transparent 40%),
                #05080f
              `
              : `
                radial-gradient(circle at top left, #e2eafc, transparent 40%),
                radial-gradient(circle at bottom right, #edf2f7, transparent 40%),
                #f4f7fb
              `,
          }}
        >
          {/* Background Ambient Glowing Circles */}
          <div
            className="fixed rounded-full pointer-events-none z-0"
            style={{
              width: '280px',
              height: '280px',
              background: isDark ? '#1677ff' : '#93c5fd',
              top: '-80px',
              left: '-80px',
              filter: 'blur(90px)',
              opacity: isDark ? 0.35 : 0.45,
            }}
          />
          <div
            className="fixed rounded-full pointer-events-none z-0"
            style={{
              width: '320px',
              height: '320px',
              background: isDark ? '#5b21ff' : '#c4b5fd',
              bottom: '-120px',
              right: '-100px',
              filter: 'blur(90px)',
              opacity: isDark ? 0.35 : 0.45,
            }}
          />

          {/* FIXED TOP-RIGHT CORNER BAR ON LOGIN SCREEN */}
          <div className="fixed top-5 right-5 z-40 flex items-center gap-2">
            {/* Direct Dashboard Shortcut */}
            <button
              id="instant-dashboard-shortcut-btn"
              onClick={handleInstantDemoLogin}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm ${
                isDark
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              title="Open Voice Control Assistant Dashboard for Yaseen Khan"
            >
              <span>Main Screen Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* LIGHT/DARK MODE TOGGLE IN TOP-RIGHT CORNER */}
            <button
              id="top-right-theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-xs font-semibold transition-all shadow-md ${
                isDark
                  ? 'border-white/20 bg-[#0f1420]/90 text-amber-300 hover:bg-[#161f33] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.08)]'
              }`}
              title={isDark ? 'Switch to High-Contrast Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Light/Dark Theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600 fill-blue-600/30" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* LOGIN CARD CONTAINER */}
          <div
            id="login-card-container"
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`relative z-10 w-[430px] max-w-[calc(100%-24px)] p-[32px] sm:p-[36px] rounded-[24px] border shadow-2xl backdrop-blur-[25px] transition-all duration-300 ${
              isDark
                ? 'bg-[#0f1420]/92 border-white/12 text-white shadow-[0_25px_70px_rgba(0,0,0,0.65)]'
                : 'bg-white/95 border-slate-300 text-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
            }`}
          >
            {/* Top row inside card: Quick Fill and Light/Dark Switcher */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                id="quick-demo-fill-btn"
                onClick={fillDemoCredentials}
                className={`inline-flex items-center gap-1 text-[11px] font-medium py-1 px-2.5 rounded-lg border transition-colors ${
                  isDark
                    ? 'text-[#5d91ff] hover:text-blue-300 border-blue-500/30 bg-blue-500/10'
                    : 'text-blue-600 hover:text-blue-800 border-blue-300 bg-blue-50'
                }`}
                title="Autofill Yaseen Khan credentials"
              >
                <Zap className="w-3 h-3" />
                <span>Yaseen Khan Demo</span>
              </button>

              {/* In-Card Light/Dark Mode Toggle in the top-right corner of the card */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="in-card-theme-toggle-btn"
                  onClick={toggleTheme}
                  className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-medium ${
                    isDark
                      ? 'border-white/15 text-amber-300 hover:bg-white/10'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isDark ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
                  <span className="hidden xs:inline">{isDark ? 'Light' : 'Dark'}</span>
                </button>

                {/* Language Quick Dropdown */}
                <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Globe className="w-3.5 h-3.5" />
                  <select
                    id="header-language-select"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                    className="bg-transparent text-xs border-none outline-none cursor-pointer font-medium pr-1"
                  >
                    <option value="en" className={isDark ? 'bg-[#0c111c] text-white' : 'bg-white text-slate-900'}>EN</option>
                    <option value="ur" className={isDark ? 'bg-[#0c111c] text-white' : 'bg-white text-slate-900'}>اردو</option>
                    <option value="ps" className={isDark ? 'bg-[#0c111c] text-white' : 'bg-white text-slate-900'}>پښتو</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logo with pulsating voice ring */}
            <div className="logo-box flex justify-center mb-[18px]">
              <button
                type="button"
                id="voice-logo-button"
                onClick={toggleSpeech}
                title={isListening ? 'Microphone is active - tap to stop' : 'Tap to activate voice assistant'}
                className="logo w-[82px] h-[82px] rounded-full flex justify-center items-center text-[38px] text-white transition-transform duration-200 active:scale-95 cursor-pointer relative"
                style={{
                  background: isListening
                    ? 'linear-gradient(135deg, #059669, #1479ff)'
                    : 'linear-gradient(135deg, #1479ff, #633cff)',
                  boxShadow: isListening
                    ? '0 0 45px rgba(16,185,129,0.7)'
                    : '0 0 35px rgba(55,120,255,0.5)',
                }}
              >
                <span>🎙️</span>
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            </div>

            {/* Heading and Subtitle */}
            <h1
              id="app-heading"
              className={`text-center font-bold text-[24px] leading-tight mb-1.5 tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {mode === 'login' ? t.title : t.createTitle}
            </h1>
            <p
              id="app-subtitle"
              className={`subtitle text-center text-[13px] mb-[22px] ${
                isDark ? 'text-[#9ba5b7]' : 'text-slate-600'
              }`}
            >
              {mode === 'login' ? t.subtitle : t.createSubtitle}
            </p>

            {/* Wave Animation Component */}
            <Waveform isListening={isListening} />

            {/* Live speech feedback pill when active */}
            {isListening && (
              <div className="mb-4 py-2 px-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="truncate">
                  {speechTranscript || t.voiceInstruction}
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
              {/* If Create Account: Full Name */}
              {mode === 'signup' && (
                <div className="input-group mb-[16px]">
                  <label className={`block text-[13px] mb-[6px] font-semibold ${isDark ? 'text-[#d8deea]' : 'text-slate-800'}`}>
                    {t.fullNameLabel}
                  </label>
                  <div className="input-box relative">
                    <span
                      className={`input-icon absolute ${
                        isRtl ? 'right-[15px]' : 'left-[15px]'
                      } top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center`}
                    >
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className={`w-full py-[13px] ${
                        isRtl ? 'pr-[42px] pl-[15px]' : 'pl-[42px] pr-[15px]'
                      } rounded-[12px] border outline-none text-[14px] transition-all duration-300 focus:border-[#397cff] focus:ring-2 focus:ring-[#397cff]/20 ${
                        isDark
                          ? 'bg-[#0c111c] border-[#293246] text-white placeholder-slate-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Email / Username */}
              <div className="input-group mb-[16px]">
                <label className={`block text-[13px] mb-[6px] font-semibold ${isDark ? 'text-[#d8deea]' : 'text-slate-800'}`}>
                  {mode === 'login' ? t.usernameLabel : t.emailLabel}
                </label>
                <div className="input-box relative">
                  <span
                    className={`input-icon absolute ${
                      isRtl ? 'right-[15px]' : 'left-[15px]'
                    } top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center`}
                  >
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={mode === 'login' ? t.usernamePlaceholder : t.emailPlaceholder}
                    className={`w-full py-[13px] ${
                      isRtl ? 'pr-[42px] pl-[15px]' : 'pl-[42px] pr-[15px]'
                    } rounded-[12px] border outline-none text-[14px] transition-all duration-300 focus:border-[#397cff] focus:ring-2 focus:ring-[#397cff]/20 ${
                      isDark
                        ? 'bg-[#0c111c] border-[#293246] text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group mb-[16px]">
                <label className={`block text-[13px] mb-[6px] font-semibold ${isDark ? 'text-[#d8deea]' : 'text-slate-800'}`}>
                  {t.passwordLabel}
                </label>
                <div className="input-box relative">
                  <span
                    className={`input-icon absolute ${
                      isRtl ? 'right-[15px]' : 'left-[15px]'
                    } top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center`}
                  >
                    <Lock className="w-4 h-4" />
                  </span>

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full py-[13px] ${
                      isRtl ? 'pr-[42px] pl-[42px]' : 'pl-[42px] pr-[42px]'
                    } rounded-[12px] border outline-none text-[14px] transition-all duration-300 focus:border-[#397cff] focus:ring-2 focus:ring-[#397cff]/20 ${
                      isDark
                        ? 'bg-[#0c111c] border-[#293246] text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />

                  <span
                    id="eye"
                    onClick={togglePassword}
                    className={`eye absolute ${
                      isRtl ? 'left-[14px]' : 'right-[14px]'
                    } top-1/2 -translate-y-1/2 cursor-pointer p-1 transition-colors ${
                      isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </span>
                </div>
              </div>

              {/* If Signup: Confirm Password */}
              {mode === 'signup' && (
                <div className="input-group mb-[16px]">
                  <label className={`block text-[13px] mb-[6px] font-semibold ${isDark ? 'text-[#d8deea]' : 'text-slate-800'}`}>
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="input-box relative">
                    <span
                      className={`input-icon absolute ${
                        isRtl ? 'right-[15px]' : 'left-[15px]'
                      } top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center`}
                    >
                      <Lock className="w-4 h-4" />
                    </span>

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.confirmPasswordPlaceholder}
                      className={`w-full py-[13px] ${
                        isRtl ? 'pr-[42px] pl-[42px]' : 'pl-[42px] pr-[42px]'
                      } rounded-[12px] border outline-none text-[14px] transition-all duration-300 focus:border-[#397cff] focus:ring-2 focus:ring-[#397cff]/20 ${
                        isDark
                          ? 'bg-[#0c111c] border-[#293246] text-white placeholder-slate-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />

                    <span
                      id="confirmEye"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className={`eye absolute ${
                        isRtl ? 'left-[14px]' : 'right-[14px]'
                      } top-1/2 -translate-y-1/2 cursor-pointer p-1 transition-colors ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </span>
                  </div>
                </div>
              )}

              {/* Options: Remember Me & Forgot Password */}
              {mode === 'login' && (
                <div className="options flex justify-between items-center my-[8px] mb-[20px] text-[13px]">
                  <label className={`remember flex items-center gap-[7px] cursor-pointer ${
                    isDark ? 'text-[#aeb7c8]' : 'text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-[#397cff] w-4 h-4 rounded cursor-pointer"
                    />
                    <span>{t.rememberMe}</span>
                  </label>

                  <span
                    id="forgot-password-link"
                    onClick={() => setShowForgotModal(true)}
                    className="forgot text-[#397cff] hover:underline cursor-pointer font-semibold"
                  >
                    {t.forgotPassword}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                id="login-btn"
                className="login-btn w-full border-none py-[14px] rounded-[12px] text-white text-[15px] font-bold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #1677ff, #633cff)',
                  boxShadow: '0 10px 25px rgba(42,100,255,0.35)',
                }}
              >
                <span>{mode === 'login' ? t.loginBtn : t.signupBtn}</span>
              </button>
            </form>

            {/* Divider */}
            <div className={`divider flex items-center gap-[10px] my-[18px] text-[12px] font-semibold ${
              isDark ? 'text-[#687386]' : 'text-slate-500'
            }`}>
              <span className={`h-[1px] flex-1 ${isDark ? 'bg-[#293246]' : 'bg-slate-200'}`} />
              <span>{t.orDivider}</span>
              <span className={`h-[1px] flex-1 ${isDark ? 'bg-[#293246]' : 'bg-slate-200'}`} />
            </div>

            {/* Social Login */}
            <div className="social flex gap-[10px]">
              <button
                type="button"
                id="google-login-btn"
                onClick={() => setSocialModalProvider('Google')}
                className={`flex-1 py-[11px] px-3 rounded-[10px] border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  isDark
                    ? 'border-[#293246] bg-[#0c111c] text-[#dce2ed] hover:bg-[#151c2b]'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{t.googleBtn}</span>
              </button>

              <button
                type="button"
                id="microsoft-login-btn"
                onClick={() => setSocialModalProvider('Microsoft')}
                className={`flex-1 py-[11px] px-3 rounded-[10px] border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  isDark
                    ? 'border-[#293246] bg-[#0c111c] text-[#dce2ed] hover:bg-[#151c2b]'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                <span>{t.microsoftBtn}</span>
              </button>
            </div>

            {/* Toggle Login / Signup */}
            <div className={`signup text-center mt-[20px] text-[13px] ${isDark ? 'text-[#8f9aac]' : 'text-slate-600'}`}>
              {mode === 'login' ? (
                <>
                  <span>{t.noAccount} </span>
                  <button
                    type="button"
                    id="switch-to-signup-btn"
                    onClick={() => setMode('signup')}
                    className="text-[#397cff] hover:underline font-bold transition-colors ml-1"
                  >
                    {t.createAccount}
                  </button>
                </>
              ) : (
                <>
                  <span>{t.haveAccount} </span>
                  <button
                    type="button"
                    id="switch-to-login-btn"
                    onClick={() => setMode('login')}
                    className="text-[#397cff] hover:underline font-bold transition-colors ml-1"
                  >
                    {t.backToLogin}
                  </button>
                </>
              )}
            </div>

            {/* Security Notice */}
            <div className={`security text-center mt-[14px] text-[11px] ${isDark ? 'text-[#657084]' : 'text-slate-500'}`}>
              {t.securityNotice}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        strings={t}
        isRtl={isRtl}
        theme={theme}
      />

      {/* Social Login Modal */}
      <SocialLoginModal
        provider={socialModalProvider}
        onClose={() => setSocialModalProvider(null)}
        theme={theme}
        onSuccess={(session) => {
          setSocialModalProvider(null);
          setUserSession(session);
          showToast(`Signed in as ${session.fullName}`, 'success');
        }}
      />
    </div>
  );
}
