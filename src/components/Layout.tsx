import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Plane, LogOut, History as HistoryIcon, BookOpen, WifiOff, BarChart3, Moon, Sun, AlertTriangle, X, Send, Loader2, CheckCircle2, ChevronDown, Menu, User, Home, BookOpenCheck, Calendar, Lightbulb, Headset } from 'lucide-react';
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
  const [maydayTab, setMaydayTab] = useState<'bug' | 'idea'>('bug');
  const [navOpen, setNavOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setNavOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setNavOpen(false);
    setUserOpen(false);
  }, [path]);

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
          type: maydayTab,
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

  const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: <Home size={14} /> },
    { label: 'Schedule', path: '/schedule', icon: <Calendar size={14} /> },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email || 'CFI';
  const shortName = displayName.split(' ')[0];

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <header
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm px-3 sm:px-6 h-16 flex items-center justify-between shrink-0 transition-colors duration-300"
      >
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0 shrink-0">
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
              style={{ bottom: '-3px', left: 0, width: '100%', height: '3px', backgroundColor: '#e8a020' }}
            />
          </div>
          <div style={{ width: '2px', height: '30px', backgroundColor: '#e8a020', opacity: 0.3, borderRadius: '1px', flexShrink: 0 }} />
          <div className="flex flex-col justify-center gap-0.5">
            <span
              className="font-black uppercase leading-none"
              style={{ fontSize: '13px', color: 'var(--navy)', letterSpacing: '1.5px' }}
            >
              TRACKER
            </span>
            <span
              className="font-bold"
              style={{ fontSize: '7px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}
            >
              BUILT FOR CFI<span style={{ textTransform: 'none' }}>s</span>
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">

          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-bold text-red-500 uppercase tracking-widest">
              <WifiOff size={10} />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Mayday button — icon only */}
          <button
            onClick={() => setMaydayOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ 
              background: 'linear-gradient(to bottom right, rgba(232,160,32,0.12), rgba(220,38,38,0.12))', 
              borderColor: 'rgba(232,160,32,0.35)' 
            }}
            title="Report a problem"
          >
            <Headset 
              size={15} 
              style={{ 
                background: 'linear-gradient(to bottom right, #e8a020, #dc2626)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            />
          </button>

          {/* Navigation dropdown */}
          <div className="relative" ref={navRef}>
            <button
              onClick={() => { setNavOpen(!navOpen); setUserOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: navOpen ? 'var(--bg-tertiary)' : 'transparent' }}
            >
              <Menu size={14} />
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown size={12} className={cn("transition-transform", navOpen && "rotate-180")} />
            </button>

            {navOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-2xl border shadow-xl overflow-hidden z-50"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="p-1.5 space-y-0.5">
                  {NAV_ITEMS.map(item => {
                    const isActive = path === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all",
                          isActive
                            ? "text-white"
                            : "hover:bg-[var(--bg-tertiary)]"
                        )}
                        style={isActive ? { backgroundColor: 'var(--navy)', color: 'white' } : { color: 'var(--text-primary)' }}
                      >
                        <span style={isActive ? { color: '#e8a020' } : { color: 'var(--text-muted)' }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          {user && (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => { setUserOpen(!userOpen); setNavOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: userOpen ? 'var(--bg-tertiary)' : 'transparent' }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                  style={{ backgroundColor: 'var(--navy)' }}
                >
                  {shortName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{shortName}</span>
                <ChevronDown size={12} className={cn("transition-transform", userOpen && "rotate-180")} />
              </button>

              {userOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl border shadow-xl overflow-hidden z-50"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  {/* User info header */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <p className="text-[11px] font-black truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.user_metadata?.full_name || 'CFI'}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {user.email}
                    </p>
                  </div>

                  <div className="p-1.5 space-y-0.5">


                    {/* Dark mode toggle */}
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:bg-[var(--bg-tertiary)]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <div className="flex items-center gap-3">
                        {darkMode ? <Sun size={14} style={{ color: 'var(--text-muted)' }} /> : <Moon size={14} style={{ color: 'var(--text-muted)' }} />}
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </div>
                      <div
                        className={cn(
                          "w-8 h-4 rounded-full transition-colors relative",
                          darkMode ? "bg-[var(--navy)]" : "bg-[#dde3ec]"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform",
                            darkMode ? "translate-x-4" : "translate-x-0.5"
                          )}
                        />
                      </div>
                    </button>

                    <div className="h-px mx-3 my-1" style={{ backgroundColor: 'var(--border-color)' }} />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:bg-red-50 text-red-500"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto min-h-0">
        {children}
      </main>

      {/* Mayday Modal */}
      {maydayOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ 
              backgroundColor: maydayTab === 'bug' ? 'rgba(220,38,38,0.08)' : 'rgba(232,160,32,0.08)', 
              borderBottom: maydayTab === 'bug' ? '1px solid rgba(220,38,38,0.15)' : '1px solid rgba(232,160,32,0.15)' 
            }}>
              <div className="flex items-center gap-2">
                {maydayTab === 'bug' ? (
                  <AlertTriangle size={18} className="text-[#dc2626]" />
                ) : (
                  <Lightbulb size={18} className="text-[#e8a020]" />
                )}
                <div>
                  <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                    {maydayTab === 'bug' ? 'Report a Bug' : 'Share an Idea'}
                  </h3>
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

            {/* Tab Bar */}
            <div className="flex border-b" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => { setMaydayTab('bug'); setMaydayText(''); }}
                className="flex-1 py-3 flex items-center justify-center gap-2 text-[11px] font-bold transition-all"
                style={{
                  backgroundColor: maydayTab === 'bug' ? 'var(--bg-secondary)' : 'transparent',
                  color: maydayTab === 'bug' ? '#dc2626' : 'var(--text-muted)',
                  borderBottom: maydayTab === 'bug' ? '2px solid #dc2626' : '2px solid transparent'
                }}
              >
                <AlertTriangle size={13} />
                Report a Bug
              </button>
              <button
                onClick={() => { setMaydayTab('idea'); setMaydayText(''); }}
                className="flex-1 py-3 flex items-center justify-center gap-2 text-[11px] font-bold transition-all"
                style={{
                  backgroundColor: maydayTab === 'idea' ? 'var(--bg-secondary)' : 'transparent',
                  color: maydayTab === 'idea' ? '#e8a020' : 'var(--text-muted)',
                  borderBottom: maydayTab === 'idea' ? '2px solid #e8a020' : '2px solid transparent'
                }}
              >
                <Lightbulb size={13} />
                Share an Idea
              </button>
            </div>

            <div className="p-6 space-y-4">
              {maydayTab === 'bug' && (
                <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  📍 Page: {path}
                </div>
              )}
              <textarea
                value={maydayText}
                onChange={e => setMaydayText(e.target.value)}
                placeholder={maydayTab === 'bug' ? "Describe what went wrong — what you were doing, what you expected, what happened instead..." : "Tell us your idea for a feature or improvement..."}
                rows={5}
                autoFocus
                className="w-full text-sm rounded-xl px-4 py-3 border resize-none focus:outline-none transition-all"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = maydayTab === 'bug' ? '#dc2626' : '#e8a020'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Your feedback is sent directly to the 61 Tracker developer.
              </p>
            </div>
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
                style={{ 
                  backgroundColor: maydaySuccess ? '#2d7a4f' : (maydayTab === 'bug' ? '#dc2626' : '#e8a020'), 
                  boxShadow: maydaySuccess 
                    ? '0 4px 12px rgba(45,122,79,0.3)' 
                    : (maydayTab === 'bug' ? '0 4px 12px rgba(220,38,38,0.3)' : '0 4px 12px rgba(232,160,32,0.3)') 
                }}
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
