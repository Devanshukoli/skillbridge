import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Code, Mail, Lock, User as UserIcon, ArrowRight, Loader2, X } from 'lucide-react';
import LandingView from './LandingView';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    const requires2FAParam = params.get('requires2FA') === 'true' || params.get('requires2fa') === 'true';
    const pendingEmail = params.get('email');

    if (authError) {
      setError(authError);
      setIsModalOpen(true);
    }

    if (requires2FAParam && pendingEmail) {
      setRequiresTwoFactor(true);
      setTwoFactorEmail(pendingEmail);
      setIsModalOpen(true);
    }

    if (authError || requires2FAParam) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setIsLogin(mode === 'login');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        setRequiresTwoFactor(true);
        setTwoFactorEmail(email);
        setLoading(false);
        return;
      }

      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorToken || twoFactorToken.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: twoFactorEmail, token: twoFactorToken })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid 2FA code');
      }

      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="relative min-h-screen">
      
      {/* Primary Vibrant Landing Page */}
      <LandingView 
        onAuthSuccess={onAuthSuccess} 
        onRequestAuthModal={handleOpenAuthModal} 
      />

      {/* Auth Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => setIsModalOpen(false)} 
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-1">
                <Code className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {requiresTwoFactor 
                  ? 'Two-Factor Authentication' 
                  : isLogin 
                  ? 'Sign in to SkillBridge' 
                  : 'Start Your Coding Track'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {requiresTwoFactor
                  ? 'Enter code from authenticator app'
                  : 'Earn real cash rewards for completing backend capstones.'}
              </p>
            </div>

            {/* Login / Register Tab Switcher */}
            {!requiresTwoFactor && (
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  id="auth-tab-login"
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isLogin 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="auth-tab-register"
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    !isLogin 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* 2FA Verification Form */}
            {requiresTwoFactor && (
              <form className="space-y-4" onSubmit={handleTwoFactorSubmit}>
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                    Authenticator Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-input-2fa"
                      type="text"
                      required
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-mono tracking-widest text-center"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  id="auth-submit-2fa-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    setTwoFactorToken('');
                    setError('');
                  }}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Back to login
                </button>
              </form>
            )}

            {/* Standard Login / Register Form */}
            {!requiresTwoFactor && (
              <form className="space-y-3.5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        id="auth-input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-input-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@university.edu"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-input-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-md hover:shadow-blue-500/20 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Free Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Google Sign-In Separator */}
            {!requiresTwoFactor && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-white px-3 text-slate-400">Or continue with</span>
                  </div>
                </div>

                <button
                  id="auth-google-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Google Sign-In</span>
                </button>
              </>
            )}

            {/* Legal Notice */}
            <p className="text-[10px] text-center text-slate-400 font-sans leading-normal pt-1">
              By continuing, you agree to SkillBridge's{' '}
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  const el = document.querySelector('footer');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-slate-600 underline hover:text-slate-900 cursor-pointer"
              >
                Terms of Service
              </button>{' '}
              &{' '}
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  const el = document.querySelector('footer');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-slate-600 underline hover:text-slate-900 cursor-pointer"
              >
                Privacy Policy
              </button>.
            </p>

            {/* Quick Demo Credentials helper */}
            <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
              Demo Student: <button type="button" onClick={() => { setEmail('student@skillbridge.dev'); setPassword('student123'); setIsLogin(true); }} className="text-blue-600 underline font-semibold cursor-pointer">student@skillbridge.dev</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
