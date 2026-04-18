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
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Top bar with dark mode toggle */}
      <div
        className="flex justify-end px-6 py-4 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg border hover:bg-[var(--bg-tertiary)] transition-all"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
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
              }}
            >
              61
            </span>
            {/* Amber underline */}
            <div
              className="absolute rounded-full"
              style={{
                bottom: '-6px',
                left: 0,
                width: '100%',
                height: '5px',
                backgroundColor: '#e8a020',
                borderRadius: '3px',
              }}
            />
          </div>

          {/* Amber vertical divider */}
          <div
            className="self-stretch rounded-full"
            style={{
              width: '3px',
              backgroundColor: '#e8a020',
              opacity: 0.35,
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
            {/* Amber tagline accent */}
            <div
              style={{
                height: '2px',
                backgroundColor: '#e8a020',
                opacity: 0.25,
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
          <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
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
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 text-white font-bold rounded-2xl text-sm transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl flex items-center gap-2 justify-center cursor-pointer"
            style={{ backgroundColor: 'var(--navy)' }}
          >
            <Plane size={18} />
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-4 font-bold rounded-2xl text-sm border-2 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2 justify-center cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--navy)',
              borderColor: 'var(--border-color)'
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
              title: "Track Every Lesson",
              description: "Log ground and flight lessons with full ACS task grading. Ground and flight. Every rating."
            },
            {
              icon: <Award size={24} style={{ color: 'var(--amber)' }} />,
              title: "Manage Endorsements",
              description: "AC 61-65K endorsements built in. Know exactly which endorsements your student needs and when you gave them."
            },
            {
              icon: <CheckCircle2 size={24} style={{ color: 'var(--green)' }} />,
              title: "Checkride Ready",
              description: "Real time §61.109 hour tracking. The app tells you the moment your student meets every requirement."
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="rounded-2xl border p-6 text-left transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 1px 4px rgba(26,58,92,0.08)'
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer
        className="py-6 text-center border-t transition-colors duration-300"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          61 Tracker · Built for CFIs · FAR Part 61
        </p>
      </footer>
    </div>
  );
}