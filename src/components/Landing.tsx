import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, BookOpen, Award, Plane, Moon, Sun } from 'lucide-react';
import TermsModal from './TermsModal';

export default function Landing() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: darkMode
          ? 'radial-gradient(ellipse at 50% 0%, rgba(58,122,188,0.15) 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(42,90,140,0.1) 0%, transparent 70%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <TermsModal />
      {/* Top bar */}
      <div
        className="flex justify-end px-6 py-4 border-b backdrop-blur-sm"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: '0 1px 0 rgba(26,58,92,0.06), 0 4px 20px rgba(26,58,92,0.08)',
        }}
      >
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{
            backgroundColor: 'var(--navy)',
          }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={15} color="white" /> : <Moon size={15} color="white" />}
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-16 text-center">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 sm:gap-6 mb-8"
        >
          {/* Big 61 numeral */}
          <div className="relative">
            <span
              className="block font-black leading-none tracking-tighter select-none"
              style={{
                fontSize: 'clamp(56px, 14vw, 96px)',
                color: 'var(--navy)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-4px',
                lineHeight: 1,
                textShadow: darkMode
                  ? '0 2px 8px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(26,58,92,0.15), 0 8px 24px rgba(26,58,92,0.1)',
              }}
            >
              61
            </span>
            {/* Amber underline with glow */}
            <div
              className="absolute rounded-full"
              style={{
                bottom: '-6px',
                left: 0,
                width: '100%',
                height: '5px',
                backgroundColor: '#e8a020',
                borderRadius: '3px',
                boxShadow: '0 2px 10px rgba(232,160,32,0.6), 0 0 20px rgba(232,160,32,0.3)',
              }}
            />
          </div>

          {/* Amber vertical divider */}
          <div
            className="self-stretch rounded-full"
            style={{
              width: '3px',
              background: 'linear-gradient(to bottom, transparent, #e8a020, transparent)',
              opacity: 0.5,
              borderRadius: '2px',
              minHeight: '64px',
            }}
          />

          {/* TRACKER wordmark + tagline */}
          <div className="flex flex-col justify-center gap-1">
            <span
              className="font-black uppercase tracking-wide leading-none"
              style={{
                fontSize: 'clamp(20px, 6vw, 32px)',
                color: 'var(--navy)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '2px',
                textShadow: darkMode
                  ? '0 1px 4px rgba(0,0,0,0.3)'
                  : '0 1px 4px rgba(26,58,92,0.12)',
              }}
            >
              TRACKER
            </span>
            <span
              className="font-bold uppercase tracking-widest"
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '3px',
              }}
            >
              From first lesson to checkride
            </span>
            <div
              style={{
                height: '2px',
                background: 'linear-gradient(to right, #e8a020, transparent)',
                opacity: 0.4,
                borderRadius: '1px',
                marginTop: '2px',
              }}
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xl mb-10"
        >
          <h2
            className="text-4xl sm:text-5xl font-black leading-tight mb-4"
            style={{
              color: 'var(--text-primary)',
              textShadow: darkMode
                ? '0 2px 12px rgba(0,0,0,0.3)'
                : '0 2px 12px rgba(26,58,92,0.08)',
            }}
          >
            The CFI tool that keeps{" "}
            <span style={{ color: 'var(--navy)' }}>you in the FARs.</span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The complete lesson tracker for Part 61 flight instructors. Track ACS grades, manage endorsements, and know exactly when your student is checkride ready.
          </p>
        </motion.div>
        
        {/* Free PPL Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="flex justify-center mb-10"
        >
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm"
            style={{ 
              backgroundColor: 'rgba(45,122,79,0.1)', 
              borderColor: 'rgba(45,122,79,0.25)' 
            }}
          >
            <CheckCircle2 size={13} style={{ color: '#2d7a4f' }} />
            <span className="text-[11px] font-bold" style={{ color: '#2d7a4f' }}>
              Private Pilot is free forever — no credit card, unlimited students
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 text-white font-bold rounded-2xl text-sm flex items-center gap-2 justify-center cursor-pointer transition-all"
            style={{
              backgroundColor: 'var(--navy)',
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 100%)',
              boxShadow: '0 6px 0 rgba(10,20,40,0.4), 0 8px 24px rgba(26,58,92,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 9px 0 rgba(10,20,40,0.4), 0 14px 32px rgba(26,58,92,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 0 rgba(10,20,40,0.4), 0 8px 24px rgba(26,58,92,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(5px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 0 rgba(10,20,40,0.4), 0 2px 8px rgba(26,58,92,0.2), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 9px 0 rgba(10,20,40,0.4), 0 14px 32px rgba(26,58,92,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
          >
            <Plane size={18} />
            Sign In
          </button>

          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-4 font-bold rounded-2xl text-sm flex items-center gap-2 justify-center cursor-pointer transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 6px 0 rgba(26,58,92,0.1), 0 8px 24px rgba(26,58,92,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 9px 0 rgba(26,58,92,0.1), 0 14px 32px rgba(26,58,92,0.12), inset 0 1px 0 rgba(255,255,255,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 0 rgba(26,58,92,0.1), 0 8px 24px rgba(26,58,92,0.08), inset 0 1px 0 rgba(255,255,255,0.5)';
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(5px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 0 rgba(26,58,92,0.08), 0 2px 8px rgba(26,58,92,0.06), inset 0 1px 0 rgba(255,255,255,0.5)';
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 9px 0 rgba(26,58,92,0.1), 0 14px 32px rgba(26,58,92,0.12), inset 0 1px 0 rgba(255,255,255,0.5)';
            }}
          >
            Create Account
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full"
        >
          {[
            {
              icon: <BookOpen size={24} style={{ color: 'var(--navy)' }} />,
              iconBg: 'rgba(26,58,92,0.08)',
              title: "Track Every Lesson",
              description: "Log ground and flight lessons with full ACS task grading. Ground and flight. Every rating.",
              accent: 'var(--navy)',
            },
            {
              icon: <Award size={24} style={{ color: 'var(--amber)' }} />,
              iconBg: 'rgba(232,160,32,0.1)',
              title: "Manage Endorsements",
              description: "AC 61-65K endorsements built in. Know exactly which endorsements your student needs and when you gave them.",
              accent: '#e8a020',
            },
            {
              icon: <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />,
              iconBg: 'rgba(45,122,79,0.08)',
              title: "Checkride Ready",
              description: "Real time §61.109 hour tracking. The app tells you the moment your student meets every requirement.",
              accent: 'var(--green)',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="rounded-2xl p-6 text-left transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderTop: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 0 rgba(26,58,92,0.08), 0 8px 24px rgba(26,58,92,0.1), inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 10px 0 rgba(26,58,92,0.08), 0 20px 40px rgba(26,58,92,0.14), inset 0 1px 0 rgba(255,255,255,0.7)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 0 rgba(26,58,92,0.08), 0 8px 24px rgba(26,58,92,0.1), inset 0 1px 0 rgba(255,255,255,0.7)';
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  boxShadow: '0 2px 6px rgba(26,58,92,0.1), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(26,58,92,0.06)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
              <div
                className="mt-4 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(to right, ${feature.accent}, transparent)`,
                  opacity: 0.3,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Supported Ratings Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full flex flex-col items-center px-6 py-24"
      >
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 block" style={{ color: 'var(--text-muted)' }}>
              Supported Ratings
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Built for every fixed-wing rating
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              7 ratings supported today. More on the way.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { code: 'PPL', name: 'Private Pilot', desc: 'Pre-solo through checkride with full §61.109 hour tracking.' },
              { code: 'IR', name: 'Instrument Rating', desc: 'Approaches, holds, and intercept tracking with §61.65 currency.' },
              { code: 'CPL', name: 'Commercial Pilot', desc: 'ASEL commercial maneuvers with §61.129 hour breakdowns.' },
              { code: 'CPL AMEL', name: 'Commercial Pilot — AMEL Add-On', desc: 'Multiengine class rating add-on under §61.63(c)(1).' },
              { code: 'CFI', name: 'Certificated Flight Instructor', desc: 'FOI, spin training, and §61.183 practical test prep.' },
              { code: 'CFII', name: 'Flight Instructor — Instrument', desc: 'Instrument instructor with §61.187(b)(7) endorsements.' },
              { code: 'MEI', name: 'Multi-Engine Instructor', desc: 'Initial and Add-On paths with full multiengine ACS.' },
            ].map((rating) => (
              <motion.div
                key={rating.code}
                className="rounded-2xl p-5 text-left transition-all border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  boxShadow: '0 4px 12px rgba(26,58,92,0.04)',
                }}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(26,58,92,0.1)' }}
              >
                <div className="mb-3">
                  <CheckCircle2 size={18} style={{ color: 'var(--green)' }} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  {rating.code}
                </p>
                <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {rating.name}
                </h4>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {rating.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Pricing Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full flex flex-col items-center px-6 pb-20"
      >
        <div className="w-full max-w-3xl">

        {/* Comparison banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex items-center justify-center gap-0 mb-10 rounded-2xl overflow-hidden border overflow-x-auto"
          style={{
            borderColor: 'var(--border-color)',
            boxShadow: '0 4px 16px rgba(26,58,92,0.08)',
          }}
        >
          {/* 61 Tracker side */}
          <div
            className="flex-1 flex flex-col items-center py-5 px-4"
            style={{ backgroundColor: '#1a3a5c' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">61 Tracker</span>
            <span className="text-2xl sm:text-3xl font-black text-white">$9.99</span>
            <span className="text-[10px] text-white/60 mt-0.5">per month</span>
            <div
              className="mt-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(232,160,32,0.2)', color: '#e8a020' }}
            >
              1 month free
            </div>
          </div>

          {/* VS divider */}
          <div
            className="flex flex-col items-center justify-center px-4 py-5 shrink-0"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>VS</span>
          </div>

          {/* Competitors side */}
          <div
            className="flex-1 flex flex-col items-center py-5 px-4"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Competitors</span>
            <span className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>$30–$50</span>
            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>per month</span>
            <div
              className="mt-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
            >
              no free trial
            </div>
          </div>
        </motion.div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            Simple, honest pricing
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Start free with Private Pilot. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {/* Free tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl border-2 p-4 sm:p-6 flex flex-col"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              boxShadow: '0 4px 16px rgba(26,58,92,0.06)',
            }}
          >
            <h3 className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>Free</h3>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>Free forever for Private Pilot. No credit card required.</p>
            <div className="mb-6">
              <span className="text-4xl font-black" style={{ color: 'var(--navy)' }}>$0</span>
              <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>forever, no card</span>
            </div>
            <div className="space-y-2 mb-6 flex-1">
              {[
                'Private Pilot rating only',
                'Unlimited PPL students',
                'No credit card to start',
                'Full ACS task grading',
                'AC 61-65K endorsements',
                '§61.109 hour tracking',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={12} style={{ color: '#2d7a4f', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full py-2.5 rounded-xl text-xs font-bold border-2 transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ borderColor: 'var(--border-color)', color: 'var(--navy)', backgroundColor: 'transparent' }}
            >
              Get Started — No Card Required
            </button>
          </motion.div>

          {/* Monthly tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl border-2 p-4 sm:p-6 flex flex-col relative"
            style={{
              backgroundColor: '#1a3a5c',
              borderColor: '#1a3a5c',
              boxShadow: '0 8px 32px rgba(26,58,92,0.25)',
            }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap"
              style={{ backgroundColor: '#e8a020' }}
            >
              Most Popular
            </div>
            <h3 className="text-sm font-black mb-1 text-white">All Ratings</h3>
            <p className="text-[10px] mb-4 text-white/60">Track every student across every rating</p>
            <div className="mb-2">
              <span className="text-4xl font-black text-white">$9.99</span>
              <span className="text-xs ml-1 text-white/60">per month</span>
            </div>
            <p className="text-[10px] font-bold mb-6" style={{ color: '#e8a020' }}>First month completely free</p>
            <div className="space-y-2 mb-6 flex-1">
              {[
                'Everything in Free',
                'IR · CPL · CPL AMEL · CFI · CFII · MEI',
                'Full ACS grading all ratings',
                'All endorsements unlocked',
                'Checkride readiness all ratings',
                'Cancel anytime',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-white/80">
                  <CheckCircle2 size={12} style={{ color: '#e8a020', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ backgroundColor: '#e8a020', boxShadow: '0 4px 12px rgba(232,160,32,0.4)' }}
            >
              Start Free Trial →
            </button>
          </motion.div>

          {/* Annual tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-2xl border-2 p-4 sm:p-6 flex flex-col relative"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: '#2d7a4f',
              boxShadow: '0 8px 32px rgba(45,122,79,0.15)',
            }}
          >
            {/* Best value ribbon */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap"
              style={{ backgroundColor: '#2d7a4f' }}
            >
              🏆 Best Value
            </div>

            <h3 className="text-sm font-black mb-1 mt-2" style={{ color: 'var(--text-primary)' }}>All Ratings Annual</h3>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>One payment. Full year. Nothing to think about.</p>

            <div className="mb-1 flex items-end gap-2">
              <span className="text-4xl font-black" style={{ color: '#2d7a4f' }}>$99</span>
              <div className="mb-1.5">
                <span className="text-xs line-through opacity-40" style={{ color: 'var(--text-muted)' }}>$119.88</span>
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>per year</span>
              </div>
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-6 w-fit"
              style={{ backgroundColor: 'rgba(45,122,79,0.1)', border: '1px solid rgba(45,122,79,0.2)' }}
            >
              <span className="text-[10px] font-black" style={{ color: '#2d7a4f' }}>💰 You save $21 every year</span>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              {[
                'Everything in All Ratings',
                'Locked in at $8.25/month effective',
                'No monthly billing surprises',
                'Full year of all 7 ratings',
                'First month still free',
                'Cancel anytime — access until year ends',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={12} style={{ color: '#2d7a4f', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="w-full py-3 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ backgroundColor: '#2d7a4f', boxShadow: '0 6px 20px rgba(45,122,79,0.35)' }}
            >
              Get the Best Deal →
            </button>
          </motion.div>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
          All paid plans include a 1 month free trial · No charge until trial ends · Cancel anytime
        </p>
        </div>
      </motion.div>

      {/* Footer */}
      <footer
        className="w-full py-6 text-center border-t transition-colors duration-300"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: '0 -1px 0 var(--border-color), 0 -4px 16px rgba(26,58,92,0.06)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          61 Tracker · Built for CFIs · FAR Part 61
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 mt-2">
          {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map((label, i, arr) => {
            const path = label.toLowerCase().replace(/ /g, '-');
            const to = `/${path === 'about' ? 'about' : path === 'contact' ? 'contact' : path === 'privacy-policy' ? 'privacy' : 'terms'}`;
            return (
              <React.Fragment key={label}>
                <Link
                  to={to}
                  className="text-[10px] transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  {label}
                </Link>
                {i < arr.length - 1 && (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>·</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
