import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Moon, Sun } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const code = inviteCode.trim().toUpperCase();
        
        // Validate invite code if provided
        if (code) {
          const { data: codeData, error: codeError } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('code', code)
            .eq('used', false)
            .single();

          if (codeError || !codeData) {
            throw new Error('Invalid or already used invite code. Please check your code and try again.');
          }
        }

        // Create the account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;

        const { user, session } = signUpData;

        if (code) {
          // Mark invite code as used
          await supabase
            .from('invite_codes')
            .update({
              used: true,
              used_by: email,
              used_at: new Date().toISOString(),
            })
            .eq('code', code);

          // Set plan to invite for full access
          await supabase
            .from('user_subscriptions')
            .update({
              plan: 'invite',
              ratings_unlocked: ['ppl', 'ir', 'cpl', 'cfi', 'cfii', 'mei'],
            })
            .eq('email', email);
        } else if (session && user) {
          // No invite code: Free plan (only if session immediately available)
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              email: email,
              plan: 'free',
              ratings_unlocked: ['ppl'],
              status: 'active'
            });
        }

        setSuccess('Account created! Check your email to confirm, then sign in.');
        setIsLogin(true);
        setInviteCode('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-6 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(42, 90, 140, 0.07) 0%, transparent 60%)',
      }}
    >
      {/* Dark mode toggle — top right */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg border hover:bg-[var(--bg-tertiary)] transition-all"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="w-full max-w-md">

        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold transition-colors mb-6 cursor-pointer hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to 61 Tracker
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            boxShadow: '0 4px 24px rgba(26, 58, 92, 0.1), 0 16px 48px rgba(26, 58, 92, 0.08)'
          }}
        >
          {/* Header */}
          <div
            className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6"
            style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)' }}
          >
            {/* Logo lockup */}
            <div className="flex items-center gap-4 mb-6">
              {/* 61 numeral */}
              <div className="relative">
                <span
                  className="block font-black leading-none select-none"
                  style={{
                    fontSize: '52px',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '-2px',
                    lineHeight: 1,
                  }}
                >
                  61
                </span>
                {/* Amber underline */}
                <div
                  className="absolute rounded-full"
                  style={{
                    bottom: '-4px',
                    left: 0,
                    width: '100%',
                    height: '3.5px',
                    backgroundColor: '#e8a020',
                  }}
                />
              </div>

              {/* Amber divider */}
              <div
                style={{
                  width: '2px',
                  height: '44px',
                  backgroundColor: '#e8a020',
                  opacity: 0.4,
                  borderRadius: '1px',
                  flexShrink: 0,
                }}
              />

              {/* TRACKER + tagline */}
              <div className="flex flex-col justify-center gap-0.5">
                <span
                  className="font-black uppercase leading-none"
                  style={{
                    fontSize: '20px',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '1.5px',
                  }}
                >
                  TRACKER
                </span>
                <span
                  className="font-bold"
                  style={{
                    fontSize: '8px',
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    fontVariant: 'normal',
                  }}
                >
                  BUILT FOR CFI<span style={{ textTransform: 'none' }}>s</span>
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {isLogin ? 'Sign in to your CFI dashboard' : 'Start tracking lessons today'}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="px-5 sm:px-8 pt-5 sm:pt-6">
            <div
              className="flex rounded-xl p-1"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <button
                onClick={() => setIsLogin(true)}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: isLogin ? 'var(--bg-secondary)' : 'transparent',
                  color: isLogin ? 'var(--navy)' : 'var(--text-muted)',
                  boxShadow: isLogin ? '0 1px 4px rgba(26,58,92,0.1)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                style={{
                  backgroundColor: !isLogin ? 'var(--bg-secondary)' : 'transparent',
                  color: !isLogin ? 'var(--navy)' : 'var(--text-muted)',
                  boxShadow: !isLogin ? '0 1px 4px rgba(26,58,92,0.1)' : 'none'
                }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-5 sm:px-8 py-5 sm:py-6">
            {error && (
              <div
                className="rounded-xl p-3 mb-5 flex items-start gap-2 text-xs border"
                style={{ backgroundColor: 'rgba(192,57,43,0.1)', borderColor: 'rgba(192,57,43,0.3)', color: 'var(--red)' }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="rounded-xl p-3 mb-5 flex items-start gap-2 text-xs border"
                style={{ backgroundColor: 'rgba(45,122,79,0.1)', borderColor: 'rgba(45,122,79,0.3)', color: 'var(--green)' }}
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest block"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Smith CFI"
                        className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest block"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Invite Code
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="61T-XXXX-XXXX-XXXX"
                        className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border font-mono tracking-wider"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Optional — 61 Tracker is free until late 2026. Want all ratings? Email 61trckr@gmail.com for an invite code.
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                    className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm cursor-pointer"
                style={{ backgroundColor: 'var(--navy)' }}
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            <p
              className="text-center text-[10px] mt-6"
              style={{ color: 'var(--text-muted)' }}
            >
              FAR Part 61 · AC 61-65K · FAA ACS Standards
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
