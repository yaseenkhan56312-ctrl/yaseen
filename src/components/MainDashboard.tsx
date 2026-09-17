import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Grid,
  Monitor,
  Smartphone,
  History,
  Settings,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  ArrowRight,
  Shield,
  Zap,
  Cloud,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import {
  ThemeMode,
  SupportedLanguage,
  UserSession,
  RecentCommandItem,
  SystemStats,
} from '../types';
import { speakText, isSpeechRecognitionSupported, createSpeechRecognizer } from '../utils/speech';
import {
  AppControlModal,
  PCControlModal,
  AndroidControlModal,
  WeatherModal,
  MusicPlayerModal,
  FileExplorerModal,
} from './modals/ActionModals';
import { SettingsModal, ProfileModal } from './modals/SettingsAndProfileModals';
import { HistoryModal } from './modals/HistoryModal';

interface MainDashboardProps {
  session: UserSession;
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  session,
  theme,
  onToggleTheme,
  language,
  onLanguageChange,
  onLogout,
  onShowToast,
}) => {
  const isDark = theme === 'dark';
  const isRtl = language === 'ur' || language === 'ps';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'home' | 'voice' | 'apps' | 'pc' | 'android' | 'history' | 'settings' | 'profile'>('home');

  // Stats
  const [stats, setStats] = useState<SystemStats>({
    totalCommands: 12,
    appsControlled: 8,
    pcActions: 5,
    androidActions: 3,
  });

  // Recent commands list (starting exactly with the items from screenshot)
  const [recentCommands, setRecentCommands] = useState<RecentCommandItem[]>([
    {
      id: 'cmd-1',
      text: 'Open YouTube',
      timestamp: '2 minutes ago',
      category: 'youtube',
      icon: '▶',
      iconBg: 'bg-red-500/20 text-red-500',
    },
    {
      id: 'cmd-2',
      text: 'Play music',
      timestamp: '5 minutes ago',
      category: 'music',
      icon: '♫',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    {
      id: 'cmd-3',
      text: 'Search for information',
      timestamp: '12 minutes ago',
      category: 'search',
      icon: '🔍',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
    {
      id: 'cmd-4',
      text: 'Open Documents',
      timestamp: '18 minutes ago',
      category: 'files',
      icon: '📁',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 'cmd-5',
      text: "What's the weather today",
      timestamp: '25 minutes ago',
      category: 'weather',
      icon: '⛅',
      iconBg: 'bg-sky-500/20 text-sky-400',
    },
  ]);

  // Voice Interaction state
  const [isListening, setIsListening] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [activeOrbStatus, setActiveOrbStatus] = useState<'Listening...' | 'Speak Now' | 'Ready'>('Speak Now');
  const speechRecognizerRef = useRef<any>(null);

  // Active Modals
  const [modalOpen, setModalOpen] = useState<'apps' | 'pc' | 'android' | 'history' | 'settings' | 'profile' | 'youtube' | 'music' | 'files' | 'weather' | null>(null);

  // Notifications drawer state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Execute a command (by voice, pill, or typing)
  const executeCommand = (commandText: string) => {
    if (!commandText.trim()) return;

    const lower = commandText.toLowerCase();
    const timeNow = 'Just now';

    // Categorize
    let category: RecentCommandItem['category'] = 'general';
    let icon = '⚡';
    let iconBg = 'bg-blue-500/20 text-blue-400';

    if (lower.includes('youtube')) {
      category = 'youtube';
      icon = '▶';
      iconBg = 'bg-red-500/20 text-red-500';
      setModalOpen('youtube');
      setStats((s) => ({ ...s, totalCommands: s.totalCommands + 1, appsControlled: s.appsControlled + 1 }));
      speakText('Opening YouTube video stream', language);
    } else if (lower.includes('music') || lower.includes('play')) {
      category = 'music';
      icon = '♫';
      iconBg = 'bg-blue-500/20 text-blue-400';
      setModalOpen('music');
      setStats((s) => ({ ...s, totalCommands: s.totalCommands + 1, appsControlled: s.appsControlled + 1 }));
      speakText('Playing ambient audio tracks', language);
    } else if (lower.includes('file') || lower.includes('document')) {
      category = 'files';
      icon = '📁';
      iconBg = 'bg-amber-500/20 text-amber-400';
      setModalOpen('files');
      setStats((s) => ({ ...s, totalCommands: s.totalCommands + 1, appsControlled: s.appsControlled + 1 }));
      speakText('Opening documents folder', language);
    } else if (lower.includes('weather')) {
      category = 'weather';
      icon = '⛅';
      iconBg = 'bg-sky-500/20 text-sky-400';
      setModalOpen('weather');
      setStats((s) => ({ ...s, totalCommands: s.totalCommands + 1 }));
      speakText("Today's forecast is 24 degrees Celsius with clear skies", language);
    } else if (lower.includes('pc') || lower.includes('volume') || lower.includes('brightness')) {
      category = 'pc';
      icon = '💻';
      iconBg = 'bg-cyan-500/20 text-cyan-400';
      setModalOpen('pc');
      setStats((s) => ({ ...s, totalCommands: s.totalCommands + 1, pcActions: s.pcActions + 1 }));
      speakText('Accessing PC system parameters', language);
    } else if (lower.includes('android') || lower.includes('mobile') || lower.includes('phone')) {
      category = 'android';
      icon = '📱';
      iconBg = 'bg-orange-500/20 text-orange-400';
      setModalOpen('android');
      setStats((s) => ({ ...s, totalCommands: s.totalCommands + 1, androidActions: s.androidActions + 1 }));
      speakText('Android device link active', language);
    } else {
      setStats((s) => ({ ...s, totalCommands: s.totalCommands + 1 }));
      speakText(`Executed voice command: ${commandText}`, language);
    }

    // Add to recent commands
    setRecentCommands((prev) => [
      {
        id: `cmd-${Date.now()}`,
        text: commandText,
        timestamp: timeNow,
        category,
        icon,
        iconBg,
      },
      ...prev.slice(0, 7),
    ]);

    onShowToast(`Command executed: "${commandText}"`, 'success');
    setVoiceInputText('');
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      onShowToast('Microphone recognition not supported in this browser. Please use the text input.', 'error');
      // Simulate quick voice activation feedback
      setIsListening(!isListening);
      setActiveOrbStatus(isListening ? 'Ready' : 'Listening...');
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
      setActiveOrbStatus('Speak Now');
    } else {
      setIsListening(true);
      setActiveOrbStatus('Listening...');
      speakText('Voice Assistant listening. Speak your command now.', language);

      const langCode = language === 'ur' ? 'ur-PK' : language === 'ps' ? 'ps-AF' : 'en-US';
      const recognizer = createSpeechRecognizer(
        langCode,
        (transcript, isFinal) => {
          setVoiceInputText(transcript);
          if (isFinal) {
            executeCommand(transcript);
            setIsListening(false);
            setActiveOrbStatus('Speak Now');
          }
        },
        (error) => {
          console.warn('Voice recognition error:', error);
          setIsListening(false);
          setActiveOrbStatus('Speak Now');
        },
        () => {
          setIsListening(false);
          setActiveOrbStatus('Speak Now');
        }
      );

      if (recognizer) {
        try {
          recognizer.start();
          speechRecognizerRef.current = recognizer;
        } catch (e) {
          setIsListening(false);
          setActiveOrbStatus('Speak Now');
        }
      }
    }
  };

  // Soundwave heights
  const leftWave = [14, 28, 42, 22, 34, 18, 12];
  const rightWave = [12, 18, 34, 22, 42, 28, 14];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen w-full transition-colors duration-300 font-sans ${
        isDark
          ? 'bg-[#050b18] text-white'
          : 'bg-[#f4f7fb] text-slate-900'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(circle at 10% 10%, #0d1a38 0%, transparent 40%), radial-gradient(circle at 90% 90%, #0a1733 0%, transparent 40%)'
          : 'radial-gradient(circle at 10% 10%, #e8edf5 0%, transparent 40%), radial-gradient(circle at 90% 90%, #e5eaf3 0%, transparent 40%)',
      }}
    >
      {/* TOP HEADER */}
      <header
        id="dashboard-header"
        className={`w-full px-6 py-3.5 flex items-center justify-between border-b sticky top-0 z-30 backdrop-blur-xl ${
          isDark
            ? 'bg-[#050b18]/85 border-white/10'
            : 'bg-white/85 border-slate-200/80 shadow-sm'
        }`}
      >
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div
            id="brand-logo-pill"
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-tr from-[#1677ff] to-[#00d2ff] shadow-[0_0_20px_rgba(22,119,255,0.6)] cursor-pointer hover:scale-105 transition-transform"
            onClick={toggleListening}
            title="Click to toggle voice assistant"
          >
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-bold text-lg tracking-tight">Voice Control</span>
              <span className="font-bold text-lg text-[#00c6ff] tracking-tight">Assistant</span>
            </div>
            <div className={`text-[11px] tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Your Voice <span className="opacity-60">|</span> Our Power
            </div>
          </div>
        </div>

        {/* Right: Actions (Language, Theme Toggle, Notifications, Profile) */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-200'
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#00c6ff]" />
              <select
                id="header-lang-select"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-transparent border-none outline-none cursor-pointer pr-1 text-xs font-medium"
              >
                <option value="en" className={isDark ? 'bg-[#0b1325] text-white' : 'bg-white text-slate-900'}>
                  English
                </option>
                <option value="ur" className={isDark ? 'bg-[#0b1325] text-white' : 'bg-white text-slate-900'}>
                  اردو (Urdu)
                </option>
                <option value="ps" className={isDark ? 'bg-[#0b1325] text-white' : 'bg-white text-slate-900'}>
                  پښتو (Pashto)
                </option>
              </select>
            </div>
          </div>

          {/* LIGHT / DARK MODE TOGGLE (High Contrast Light vs Dark) */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className={`p-2 rounded-full border transition-all flex items-center justify-center ${
              isDark
                ? 'border-white/15 bg-white/5 hover:bg-white/10 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
            title={isDark ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full border relative transition-colors ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-300'
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00c6ff] animate-pulse" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-72 p-3 rounded-2xl border shadow-2xl z-50 text-xs ${
                  isDark
                    ? 'bg-[#0b1325] border-white/15 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 dark:border-white/10 border-slate-100 font-bold">
                  <span>Notifications</span>
                  <span className="text-[10px] text-[#00c6ff]">2 New</span>
                </div>
                <div className="space-y-2">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="font-semibold text-emerald-400">Microphone Calibrated</div>
                    <div className="text-[11px] text-slate-400">Voice engine initialized with 99.4% accuracy.</div>
                  </div>
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="font-semibold text-blue-400">Android Connected</div>
                    <div className="text-[11px] text-slate-400">Galaxy S24 Ultra synchronized via Wi-Fi.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              id="user-profile-pill"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border transition-colors ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1677ff] to-[#633cff] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-semibold tracking-tight">{session.fullName || 'Yaseen Khan'}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {showProfileMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 p-2 rounded-2xl border shadow-2xl z-50 text-xs space-y-1 ${
                  isDark
                    ? 'bg-[#0b1325] border-white/15 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <button
                  onClick={() => {
                    setModalOpen('profile');
                    setShowProfileMenu(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center gap-2 ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => {
                    setModalOpen('settings');
                    setShowProfileMenu(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center gap-2 ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-purple-400" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full p-2 rounded-xl text-left flex items-center gap-2 text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WITH SIDEBAR */}
      <div className="flex w-full max-w-[1600px] mx-auto p-4 sm:p-5 gap-5">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside
          id="dashboard-sidebar"
          className="w-56 shrink-0 hidden md:flex flex-col gap-1.5"
        >
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'voice', label: 'Voice Activation', icon: '🎙️' },
            { id: 'apps', label: 'App Control', icon: '▦' },
            { id: 'pc', label: 'PC Control', icon: '💻' },
            { id: 'android', label: 'Android Control', icon: '📱' },
            { id: 'history', label: 'Command History', icon: '🕒' },
            { id: 'settings', label: 'Settings', icon: '⚙️' },
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'logout', label: 'Logout', icon: '🚪' },
          ].map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  if (item.id === 'logout') {
                    onLogout();
                    return;
                  }
                  if (item.id === 'voice') {
                    toggleListening();
                    return;
                  }
                  if (item.id === 'apps') {
                    setModalOpen('apps');
                    return;
                  }
                  if (item.id === 'pc') {
                    setModalOpen('pc');
                    return;
                  }
                  if (item.id === 'android') {
                    setModalOpen('android');
                    return;
                  }
                  if (item.id === 'history') {
                    setModalOpen('history');
                    return;
                  }
                  if (item.id === 'settings') {
                    setModalOpen('settings');
                    return;
                  }
                  if (item.id === 'profile') {
                    setModalOpen('profile');
                    return;
                  }
                  setActiveTab(item.id as any);
                }}
                className={`w-full py-3 px-4 rounded-2xl text-left text-sm font-medium flex items-center gap-3 transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#1479ff] to-[#1e60f0] text-white font-semibold shadow-[0_4px_20px_rgba(20,121,255,0.4)]'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* TOP ROW: WELCOME BANNER + 4 STAT CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* WELCOME BANNER (cols 7) */}
            <div
              id="welcome-banner"
              className={`lg:col-span-7 rounded-3xl p-6 sm:p-7 relative overflow-hidden border transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-[#0a1532] via-[#0d1f4d] to-[#10245a] border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)]'
                  : 'bg-gradient-to-r from-[#003882] via-[#0b489a] to-[#185cbd] border-blue-400/30 text-white shadow-lg'
              }`}
            >
              {/* Silhouette mountains and night starry sky styling */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, rgba(0,0,0,0)),
                                    radial-gradient(1px 1px at 80px 70px, #ffffff, rgba(0,0,0,0)),
                                    radial-gradient(1.5px 1.5px at 150px 40px, #ffffff, rgba(0,0,0,0)),
                                    radial-gradient(2px 2px at 260px 85px, #38bdf8, rgba(0,0,0,0))`,
                  backgroundRepeat: 'repeat',
                }}
              />

              {/* Decorative mountain silhouette path */}
              <svg
                className="absolute bottom-0 right-0 w-full h-24 pointer-events-none opacity-25"
                viewBox="0 0 500 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,100 L120,45 L180,75 L280,30 L380,80 L500,20 L500,100 Z"
                  fill="#000000"
                />
              </svg>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs sm:text-sm text-slate-300 font-medium">Welcome Back,</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#38bdf8] tracking-tight mt-0.5">
                      {session.fullName || 'Yaseen Khan'}
                    </h2>
                  </div>

                  {/* Cursive handwritten badge as in screenshot */}
                  <div className="rotate-[-6deg] text-right">
                    <span
                      className="font-serif italic text-lg sm:text-xl font-bold tracking-wider text-[#7dd3fc] drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                      style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif" }}
                    >
                      Your Voice<br />is the Power
                    </span>
                  </div>
                </div>

                <div className="mt-5 text-xs sm:text-sm text-slate-200 max-w-md leading-relaxed">
                  Voice Control Assistant is ready to help you.
                  <div className="font-semibold text-white mt-0.5">
                    Just speak and get things done!
                  </div>
                </div>
              </div>
            </div>

            {/* 4 TOP STAT CARDS (cols 5) */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  id: 'stat-total',
                  label: 'Total Commands',
                  value: stats.totalCommands,
                  icon: <Mic className="w-5 h-5 text-purple-400" />,
                  bg: 'bg-purple-500/20',
                },
                {
                  id: 'stat-apps',
                  label: 'Apps Controlled',
                  value: stats.appsControlled,
                  icon: <Grid className="w-5 h-5 text-emerald-400" />,
                  bg: 'bg-emerald-500/20',
                },
                {
                  id: 'stat-pc',
                  label: 'PC Actions',
                  value: stats.pcActions,
                  icon: <Monitor className="w-5 h-5 text-sky-400" />,
                  bg: 'bg-sky-500/20',
                },
                {
                  id: 'stat-android',
                  label: 'Android Actions',
                  value: stats.androidActions,
                  icon: <Smartphone className="w-5 h-5 text-amber-400" />,
                  bg: 'bg-amber-500/20',
                },
              ].map((stat) => (
                <div
                  key={stat.id}
                  className={`p-4 rounded-3xl border flex flex-col items-center justify-center text-center transition-all ${
                    isDark
                      ? 'bg-[#0a1226]/80 border-white/10 hover:border-[#1479ff]/40'
                      : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 ${stat.bg}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-extrabold tracking-tight">
                    {stat.value}
                  </div>
                  <div className={`text-[11px] mt-0.5 leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE GRID: 6 FEATURE CARDS + CENTER VOICE ORB HERO + RIGHT RECENT COMMANDS & SYSTEM INFO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* 1. LEFT 6 FEATURE CARDS (cols 3) */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-3">
              {[
                {
                  title: 'Voice Activation',
                  sub: 'Start Listening',
                  icon: <Mic className="w-6 h-6 text-purple-400" />,
                  bg: 'bg-purple-500/20',
                  action: toggleListening,
                },
                {
                  title: 'App Control',
                  sub: 'Open & Close Apps',
                  icon: <Grid className="w-6 h-6 text-emerald-400" />,
                  bg: 'bg-emerald-500/20',
                  action: () => setModalOpen('apps'),
                },
                {
                  title: 'PC Control',
                  sub: 'System Commands',
                  icon: <Monitor className="w-6 h-6 text-sky-400" />,
                  bg: 'bg-sky-500/20',
                  action: () => setModalOpen('pc'),
                },
                {
                  title: 'Android Control',
                  sub: 'Mobile Commands',
                  icon: <Smartphone className="w-6 h-6 text-amber-400" />,
                  bg: 'bg-amber-500/20',
                  action: () => setModalOpen('android'),
                },
                {
                  title: 'Command History',
                  sub: 'View Past Commands',
                  icon: <History className="w-6 h-6 text-teal-400" />,
                  bg: 'bg-teal-500/20',
                  action: () => setModalOpen('history'),
                },
                {
                  title: 'Settings',
                  sub: 'Customize Assistant',
                  icon: <Settings className="w-6 h-6 text-fuchsia-400" />,
                  bg: 'bg-fuchsia-500/20',
                  action: () => setModalOpen('settings'),
                },
              ].map((card, idx) => (
                <button
                  key={idx}
                  onClick={card.action}
                  className={`p-4 rounded-3xl border text-center flex flex-col items-center justify-center transition-all duration-200 group hover:scale-[1.02] ${
                    isDark
                      ? 'bg-[#0a1226]/80 border-white/10 hover:border-blue-500/50 hover:bg-[#0f1b38]'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${card.bg}`}>
                    {card.icon}
                  </div>
                  <div className="font-bold text-xs sm:text-sm tracking-tight group-hover:text-blue-500 transition-colors">
                    {card.title}
                  </div>
                  <div className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {card.sub}
                  </div>
                </button>
              ))}
            </div>

            {/* 2. CENTER VOICE ORB & HERO CARD (cols 5) */}
            <div
              id="voice-orb-hero-card"
              className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col items-center justify-between text-center relative overflow-hidden transition-all ${
                isDark
                  ? 'bg-[#081022]/90 border-white/10 shadow-[0_15px_45px_rgba(0,0,0,0.6)]'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
              style={{ minHeight: '420px' }}
            >
              {/* Concentric Voice Waves with Orb */}
              <div className="w-full flex items-center justify-center gap-4 pt-4 pb-2">
                {/* Left Sound Wave */}
                <div className="flex items-center gap-1">
                  {leftWave.map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-cyan-400 to-blue-500"
                      animate={{
                        height: isListening ? [h * 0.4, h * 1.5, h * 0.6] : [h * 0.8, h * 1.1, h * 0.8],
                        opacity: isListening ? [0.6, 1, 0.6] : [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: isListening ? 0.5 : 1.2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: i * 0.08,
                      }}
                    />
                  ))}
                </div>

                {/* Central Concentric Glowing Mic Orb */}
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Wave Ring */}
                  <motion.div
                    className="absolute w-36 h-36 rounded-full border border-cyan-400/30"
                    animate={{
                      scale: isListening ? [1, 1.25, 1] : [1, 1.05, 1],
                      opacity: isListening ? [0.6, 0.2, 0.6] : [0.3, 0.1, 0.3],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Mid Wave Ring */}
                  <motion.div
                    className="absolute w-28 h-28 rounded-full border border-blue-500/40"
                    animate={{
                      scale: isListening ? [1, 1.15, 1] : [1, 1.03, 1],
                      opacity: isListening ? [0.8, 0.4, 0.8] : [0.4, 0.2, 0.4],
                    }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  />

                  {/* Core Interactive Mic Button */}
                  <button
                    id="central-voice-orb-btn"
                    onClick={toggleListening}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl text-white cursor-pointer relative z-10 transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isListening
                        ? 'bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 shadow-[0_0_50px_rgba(0,198,255,0.7)] ring-4 ring-cyan-400/40'
                        : 'bg-gradient-to-tr from-[#1677ff] to-[#00d2ff] shadow-[0_0_35px_rgba(22,119,255,0.5)]'
                    }`}
                    title={isListening ? 'Click to stop listening' : 'Click to start voice command'}
                  >
                    <span>🎙️</span>
                  </button>
                </div>

                {/* Right Sound Wave */}
                <div className="flex items-center gap-1">
                  {rightWave.map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-purple-400 to-blue-500"
                      animate={{
                        height: isListening ? [h * 0.4, h * 1.5, h * 0.6] : [h * 0.8, h * 1.1, h * 0.8],
                        opacity: isListening ? [0.6, 1, 0.6] : [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: isListening ? 0.5 : 1.2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        delay: i * 0.08,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Status Text */}
              <div className="mt-3">
                <h3 className="text-xl font-bold tracking-tight">
                  {isListening ? 'Listening...' : 'Listening...'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isListening ? 'Speak your request clearly' : 'Speak Now'}
                </p>
              </div>

              {/* Input bar with mic icon: "Try saying..." */}
              <div className="w-full mt-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeCommand(voiceInputText);
                  }}
                  className="relative w-full"
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                    <Mic className="w-4 h-4" />
                  </span>
                  <input
                    id="try-saying-input"
                    type="text"
                    value={voiceInputText}
                    onChange={(e) => setVoiceInputText(e.target.value)}
                    placeholder="Try saying..."
                    className={`w-full py-3 pl-11 pr-12 rounded-2xl border text-xs outline-none transition-all ${
                      isDark
                        ? 'bg-[#0b1429] border-white/10 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                  {voiceInputText && (
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold"
                    >
                      Enter
                    </button>
                  )}
                </form>

                {/* Quick Command Pills below input as in screenshot */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  {[
                    { label: 'Open YouTube', cmd: 'Open YouTube', icon: '▶', bg: 'hover:border-red-500' },
                    { label: 'Play Music', cmd: 'Play music', icon: '♫', bg: 'hover:border-blue-500' },
                    { label: 'Show My Files', cmd: 'Show My Files', icon: '📁', bg: 'hover:border-amber-500' },
                    { label: 'Check Weather', cmd: "What's the weather today", icon: '⛅', bg: 'hover:border-cyan-500' },
                  ].map((pill) => (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={() => executeCommand(pill.cmd)}
                      className={`py-1.5 px-3 rounded-full border text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                        isDark
                          ? `bg-[#0b1429] border-white/10 text-slate-300 hover:text-white ${pill.bg}`
                          : `bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 ${pill.bg}`
                      }`}
                    >
                      <span>{pill.icon}</span>
                      <span>{pill.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. RIGHT COLUMN: RECENT COMMANDS + SYSTEM INFORMATION (cols 4) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Recent Commands Card */}
              <div
                id="recent-commands-panel"
                className={`p-5 rounded-3xl border transition-all ${
                  isDark
                    ? 'bg-[#0a1226]/80 border-white/10'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-sm tracking-tight">Recent Commands</h4>
                  </div>
                  <button
                    onClick={() => setModalOpen('history')}
                    className="text-xs font-semibold text-[#00c6ff] hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {recentCommands.slice(0, 5).map((cmd) => (
                    <div
                      key={cmd.id}
                      onClick={() => executeCommand(cmd.text)}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all group ${
                        isDark
                          ? 'border-white/10 bg-[#0c1630]/60 hover:bg-[#132247] hover:border-blue-500/30'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-300'
                      }`}
                      title="Click to re-run command"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${cmd.iconBg}`}>
                          {cmd.icon}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate group-hover:text-blue-500 transition-colors">
                            {cmd.text}
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {cmd.timestamp}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* System Information Card */}
              <div
                id="system-information-panel"
                className={`p-5 rounded-3xl border transition-all ${
                  isDark
                    ? 'bg-[#0a1226]/80 border-white/10'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-3.5">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-sm tracking-tight">System Information</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5 dark:border-white/5 border-slate-100">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>💻</span> OS:
                    </span>
                    <span className="font-semibold">Windows 11</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5 dark:border-white/5 border-slate-100">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>⚡</span> CPU:
                    </span>
                    <span className="font-semibold">Intel Core i5</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5 dark:border-white/5 border-slate-100">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>🧠</span> RAM:
                    </span>
                    <span className="font-semibold">8 GB</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>📊</span> Status:
                    </span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      All Systems Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: 4 HIGHLIGHT FEATURE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {[
              {
                title: 'Secure & Private',
                desc: 'Your data stays with you',
                icon: <Shield className="w-5 h-5 text-blue-400" />,
              },
              {
                title: 'Fast Response',
                desc: 'Quick and accurate',
                icon: <Zap className="w-5 h-5 text-blue-400" />,
              },
              {
                title: 'Multiple Languages',
                desc: 'English | اردو | پښتو',
                icon: <Globe className="w-5 h-5 text-blue-400" />,
              },
              {
                title: 'Works Offline',
                desc: 'Basic commands available',
                icon: <Cloud className="w-5 h-5 text-blue-400" />,
              },
            ].map((feat, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                  isDark
                    ? 'bg-[#0a1226]/80 border-white/10 hover:border-blue-500/30'
                    : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <div className="text-xs font-bold">{feat.title}</div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {feat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <footer className="pt-4 pb-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-white/5 dark:border-white/5 border-slate-200">
            <div>Voice Control Assistant v1.0.0</div>
            <div className="mt-1 sm:mt-0 font-medium">
              Speak ✦ Control ✦ Get Things Done
            </div>
          </footer>
        </main>
      </div>

      {/* INTERACTIVE MODALS */}
      <AppControlModal
        isOpen={modalOpen === 'apps'}
        onClose={() => setModalOpen(null)}
        theme={theme}
        onLaunchApp={(appName) => executeCommand(appName)}
      />

      <PCControlModal
        isOpen={modalOpen === 'pc'}
        onClose={() => setModalOpen(null)}
        theme={theme}
        onAction={(act) => executeCommand(act)}
      />

      <AndroidControlModal
        isOpen={modalOpen === 'android'}
        onClose={() => setModalOpen(null)}
        theme={theme}
        onAction={(act) => executeCommand(act)}
      />

      <HistoryModal
        isOpen={modalOpen === 'history'}
        onClose={() => setModalOpen(null)}
        theme={theme}
        commands={recentCommands}
        onRerun={(txt) => executeCommand(txt)}
        onClear={() => {
          setRecentCommands([]);
          onShowToast('Command history cleared', 'info');
        }}
      />

      <SettingsModal
        isOpen={modalOpen === 'settings'}
        onClose={() => setModalOpen(null)}
        theme={theme}
        onToggleTheme={onToggleTheme}
        language={language}
        onLanguageChange={onLanguageChange}
      />

      <ProfileModal
        isOpen={modalOpen === 'profile'}
        onClose={() => setModalOpen(null)}
        theme={theme}
        session={session}
      />

      <WeatherModal
        isOpen={modalOpen === 'weather'}
        onClose={() => setModalOpen(null)}
        theme={theme}
      />

      <MusicPlayerModal
        isOpen={modalOpen === 'music'}
        onClose={() => setModalOpen(null)}
        theme={theme}
      />

      <FileExplorerModal
        isOpen={modalOpen === 'files'}
        onClose={() => setModalOpen(null)}
        theme={theme}
      />

      {/* YouTube Modal */}
      {modalOpen === 'youtube' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalOpen(null)}
        >
          <div
            className={`w-full max-w-xl p-6 rounded-3xl border text-center relative ${
              isDark ? 'bg-[#0a1226] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 mx-auto flex items-center justify-center text-3xl mb-3">
              ▶
            </div>
            <h3 className="text-lg font-bold">YouTube Voice Stream</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Voice Control Assistant is connected to YouTube Media Hub
            </p>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Trending Voice Search
              </div>
              <div className="text-slate-300">
                Playing: &quot;Voice Control Assistant Technology Demonstration 2026&quot;
              </div>
            </div>
            <button
              onClick={() => setModalOpen(null)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold"
            >
              Close Stream
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
