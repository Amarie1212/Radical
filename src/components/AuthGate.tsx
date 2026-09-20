import React, { useState } from 'react';
import { signIn, signUp } from '../lib/supabase';
import { AppLanguage } from '../lib/types';
import { getText } from '../lib/i18n';
import {
  Gamepad2,
  Mail,
  KeyRound,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface AuthGateProps {
  onAuthenticated: (method: 'login' | 'register') => void;
  language?: AppLanguage;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthenticated, language = 'en' }) => {
  const t = {
    signIn: getText(language, 'signIn'),
    register: getText(language, 'register'),
    email: getText(language, 'email'),
    password: getText(language, 'password'),
    username: getText(language, 'username'),
    authSuccess: getText(language, 'authSuccess'),
  };

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please fill in email and password.');
      return;
    }

    try {
      setLoading(true);
      if (isRegistering) {
        const res = await signUp(email.trim(), password, username.trim() || email.split('@')[0]);
        if (res?.session) {
          setSuccessMsg('Account created and signed in successfully!');
          setTimeout(() => {
            onAuthenticated('register');
          }, 800);
        } else {
          setSuccessMsg(t.authSuccess);
          setTimeout(() => {
            setIsRegistering(false);
            setSuccessMsg(null);
          }, 1500);
        }
      } else {
        await signIn(email.trim(), password);
        onAuthenticated('login');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0A0B0E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tactile ZZZ Window Chassis */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[24px] border-[2px] border-[#2A2C3C] bg-[#121316] p-6 sm:p-8 shadow-[0_25px_65px_rgba(0,0,0,0.85)]">
        {/* Header Graphic & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#181922] border-[1.5px] border-[#2E3244] flex items-center justify-center text-[#FFDE00] shadow-sm">
            <Gamepad2 className="w-7 h-7" strokeWidth={2.2} />
          </div>

          <h1 className="mt-3.5 font-['Outfit'] font-black text-2xl sm:text-3xl uppercase italic tracking-tight text-white leading-none">
            RADICAL DREAMER
          </h1>
          <p className="mt-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#8E92A4]">
            HOLLOW DEEP DIVE • PROXY TERMINAL
          </p>
        </div>

        {/* Mode Toggle Capsule */}
        <div className="p-1 bg-[#171822] border border-[#2A2C3C] rounded-full grid grid-cols-2 gap-1 my-6">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setErrorMsg(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-['Outfit'] uppercase italic transition-all duration-150 rounded-full cursor-pointer ${
              !isRegistering
                ? 'bg-[#FFDE00] text-black font-black'
                : 'text-[#8E92A4] hover:text-white font-extrabold'
            }`}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setErrorMsg(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-['Outfit'] uppercase italic transition-all duration-150 rounded-full cursor-pointer ${
              isRegistering
                ? 'bg-[#FFDE00] text-black font-black'
                : 'text-[#8E92A4] hover:text-white font-extrabold'
            }`}
          >
            {t.register}
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 border border-red-500/80 bg-red-950/60 px-3.5 py-2.5 text-xs text-red-200 rounded-xl font-mono">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 border border-emerald-500/80 bg-emerald-950/60 px-3.5 py-2.5 text-xs text-emerald-200 rounded-xl font-mono">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} autoComplete="new-password" className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-['Outfit'] font-extrabold tracking-wider uppercase text-[#8E92A4]">
                {t.username}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-[#2B2D3C] bg-[#161722] py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-[#4E5266] focus:border-[#FFDE00] focus:outline-none font-['Outfit']"
                />
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71758A]" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-['Outfit'] font-extrabold tracking-wider uppercase text-[#8E92A4]">
              {t.email}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="email"
                name="account-email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#2B2D3C] bg-[#161722] py-2.5 pl-10 pr-3.5 text-sm text-white placeholder:text-[#4E5266] focus:border-[#FFDE00] focus:outline-none font-['Outfit']"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71758A]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-['Outfit'] font-extrabold tracking-wider uppercase text-[#8E92A4]">
              {t.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#2B2D3C] bg-[#161722] py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-[#4E5266] focus:border-[#FFDE00] focus:outline-none font-['Outfit']"
              />
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71758A]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71758A] hover:text-[#FFDE00] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Primary ZZZ Capsule Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-full py-3 px-5 bg-[#FFDE00] hover:bg-white text-black font-['Outfit'] font-black text-sm uppercase italic flex items-center justify-between transition-all duration-150 shadow-[0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/15 text-black">
                [ AUTHENTICATE ]
              </span>
              <span>{loading ? 'AUTHENTICATING...' : isRegistering ? 'Register Account' : 'Sign In to Terminal'}</span>
            </span>
            <span className="w-6 h-6 rounded-full bg-black text-[#FFDE00] flex items-center justify-center font-mono font-bold text-sm">
              ›
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
