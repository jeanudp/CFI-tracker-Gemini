import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, BookOpen, Award, Plane, Moon, Sun } from 'lucide-react';

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
          ? 'radial-gradient(ellipse at 50% 0%, rgba(58,122,188,0.18) 0%, transparent 70%), radial-gradient(ellipse at 80% 100%, rgba(45,122,79,0.1) 0%, transparent 60%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(42,90,140,0.1) 0%, transparent 70%), radial-gradient(ellipse at 80% 100%, rgba(45,122,79,0.06) 0%, transparent 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
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
          className="p-2 rounded-lg border transition-all"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)',
            boxShadow: '0 1px 3px rgba(26,58,92,0.1), 0 2px 8px rgba(26,58,92,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-16 text-center">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6 mb-8"
        >
          {/* Big 61 numeral */}
          <div className="relative">
            <span
              className="block font-black leading-none tracking-tighter select-none"
              style={{
                fontSize: '96px',
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
                boxShadow: '0 2px 8px rgba(232,160,32,0.5), 0 1px 0 rgba(255,200,80,0.4)',
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
                fontSize: '32px',
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
            The CFI tool that keeps<br />
            <span style={{ color: 'var(--navy)' }}>you in the FARs.</span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The complete lesson tracker for Part 61 flight instructors. Track ACS grades, manage endorsements, and know exactly when your student is checkride ready.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          {/* Primary button — raised effect */}
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 text-white font-bold rounded-2xl text-sm transition-all flex items-center gap-2 justify-center cursor-pointer"
            style={{
              backgroundColor: 'var(--navy)',
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 100%)',
              boxShadow: '0 4px 0 rgba(15,30,50,0.5), 0 6px 20px rgba(26,58,92,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              transform: 'translateY(0)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 7px 0 rgba(15,30,50,0.5), 0 12px 28px rgba(26,58,92,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 0 rgba(15,30,50,0.5), 0 6px 20px rgba(26,58,92,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 0 rgba(15,30,50,0.5), 0 2px 8px rgba(26,58,92,0.2), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 7px 0 rgba(15,30,50,0.5), 0 12px 28px rgba(26,58,92,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
          >
            <Plane size={18} />
            Sign In
          </button>

          {/* Secondary button — raised effect */}
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-4 font-bold rounded-2xl text-sm transition-all flex items-center gap-2 justify-center cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, var(--bg-secondary) 100%)',
              color: 'var(--navy)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 0 rgba(26,58,92,0.12), 0 6px 20px rgba(26,58,92,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
              transform: 'translateY(0)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 7px 0 rgba(26,58,92,0.12), 0 12px 28px rgba(26,58,92,0.15), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 0 rgba(26,58,92,0.12), 0 6px 20px rgba(26,58,92,0.1), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
            onMouseDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 0 rgba(26,58,92,0.1), 0 2px 8px rgba(26,58,92,0.06), inset 0 1px 0 rgba(255,255,255,0.9)';
            }}
            onMouseUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 7px 0 rgba(26,58,92,0.12), 0 12px 28px rgba(26,58,92,0.15), inset 0 1px 0 rgba(255,255,255,0.9)';
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
              className="rounded-2xl p-6 text-left transition-all cursor-default"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                backgroundImage: darkMode
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 60%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 60%)',
                border: '1px solid var(--border-color)',
                borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}`,
                boxShadow: darkMode
                  ? '0 4px 12px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 4px 12px rgba(26,58,92,0.1), 0 16px 40px rgba(26,58,92,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = darkMode
                  ? '0 8px 24px rgba(0,0,0,0.4), 0 24px 56px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 8px 24px rgba(26,58,92,0.16), 0 24px 56px rgba(26,58,92,0.12), inset 0 1px 0 rgba(255,255,255,0.9)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = darkMode
                  ? '0 4px 12px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 4px 12px rgba(26,58,92,0.1), 0 16px 40px rgba(26,58,92,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';
              }}
            >
              {/* Icon container with inner shadow */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: feature.iconBg,
                  backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
                  boxShadow: `0 2px 8px ${feature.iconBg}, inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.04)`,
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>

              {/* Bottom accent line */}
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

      {/* Footer */}
      <footer
        className="py-6 text-center border-t transition-colors duration-300"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: '0 -1px 0 var(--border-color), 0 -4px 16px rgba(26,58,92,0.06)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          61 Tracker · Built for CFIs · FAR Part 61
        </p>
      </footer>
    </div>
  );
}
