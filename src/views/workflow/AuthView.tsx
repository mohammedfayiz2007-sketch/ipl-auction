/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } from '../../lib/firebase';
import { Lock, Mail, User, ArrowRight, Check, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { user, updateUserName, loginUserSession } = useAuction();

  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogle();
      setLoading(false);
      if (res.success && res.user) {
        if (res.user.displayName) updateUserName(res.user.displayName);
        const authedUser = {
          ...user,
          id: res.user.uid,
          name: res.user.displayName || user.name || 'Franchise Director',
          email: res.user.email || user.email || 'director@ipl2027.com',
          isAuthenticated: true,
        };
        loginUserSession(authedUser);
      } else if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Google authentication was cancelled or interrupted.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      const res = await resetPassword(email);
      setLoading(false);
      if (res.success) {
        setSuccessMsg('Password reset link sent to your email address.');
      } else {
        setErrorMsg(res.error || 'Failed to send reset email.');
      }
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your full name or director title.');
        setLoading(false);
        return;
      }
      const res = await registerWithEmail(email, password, displayName);
      setLoading(false);
      if (res.success && res.user) {
        updateUserName(displayName);
        const updatedUser = {
          ...user,
          id: res.user.uid,
          name: displayName,
          email: email,
          isAuthenticated: true,
        };
        loginUserSession(updatedUser);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
      return;
    }

    // Default: Sign In
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success && res.user) {
      const updatedUser = {
        ...user,
        id: res.user.uid,
        name: res.user.displayName || email.split('@')[0],
        email: email,
        isAuthenticated: true,
      };
      loginUserSession(updatedUser);
    } else {
      setErrorMsg(res.error || 'Sign in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Stadium glow ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-b from-[#F5B942]/10 via-[#4388FF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5B942] to-[#D19B20] text-[#080D1A] flex items-center justify-center text-2xl font-extrabold mx-auto mb-3 shadow-xl shadow-[#F5B942]/20">
            🏏
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            IPL AUCTION ARENA <span className="text-[#F5B942]">2027</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            BCCI Official Multiplayer Mega Auction War Room Portal
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#10192B] border border-[#21304d] shadow-2xl backdrop-blur">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#080D1A] border border-[#21304d] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#172338] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#172338] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                mode === 'forgot'
                  ? 'bg-[#172338] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3.5 mb-4 rounded-xl bg-[#FF5263]/15 border border-[#FF5263] text-white text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF5263] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 mb-4 rounded-xl bg-[#20C997]/15 border border-[#20C997] text-white text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-[#20C997] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign In CTA */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#080D1A] hover:bg-[#172338] border border-[#21304d] text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-slate-500 mb-5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center mb-5">
                <div className="border-t border-[#21304d] w-full" />
                <span className="bg-[#10192B] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or with email
                </span>
              </div>
            </>
          )}

          {/* Email Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                  Franchise Director Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Parth Jindal"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] text-xs text-white focus:border-[#F5B942] outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@iplfranchise.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] text-xs text-white focus:border-[#F5B942] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080D1A] border border-[#21304d] text-xs text-white focus:border-[#F5B942] outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#F5B942] hover:bg-[#ffc95c] text-[#080D1A] font-extrabold text-xs shadow-lg shadow-[#F5B942]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Verifying...'
                  : mode === 'signin'
                  ? 'Sign In to War Room'
                  : mode === 'register'
                  ? 'Create Director Account'
                  : 'Send Reset Instructions'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom helper */}
          <div className="mt-5 text-center">
            {mode === 'signin' ? (
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-slate-400 hover:text-[#F5B942] transition-colors cursor-pointer"
              >
                Forgot your password?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-slate-400 hover:text-[#F5B942] transition-colors cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            )}
          </div>

          {/* Instant Evaluation / Demo Login option */}
          <div className="mt-4 pt-4 border-t border-[#21304d] text-center">
            <button
              type="button"
              onClick={() => {
                const demoUser = {
                  ...user,
                  id: 'usr_director_' + Math.random().toString(36).substring(2, 7),
                  name: 'Franchise Director (Demo)',
                  email: 'director@ipl2027.com',
                  isAuthenticated: true,
                };
                loginUserSession(demoUser);
              }}
              className="text-xs font-semibold text-[#20C997] hover:text-emerald-400 cursor-pointer flex items-center justify-center gap-1.5 mx-auto py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Enter as Franchise Director (Demo / QA Mode)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
