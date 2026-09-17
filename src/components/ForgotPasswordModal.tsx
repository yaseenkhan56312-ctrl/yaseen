import React, { useState } from 'react';
import { Mail, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { TranslationStrings, ThemeMode } from '../types';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  strings: TranslationStrings;
  isRtl?: boolean;
  theme?: ThemeMode;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  strings,
  isRtl = false,
  theme = 'dark',
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
    onClose();
  };

  return (
    <div
      id="forgot-password-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="forgot-password-dialog"
        dir={isRtl ? 'rtl' : 'ltr'}
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl relative transition-all ${
          isDark
            ? 'bg-[#0f1420]/95 border-white/15 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-forgot-modal-btn"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1677ff] to-[#633cff] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(22,119,255,0.4)] text-white">
              <Mail className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-xl font-bold mb-1.5 tracking-tight">
              {strings.resetPasswordTitle}
            </h3>
            <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {strings.resetPasswordDesc}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {strings.emailLabel}
                </label>
                <div className="relative">
                  <span className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400`}>
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={strings.emailPlaceholder}
                    className={`w-full py-3 ${
                      isRtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'
                    } rounded-xl border text-sm outline-none transition-all ${
                      isDark
                        ? 'bg-[#0c111c] border-white/10 text-white focus:border-[#397cff]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold transition-colors ${
                    isDark
                      ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-300'
                      : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {strings.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1677ff] to-[#633cff] text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <span>{strings.sendResetBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Instructions Dispatched</h3>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              A password reset authorization link has been forwarded to{' '}
              <span className="font-semibold text-blue-400">{email}</span>.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1677ff] to-[#633cff] text-white text-xs font-bold"
            >
              Return to Authentication
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
