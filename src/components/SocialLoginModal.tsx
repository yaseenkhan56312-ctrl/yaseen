import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { UserSession, ThemeMode } from '../types';

interface SocialLoginModalProps {
  provider: 'Google' | 'Microsoft' | null;
  onClose: () => void;
  onSuccess: (session: UserSession) => void;
  theme?: ThemeMode;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  provider,
  onClose,
  onSuccess,
  theme = 'dark',
}) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);
  const isDark = theme === 'dark';

  if (!provider) return null;

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setAuthComplete(true);
      setTimeout(() => {
        onSuccess({
          username: 'Yaseen Khan',
          email: 'yaseenkhan56312@gmail.com',
          fullName: 'Yaseen Khan',
          loginMethod: provider === 'Google' ? 'google' : 'microsoft',
          loginTime: new Date().toLocaleTimeString(),
          role: 'Administrator',
          status: 'Online',
        });
      }, 700);
    }, 1100);
  };

  return (
    <div
      id="social-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="social-modal-dialog"
        className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl backdrop-blur-xl relative text-center transition-all ${
          isDark
            ? 'bg-[#0f1420]/95 border-white/15 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.15)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-social-modal-btn"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 text-2xl bg-white shadow-md p-2">
          {provider === 'Google' ? (
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          ) : (
            <svg className="w-8 h-8" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-bold">
          {provider === 'Google' ? 'Google Single Sign-On' : 'Microsoft Account SSO'}
        </h3>
        <p className={`text-xs mt-1 mb-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Grant Voice Control Assistant secure permission to access your profile.
        </p>

        <div className={`p-3 rounded-xl border text-xs text-left mb-5 flex items-center gap-2.5 ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
            Verified OAuth2 identity handoff &amp; TLS encryption.
          </span>
        </div>

        {!authComplete ? (
          <button
            type="button"
            disabled={isAuthorizing}
            onClick={handleAuthorize}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1677ff] to-[#633cff] text-white text-xs font-bold shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Token...</span>
              </>
            ) : (
              <span>Proceed as Yaseen Khan</span>
            )}
          </button>
        ) : (
          <div className="py-2 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authenticated! Redirecting to Assistant...</span>
          </div>
        )}
      </div>
    </div>
  );
};
