import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Plane, LogOut, History as HistoryIcon, Users, BookOpen, Plus, ArrowLeft, ArrowRight, Wifi, WifiOff, GraduationCap, BarChart3, Moon, Sun, AlertTriangle, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function Layout({ children, user }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [isOnline, setIsOnline] = useState(true);
  const [maydayOpen, setMaydayOpen] = useState(false);
  const [maydayText, setMaydayText] = useState('');
  const [maydaySending, setMaydaySending] = useState(false);
  const [maydaySuccess, setMaydaySuccess] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { error } = await supabase.from('students').select('id').limit(1);
        setIsOnline(!error || error.message !== 'Failed to fetch');
      } catch (err) {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleMaydaySend = async () => {
    if (!maydayText.trim()) return;
    setMaydaySending(true);
    setMaydaySuccess(false);
    try {
      await emailjs.send(
        'service_nka0c1g',
        'template_zegp5ps',
        {
          page: path,
          user_email: user?.email || 'unknown',
          date: new Date().toLocaleString(),
          message: maydayText,
        },
        'mFm3-Cne6LHV8dZOJ'
      );
      setMaydaySuccess(true);
      setMaydayText('');
      setTimeout(() => {
        setMaydayOpen(false);
        setMaydaySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Mayday send failed:', err);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setMaydaySending(false);
    }
  };

  const buttonClass = "text-[12px] px-[12px] py-[6px] rounded-[6px] border hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 flex items-center gap-2 font-medium";

  return (
    <div 
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <header 
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm px-6 h-16 flex items-center justify-between shrink-0 transition-colors duration-300"
      >
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {/* 61 numeral mark */}
            <div className="relative">
              <span
                className="block font-black leading-none select-none"
                style={{
                  fontSize: '34px',
                  color: 'var(--navy)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-1.5px',
                  lineHeight: 1,
                }}
              >
                61
              </span>
              <div
                className="absolute rounded-full"
                style={{
                  bottom: '-3px',
                  left: 0,
                  width: '100%',
                  height: '3px',
                  backgroundColor: '#e8a020',
                }}
              />
            </div>

            {/* Amber divider */}
            <div
              style={{
                width: '2px',
                height: '30px',
                backgroundColor: '#e8a020',
                opacity: 0.3,
                borderRadius: '1px',
                flexShrink: 0,
              }}
            />

            {/* TRACKER + subtitle */}
            <div className="flex flex-col justify-center gap-0.5">
              <span
                className="font-black uppercase leading-none"
                style={{
                  fontSize: '13px',
                  color: 'var(--navy)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '1.5px',
                }}
              >
                TRACKER
              </span>
              <span
                className="font-bold"
                style={{
                  fontSize: '7px',
                  color: 'var(--text-muted)',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                BUILT FOR CFI<span style={{ textTransform: 'none' }}>s</span>
              </span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* Mayday Button */}
          <button
            onClick={() => setMaydayOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-md border"
            style={{
              backgroundColor: 'rgba(220,38,38,0.08)',
              borderColor: 'rgba(220,38,38,0.25)',
              color: '#dc2626',
            }}
            title="Report a problem"
          >
            <AlertTriangle size={13} />
            <span className="hidden sm:inline">Mayday</span>
          </button>
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-bold text-red-100 uppercase tracking-widest mr-4">
              <WifiOff size={10} />
              Offline
            </div>
          )}
          {user && (
            <div className="flex items-center gap-3">
              <Link 
                to="/cfi-hours" 
                title="My Hours"
                style={{ color: 'var(--text-primary)' }}
                className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                <BarChart3 size={12} />
                <span>{user.user_metadata?.full_name || user.email}</span>
              </Link>
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                className="p-2 rounded-lg border hover:bg-[var(--bg-tertiary)] transition-all"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          )}
          
          {/* Dynamic Navigation Buttons */}
          {path.startsWith('/student/') && (
            <Link to="/history" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
              <ArrowLeft size={14} />
              <span>Back to Student Progress</span>
            </Link>
          )}

          {path !== '/dashboard' && (
            <Link to="/dashboard" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
              <Users size={14} />
              <span>Home</span>
            </Link>
          )}

          {path === '/rating' && (
            <button onClick={handleSignOut} className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}

          {path === '/lesson-type' && (
            <button onClick={handleSignOut} className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}

          {path === '/ground' && (
            <>
              <Link to="/lesson-type" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <BookOpen size={14} />
                <span>Lesson Type</span>
              </Link>
              <Link to="/flight" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <Plane size={14} />
                <span>Flight</span>
              </Link>
              <Link to="/history" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <HistoryIcon size={14} />
                <span>Student Progress</span>
              </Link>
              <button onClick={handleSignOut} className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          )}

          {path === '/flight' && (
            <>
              <Link to="/lesson-type" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <BookOpen size={14} />
                <span>Lesson Type</span>
              </Link>
              <Link to="/ground" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <BookOpen size={14} />
                <span>Ground</span>
              </Link>
              <Link to="/history" className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <HistoryIcon size={14} />
                <span>Student Progress</span>
              </Link>
              <button onClick={handleSignOut} className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          )}

          {path === '/history' && (
            <button onClick={handleSignOut} className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}

          {(path === '/dashboard' || path.startsWith('/student/')) && (
            <button onClick={handleSignOut} className={buttonClass} style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Mayday Modal */}
      {maydayOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(220,38,38,0.08)', borderBottom: '1px solid rgba(220,38,38,0.15)' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#dc2626]" />
                <div>
                  <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Mayday — Report a Problem</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Your feedback goes directly to the developer</p>
                </div>
              </div>
              <button
                onClick={() => { setMaydayOpen(false); setMaydayText(''); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                📍 Page: {path}
              </div>
              <textarea
                value={maydayText}
                onChange={e => setMaydayText(e.target.value)}
                placeholder="Describe what went wrong — what you were doing, what you expected, what happened instead..."
                rows={5}
                autoFocus
                className="w-full text-sm rounded-xl px-4 py-3 border resize-none focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = '#dc2626'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Your feedback is sent directly to the 61 Tracker developer.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <button
                onClick={() => { setMaydayOpen(false); setMaydayText(''); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleMaydaySend}
                disabled={!maydayText.trim() || maydaySending || maydaySuccess}
                className="flex-[2] py-2.5 rounded-xl text-xs font-black text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: maydaySuccess ? '#2d7a4f' : '#dc2626', boxShadow: maydaySuccess ? '0 4px 12px rgba(45,122,79,0.3)' : '0 4px 12px rgba(220,38,38,0.3)' }}
              >
                {maydaySending ? <Loader2 size={13} className="animate-spin" /> : maydaySuccess ? <CheckCircle2 size={13} /> : <Send size={13} />}
                {maydaySending ? 'Sending...' : maydaySuccess ? 'Sent!' : 'Send to Developer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
