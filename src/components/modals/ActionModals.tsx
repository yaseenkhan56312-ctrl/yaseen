import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Laptop,
  Smartphone,
  Check,
  RefreshCw,
  Power,
  RotateCcw,
  Wifi,
  Battery,
  Bell,
  Cast,
  FileText,
  Folder,
  CloudSun,
  Music,
  Video,
  Search,
  Sliders,
  ShieldCheck,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { ThemeMode, SupportedLanguage } from '../../types';
import { speakText } from '../../utils/speech';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  theme: ThemeMode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  theme,
  children,
  icon,
  maxWidth = 'max-w-xl',
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} p-6 rounded-3xl border shadow-2xl transition-all relative overflow-hidden ${
          isDark
            ? 'bg-[#0a1226] border-white/15 text-white shadow-[0_25px_70px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 dark:border-white/10 border-slate-200">
          <div className="flex items-center gap-2.5">
            {icon}
            <h3 className="text-lg font-bold tracking-wide">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// 1. APP CONTROL MODAL
interface AppControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onLaunchApp: (appName: string) => void;
}

export const AppControlModal: React.FC<AppControlModalProps> = ({
  isOpen,
  onClose,
  theme,
  onLaunchApp,
}) => {
  const isDark = theme === 'dark';
  const apps = [
    { name: 'YouTube', icon: '▶', bg: 'bg-red-500/20 text-red-500', desc: 'Video & Media Streaming' },
    { name: 'Music Player', icon: '♫', bg: 'bg-blue-500/20 text-blue-400', desc: 'Audio & Playlists' },
    { name: 'File Explorer', icon: '📁', bg: 'bg-amber-500/20 text-amber-400', desc: 'Documents & Storage' },
    { name: 'Weather Portal', icon: '⛅', bg: 'bg-cyan-500/20 text-cyan-400', desc: 'Realtime Meteorologic Data' },
    { name: 'Web Browser', icon: '🌐', bg: 'bg-indigo-500/20 text-indigo-400', desc: 'Google Search & Web' },
    { name: 'Terminal / CLI', icon: '⚡', bg: 'bg-emerald-500/20 text-emerald-400', desc: 'System Command Prompt' },
  ];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="App Control Center"
      theme={theme}
      icon={<span className="text-xl">🎛️</span>}
    >
      <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Select an application to launch or voice command: &quot;Open [App Name]&quot;
      </p>
      <div className="grid grid-cols-2 gap-3">
        {apps.map((app) => (
          <button
            key={app.name}
            onClick={() => {
              onLaunchApp(app.name);
              onClose();
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 group ${
              isDark
                ? 'border-white/10 bg-[#0f1a36]/60 hover:bg-[#16254c] hover:border-[#397cff]/50'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-400'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${app.bg}`}>
              {app.icon}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold group-hover:text-blue-500 transition-colors">
                {app.name}
              </div>
              <div className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {app.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ModalWrapper>
  );
};

// 2. PC CONTROL MODAL
interface PCControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onAction: (actionName: string) => void;
}

export const PCControlModal: React.FC<PCControlModalProps> = ({
  isOpen,
  onClose,
  theme,
  onAction,
}) => {
  const isDark = theme === 'dark';
  const [volume, setVolume] = useState(65);
  const [brightness, setBrightness] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="PC System Controls"
      theme={theme}
      icon={<Laptop className="w-5 h-5 text-blue-400" />}
    >
      <div className="space-y-4">
        {/* Sliders */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0c1630] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
              Master Volume
            </span>
            <span className="text-xs font-mono">{isMuted ? 'Muted' : `${volume}%`}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setIsMuted(false);
              }}
              className="w-full accent-blue-500"
            />
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                onAction(isMuted ? 'Unmute Audio' : 'Mute Audio');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isMuted
                  ? 'border-rose-500/50 bg-rose-500/20 text-rose-400'
                  : isDark ? 'border-white/15 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-200'
              }`}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        </div>

        {/* Brightness */}
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0c1630] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" /> Display Brightness
            </span>
            <span className="text-xs font-mono">{brightness}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Quick Power & Lock Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={() => {
              onAction('Lock Workstation');
              onClose();
            }}
            className={`py-3 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
              isDark ? 'border-white/10 bg-[#0f1a36] hover:bg-[#16254c]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Lock Screen</span>
          </button>
          <button
            onClick={() => {
              onAction('Restart System');
              onClose();
            }}
            className={`py-3 px-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
              isDark ? 'border-white/10 bg-[#0f1a36] hover:bg-[#16254c]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart PC</span>
          </button>
          <button
            onClick={() => {
              onAction('Shutdown System');
              onClose();
            }}
            className="py-3 px-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium flex flex-col items-center gap-1.5 transition-all"
          >
            <Power className="w-4 h-4 text-rose-400" />
            <span>Shutdown</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 3. ANDROID CONTROL MODAL
interface AndroidControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onAction: (actionName: string) => void;
}

export const AndroidControlModal: React.FC<AndroidControlModalProps> = ({
  isOpen,
  onClose,
  theme,
  onAction,
}) => {
  const isDark = theme === 'dark';
  const [hotspotActive, setHotspotActive] = useState(true);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Android Device Sync"
      theme={theme}
      icon={<Smartphone className="w-5 h-5 text-orange-400" />}
    >
      <div className="space-y-3">
        {/* Device Status */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-[#0c1630] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg">
              📱
            </div>
            <div>
              <div className="text-sm font-semibold">Galaxy S24 Ultra (Synced)</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected via Wi-Fi Direct
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold flex items-center gap-1 text-emerald-400">
              <Battery className="w-3.5 h-3.5" /> 84%
            </div>
            <div className="text-[10px] text-slate-400">Charging</div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={() => {
              setHotspotActive(!hotspotActive);
              onAction(hotspotActive ? 'Disable Hotspot' : 'Enable Hotspot');
            }}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
              hotspotActive
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                : isDark ? 'border-white/10 bg-[#0f1a36]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span>Mobile Hotspot</span>
            </div>
            <span className="text-[10px] font-bold">{hotspotActive ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              onAction('Ring Android Phone');
              speakText('Ringing Android device located on network', 'en');
            }}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
              isDark ? 'border-white/10 bg-[#0f1a36] hover:bg-[#16254c]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Find / Ring Device</span>
          </button>

          <button
            onClick={() => {
              onAction('Screen Cast Activated');
            }}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
              isDark ? 'border-white/10 bg-[#0f1a36] hover:bg-[#16254c]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <Cast className="w-4 h-4 text-cyan-400" />
            <span>Cast Screen</span>
          </button>

          <button
            onClick={() => {
              onAction('Sync Notifications');
            }}
            className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
              isDark ? 'border-white/10 bg-[#0f1a36] hover:bg-[#16254c]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-purple-400" />
            <span>Sync Notifications</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 4. WEATHER POPUP MODAL
interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ isOpen, onClose, theme }) => {
  const isDark = theme === 'dark';
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Weather Forecast"
      theme={theme}
      icon={<CloudSun className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-4">
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500/20' : 'bg-blue-50 border-blue-200'
        }`}>
          <div>
            <div className="text-2xl font-bold">24°C / 75°F</div>
            <div className="text-xs text-blue-400 font-medium">Clear Sky & Mild Breeze</div>
            <div className="text-[11px] text-slate-400 mt-1">Humidity: 48% • Wind: 9 km/h</div>
          </div>
          <div className="text-4xl animate-bounce">⛅</div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {['Fri', 'Sat', 'Sun', 'Mon'].map((day, idx) => (
            <div
              key={day}
              className={`p-2.5 rounded-xl border ${
                isDark ? 'border-white/10 bg-[#0f1a36]' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="text-slate-400 text-[10px]">{day}</div>
              <div className="text-lg my-1">{idx % 2 === 0 ? '☀️' : '⛅'}</div>
              <div className="font-semibold">{22 + idx}°C</div>
            </div>
          ))}
        </div>
      </div>
    </ModalWrapper>
  );
};

// 5. MUSIC PLAYER MODAL
interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({ isOpen, onClose, theme }) => {
  const isDark = theme === 'dark';
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Music Player"
      theme={theme}
      icon={<Music className="w-5 h-5 text-blue-400" />}
    >
      <div className="text-center py-2 space-y-4">
        <div className="w-20 h-20 rounded-2xl mx-auto bg-gradient-to-tr from-[#1677ff] to-[#633cff] flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(55,120,255,0.4)]">
          🎵
        </div>
        <div>
          <h4 className="font-bold text-base">Cybernetic Ambient Waves</h4>
          <p className="text-xs text-slate-400">Voice Assistant Studio • Lo-Fi Relaxation</p>
        </div>

        {/* Scrub Bar */}
        <div className="w-full bg-slate-700/40 rounded-full h-1.5 overflow-hidden">
          <div className="bg-[#397cff] h-full w-2/5 rounded-full" />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>01:24</span>
          <span>03:40</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1677ff] to-[#633cff] text-white flex items-center justify-center text-lg shadow-lg hover:scale-105 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// 6. FILE EXPLORER MODAL
interface FileExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const FileExplorerModal: React.FC<FileExplorerModalProps> = ({ isOpen, onClose, theme }) => {
  const isDark = theme === 'dark';
  const files = [
    { name: 'Voice_Commands_Report.docx', size: '24 KB', date: 'Today, 2:15 PM', icon: '📄' },
    { name: 'System_Config_Profile.json', size: '4.2 KB', date: 'Yesterday', icon: '⚙️' },
    { name: 'Meeting_Audio_Capture.wav', size: '12.8 MB', date: 'Sep 15, 2026', icon: '🎧' },
    { name: 'Project_Architecture.pdf', size: '1.4 MB', date: 'Sep 12, 2026', icon: '📑' },
  ];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="My Files & Documents"
      theme={theme}
      icon={<Folder className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.name}
            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              isDark ? 'border-white/10 bg-[#0f1a36] hover:bg-[#16254c]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-lg">{file.icon}</span>
              <div>
                <div className="font-semibold truncate">{file.name}</div>
                <div className="text-[10px] text-slate-400">{file.size} • {file.date}</div>
              </div>
            </div>
            <button className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-[11px] font-medium hover:bg-blue-500/30">
              Open
            </button>
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};
