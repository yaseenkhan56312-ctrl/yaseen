import React, { useState } from 'react';
import {
  X,
  Sliders,
  User,
  Shield,
  Radio,
  CheckCircle2,
  Volume2,
  Globe,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { ThemeMode, SupportedLanguage, UserSession } from '../../types';
import { ModalWrapper } from './ActionModals';
import { speakText } from '../../utils/speech';

// SETTINGS MODAL
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  language,
  onLanguageChange,
}) => {
  const isDark = theme === 'dark';
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [wakeWord, setWakeWord] = useState(true);
  const [soundFeedback, setSoundFeedback] = useState(true);

  const handleTestVoice = () => {
    speakText('Voice output calibration check. Everything is operational.', language);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Assistant Settings"
      theme={theme}
      icon={<Sliders className="w-5 h-5 text-purple-400" />}
    >
      <div className="space-y-4 text-xs">
        {/* Appearance Mode */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-[#0c1630] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="font-semibold text-sm">Theme Mode</div>
            <div className="text-slate-400 text-[11px]">Toggle between Cosmic Dark and Crisp Light</div>
          </div>
          <button
            onClick={onToggleTheme}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
              isDark ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'
            }`}
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Theme</span>
              </>
            )}
          </button>
        </div>

        {/* Speech Pitch & Rate */}
        <div className={`p-3.5 rounded-2xl border space-y-3 ${
          isDark ? 'bg-[#0c1630] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Speech Speed: {speechRate.toFixed(1)}x</span>
            <button
              onClick={handleTestVoice}
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" /> Test Voice
            </button>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(Number(e.target.value))}
            className="w-full accent-blue-500"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold">Voice Pitch: {speechPitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={speechPitch}
            onChange={(e) => setSpeechPitch(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Toggles */}
        <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
          isDark ? 'bg-[#0c1630] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-semibold">Wake Word Activation</div>
              <div className="text-slate-400 text-[11px]">Respond to &quot;Hey Assistant&quot; voice trigger</div>
            </div>
            <input
              type="checkbox"
              checked={wakeWord}
              onChange={(e) => setWakeWord(e.target.checked)}
              className="accent-blue-500 w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-white/10 dark:border-white/10 border-slate-200">
            <div>
              <div className="font-semibold">Audio Confirmation Chimes</div>
              <div className="text-slate-400 text-[11px]">Play chime sound after receiving commands</div>
            </div>
            <input
              type="checkbox"
              checked={soundFeedback}
              onChange={(e) => setSoundFeedback(e.target.checked)}
              className="accent-blue-500 w-4 h-4 rounded"
            />
          </label>
        </div>
      </div>
    </ModalWrapper>
  );
};

// PROFILE MODAL
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  session: UserSession;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  theme,
  session,
}) => {
  const isDark = theme === 'dark';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      theme={theme}
      icon={<User className="w-5 h-5 text-blue-400" />}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1677ff] to-[#633cff] flex items-center justify-center text-2xl text-white font-bold shadow-lg">
            {session.fullName.charAt(0) || 'Y'}
          </div>
          <div>
            <h4 className="text-base font-bold">{session.fullName}</h4>
            <p className="text-xs text-slate-400">{session.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Account
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Administrator
              </span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
          isDark ? 'bg-[#0c1630] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between">
            <span className="text-slate-400">Voice Recognition Imprint:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Calibrated &amp; Secure
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Primary Device:</span>
            <span className="font-semibold">Windows 11 Pro Desktop</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Synced Mobile:</span>
            <span className="font-semibold">Galaxy S24 Ultra</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Sign-In:</span>
            <span className="font-semibold">{session.loginTime || 'Active Now'}</span>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
