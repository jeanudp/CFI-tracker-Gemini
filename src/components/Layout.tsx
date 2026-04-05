import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Plane, LogOut, History as HistoryIcon, Users, BookOpen, Plus, ArrowLeft, ArrowRight, Wifi, WifiOff } from 'lucide-react';

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
            <div className="w-9 h-9 bg-[#e8a020] rounded-lg flex items-center justify-center text-[#1a3a5c] text-lg font-bold">
              🛩
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">ACS Lesson Tracker</div>
              <div className="text-[10px] opacity-70 uppercase tracking-wider mt-1 flex items-center gap-2">
                Private Pilot · Part 61
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isOnline ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-red-400 animate-pulse"
                )} />
              </div>
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
            <span className="hidden lg:inline-block text-[10px] text-white/50 uppercase tracking-widest mr-2">
              {user.user_metadata?.full_name || user.email}
            </span>
          )}
          
          {/* Dynamic Navigation Buttons */}
          {path !== '/' && (
            <Link to="/" className={buttonClass}>
              <Users size={14} />
              <span>Students</span>
            </Link>
          )}

          {path === '/rating' && (
            <button onClick={handleSignOut} className={buttonClass}>
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          )}

          {path === '/lesson-type' && (
            <>
              <Link to="/rating" className={buttonClass}>
                <Plane size={14} />
                <span>Rating</span>
              </Link>
              <button onClick={handleSignOut} className={buttonClass}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
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
                <span>History</span>
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
                <span>History</span>
              </Link>
              <button onClick={handleSignOut} className={buttonClass}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          )}

          {path === '/history' && (
            <>
              <Link to="/rating" className={buttonClass}>
                <Plus size={14} />
                <span>New Lesson</span>
              </Link>
              <button onClick={handleSignOut} className={buttonClass}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
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
