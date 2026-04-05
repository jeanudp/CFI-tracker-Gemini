import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, ManualHours, ManualHoursEntry, Grade, Endorsement } from '../types';
import { ALL_ACS, ACS_ELEMENTS, RATINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Search, Trash2, ChevronRight, ChevronLeft, Filter, Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Plus, X, Loader2, BookOpen, Edit, History as HistoryIcon, CheckSquare, Square, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function History() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [manualHours, setManualHours] = useState<ManualHours[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedSoloOption, setSelectedSoloOption] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'lesson' | 'cumulative' | 'checkride'>('lesson');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ key: string, label: string, need: number, unit: string } | null>(null);
  const [newEntryVal, setNewEntryVal] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const getRatingBadgeColor = (code: string) => {
    const c = code?.toLowerCase();
    if (c === 'ir') return "bg-[#7c3aed] text-white";
    if (c === 'cpl') return "bg-[#059669] text-white";
    if (c === 'cfi') return "bg-[#ea580c] text-white";
    if (c === 'cfii') return "bg-[#0d9488] text-white";
    if (c === 'mei') return "bg-[#dc2626] text-white";
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
            {lesson.instructor ? ` · ${lesson.instructor}` : ''}
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

  const getCumulativeStats = () => {
    let totFlight = 0, totDual = 0, totXc = 0, totNight = 0, totNightLdg = 0, totSim = 0, totSolo = 0, totSoloXc = 0, totLdg = 0, totLdgDay = 0, totLdgNight = 0;
    studentLessons.forEach(l => {
      const m = l.meta || {};
      totFlight += parseFloat(m.totalFlight || '0') || 0;
      totDual += parseFloat(m.dual || '0') || 0;
      totXc += parseFloat(m.xc || '0') || 0;
      totNight += parseFloat(m.night || '0') || 0;
      totNightLdg += parseInt(m.ldgNight || '0') || 0;
      totSim += parseFloat(m.simInst || '0') || 0;
      totSolo += parseFloat(m.solo || '0') || 0;
      totSoloXc += parseFloat(m.soloXc || '0') || 0;
      totLdg += parseInt(m.ldgTotal || '0') || 0;
      totLdgDay += parseInt(m.ldgDay || '0') || 0;
      totLdgNight += parseInt(m.ldgNight || '0') || 0;
    });
    return { totFlight, totDual, totXc, totNight, totNightLdg, totSim, totSolo, totSoloXc, totLdg, totLdgDay, totLdgNight };
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
    <div className="flex h-full overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-[320px] bg-white border-r border-[#dde3ec] flex flex-col shrink-0 h-full shadow-sm z-20">
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
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-2 border-b border-[#dde3ec] flex justify-between items-center">
                <span className="text-[10px] font-black text-[#059669] uppercase tracking-widest">Ground Lessons ({groundLessons.length})</span>
              </div>
              <div className="divide-y divide-[#f1f5f9]">
                {groundLessons.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-[#94a3b8] italic">No ground lessons yet.</div>
                ) : (
                  groundLessons.map(l => renderLessonItem(l))
                )}
              </div>

              {/* Flight Lessons Section */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-2 border-b border-[#dde3ec] border-t border-[#dde3ec] mt-4 flex justify-between items-center">
                <span className="text-[10px] font-black text-[#1a3a5c] uppercase tracking-widest">Flight Lessons ({flightLessons.length})</span>
              </div>
              <div className="divide-y divide-[#f1f5f9]">
                {flightLessons.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-[#94a3b8] italic">No flight lessons yet.</div>
                ) : (
                  flightLessons.map(l => renderLessonItem(l))
                )}
              </div>
            </div>
          )}
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
                  <div className="p-4 space-y-2">
                    {[
                      ['Date', selectedLesson.meta?.date],
                      ['Aircraft', selectedLesson.meta?.aircraft],
                      ['Route', selectedLesson.meta?.route],
                      ['Total Landings', selectedLesson.meta?.ldgTotal],
                      ['Day Landings', selectedLesson.meta?.ldgDay],
                      ['Night Landings', selectedLesson.meta?.ldgNight],
                      ['Cross-Country', selectedLesson.meta?.xc ? `${selectedLesson.meta.xc}h` : ''],
                      ['Night', selectedLesson.meta?.night ? `${selectedLesson.meta.night}h` : ''],
                      ['Sim. Instrument', selectedLesson.meta?.simInst ? `${selectedLesson.meta.simInst}h` : ''],
                      ['Dual Received', selectedLesson.meta?.dual ? `${selectedLesson.meta.dual}h` : ''],
                      ['Solo', selectedLesson.meta?.solo ? `${selectedLesson.meta.solo}h` : ''],
                      ['Solo X-Country', selectedLesson.meta?.soloXc ? `${selectedLesson.meta.soloXc}h` : ''],
                      ['Total Flight Time', selectedLesson.meta?.totalFlight ? `${selectedLesson.meta.totalFlight}h` : '']
                    ].filter(d => d[1]).map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#dde3ec] last:border-0">
                        <span className="text-xs text-[#6b7280]">{label}</span>
                        <span className="text-sm font-bold text-[#1c2333]">{val}</span>
                      </div>
                    ))}
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
                      const tasksInArea = area.tasks.map((task, ti) => ({ task, id: `${ai}_${ti}` }))
                        .filter(t => selectedLesson.grades?.[t.id]);
                      if (tasksInArea.length === 0) return null;

                      return (
                        <React.Fragment key={area.area}>
                          <div className="bg-[#1a3a5c] text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                            {area.area}
                          </div>
                          {tasksInArea.map(t => (
                            <div key={t.id} className="grid grid-cols-[1fr_50px_1fr] items-center min-h-[34px] border-b border-[#dde3ec] last:border-0">
                              <div className="px-4 py-2 text-xs font-medium text-[#1c2333]">{t.task}</div>
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
                      const tasks = area.tasks.filter(t => !t.includes('N/A'));
                      if (tasks.length === 0) return null;
                      const sat = tasks.filter((_, ti) => studentLessons.some(l => l.grades?.[`${ai}_${ti}`] === 'S')).length;
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
                  <div className="p-4 space-y-2">
                    {(() => {
                      const stats = getCumulativeStats();
                      return ([
                        ['Total Flight Time', stats.totFlight],
                        ['Dual Received', stats.totDual],
                        ['Cross-Country', stats.totXc],
                        ['Night', stats.totNight],
                        ['Sim. Instrument', stats.totSim],
                        ['Solo', stats.totSolo],
                        ['Solo X-Country', stats.totSoloXc],
                        ['Total Landings', stats.totLdg],
                        ['Day Landings', stats.totLdgDay],
                        ['Night Landings', stats.totNightLdg]
                      ] as [string, number][]).map(([label, val]) => (
                        <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#dde3ec] last:border-0">
                          <span className="text-xs text-[#6b7280]">{label}</span>
                          <span className="text-sm font-bold font-mono text-[#1a3a5c]">{typeof val === 'number' ? (label.includes('Landings') ? val : val.toFixed(1)) : '—'}</span>
                        </div>
                      ));
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
                          area.tasks.forEach((task, ti) => {
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
                            <strong className="text-[#1c2333]">{g.task}</strong> <span className="text-[#6b7280]">({g.area})</span>
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'checkride' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {(() => {
                  const stats = getCumulativeStats();
                  const sls = studentLessons;
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
                        { label: 'Cross-country flight training', ref: '§61.109(a)(1)(i)', have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.dual || '0') > 0 ? parseFloat(l.meta?.xc || '0') : 0), 0), need: 3, unit: 'hrs' },
                        { label: 'Night flight training (incl. 100NM XC)', ref: '§61.109(a)(1)(ii)', have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.dual || '0') > 0 ? parseFloat(l.meta?.night || '0') : 0), 0), need: 3, unit: 'hrs' },
                        { label: 'Night cross-country over 100NM', ref: '§61.109(a)(1)(ii)', have: getManualValue('nightXc100'), need: 1, unit: 'flight', mk: 'nightXc100' },
                        { label: 'Full stop night landings', ref: '§61.109(a)(1)(ii)', have: stats.totNightLdg, need: 10, unit: 'ldg' },
                        { label: 'Instrument training', ref: '§61.109(a)(1)(iii)', have: stats.totSim, need: 3, unit: 'hrs' },
                        { label: 'Practical test prep dual (60 days)', ref: '§61.109(a)(1)(iv)', have: recentDual, need: 3, unit: 'hrs', note: sixtyDaysStr },
                        { label: 'Solo flight time', ref: '§61.109(a)(2)', have: stats.totSolo, need: 10, unit: 'hrs' },
                        { label: 'Solo cross-country', ref: '§61.109(a)(2)(i)', have: stats.totSoloXc, need: 5, unit: 'hrs' },
                        { label: 'Solo XC 150NM total', ref: '§61.109(a)(2)(ii)', have: getManualValue('soloXc150'), need: 1, unit: 'flight', mk: 'soloXc150' },
                        { label: 'Solo landings at towered airport', ref: '§61.109(a)(2)(iii)', have: getManualValue('soloTowered'), need: 3, unit: 'ldg', mk: 'soloTowered' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A1', text: 'AC 61-65K A.1 — Student pilot certificate §61.85: I certify that [First name, MI, Last name] has met the eligibility requirements of §61.83 and has demonstrated satisfactory proficiency and safety as required by §61.87 in a [make and model aircraft]' },
                      { key: 'A2', text: 'AC 61-65K A.2 — Pre-solo aeronautical knowledge §61.87(b): I certify that [First name, MI, Last name] has demonstrated satisfactory aeronautical knowledge of the rules and procedures that apply to student solo flight operations under §61.87(b)(1) through (14)' },
                      { key: 'A3', text: 'AC 61-65K A.3 — Pre-solo flight training §61.87(c): I certify that [First name, MI, Last name] has received and logged flight training in the maneuvers and procedures listed in §61.87(d)(1) through (d)(n) and is prepared for the solo flight(s)' },
                      { key: 'A4', text: 'AC 61-65K A.4 — Pre-solo 90-day endorsement §61.87(n): I certify that [First name, MI, Last name] has received the required training of §61.87. I have determined that he/she is prepared to make solo flights in a [make and model aircraft]. This endorsement expires 90 days from the date signed' },
                      { key: 'A4_xc', text: 'AC 61-65K A.4 — 90-day solo endorsement must still be current and not expired §61.87(n). Verify expiration date before every solo cross-country flight' },
                      { key: 'A9', text: 'AC 61-65K A.9 — Solo cross-country flight planning §61.93(c)(1): I certify that [First name, MI, Last name] has received solo cross-country training. I have reviewed the cross-country planning of the flight described below and find the planning and the student\'s preparation to be adequate for the proposed cross-country flight under VFR. The student is authorized to conduct the following solo cross-country flight: From [departure airport] to [destination airport] via [route] on [date] in a [make and model aircraft]' },
                      { key: 'A10', text: 'AC 61-65K A.10 — Solo cross-country §61.93(c)(2): I certify that [First name, MI, Last name] has received the required solo cross-country training and endorsements required by §61.93. I have determined that he/she is prepared to make solo cross-country flights in a [make and model aircraft] in [geographical area]' },
                      { key: 'A4_b', text: 'AC 61-65K A.4 — 90-day solo endorsement must still be current §61.87(n). Must not be expired' },
                      { key: 'A11', text: 'AC 61-65K A.11 — Solo flight in Class B airspace §61.95(a): I certify that [First name, MI, Last name] has received the required training in [name of Class B airspace area]. I have determined he/she is prepared to conduct solo flight operations in that airspace' },
                      { key: 'A12', text: 'AC 61-65K A.12 — Solo flight to from or at a Class B airport §61.95(b) and §91.131(b)(1): I certify that [First name, MI, Last name] has received the required training for [name of airport]. I have determined he/she is prepared to conduct solo flight operations at that airport' },
                      { key: 'A32', text: 'AC 61-65K A.32 — Aeronautical knowledge test §61.35(a)(1): I certify that [First name, MI, Last name] has received the required training of §61.105. I have determined that he/she is prepared for the Private Pilot knowledge test' },
                      { key: 'A33', text: 'AC 61-65K A.33 — Flight proficiency and aeronautical experience §61.103(f): I certify that [First name, MI, Last name] has received the required training of §61.107(b)(1) through (b)(n). I have determined that he/she meets the applicable aeronautical experience requirements of §61.109 and is prepared for the Private Pilot practical test' },
                      { key: 'A34', text: 'AC 61-65K A.34 — Practical test within 60 days §61.39(a)(6)(i) and (ii): I certify that [First name, MI, Last name] has received flight training within the preceding 60 days and I have determined he/she is prepared for the Private Pilot practical test' }
                    ];
                    SOLO_OPTIONS = [
                      { id: '1', label: 'Section 1 — Student Pilot Certificate and Pre-Solo', description: 'Required for first solo flight in a specific make and model.', endorsements: ENDORSEMENTS.slice(0, 4) },
                      { id: '2', label: 'Section 2 — Solo Cross-Country', description: 'Required for solo cross-country flights.', endorsements: ENDORSEMENTS.slice(4, 7) },
                      { id: '3', label: 'Section 3 — Solo Flight in Class B Airspace or to Class B Airport', description: 'Required for solo operations in or around Class B airspace.', endorsements: ENDORSEMENTS.slice(7, 10) },
                      { id: '4', label: 'Section 4 — Knowledge Test', description: 'Required before taking the Private Pilot knowledge test.', endorsements: ENDORSEMENTS.slice(10, 11) },
                      { id: '5', label: 'Section 5 — Practical Test Checkride', description: 'Required before taking the Private Pilot practical test.', endorsements: ENDORSEMENTS.slice(11, 13) }
                    ];
                  } else if (lessonRating === 'ir') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.65(d)', rows: [
                        { label: 'Cross-country PIC', ref: '§61.65(d)(1)', have: stats.totXc, need: 50, unit: 'hrs' },
                        { label: 'Actual or simulated instrument', ref: '§61.65(d)(2)', have: stats.totSim, need: 40, unit: 'hrs' },
                        { label: 'Instrument training from instructor', ref: '§61.65(d)(3)', have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.dual || '0') > 0 ? parseFloat(l.meta?.simInst || '0') : 0), 0), need: 15, unit: 'hrs' },
                        { label: 'Instrument training (60 days)', ref: '§61.65(d)(4)', have: recentInst, need: 3, unit: 'hrs', note: sixtyDaysStr },
                        { label: 'IFR XC 250NM', ref: '§61.65(d)(5)', have: getManualValue('ifrXc250'), need: 1, unit: 'flight', mk: 'ifrXc250' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.32', label: 'AC 61-65 A.32 — Aeronautical knowledge test §61.35(a)(1)' },
                      { key: 'A.35', label: 'AC 61-65 A.35 — Instrument rating aeronautical knowledge test' },
                      { key: 'A.36', label: 'AC 61-65 A.36 — Instrument rating practical test §61.65(a)(6)' },
                      { key: 'A.37', label: 'AC 61-65 A.37 — Instrument practical test within 60 days §61.39(a)(6)(i)' }
                    ];
                  } else if (lessonRating === 'cpl') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.129(a)', rows: [
                        { label: 'Total flight time', ref: '§61.129(a)(1)', have: stats.totFlight, need: 250, unit: 'hrs' },
                        { label: 'Powered aircraft time', ref: '§61.129(a)(2)', have: stats.totFlight, need: 100, unit: 'hrs' },
                        { label: 'PIC flight time', ref: '§61.129(a)(3)(i)', have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.pic || '0') || (parseFloat(l.meta?.solo || '0') > 0 ? parseFloat(l.meta.totalFlight || '0') : 0)), 0), need: 100, unit: 'hrs' },
                        { label: 'Cross-country PIC', ref: '§61.129(a)(3)(ii)', have: stats.totXc, need: 50, unit: 'hrs' },
                        { label: 'Instrument training', ref: '§61.129(a)(4)(i)', have: stats.totSim, need: 10, unit: 'hrs' },
                        { label: 'Complex or turbine aircraft', ref: '§61.129(a)(4)(ii)', have: getManualValue('complex'), need: 10, unit: 'hrs', mk: 'complex' },
                        { label: '2-hr Day XC > 100NM', ref: '§61.129(a)(4)(iii)', have: getManualValue('dayXc100'), need: 1, unit: 'flight', mk: 'dayXc100' },
                        { label: '2-hr Night XC > 100NM', ref: '§61.129(a)(4)(iv)', have: getManualValue('nightXc100'), need: 1, unit: 'flight', mk: 'nightXc100' },
                        { label: 'Practical test prep dual (60 days)', ref: '§61.129(a)(4)(v)', have: recentDual, need: 3, unit: 'hrs', note: sixtyDaysStr },
                        { label: 'Solo PIC time', ref: '§61.129(a)(5)(i)', have: stats.totSolo, need: 10, unit: 'hrs' },
                        { label: 'Night VFR with 10 landings towered', ref: '§61.129(a)(5)(ii)', have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.solo || '0') > 0 ? parseFloat(l.meta.night || '0') : 0), 0) >= 5 && stats.totNightLdg >= 10 ? 1 : 0, need: 1, unit: 'flight' },
                        { label: 'Solo XC 300NM', ref: '§61.129(a)(5)(iii)', have: getManualValue('soloXc300'), need: 1, unit: 'flight', mk: 'soloXc300' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.32', label: 'AC 61-65 A.32 — Aeronautical knowledge test §61.35(a)(1)' },
                      { key: 'A.38', label: 'AC 61-65 A.38 — Commercial pilot aeronautical knowledge test' },
                      { key: 'A.39', label: 'AC 61-65 A.39 — Commercial pilot practical test §61.129(a)' },
                      { key: 'A.40', label: 'AC 61-65 A.40 — Commercial practical test within 60 days §61.39(a)(6)(i)' }
                    ];
                  } else if (lessonRating === 'cfi') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.183', rows: [
                        { label: 'PIC in category and class', ref: '§61.183(g)', have: stats.totFlight, need: 15, unit: 'hrs' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.32', label: 'AC 61-65 A.32 — Fundamentals of instruction knowledge test §61.35(a)(1)' },
                      { key: 'A.41', label: 'AC 61-65 A.41 — Fundamentals of instruction knowledge test §61.183(d)' },
                      { key: 'A.42', label: 'AC 61-65 A.42 — Flight instructor aeronautical knowledge test §61.183(f)' },
                      { key: 'A.43', label: 'AC 61-65 A.43 — Flight instructor practical test §61.183(g)' },
                      { key: 'A.44', label: 'AC 61-65 A.44 — Spin training endorsement §61.183(i)' },
                      { key: 'A.45', label: 'AC 61-65 A.45 — Practical test within 60 days §61.39(a)(6)(i)' },
                      { key: 'cfi_d', label: '§61.183(d) — Hold at least a commercial pilot certificate' },
                      { key: 'cfi_e', label: '§61.183(e) — Pass fundamentals of instruction knowledge test' },
                      { key: 'cfi_f', label: '§61.183(f) — Pass flight instructor knowledge test' },
                      { key: 'cfi_j', label: '§61.183(j) — Training and endorsement within 2 calendar months' }
                    ];
                  } else if (lessonRating === 'cfii') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.187(b)', rows: [
                        { label: 'Instrument flight training', ref: '§61.187(b)(7)', have: stats.totSim, need: 15, unit: 'hrs' },
                        { label: 'Instrument recent experience §61.57(c)', ref: '§61.187(b)', have: recentInst6mo >= 0.1 ? 1 : 0, need: 1, unit: 'flight' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.32', label: 'AC 61-65 A.32 — Aeronautical knowledge test §61.35(a)(1)' },
                      { key: 'A.46', label: 'AC 61-65 A.46 — Instrument flight instructor aeronautical knowledge test' },
                      { key: 'A.47', label: 'AC 61-65 A.47 — Instrument flight instructor practical test §61.187(a)' },
                      { key: 'A.48', label: 'AC 61-65 A.48 — Practical test within 60 days §61.39(a)(6)(i)' },
                      { key: 'cfii_1', label: '§61.187(b)(1) — Hold a flight instructor certificate' },
                      { key: 'cfii_2', label: '§61.187(b)(2) — Hold an instrument rating' },
                      { key: 'cfii_end', label: '§61.187(b) — Logbook endorsement within 2 calendar months' }
                    ];
                  } else if (lessonRating === 'mei') {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.195(h)', rows: [
                        { label: 'PIC in multiengine airplane', ref: '§61.195(h)(3)', have: getManualValue('mePic'), need: 5, unit: 'hrs', mk: 'mePic' }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.32', label: 'AC 61-65 A.32 — Aeronautical knowledge test §61.35(a)(1)' },
                      { key: 'A.72', label: 'AC 61-65 A.72 — Multiengine class rating practical test' },
                      { key: 'A.73', label: 'AC 61-65 A.73 — Multiengine flight instructor practical test §61.195(h)' },
                      { key: 'A.48', label: 'AC 61-65 A.48 — Practical test within 60 days §61.39(a)(6)(i)' },
                      { key: 'mei_1', label: '§61.195(h)(1) — Hold a flight instructor certificate' },
                      { key: 'mei_2', label: '§61.195(h)(2) — Hold a multiengine class rating' },
                      { key: 'mei_4', label: '§61.195(h)(4) — Logbook endorsement for multiengine competency' }
                    ];
                  }

                  const allRows = REQS.flatMap(r => r.rows);
                  const metCount = allRows.filter(r => r.have >= r.need).length;
                  const endorsementsMet = ENDORSEMENTS.filter(e => isEndorsementMet(e.key)).length;
                  const allMet = allRows.length > 0 && 
                                metCount === allRows.length && 
                                ENDORSEMENTS.length > 0 && 
                                endorsementsMet === ENDORSEMENTS.length;

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
                          <p className="text-sm opacity-90">All FAR Part 61 requirements and AC 61-65 endorsements have been met.</p>
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
                                            {row.unit === 'ldg' || row.unit === 'flight' ? row.have : (row.have || 0).toFixed(1)}
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
                                    <button
                                      onClick={() => openModal(row.mk!, row.label, row.need, row.unit)}
                                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dde3ec] bg-white text-[#1a3a5c] hover:bg-[#f4f5f7] transition-all text-[10px] font-bold uppercase tracking-wider"
                                    >
                                      <Plus size={12} />
                                      Log
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

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
                              const sectionEndorsementsMet = section.endorsements.filter((e: any) => isEndorsementMet(e.key)).length;
                              const isSectionComplete = sectionEndorsementsMet === section.endorsements.length;
                              const isOpen = selectedSoloOption === section.id;

                              return (
                                <div key={section.id} className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                                  <button
                                    onClick={() => setSelectedSoloOption(isOpen ? null : section.id)}
                                    className={cn(
                                      "w-full px-4 py-4 flex items-center justify-between transition-all",
                                      isSectionComplete ? "bg-[#f0fdf4]" : "bg-[#f4f5f7]"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                        isSectionComplete ? "bg-[#2d7a4f] text-white" : "bg-white text-[#1a3a5c] border border-[#dde3ec]"
                                      )}>
                                        {isSectionComplete ? <CheckCircle2 size={16} /> : section.id}
                                      </div>
                                      <div className="text-left">
                                        <h3 className={cn("text-sm font-bold", isSectionComplete ? "text-[#166534]" : "text-[#1c2333]")}>
                                          {section.label}
                                        </h3>
                                        <p className="text-[10px] text-[#6b7280] font-medium">{section.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                        isSectionComplete ? "bg-[#2d7a4f] text-white" : "bg-[#dde3ec] text-[#6b7280]"
                                      )}>
                                        {sectionEndorsementsMet}/{section.endorsements.length}
                                      </span>
                                      <ChevronRight size={16} className={cn("text-[#6b7280] transition-transform", isOpen && "rotate-90")} />
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
                          </div>
                        ) : (
                          <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden mb-6">
                            <div className="px-4 py-3 border-b border-[#dde3ec] bg-[#f4f5f7]">
                              <h3 className="text-sm font-bold text-[#1c2333]">Endorsements</h3>
                              <p className="text-[10px] text-[#6b7280] font-mono">AC 61-65K</p>
                            </div>
                            <div className="divide-y divide-[#dde3ec]">
                              {ENDORSEMENTS.map(e => {
                                const met = isEndorsementMet(e.key);
                                return (
                                  <div 
                                    key={e.key} 
                                    onClick={() => handleToggleEndorsement(e.key, `AC 61-65K ${e.key}: ${e.text || e.label}`)}
                                    className={cn("p-4 flex items-start gap-4 cursor-pointer transition-all", met ? "bg-[#fafffe]" : "hover:bg-[#f4f5f7]")}
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
                                          {e.text || e.label}
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
                      <span className="text-[#1c2333]">{e.date} — {e.val.toFixed(modalData.unit === 'flight' ? 0 : 1)} {modalData.unit}</span>
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
                  Total: {getManualValue(modalData.key).toFixed(modalData.unit === 'flight' ? 0 : 1)} / {modalData.need} {modalData.unit === 'flight' ? 'flight(s)' : modalData.unit}
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={newEntryVal}
                    onChange={(e) => setNewEntryVal(e.target.value)}
                    placeholder="0.0"
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
