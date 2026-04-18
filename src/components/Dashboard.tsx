import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Student, Lesson, PassedRating } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ChevronRight, ChevronDown, Plane, History, Loader2, CheckCircle2, AlertCircle, Award, CheckCircle, X, Check, FileText, Cloud, Gauge, ClipboardList, Compass, Navigation, Archive, RotateCcw, Shield, XCircle, Phone, Mail, Calendar, Heart, Info, LogOut, Moon, Sun, WifiOff, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { ALL_ACS, RATINGS } from '../constants';
import NewStudentModal from './NewStudentModal';

const ratingConfig: Record<string, { bg: string, text: string, light: string, border: string, icon: any, label: string }> = {
  ppl:  { bg: '#1a3a5c', text: 'white', light: '#d4e8f5', border: '#1a3a5c', icon: Plane,        label: 'Private Pilot' },
  ir:   { bg: '#7c3aed', text: 'white', light: '#ede8f8', border: '#7c3aed', icon: Cloud,        label: 'Instrument Rating' },
  cpl:  { bg: '#2d7a4f', text: 'white', light: '#e4f5ec', border: '#2d7a4f', icon: Gauge,        label: 'Commercial Pilot' },
  cfi:  { bg: '#e67e22', text: 'white', light: '#fdf0e4', border: '#e67e22', icon: ClipboardList, label: 'CFI' },
  cfii: { bg: '#16a34a', text: 'white', light: '#e0f5f2', border: '#16a34a', icon: Compass,      label: 'CFII' },
  mei:  { bg: '#c0392b', text: 'white', light: '#fdecea', border: '#c0392b', icon: Navigation,   label: 'MEI' },
};

