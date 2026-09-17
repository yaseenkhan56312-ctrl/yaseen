export type SupportedLanguage = 'en' | 'ur' | 'ps';

export type AuthMode = 'login' | 'signup';

export type ThemeMode = 'dark' | 'light';

export interface UserSession {
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  loginMethod: 'credentials' | 'google' | 'microsoft' | 'voice';
  loginTime: string;
  role?: string;
  status?: string;
}

export interface RecentCommandItem {
  id: string;
  text: string;
  timestamp: string;
  category: 'youtube' | 'music' | 'search' | 'files' | 'weather' | 'pc' | 'android' | 'general';
  icon: string;
  iconBg: string;
}

export interface SystemStats {
  totalCommands: number;
  appsControlled: number;
  pcActions: number;
  androidActions: number;
}

export interface TranslationStrings {
  title: string;
  subtitle: string;
  createTitle: string;
  createSubtitle: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  loginBtn: string;
  signupBtn: string;
  orDivider: string;
  googleBtn: string;
  microsoftBtn: string;
  noAccount: string;
  createAccount: string;
  haveAccount: string;
  backToLogin: string;
  securityNotice: string;
  voiceActive: string;
  voiceInstruction: string;
  voiceError: string;
  fillDemo: string;
  loginSuccess: string;
  fillRequiredFields: string;
  passwordMismatch: string;
  resetLinkSent: string;
  resetPasswordTitle: string;
  resetPasswordDesc: string;
  sendResetBtn: string;
  cancelBtn: string;
}
