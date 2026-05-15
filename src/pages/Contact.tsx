import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header - Matching Landing Page Style */}
      <header
        className="sticky top-0 z-20 px-6 h-20 border-b flex items-center justify-between backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 2px 12px rgba(26,58,92,0.08)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--navy)' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Logo Numerals */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className="block font-black leading-none tracking-tighter select-none"
              style={{
                fontSize: '32px',
                color: 'var(--navy)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-1px',
              }}
            >
              61
            </span>
            <div
              className="absolute rounded-full"
              style={{
                bottom: '-2px',
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: '#e8a020',
              }}
            />
          </div>
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline" style={{ color: 'var(--navy)', opacity: 0.8 }}>
            Tracker
          </span>
        </div>

        <div className="w-16" />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-black" style={{ color: 'var(--navy)' }}>Get in Touch</h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              61 Tracker is built and maintained by a single working CFI. Whether you have a feature request, found a bug, or just want to talk shop, the best way to reach me is by email.
            </p>
          </div>

          <div className="group relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
            <a
              href="mailto:61trckr@gmail.com"
              className="relative flex items-center gap-4 px-5 sm:px-8 py-6 rounded-2xl border shadow-xl transition-all hover:-translate-y-1"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <Mail size={32} className="text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Email Me</p>
                <p className="text-xl md:text-2xl font-black group-hover:underline transition-all" style={{ color: 'var(--text-primary)' }}>
                  61trckr@gmail.com
                </p>
              </div>
            </a>
          </div>

          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            "I read every message and will get back to you as soon as I can."
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] pt-12" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
            Built by a CFI, for CFIs
          </p>
        </motion.div>
      </main>
    </div>
  );
}
