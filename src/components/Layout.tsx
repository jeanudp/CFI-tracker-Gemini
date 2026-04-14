import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Plane, LogOut, History as HistoryIcon, Users, BookOpen, Plus, ArrowLeft, ArrowRight, Wifi, WifiOff, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function Layout({ children, user }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [isOnline, setIsOnline] = useState(true);

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
    navigate('/auth');
  };

  const buttonClass = "text-[12px] text-white px-[12px] py-[6px] rounded-[6px] border border-white/25 bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 font-medium";

  return (
    <div className="min-h-screen bg-[#eef2f8] text-[#1c2333] flex flex-col font-sans">
      <header className="bg-[#1a3a5c] text-white px-6 h-16 flex items-center justify-between shadow-lg shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-[#1a3a5c] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                {/* Fuselage */}
                <ellipse cx="50" cy="50" rx="5" ry="38" />
                {/* Main wings */}
                <path d="M 50 45 Q 20 40 5 55 Q 20 52 50 52" />
                <path d="M 50 45 Q 80 40 95 55 Q 80 52 50 52" />
                {/* Horizontal stabilizer */}
                <path d="M 50 82 Q 35 80 28 86 Q 35 84 50 84" />
                <path d="M 50 82 Q 65 80 72 86 Q 65 84 50 84" />
                {/* Nose */}
                <path d="M 47 14 Q 50 10 53 14" />
                {/* Engine cowling */}
                <ellipse cx="50" cy="18" rx="4" ry="5" />
                {/* Propeller */}
                <line x1="50" y1="12" x2="50" y2="8" />
                <path d="M 44 10 Q 50 8 56 10" />
                {/* Windows */}
                <rect x="47" y="30" width="6" height="5" rx="1" />
                <rect x="47" y="37" width="6" height="4" rx="1" />
              </svg>
            </div>
            <div className="text-sm font-semibold">Part 61 Lesson Tracker</div>
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
            <span className="hidden lg:inline-block text-[10px] text-white/50 uppercase tracking-widest mr-2">
              {user.user_metadata?.full_name || user.email}
            </span>
          )}
          
          {/* Dynamic Navigation Buttons */}
          {path.startsWith('/student/') && (
            <Link to="/history" className={buttonClass}>
              <ArrowLeft size={14} />
              <span>Back to Student Progress</span>
            </Link>
          )}

          {path !== '/' && (
            <Link to="/" className={buttonClass}>
              <Users size={14} />
              <span>Home</span>
            </Link>
          )}

          <Link to="/cfi-hours" className={buttonClass}>
            <GraduationCap size={14} />
            <span>My Hours</span>
          </Link>

          {path === '/rating' && (
            <button onClick={handleSignOut} className={buttonClass}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}

          {path === '/lesson-type' && (
            <button onClick={handleSignOut} className={buttonClass}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}

          {path === '/ground' && (
            <>
              <Link to="/lesson-type" className={buttonClass}>
                <BookOpen size={14} />
                <span>Lesson Type</span>
              </Link>
              <Link to="/flight" className={buttonClass}>
                <Plane size={14} />
                <span>Flight</span>
              </Link>
              <Link to="/history" className={buttonClass}>
                <HistoryIcon size={14} />
                <span>Student Progress</span>
              </Link>
              <button onClick={handleSignOut} className={buttonClass}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          )}

          {path === '/flight' && (
            <>
              <Link to="/lesson-type" className={buttonClass}>
                <BookOpen size={14} />
                <span>Lesson Type</span>
              </Link>
              <Link to="/ground" className={buttonClass}>
                <BookOpen size={14} />
                <span>Ground</span>
              </Link>
              <Link to="/history" className={buttonClass}>
                <HistoryIcon size={14} />
                <span>Student Progress</span>
              </Link>
              <button onClick={handleSignOut} className={buttonClass}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          )}

          {path === '/history' && (
            <button onClick={handleSignOut} className={buttonClass}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}

          {(path === '/' || path.startsWith('/student/')) && (
            <button onClick={handleSignOut} className={buttonClass}>
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
