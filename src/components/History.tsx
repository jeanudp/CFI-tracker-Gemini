import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, ManualHours, ManualHoursEntry, Grade, Endorsement } from '../types';
import { ALL_ACS, ACS_ELEMENTS, RATINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import EndorsementAdvisor from './EndorsementAdvisor';
import { Search, Trash2, ChevronRight, ChevronLeft, ChevronDown, Filter, Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Plus, X, Loader2, BookOpen, Edit, History as HistoryIcon, CheckSquare, Square, BarChart3, Sparkles, Pencil, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export default function History() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [manualHours, setManualHours] = useState<ManualHours[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedSoloOption, setSelectedSoloOption] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'lesson' | 'cumulative' | 'checkride' | 'advisor'>('lesson');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ key: string, label: string, need: number, unit: string } | null>(null);
  const [newEntryVal, setNewEntryVal] = useState('');
  const [editingDateKey, setEditingDateKey] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string>('');
  const [newLogDates, setNewLogDates] = useState<Record<string, string>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groundExpanded, setGroundExpanded] = useState(false);
  const [flightExpanded, setFlightExpanded] = useState(false);

  const getManualDate = (key: string) => {
    const dateKey = key === 'nightXc100' ? 'nightXCDate' : 
                   key === 'soloXc150' ? 'soloXC150Date' : 
                   key === 'soloTowered' ? 'soloToweredDate' : 
                   key === 'ifrXc250' ? 'ifrXc250Date' : '';
    if (!dateKey) return '';
    const m = manualHours.find(h => h.student_name === selectedLesson?.student_name && h.field_key === dateKey);
    if (!m || m.entries.length === 0) return '';
    return m.entries[0].completedDate || m.entries[0].date;
  };

  const saveManualDate = async (key: string, date: string) => {
    if (!selectedLesson) return;
    const studentName = selectedLesson.student_name;
    const dateKey = key === 'nightXc100' ? 'nightXCDate' : 
                   key === 'soloXc150' ? 'soloXC150Date' : 
                   key === 'soloTowered' ? 'soloToweredDate' : 
                   key === 'ifrXc250' ? 'ifrXc250Date' : '';
    if (!dateKey) return;

    const existing = manualHours.find(m => m.student_name === studentName && m.field_key === dateKey);
    const newEntry = { val: 1, date: new Date().toLocaleDateString(), completedDate: date };

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (existing) {
      const { error } = await supabase
        .from('manual_hours')
        .update({ entries: [newEntry], total: 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (!error) {
        setManualHours(prev => prev.map(m => m.id === existing.id ? { ...m, entries: [newEntry], total: 1 } : m));
      }
    } else {
      const { data, error } = await supabase
        .from('manual_hours')
        .insert({ user_id: session.user.id, student_name: studentName, field_key: dateKey, entries: [newEntry], total: 1 })
        .select()
        .single();
      if (!error && data) {
        setManualHours(prev => [...prev, data]);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSpecialLog = async (row: any, date: string, count: number) => {
    if (!selectedLesson) return;
    const studentName = selectedLesson.student_name;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const existingMain = manualHours.find(m => m.student_name === studentName && m.field_key === row.mk);
    const newEntryMain = { val: count, date: new Date().toLocaleDateString() };
    
    if (existingMain) {
      const { error } = await supabase.from('manual_hours').update({ entries: [newEntryMain], total: count, updated_at: new Date().toISOString() }).eq('id', existingMain.id);
      if (!error) {
        setManualHours(prev => prev.map(m => m.id === existingMain.id ? { ...m, entries: [newEntryMain], total: count } : m));
      }
    } else {
      const { data, error } = await supabase.from('manual_hours').insert({ user_id: session.user.id, student_name: studentName, field_key: row.mk, entries: [newEntryMain], total: count }).select().single();
      if (!error && data) {
        setManualHours(prev => [...prev, data]);
      }
    }

    await saveManualDate(row.mk!, date);
  };
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const getRatingBadgeColor = (code: string) => {
    const c = code?.toLowerCase();
    if (c === 'ir') return "bg-[#7c3aed] text-white";
    if (c === 'cpl') return "bg-[#2d7a4f] text-white";
    if (c === 'cfi') return "bg-[#e67e22] text-white";
    if (c === 'cfii') return "bg-[#16a34a] text-white";
    if (c === 'mei') return "bg-[#c0392b] text-white";
    return "bg-[#1a3a5c] text-white";
  };

  const renderLessonItem = (lesson: Lesson) => {
    return (
      <div
        key={lesson.id}
        className={cn(
          "relative group flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
          selectedLesson?.id === lesson.id
            ? "border-[#1a3a5c] bg-[#d4e8f5]"
            : "border-[#dde3ec] bg-white hover:border-[#1a3a5c] hover:bg-[#f8fafc]"
        )}
      >
        <div
          className="flex-1 min-w-0"
          onClick={() => setSelectedLessonId(lesson.id)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#1c2333]">{lesson.label}</span>
            {lesson.meta?.rating_code && (
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider", getRatingBadgeColor(lesson.meta.rating_code))}>
                {lesson.meta.rating_code.toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#6b7280] mt-0.5">
            {lesson.saved_at ? new Date(lesson.saved_at).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '—'}
            {lesson.student_name ? ` · ${lesson.student_name}` : ''}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {Object.values(lesson.grades || {}).filter(g => g === 'S').length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#e4f5ec] text-[#2d7a4f] rounded-full">S: {Object.values(lesson.grades || {}).filter(g => g === 'S').length}</span>
            )}
            {Object.values(lesson.grades || {}).filter(g => g === 'N').length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#fdecea] text-[#c0392b] rounded-full">N: {Object.values(lesson.grades || {}).filter(g => g === 'N').length}</span>
            )}
            {lesson.meta?.totalFlight && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#d4e8f5] text-[#1a3a5c] rounded-full">{lesson.meta.totalFlight}h</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onPointerDown={async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
            const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
            if (error) { window.alert('Delete failed: ' + error.message); return; }
            setLessons((prev: any[]) => prev.filter((l: any) => l.id !== lesson.id));
            if (selectedLessonId === lesson.id) setSelectedLessonId(null);
          }}
          className="shrink-0 mt-1 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
          title="Delete lesson"
        >
          <Trash2 size={15} />
        </button>
      </div>
    );
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: lessonsData, error: lessonsError } = await supabase.from('lessons').select('*').order('saved_at', { ascending: false });
      if (lessonsError) throw lessonsError;

      const { data: manualData, error: manualError } = await supabase.from('manual_hours').select('*');
      if (manualError) throw manualError;

      const { data: endorsementsData, error: endorsementsError } = await supabase.from('endorsements').select('*');
      if (endorsementsError) throw endorsementsError;

      setLessons(lessonsData || []);
      setManualHours(manualData || []);
      setEndorsements(endorsementsData || []);
      if (lessonsData && lessonsData.length > 0) {
        setSelectedLessonId(lessonsData[0].id);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Unable to connect to the database. Please check if your Supabase project is active.' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if (error) throw error;
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      if (selectedLesson?.id === lessonId) setSelectedLessonId(null);
    } catch (err: any) {
      window.alert('Failed to delete: ' + err.message);
    }
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const studentName = selectedLesson?.student_name;
  const lessonRating = selectedLesson?.meta?.rating_code || 'ppl';

  useEffect(() => {
    if (activeTab === 'advisor' && lessonRating !== 'ppl') {
      setActiveTab('lesson');
    }
  }, [lessonRating, activeTab]);

  useEffect(() => {
    if (selectedLesson && studentName) {
      const fetchEndorsements = async () => {
        const { data } = await supabase
          .from('endorsements')
          .select('*')
          .eq('student_name', studentName)
          .eq('rating', lessonRating);
        if (data) setEndorsements(data);
      };
      fetchEndorsements();
    }
  }, [selectedLessonId, lessonRating]);

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = (l.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (l.student_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (studentName) {
      return matchesSearch && l.student_name === studentName;
    }
    return matchesSearch;
  });

  const studentLessons = studentName ? lessons.filter(l => l.student_name === studentName) : [];

  const groundLessons = filteredLessons.filter(l => l.type === 'ground');
  const flightLessons = filteredLessons.filter(l => l.type === 'flight');

  const getSectionGrades = (lessonList: Lesson[]) => {
    let s = 0;
    let n = 0;
    lessonList.forEach(l => {
      if (l.grades) {
        Object.values(l.grades).forEach(g => {
          if (g === 'S') s++;
          if (g === 'N') n++;
        });
      }
    });
    return { s, n };
  };

  const groundGrades = getSectionGrades(groundLessons);
  const flightGrades = getSectionGrades(flightLessons);

  const studentStats = studentName ? {
    count: studentLessons.length,
    hours: studentLessons.reduce((sum, l) => sum + (parseFloat(l.meta?.totalFlight || '0') || 0), 0),
    sGrades: studentLessons.reduce((sum, l) => sum + Object.values(l.grades || {}).filter(g => g === 'S').length, 0)
  } : null;

  // Infer rating from the most recent lesson or local storage
  const getRating = () => {
    const defaultRating = { ...Object.values(RATINGS)[0], code: Object.keys(RATINGS)[0] };
    if (!selectedLesson) return defaultRating;
    const savedRating = JSON.parse(localStorage.getItem('selected_rating') || '{}');
    if (savedRating.code) {
      const r = (RATINGS as any)[savedRating.code];
      if (r) return { ...r, code: savedRating.code };
    }
    return defaultRating;
  };

  const rating = getRating();
  const acsData = ALL_ACS[rating.code] || ALL_ACS['ppl'];

  const getMostRecentGrade = (lessons: Lesson[], taskId: string) => {
    const sortedLessons = [...lessons]
      .filter(l => l.grades && l.grades[taskId])
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
    return sortedLessons.length > 0 ? sortedLessons[0].grades[taskId] : null;
  };

  const getCumulativeStats = (lessonsToSum = studentLessons) => {
    let totFlight = 0, totDual = 0, totXc = 0, totNight = 0, totNightLdg = 0, totSim = 0, totSolo = 0, totSoloXc = 0, totLdg = 0, totLdgDay = 0, totLdgNight = 0;
    let totAtd = 0, totXcDual = 0, totXcSolo = 0, totXcPic = 0, totAtdInst = 0, totNightDual = 0, totNightPic = 0, totNightTakeoffs = 0, totNightTakeoffsPic = 0, totNightLandingsPic = 0, totFtd = 0, totFfs = 0, totAtdSE = 0;
    
    lessonsToSum.forEach(l => {
      const m = l.meta || {};
      totFlight += parseFloat(m.totalFlight || '0') || 0;
      totDual += parseFloat(m.dual || '0') || 0;
      totXc += parseFloat(m.xc || '0') || 0;
      totNight += parseFloat(m.night || '0') || 0;
      totNightLdg += parseInt(m.ldgNight || '0') || 0;
      totSim += (parseFloat(m.simInst || '0') || 0) + (parseFloat(m.atdInst || '0') || 0);
      totSolo += parseFloat(m.solo || '0') || 0;
      totSoloXc += parseFloat(m.xcSolo || '0') || 0;
      totLdg += parseInt(m.ldgTotal || '0') || 0;
      totLdgDay += parseInt(m.ldgDay || '0') || 0;
      totLdgNight += parseInt(m.ldgNight || '0') || 0;
      
      totAtd += parseFloat(m.atd || '0') || 0;
      totXcDual += parseFloat(m.xcDual || '0') || 0;
      totXcSolo += parseFloat(m.xcSolo || '0') || 0;
      totXcPic += parseFloat(m.xcPic || '0') || 0;
      totAtdInst += parseFloat(m.atdInst || '0') || 0;
      totNightDual += parseFloat(m.nightDual || '0') || 0;
      totNightPic += parseFloat(m.nightPic || '0') || 0;
      totNightTakeoffs += parseInt(m.nightTakeoffs || '0') || 0;
      totNightTakeoffsPic += parseInt(m.nightTakeoffsPic || '0') || 0;
      totNightLandingsPic += parseInt(m.nightLandingsPic || '0') || 0;
      totFtd += parseFloat(m.ftd || '0') || 0;
      totFfs += parseFloat(m.ffs || '0') || 0;
      totAtdSE += parseFloat(m.atdSE || '0') || 0;
    });

    const picTime = lessonsToSum.reduce((sum, l) => sum + (parseFloat(l.meta?.pic || '0') || (parseFloat(l.meta?.solo || '0') > 0 ? parseFloat(l.meta.totalFlight || '0') : 0)), 0);

    return { 
      totFlight, totDual, totXc, totNight, totNightLdg, totSim, totSolo, totSoloXc, totLdg, totLdgDay, totLdgNight,
      totAtd, totXcDual, totXcSolo, totXcPic, totAtdInst, totNightDual, totNightPic, totNightTakeoffs, totNightTakeoffsPic, totNightLandingsPic, totFtd, totFfs, totAtdSE, picTime
    };
  };

  const openModal = (key: string, label: string, need: number, unit: string) => {
    setModalData({ key, label, need, unit });
    setIsModalOpen(true);
  };

  const handleAddManualEntry = async () => {
    if (!modalData || !selectedLesson || !newEntryVal) return;
    const val = parseFloat(newEntryVal);
    if (isNaN(val) || val <= 0) return;

    const studentName = selectedLesson.student_name;
    const fieldKey = modalData.key;
    const existing = manualHours.find(m => m.student_name === studentName && m.field_key === fieldKey);

    const newEntry: ManualHoursEntry = {
      val,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const entries = existing ? [...existing.entries, newEntry] : [newEntry];
    const total = entries.reduce((a, e) => a + e.val, 0);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (existing) {
      const { error } = await supabase
        .from('manual_hours')
        .update({ entries, total, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (!error) {
        setManualHours(prev => prev.map(m => m.id === existing.id ? { ...m, entries, total } : m));
      }
    } else {
      const { data, error } = await supabase
        .from('manual_hours')
        .insert({ user_id: session.user.id, student_name: studentName, field_key: fieldKey, entries, total })
        .select()
        .single();
      if (!error && data) {
        setManualHours(prev => [...prev, data]);
      }
    }

    setNewEntryVal('');
  };

  const handleDeleteManualEntry = async (idx: number) => {
    if (!modalData || !selectedLesson) return;
    const studentName = selectedLesson.student_name;
    const fieldKey = modalData.key;
    const existing = manualHours.find(m => m.student_name === studentName && m.field_key === fieldKey);
    if (!existing) return;

    const entries = [...existing.entries];
    entries.splice(idx, 1);
    const total = entries.reduce((a, e) => a + e.val, 0);

    const { error } = await supabase
      .from('manual_hours')
      .update({ entries, total, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (!error) {
      setManualHours(prev => prev.map(m => m.id === existing.id ? { ...m, entries, total } : m));
    }
  };

  const getManualValue = (key: string) => {
    if (!selectedLesson) return 0;
    const m = manualHours.find(h => h.student_name === selectedLesson.student_name && h.field_key === key);
    return m ? m.total : 0;
  };

  const getManualEntries = (key: string) => {
    if (!selectedLesson) return [];
    const m = manualHours.find(h => h.student_name === selectedLesson.student_name && h.field_key === key);
    return m ? m.entries : [];
  };

  const handleToggleEndorsement = async (key: string, label: string) => {
    if (!selectedLesson) return;
    const studentName = selectedLesson.student_name;
    const ratingCode = lessonRating;
    
    const existing = endorsements.find(e => 
      e.student_name === studentName && 
      e.rating === ratingCode && 
      e.endorsement_key === key
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (existing) {
      const { error } = await supabase
        .from('endorsements')
        .update({ 
          completed: !existing.completed, 
          completed_date: !existing.completed ? new Date().toISOString() : null 
        })
        .eq('id', existing.id);
      
      if (!error) {
        setEndorsements(prev => prev.map(e => e.id === existing.id ? { 
          ...e, 
          completed: !e.completed, 
          completed_date: !e.completed ? new Date().toISOString() : null 
        } : e));
      }
    } else {
      const { data, error } = await supabase
        .from('endorsements')
        .insert({
          user_id: session.user.id,
          student_name: studentName,
          rating: ratingCode,
          endorsement_key: key,
          endorsement_label: label,
          completed: true,
          completed_date: new Date().toISOString()
        })
        .select()
        .single();
      
      if (!error && data) {
        setEndorsements(prev => [...prev, data]);
      }
    }
  };

  const isEndorsementMet = (key: string) => {
    if (!selectedLesson) return false;
    return endorsements.some(e => 
      e.student_name === selectedLesson.student_name && 
      e.rating === lessonRating && 
      e.endorsement_key === key && 
      e.completed
    );
  };

  const handleEditLesson = (lesson: Lesson) => {
    localStorage.setItem('faa_edit_lesson', JSON.stringify(lesson));
    // Also set the selected student and rating so the lesson page loads correctly
    localStorage.setItem('sb_selected_student', lesson.student_name);
    const rating = { code: lesson.meta?.rating_code || 'ppl', label: lesson.meta?.rating_label || 'Private Pilot ASEL' };
    localStorage.setItem('selected_rating', JSON.stringify(rating));
    navigate(lesson.type === 'ground' ? '/ground' : '/flight');
  };

  const handlePrev = () => {
    const idx = filteredLessons.findIndex(l => l.id === selectedLessonId);
    if (idx > 0) setSelectedLessonId(filteredLessons[idx - 1].id);
  };

  const handleNext = () => {
    const idx = filteredLessons.findIndex(l => l.id === selectedLessonId);
    if (idx < filteredLessons.length - 1) setSelectedLessonId(filteredLessons[idx + 1].id);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#1a3a5c] opacity-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-[#fdecea] text-[#c0392b] rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#1c2333] mb-2">Connection Error</h2>
        <p className="text-sm text-[#6b7280] max-w-md mb-8 leading-relaxed">
          {error}
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="px-6 py-2.5 bg-[#1a3a5c] text-white font-semibold rounded-xl hover:bg-[#2a5a8c] transition-all"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 bg-white text-[#1a3a5c] font-semibold border-2 border-[#dde3ec] rounded-xl hover:bg-[#f4f5f7] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#f8fafc] relative">
      {/* Sidebar Toggle Tab */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] w-6 h-20 bg-[#1a3a5c] text-white flex items-center justify-center rounded-r-lg shadow-lg hover:bg-[#2a5a8c] transition-all duration-300"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:relative top-0 bottom-0 left-0 z-50 bg-white border-r border-[#dde3ec] flex flex-col transition-all duration-300 ease-in-out shadow-sm overflow-hidden",
          sidebarOpen ? "w-[85%] md:w-[300px] translate-x-0" : "w-[85%] md:w-0 -translate-x-full md:translate-x-0"
        )}
      >
        <div className="w-full min-w-[300px] h-full flex flex-col">
          <div className="p-6 border-b border-[#dde3ec] space-y-4">
            {studentName ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[#1a3a5c] tracking-tight truncate pr-2">
                    {studentName}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-[#f0fdf4] text-[#166534] text-[10px] font-bold px-2 py-1 rounded-full border border-[#bbf7d0]">
                    {studentStats?.count} Lessons
                  </div>
                  <div className="bg-[#eff6ff] text-[#1e40af] text-[10px] font-bold px-2 py-1 rounded-full border border-[#bfdbfe]">
                    {studentStats?.hours.toFixed(1)} Hours
                  </div>
                  <div className="bg-[#fdf2f8] text-[#9d174d] text-[10px] font-bold px-2 py-1 rounded-full border border-[#fbcfe8]">
                    {studentStats?.sGrades} S Grades
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#1a3a5c] rounded-lg">
                  <HistoryIcon size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-black tracking-tight text-[#1a3a5c] uppercase">History</h1>
              </div>
            )}

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons..."
                className="w-full text-xs border border-[#dde3ec] rounded-xl pl-9 pr-3 py-2.5 bg-[#f4f5f7] focus:outline-none focus:border-[#1a3a5c] focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredLessons.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4 opacity-10">🔍</div>
                <p className="text-sm text-[#6b7280] font-medium">No lessons found.</p>
              </div>
            ) : (
              <div className="pb-8">
                {/* Ground Lessons Section */}
                <button 
                  onClick={() => setGroundExpanded(!groundExpanded)}
                  className="w-full sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-[#dde3ec] flex justify-between items-center hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {groundExpanded ? <ChevronDown size={14} className="text-[#6b7280]" /> : <ChevronRight size={14} className="text-[#6b7280]" />}
                    <span className="text-[10px] font-black text-[#059669] uppercase tracking-widest">Ground Lessons ({groundLessons.length})</span>
                  </div>
                  <div className="flex gap-1.5">
                    {groundGrades.s > 0 && <span className="bg-[#f0fdf4] text-[#166534] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#bbf7d0]">{groundGrades.s} S</span>}
                    {groundGrades.n > 0 && <span className="bg-[#fef2f2] text-[#991b1b] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#fecaca]">{groundGrades.n} N</span>}
                  </div>
                </button>
                <AnimatePresence>
                  {groundExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden divide-y divide-[#f1f5f9] pl-2"
                    >
                      {groundLessons.length === 0 ? (
                        <div className="p-6 text-center text-[11px] text-[#94a3b8] italic">No ground lessons yet.</div>
                      ) : (
                        groundLessons.map(l => renderLessonItem(l))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Flight Lessons Section */}
                <button 
                  onClick={() => setFlightExpanded(!flightExpanded)}
                  className="w-full sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-[#dde3ec] border-t border-[#dde3ec] mt-4 flex justify-between items-center hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {flightExpanded ? <ChevronDown size={14} className="text-[#6b7280]" /> : <ChevronRight size={14} className="text-[#6b7280]" />}
                    <span className="text-[10px] font-black text-[#1a3a5c] uppercase tracking-widest">Flight Lessons ({flightLessons.length})</span>
                  </div>
                  <div className="flex gap-1.5">
                    {flightGrades.s > 0 && <span className="bg-[#f0fdf4] text-[#166534] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#bbf7d0]">{flightGrades.s} S</span>}
                    {flightGrades.n > 0 && <span className="bg-[#fef2f2] text-[#991b1b] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#fecaca]">{flightGrades.n} N</span>}
                  </div>
                </button>
                <AnimatePresence>
                  {flightExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden divide-y divide-[#f1f5f9] pl-2"
                    >
                      {flightLessons.length === 0 ? (
                        <div className="p-6 text-center text-[11px] text-[#94a3b8] italic">No flight lessons yet.</div>
                      ) : (
                        flightLessons.map(l => renderLessonItem(l))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#f1f5f9] p-8 overflow-y-auto">
        {!selectedLesson ? (
          <div className="h-full flex flex-col items-center justify-center text-[#6b7280]">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <HistoryIcon size={48} className="opacity-20" />
            </div>
            <h3 className="text-xl font-black text-[#1a3a5c] tracking-tight mb-2">Select a lesson</h3>
            <p className="text-sm text-[#94a3b8] max-w-[240px] text-center leading-relaxed">
              Choose a lesson from the sidebar to view detailed performance metrics and history.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl shadow-[#1a3a5c]/5 border border-[#dde3ec] overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex bg-[#f8fafc] rounded-2xl p-1.5 border border-[#e2e8f0] w-fit">
                    <button
                      onClick={() => setActiveTab('lesson')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                        activeTab === 'lesson' ? "bg-[#1a3a5c] text-white shadow-lg shadow-[#1a3a5c]/20" : "text-[#64748b] hover:text-[#1a3a5c]"
                      )}
                    >
                      <BookOpen size={14} />
                      This Lesson
                    </button>
                    <button
                      onClick={() => setActiveTab('cumulative')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                        activeTab === 'cumulative' ? "bg-[#1a3a5c] text-white shadow-lg shadow-[#1a3a5c]/20" : "text-[#64748b] hover:text-[#1a3a5c]"
                      )}
                    >
                      <BarChart3 size={14} />
                      Cumulative
                    </button>
                    <button
                      onClick={() => setActiveTab('checkride')}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                        activeTab === 'checkride' ? "bg-[#1a3a5c] text-white shadow-lg shadow-[#1a3a5c]/20" : "text-[#64748b] hover:text-[#1a3a5c]"
                      )}
                    >
                      <CheckCircle2 size={14} />
                      Checkride
                    </button>
                    {lessonRating === 'ppl' && (
                      <button
                        onClick={() => setActiveTab('advisor')}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                          activeTab === 'advisor' ? "bg-[#1a3a5c] text-white shadow-lg shadow-[#1a3a5c]/20" : "text-[#64748b] hover:text-[#1a3a5c]"
                        )}
                      >
                        <Sparkles size={14} />
                        Advisor
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/student/${studentName}`)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#1a3a5c] transition-all flex items-center gap-2"
                    >
                      <BarChart3 size={14} />
                      Analytics
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditLesson(selectedLesson)}
                      className="bg-white text-[#1a3a5c] border border-[#dde3ec] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#f8fafc] transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Edit size={14} />
                      Edit Lesson
                    </button>
                  </div>
                </div>

            {activeTab === 'lesson' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-[#1c2333]">{selectedLesson.label}</h1>
                  <div className="flex items-center gap-1 bg-white border border-[#dde3ec] rounded-lg px-2 py-1 shadow-sm">
                    <button 
                      onClick={handlePrev}
                      disabled={filteredLessons.findIndex(l => l.id === selectedLessonId) === 0}
                      className="p-1 hover:bg-[#f4f5f7] rounded disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-bold font-mono text-[#6b7280] px-1">
                      {filteredLessons.findIndex(l => l.id === selectedLessonId) + 1} of {filteredLessons.length}
                    </span>
                    <button 
                      onClick={handleNext}
                      disabled={filteredLessons.findIndex(l => l.id === selectedLessonId) === filteredLessons.length - 1}
                      className="p-1 hover:bg-[#f4f5f7] rounded disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#6b7280] mt-1">
                  {new Date(selectedLesson.saved_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  <br />
                  {selectedLesson.student_name} · CFI: {selectedLesson.instructor || '—'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-white rounded-xl border border-[#dde3ec] p-3 shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Satisfactory</div>
                    <div className="text-xl font-mono font-bold text-[#2d7a4f]">{Object.values(selectedLesson.grades || {}).filter(v => v === 'S').length || '—'}</div>
                    <div className="text-[9px] text-[#6b7280] mt-1">tasks</div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#dde3ec] p-3 shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Needs Impr.</div>
                    <div className="text-xl font-mono font-bold text-[#c0392b]">{Object.values(selectedLesson.grades || {}).filter(v => v === 'N').length || '—'}</div>
                    <div className="text-[9px] text-[#6b7280] mt-1">tasks</div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#dde3ec] p-3 shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Incomplete</div>
                    <div className="text-xl font-mono font-bold text-[#e8a020]">{Object.values(selectedLesson.grades || {}).filter(v => v === 'I').length || '—'}</div>
                    <div className="text-[9px] text-[#6b7280] mt-1">tasks</div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#dde3ec] p-3 shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Flight Time</div>
                    <div className="text-xl font-mono font-bold text-[#1a3a5c]">{selectedLesson.meta?.totalFlight || '—'}</div>
                    <div className="text-[9px] text-[#6b7280] mt-1">hours</div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#dde3ec] p-3 shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Landings</div>
                    <div className="text-xl font-mono font-bold text-[#1a3a5c]">{selectedLesson.meta?.ldgTotal || '—'}</div>
                    <div className="text-[9px] text-[#6b7280] mt-1">total</div>
                  </div>
                </div>

                {selectedLesson.meta?.notes && (
                  <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                    <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Lesson Notes</div>
                    <div className="p-4 text-sm text-[#1c2333] leading-relaxed whitespace-pre-wrap">{selectedLesson.meta.notes}</div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Flight Time Log</div>
                  <div className="p-4 space-y-6">
                    {/* Group 1 — Total Time */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Total Time</h4>
                      <div className="space-y-1">
                        {[
                          ['Total Flight Time', selectedLesson.meta?.totalFlight ? `${selectedLesson.meta.totalFlight}h` : ''],
                          ['ATD Time', selectedLesson.meta?.atd ? `${selectedLesson.meta.atd}h` : ''],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 2 — Instruction and Solo */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Instruction and Solo</h4>
                      <div className="space-y-1">
                        {[
                          ['Dual Instruction', selectedLesson.meta?.dual ? `${selectedLesson.meta.dual}h` : ''],
                          ['Solo Flight Time', selectedLesson.meta?.solo ? `${selectedLesson.meta.solo}h` : ''],
                          ['Solo XC', selectedLesson.meta?.soloXc ? `${selectedLesson.meta.soloXc}h` : ''],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 3 — Pilot in Command */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Pilot in Command</h4>
                      <div className="space-y-1">
                        {[
                          ['PIC Time', selectedLesson.meta?.pic ? `${selectedLesson.meta.pic}h` : ''],
                          ['SIC Time', selectedLesson.meta?.sic ? `${selectedLesson.meta.sic}h` : ''],
                          ['As CFI', selectedLesson.meta?.cfi ? `${selectedLesson.meta.cfi}h` : ''],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 4 — Cross Country */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Cross Country</h4>
                      <div className="space-y-1">
                        {[
                          ['XC (Total)', selectedLesson.meta?.xc ? `${selectedLesson.meta.xc}h` : ''],
                          ['XC Dual', selectedLesson.meta?.xcDual ? `${selectedLesson.meta.xcDual}h` : ''],
                          ['XC Solo', selectedLesson.meta?.xcSolo ? `${selectedLesson.meta.xcSolo}h` : ''],
                          ['XC PIC', selectedLesson.meta?.xcPic ? `${selectedLesson.meta.xcPic}h` : ''],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 5 — Instrument */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Instrument</h4>
                      <div className="space-y-1">
                        {[
                          ['Simulated Instrument', selectedLesson.meta?.simInst ? `${selectedLesson.meta.simInst}h` : ''],
                          ['Actual IMC', selectedLesson.meta?.imc ? `${selectedLesson.meta.imc}h` : ''],
                          ['ATD Instrument', selectedLesson.meta?.atdInst ? `${selectedLesson.meta.atdInst}h` : ''],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 6 — Night */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Night</h4>
                      <div className="space-y-1">
                        {[
                          ['Night (Total)', selectedLesson.meta?.night ? `${selectedLesson.meta.night}h` : ''],
                          ['Night Dual', selectedLesson.meta?.nightDual ? `${selectedLesson.meta.nightDual}h` : ''],
                          ['Night PIC', selectedLesson.meta?.nightPic ? `${selectedLesson.meta.nightPic}h` : ''],
                          ['Night Takeoffs', selectedLesson.meta?.nightTakeoffs],
                          ['Night Landings', selectedLesson.meta?.ldgNight],
                          ['Night TO PIC', selectedLesson.meta?.nightTakeoffsPic],
                          ['Night Ldg PIC', selectedLesson.meta?.nightLandingsPic],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Group 7 — Simulator and Device */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Simulator and Device</h4>
                      <div className="space-y-1">
                        {[
                          ['FTD Time', selectedLesson.meta?.ftd ? `${selectedLesson.meta.ftd}h` : ''],
                          ['FFS Time', selectedLesson.meta?.ffs ? `${selectedLesson.meta.ffs}h` : ''],
                          ['ATD SE', selectedLesson.meta?.atdSE ? `${selectedLesson.meta.atdSE}h` : ''],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Other Details */}
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Other Details</h4>
                      <div className="space-y-1">
                        {[
                          ['Date', selectedLesson.meta?.date],
                          ['Aircraft', selectedLesson.meta?.aircraft],
                          ['Route', selectedLesson.meta?.route],
                          ['Total Landings', selectedLesson.meta?.ldgTotal],
                          ['Day Landings', selectedLesson.meta?.ldgDay],
                        ].filter(d => d[1]).map(([label, val]) => (
                          <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                            <span className="text-xs text-[#64748b]">{label}</span>
                            <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {!Object.entries(selectedLesson.meta || {}).some(([k, v]) => k !== 'date' && k !== 'notes' && v) && (
                      <div className="text-sm text-[#6b7280] italic">No flight log data.</div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec] flex justify-between">
                    <span>ACS Grades</span>
                    <span className="font-normal opacity-60">Graded tasks only</span>
                  </div>
                  <div className="divide-y divide-[#dde3ec]">
                    {acsData.map((area, ai) => {
                      const tasksInArea = area.tasks.map((task, ti) => ({ name: task.name, id: `${ai}_${ti}` }))
                        .filter(t => selectedLesson.grades?.[t.id]);
                      if (tasksInArea.length === 0) return null;

                      return (
                        <React.Fragment key={area.area}>
                          <div className="bg-[#1a3a5c] text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                            {area.area}
                          </div>
                          {tasksInArea.map(t => (
                            <div key={t.id} className="grid grid-cols-[1fr_50px_1fr] items-center min-h-[34px] border-b border-[#dde3ec] last:border-0">
                              <div className="px-4 py-2 text-xs font-medium text-[#1c2333]">{t.name}</div>
                              <div className="text-center">
                                <span className={cn(
                                  "inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold font-mono text-white",
                                  selectedLesson.grades[t.id] === 'S' ? "bg-[#2d7a4f]" :
                                  selectedLesson.grades[t.id] === 'N' ? "bg-[#c0392b]" : "bg-[#e8a020]"
                                )}>
                                  {selectedLesson.grades[t.id]}
                                </span>
                              </div>
                              <div className="px-4 py-2 text-[11px] text-[#6b7280] italic">{selectedLesson.notes?.[t.id] || ''}</div>
                            </div>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    {Object.keys(selectedLesson.grades || {}).length === 0 && (
                      <div className="p-4 text-sm text-[#6b7280] italic">No tasks graded.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'cumulative' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="text-xs font-bold uppercase tracking-widest text-[#6b7280] mb-4">
                  Cumulative — {selectedLesson.student_name}
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">ACS Coverage (all lessons)</div>
                  <div className="p-4 space-y-3">
                    {acsData.map((area, ai) => {
                      const tasks = area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'));
                      if (tasks.length === 0) return null;
                      const sat = tasks.filter((_, ti) => getMostRecentGrade(studentLessons, `${ai}_${ti}`) === 'S').length;
                      const pct = Math.round((sat / tasks.length) * 100);

                      return (
                        <div key={area.area} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-medium">
                            <span className="truncate max-w-[200px]" title={area.area}>{area.area}</span>
                            <span className="font-mono text-[#6b7280]">{sat}/{tasks.length}</span>
                          </div>
                          <div className="h-1.5 bg-[#f4f5f7] rounded-full overflow-hidden">
                            <div className="h-full bg-[#2a5a8c] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Hours Summary</div>
                  <div className="p-4 space-y-6">
                    {(() => {
                      const stats = getCumulativeStats();
                      return (
                        <>
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Total Time</h4>
                            <div className="space-y-1">
                              {[
                                ['Total Flight Time', `${stats.totFlight.toFixed(1)}h`],
                                ['ATD Time', `${stats.totAtd.toFixed(1)}h`],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Instruction and Solo</h4>
                            <div className="space-y-1">
                              {[
                                ['Dual Instruction', `${stats.totDual.toFixed(1)}h`],
                                ['Solo Flight Time', `${stats.totSolo.toFixed(1)}h`],
                                ['Solo XC', `${stats.totSoloXc.toFixed(1)}h`],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Pilot in Command</h4>
                            <div className="space-y-1">
                              {[
                                ['PIC Time', `${studentLessons.reduce((sum, l) => sum + (parseFloat(l.meta?.pic || '0') || (parseFloat(l.meta?.solo || '0') > 0 ? parseFloat(l.meta.totalFlight || '0') : 0)), 0).toFixed(1)}h`],
                                ['SIC Time', `${studentLessons.reduce((sum, l) => sum + (parseFloat(l.meta?.sic || '0') || 0), 0).toFixed(1)}h`],
                                ['As CFI', `${studentLessons.reduce((sum, l) => sum + (parseFloat(l.meta?.cfi || '0') || 0), 0).toFixed(1)}h`],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Cross Country</h4>
                            <div className="space-y-1">
                              {[
                                ['XC (Total)', `${stats.totXc.toFixed(1)}h`],
                                ['XC Dual', `${stats.totXcDual.toFixed(1)}h`],
                                ['XC Solo', `${stats.totXcSolo.toFixed(1)}h`],
                                ['XC PIC', `${stats.totXcPic.toFixed(1)}h`],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Instrument</h4>
                            <div className="space-y-1">
                              {[
                                ['Instrument (Total)', `${stats.totSim.toFixed(1)}h`],
                                ['ATD Instrument', `${stats.totAtdInst.toFixed(1)}h`],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Night</h4>
                            <div className="space-y-1">
                              {[
                                ['Night (Total)', `${stats.totNight.toFixed(1)}h`],
                                ['Night Dual', `${stats.totNightDual.toFixed(1)}h`],
                                ['Night PIC', `${stats.totNightPic.toFixed(1)}h`],
                                ['Night Takeoffs', stats.totNightTakeoffs],
                                ['Night Landings', stats.totNightLdg],
                                ['Night TO PIC', stats.totNightTakeoffsPic],
                                ['Night Ldg PIC', stats.totNightLandingsPic],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Simulator and Device</h4>
                            <div className="space-y-1">
                              {[
                                ['FTD Time', `${stats.totFtd.toFixed(1)}h`],
                                ['FFS Time', `${stats.totFfs.toFixed(1)}h`],
                                ['ATD SE', `${stats.totAtdSE.toFixed(1)}h`],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Other Details</h4>
                            <div className="space-y-1">
                              {[
                                ['Total Landings', stats.totLdg],
                                ['Day Landings', stats.totLdgDay],
                              ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">All Needs-Improvement Grades</div>
                  <div className="p-4 space-y-2">
                    {(() => {
                      const niGrades: any[] = [];
                      studentLessons.forEach(l => {
                        acsData.forEach((area, ai) => {
                          area.tasks
                            .filter(task => !task.name.includes('N/A') && !task.name.includes('ASEL') && !task.name.includes('Seaplane') && !task.name.includes('Water'))
                            .forEach((task, ti) => {
                              if (l.grades?.[`${ai}_${ti}`] === 'N') {
                                niGrades.push({ task, area: area.area, lesson: l.label, date: new Date(l.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
                              }
                            });
                        });
                      });

                      if (niGrades.length === 0) return <div className="text-sm text-[#6b7280] italic">No N grades yet.</div>;

                      return niGrades.map((g, idx) => (
                        <div key={idx} className="flex gap-3 py-2 border-b border-[#dde3ec] last:border-0">
                          <span className="bg-[#fdecea] text-[#c0392b] text-[9px] font-bold px-2 py-0.5 rounded h-fit whitespace-nowrap">
                            N · {g.lesson} · {g.date}
                          </span>
                          <span className="text-xs">
                            <strong className="text-[#1c2333]">{g.task.name}</strong> <span className="text-[#6b7280]">({g.area})</span>
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'advisor' && lessonRating === 'ppl' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <EndorsementAdvisor studentName={studentName} ratingCode={lessonRating} />
              </motion.div>
            )}

            {activeTab === 'checkride' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {(() => {
                  const sls = studentLessons.filter(l => (l.meta?.rating_code || 'ppl') === lessonRating);
                  const stats = getCumulativeStats(sls);
                  const sixtyDaysAgo = new Date();
                  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                  const sixtyDaysStr = `Calculated from ${sixtyDaysAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} to ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

                  const recentDual = sls
                    .filter(l => new Date(l.saved_at) >= sixtyDaysAgo)
                    .reduce((sum, l) => sum + (parseFloat(l.meta?.dual || '0') || 0), 0);

                  const recentInst = sls
                    .filter(l => new Date(l.saved_at) >= sixtyDaysAgo)
                    .reduce((sum, l) => sum + (parseFloat(l.meta?.simInst || '0') || 0), 0);

                  const sixMonthsAgo = new Date();
                  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                  const recentInst6mo = sls
                    .filter(l => new Date(l.saved_at) >= sixMonthsAgo)
                    .reduce((sum, l) => sum + (parseFloat(l.meta?.simInst || '0') || 0), 0);

                  let REQS: any[] = [];
                  let ENDORSEMENTS: any[] = [];
                  let SOLO_OPTIONS: any[] = [];

                  if (lessonRating === 'ppl') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.109(a)', rows: [
                        { label: 'Total flight time', ref: '§61.109(a)', have: stats.totFlight, need: 40, unit: 'hrs' },
                        { label: 'Flight training from authorized instructor', ref: '§61.109(a)(1)', have: stats.totDual, need: 20, unit: 'hrs' },
                        { label: 'Cross-country flight training', ref: '§61.109(a)(1)(i)', have: stats.totXcDual, need: 3, unit: 'hrs' },
                        { label: 'Night flight training (incl. 100NM XC)', ref: '§61.109(a)(1)(ii)', have: stats.totNightDual, need: 3, unit: 'hrs' },
                        { label: 'Night cross-country over 100NM', ref: '§61.109(a)(1)(ii)', have: getManualValue('nightXc100'), need: 1, unit: 'flight', mk: 'nightXc100' },
                        { label: 'Full stop night landings', ref: '§61.109(a)(1)(ii)', have: stats.totNightLdg, need: 10, unit: 'landings' },
                        { label: 'Instrument training', ref: '§61.109(a)(1)(iii)', have: stats.totSim, need: 3, unit: 'hrs' },
                        { label: 'Practical test prep dual (60 days)', ref: '§61.109(a)(1)(iv)', have: recentDual, need: 3, unit: 'hrs', note: sixtyDaysStr },
                        { label: 'Solo flight time', ref: '§61.109(a)(2)', have: stats.totSolo, need: 10, unit: 'hrs' },
                        { label: 'Solo cross-country', ref: '§61.109(a)(2)(i)', have: stats.totSoloXc, need: 5, unit: 'hrs' },
                        { label: 'Solo XC 150NM total', ref: '§61.109(a)(2)(ii)', have: getManualValue('soloXc150'), need: 1, unit: 'flight', mk: 'soloXc150' },
                        { label: 'Solo landings at towered airport', ref: '§61.109(a)(2)(iii)', have: getManualValue('soloTowered'), need: 3, unit: 'landings', mk: 'soloTowered' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.1', text: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii). I certify that [First name, MI, Last name] has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of [applicable] certificate.' },
                      { key: 'A.2', text: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required. I certify that [First name, MI, Last name] has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the [applicable] airman knowledge test.' },
                      { key: 'A.3', text: 'A.3 — Pre-solo aeronautical knowledge: 14 CFR § 61.87(b). I certify that [First name, MI, Last name] has satisfactorily completed the pre-solo knowledge test of 14 CFR § 61.87(b) for the [make and model] aircraft.' },
                      { key: 'A.4', text: 'A.4 — Pre-solo flight training: 14 CFR § 61.87(c)(1) and (2). I certify that [First name, MI, Last name] has received and logged pre-solo flight training for the maneuvers and procedures that are appropriate to the [make and model] aircraft. I have determined they have demonstrated satisfactory proficiency and safety on the maneuvers and procedures required by 14 CFR § 61.87 in this or similar make and model of aircraft to be flown.' },
                      { key: 'A.5', text: 'A.5 — Pre-solo flight training at night: 14 CFR § 61.87(o). I certify that [First name, MI, Last name] has received flight training at night on night flying procedures that include takeoffs, approaches, landings, and go-arounds at night at the [airport name] airport where the solo flight will be conducted; navigation training at night in the vicinity of the [airport name] airport where the solo flight will be conducted. This endorsement expires 90 calendar days from the date the flight training at night was received.' },
                      { key: 'A.6', text: 'A.6 — Solo flight (first 90-calendar-day period): 14 CFR § 61.87(n). I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined they meet the applicable requirements of 14 CFR § 61.87(n) and are proficient to make solo flights in [make and model].' },
                      { key: 'A.7', text: 'A.7 — Solo flight (each additional 90-calendar-day period): 14 CFR § 61.87(p). I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined that they meet the applicable requirements of 14 CFR § 61.87(p) and are proficient to make solo flights in [make and model].' },
                      { key: 'A.8', text: 'A.8 — Solo takeoffs and landings at another airport within 25 NM: 14 CFR § 61.93(b)(1). I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.93(b)(1). I have determined that they are proficient to practice solo takeoffs and landings at [airport name]. The takeoffs and landings at [airport name] are subject to the following conditions: [List any applicable conditions or limitations.]' },
                      { key: 'A.9', text: 'A.9 — Solo cross-country flight: 14 CFR § 61.93(c)(1) and (2). I certify that [First name, MI, Last name] has received the required solo cross-country training. I find they have met the applicable requirements of 14 CFR § 61.93 and are proficient to make solo cross-country flights in a [make and model] aircraft, [aircraft category].' },
                      { key: 'A.10', text: 'A.10 — Solo cross-country flight: 14 CFR § 61.93(c)(3). I have reviewed the cross-country planning of [First name, MI, Last name]. I find the planning and preparation to be correct to make the solo flight from [origination airport] to [destination airport] via [route of flight] with landings at [names of the airports] in a [make and model] aircraft on [date]. [List any applicable conditions or limitations.]' },
                      { key: 'A.11', text: 'A.11 — Repeated solo cross-country flights not more than 50 NM from the point of departure: 14 CFR § 61.93(b)(2). I certify that [First name, MI, Last name] has received the required training in both directions between and at both [airport names]. I have determined that they are proficient of 14 CFR § 61.93(b)(2) to conduct repeated solo cross-country flights over that route, subject to the following conditions: [List any applicable conditions or limitations.]' },
                      { key: 'A.12', text: 'A.12 — Solo flight in Class B airspace: 14 CFR § 61.95(a). I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.95(a). I have determined they are proficient to conduct solo flights in [name of Class B] airspace. [List any applicable conditions or limitations.]' },
                      { key: 'A.13', text: 'A.13 — Solo flight to, from, or at an airport located in Class B airspace: 14 CFR §§ 61.95(b) and 91.131(b)(1). I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.95(b)(1). I have determined that they are proficient to conduct solo flight operations at [name of airport]. [List any applicable conditions or limitations.]' },
                      { key: 'A.32', text: 'A.32 — Aeronautical knowledge test: 14 CFR §§ 61.35(a)(1), 61.103(d), and 61.105. I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR § 61.105. I have determined they are prepared for the [name of] knowledge test.' },
                      { key: 'A.33', text: 'A.33 — Flight proficiency/practical test: 14 CFR §§ 61.103(f), 61.107(b), and 61.109. I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR §§ 61.107 and 61.109. I have determined they are prepared for the [name of] practical test.' },
                      { key: 'A.34', text: 'A.34 — Practical test within 60 days: 14 CFR § 61.39(a)(6)(i). I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.39(a)(6)(i) within 2 calendar months preceding the month of application in preparation for the practical test and I find [First name, MI, Last name] prepared for the [name of] practical test.' },
                      { key: 'A.37', text: 'A.37 — Commercial Pilot Aeronautical knowledge test: 14 CFR §§ 61.35(a)(1), 61.123(c), and 61.125. (Required for PPL per instructor rules).' }
                    ];
                    SOLO_OPTIONS = [
                      { id: '1', label: 'Section 1 — Prerequisites for Practical Test', description: 'These apply to ALL ratings before any practical test.', endorsements: ENDORSEMENTS.slice(0, 2) },
                      { id: '2', label: 'Section 2 — Student Pilot and Pre-Solo Endorsements', description: 'Required before the student\'s first solo flight.', endorsements: ENDORSEMENTS.slice(2, 7) },
                      { id: '3', label: 'Section 3 — Solo Cross-Country Endorsements', description: 'Required before solo cross-country flights.', endorsements: ENDORSEMENTS.slice(7, 11) },
                      { id: '4', label: 'Section 4 — Solo Flight in Class B Airspace', description: 'Required in addition to standard solo endorsements.', endorsements: ENDORSEMENTS.slice(11, 13) },
                      { id: '5', label: 'Section 5 — Private Pilot Knowledge Test', description: 'Required before the FAA Private Pilot knowledge test.', endorsements: ENDORSEMENTS.slice(13, 14) },
                      { id: '6', label: 'Section 6 — Private Pilot Practical Test (Checkride)', description: 'Required before the FAA Private Pilot practical test with a DPE.', endorsements: ENDORSEMENTS.slice(14, 17) }
                    ];
                  } else if (lessonRating === 'ir') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.65(d)', rows: [
                        { label: 'Cross-Country PIC Time', ref: '§61.65(d)(1)', have: stats.totXcPic, need: 50, unit: 'hrs' },
                        { label: 'Actual or Simulated Instrument Time', ref: '§61.65(d)(2)', have: stats.totSim, need: 40, unit: 'hrs' },
                        { label: 'Instrument Training from Authorized Instructor', ref: '§61.65(d)(3)', have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.dual || '0') > 0 ? parseFloat(l.meta?.simInst || '0') : 0), 0), need: 15, unit: 'hrs' },
                        { label: 'Instrument Training within 60 Days', ref: '§61.65(d)(4)', have: recentInst, need: 3, unit: 'hrs', note: sixtyDaysStr },
                        { label: 'IFR Cross-Country Flight 250NM', ref: '§61.65(d)(5)', have: getManualValue('ifrXc250'), need: 1, unit: 'flight', mk: 'ifrXc250', note: 'One cross-country flight in actual or simulated IMC along airways or ATC routing with an instrument approach at each airport and three different kinds of approaches with a total distance of at least 250NM' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.42', text: 'AC 61-65K A.42 — Aeronautical knowledge test §61.35(a)(1) and §61.65(a) and (b): I certify that [First name, MI, Last name] has received the required training of 14 CFR §61.65(b). I have determined that they are prepared for the Instrument–airplane knowledge test.' },
                      { key: 'A.1', text: 'AC 61-65K A.1 — Prerequisites for practical test §61.39(a)(6)(i) and (ii): I certify that [First name, MI, Last name] has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of Instrument Rating.' },
                      { key: 'A.2', text: 'AC 61-65K A.2 — Review of deficiencies §61.39(a)(6)(iii) as required: I certify that [First name, MI, Last name] has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the Instrument Rating airman knowledge test.' },
                      { key: 'A.44', text: 'AC 61-65K A.44 — Prerequisites for instrument practical tests §61.39(a): I certify that [First name, MI, Last name] has received and logged the required flight time/training of 14 CFR §61.39(a) in preparation for the practical test within 2 calendar months preceding the date of the test and has satisfactory knowledge of the subject areas in which they were shown to be deficient by the FAA Airman Knowledge Test Report. I have determined they are prepared for the Instrument–airplane practical test.' },
                      { key: 'A.43', text: 'AC 61-65K A.43 — Flight proficiency/practical test §61.65(a)(6): I certify that [First name, MI, Last name] has received the required training of 14 CFR §61.65(c) and (d). I have determined they are prepared for the Instrument–airplane practical test.' }
                    ];
                    SOLO_OPTIONS = [
                      { 
                        id: '1', 
                        label: 'Section 1 — Knowledge Test', 
                        description: 'Required before the FAA Instrument Rating knowledge test.', 
                        endorsements: [ENDORSEMENTS[0]] 
                      },
                      { 
                        id: '2', 
                        label: 'Section 2 — Practical Test Prerequisites', 
                        description: 'Required before the FAA Instrument Rating practical test.', 
                        endorsements: [ENDORSEMENTS[1], ENDORSEMENTS[2], ENDORSEMENTS[3]] 
                      },
                      { 
                        id: '3', 
                        label: 'Section 3 — Practical Test Endorsement', 
                        description: 'Required before the FAA Instrument Rating practical test with a DPE.', 
                        endorsements: [ENDORSEMENTS[4]] 
                      }
                    ];
                  } else if (lessonRating === 'cpl') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.129(a)', rows: [
                        { label: 'Total flight time', ref: '§61.129(a)(1)', have: stats.totFlight, need: 250, unit: 'hrs' },
                        { label: 'Powered aircraft time', ref: '§61.129(a)(2)', have: stats.totFlight, need: 100, unit: 'hrs' },
                        { label: 'PIC flight time', ref: '§61.129(a)(3)(i)', have: stats.picTime, need: 100, unit: 'hrs' },
                        { label: 'Cross-country PIC', ref: '§61.129(a)(3)(ii)', have: stats.totXc, need: 50, unit: 'hrs' },
                        { label: 'Instrument training', ref: '§61.129(a)(4)(i)', have: stats.totSim, need: 10, unit: 'hrs' },
                        { label: 'Complex or turbine aircraft', ref: '§61.129(a)(4)(ii)', have: getManualValue('complex'), need: 10, unit: 'hrs', mk: 'complex' },
                        { label: '2-hr Day XC > 100NM', ref: '§61.129(a)(4)(iii)', have: getManualValue('dayXc100'), need: 1, unit: 'flight', mk: 'dayXc100' },
                        { label: '2-hr Night XC > 100NM', ref: '§61.129(a)(4)(iv)', have: getManualValue('nightXc100'), need: 1, unit: 'flight', mk: 'nightXc100' },
                        { label: 'Practical test prep dual (60 days)', ref: '§61.129(a)(4)(v)', have: recentDual, need: 3, unit: 'hrs', note: sixtyDaysStr },
                        { label: 'Solo PIC time', ref: '§61.129(a)(5)(i)', have: stats.totSolo, need: 10, unit: 'hrs' },
                        { label: 'Night VFR with 10 landings towered', ref: '§61.129(a)(5)(ii)', have: getManualValue('nightSoloTowered'), need: 1, unit: 'flight', mk: 'nightSoloTowered' },
                        { label: 'Solo XC 300NM', ref: '§61.129(a)(5)(iii)', have: getManualValue('soloXc300'), need: 1, unit: 'flight', mk: 'soloXc300' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.1', label: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii)' },
                      { key: 'A.2', label: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required' },
                      { key: 'A.38', label: 'A.38 — Aeronautical knowledge test: 14 CFR §§ 61.35(a)(1), 61.123(c), and 61.125' },
                      { key: 'A.39', label: 'A.39 — Flight proficiency/practical test: 14 CFR §§ 61.123(e), 61.127, and 61.129' }
                    ];
                  } else if (lessonRating === 'cfi') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.183', rows: [
                        { label: 'PIC in category and class', ref: '§61.183(g)', have: stats.picTime, need: 15, unit: 'hrs' },
                        { label: 'Commercial certificate held', ref: '§61.183(c)', have: getManualValue('commercialHeld'), need: 1, unit: 'cert', mk: 'commercialHeld' },
                        { label: 'FOI knowledge test passed', ref: '§61.183(d)', have: getManualValue('foiPassed'), need: 1, unit: 'test', mk: 'foiPassed' },
                        { label: 'CFI knowledge test passed', ref: '§61.183(f)', have: getManualValue('cfiPassed'), need: 1, unit: 'test', mk: 'cfiPassed' },
                        { label: 'Practical test prep dual (60 days)', ref: '§61.183(g)', have: getManualValue('endorsement2mo'), need: 1, unit: 'hrs', mk: 'endorsement2mo' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.1', label: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii)' },
                      { key: 'A.2', label: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required' },
                      { key: 'A.45', label: 'A.45 — Fundamentals of instructing knowledge test: 14 CFR § 61.183(d)' },
                      { key: 'A.46', label: 'A.46 — Flight instructor aeronautical knowledge test: 14 CFR § 61.183(f)' },
                      { key: 'A.47', label: 'A.47 — Flight instructor ground and flight proficiency/practical test: 14 CFR § 61.183(g)' },
                      { key: 'A.49', label: 'A.49 — Spin training: 14 CFR § 61.183(i)(1)' }
                    ];
                  } else if (lessonRating === 'cfii') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.187(b)', rows: [
                        { label: 'CFI certificate held', ref: '§61.183', have: getManualValue('cfiHeld'), need: 1, unit: 'cert', mk: 'cfiHeld' },
                        { label: 'Instrument rating held', ref: '§61.183', have: getManualValue('instrumentHeld'), need: 1, unit: 'rating', mk: 'instrumentHeld' },
                        { label: 'Instrument recent experience §61.57(c)', ref: '§61.187(b)', have: getManualValue('instRecent'), need: 1, unit: 'flight', mk: 'instRecent' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.1', label: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii)' },
                      { key: 'A.2', label: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required' },
                      { key: 'A.46', label: 'A.46 — Flight instructor aeronautical knowledge test: 14 CFR § 61.183(f)' },
                      { key: 'A.48', label: 'A.48 — Flight instructor certificate with instrument rating/practical test: 14 CFR §§ 61.183(g) and 61.187(a) and (b)(7)' }
                    ];
                  } else if (lessonRating === 'mei') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.195(h)', rows: [
                        { label: 'CFI certificate held', ref: '§61.183', have: getManualValue('cfiHeld'), need: 1, unit: 'cert', mk: 'cfiHeld' },
                        { label: 'Multiengine rating held', ref: '§61.183', have: getManualValue('multiengineHeld'), need: 1, unit: 'rating', mk: 'multiengineHeld' },
                        { label: 'PIC in multiengine airplane', ref: '§61.195(h)(3)', have: getManualValue('mePic'), need: 5, unit: 'hrs', mk: 'mePic' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.1', label: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii)' },
                      { key: 'A.2', label: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required' },
                      { key: 'A.46', label: 'A.46 — Flight instructor aeronautical knowledge test: 14 CFR § 61.183(f)' },
                      { key: 'A.47', label: 'A.47 — Flight instructor ground and flight proficiency/practical test: 14 CFR § 61.183(g)' }
                    ];
                  }

                  const allRows = REQS.flatMap(r => r.rows);
                  const metCount = allRows.filter(r => r.have >= r.need).length;
                  const endorsementsMet = ENDORSEMENTS.filter(e => isEndorsementMet(e.key)).length;
                  
                  let allMet = false;
                  if (lessonRating === 'ppl') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.37');
                  } else if (lessonRating === 'ir') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.43') && isEndorsementMet('A.44') && isEndorsementMet('A.1');
                  } else if (lessonRating === 'cpl') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.39');
                  } else if (lessonRating === 'cfi') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.47') && isEndorsementMet('A.49');
                  } else if (lessonRating === 'cfii') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.48');
                  } else if (lessonRating === 'mei') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.47');
                  }

                  // Fireworks logic
                  if (allMet && !celebrated[`${selectedLesson.student_name}_${lessonRating}`]) {
                    confetti({
                      particleCount: 150,
                      spread: 70,
                      origin: { y: 0.6 }
                    });
                    setCelebrated(prev => ({ ...prev, [`${selectedLesson.student_name}_${lessonRating}`]: true }));
                  }

                  return (
                    <div className="space-y-6">
                      {allMet && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-[#2d7a4f] text-white p-6 rounded-2xl shadow-xl text-center space-y-2"
                        >
                          <div className="text-4xl">🎉</div>
                          <h2 className="text-2xl font-black tracking-tight">CHECKRIDE READY</h2>
                          <p className="text-sm opacity-90">{lessonRating === 'ppl' ? 'All §61.109(a) flight requirements and practical test endorsements have been met.' : lessonRating === 'ir' ? 'All §61.65(d) flight requirements and practical test endorsements have been met.' : 'All FAR Part 61 requirements and AC 61-65 endorsements have been met.'}</p>
                          <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest pt-2">
                            Verified on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl border border-[#dde3ec] p-4 shadow-sm text-center">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Flight Requirements</div>
                          <div className={cn("text-2xl font-mono font-bold", metCount === allRows.length ? "text-[#2d7a4f]" : "text-[#e8a020]")}>{metCount}/{allRows.length}</div>
                          <div className="text-[9px] text-[#6b7280] mt-1">met</div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#dde3ec] p-4 shadow-sm text-center">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Endorsements</div>
                          <div className={cn("text-2xl font-mono font-bold", endorsementsMet === ENDORSEMENTS.length ? "text-[#2d7a4f]" : "text-[#e8a020]")}>{endorsementsMet}/{ENDORSEMENTS.length}</div>
                          <div className="text-[9px] text-[#6b7280] mt-1">completed</div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#dde3ec] p-4 shadow-sm text-center">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Total Time</div>
                          <div className="text-2xl font-mono font-bold text-[#1a3a5c]">{stats.totFlight.toFixed(1)}</div>
                          <div className="text-[9px] text-[#6b7280] mt-1">hours logged</div>
                        </div>
                      </div>

                      {REQS.map(section => (
                        <div key={section.section} className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                          <div className="px-4 py-3 border-b border-[#dde3ec] bg-[#f4f5f7]">
                            <h3 className="text-sm font-bold text-[#1c2333]">{section.section}</h3>
                            <p className="text-[10px] text-[#6b7280] font-mono">{section.ref} — FAR Part 61</p>
                          </div>
                          <div className="divide-y divide-[#dde3ec]">
                            {section.rows.map(row => {
                              const met = row.have >= row.need;
                              const pct = Math.min(100, Math.round((row.have / row.need) * 100));
                              return (
                                <div key={row.label} className={cn("p-4 flex items-start gap-4", met && "bg-[#fafffe]")}>
                                  <div className="mt-0.5 shrink-0">
                                    {met ? <CheckCircle2 size={18} className="text-[#2d7a4f]" /> : <XCircle size={18} className="text-[#c0392b]" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold font-mono text-[#6b7280] bg-[#f4f5f7] px-1.5 py-0.5 rounded">{row.ref}</span>
                                      <div className="text-[13px] font-medium text-[#1c2333] leading-tight">{row.label}</div>
                                    </div>
                                    {row.note && <div className="text-[11px] text-[#6b7280] mt-1 italic">{row.note}</div>}
                                    <div className="mt-3 space-y-1.5">
                                      <div className="flex justify-between items-end">
                                        <div className="flex items-baseline gap-1">
                                          <span className={cn("text-lg font-mono font-bold", met ? "text-[#2d7a4f]" : "text-[#c0392b]")}>
                                            {row.unit === 'landings' || row.unit === 'flight' ? row.have : (row.have || 0).toFixed(1)}
                                          </span>
                                          <span className="text-xs text-[#6b7280] font-mono">/ {row.need} {row.unit}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#6b7280]">{pct}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-[#f4f5f7] rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-500", met ? "bg-[#2d7a4f]" : "bg-[#2a5a8c]")} style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                  {row.mk && (
                                    <div className="shrink-0">
                                      {row.mk === 'nightXc100' || row.mk === 'soloXc150' || row.mk === 'soloTowered' || row.mk === 'ifrXc250' ? (
                                        met ? (
                                          <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2 text-[#2d7a4f] font-bold text-[11px]">
                                              <CheckCircle2 size={14} />
                                              {row.mk === 'soloTowered' ? `${row.have} of ${row.need} landings — ` : ''}
                                              Completed on {formatDate(getManualDate(row.mk))}
                                            </div>
                                            {editingDateKey === row.mk ? (
                                              <div className="flex items-center gap-2 mt-1">
                                                <input 
                                                  type="date"
                                                  value={tempDate}
                                                  onChange={(e) => setTempDate(e.target.value)}
                                                  className="h-[44px] border border-[#dde3ec] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#2a5a8c]"
                                                />
                                                <button 
                                                  onClick={() => {
                                                    saveManualDate(row.mk!, tempDate);
                                                    setEditingDateKey(null);
                                                  }}
                                                  className="text-[10px] font-bold text-[#2d7a4f] hover:underline"
                                                >
                                                  Save
                                                </button>
                                                <button 
                                                  onClick={() => setEditingDateKey(null)}
                                                  className="text-[10px] font-bold text-[#6b7280] hover:underline"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <button 
                                                onClick={() => {
                                                  setEditingDateKey(row.mk!);
                                                  setTempDate(getManualDate(row.mk!));
                                                }}
                                                className="flex items-center gap-1 text-[10px] font-bold text-[#1a3a5c] hover:underline"
                                              >
                                                <Pencil size={10} />
                                                Edit Date
                                              </button>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="flex flex-col gap-2 min-w-[160px]">
                                            {row.mk === 'soloTowered' && (
                                              <div className="flex flex-col gap-1">
                                                <label className="text-[9px] font-bold text-[#6b7280] uppercase tracking-wider">Landings Count</label>
                                                <input 
                                                  type="number"
                                                  min="0"
                                                  max="3"
                                                  defaultValue={row.have}
                                                  id={`count-${row.mk}`}
                                                  className="h-[44px] w-full border border-[#dde3ec] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a5a8c]"
                                                />
                                              </div>
                                            )}
                                            <div className="flex flex-col gap-1">
                                              <label className="text-[9px] font-bold text-[#6b7280] uppercase tracking-wider">
                                                {row.mk === 'soloTowered' ? 'Date of Last Landing' : 'Date Completed'}
                                              </label>
                                              <div className="flex items-center gap-2">
                                                <input 
                                                  type="date"
                                                  id={`date-${row.mk}`}
                                                  defaultValue={new Date().toISOString().split('T')[0]}
                                                  className="h-[44px] flex-1 border border-[#dde3ec] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2a5a8c]"
                                                />
                                                <button
                                                  onClick={() => {
                                                    const dateVal = (document.getElementById(`date-${row.mk}`) as HTMLInputElement).value;
                                                    const countVal = row.mk === 'soloTowered' ? parseInt((document.getElementById(`count-${row.mk}`) as HTMLInputElement).value) : 1;
                                                    handleSpecialLog(row, dateVal, countVal);
                                                  }}
                                                  className="h-[44px] px-4 rounded-lg bg-[#1a3a5c] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#2a5a8c] transition-all"
                                                >
                                                  Log
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      ) : (
                                        <button
                                          onClick={() => openModal(row.mk!, row.label, row.need, row.unit)}
                                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dde3ec] bg-white text-[#1a3a5c] hover:bg-[#f4f5f7] transition-all text-[10px] font-bold uppercase tracking-wider"
                                        >
                                          <Plus size={12} />
                                          Log
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#dde3ec] bg-[#f4f5f7] flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-bold text-[#1c2333]">ACS Task Checklist</h3>
                            <p className="text-[10px] text-[#6b7280] font-mono">Current Proficiency Status</p>
                          </div>
                          <div className="text-right">
                            {(() => {
                              const allTasks = acsData.flatMap((area, ai) => 
                                area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'))
                                  .map((_, ti) => `${ai}_${ti}`)
                              );
                              const completed = allTasks.filter(id => getMostRecentGrade(studentLessons, id) === 'S').length;
                              const pct = Math.round((completed / allTasks.length) * 100);
                              return (
                                <>
                                  <div className="text-xs font-bold text-[#1a3a5c]">{completed}/{allTasks.length}</div>
                                  <div className="text-[9px] font-bold text-[#6b7280] uppercase tracking-widest">{pct}% Complete</div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="divide-y divide-[#dde3ec] max-h-[400px] overflow-y-auto">
                          {acsData.map((area, ai) => {
                            const tasks = area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'));
                            if (tasks.length === 0) return null;

                            return (
                              <div key={area.area} className="bg-white">
                                <div className="bg-[#f8fafc] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec]">
                                  {area.area}
                                </div>
                                {tasks.map((task, ti) => {
                                  const taskId = `${ai}_${ti}`;
                                  const grade = getMostRecentGrade(studentLessons, taskId);
                                  const isComplete = grade === 'S';
                                  
                                  return (
                                    <div key={taskId} className="px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all">
                                      <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                          isComplete ? "bg-[#2d7a4f] text-white" : "bg-[#f1f5f9] text-[#cbd5e1] border border-[#e2e8f0]"
                                        )}>
                                          {isComplete ? <Check size={12} strokeWidth={3} /> : <div className="w-1 h-1 bg-current rounded-full" />}
                                        </div>
                                        <span className={cn("text-xs font-medium", isComplete ? "text-[#1c2333]" : "text-[#64748b]")}>
                                          {task.name}
                                        </span>
                                      </div>
                                      {grade && !isComplete && (
                                        <span className={cn(
                                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                          grade === 'N' ? "bg-[#fdecea] text-[#c0392b]" : "bg-[#fdf0d4] text-[#e8a020]"
                                        )}>
                                          {grade === 'N' ? 'Needs Impr.' : 'Incomplete'}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Note */}
                        <div className="bg-[#fffbeb] border border-[#fef3c7] p-4 rounded-xl flex gap-3 mb-2">
                          <AlertCircle size={18} className="text-[#d97706] shrink-0 mt-0.5" />
                          <p className="text-[11px] text-[#92400e] leading-relaxed">
                            <strong>Note:</strong> All endorsement language is from AC 61-65K. The instructor must ensure the student meets all requirements before signing any endorsement. These checkboxes serve as a record that the endorsement has been given. The actual endorsement must be recorded in the student's logbook.
                          </p>
                        </div>

                        {lessonRating === 'ppl' ? (
                          <div className="space-y-4">
                            {SOLO_OPTIONS.map(section => {
                              const isSectionComplete = (() => {
                                if (section.id === '1') return isEndorsementMet('A.1');
                                if (section.id === '2') return isEndorsementMet('A.3') && isEndorsementMet('A.4') && isEndorsementMet('A.6');
                                if (section.id === '3') return isEndorsementMet('A.8') && isEndorsementMet('A.9') && isEndorsementMet('A.10');
                                if (section.id === '4') return isEndorsementMet('A.12') || isEndorsementMet('A.13');
                                if (section.id === '5') return isEndorsementMet('A.32');
                                if (section.id === '6') return isEndorsementMet('A.33') && isEndorsementMet('A.34');
                                return false;
                              })();

                              const sectionEndorsementsMet = section.endorsements.filter((e: any) => isEndorsementMet(e.key)).length;
                              const isSectionInProgress = sectionEndorsementsMet > 0;
                              const isOpen = selectedSoloOption === section.id;

                              const headerBg = isSectionComplete ? "bg-[#f0fdf4]" : (section.id === '4' && !isSectionInProgress ? "bg-[#f4f5f7]" : "bg-[#1a3a5c]");
                              const titleColor = isSectionComplete ? "text-[#166534]" : (section.id === '4' && !isSectionInProgress ? "text-[#1c2333]" : "text-white");
                              const descColor = isSectionComplete ? "text-[#166534]/70" : (section.id === '4' && !isSectionInProgress ? "text-[#6b7280]" : "text-white/70");
                              const iconBg = isSectionComplete ? "bg-[#2d7a4f] text-white" : "bg-white text-[#1a3a5c]";
                              const badgeBg = isSectionComplete ? "bg-[#2d7a4f] text-white" : "bg-white/20 text-white";

                              return (
                                <div key={section.id} className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                                  <button
                                    onClick={() => setSelectedSoloOption(isOpen ? null : section.id)}
                                    className={cn("w-full px-4 py-4 flex items-center justify-between transition-all", headerBg)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", iconBg)}>
                                        {isSectionComplete ? <Check size={16} strokeWidth={3} /> : section.id}
                                      </div>
                                      <div className="text-left">
                                        <div className="flex items-center gap-2">
                                          <h3 className={cn("text-sm font-bold", titleColor)}>
                                            {section.label}
                                          </h3>
                                          {section.id === '4' && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#dde3ec] text-[#6b7280] uppercase tracking-widest">Optional</span>
                                          )}
                                        </div>
                                        <p className={cn("text-[10px] font-medium", descColor)}>{section.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeBg)}>
                                        {sectionEndorsementsMet}/{section.endorsements.length}
                                      </span>
                                      <ChevronRight size={16} className={cn(isSectionComplete || (section.id !== '4' || isSectionInProgress) ? "text-white" : "text-[#6b7280]", "transition-transform", isOpen && "rotate-90")} />
                                    </div>
                                  </button>

                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="p-2 space-y-1 bg-white border-t border-[#dde3ec]">
                                          {section.endorsements.map((e: any) => {
                                            const met = isEndorsementMet(e.key);
                                            return (
                                              <div
                                                key={e.key}
                                                onClick={() => handleToggleEndorsement(e.key, `AC 61-65K ${e.key}: ${e.text}`)}
                                                className={cn(
                                                  "p-4 flex items-start gap-4 cursor-pointer transition-all rounded-xl",
                                                  met ? "bg-[#fafffe]" : "hover:bg-[#f4f5f7]"
                                                )}
                                              >
                                                <div className="mt-0.5 shrink-0">
                                                  {met ? <CheckSquare size={18} className="text-[#2d7a4f]" /> : <Square size={18} className="text-[#dde3ec]" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start gap-2">
                                                    <span className="text-[10px] font-mono font-bold bg-[#f1f5f9] text-[#475569] px-1.5 py-0.5 rounded border border-[#e2e8f0] shrink-0">
                                                      AC 61-65K {e.key}
                                                    </span>
                                                    <div className={cn("text-[13px] font-medium leading-relaxed", met ? "text-[#2d7a4f]" : "text-[#1c2333]")}>
                                                      {e.text}
                                                    </div>
                                                  </div>
                                                  {met && (
                                                    <div className="text-[10px] text-[#6b7280] mt-2 ml-14">
                                                      Completed on {new Date(endorsements.find(end => end.endorsement_key === e.key && end.student_name === selectedLesson.student_name)?.completed_date || '').toLocaleDateString()}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}

                            {/* Endorsement Summary */}
                            {(() => {
                              const summaryLabels: Record<string, string> = {
                                '1': 'Prerequisites',
                                '2': 'Pre-Solo',
                                '3': 'Cross-Country',
                                '4': 'Class B',
                                '5': 'Knowledge Test',
                                '6': 'Checkride'
                              };

                              const summarySections = SOLO_OPTIONS.map(section => {
                                const givenInSection = section.endorsements.filter((e: any) => isEndorsementMet(e.key)).map((e: any) => {
                                  const record = endorsements.find(end => end.endorsement_key === e.key && end.student_name === selectedLesson.student_name);
                                  return {
                                    ...e,
                                    completed_date: record?.completed_date
                                  };
                                });
                                return {
                                  id: section.id,
                                  label: summaryLabels[section.id] || section.label,
                                  endorsements: givenInSection
                                };
                              }).filter(s => s.endorsements.length > 0);

                              if (summarySections.length === 0) return null;

                              return (
                                <div className="mt-8 bg-white rounded-2xl border border-[#dde3ec] border-l-4 border-l-[#2d7a4f] shadow-sm overflow-hidden">
                                  <div className="px-4 py-3 border-b border-[#dde3ec] bg-[#f8fafc]">
                                    <h3 className="text-sm font-bold text-[#1a3a5c]">Endorsements Given</h3>
                                  </div>
                                  <div className="p-4 space-y-4">
                                    {summarySections.map(s => (
                                      <div key={s.id} className="space-y-1">
                                        <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest ml-1">{s.label}</div>
                                        <div className="space-y-1">
                                          {s.endorsements.map(e => (
                                            <div key={e.key} className="h-9 px-3 flex items-center justify-between bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-[9px] font-bold bg-[#1a3a5c] text-white px-1.5 py-0.5 rounded shrink-0">
                                                  {e.key.replace('A.', 'A.')}
                                                </span>
                                                <span className="text-[11px] font-medium text-[#1c2333] truncate">
                                                  {e.text.split(' — ')[1]?.split(': ')[0] || e.text.substring(0, 40) + '...'}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                                <span className="text-[10px] text-[#6b7280] font-medium">
                                                  {new Date(e.completed_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <div className="w-4 h-4 rounded-full bg-[#2d7a4f]/10 flex items-center justify-center text-[#2d7a4f]">
                                                  <Check size={10} strokeWidth={3} />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {SOLO_OPTIONS.map(section => {
                              const isSectionComplete = (() => {
                                if (section.id === '1') return isEndorsementMet('A.42');
                                if (section.id === '2') return isEndorsementMet('A.1') && isEndorsementMet('A.44');
                                if (section.id === '3') return isEndorsementMet('A.43');
                                return false;
                              })();

                              const sectionEndorsementsMet = section.endorsements.filter((e: any) => isEndorsementMet(e.key)).length;
                              const isSectionInProgress = sectionEndorsementsMet > 0;
                              const isOpen = selectedSoloOption === section.id;

                              const headerBg = isSectionComplete ? "bg-[#f0fdf4]" : (!isSectionInProgress ? "bg-[#f4f5f7]" : "bg-[#1a3a5c]");
                              const titleColor = isSectionComplete ? "text-[#166534]" : (!isSectionInProgress ? "text-[#1c2333]" : "text-white");
                              const descColor = isSectionComplete ? "text-[#166534]/70" : (!isSectionInProgress ? "text-[#6b7280]" : "text-white/70");
                              const iconBg = isSectionComplete ? "bg-[#2d7a4f] text-white" : "bg-white text-[#1a3a5c]";
                              const badgeBg = isSectionComplete ? "bg-[#2d7a4f] text-white" : "bg-white/20 text-white";

                              return (
                                <div key={section.id} className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                                  <button
                                    onClick={() => setSelectedSoloOption(isOpen ? null : section.id)}
                                    className={cn("w-full px-4 py-4 flex items-center justify-between transition-all", headerBg)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold", iconBg)}>
                                        {isSectionComplete ? <Check size={16} strokeWidth={3} /> : section.id}
                                      </div>
                                      <div className="text-left">
                                        <h3 className={cn("text-sm font-bold", titleColor)}>
                                          {section.label}
                                        </h3>
                                        <p className={cn("text-[10px] font-medium", descColor)}>{section.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badgeBg)}>
                                        {sectionEndorsementsMet}/{section.endorsements.length}
                                      </span>
                                      <ChevronRight size={16} className={cn(isSectionComplete || isSectionInProgress ? "text-white" : "text-[#6b7280]", "transition-transform", isOpen && "rotate-90")} />
                                    </div>
                                  </button>

                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="p-2 space-y-1 bg-white border-t border-[#dde3ec]">
                                          {section.endorsements.map((e: any) => {
                                            const met = isEndorsementMet(e.key);
                                            return (
                                              <div
                                                key={e.key}
                                                onClick={() => handleToggleEndorsement(e.key, `AC 61-65K ${e.key}: ${e.text}`)}
                                                className={cn(
                                                  "p-4 flex items-start gap-4 cursor-pointer transition-all rounded-xl",
                                                  met ? "bg-[#fafffe]" : "hover:bg-[#f4f5f7]"
                                                )}
                                              >
                                                <div className="mt-0.5 shrink-0">
                                                  {met ? <CheckSquare size={18} className="text-[#2d7a4f]" /> : <Square size={18} className="text-[#dde3ec]" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-start gap-2">
                                                    <span className="text-[10px] font-mono font-bold bg-[#f1f5f9] text-[#475569] px-1.5 py-0.5 rounded border border-[#e2e8f0] shrink-0">
                                                      AC 61-65K {e.key}
                                                    </span>
                                                    <div className={cn("text-[13px] font-medium leading-relaxed", met ? "text-[#2d7a4f]" : "text-[#1c2333]")}>
                                                      {e.text}
                                                    </div>
                                                  </div>
                                                  {met && (
                                                    <div className="text-[10px] text-[#6b7280] mt-2 ml-14">
                                                      Completed on {new Date(endorsements.find(end => end.endorsement_key === e.key && end.student_name === selectedLesson.student_name)?.completed_date || '').toLocaleDateString()}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}

                            {/* Endorsement Summary */}
                            {(() => {
                              const summaryLabels: Record<string, string> = {
                                '1': 'Knowledge Test',
                                '2': 'Prerequisites',
                                '3': 'Checkride'
                              };

                              const summarySections = SOLO_OPTIONS.map(section => {
                                const givenInSection = section.endorsements.filter((e: any) => isEndorsementMet(e.key)).map((e: any) => {
                                  const record = endorsements.find(end => end.endorsement_key === e.key && end.student_name === selectedLesson.student_name);
                                  return {
                                    ...e,
                                    completed_date: record?.completed_date
                                  };
                                });
                                return {
                                  id: section.id,
                                  label: summaryLabels[section.id] || section.label,
                                  endorsements: givenInSection
                                };
                              }).filter(s => s.endorsements.length > 0);

                              if (summarySections.length === 0) return null;

                              return (
                                <div className="mt-8 bg-white rounded-2xl border border-[#dde3ec] border-l-4 border-l-[#2d7a4f] shadow-sm overflow-hidden">
                                  <div className="px-4 py-3 border-b border-[#dde3ec] bg-[#f8fafc]">
                                    <h3 className="text-sm font-bold text-[#1a3a5c]">Endorsements Given</h3>
                                  </div>
                                  <div className="p-4 space-y-4">
                                    {summarySections.map(s => (
                                      <div key={s.id} className="space-y-1">
                                        <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest ml-1">{s.label}</div>
                                        <div className="space-y-1">
                                          {s.endorsements.map(e => (
                                            <div key={e.key} className="h-9 px-3 flex items-center justify-between bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-[9px] font-bold bg-[#1a3a5c] text-white px-1.5 py-0.5 rounded shrink-0">
                                                  {e.key}
                                                </span>
                                                <span className="text-[11px] font-medium text-[#1c2333] truncate">
                                                  {e.text.split(' — ')[1]?.split(': ')[0] || e.text.substring(0, 40) + '...'}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                                <span className="text-[10px] text-[#6b7280] font-medium">
                                                  {new Date(e.completed_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <div className="w-4 h-4 rounded-full bg-[#2d7a4f]/10 flex items-center justify-center text-[#2d7a4f]">
                                                  <Check size={10} strokeWidth={3} />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
                </div>
              </div>
            </div>
          )}
        </main>

      {/* Manual Hours Modal */}
      <AnimatePresence>
        {isModalOpen && modalData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-[#1c2333]">{modalData.label}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-[#6b7280] hover:text-[#1c2333]">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-xs text-[#6b7280] mb-4 leading-relaxed">
                  Required: {modalData.need} {modalData.unit === 'flight' ? 'flight(s)' : modalData.unit}. Add one entry per session.
                </p>

                <div className="max-h-32 overflow-y-auto mb-4 space-y-2">
                  {getManualEntries(modalData.key).map((e, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#dde3ec] text-xs">
                      <span className="text-[#1c2333]">{e.date} — {e.val.toFixed(modalData.unit === 'flight' || modalData.unit === 'landings' ? 0 : 1)} {modalData.unit}</span>
                      <button onClick={() => handleDeleteManualEntry(idx)} className="text-[#c0392b] hover:bg-[#fdecea] p-1 rounded transition-all">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {getManualEntries(modalData.key).length === 0 && (
                    <div className="text-[11px] text-[#6b7280] italic">No entries yet.</div>
                  )}
                </div>

                <div className="text-xs font-bold text-[#1c2333] mb-4">
                  Total: {getManualValue(modalData.key).toFixed(modalData.unit === 'flight' || modalData.unit === 'landings' ? 0 : 1)} / {modalData.need} {modalData.unit === 'flight' ? 'flight(s)' : modalData.unit}
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step={modalData.unit === 'landings' || modalData.unit === 'flight' ? "1" : "0.1"}
                    min={modalData.unit === 'landings' || modalData.unit === 'flight' ? "0" : undefined}
                    max={modalData.unit === 'landings' || modalData.unit === 'flight' ? "99" : undefined}
                    value={newEntryVal}
                    onChange={(e) => setNewEntryVal(e.target.value)}
                    placeholder={modalData.unit === 'landings' || modalData.unit === 'flight' ? "0" : "0.0"}
                    className="flex-1 text-sm font-mono border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c]"
                  />
                  <button
                    onClick={handleAddManualEntry}
                    className="bg-[#1a3a5c] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2a5a8c] transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