const CurrencyRow = ({ title, reference, isCurrent, isNotApplicable, classBadge, children, isExpanded, onToggle }: {
  title: string, reference: string, isCurrent: boolean, isNotApplicable?: boolean,
  classBadge?: 'ASEL' | 'AMEL', children: React.ReactNode, isExpanded: boolean, onToggle: () => void
}) => (
  <div className="flex flex-col">
    <button onClick={onToggle} className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          {classBadge && (
            <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter text-white", classBadge === 'AMEL' ? "bg-[#7c3aed]" : "bg-[var(--navy)]")}>
              {classBadge}
            </span>
          )}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{reference}</span>
      </div>
      <div className="flex items-center gap-3">
        {isNotApplicable ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>N/A</span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest" style={{ backgroundColor: isCurrent ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: isCurrent ? 'var(--green)' : 'var(--red)' }}>
            {isCurrent ? 'Current' : 'Not Current'}
          </span>
        )}
        <ChevronRight size={16} className={cn("transition-transform duration-200", isExpanded ? "rotate-90" : "rotate-0")} style={{ color: 'var(--text-secondary)' }} />
      </div>
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualHours, setManualHours] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [preSoloTestResult, setPreSoloTestResult] = useState<any>(null);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCheckrideConfirmOpen, setIsCheckrideConfirmOpen] = useState(false);
  const [isNextRatingModalOpen, setIsNextRatingModalOpen] = useState(false);
  const [isUndoConfirmOpen, setIsUndoConfirmOpen] = useState(false);
  const [processingCheckride, setProcessingCheckride] = useState(false);
  const [ratingToUndo, setRatingToUndo] = useState<PassedRating | null>(null);
  const [undoSuccess, setUndoSuccess] = useState<string | null>(null);
  const [selectedNextRating, setSelectedNextRating] = useState<string | null>(null);
  const [isCurrencyExpanded, setIsCurrencyExpanded] = useState(false);
  const [expandedCurrencyRow, setExpandedCurrencyRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('sb_selected_student');
    if (saved) fetchRecentLessons(saved);
  }, []);

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
      } catch { setIsOnline(false); }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const [studentsRes, archivedRes, lessonsRes, manualRes, endorsementsRes] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', session.user.id).is('deleted_at', null).order('name'),
        supabase.from('students').select('*').eq('user_id', session.user.id).not('deleted_at', 'is', null).order('deleted_at', { ascending: false }),
        supabase.from('lessons').select('*'),
        supabase.from('manual_hours').select('*'),
        supabase.from('endorsements').select('*'),
      ]);
      setStudents(studentsRes.data || []);
      setArchivedStudents(archivedRes.data || []);
      setLessons(lessonsRes.data || []);
      setManualHours(manualRes.data || []);
      setEndorsements(endorsementsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLessons = async (studentName: string) => {
    const { data } = await supabase.from('lessons').select('*').eq('student_name', studentName).order('saved_at', { ascending: false }).limit(1);
    setRecentLesson(data?.[0] || null);
  };

  const fetchTestResult = async (studentName: string) => {
    const { data } = await supabase.from('student_tests').select('*').eq('student_name', studentName).eq('test_type', 'pre_solo').order('created_at', { ascending: false }).limit(1).single();
    setPreSoloTestResult(data);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
    setUndoSuccess(null);
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: student.name }));
    fetchRecentLessons(student.name);
    fetchTestResult(student.name);
  };

  const handleStartLesson = () => {
    if (!selectedStudent) return;
    localStorage.removeItem('faa_ground_grades');
    localStorage.removeItem('faa_ground_notes');
    localStorage.removeItem('faa_flight_grades');
    localStorage.removeItem('faa_flight_notes');
    localStorage.removeItem('current_lesson_id');
    localStorage.setItem('sb_selected_student', selectedStudent.name);
    localStorage.setItem('selected_rating', JSON.stringify({ code: selectedStudent.current_rating || 'ppl', label: selectedStudent.current_rating_label || 'Private Pilot ASEL' }));
    localStorage.setItem('faa_student_info', JSON.stringify({ student: selectedStudent.name }));
    navigate('/lesson-type');
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Archive student ${studentName}?`)) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('students').update({ deleted_at: new Date().toISOString(), deleted_by: session.user.email }).eq('id', studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudent?.name === studentName) { setSelectedStudent(null); setIsDetailOpen(false); }
    fetchData();
  };

  const handleRestoreStudent = async (studentId: string) => {
    await supabase.from('students').update({ deleted_at: null, deleted_by: null }).eq('id', studentId);
    fetchData();
  };

  const handlePermanentDelete = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Permanently delete ${studentName} and ALL their data?`)) return;
    setProcessingCheckride(true);
    try {
      await supabase.from('manual_hours').delete().eq('student_name', studentName);
      await supabase.from('endorsements').delete().eq('student_name', studentName);
      await supabase.from('lessons').delete().eq('student_name', studentName);
      await supabase.from('students').delete().eq('id', studentId);
      fetchData();
    } catch (err: any) { window.alert(err.message); }
    finally { setProcessingCheckride(false); }
  };

  const handleCheckridePassed = async () => {
    if (!selectedStudent) return;
    setProcessingCheckride(true);
    try {
      const passedRating: PassedRating = { code: selectedStudent.current_rating, label: selectedStudent.current_rating_label, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
      const updatedHistory = [...(selectedStudent.checkride_passed_ratings || []), passedRating];
      await supabase.from('students').update({ checkride_passed_ratings: updatedHistory }).eq('id', selectedStudent.id);
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, checkride_passed_ratings: updatedHistory } : s));
      setSelectedStudent(prev => prev ? { ...prev, checkride_passed_ratings: updatedHistory } : null);
      setIsCheckrideConfirmOpen(false);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#1a3a5c', '#2d7a4f', '#e8a020', '#c0392b'] });
      setTimeout(() => { setSelectedNextRating(null); setIsNextRatingModalOpen(true); }, 3000);
    } catch (err) { console.error(err); }
    finally { setProcessingCheckride(false); }
  };

  const handleSelectNextRating = async (code: string) => {
    if (!selectedStudent) return;
    const rating = (RATINGS as any)[code];
    await supabase.from('students').update({ current_rating: code, current_rating_label: rating.label }).eq('id', selectedStudent.id);
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, current_rating: code, current_rating_label: rating.label } : s));
    setSelectedStudent(prev => prev ? { ...prev, current_rating: code, current_rating_label: rating.label } : null);
    setIsNextRatingModalOpen(false);
  };

  const handleUndoCheckride = async () => {
    if (!selectedStudent || !ratingToUndo) return;
    setProcessingCheckride(true);
    try {
      const updatedHistory = (selectedStudent.checkride_passed_ratings || []).filter(r => r.code !== ratingToUndo.code);
      await supabase.from('students').update({ checkride_passed_ratings: updatedHistory, current_rating: ratingToUndo.code, current_rating_label: ratingToUndo.label }).eq('id', selectedStudent.id);
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, checkride_passed_ratings: updatedHistory, current_rating: ratingToUndo.code, current_rating_label: ratingToUndo.label } : s));
      setSelectedStudent(prev => prev ? { ...prev, checkride_passed_ratings: updatedHistory, current_rating: ratingToUndo.code, current_rating_label: ratingToUndo.label } : null);
      setUndoSuccess(`Checkride pass undone. Student is back on ${ratingToUndo.label}`);
      setIsUndoConfirmOpen(false);
      setRatingToUndo(null);
    } catch (err) { console.error(err); }
    finally { setProcessingCheckride(false); }
  };

  const checkRequirements = (student: Student) => {
    const a1Given = endorsements.some(e => (e.endorsement_key === 'A1' || e.endorsement_key === 'A.1') && e.completed === true && e.student_name === student.name && e.rating?.toLowerCase() === student.current_rating?.toLowerCase());
    return { canPassCheckride: a1Given };
  };

  const getStudentStats = (name: string) => {
    const studentLessons = lessons.filter(l => l.student_name === name);
    let hrs = 0;
    studentLessons.forEach(l => { hrs += parseFloat(l.meta?.totalFlight || '0') || 0; });
    return {
      count: studentLessons.length,
      hrs: hrs.toFixed(1),
      groundCount: studentLessons.filter(l => l.type === 'ground').length,
      flightCount: studentLessons.filter(l => l.type === 'flight').length
    };
  };

  const getTaskName = (ratingCode: string, taskId: string) => {
    const [ai, ti] = taskId.split('_').map(Number);
    const areas = ALL_ACS[ratingCode] || ALL_ACS['ppl'];
    const task = areas[ai]?.tasks[ti];
    return task ? task.name : taskId;
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const ratingOrder = ['ppl', 'ir', 'cpl', 'cfi', 'cfii', 'mei'];
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const ratingDiff = ratingOrder.indexOf(a.current_rating) - ratingOrder.indexOf(b.current_rating);
    if (ratingDiff !== 0) return ratingDiff;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20 px-4 sm:px-6 h-16 border-b flex items-center justify-between shrink-0 backdrop-blur-md transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 2px 12px rgba(26,58,92,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--navy)' }}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <ellipse cx="50" cy="50" rx="5" ry="38" />
              <path d="M 50 45 Q 20 40 5 55 Q 20 52 50 52" />
              <path d="M 50 45 Q 80 40 95 55 Q 80 52 50 52" />
              <path d="M 50 82 Q 35 80 28 86 Q 35 84 50 84" />
              <path d="M 50 82 Q 65 80 72 86 Q 65 84 50 84" />
              <path d="M 47 14 Q 50 10 53 14" />
              <ellipse cx="50" cy="18" rx="4" ry="5" />
              <line x1="50" y1="12" x2="50" y2="8" />
              <path d="M 44 10 Q 50 8 56 10" />
              <rect x="47" y="30" width="6" height="5" rx="1" />
              <rect x="47" y="37" width="6" height="4" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black" style={{ color: 'var(--navy)' }}>61 Tracker</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>My Students</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest">
              <WifiOff size={10} />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}
          {user && (
            <Link
              to="/cfi-hours"
              className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
              title="My CFI Hours"
            >
              <BarChart3 size={12} />
              <span>{user.user_metadata?.full_name || user.email}</span>
            </Link>
          )}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border hover:bg-[var(--bg-tertiary)] transition-all"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setIsNewStudentOpen(true)}
            className="w-9 h-9 text-white rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            style={{ backgroundColor: 'var(--navy)' }}
            title="Add Student"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border hover:-translate-y-0.5 hover:shadow-md transition-all font-medium cursor-pointer"
            style={{ color: 'var(--navy)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3 sticky top-[64px] z-10 backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search students..."
          className="w-full text-sm border rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1a3a5c] transition-all"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-[#c0392b]" />
            <p className="text-sm text-[#c0392b]">{error}</p>
            <button onClick={fetchData} className="mt-4 text-xs font-bold text-[#1a3a5c] hover:underline cursor-pointer">Try Again</button>
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">👨‍✈️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchQuery ? 'No students found' : 'No students yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery ? 'Try a different search' : 'Tap the + button to add your first student'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsNewStudentOpen(true)}
                className="px-6 py-3 bg-[#1a3a5c] text-white font-bold rounded-xl text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
              >
                Add First Student
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {sortedStudents.map(student => {
              const config = ratingConfig[student.current_rating] || ratingConfig['ppl'];
              const initials = student.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
              const stats = getStudentStats(student.name);

              return (
                <motion.div
                  key={student.id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectStudent(student)}
                  className="relative rounded-2xl cursor-pointer overflow-hidden h-36 flex flex-col items-center justify-center gap-2 p-4"
                  style={{
                    background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg}dd 100%)`,
                    boxShadow: `0 4px 16px ${config.bg}40, 0 2px 6px ${config.bg}30`,
                  }}
                >
                  {/* Archive button */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteStudent(student.id, student.name); }}
                    className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    title="Archive Student"
                  >
                    <Archive size={13} className="text-white" />
                  </button>

                  {/* Info button */}
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedStudent(student); setIsInfoOpen(true); }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    title="Student Info"
                  >
                    <Info size={13} className="text-white" />
                  </button>

                  {/* Initials */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    {initials}
                  </div>

                  {/* Name */}
                  <div className="text-center">
                    <p className="text-xs font-black text-white leading-tight px-1 truncate w-full max-w-[120px]">
                      {student.name.split(' ')[0]}
                    </p>
                    {student.name.split(' ').length > 1 && (
                      <p className="text-[10px] font-bold text-white/70 leading-tight truncate w-full max-w-[120px]">
                        {student.name.split(' ').slice(1).join(' ')}
                      </p>
                    )}
                  </div>

                  {/* Rating badge */}
                  <div
                    className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    {student.current_rating.toUpperCase()}
                  </div>

                  {/* Hours pill */}
                  {parseFloat(stats.hrs) > 0 && (
                    <div
                      className="absolute bottom-2.5 left-2.5 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold"
                      style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.9)' }}
                    >
                      {stats.hrs}h
                    </div>
                  )}

                  {/* Shine */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)' }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Archived Students */}
        <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setArchivedExpanded(!archivedExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <Archive size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Archived Students ({archivedStudents.length})</span>
            </div>
            <ChevronRight size={14} className={cn("transition-transform", archivedExpanded && "rotate-90")} />
          </button>
          <AnimatePresence>
            {archivedExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {archivedStudents.length === 0 ? (
                  <p className="text-xs italic text-center py-4" style={{ color: 'var(--text-muted)' }}>No archived students.</p>
                ) : archivedStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between px-4 py-3 rounded-xl opacity-60 mb-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{student.name}</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Archived {formatDate(student.deleted_at!)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleRestoreStudent(student.id)} className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer" style={{ color: 'var(--green)' }}>
                        <RotateCcw size={13} />
                      </button>
                      <button onClick={() => handlePermanentDelete(student.id, student.name)} className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer" style={{ color: 'var(--red)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================
          STUDENT INFO POPUP
          ============================================ */}
      <AnimatePresence>
        {isInfoOpen && selectedStudent && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInfoOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden max-h-[80vh] flex flex-col"
              style={{ boxShadow: '0 -8px 40px rgba(26,58,92,0.15)' }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-[#dde3ec] rounded-full" />
              </div>
              <div
                className="px-6 py-4 flex items-center justify-between shrink-0"
                style={{ background: `linear-gradient(135deg, ${ratingConfig[selectedStudent.current_rating]?.bg || '#1a3a5c'} 0%, ${ratingConfig[selectedStudent.current_rating]?.bg || '#2a5a8c'}dd 100%)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
                    {selectedStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{selectedStudent.name}</h2>
                    <p className="text-xs text-white/70 font-bold">{selectedStudent.current_rating_label}</p>
                  </div>
                </div>
                <button onClick={() => setIsInfoOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {[
                  { icon: Phone, label: 'Phone', value: (selectedStudent as any).phone },
                  { icon: Mail, label: 'Email', value: (selectedStudent as any).email_address },
                  { icon: Calendar, label: 'Date of Birth', value: (selectedStudent as any).dob ? formatDate((selectedStudent as any).dob) : null },
                  { icon: FileText, label: 'Student Cert Number', value: (selectedStudent as any).student_cert_number },
                  { icon: Heart, label: 'Medical Class', value: (selectedStudent as any).medical_class },
                  { icon: Calendar, label: 'Medical Expiry', value: (selectedStudent as any).medical_expiry ? formatDate((selectedStudent as any).medical_expiry) : null },
                ].map(({ icon: Icon, label, value }) => (
                  value ? (
                    <div key={label} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <Icon size={14} style={{ color: 'var(--navy-light)' }} />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
                      </div>
                    </div>
                  ) : null
                ))}
                {(selectedStudent as any).notes && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{(selectedStudent as any).notes}</p>
                  </div>
                )}
                {!((selectedStudent as any).phone || (selectedStudent as any).email_address || (selectedStudent as any).notes) && (
                  <div className="py-8 text-center">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No info on file</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Create a new student to add details</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          STUDENT DETAIL SLIDE UP
          ============================================ */}
      <AnimatePresence>
        {isDetailOpen && selectedStudent && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-t-3xl overflow-hidden flex flex-col"
              style={{ maxHeight: '92vh', boxShadow: '0 -8px 40px rgba(26,58,92,0.2)' }}
            >
              <div className="flex justify-center pt-3 shrink-0">
                <div className="w-10 h-1 bg-[#dde3ec] rounded-full" />
              </div>
              <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white"
                    style={{ backgroundColor: ratingConfig[selectedStudent.current_rating]?.bg || '#1a3a5c' }}
                  >
                    {selectedStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{selectedStudent.name}</h2>
                    <p className="text-xs font-bold" style={{ color: 'var(--navy-light)' }}>{selectedStudent.current_rating_label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsDetailOpen(false); localStorage.setItem('sb_selected_student', selectedStudent.name); navigate('/history'); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--navy-light)' }}
                  >
                    History →
                  </button>
                  <button onClick={() => setIsDetailOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {selectedStudent.checkride_passed_ratings?.length ? (
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--navy-light)' }}>
                      <Award size={14} style={{ color: 'var(--amber)' }} />
                      Ratings Completed
                    </h3>
                    <div className="space-y-2">
                      {selectedStudent.checkride_passed_ratings.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.label}</span>
                            <button onClick={() => { setRatingToUndo(r); setIsUndoConfirmOpen(true); }} style={{ color: 'var(--text-secondary)' }} className="p-1 hover:text-[var(--red)] rounded transition-all cursor-pointer">
                              <History size={12} />
                            </button>
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }}>Passed {r.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {undoSuccess && (
                  <div className="border text-xs font-bold p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'var(--green)', color: 'var(--green)' }}>
                    <CheckCircle2 size={14} />
                    {undoSuccess}
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Latest Lesson</h3>
                  {recentLesson ? (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{recentLesson.label}</h4>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(recentLesson.saved_at).toLocaleDateString()} · {recentLesson.instructor}
                          </p>
                        </div>
                        {recentLesson.meta?.totalFlight && (
                          <span className="text-sm font-mono font-bold" style={{ color: 'var(--amber)' }}>{recentLesson.meta.totalFlight}h</span>
                        )}
                      </div>
                      {Object.values(recentLesson.grades || {}).filter(g => g === 'N').length > 0 ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--red)' }}>Focus Areas</p>
                          {Object.entries(recentLesson.grades || {}).filter(([_, g]) => g === 'N').slice(0, 3).map(([id]) => (
                            <div key={id} className="flex items-center gap-2 text-[11px]">
                              <span className="w-3 h-3 rounded-full bg-[#c0392b] text-white flex items-center justify-center text-[7px] font-bold shrink-0">N</span>
                              <span style={{ color: 'var(--text-primary)' }}>{getTaskName(recentLesson.meta?.rating_code || 'ppl', id)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--green)' }}>
                          <CheckCircle2 size={12} />
                          All tasks satisfactory
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>No lessons yet</p>
                    </div>
                  )}
                </div>

                {preSoloTestResult && (
                  <div className="flex items-center gap-2">
                    {preSoloTestResult.passed ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: 'var(--green)', borderColor: 'var(--green)' }}>
                        <CheckCircle2 size={12} strokeWidth={3} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pre-Solo Test Passed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: 'var(--red)', borderColor: 'var(--red)' }}>
                        <XCircle size={12} strokeWidth={3} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pre-Solo Test Failed</span>
                      </div>
                    )}
                  </div>
                )}

                {(() => {
                  const studentLessons = lessons.filter(l => l.student_name === selectedStudent.name);
                  const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                  const recentFlights = studentLessons.filter(l => l.type === 'flight' && new Date(l.saved_at) >= ninetyDaysAgo);
                  const aselFlights = recentFlights.filter(l => l.meta?.aircraftClass === 'ASEL');
                  const aselLandings = aselFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgDay || '0') || 0) + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                  const isDayCurrentASEL = aselLandings >= 3;
                  const hasEverLoggedASEL = studentLessons.some(l => l.meta?.aircraftClass === 'ASEL');
                  const recentIFR = studentLessons.filter(l => l.type === 'flight' && new Date(l.saved_at) >= sixMonthsAgo);
                  const totalApproaches = recentIFR.reduce((sum, l) => sum + (parseInt(l.meta?.approachCount || '0') || 0), 0);
                  const holdPerformed = recentIFR.some(l => l.meta?.holdPerformed === true);
                  const isIFRCurrent = totalApproaches >= 6 && holdPerformed;
                  const hasEverLoggedApproaches = studentLessons.some(l => (parseInt(l.meta?.approachCount || '0') || 0) > 0);
                  const allCurrent = (!hasEverLoggedASEL || isDayCurrentASEL) && (!hasEverLoggedApproaches || isIFRCurrent);
                  const noneCurrent = (hasEverLoggedASEL && !isDayCurrentASEL) && (hasEverLoggedApproaches && !isIFRCurrent);

                  return (
                    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }}>
                      <button
                        onClick={() => setIsCurrencyExpanded(!isCurrencyExpanded)}
                        className="w-full p-4 flex items-center justify-between transition-colors cursor-pointer"
                        style={{ backgroundColor: allCurrent ? 'rgba(74,222,128,0.1)' : noneCurrent ? 'rgba(239,68,68,0.1)' : 'rgba(232,160,32,0.1)' }}
                      >
                        <div className="flex items-center gap-3">
                          <Shield size={18} style={{ color: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }} />
                          <span className="text-sm font-bold" style={{ color: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }}>Currency Status</span>
                        </div>
                        <ChevronDown size={18} className={cn("transition-transform duration-200", isCurrencyExpanded && "rotate-180")} style={{ color: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }} />
                      </button>
                      <AnimatePresence>
                        {isCurrencyExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden divide-y" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                            {hasEverLoggedASEL && (
                              <CurrencyRow title="Passenger Currency Day" reference="§61.57(a)" isCurrent={isDayCurrentASEL} classBadge="ASEL" isExpanded={expandedCurrencyRow === 'day_asel'} onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'day_asel' ? null : 'day_asel')}>
                                <div className="p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                  <div className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-secondary)' }}>Landings (90 days)</span>
                                    <span className="font-mono font-bold" style={{ color: isDayCurrentASEL ? 'var(--green)' : 'var(--red)' }}>{aselLandings} / 3</span>
                                  </div>
                                </div>
                              </CurrencyRow>
                            )}
                            <CurrencyRow title="IFR Currency" reference="§61.57(c)" isCurrent={isIFRCurrent} isNotApplicable={!hasEverLoggedApproaches} isExpanded={expandedCurrencyRow === 'ifr'} onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'ifr' ? null : 'ifr')}>
                              <div className="p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--text-secondary)' }}>Approaches (6 months)</span>
                                  <span className="font-mono font-bold" style={{ color: totalApproaches >= 6 ? 'var(--green)' : 'var(--red)' }}>{totalApproaches} / 6</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--text-secondary)' }}>Holding performed</span>
                                  <span style={{ color: holdPerformed ? 'var(--green)' : 'var(--red)' }}>{holdPerformed ? 'Yes' : 'No'}</span>
                                </div>
                              </div>
                            </CurrencyRow>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {(() => {
                  const isPassed = selectedStudent.checkride_passed_ratings?.some(r => r.code === selectedStudent.current_rating);
                  if (isPassed) {
                    const passDate = selectedStudent.checkride_passed_ratings?.find(r => r.code === selectedStudent.current_rating)?.date;
                    return (
                      <div className="border-2 rounded-xl p-4 flex flex-col items-center gap-1" style={{ backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)', color: 'var(--green)' }}>
                        <div className="flex items-center gap-2 font-bold"><CheckCircle size={20} />Checkride Passed</div>
                        <div className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Completed on {passDate}</div>
                      </div>
                    );
                  }
                  const { canPassCheckride } = checkRequirements(selectedStudent);
                  return (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsCheckrideConfirmOpen(true)}
                        disabled={!canPassCheckride}
                        className={cn("w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer", canPassCheckride ? "bg-[#2d7a4f] text-white hover:bg-[#24633f] animate-pulse shadow-[0_0_15px_rgba(45,122,79,0.4)]" : "text-[var(--text-muted)] cursor-not-allowed border")}
                        style={!canPassCheckride ? { backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' } : {}}
                      >
                        <CheckCircle size={18} />
                        Checkride Passed
                      </button>
                      {!canPassCheckride && (
                        <p className="text-[10px] text-center font-medium" style={{ color: 'var(--text-secondary)' }}>Give A.1 endorsement in the Checkride tab to unlock.</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="px-6 py-4 border-t flex gap-3 shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <button
                  onClick={handleStartLesson}
                  className="flex-1 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                  style={{ backgroundColor: 'var(--navy)' }}
                >
                  <Plane size={18} />
                  Start New Lesson →
                </button>
                <Link
                  to={`/iacra/${encodeURIComponent(selectedStudent.name)}`}
                  className="px-4 py-3.5 font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--navy)', borderColor: 'rgba(26,58,92,0.2)' }}
                >
                  <FileText size={18} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          CHECKRIDE CONFIRM MODAL
          ============================================ */}
      <AnimatePresence>
        {isCheckrideConfirmOpen && selectedStudent && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="w-16 h-16 bg-[#e4f5ec] text-[#2d7a4f] rounded-full flex items-center justify-center mb-6 mx-auto"><Award size={32} /></div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Confirm Checkride Pass</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                You are about to record that <strong>{selectedStudent.name}</strong> has passed their <strong>{selectedStudent.current_rating_label}</strong> checkride.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsCheckrideConfirmOpen(false)} className="flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
                <button onClick={handleCheckridePassed} disabled={processingCheckride} className="flex-[2] py-3 bg-[#2d7a4f] text-white font-bold rounded-xl hover:bg-[#24633f] transition-all shadow-md disabled:opacity-50 cursor-pointer">
                  {processingCheckride ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Pass'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          UNDO CONFIRM MODAL
          ============================================ */}
      <AnimatePresence>
        {isUndoConfirmOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}><AlertCircle size={32} /></div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Undo Checkride Pass?</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to undo the checkride pass for <strong>{ratingToUndo?.label}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setIsUndoConfirmOpen(false)} className="flex-1 py-3 text-sm font-bold rounded-xl cursor-pointer" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
                <button onClick={handleUndoCheckride} disabled={processingCheckride} className="flex-[2] py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer" style={{ backgroundColor: 'var(--red)' }}>
                  {processingCheckride ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Undo Pass'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          NEXT RATING MODAL
          ============================================ */}
      <AnimatePresence>
        {isNextRatingModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
              style={{ boxShadow: '0 -8px 40px rgba(26,58,92,0.2)' }}
            >
              <div className="flex justify-center pt-3 sm:hidden"><div className="w-10 h-1 bg-[#dde3ec] rounded-full" /></div>
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h2 className="text-lg font-black" style={{ color: 'var(--navy-lighter)' }}>Checkride Passed! 🎉</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>What rating is {selectedStudent?.name} pursuing next?</p>
                </div>
                <button onClick={() => setIsNextRatingModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-tertiary)] cursor-pointer" style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(RATINGS).map(([code, rating]) => {
                    const isSelected = selectedNextRating === code;
                    const config = ratingConfig[code];
                    const Icon = config.icon;
                    return (
                      <motion.div key={code} whileHover={{ y: -3 }} onClick={() => setSelectedNextRating(code)}
                        className="relative rounded-2xl border-2 p-5 text-center cursor-pointer transition-all flex flex-col items-center gap-3"
                        style={{ backgroundColor: isSelected ? config.light : 'white', borderColor: isSelected ? config.border : 'var(--border-color)', boxShadow: isSelected ? `0 4px 16px ${config.bg}30` : '0 1px 4px rgba(26,58,92,0.06)' }}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: isSelected ? config.bg : config.light }}>
                          <Icon size={22} style={{ color: isSelected ? 'white' : config.bg }} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1a2333] leading-tight">{rating.label}</div>
                          <div className="text-[9px] text-[#6b7280] mt-0.5 opacity-70">{rating.acs}</div>
                        </div>
                        {isSelected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: config.bg }}><Check size={11} className="text-white" /></div>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <button onClick={() => setIsNextRatingModalOpen(false)} className="flex-1 py-4 text-sm font-bold rounded-2xl cursor-pointer" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Skip for now</button>
                <button onClick={() => selectedNextRating && handleSelectNextRating(selectedNextRating)} disabled={!selectedNextRating} className="flex-[2] py-4 text-white font-bold rounded-2xl transition-all shadow-lg disabled:opacity-50 cursor-pointer" style={{ backgroundColor: 'var(--navy)' }}>Confirm Next Rating</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Student Modal */}
      <NewStudentModal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        onStudentCreated={(student) => {
          setStudents(prev => [...prev, student].sort((a, b) => a.name.localeCompare(b.name)));
          handleSelectStudent(student);
        }}
      />
    </div>
  );
}