import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Plane, LogOut, History as HistoryIcon, Users, BookOpen, Plus, ArrowLeft, ArrowRight, Wifi, WifiOff, GraduationCap, BarChart3, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function Layout({ children, user }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [isOnline, setIsOnline] = useState(true);

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
    </div>
  );
}
