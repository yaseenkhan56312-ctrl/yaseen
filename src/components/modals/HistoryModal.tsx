import React, { useState } from 'react';
import { Search, Clock, Trash2, Play, Check } from 'lucide-react';
import { ThemeMode, RecentCommandItem } from '../../types';
import { ModalWrapper } from './ActionModals';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  commands: RecentCommandItem[];
  onRerun: (text: string) => void;
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  theme,
  commands,
  onRerun,
  onClear,
}) => {
  const isDark = theme === 'dark';
  const [filter, setFilter] = useState('');

  const filtered = commands.filter((c) =>
    c.text.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Voice Command History"
      theme={theme}
      icon={<Clock className="w-5 h-5 text-teal-400" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3">
        {/* Search & Clear Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search past commands..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                isDark
                  ? 'bg-[#0c1630] border-white/10 text-white focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'
              }`}
            />
          </div>
          {commands.length > 0 && (
            <button
              onClick={onClear}
              className="px-3 py-2 rounded-xl text-xs text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Command List */}
        <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No voice commands found matching your query.
            </div>
          ) : (
            filtered.map((cmd) => (
              <div
                key={cmd.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors group ${
                  isDark
                    ? 'border-white/10 bg-[#0f1a36] hover:bg-[#16254c]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${cmd.iconBg}`}>
                    {cmd.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{cmd.text}</div>
                    <div className="text-[10px] text-slate-400">{cmd.timestamp}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onRerun(cmd.text);
                    onClose();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center gap-1 transition-all"
                >
                  <Play className="w-3 h-3 fill-blue-400" />
                  <span>Run</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
