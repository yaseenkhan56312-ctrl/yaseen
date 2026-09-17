import React, { useState } from 'react';
import { LogOut, Mic, MicOff, Volume2, ShieldCheck, Activity, Radio, Sparkles } from 'lucide-react';
import { UserSession, SupportedLanguage } from '../types';
import { Waveform } from './Waveform';
import { speakText } from '../utils/speech';

interface DashboardViewProps {
  session: UserSession;
  language: SupportedLanguage;
  onLogout: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  session,
  language,
  onLogout,
}) => {
  const [isMicLive, setIsMicLive] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [voiceLog, setVoiceLog] = useState<string[]>([
    'System initialized in encrypted mode.',
    `Authenticated as ${session.email} via ${session.loginMethod}.`,
  ]);

  const testCommands = [
    'System Status Check',
    'Play Voice Briefing',
    'Check Security Protocols',
    'Switch Ambient Audio',
  ];

  const handleCommand = (cmd: string) => {
    setActiveCommand(cmd);
    const time = new Date().toLocaleTimeString();
    setVoiceLog((prev) => [`[${time}] Command processed: "${cmd}"`, ...prev.slice(0, 5)]);

    const feedback = `Executing voice instruction: ${cmd}`;
    speakText(feedback, language);
  };

  const toggleMicLive = () => {
    const next = !isMicLive;
    setIsMicLive(next);
    if (next) {
      speakText('Voice assistant listening for live commands', language);
    }
  };

  return (
    <div
      id="dashboard-container"
      className="w-full max-w-[540px] p-6 sm:p-8 bg-[#0f1420]/90 border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-white relative animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Top Bar with user status */}
      <div className="flex items-center justify-between pb-5 border-b border-[#293246]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1677ff] to-[#633cff] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(55,120,255,0.4)]">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Voice Assistant Online
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[220px]">
              {session.email}
            </p>
          </div>
        </div>

        <button
          id="logout-btn"
          onClick={onLogout}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-[#293246] hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Voice Core Visualizer */}
      <div className="py-6 text-center">
        <div className="inline-block relative">
          <button
            id="dashboard-mic-toggle"
            onClick={toggleMicLive}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300 ${
              isMicLive
                ? 'bg-gradient-to-br from-emerald-500 to-[#1677ff] shadow-[0_0_50px_rgba(16,185,129,0.5)] ring-4 ring-emerald-400/30 scale-105'
                : 'bg-gradient-to-br from-[#1479ff] to-[#633cff] shadow-[0_0_35px_rgba(55,120,255,0.4)] hover:scale-105'
            }`}
            title="Click to toggle live voice mode"
          >
            {isMicLive ? '🎙️' : '🎙️'}
          </button>
          <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0c111c] border border-white/20 text-xs">
            {isMicLive ? (
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-slate-400" />
            )}
          </span>
        </div>

        <div className="mt-3 font-semibold text-sm text-slate-200">
          {isMicLive ? 'Live Microphone Stream Active' : 'Voice Standby Mode'}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {isMicLive
            ? 'Assistant is listening. Speak commands or tap a test trigger.'
            : 'Tap the microphone to activate live voice listening.'}
        </p>

        {/* Waveform visualizer */}
        <Waveform isListening={isMicLive} />
      </div>

      {/* Interactive Command Triggers */}
      <div className="mt-2 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#5d91ff]" />
          <span>Quick Voice Actions</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {testCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className={`py-2.5 px-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                activeCommand === cmd
                  ? 'border-[#397cff] bg-[#397cff]/15 text-white shadow-[0_0_15px_rgba(57,124,255,0.2)]'
                  : 'border-[#293246] bg-[#0c111c]/80 hover:bg-[#151c2b] text-slate-300'
              }`}
            >
              <span className="truncate">{cmd}</span>
              <Volume2 className="w-3 h-3 text-[#5d91ff] shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry log */}
      <div className="mt-5 p-3.5 rounded-xl bg-[#0c111c] border border-[#293246]">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#397cff] animate-pulse" />
            Encrypted Voice Stream
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> 256-bit TLS
          </span>
        </div>
        <div className="space-y-1 font-mono text-[11px] text-slate-400">
          {voiceLog.map((log, idx) => (
            <div key={idx} className="truncate text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
