import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Plane, LogOut, History as HistoryIcon, BookOpen, WifiOff, BarChart3, Moon, Sun, AlertTriangle, X, Send, Loader2, CheckCircle2, ChevronDown, Menu, User, Home, BookOpenCheck, Calendar, Lightbulb, Headset, Search } from 'lucide-react';
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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [findStudentOpen, setFindStudentOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Schedulable student states
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForActions, setSelectedStudentForActions] = useState<any | null>(null);

  useEffect(() => {
    if (findStudentOpen) {
      const fetchStudents = async () => {
        setLoadingStudents(true);
        setStudentError(null);
        try {
          const { data, error } = await supabase.rpc('get_schedulable_students');
          if (error) throw error;
          setStudents(data || []);
        } catch (err: any) {
          console.error("Error loading schedulable students:", err);
          setStudentError('Failed to load students');
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [findStudentOpen]);

  const handleHistoryAction = (student: any) => {
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('sb_selected_student_id', student.id);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: student.name }));
    setFindStudentOpen(false);
    setSelectedStudentForActions(null);
    setSearchQuery('');
    navigate('/history');
  };

  const handleLogLessonAction = (student: any) => {
    localStorage.removeItem('faa_ground_grades');
    localStorage.removeItem('faa_ground_notes');
    localStorage.removeItem('faa_flight_grades');
    localStorage.removeItem('faa_flight_notes');
    localStorage.removeItem('current_lesson_id');
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('sb_selected_student_id', student.id);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: student.name }));
    
    const ratingCode = student.current_rating || student.currentRating || student.rating || 'ppl';
    const ratingLabel = student.current_rating_label || student.currentRatingLabel || student.rating_label || 'Private Pilot ASEL';
    
    localStorage.setItem('selected_rating', JSON.stringify({
      code: ratingCode,
      label: ratingLabel,
    }));
    setFindStudentOpen(false);
    setSelectedStudentForActions(null);
    setSearchQuery('');
    navigate('/lesson-type');
  };

  const handleScheduleAction = (student: any) => {
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('sb_selected_student_id', student.id);
    setFindStudentOpen(false);
    setSelectedStudentForActions(null);
    setSearchQuery('');
    navigate(`/schedule?new=1&studentId=${student.id}`);
  };

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
      if (scheduleRef.current && !scheduleRef.current.contains(e.target as Node)) setScheduleOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setNavOpen(false);
    setUserOpen(false);
    setScheduleOpen(false);
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
  ];

  const displayName = user?.user_metadata?.full_name || user?.email || 'CFI';
  const shortName = displayName.split(' ')[0];



  return (
    <div
      className="min-h-screen flex flex-col font-sans overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <header
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm px-3 sm:px-6 h-16 flex items-center justify-between shrink-0 transition-colors duration-300"
      >
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity min-w-0 shrink-0">
          <div className="relative">
            <span
              className="block font-black leading-none select-none text-[26px] sm:text-[34px]"
              style={{
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
          <div className="hidden sm:block" style={{ width: '2px', height: '30px', backgroundColor: '#e8a020', opacity: 0.3, borderRadius: '1px', flexShrink: 0 }} />
          <div className="flex flex-col justify-center gap-0.5">
            <span
              className="font-black uppercase leading-none text-[11px] sm:text-[13px]"
              style={{ color: 'var(--navy)', letterSpacing: '1.5px' }}
            >
              TRACKER
            </span>
            <span
              className="font-bold hidden sm:inline"
              style={{ fontSize: '7px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}
            >
              BUILT FOR CFI<span style={{ textTransform: 'none' }}>s</span>
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">

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
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ 
              background: 'var(--navy)'
            }}
            title="Report a problem"
          >
            <Headset size={15} color="white" />
          </button>

          {/* Dark mode toggle — icon only */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ 
              background: 'var(--navy)'
            }}
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={15} color="white" /> : <Moon size={15} color="white" />}
          </button>

          {/* Schedule dropdown */}
          <div className="relative" ref={scheduleRef}>
            <button
              onClick={() => { setScheduleOpen(!scheduleOpen); setNavOpen(false); setUserOpen(false); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: scheduleOpen ? 'var(--bg-tertiary)' : 'transparent' }}
            >
              <Calendar size={14} />
              <span className="hidden sm:inline">Schedule</span>
              <ChevronDown size={12} className={cn("transition-transform", scheduleOpen && "rotate-180")} />
            </button>

            {scheduleOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-2xl border shadow-xl overflow-hidden z-50"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="p-1.5 space-y-0.5">
                  <Link
                    to="/schedule"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[var(--bg-tertiary)] transition-all"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    Open Schedule
                  </Link>
                  <Link
                    to="/schedule?new=1"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[var(--bg-tertiary)] transition-all"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <BookOpenCheck size={14} style={{ color: 'var(--text-muted)' }} />
                    New Booking
                  </Link>
                  <button
                    onClick={() => {
                      setScheduleOpen(false);
                      setFindStudentOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[var(--bg-tertiary)] transition-all text-left"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                    Find a Student
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation dropdown */}
          <div className="relative" ref={navRef}>
            <button
              onClick={() => { setNavOpen(!navOpen); setUserOpen(false); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-md"
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
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg border text-[11px] font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
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

      <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
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

      {/* Find a Student Modal */}
      {findStudentOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => { setFindStudentOpen(false); setSelectedStudentForActions(null); setSearchQuery(''); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <Search size={18} className="text-[#e8a020]" />
                <div>
                  <h3 className="text-sm font-black text-[var(--navy)]" style={{ color: 'var(--text-primary)' }}>
                    Find a Student
                  </h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Search and trigger quick actions for any schedulable student</p>
                </div>
              </div>
              <button
                onClick={() => { setFindStudentOpen(false); setSelectedStudentForActions(null); setSearchQuery(''); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b bg-[var(--bg-tertiary)]/30" style={{ borderColor: 'var(--border-color)' }}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-muted)]">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Type student name to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-sm rounded-xl pl-10 pr-4 py-2.5 border focus:outline-none transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingStudents ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--text-muted)]">
                  <Loader2 size={24} className="animate-spin text-[#e8a020]" />
                  <p className="text-xs font-semibold">Loading schedulable students...</p>
                </div>
              ) : studentError ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-red-500">
                  <AlertTriangle size={24} />
                  <p className="text-xs font-semibold">{studentError}</p>
                </div>
              ) : (() => {
                const filtered = students.filter(s => 
                  (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] text-center">
                      <p className="text-sm font-bold">No students found</p>
                      <p className="text-xs max-w-xs mt-1">Try another search term or verify you have schedulable students.</p>
                    </div>
                  );
                }

                return filtered.map(s => {
                  const isSchool = s.is_school_student || s.isSchoolStudent || s.is_school || s.isSchool;
                  const cfiName = s.assigned_cfi_name || s.assignedCfiName || s.cfi_name;
                  const isSelected = selectedStudentForActions?.id === s.id;

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm",
                        isSelected 
                          ? "border-[#e8a020] bg-[rgba(232,160,32,0.05)]" 
                          : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]/40"
                      )}
                      onClick={() => {
                        setSelectedStudentForActions(isSelected ? null : s);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                          {isSchool && (
                            <span 
                              className="text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase text-white"
                              style={{ backgroundColor: 'var(--navy)' }}
                            >
                              {cfiName ? `CFI: ${cfiName}` : 'School'}
                            </span>
                          )}
                        </div>
                        <ChevronDown 
                          size={16} 
                          className={cn("transition-transform text-[var(--text-muted)]", isSelected && "rotate-180")} 
                        />
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex flex-wrap gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleHistoryAction(s)}
                            className="px-3.5 py-1.5 bg-[var(--navy)] text-white text-xs font-black rounded-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                          >
                            <HistoryIcon size={12} />
                            History
                          </button>
                          <button
                            onClick={() => handleLogLessonAction(s)}
                            className="px-3.5 py-1.5 bg-[#22c55e] text-white text-xs font-black rounded-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                          >
                            <BookOpenCheck size={12} />
                            Log Lesson
                          </button>
                          <button
                            onClick={() => handleScheduleAction(s)}
                            className="px-3.5 py-1.5 text-white text-xs font-black rounded-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                            style={{ backgroundColor: '#e8a020' }}
                          >
                            <Calendar size={12} />
                            Schedule
                          </button>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
