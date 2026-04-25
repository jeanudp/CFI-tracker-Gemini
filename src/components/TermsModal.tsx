import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Check } from 'lucide-react';

export default function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const darkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const accepted = localStorage.getItem('terms_accepted');
    if (!accepted) {
      setIsOpen(true);
      // Disable scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('terms_accepted', 'true');
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Heavy Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#0a1428]/95 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#162440] rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-[#dde3ec] dark:border-[#2a4a6e]"
      >
        <div className="p-8 md:p-10 flex flex-col items-center text-center">
          
          {/* Logo Section (from Landing.tsx) */}
          <div className="flex items-center gap-4 mb-10 scale-90 sm:scale-100">
            <div className="relative">
              <span
                className="block font-black leading-none tracking-tighter select-none"
                style={{
                  fontSize: '64px',
                  color: 'var(--navy)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-2px',
                  lineHeight: 1,
                  textShadow: darkMode
                    ? '0 2px 8px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)'
                    : '0 2px 8px rgba(26,58,92,0.15), 0 8px 24px rgba(26,58,92,0.1)',
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
                  height: '4px',
                  backgroundColor: '#e8a020',
                  borderRadius: '2px',
                  boxShadow: '0 2px 10px rgba(232,160,32,0.6)',
                }}
              />
            </div>

            <div
              className="self-stretch rounded-full"
              style={{
                width: '2px',
                background: 'linear-gradient(to bottom, transparent, #e8a020, transparent)',
                opacity: 0.5,
                borderRadius: '1px',
                minHeight: '48px',
              }}
            />

            <div className="flex flex-col justify-center text-left">
              <span
                className="font-black uppercase tracking-wide leading-none"
                style={{
                  fontSize: '24px',
                  color: 'var(--navy)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '1px',
                }}
              >
                TRACKER
              </span>
              <span
                className="font-bold uppercase tracking-widest mt-0.5"
                style={{
                  fontSize: '8px',
                  color: 'var(--text-muted)',
                  letterSpacing: '2px',
                }}
              >
                CFI MANAGEMENT TOOLS
              </span>
            </div>
          </div>

          <h2 className="text-xl font-black mb-4 dark:text-white">Welcome Pilot</h2>
          
          <div className="space-y-4 mb-10">
            <p className="text-sm leading-relaxed text-[#4b5563] dark:text-slate-300">
              61 Tracker is a <strong>paid professional tool</strong> for Certified Flight Instructors. By continuing, you agree to our terms.
            </p>
            <p className="text-sm leading-relaxed text-[#4b5563] dark:text-slate-300">
              Your billing is processed securely by <strong>Stripe</strong>, and your data is stored in your private <strong>Supabase</strong> instance. We never sell your data.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full">
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 w-full py-3 px-4 rounded-xl border border-[#dde3ec] dark:border-[#2a4a6e] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 dark:text-white"
            >
              Terms of Service
              <ExternalLink size={14} className="opacity-40" />
            </a>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 w-full py-3 px-4 rounded-xl border border-[#dde3ec] dark:border-[#2a4a6e] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 dark:text-white"
            >
              Privacy Policy
              <ExternalLink size={14} className="opacity-40" />
            </a>
          </div>

          <button
            onClick={handleAgree}
            className="w-full py-4 bg-[#1a3a5c] hover:bg-[#2a5a8c] text-white font-black rounded-2xl shadow-[0_8px_24px_rgba(26,58,92,0.3)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            I Agree & Continue
            <Check size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <p className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
            No bypass available · Professional use only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
