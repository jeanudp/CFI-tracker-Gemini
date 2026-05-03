import React, { useState, useEffect, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ArrowLeft,
  Plane,
  Loader2,
  Clock,
  X,
  AlertTriangle,
  Trash2,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface DatePickerDropdownProps {
  isOpen: boolean;
  pickerMonth: Date;
  selectedDate: Date;
  onPrevMonth: (e: React.MouseEvent) => void;
  onNextMonth: (e: React.MouseEvent) => void;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  getCalendarDays: () => (Date | null)[];
}

const DatePickerDropdown = memo(({
  isOpen,
  pickerMonth,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  onClose,
  getCalendarDays
}: DatePickerDropdownProps) => {
  if (!isOpen) return null;

  // Helper to check if a date is today (moved here or passed as prop, user didn't specify so I'll keep it simple or redefine)
  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[199]"
        onClick={onClose}
      />
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-4 rounded-2xl border shadow-xl z-[200]"
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={onPrevMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <ChevronLeft size={16} style={{ color: 'var(--text-primary)' }} />
          </button>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
            {pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={onNextMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <ChevronRight size={16} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-[9px] font-black" style={{ color: 'var(--text-muted)' }}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getCalendarDays().map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="h-7" />;
            
            const isActive = date.getTime() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
            const isCurrToday = isDateToday(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => onDateSelect(date)}
                className={cn(
                  "h-7 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer",
                  isActive 
                    ? "bg-[var(--navy)] text-white shadow-md" 
                    : "hover:bg-[var(--bg-tertiary)]"
                )}
                style={{ color: isActive ? 'white' : 'var(--text-primary)' }}
              >
                {date.getDate()}
                {isCurrToday && !isActive && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
});

export default function Schedule() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [scheduledLessons, setScheduledLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [modalData, setModalData] = useState({
    startTime: '08:00',
    studentName: '',
    duration: 1.9,
    notes: '',
    tailNumber: '',
    lessonType: 'Flight' as 'Ground' | 'Flight' | 'Sim'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggingLesson, setDraggingLesson] = useState<any>(null);
  const [dragOverHour, setDragOverHour] = useState<{ hour: number, tailNumber: string, segment: number } | null>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    
    // Theme check
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDate]);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const dateStr = selectedDate.toISOString().split('T')[0];

      // Fetch aircraft, students, and scheduled lessons in parallel
      const [aircraftRes, studentsRes, lessonsRes] = await Promise.all([
        supabase
          .from('saved_aircraft')
          .select('*')
          .eq('user_id', session.user.id)
          .order('last_used', { ascending: false }),
        supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .is('deleted_at', null)
          .order('name'),
        supabase
          .from('scheduled_lessons')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('date', dateStr)
      ]);

      setAircraft(aircraftRes.data || []);
      setStudents(studentsRes.data || []);
      setScheduledLessons(lessonsRes.data || []);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConflict = (startTime: string, duration: number, tailNumber: string, studentName: string, ignoreId?: string) => {
    const start = timeToDecimal(startTime);
    const end = start + duration;

    for (const lesson of scheduledLessons) {
      if (ignoreId && lesson.id === ignoreId) continue;

      const lStart = timeToDecimal(lesson.start_time);
      const lEnd = lStart + (lesson.duration_hours || 0);

      // Overlap condition
      const overlaps = (start < lEnd && end > lStart);
      
      if (overlaps) {
        if (lesson.tail_number === tailNumber) return 'aircraft';
        if (lesson.student_name === studentName) return 'student';
      }
    }
    
    return null;
  };

  const handleSaveLesson = async () => {
    if (!modalData.studentName) {
      setFormError('Please select a student');
      return;
    }

    if ((modalData.lessonType === 'Flight' || modalData.lessonType === 'Sim') && !modalData.tailNumber) {
      setFormError('Please select an aircraft');
      return;
    }

    const effectiveTail = modalData.lessonType === 'Ground' ? 'GROUND' : modalData.tailNumber;
    const conflict = checkConflict(modalData.startTime, modalData.duration, effectiveTail, modalData.studentName, editingLesson?.id);
    
    if (conflict === 'aircraft') {
      setFormError('This aircraft is already booked during this time.');
      return;
    }

    if (conflict === 'student') {
      setFormError('This student is already booked during this time.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const dateStr = selectedDate.toISOString().split('T')[0];
      const payload = {
        user_id: session.user.id,
        student_name: modalData.studentName,
        tail_number: modalData.lessonType === 'Ground' ? 'GROUND' : modalData.tailNumber,
        date: dateStr,
        start_time: modalData.startTime,
        duration_hours: modalData.duration,
        notes: modalData.notes,
        lesson_type: modalData.lessonType
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('scheduled_lessons')
          .update(payload)
          .eq('id', editingLesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scheduled_lessons')
          .insert([payload]);
        if (error) throw error;
      }

      await fetchScheduleData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setFormError('Failed to save lesson. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!editingLesson) return;
    if (!window.confirm('Are you sure you want to cancel this lesson?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_lessons')
        .delete()
        .eq('id', editingLesson.id);
      if (error) throw error;

      await fetchScheduleData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setFormError('Failed to delete lesson.');
    }
  };

  const openNewBooking = (hour: number, tailNumber: string) => {
    setEditingLesson(null);
    setFormError(null);
    setModalData({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      studentName: '',
      duration: 1.9,
      notes: '',
      tailNumber: tailNumber === 'GROUND' ? '' : tailNumber,
      lessonType: tailNumber === 'GROUND' ? 'Ground' : 'Flight'
    });
    setIsModalOpen(true);
  };

  const openEditBooking = (lesson: any) => {
    setEditingLesson(lesson);
    setFormError(null);
    setModalData({
      startTime: lesson.start_time,
      studentName: lesson.student_name,
      duration: lesson.duration_hours,
      notes: lesson.notes || '',
      tailNumber: lesson.tail_number === 'GROUND' ? '' : lesson.tail_number,
      lessonType: lesson.lesson_type || (lesson.tail_number === 'GROUND' ? 'Ground' : 'Flight')
    });
    setIsModalOpen(true);
  };

  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      ppl: '#2563eb',
      ir: '#7c3aed',
      cpl: '#059669',
      cfi: '#d97706',
      cfii: '#0d9488',
      mei: '#dc2626'
    };
    return colors[rating?.toLowerCase()] || '#9ca3af';
  };

  const timeToDecimal = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const decimalToTime = (decimal: number) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Helper to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formatDateLong = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateNav = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCalendarDays = () => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
  };

  const handleDragOver = (e: React.DragEvent, hour: number, tailNumber: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
    const segment = Math.floor(percentage * 6);
    setDragOverHour({ hour, tailNumber, segment });
  };

  const handleDrop = async (e: React.DragEvent, hour: number, tailNumber: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
    const segment = Math.floor(percentage * 6);
    const decimal = hour + (segment / 6);
    
    const lesson = draggingLesson;
    setDraggingLesson(null);
    setDragOverHour(null);

    if (!lesson) return;
    
    // If tail number changed or time changed
    const newStartTime = decimalToTime(decimal);
    if (lesson.start_time === newStartTime && lesson.tail_number === tailNumber) return;

    const conflict = checkConflict(newStartTime, lesson.duration_hours, tailNumber, lesson.student_name, lesson.id);
    if (conflict) {
      alert(conflict === 'aircraft' ? 'This aircraft is already booked during this time.' : 'This student is already booked during this time.');
      return;
    }

    let newLessonType = lesson.lesson_type;
    if (tailNumber === 'GROUND') {
      newLessonType = 'Ground';
    } else if (lesson.lesson_type === 'Ground') {
      newLessonType = 'Flight';
    }

    try {
      const { error } = await supabase
        .from('scheduled_lessons')
        .update({ 
          start_time: newStartTime,
          tail_number: tailNumber,
          lesson_type: newLessonType
        })
        .eq('id', lesson.id);
      
      if (error) throw error;
      fetchScheduleData();
    } catch (error) {
      console.error('Error moving lesson:', error);
      alert('Failed to move lesson.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .schedule-grid-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .schedule-grid-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .schedule-grid-scroll::-webkit-scrollbar-thumb {
          background: rgba(26, 58, 92, 0.3);
          border-radius: 4px;
        }
        .schedule-grid-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(26, 58, 92, 0.5);
        }
      ` }} />
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-4 sm:px-6 h-16 border-b flex items-center justify-between shrink-0 backdrop-blur-md transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 2px 12px rgba(26,58,92,0.08)' }}
      >
        <div className="flex items-center gap-3">
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: 'var(--navy)' }}>
                    {(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-[11px] font-bold max-w-[120px] truncate" style={{ color: 'var(--text-primary)' }}>
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                  <ChevronDown size={12} className={cn("transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isUserMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99]"
              onClick={() => setIsUserMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-16 right-4 w-52 rounded-2xl border overflow-hidden z-[100]"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 8px 32px rgba(26,58,92,0.15)' }}
            >
              <div className="px-4 py-3 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', position: 'relative', zIndex: 1 }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Signed in as</p>
                <p className="text-xs font-bold truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{user?.user_metadata?.full_name || user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/dashboard"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--bg-tertiary)] cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <LayoutDashboard size={14} style={{ color: 'var(--navy)' }} />
                  Dashboard
                </Link>
                <Link
                  to="/cfi-hours"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--bg-tertiary)] cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <User size={14} style={{ color: 'var(--navy)' }} />
                  CFI Profile
                </Link>
                <Link
                  to="/account"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--bg-tertiary)] cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Settings size={14} style={{ color: 'var(--navy)' }} />
                  Account
                </Link>
              </div>
              <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border transition-all"
                  style={{ backgroundColor: darkMode ? 'var(--navy)' : 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: darkMode ? 'white' : 'var(--text-secondary)' }}
                >
                  {darkMode ? <Moon size={12} /> : <Sun size={12} />}
                  <span className="text-[10px] font-bold">{darkMode ? 'On' : 'Off'}</span>
                </button>
              </div>
              <div className="py-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleSignOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-red-50 cursor-pointer"
                  style={{ color: '#c0392b' }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-6">

        {/* Date Navigation Bar */}
        <div 
          className="flex items-center justify-between p-2 rounded-2xl border mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrevDay}
              className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsDatePickerOpen(!isDatePickerOpen);
                  setPickerMonth(new Date(selectedDate));
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              >
                <Calendar size={14} style={{ color: 'var(--navy)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatDateNav(selectedDate)}
                </span>
                <ChevronDown size={12} className={cn("transition-transform duration-200", isDatePickerOpen && "rotate-180")} style={{ color: 'var(--text-muted)' }} />
              </button>

              <DatePickerDropdown 
                isOpen={isDatePickerOpen}
                pickerMonth={pickerMonth}
                selectedDate={selectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onDateSelect={handleDateSelect}
                onClose={() => setIsDatePickerOpen(false)}
                getCalendarDays={getCalendarDays}
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={handleToday}
              disabled={isToday(selectedDate)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isToday(selectedDate) 
                  ? "opacity-50 grayscale cursor-not-allowed" 
                  : "bg-[var(--navy)] text-white hover:shadow-md cursor-pointer"
              )}
            >
              Today
            </button>
            <button 
              onClick={handleNextDay}
              className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="relative border rounded-2xl overflow-hidden" 
             style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(26,58,92,0.1)' }}>
          <div className="overflow-x-auto schedule-grid-scroll scrollbar-thin">
            <div className="min-w-max">
              {/* Grid Header */}
              <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
                {/* Corner Cell */}
                <div className="w-48 sticky left-0 z-10 shrink-0 p-4 font-black text-[10px] uppercase tracking-[0.2em] border-r flex items-center gap-2"
                     style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  <Plane size={14} style={{ color: 'var(--navy)' }} />
                  Aircraft
                </div>
                {/* Hour Headers */}
                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                  <div key={hour} className="w-24 shrink-0 p-4 text-center border-r last:border-r-0 flex flex-col items-center justify-center gap-0.5"
                       style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-black" style={{ color: 'var(--text-primary)' }}>
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>
                      {hour < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ground Row */}
              <div className="flex border-b group/row" style={{ borderColor: 'var(--border-color)' }}>
                {/* Aircraft Cell */}
                <div className="w-48 sticky left-0 z-10 shrink-0 p-4 border-r flex flex-col justify-center gap-0.5 shadow-[2px_0_8px_rgba(0,0,0,0.02)]"
                     style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                  <span className="text-xs font-black" style={{ color: 'var(--navy)' }}>GROUND</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Instruction / Briefing</span>
                </div>
                
                {/* Timeline */}
                <div className="flex relative items-stretch h-24">
                  {/* Hour Grid Lines */}
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <div 
                      key={hour} 
                      className="w-24 border-r last:border-r-0 relative cursor-pointer"
                      style={{ borderColor: 'var(--border-color)' }}
                      onClick={() => openNewBooking(hour, 'GROUND')}
                      onDragOver={(e) => handleDragOver(e, hour, 'GROUND')}
                      onDrop={(e) => handleDrop(e, hour, 'GROUND')}
                    >
                      <div className={cn(
                        "absolute inset-0 transition-colors pointer-events-none",
                        dragOverHour?.hour === hour && dragOverHour?.tailNumber === 'GROUND'
                          ? ""
                          : "opacity-0 group-hover/row:bg-[var(--navy)]/[0.02]"
                      )}>
                        {dragOverHour?.hour === hour && dragOverHour?.tailNumber === 'GROUND' && (
                          <>
                            <div 
                              className="absolute top-0 bottom-0 bg-[var(--navy)]/15 border-x border-[var(--navy)]/10"
                              style={{ 
                                left: `${dragOverHour.segment * (100 / 6)}%`, 
                                width: `${100 / 6}%` 
                              }} 
                            />
                            {/* Drag Tooltip */}
                            {draggingLesson && (
                              <div 
                                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg z-[100] pointer-events-none"
                                style={{ 
                                  left: `${(dragOverHour.segment * (100 / 6)) + (100 / 12)}%` 
                                }}
                              >
                                {(() => {
                                  const start = hour + (dragOverHour.segment / 6);
                                  const end = start + draggingLesson.duration_hours;
                                  return `${decimalToTime(start)} – ${decimalToTime(end)}`;
                                })()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Lesson Blocks for Ground */}
                  {scheduledLessons
                    .filter(lesson => lesson.tail_number === 'GROUND')
                    .map(lesson => {
                      const startDecimal = timeToDecimal(lesson.start_time);
                      const student = students.find(s => s.name === lesson.student_name);
                      const rating = student?.current_rating || 'default';
                      const color = getRatingColor(rating);
                      const isDragging = draggingLesson?.id === lesson.id;
                      
                      return (
                        <div 
                          key={lesson.id}
                          draggable
                          onDragStart={() => setDraggingLesson(lesson)}
                          onDragEnd={() => {
                            setDraggingLesson(null);
                            setDragOverHour(null);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditBooking(lesson);
                          }}
                          className={cn(
                            "absolute top-2 bottom-2 rounded-lg p-2 shadow-sm flex flex-col justify-center overflow-hidden border border-white/20 select-none z-10 cursor-grab active:cursor-grabbing transition-all",
                            isDragging ? "opacity-40 scale-95" : "hover:brightness-110 active:scale-[0.98]"
                          )}
                          style={{ 
                            left: `${startDecimal * 96}px`, 
                            width: `${(lesson.duration_hours || 0) * 96}px`,
                            backgroundColor: color
                          }}
                        >
                          <span className="text-[10px] font-black leading-tight text-white truncate drop-shadow-sm">
                            {lesson.student_name}
                          </span>
                          <span className="text-[7px] font-black text-white/80 uppercase tracking-tighter mt-0.5">
                            GND
                          </span>
                          <div className="flex items-center gap-1 mt-0.5 opacity-90">
                            <Clock size={8} className="text-white" />
                            <span className="text-[8px] font-bold text-white tracking-wider">
                              {lesson.start_time?.substring(0, 5)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Grid Rows */}
              {loading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 size={32} style={{ color: 'var(--navy)' }} />
                  </motion.div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Synchronizing Schedule...</p>
                </div>
              ) : aircraft.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-3xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                    <Plane size={32} className="opacity-20" />
                  </div>
                  <h3 className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>No Aircraft Configured</h3>
                  <p className="text-xs font-bold max-w-[240px] mx-auto" style={{ color: 'var(--text-muted)' }}>
                    Add aircraft to your profile to begin scheduling lessons and tracking availability.
                  </p>
                </div>
              ) : (
                aircraft.map(ac => (
                  <div key={ac.id} className="flex border-b last:border-b-0 group/row" style={{ borderColor: 'var(--border-color)' }}>
                    {/* Aircraft Cell */}
                    <div className="w-48 sticky left-0 z-10 shrink-0 p-4 border-r flex flex-col justify-center gap-0.5 shadow-[2px_0_8px_rgba(0,0,0,0.02)]"
                         style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                      <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{ac.tail_number}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{ac.aircraft_model}</span>
                    </div>
                    
                    {/* Timeline */}
                    <div className="flex relative items-stretch h-24">
                      {/* Hour Grid Lines */}
                      {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                        <div 
                          key={hour} 
                          className="w-24 border-r last:border-r-0 relative cursor-pointer"
                          style={{ borderColor: 'var(--border-color)' }}
                          onClick={() => openNewBooking(hour, ac.tail_number)}
                          onDragOver={(e) => handleDragOver(e, hour, ac.tail_number)}
                          onDrop={(e) => handleDrop(e, hour, ac.tail_number)}
                        >
                          <div className={cn(
                            "absolute inset-0 transition-colors pointer-events-none",
                            dragOverHour?.hour === hour && dragOverHour?.tailNumber === ac.tail_number
                              ? ""
                              : "opacity-0 group-hover/row:bg-[var(--navy)]/[0.02]"
                          )}>
                            {dragOverHour?.hour === hour && dragOverHour?.tailNumber === ac.tail_number && (
                              <>
                                <div 
                                  className="absolute top-0 bottom-0 bg-[var(--navy)]/15 border-x border-[var(--navy)]/10"
                                  style={{ 
                                    left: `${dragOverHour.segment * (100 / 6)}%`, 
                                    width: `${100 / 6}%` 
                                  }} 
                                />
                                {/* Drag Tooltip */}
                                {draggingLesson && (
                                  <div 
                                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg z-[100] pointer-events-none"
                                    style={{ 
                                      left: `${(dragOverHour.segment * (100 / 6)) + (100 / 12)}%` 
                                    }}
                                  >
                                    {(() => {
                                      const start = hour + (dragOverHour.segment / 6);
                                      const end = start + draggingLesson.duration_hours;
                                      return `${decimalToTime(start)} – ${decimalToTime(end)}`;
                                    })()}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Lesson Blocks */}
                      {scheduledLessons
                        .filter(lesson => lesson.tail_number === ac.tail_number)
                        .map(lesson => {
                          const startDecimal = timeToDecimal(lesson.start_time);
                          const student = students.find(s => s.name === lesson.student_name);
                          const rating = student?.current_rating || 'default';
                          const color = getRatingColor(rating);
                          const isDragging = draggingLesson?.id === lesson.id;
                          
                          return (
                            <div 
                              key={lesson.id}
                              draggable
                              onDragStart={() => setDraggingLesson(lesson)}
                              onDragEnd={() => {
                                setDraggingLesson(null);
                                setDragOverHour(null);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditBooking(lesson);
                              }}
                              className={cn(
                                "absolute top-2 bottom-2 rounded-lg p-2 shadow-sm flex flex-col justify-center overflow-hidden border border-white/20 select-none z-10 cursor-grab active:cursor-grabbing transition-all",
                                isDragging ? "opacity-40 scale-95" : "hover:brightness-110 active:scale-[0.98]"
                              )}
                              style={{ 
                                left: `${startDecimal * 96}px`, 
                                width: `${(lesson.duration_hours || 0) * 96}px`,
                                backgroundColor: color
                              }}
                            >
                              <span className="text-[10px] font-black leading-tight text-white truncate drop-shadow-sm">
                                {lesson.student_name}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5 opacity-90">
                                <Clock size={8} className="text-white" />
                                <span className="text-[8px] font-bold text-white tracking-wider">
                                  {lesson.start_time?.substring(0, 5)}
                                </span>
                              </div>
                              <span className="text-[7px] font-black text-white/80 uppercase tracking-tighter mt-0.5">
                                {lesson.lesson_type === 'Ground' ? 'GND' : lesson.lesson_type === 'Sim' ? 'SIM' : 'FLT'}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-[var(--bg-secondary)] border rounded-3xl p-6 shadow-2xl overflow-hidden"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {editingLesson ? 'Edit Lesson' : 'Schedule Lesson'}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {(() => {
                    if (modalData.lessonType === 'Ground' || !modalData.tailNumber) {
                      return formatDateNav(selectedDate);
                    }
                    const matchedAircraft = aircraft.find(ac => ac.tail_number === modalData.tailNumber);
                    if (matchedAircraft) {
                      return `${modalData.tailNumber} (${matchedAircraft.aircraft_model}) • ${formatDateNav(selectedDate)}`;
                    }
                    return formatDateNav(selectedDate);
                  })()}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider text-center">
                  {formError}
                </div>
              )}

              {/* Lesson Type Selector */}
              <div className="mb-4">
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                  Lesson Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Ground', 'Flight', 'Sim'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setModalData({ ...modalData, lessonType: type as any, tailNumber: '' })}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                        modalData.lessonType === type 
                          ? "bg-[var(--navy)] text-white border-[var(--navy)] shadow-md" 
                          : "bg-[var(--bg-tertiary)]/50 text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Dropdown */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                  Select Student
                </label>
                <select 
                  className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  value={modalData.studentName}
                  onChange={(e) => setModalData({ ...modalData, studentName: e.target.value })}
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Aircraft Dropdown - Conditionally hidden */}
              {modalData.lessonType !== 'Ground' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                    Select Aircraft
                  </label>
                  <select 
                    className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={modalData.tailNumber}
                    onChange={(e) => setModalData({ ...modalData, tailNumber: e.target.value })}
                  >
                    <option value="">Choose an aircraft</option>
                    {aircraft.map(ac => (
                      <option key={ac.id} value={ac.tail_number}>{ac.tail_number} - {ac.model}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                    Start Time
                  </label>
                  <input 
                    type="time"
                    className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={modalData.startTime}
                    onChange={(e) => setModalData({ ...modalData, startTime: e.target.value })}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                    Duration (Hours)
                  </label>
                  <input 
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={modalData.duration}
                    onChange={(e) => setModalData({ ...modalData, duration: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* End Time Display */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                  End Time
                </label>
                <div 
                  className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 text-sm font-bold flex items-center"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', minHeight: '46px' }}
                >
                  {(() => {
                    if (!modalData.startTime || !modalData.duration || modalData.duration <= 0) return "-";
                    try {
                      const start = timeToDecimal(modalData.startTime);
                      const endVal = start + modalData.duration;
                      return decimalToTime(endVal);
                    } catch {
                      return "-";
                    }
                  })()}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                  Lesson Notes
                </label>
                <textarea 
                  className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold resize-none h-24"
                  placeholder="Learning objectives, items to cover..."
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  value={modalData.notes}
                  onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                {editingLesson && (
                  <button 
                    onClick={handleDeleteLesson}
                    className="flex-1 p-3 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Trash2 size={16} />
                    Cancel Lesson
                  </button>
                )}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-3 rounded-xl font-bold text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 transition-colors cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveLesson}
                  disabled={isSaving}
                  className="flex-[2] p-3 rounded-xl font-black text-sm bg-[var(--navy)] text-white hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : editingLesson ? 'Save Changes' : 'Schedule Lesson'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}    </div>
  );
}
