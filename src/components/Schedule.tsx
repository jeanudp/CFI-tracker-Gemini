import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
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
  Plus, 
  Shield, 
  Mail, 
  Check,
  Send,
  CheckCircle2,
  Lightbulb,
  Headset
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { AIRCRAFT_MODELS, isAMEL } from '../constants/aircraft';

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
    duration: 2,
    notes: '',
    tailNumber: '',
    lessonType: 'Flight' as 'Ground' | 'Flight' | 'Sim'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggingLesson, setDraggingLesson] = useState<any>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOverHour, setDragOverHour] = useState<{ hour: number, minute: number, tailNumber: string } | null>(null);
  const [draggingRequest, setDraggingRequest] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [schoolmatesBusy, setSchoolmatesBusy] = useState<any[]>([]);
  const [isPendingPanelOpen, setIsPendingPanelOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [suggestedTime, setSuggestedTime] = useState<string | null>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictSuggestion, setConflictSuggestion] = useState<{ suggestedTime: string, suggestedTail: string, lesson: any } | null>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isAddAircraftOpen, setIsAddAircraftOpen] = useState(false);
  const [newAircraft, setNewAircraft] = useState({ tailNumber: '', aircraftModel: '' });
  const [isAddingAircraft, setIsAddingAircraft] = useState(false);
  const [maydayOpen, setMaydayOpen] = useState(false);
  const [maydayText, setMaydayText] = useState('');
  const [maydaySending, setMaydaySending] = useState(false);
  const [maydaySuccess, setMaydaySuccess] = useState(false);
  const [maydayTab, setMaydayTab] = useState<'bug' | 'idea'>('bug');
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const aircraftSearchRef = useRef<HTMLDivElement>(null);
  const [scheduleAircraftSearch, setScheduleAircraftSearch] = useState('');
  const [showScheduleAircraftDropdown, setShowScheduleAircraftDropdown] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState<any[]>([]);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [notificationResults, setNotificationResults] = useState<{
    total: number;
    notifiedNames: string[];
    noEmailNames: string[];
    failedNames: string[];
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setIsTimePickerOpen(false);
      }
      if (aircraftSearchRef.current && !aircraftSearchRef.current.contains(event.target as Node)) {
        setShowScheduleAircraftDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    
    // Theme check
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    const showRequests = params.get('showRequests');

    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }

    if (showRequests === 'true') {
      setIsPendingPanelOpen(true);
    }

    if (dateParam || showRequests) {
      window.history.replaceState({}, '', window.location.pathname);
    }
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
          page: '/schedule',
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
      window.alert('Failed to send feedback. Please try again.');
    } finally {
      setMaydaySending(false);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      if (isToday(selectedDate)) {
        const currentHour = new Date().getHours();
        const scrollPos = Math.max(0, (currentHour - 1) * 96);
        scrollContainerRef.current.scrollLeft = scrollPos;
      } else {
        scrollContainerRef.current.scrollLeft = 6 * 96;
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDate]);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const localYearComp = selectedDate.getFullYear();
      const localMonthComp = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const localDayComp = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${localYearComp}-${localMonthComp}-${localDayComp}`;

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

      const sortedAircraft = (aircraftRes.data || []).sort((a: any, b: any) => {
        if (a.aircraft_model < b.aircraft_model) return -1;
        if (a.aircraft_model > b.aircraft_model) return 1;

        const tailA = a.tail_number.startsWith('N') ? a.tail_number.substring(1) : a.tail_number;
        const tailB = b.tail_number.startsWith('N') ? b.tail_number.substring(1) : b.tail_number;

        const startsDigitA = /^\d/.test(tailA);
        const startsDigitB = /^\d/.test(tailB);

        if (startsDigitA && !startsDigitB) return -1;
        if (!startsDigitA && startsDigitB) return 1;

        const allNumericA = /^\d+$/.test(tailA);
        const allNumericB = /^\d+$/.test(tailB);

        if (allNumericA && allNumericB) {
          return parseInt(tailA, 10) - parseInt(tailB, 10);
        }

        return tailA.localeCompare(tailB);
      });

      setAircraft(sortedAircraft);
      setStudents(studentsRes.data || []);
      setScheduledLessons(lessonsRes.data || []);

      // Fetch pending requests
      const { data: requestsData } = await supabase
        .from('lesson_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });
      setPendingRequests(requestsData || []);

      // Fetch schoolmates' busy blocks
      try {
        const { data: schoolBusyData, error: schoolBusyError } = await supabase.rpc('get_school_busy_blocks', {
          p_date: dateStr
        });
        if (schoolBusyError) {
          console.error('Error fetching school busy blocks:', schoolBusyError);
          setSchoolmatesBusy([]);
        } else {
          setSchoolmatesBusy(schoolBusyData || []);
        }
      } catch (err) {
        console.error('Exception fetching school busy blocks:', err);
        setSchoolmatesBusy([]);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConflict = (startTime: string, duration: number, ignoreId?: string) => {
    const start = timeToDecimal(startTime);
    const end = start + duration;

    for (const lesson of scheduledLessons) {
      if (ignoreId && lesson.id === ignoreId) continue;

      const lStart = timeToDecimal(lesson.start_time);
      const lEnd = lStart + (lesson.duration_hours || 0);

      // Overlap condition
      if (start < lEnd && end > lStart) {
        return 'overlap';
      }
    }
    
    return null;
  };

  const findNextAvailableSlot = (requestedStartTime: string, duration: number, ignoreId?: string) => {
    let [hours, mins] = requestedStartTime.split(':').map(Number);
    let currentMinutes = hours * 60 + mins;

    while (currentMinutes <= 1430) { // 23:50 = 1430 mins
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const checkStart = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      
      const conflict = checkConflict(checkStart, duration, ignoreId);
      if (!conflict) {
        return checkStart;
      }
      currentMinutes += 10;
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
    const conflict = checkConflict(modalData.startTime, modalData.duration, editingLesson?.id);
    
    if (conflict === 'overlap') {
      const nextSlot = findNextAvailableSlot(modalData.startTime, modalData.duration, editingLesson?.id);
      if (nextSlot) {
        setSuggestedTime(nextSlot);
        setFormError(`Conflict detected. Next available slot is ${nextSlot.substring(0, 5)} — use it?`);
      } else {
        setFormError('This time slot conflicts with an existing lesson.');
      }
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSuggestedTime(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const localYearComp = selectedDate.getFullYear();
      const localMonthComp = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const localDayComp = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${localYearComp}-${localMonthComp}-${localDayComp}`;
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
        
        // Queue notification about reschedule
        setPendingNotifications(prev => {
          const existing = prev.find(n => n.studentName === payload.student_name);
          const trueOriginalDate = existing ? existing.originalDate : editingLesson.date;
          const trueOriginalTime = existing ? existing.originalTime : editingLesson.start_time?.substring(0, 5);

          // If current state matches the true original state, remove notification
          if (payload.date === trueOriginalDate && payload.start_time === trueOriginalTime) {
            return prev.filter(n => n.studentName !== payload.student_name);
          }

          const filtered = prev.filter(n => n.studentName !== payload.student_name);
          return [...filtered, {
            studentName: payload.student_name,
            changeType: 'rescheduled',
            originalDate: trueOriginalDate,
            originalTime: trueOriginalTime,
            newDate: payload.date,
            newTime: payload.start_time,
            userId: user?.id
          }];
        });
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
      
      // Queue notification about cancellation
      setPendingNotifications(prev => {
        const filtered = prev.filter(n => n.studentName !== editingLesson.student_name);
        return [...filtered, {
          studentName: editingLesson.student_name,
          changeType: 'cancelled',
          originalDate: editingLesson.date,
          originalTime: editingLesson.start_time?.substring(0, 5),
          userId: user?.id
        }];
      });
      
      console.log("Lesson deleted successfully");

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
    setSuggestedTime(null);
    setModalData({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      studentName: '',
      duration: 2,
      notes: '',
      tailNumber: tailNumber === 'GROUND' ? '' : tailNumber,
      lessonType: tailNumber === 'GROUND' ? 'Ground' : 'Flight'
    });
    setIsModalOpen(true);
  };

  const openEditBooking = (lesson: any) => {
    setEditingLesson(lesson);
    setFormError(null);
    setSuggestedTime(null);
    setModalData({
      startTime: lesson.start_time?.substring(0, 5),
      studentName: lesson.student_name,
      duration: lesson.duration_hours,
      notes: lesson.notes || '',
      tailNumber: lesson.tail_number === 'GROUND' ? '' : lesson.tail_number,
      lessonType: lesson.lesson_type || (lesson.tail_number === 'GROUND' ? 'Ground' : 'Flight')
    });
    setIsModalOpen(true);
  };

  const notifyStudent = (data: {
    studentName: string;
    changeType: 'rescheduled' | 'cancelled';
    originalDate: string;
    originalTime: string;
    newDate?: string;
    newTime?: string;
  }) => {
    // This function is still here from previous turn but we replaced its usage with queueing.
    // I will keep it but it's not being used anymore in the current logic.
    // Actually the user said "queue notifications instead of firing them" in previous turn.
    // So this function might not be used anymore. 
    // Wait, did I remove it in previous turn? 
    // Yes, I see I removed it in previous turn's replacement. 
  };

  const handleNotifyStudents = async () => {
    if (pendingNotifications.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.error('No active session found, stopping notifications.');
      return;
    }
    const token = session.access_token;

    setSendingNotifications(true);

    const notified: string[] = [];
    const noEmail: string[] = [];
    const failed: string[] = [];

    try {
      await Promise.all(pendingNotifications.map(async (notification) => {
        try {
          const response = await fetch('/api/notify-student', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(notification)
          });

          if (!response.ok) {
            failed.push(notification.studentName);
            return;
          }

          const result = await response.json();
          if (result && result.notified === true) {
            notified.push(notification.studentName);
          } else if (result && result.notified === false && result.reason === 'no_email') {
            noEmail.push(notification.studentName);
          } else {
            failed.push(notification.studentName);
          }
        } catch (err) {
          console.error('Failed to notify student:', notification.studentName, err);
          failed.push(notification.studentName);
        }
      }));

      const total = pendingNotifications.length;
      setPendingNotifications([]);

      if (notified.length === total && noEmail.length === 0 && failed.length === 0) {
        setShowNotificationSuccess(true);
        setTimeout(() => setShowNotificationSuccess(false), 3000);
      } else {
        setNotificationResults({
          total,
          notifiedNames: notified,
          noEmailNames: noEmail,
          failedNames: failed
        });
      }
    } catch (err) {
      console.error('Failed to process notifications:', err);
    } finally {
      setSendingNotifications(false);
    }
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
    const cellRect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - dragOffsetX) - cellRect.left;
    const minutesInHour = Math.round((offsetX / 96 * 60) / 10) * 10;
    const totalMinutes = hour * 60 + minutesInHour;
    
    const clampedMinutes = Math.max(0, Math.min(1430, totalMinutes));
    const h = Math.floor(clampedMinutes / 60);
    const m = clampedMinutes % 60;
    
    setDragOverHour({ hour: h, minute: m, tailNumber });
  };

  const handleDrop = async (e: React.DragEvent, hour: number, tailNumber: string) => {
    e.preventDefault();
    const cellRect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - dragOffsetX) - cellRect.left;
    const minutesInHour = Math.round((offsetX / 96 * 60) / 10) * 10;
    const totalMinutes = hour * 60 + minutesInHour;
    
    const clampedMinutes = Math.max(0, Math.min(1430, totalMinutes));
    const h = Math.floor(clampedMinutes / 60);
    const m = clampedMinutes % 60;
    const finalDecimal = h + (m / 60);
    
    const lesson = draggingLesson;
    const request = draggingRequest;
    
    setDraggingLesson(null);
    setDraggingRequest(null);
    setDragOffsetX(0);
    setDragOverHour(null);

    const newStartTime = decimalToTime(finalDecimal);
    const localYearComp = selectedDate.getFullYear();
    const localMonthComp = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const localDayComp = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${localYearComp}-${localMonthComp}-${localDayComp}`;

    if (request) {
      // Check if student already has an overlapping lesson
      const requestedStart = finalDecimal;
      const requestedEnd = finalDecimal + 2;
      
      const hasStudentConflict = scheduledLessons.some(l => {
        if (l.student_name !== request.student_name) return false;
        const [sh, sm] = l.start_time.split(':').map(Number);
        const lStart = sh + (sm / 60);
        const lEnd = lStart + (l.duration_hours || 2);
        return requestedStart < lEnd && requestedEnd > lStart;
      });

      if (hasStudentConflict) {
        alert("This student is already booked at this time");
        return;
      }

      // Check if the time slot itself is already taken
      const hasTimeConflict = checkConflict(newStartTime, 2);
      if (hasTimeConflict === 'overlap') {
        alert("This time slot is already booked. Please pick an open slot.");
        return;
      }

      // Handle request drop
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        // Insert new scheduled lesson
        const { error: insertError } = await supabase
          .from('scheduled_lessons')
          .insert([{
            user_id: session.user.id,
            student_name: request.student_name,
            date: dateStr,
            start_time: newStartTime,
            duration_hours: 2,
            lesson_type: request.lesson_type || 'Flight',
            tail_number: tailNumber,
            notes: request.preferred_time 
              ? `Student requested: ${request.preferred_time.substring(0, 5)}${request.notes ? `\n\n${request.notes}` : ''}`
              : (request.notes || "")
          }]);

        if (insertError) throw insertError;

        // Delete the request
        const { error: deleteError } = await supabase
          .from('lesson_requests')
          .delete()
          .eq('id', request.id);

        if (deleteError) throw deleteError;

        // Update local state and fetch data
        setPendingRequests(prev => prev.filter(r => r.id !== request.id));
        fetchScheduleData();
      } catch (error) {
        console.error('Error booking lesson from request:', error);
        alert('Failed to book lesson from request.');
      }
      return;
    }

    if (!lesson) return;
    
    const isSamePosition = scheduledLessons.some(l => 
      l.id !== lesson.id && 
      l.date === dateStr && 
      l.start_time?.substring(0, 5) === newStartTime && 
      l.tail_number === tailNumber
    );
    if (isSamePosition) return;

    const conflict = checkConflict(newStartTime, lesson.duration_hours, lesson.id);
    if (conflict === 'overlap') {
      const nextSlot = findNextAvailableSlot(newStartTime, lesson.duration_hours, lesson.id);
      setConflictSuggestion({
        suggestedTime: nextSlot || 'none',
        suggestedTail: tailNumber,
        lesson: lesson
      });
      setConflictModalOpen(true);
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

      // Queue notification about reschedule from drag-drop
      setPendingNotifications(prev => {
        const existing = prev.find(n => n.studentName === lesson.student_name);
        const trueOriginalDate = existing ? existing.originalDate : lesson.date;
        const trueOriginalTime = existing ? existing.originalTime : lesson.start_time?.substring(0, 5);

        // If current state matches the true original state, remove notification
        if (dateStr === trueOriginalDate && newStartTime === trueOriginalTime) {
          return prev.filter(n => n.studentName !== lesson.student_name);
        }

        const filtered = prev.filter(n => n.studentName !== lesson.student_name);
        return [...filtered, {
          studentName: lesson.student_name,
          changeType: 'rescheduled',
          originalDate: trueOriginalDate,
          originalTime: trueOriginalTime,
          newDate: dateStr,
          newTime: newStartTime,
          userId: user?.id
        }];
      });

      fetchScheduleData();
    } catch (error) {
      console.error('Error moving lesson:', error);
      alert('Failed to move lesson.');
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const handleAddAircraft = async () => {
    if (!newAircraft.tailNumber || !newAircraft.aircraftModel) {
      alert('Please fill in both fields');
      return;
    }

    setIsAddingAircraft(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('saved_aircraft')
        .insert([{
          user_id: session.user.id,
          tail_number: newAircraft.tailNumber.toUpperCase(),
          aircraft_model: newAircraft.aircraftModel,
          last_used: new Date().toISOString(),
          use_count: 0,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      await fetchScheduleData();
      setIsAddAircraftOpen(false);
      setNewAircraft({ tailNumber: '', aircraftModel: '' });
    } catch (error) {
      console.error('Error adding aircraft:', error);
      alert('Failed to add aircraft');
    } finally {
      setIsAddingAircraft(false);
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
              <button
                onClick={() => setMaydayOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md shrink-0"
                style={{ 
                  background: '#1a3a5c',
                  border: '2px solid white'
                }}
                title="Report a problem"
              >
                <Headset size={15} color="white" />
              </button>
              <AnimatePresence>
                {(pendingNotifications.length > 0 || showNotificationSuccess) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    onClick={handleNotifyStudents}
                    disabled={sendingNotifications}
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md"
                    style={{ 
                      backgroundColor: showNotificationSuccess ? '#27ae60' : '#e8a020', 
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    {sendingNotifications ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : showNotificationSuccess ? (
                      <Check size={14} />
                    ) : (
                      <Mail size={14} />
                    )}
                    <span className="text-xs font-bold whitespace-nowrap">
                      {sendingNotifications ? 'Sending...' : showNotificationSuccess ? 'Students notified' : 'Notify Students'}
                    </span>
                    {!sendingNotifications && !showNotificationSuccess && pendingNotifications.length > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                        {pendingNotifications.length}
                      </div>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <LayoutDashboard size={14} />
                <span className="text-xs font-bold">Dashboard</span>
              </Link>

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
          className="relative z-[50] flex items-center justify-between p-2 rounded-2xl border mb-6"
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
            <div className="relative z-[50]">
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
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto schedule-grid-scroll scrollbar-thin"
          >
            <div className="min-w-max relative">
              {/* Grid Header */}
              <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
                {/* Corner Cell */}
                <div className="w-48 sticky left-0 z-20 shrink-0 p-4 font-black text-[10px] uppercase tracking-[0.2em] border-r flex items-center gap-2"
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
                <div className="w-48 sticky left-0 z-20 shrink-0 p-4 border-r flex flex-col justify-center gap-0.5 shadow-[2px_0_8px_rgba(0,0,0,0.02)]"
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
                                className="absolute top-0 bottom-0 bg-[var(--navy)]/15 border-x border-[var(--navy)]/10 transition-[left] duration-100"
                                style={{ 
                                  left: `${(dragOverHour.minute / 60) * 100}%`, 
                                  width: `${(10 / 60) * 100}%` 
                                }} 
                              />
                              {/* Drag Tooltip */}
                              {draggingLesson && (
                                <div 
                                  className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg z-[100] pointer-events-none transition-[left] duration-100"
                                  style={{ 
                                    left: `${((dragOverHour.minute / 60) * 100) + ((10 / 60) * 100) / 2}%` 
                                  }}
                                >
                                  {(() => {
                                    const start = dragOverHour.hour + (dragOverHour.minute / 60);
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
                          onDragStart={(e) => {
                            setDraggingLesson(lesson);
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDragOffsetX(e.clientX - rect.left);
                          }}
                          onDragEnd={() => {
                            setDraggingLesson(null);
                            setDragOffsetX(0);
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
                            {lesson.notes?.startsWith("Student requested:") ? "REQUESTED" : "GND"}
                          </span>
                          {lesson.notes?.startsWith("Student requested:") && (lesson.duration_hours || 0) * 96 > 80 && (
                            <span className="text-[7px] font-black text-white/70 uppercase tracking-tighter">
                              {lesson.notes.split("Student requested:")[1].trim().split('\n')[0].substring(0, 5)}
                            </span>
                          )}
                          {(lesson.duration_hours || 0) * 96 > 80 && (
                            <span className="text-[7px] font-black text-white/80 uppercase tracking-tighter">
                              {formatDuration(lesson.duration_hours || 0)}
                            </span>
                          )}
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
                    <div className="w-48 sticky left-0 z-20 shrink-0 p-4 border-r flex flex-col justify-center gap-0.5 shadow-[2px_0_8px_rgba(0,0,0,0.02)]"
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
                                  className="absolute top-0 bottom-0 bg-[var(--navy)]/15 border-x border-[var(--navy)]/10 transition-[left] duration-100"
                                  style={{ 
                                    left: `${(dragOverHour.minute / 60) * 100}%`, 
                                    width: `${(10 / 60) * 100}%` 
                                  }} 
                                />
                                {/* Drag Tooltip */}
                                {draggingLesson && (
                                  <div 
                                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-neutral-900 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg z-[100] pointer-events-none transition-[left] duration-100"
                                    style={{ 
                                      left: `${((dragOverHour.minute / 60) * 100) + ((10 / 60) * 100) / 2}%` 
                                    }}
                                  >
                                    {(() => {
                                      const start = dragOverHour.hour + (dragOverHour.minute / 60);
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
                              onDragStart={(e) => {
                                setDraggingLesson(lesson);
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDragOffsetX(e.clientX - rect.left);
                              }}
                              onDragEnd={() => {
                                setDraggingLesson(null);
                                setDragOffsetX(0);
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
                                {lesson.notes?.startsWith("Student requested:") ? "REQUESTED" : (lesson.lesson_type === 'Ground' ? 'GND' : lesson.lesson_type === 'Sim' ? 'SIM' : 'FLT')}
                              </span>
                              {lesson.notes?.startsWith("Student requested:") && (lesson.duration_hours || 0) * 96 > 80 && (
                                <span className="text-[7px] font-black text-white/70 uppercase tracking-tighter">
                                  {lesson.notes.split("Student requested:")[1].trim().split('\n')[0].substring(0, 5)}
                                </span>
                              )}
                              {(lesson.duration_hours || 0) * 96 > 80 && (
                                <span className="text-[7px] font-black text-white/80 uppercase tracking-tighter">
                                  {formatDuration(lesson.duration_hours || 0)}
                                </span>
                              )}
                            </div>
                          );
                        })}

                      {/* Schoolmate Busy Blocks */}
                      {schoolmatesBusy
                        ?.filter(block => block.tail_number === ac.tail_number)
                        .map((block, idx) => {
                          const startDecimal = timeToDecimal(block.start_time);
                          const duration = block.duration_hours || 0;
                          const blockWidth = duration * 96;
                          return (
                            <div
                              key={`schoolmate-busy-${idx}`}
                              className="absolute top-2 bottom-2 rounded-lg p-2 flex flex-col justify-center overflow-hidden border border-dashed select-none pointer-events-none z-0"
                              style={{
                                left: `${startDecimal * 96}px`,
                                width: `${blockWidth}px`,
                                borderColor: 'var(--border-color)',
                                backgroundColor: 'var(--bg-tertiary)',
                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, var(--border-color) 6px, var(--border-color) 7px)',
                                color: 'var(--text-muted)'
                              }}
                            >
                              <span className="text-[10px] font-bold leading-tight truncate">
                                Booked {block.cfi_name ? block.cfi_name : ''}
                              </span>
                              {block.start_time && (
                                <div className="flex items-center gap-1 mt-0.5 opacity-80">
                                  <Clock size={8} className="text-[var(--text-muted)] border-0" />
                                  <span className="text-[8px] font-bold tracking-wider">
                                    {block.start_time.substring(0, 5)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))
              )}

              {/* Add Aircraft Row */}
              {!loading && (
                <div className="flex group/row" style={{ borderColor: 'var(--border-color)' }}>
                  <div 
                    className="w-48 sticky left-0 z-20 shrink-0 p-4 border-r flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                  >
                    <button
                      onClick={() => setIsAddAircraftOpen(true)}
                      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] cursor-pointer hover:text-[var(--navy)] transition-colors"
                    >
                      <Plus size={12} />
                      Add Aircraft
                    </button>
                  </div>
                  {/* Empty space for the timeline part of the row */}
                  <div className="flex h-12" />
                </div>
              )}

              {/* Current Time Indicator */}
              {isToday(selectedDate) && (
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-[#ef4444] z-20 pointer-events-none"
                  style={{ 
                    left: `${(currentTime.getHours() + currentTime.getMinutes() / 60) * 96}px`,
                    marginLeft: '192px' 
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#ef4444]" />
                </div>
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
                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider text-center">
                    {formError}
                  </div>
                  {suggestedTime && (
                    <button
                      onClick={() => {
                        setModalData({ ...modalData, startTime: suggestedTime });
                        setSuggestedTime(null);
                        setFormError(null);
                      }}
                      className="p-2 rounded-xl bg-[var(--navy)] text-white text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer"
                    >
                      Use {suggestedTime.substring(0, 5)}
                    </button>
                  )}
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
                <div className="relative" ref={timePickerRef}>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                    Start Time
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                    className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold flex items-center justify-between cursor-pointer"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <span>{modalData.startTime}</span>
                    <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  <AnimatePresence>
                    {isTimePickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-secondary)] border rounded-2xl shadow-xl z-50 overflow-hidden"
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex p-2 gap-1 h-[200px]">
                          {/* Hours Column */}
                          <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
                            {Array.from({ length: 24 }).map((_, h) => {
                              const hourStr = h.toString().padStart(2, '0');
                              const isSelected = modalData.startTime.split(':')[0] === hourStr;
                              return (
                                <button
                                  key={h}
                                  onClick={() => {
                                    const mins = modalData.startTime.split(':')[1] || '00';
                                    setModalData({ ...modalData, startTime: `${hourStr}:${mins}` });
                                  }}
                                  className={cn(
                                    "w-full h-10 flex items-center justify-center text-xs font-bold transition-all cursor-pointer",
                                    isSelected ? "bg-[var(--navy)] text-white rounded-lg" : "hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                                  )}
                                >
                                  {hourStr}
                                </button>
                              );
                            })}
                          </div>
                          {/* Minutes Column */}
                          <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
                            {['00', '10', '20', '30', '40', '50'].map((m) => {
                              const isSelected = modalData.startTime.split(':')[1] === m;
                              return (
                                <button
                                  key={m}
                                  onClick={() => {
                                    const hour = modalData.startTime.split(':')[0] || '08';
                                    setModalData({ ...modalData, startTime: `${hour}:${m}` });
                                  }}
                                  className={cn(
                                    "w-full h-10 flex items-center justify-center text-xs font-bold transition-all cursor-pointer",
                                    isSelected ? "bg-[var(--navy)] text-white rounded-lg" : "hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                                  )}
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>
                          {/* AM/PM Column */}
                          <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
                            {['AM', 'PM'].map((ampm) => {
                                const currentHour = parseInt(modalData.startTime.split(':')[0] || '0');
                                const isPM = currentHour >= 12;
                                const isSelected = (ampm === 'AM' && !isPM) || (ampm === 'PM' && isPM);
                                return (
                                  <button
                                    key={ampm}
                                    onClick={() => {
                                      const [h, m] = modalData.startTime.split(':').map(Number);
                                      let newH = h;
                                      if (ampm === 'AM' && isPM) newH = (h % 12);
                                      if (ampm === 'PM' && !isPM) newH = h + 12;
                                      setModalData({ ...modalData, startTime: `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` });
                                    }}
                                    className={cn(
                                      "w-full h-10 flex items-center justify-center text-xs font-bold transition-all cursor-pointer",
                                      isSelected ? "bg-[var(--navy)] text-white rounded-lg" : "hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                                    )}
                                  >
                                    {ampm}
                                  </button>
                                );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
      )}

      {/* Conflict Modal */}
      <AnimatePresence>
        {conflictModalOpen && conflictSuggestion && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setConflictModalOpen(false);
                setConflictSuggestion(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-[2rem] border overflow-hidden p-8 shadow-2xl"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-amber-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Schedule Conflict
                  </h3>
                  <p className="text-xs font-bold leading-relaxed px-4" style={{ color: 'var(--text-muted)' }}>
                    The requested time overlaps an existing lesson.
                  </p>
                </div>

                {conflictSuggestion.suggestedTime !== 'none' ? (
                  <div className="w-full p-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] block mb-1">Next available slot</span>
                    <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--navy)' }}>
                      {conflictSuggestion.suggestedTime.substring(0, 5)}
                    </span>
                  </div>
                ) : (
                  <div className="w-full p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                    <p className="text-xs font-bold text-red-500">No other available slots today.</p>
                  </div>
                )}

                <div className="flex flex-col w-full gap-3">
                  {conflictSuggestion.suggestedTime !== 'none' && (
                    <button
                      onClick={async () => {
                        try {
                          const newLessonType = conflictSuggestion.lesson.lesson_type === 'Ground' && conflictSuggestion.suggestedTail !== 'GROUND' ? 'Flight' : 
                                               (conflictSuggestion.suggestedTail === 'GROUND' ? 'Ground' : conflictSuggestion.lesson.lesson_type);
                          
                          const { error } = await supabase
                            .from('scheduled_lessons')
                            .update({ 
                              start_time: conflictSuggestion.suggestedTime,
                              tail_number: conflictSuggestion.suggestedTail,
                              lesson_type: newLessonType
                            })
                            .eq('id', conflictSuggestion.lesson.id);
                          
                          if (error) throw error;

                          // Queue notification about reschedule from conflict suggestion
                          setPendingNotifications(prev => {
                            const existing = prev.find(n => n.studentName === conflictSuggestion.lesson.student_name);
                            const trueOriginalDate = existing ? existing.originalDate : conflictSuggestion.lesson.date;
                            const trueOriginalTime = existing ? existing.originalTime : conflictSuggestion.lesson.start_time?.substring(0, 5);

                            const newTime = conflictSuggestion.suggestedTime.substring(0, 5);

                            // If current state matches the true original state, remove notification
                            if (conflictSuggestion.lesson.date === trueOriginalDate && newTime === trueOriginalTime) {
                              return prev.filter(n => n.studentName !== conflictSuggestion.lesson.student_name);
                            }

                            const filtered = prev.filter(n => n.studentName !== conflictSuggestion.lesson.student_name);
                            return [...filtered, {
                              studentName: conflictSuggestion.lesson.student_name,
                              changeType: 'rescheduled',
                              originalDate: trueOriginalDate,
                              originalTime: trueOriginalTime,
                              newDate: conflictSuggestion.lesson.date,
                              newTime: newTime,
                              userId: user?.id
                            }];
                          });

                          await fetchScheduleData();
                          setConflictModalOpen(false);
                          setConflictSuggestion(null);
                        } catch (error) {
                          console.error('Error moving lesson:', error);
                          alert('Failed to move lesson.');
                        }
                      }}
                      className="w-full py-4 rounded-2xl bg-[var(--navy)] text-white text-[11px] font-black uppercase tracking-widest hover:shadow-xl transition-all cursor-pointer"
                    >
                      Move to {conflictSuggestion.suggestedTime.substring(0, 5)}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setConflictModalOpen(false);
                      setConflictSuggestion(null);
                    }}
                    className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Aircraft Modal */}
      <AnimatePresence>
        {isAddAircraftOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsAddAircraftOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--bg-secondary)] border rounded-3xl p-8 shadow-2xl flex flex-col gap-6"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div>
                <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Add Aircraft</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>Configure fleet availability</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                    Tail Number
                  </label>
                  <input 
                    type="text"
                    placeholder="N12345"
                    className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold uppercase"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={newAircraft.tailNumber}
                    onChange={(e) => setNewAircraft({ ...newAircraft, tailNumber: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="relative" ref={aircraftSearchRef}>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                    Aircraft Model
                  </label>
                  <input 
                    type="text"
                    placeholder="C172, PA-28, etc"
                    className="w-full p-3 rounded-xl border bg-[var(--bg-tertiary)]/50 focus:ring-2 focus:ring-[var(--navy)] outline-none transition-all text-sm font-bold"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    value={newAircraft.aircraftModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewAircraft({ ...newAircraft, aircraftModel: val });
                      setScheduleAircraftSearch(val);
                      setShowScheduleAircraftDropdown(true);
                    }}
                    onFocus={() => {
                      if (newAircraft.aircraftModel) setShowScheduleAircraftDropdown(true);
                    }}
                  />

                  {showScheduleAircraftDropdown && scheduleAircraftSearch && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#1a1a1a] border rounded-xl shadow-xl z-[70] max-h-[240px] overflow-y-auto scrollbar-thin">
                      {(() => {
                        const filtered = AIRCRAFT_MODELS.filter(m => 
                          m.toLowerCase().includes(scheduleAircraftSearch.toLowerCase())
                        ).slice(0, 50);

                        if (filtered.length === 0) {
                          return (
                            <div className="p-4 text-xs italic text-gray-500 text-center">
                              No matching models found
                            </div>
                          );
                        }

                        return filtered.map((modelStr, idx) => {
                          const [icao, ...rest] = modelStr.split(',');
                          const modelPart = rest.join(',').trim();
                          
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setNewAircraft({ ...newAircraft, aircraftModel: modelStr });
                                setScheduleAircraftSearch('');
                                setShowScheduleAircraftDropdown(false);
                              }}
                              className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border-b last:border-0 border-gray-100 dark:border-white/5 transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{icao}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-black">{modelPart}</span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => setIsAddAircraftOpen(false)}
                  className="flex-1 p-4 rounded-2xl font-bold text-xs bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 transition-colors cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddAircraft}
                  disabled={isAddingAircraft}
                  className="flex-[2] p-4 rounded-2xl font-black text-xs bg-[var(--navy)] text-white hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                >
                  {isAddingAircraft ? <Loader2 size={16} className="animate-spin" /> : 'Save Aircraft'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Requests Button */}
      {pendingRequests.length > 0 && (
        <button
          onClick={() => setIsPendingPanelOpen(!isPendingPanelOpen)}
          className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[var(--navy)] text-white shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Calendar size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Requests</span>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-[var(--bg-primary)] flex items-center justify-center text-[10px] font-black shadow-lg">
            {pendingRequests.length}
          </div>
        </button>
      )}

      {/* Pending Requests Panel */}
      <AnimatePresence>
        {isPendingPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-[80px] right-4 w-[280px] max-h-[60vh] z-40 flex flex-col rounded-3xl border shadow-xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
          >
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-[0.1em]" style={{ color: 'var(--text-primary)' }}>Pending Requests</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Drag to schedule</span>
              </div>
              <button 
                onClick={() => setIsPendingPanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-4">
                  <Calendar size={24} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No pending requests</p>
                </div>
              ) : (
                pendingRequests.map(request => (
                  <div
                    key={request.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggingRequest(request);
                      // Auto-navigate to request date
                      const [year, month, day] = request.requested_date.split('-').map(Number);
                      setSelectedDate(new Date(year, month - 1, day));
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDragOffsetX(e.clientX - rect.left);
                    }}
                    onDragEnd={() => {
                      setDraggingRequest(null);
                      setDragOffsetX(0);
                      setDragOverHour(null);
                    }}
                    className="p-4 rounded-2xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)] hover:border-[var(--navy)]/30 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--navy)] text-white">
                        {request.lesson_type || 'Flight'}
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                        <Calendar size={10} />
                        {new Date(request.requested_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <h4 className="text-sm font-black mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{request.student_name}</h4>
                    {request.preferred_time && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        {request.preferred_time.substring(0, 5)}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--navy)' }}>Ready to drag</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
                  📍 Page: /schedule
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

      {/* Notification Results Modal */}
      {notificationResults && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ 
              backgroundColor: 'rgba(232,160,32,0.08)', 
              borderColor: 'var(--border-color)'
            }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#e8a020]" />
                <div>
                  <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                    Notification Status
                  </h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Feedback on student notification delivery</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationResults(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {notificationResults.noEmailNames.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 block">
                    Skipped — No Email on File
                  </span>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    The following students were not notified because there is no email on their profile:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-amber-700 font-semibold space-y-0.5">
                    {Array.from(new Set(notificationResults.noEmailNames)).map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              {notificationResults.notifiedNames.length > 0 && (
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 block">
                    Successfully Notified
                  </span>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    The following students have been emailed successfully:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-green-700 font-semibold space-y-0.5">
                    {Array.from(new Set(notificationResults.notifiedNames)).map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              {notificationResults.failedNames.length > 0 && (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 block">
                    Failed to Deliver
                  </span>
                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                    There was an error communicating or sending emails for these students:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-red-700 font-semibold space-y-0.5">
                    {Array.from(new Set(notificationResults.failedNames)).map((n, idx) => (
                      <li key={idx}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setNotificationResults(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 mt-2 cursor-pointer"
                style={{ backgroundColor: 'var(--navy)' }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
