import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Plane, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/');
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
        navigate('/');
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
    <div className="min-h-screen bg-[#eef2f8] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#dde3ec] shadow-[0_4px_32px_rgba(0,0,0,0.1)] p-10 w-full max-w-[400px]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 bg-[#1a3a5c] rounded-xl flex items-center justify-center text-white text-2xl">
            ✈
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1c2333]">ACS Lesson Tracker</h1>
            <p className="text-[11px] text-[#6b7280] uppercase tracking-wider">Private Pilot ASEL · Part 61</p>
          </div>
        </div>

        <div className="flex bg-[#f4f5f7] rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${
              isLogin ? 'bg-white text-[#1c2333] shadow-sm' : 'text-[#6b7280] hover:text-[#1c2333]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-all ${
              !isLogin ? 'bg-white text-[#1c2333] shadow-sm' : 'text-[#6b7280] hover:text-[#1c2333]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-[#fdecea] border border-[#f5c0bc] rounded-lg p-3 mb-4 flex items-start gap-2 text-[12.5px] text-[#c0392b]">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-[#e4f5ec] border border-[#9fd4b4] rounded-lg p-3 mb-4 flex items-start gap-2 text-[12.5px] text-[#2d7a4f]">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Smith CFI"
                  className="w-full text-sm border border-[#dde3ec] rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 transition-all"
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm border border-[#dde3ec] rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                className="w-full text-sm border border-[#dde3ec] rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a3a5c] text-white font-semibold py-2.5 rounded-lg hover:bg-[#2a5a8c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
