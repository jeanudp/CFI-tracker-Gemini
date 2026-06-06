import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft, Moon, Sun, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Your password has been successfully updated! Signing you out and redirecting to the login page...');
      
      // Clear fields
      setPassword('');
      setConfirmPassword('');

      // Sign out and redirect after a brief delay so they can see the message
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        navigate('/auth');
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting your password. The reset link may have expired or been used.');
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
          className="p-2 rounded-lg border hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Back to sign in link */}
        <button
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2 text-xs font-bold transition-colors mb-6 cursor-pointer hover:opacity-70 mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to sign in
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
                  BUILT FOR CFI<s>s</s>
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white text-left">
              Set a new password
            </h2>
            <p className="text-sm text-white/70 mt-1 text-left">
              Enter your new secure password below to update your account.
            </p>
          </div>

          {/* Form container */}
          <div className="px-5 sm:px-8 py-6">
            {error && (
              <div
                className="rounded-xl p-3 mb-5 flex items-start gap-2 text-xs border text-left"
                style={{ backgroundColor: 'rgba(192,57,43,0.1)', borderColor: 'rgba(192,57,43,0.3)', color: 'var(--red)' }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <span>{error}</span>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/auth')}
                      className="px-2.5 py-1 text-[10px] font-bold rounded bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 transition-colors cursor-pointer"
                    >
                      Go to Sign In / Request Reset Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div
                className="rounded-xl p-3 mb-5 flex items-start gap-2 text-xs border text-left"
                style={{ backgroundColor: 'rgba(45,122,79,0.1)', borderColor: 'rgba(45,122,79,0.3)', color: 'var(--green)' }}
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  className="text-[10px] font-bold uppercase tracking-widest block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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
                disabled={loading || !!success}
                className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--navy)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Update Password →'
                )}
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
