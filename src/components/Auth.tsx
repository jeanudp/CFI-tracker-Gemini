import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: '#f0f4f8',
        backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(42, 90, 140, 0.07) 0%, transparent 60%)',
      }}
    >
      <div className="w-full max-w-md">

        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold text-[#6b7280] hover:text-[#1a3a5c] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to 61 Tracker
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[#dde3ec] overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(26, 58, 92, 0.1), 0 16px 48px rgba(26, 58, 92, 0.08)' }}
        >
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6 border-b border-[#f0f4f8]"
            style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                  <ellipse cx="50" cy="50" rx="5" ry="38" />
                  <path d="M 50 45 Q 20 40 5 55 Q 20 52 50 52" />
                  <path d="M 50 45 Q 80 40 95 55 Q 80 52 50 52" />
                  <path d="M 50 82 Q 35 80 28 86 Q 35 84 50 84" />
                  <path d="M 50 82 Q 65 80 72 86 Q 65 84 50 84" />
                  <ellipse cx="50" cy="18" rx="4" ry="5" />
                  <rect x="47" y="30" width="6" height="5" rx="1" />
                  <rect x="47" y="37" width="6" height="4" rx="1" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight">61 Tracker</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Built for CFIs</p>
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
          <div className="px-8 pt-6">
            <div className="flex bg-[#f0f4f8] rounded-xl p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLogin
                    ? 'bg-white text-[#1a3a5c] shadow-sm'
                    : 'text-[#6b7280] hover:text-[#1a3a5c]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isLogin
                    ? 'bg-white text-[#1a3a5c] shadow-sm'
                    : 'text-[#6b7280] hover:text-[#1a3a5c]'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            {error && (
              <div className="bg-[#fdecea] border border-[#f5c0bc] rounded-xl p-3 mb-5 flex items-start gap-2 text-xs text-[#c0392b]">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-[#e4f5ec] border border-[#9fd4b4] rounded-xl p-3 mb-5 flex items-start gap-2 text-xs text-[#2d7a4f]">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith CFI"
                      className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all"
                      style={{ backgroundColor: '#f8fafc' }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] block">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all"
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] block">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                    className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all"
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a5c] text-white font-bold py-3.5 rounded-xl hover:bg-[#2a5a8c] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm cursor-pointer"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            <p className="text-center text-[10px] text-[#9ca3af] mt-6">
              FAR Part 61 · AC 61-65K · FAA ACS Standards
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
