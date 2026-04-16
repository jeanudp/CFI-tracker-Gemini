import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Student, Lesson, PassedRating } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, Trash2, ChevronRight, ChevronDown, BookOpen, Plane, History, Loader2, TrendingUp, CheckCircle2, AlertCircle, Award, CheckCircle, X, FileText, Cloud, Gauge, ClipboardList, Compass, Navigation, Archive, RotateCcw, Shield, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

import { ALL_ACS, RATINGS } from '../constants';

const CurrencyRow = ({ 
  title, 
  reference, 
  isCurrent, 
  isNotApplicable, 
  classBadge,
  children, 
  isExpanded, 
  onToggle 
}: { 
  title: string, 
  reference: string, 
  isCurrent: boolean, 
  isNotApplicable?: boolean, 
  classBadge?: 'ASEL' | 'AMEL',
  children: React.ReactNode, 
  isExpanded: boolean, 
  onToggle: () => void 
}) => {
  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1c2333]">{title}</span>
            {classBadge && (
              <span className={cn(
                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter text-white",
                classBadge === 'AMEL' ? "bg-[#7c3aed]" : "bg-[#1a3a5c]"
              )}>
                {classBadge}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#6b7280]">{reference}</span>
        </div>
        <div className="flex items-center gap-3">
          {isNotApplicable ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-widest">
              Not Applicable
            </span>
          ) : (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest",
              isCurrent ? "bg-[#e4f5ec] text-[#2d7a4f]" : "bg-[#fdecea] text-[#c0392b]"
            )}>
              {isCurrent ? 'Current' : 'Not Current'}
            </span>
          )}
          <ChevronRight 
            size={16} 
            className={cn(
              "text-[#6b7280] transition-transform duration-200",
              isExpanded ? "rotate-90" : "rotate-0"
            )} 
          />
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [preSoloTestResult, setPreSoloTestResult] = useState<any>(null);
  
  // Rating Selection Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [pendingStudentName, setPendingStudentName] = useState('');
  const [selectedRatingCode, setSelectedRatingCode] = useState<string | null>(null);

  // Checkride Flow State
  const [isCheckrideConfirmOpen, setIsCheckrideConfirmOpen] = useState(false);
  const [isNextRatingModalOpen, setIsNextRatingModalOpen] = useState(false);
  const [processingCheckride, setProcessingCheckride] = useState(false);
  const [manualHours, setManualHours] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [isUndoConfirmOpen, setIsUndoConfirmOpen] = useState(false);
  const [isPriorHoursModalOpen, setIsPriorHoursModalOpen] = useState(false);
  const [priorHoursForm, setPriorHoursForm] = useState<Record<string, string>>({});
  const [savingPrior, setSavingPrior] = useState(false);
  const [ratingToUndo, setRatingToUndo] = useState<PassedRating | null>(null);
  const [undoSuccess, setUndoSuccess] = useState<string | null>(null);
  const [isCurrencyExpanded, setIsCurrencyExpanded] = useState(false);
  const [expandedCurrencyRow, setExpandedCurrencyRow] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('sb_selected_student');
    if (saved) {
      setSelectedStudent(saved);
      fetchRecentLessons(saved);
      fetchTestResult(saved);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('name');
      if (studentsError) throw studentsError;

      const { data: archivedData, error: archivedError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', session.user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      if (archivedError) throw archivedError;

      const { data: lessonsData, error: lessonsError } = await supabase.from('lessons').select('*');
      if (lessonsError) throw lessonsError;

      const { data: manualData, error: manualError } = await supabase.from('manual_hours').select('*');
      if (manualError) throw manualError;

      const { data: endorsementsData, error: endorsementsError } = await supabase.from('endorsements').select('*');
      if (endorsementsError) throw endorsementsError;

      setStudents(studentsData || []);
      setArchivedStudents(archivedData || []);
      setLessons(lessonsData || []);
      setManualHours(manualData || []);
      setEndorsements(endorsementsData || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Unable to connect to the database. Please check if your Supabase project is active.' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    setPendingStudentName(newStudentName.trim());
    setSelectedRatingCode('ppl'); // Default selection
    setIsRatingModalOpen(true);
  };

  const handleSaveNewStudent = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.error('No session found');
      return;
    }

    if (!pendingStudentName.trim()) return;
    if (!selectedRatingCode) return;

    setAdding(true);
    const rating = (RATINGS as any)[selectedRatingCode];

    const { data, error } = await supabase
      .from('students')
      .insert({ 
        user_id: session.user.id, 
        name: pendingStudentName.trim(),
        current_rating: selectedRatingCode,
        current_rating_label: rating.label
      })
      .select()
      .single();

    if (error) {
      alert('Failed to save student: ' + error.message);
      setAdding(false);
      return;
    }

    if (data) {
      setStudents(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewStudentName('');
      setPendingStudentName('');
      setSelectedRatingCode(null);
      setIsRatingModalOpen(false);
      handleSelectStudent(data.name);
    }
    setAdding(false);
  };

  const handleCheckridePassed = async () => {
    if (!selectedStudent) return;
    const student = students.find(s => s.name === selectedStudent);
    if (!student) return;

    setProcessingCheckride(true);
    try {
      const passedRating: PassedRating = {
        code: student.current_rating,
        label: student.current_rating_label,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      const updatedHistory = [...(student.checkride_passed_ratings || []), passedRating];

      const { error } = await supabase
        .from('students')
        .update({ checkride_passed_ratings: updatedHistory })
        .eq('id', student.id);

      if (error) throw error;

      // Update local state
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, checkride_passed_ratings: updatedHistory } : s));
      
      setIsCheckrideConfirmOpen(false);
      
      // Confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1a3a5c', '#2d7a4f', '#e8a020', '#c0392b']
      });

      // Wait 3 seconds then show next rating modal
      setTimeout(() => {
        setSelectedRatingCode(null); // Reset for next selection
        setIsNextRatingModalOpen(true);
      }, 3000);

    } catch (err) {
      console.error('Checkride update error:', err);
    } finally {
      setProcessingCheckride(false);
    }
  };

  const handleSelectNextRating = async (code: string) => {
    if (!selectedStudent) return;
    const student = students.find(s => s.name === selectedStudent);
    if (!student) return;

    const rating = (RATINGS as any)[code];
    
    try {
      const { error } = await supabase
        .from('students')
        .update({ 
          current_rating: code,
          current_rating_label: rating.label
        })
        .eq('id', student.id);

      if (error) throw error;

      // Update local state
      setStudents(prev => prev.map(s => s.id === student.id ? { 
        ...s, 
        current_rating: code, 
        current_rating_label: rating.label 
      } : s));

      setIsNextRatingModalOpen(false);
    } catch (err) {
      console.error('Next rating update error:', err);
    }
  };

  const handleStartLesson = () => {
    if (!selectedStudent) return;
    const student = students.find(s => s.name === selectedStudent);
    if (!student) return;

    localStorage.removeItem('faa_ground_grades');
    localStorage.removeItem('faa_ground_notes');
    localStorage.removeItem('faa_flight_grades');
    localStorage.removeItem('faa_flight_notes');
    localStorage.removeItem('current_lesson_id');

    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('selected_rating', JSON.stringify({
      code: student.current_rating || 'ppl',
      label: student.current_rating_label || 'Private Pilot ASEL'
    }));
    localStorage.setItem('faa_student_info', JSON.stringify({ student: student.name }));

    navigate('/lesson-type');
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (!window.confirm(`Archive student ${studentName}? This will hide them from your active list. You can restore them later from the Archived Students section.`)) return;
    
    const { error } = await supabase
      .from('students')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: session.user.email
      })
      .eq('id', studentId);
      
    if (error) {
      window.alert('Failed to archive student: ' + error.message);
      return;
    }
    
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudent === studentName) {
      setSelectedStudent(null);
      setRecentLesson(null);
      localStorage.removeItem('sb_selected_student');
      localStorage.removeItem('faa_student_info');
    }
    fetchData(); // Refresh both lists
  };

  const handleRestoreStudent = async (studentId: string) => {
    const { error } = await supabase
      .from('students')
      .update({ 
        deleted_at: null,
        deleted_by: null
      })
      .eq('id', studentId);
      
    if (error) {
      window.alert('Failed to restore student: ' + error.message);
      return;
    }
    
    fetchData();
  };

  const handlePermanentDelete = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Permanently delete ${studentName} and ALL their lessons? This cannot be undone.`)) return;

    setProcessingCheckride(true);
    try {
      // Delete manual hours
      await supabase.from('manual_hours').delete().eq('student_name', studentName);
      // Delete endorsements
      await supabase.from('endorsements').delete().eq('student_name', studentName);
      // Delete lessons
      await supabase.from('lessons').delete().eq('student_name', studentName);
      // Delete student
      const { error } = await supabase.from('students').delete().eq('id', studentId);
      
      if (error) throw error;
      
      fetchData();
    } catch (err: any) {
      window.alert('Failed to permanently delete student: ' + err.message);
    } finally {
      setProcessingCheckride(false);
    }
  };

  const fetchRecentLessons = async (studentName: string) => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_name', studentName)
      .order('saved_at', { ascending: false })
      .limit(1);

    setRecentLesson(data?.[0] || null);
  };

  const handleSelectStudent = (name: string) => {
    setSelectedStudent(name);
    setUndoSuccess(null);
    localStorage.setItem('sb_selected_student', name);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: name }));
    fetchRecentLessons(name);
    fetchTestResult(name);
  };

  const fetchTestResult = async (studentName: string) => {
    const { data } = await supabase
      .from('student_tests')
      .select('*')
      .eq('student_name', studentName)
      .eq('test_type', 'pre_solo')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setPreSoloTestResult(data);
  };

  const getCumulativeStats = (studentName: string) => {
    const studentLessons = lessons.filter(l => l.student_name === studentName);
    let totFlight = 0, totDual = 0, totXc = 0, totNight = 0, totNightLdg = 0, totSim = 0, totSolo = 0, totSoloXc = 0;
    let totXcDual = 0, totXcPic = 0, totSimInst = 0, totNightDual = 0, totInstDual = 0;
    
    studentLessons.forEach(l => {
      const m = l.meta || {};
      totFlight += parseFloat(m.totalFlight || '0') || 0;
      totDual += parseFloat(m.dual || '0') || 0;
      totXc += (parseFloat(m.xcDual || '0') || 0) + (parseFloat(m.xcSolo || '0') || 0) + (parseFloat(m.xcPic || '0') || 0);
      totNight += parseFloat(m.night || '0') || 0;
      totNightLdg += parseInt(m.ldgNight || '0') || 0;
      totSim += (parseFloat(m.simInst || '0') || 0) + (parseFloat(m.atdInst || '0') || 0);
      totSolo += parseFloat(m.solo || '0') || 0;
      totSoloXc += parseFloat(m.soloXc || '0') || 0;
      totXcDual += parseFloat(m.xcDual || '0') || 0;
      totXcPic += parseFloat(m.xcPic || '0') || 0;
      totSimInst += parseFloat(m.simInst || '0') || 0;
      if (parseFloat(m.dual || '0') > 0) {
        totInstDual += parseFloat(m.simInst || '0') || 0;
      }
      totNightDual += parseFloat(m.nightDual || '0') || 0;
    });

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const recentDual = studentLessons
      .filter(l => new Date(l.saved_at) >= sixtyDaysAgo)
      .reduce((sum, l) => sum + (parseFloat(l.meta?.dual || '0') || 0), 0);
    
    const recentInst = studentLessons
      .filter(l => new Date(l.saved_at) >= sixtyDaysAgo)
      .reduce((sum, l) => sum + (parseFloat(l.meta?.simInst || '0') || 0), 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentInst6mo = studentLessons
      .filter(l => new Date(l.saved_at) >= sixMonthsAgo)
      .reduce((sum, l) => sum + (parseFloat(l.meta?.simInst || '0') || 0), 0);

    const picTime = studentLessons.reduce((sum, l) => sum + (parseFloat(l.meta?.pic || '0') || (parseFloat(l.meta?.solo || '0') > 0 ? parseFloat(l.meta.totalFlight || '0') : 0)), 0);

    return { 
      totFlight, totDual, totXc, totNight, totNightLdg, totSim, totSolo, totSoloXc,
      totXcDual, totXcPic, totSimInst, totNightDual, recentDual, recentInst, recentInst6mo, picTime, totInstDual
    };
  };

  const getManualValue = (studentName: string, key: string) => {
    const m = manualHours.find(h => h.student_name === studentName && h.field_key === key);
    return m ? m.total : 0;
  };

  const isEndorsementMet = (studentName: string, ratingCode: string, key: string) => {
    return endorsements.some(e => 
      e.student_name === studentName && 
      e.rating === ratingCode && 
      e.endorsement_key === key && 
      e.completed
    );
  };

  const checkRequirements = (student: Student) => {
    const a1Given = endorsements.some(e => 
      (e.endorsement_key === 'A1' || e.endorsement_key === 'A.1') && 
      e.completed === true && 
      e.student_name === student.name &&
      e.rating?.toLowerCase() === student.current_rating?.toLowerCase()
    );

    return {
      canPassCheckride: a1Given
    };
  };

  const handleUndoCheckride = async () => {
    if (!selectedStudent || !ratingToUndo) return;
    const student = students.find(s => s.name === selectedStudent);
    if (!student) return;

    setProcessingCheckride(true);
    try {
      const updatedHistory = (student.checkride_passed_ratings || []).filter(r => r.code !== ratingToUndo.code);
      
      const { error } = await supabase
        .from('students')
        .update({ 
          checkride_passed_ratings: updatedHistory,
          current_rating: ratingToUndo.code,
          current_rating_label: ratingToUndo.label
        })
        .eq('id', student.id);

      if (error) throw error;

      // Update local state
      setStudents(prev => prev.map(s => s.id === student.id ? { 
        ...s, 
        checkride_passed_ratings: updatedHistory,
        current_rating: ratingToUndo.code,
        current_rating_label: ratingToUndo.label
      } : s));
      
      setUndoSuccess(`Checkride pass undone. Student is back on ${ratingToUndo.label}`);
      setIsUndoConfirmOpen(false);
      setRatingToUndo(null);
    } catch (err) {
      console.error('Undo checkride error:', err);
    } finally {
      setProcessingCheckride(false);
    }
  };

  const savePriorHours = async () => {
    if (!selectedStudent) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setSavingPrior(true);
    try {
      const fieldKeys = [
        'prior_totalFlight', 'prior_ldgTotal', 'prior_ldgDay', 'prior_ldgNight',
        'prior_solo', 'prior_xcSolo', 'prior_nightSolo',
        'prior_pic', 'prior_xcPic', 'prior_nightPic',
        'prior_dual', 'prior_xcDual', 'prior_nightDual',
        'prior_simInst', 'prior_imc', 'prior_atdInst',
        'prior_night', 'prior_nightTakeoffs',
        'prior_approachCount',
        'prior_atd', 'prior_ftd', 'prior_ffs'
      ];

      for (const key of fieldKeys) {
        const value = parseFloat(priorHoursForm[key] || '0') || 0;
        const existing = manualHours.find(m =>
          m.student_name === selectedStudent &&
          m.field_key === key
        );

        if (existing) {
          await supabase
            .from('manual_hours')
            .update({ total: value, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        } else if (value > 0) {
          await supabase
            .from('manual_hours')
            .insert({
              user_id: session.user.id,
              student_name: selectedStudent,
              field_key: key,
              entries: [{ val: value, date: 'Prior logbook' }],
              total: value
            });
        }
      }
      await fetchData(); // Refresh local state
      setIsPriorHoursModalOpen(false);
    } catch (err) {
      console.error('Save prior hours error:', err);
    } finally {
      setSavingPrior(false);
    }
  };

  const openPriorHoursModal = () => {
    const initialForm: Record<string, string> = {};
    const fieldKeys = [
      'prior_totalFlight', 'prior_ldgTotal', 'prior_ldgDay', 'prior_ldgNight',
      'prior_solo', 'prior_xcSolo', 'prior_nightSolo',
      'prior_pic', 'prior_xcPic', 'prior_nightPic',
      'prior_dual', 'prior_xcDual', 'prior_nightDual',
      'prior_simInst', 'prior_imc', 'prior_atdInst',
      'prior_night', 'prior_nightTakeoffs',
      'prior_approachCount',
      'prior_atd', 'prior_ftd', 'prior_ffs'
    ];
    fieldKeys.forEach(key => {
      const val = getManualValue(selectedStudent!, key);
      initialForm[key] = val > 0 ? val.toString() : '';
    });
    setPriorHoursForm(initialForm);
    setIsPriorHoursModalOpen(true);
  };

  const getStudentStats = (name: string) => {
    const studentLessons = lessons.filter(l => l.student_name === name);
    let s = 0, n = 0, hrs = 0;
    studentLessons.forEach(l => {
      Object.values(l.grades || {}).forEach(g => {
        if (g === 'S') s++;
        if (g === 'N') n++;
      });
      hrs += parseFloat(l.meta?.totalFlight || '0') || 0;
    });
    return { count: studentLessons.length, s, n, hrs: hrs.toFixed(1) };
  };

  const selectedStats = selectedStudent ? getStudentStats(selectedStudent) : null;

  const getTaskName = (ratingCode: string, taskId: string) => {
    const [ai, ti] = taskId.split('_').map(Number);
    const areas = ALL_ACS[ratingCode] || ALL_ACS['ppl'];
    const area = areas[ai];
    if (!area) return taskId;
    const task = area.tasks[ti];
    return task ? task.name : taskId;
  };

  const LessonSummary = ({ lesson, type }: { lesson: Lesson | null, type: 'ground' | 'flight' }) => {
    if (!lesson) {
      return (
        <div className="p-4 bg-[#f4f5f7] rounded-xl border border-[#dde3ec] text-center">
          <p className="text-xs text-[#6b7280] italic">No {type} lessons yet.</p>
        </div>
      );
    }

    const niTasks = Object.entries(lesson.grades)
      .filter(([_, grade]) => grade === 'N')
      .map(([id, grade]) => ({ id, grade, name: getTaskName(lesson.meta?.rating_code || 'ppl', id) }))
      .filter(task => !task.name.includes('N/A') && !task.name.includes('ASEL') && !task.name.includes('Seaplane') && !task.name.includes('Water'));

    return (
      <div className="p-4 bg-white rounded-xl border border-[#dde3ec] shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a5a8c] bg-[#d4e8f5] px-1.5 py-0.5 rounded">
                {lesson.meta?.rating_label || 'PPL'}
              </span>
              <h4 className="text-sm font-bold text-[#1c2333]">{lesson.label}</h4>
            </div>
            <p className="text-[10px] text-[#6b7280] mt-0.5">
              {new Date(lesson.saved_at).toLocaleDateString()} · {lesson.instructor}
              {lesson.meta?.aircraft && ` · ${lesson.meta.aircraftModel ? `${lesson.meta.aircraft} — ${lesson.meta.aircraftModel}` : lesson.meta.aircraft}`}
            </p>
          </div>
          {type === 'flight' && lesson.meta?.totalFlight && (
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#e8a020] uppercase tracking-widest">Flight Time</div>
              <div className="text-sm font-mono font-bold text-[#1a3a5c]">{lesson.meta.totalFlight}h</div>
            </div>
          )}
        </div>

        {niTasks.length > 0 ? (
          <div className="mt-3 space-y-1.5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#c0392b]">Focus Areas (N)</div>
            {niTasks.map(task => (
              <div key={task.id} className="flex items-start gap-2 text-[11px] leading-tight">
                <span className={cn(
                  "shrink-0 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white mt-0.5",
                  "bg-[#c0392b]"
                )}>
                  {task.grade}
                </span>
                <span className="text-[#1c2333]">{task.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#2d7a4f] font-medium">
            <CheckCircle2 size={12} />
            All tasks satisfactory
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Roster Sidebar */}
      <aside className="w-72 bg-white border-r border-[#dde3ec] flex flex-col shrink-0">
        <div className="p-4 border-bottom border-[#dde3ec]">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">Home</h2>
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Add student name..."
              className="flex-1 text-xs border border-[#dde3ec] rounded-lg px-3 py-2 bg-[#f4f5f7] focus:outline-none focus:border-[#4a8ab8] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={adding}
              className="bg-[#1a3a5c] text-white p-2 rounded-lg hover:bg-[#2a5a8c] transition-colors disabled:opacity-50"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={24} className="animate-spin mx-auto text-[#6b7280] opacity-20" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-[#fdecea] text-[#c0392b] rounded-full flex items-center justify-center mb-3 mx-auto">
                <AlertCircle size={20} />
              </div>
              <p className="text-xs text-[#c0392b] font-medium leading-relaxed mb-4">
                {error}
              </p>
              <button
                onClick={fetchData}
                className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280] text-sm leading-relaxed">
              No students yet.<br />Type a name above and tap Add.
            </div>
          ) : (
            students.map(student => {
              const stats = getStudentStats(student.name);
              const isActive = selectedStudent === student.name;
              
              const ratingColors: Record<string, string> = {
                ppl: 'bg-[#1a3a5c]',
                ir: 'bg-[#7c3aed]',
                cpl: 'bg-[#2d7a4f]',
                cfi: 'bg-[#e67e22]',
                cfii: 'bg-[#16a34a]',
                mei: 'bg-[#c0392b]'
              };

              return (
                <div
                  key={student.id}
                  onClick={() => handleSelectStudent(student.name)}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#dde3ec] border-l-4 transition-all",
                    isActive ? "bg-[#d4e8f5] border-l-[#2a5a8c]" : "border-l-transparent hover:bg-[#f4f5f7]"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                    isActive ? "bg-[#2a5a8c] text-white" : "bg-[#d4e8f5] text-[#2a5a8c]"
                  )}>
                    {student.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-width-0">
                    <div className="flex items-center gap-2">
                      <div className={cn("text-xs font-medium truncate", isActive ? "text-[#1a3a5c] font-bold" : "text-[#1c2333]")}>
                        {student.name}
                      </div>
                      <span className={cn(
                        "text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase tracking-tighter",
                        ratingColors[student.current_rating] || 'bg-gray-500'
                      )}>
                        {student.current_rating}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280] mt-0.5 flex items-center gap-2">
                      <span>{stats.count > 0 ? `${lessons.filter(l => l.student_name === student.name && l.type === 'ground').length}G · ${lessons.filter(l => l.student_name === student.name && l.type === 'flight').length}F` : 'No lessons yet'}</span>
                      {stats.count > 0 && (
                        <Link 
                          to={`/student/${encodeURIComponent(student.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#2a5a8c] hover:underline flex items-center gap-0.5"
                        >
                          <TrendingUp size={10} />
                          Analytics
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStudent(student.id, student.name);
                    }}
                    title="Archive Student"
                    className="opacity-40 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-[#6b7280] hover:bg-[#f4f5f7] hover:text-[#1a3a5c] transition-all"
                  >
                    <Archive size={12} />
                  </button>
                </div>
              );
            })
          )}

          {/* Archived Students Section */}
          {!loading && !error && (
            <div className="mt-4 border-t border-[#dde3ec]">
              <button
                onClick={() => setArchivedExpanded(!archivedExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex items-center gap-2 text-[#6b7280]">
                  <Archive size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Archived Students ({archivedStudents.length})</span>
                </div>
                <ChevronRight size={14} className={cn("text-[#6b7280] transition-transform", archivedExpanded && "rotate-90")} />
              </button>
              
              <AnimatePresence>
                {archivedExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#f8fafc]/50"
                  >
                    {archivedStudents.length === 0 ? (
                      <div className="px-6 py-4 text-[10px] text-[#94a3b8] italic text-center">
                        No archived students.
                      </div>
                    ) : (
                      archivedStudents.map(student => (
                        <div key={student.id} className="px-4 py-3 border-b border-[#dde3ec] opacity-70">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#6b7280]">{student.name}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleRestoreStudent(student.id)}
                                title="Restore Student"
                                className="p-1 text-[#2d7a4f] hover:bg-[#e4f5ec] rounded transition-colors"
                              >
                                <RotateCcw size={12} />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(student.id, student.name)}
                                title="Permanently Delete"
                                className="p-1 text-[#c0392b] hover:bg-[#fdecea] rounded transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="text-[9px] text-[#94a3b8]">
                            Archived {new Date(student.deleted_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#eef2f8] p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-6">
            <span className="text-[#1a3a5c]">Home</span>
          </div>

          <AnimatePresence mode="wait">
            {!selectedStudent ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center max-w-md"
            >
              <div className="text-5xl mb-6 opacity-30">👨‍✈️</div>
              <h1 className="text-2xl font-bold text-[#1c2333] mb-2">Select a student</h1>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                Choose a student from the list on the left to view their progress and start a new lesson.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-lg"
            >
              <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-lg overflow-hidden mb-6">
                <div className="p-6 border-b border-[#dde3ec] flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1c2333]">{selectedStudent}</h2>
                    <p className="text-xs text-[#6b7280] mt-1">
                      Currently working on: <span className="font-bold text-[#1a3a5c]">{students.find(s => s.name === selectedStudent)?.current_rating_label}</span>
                    </p>
                  </div>
                  <Link
                    to="/history"
                    className="text-xs font-medium text-[#2a5a8c] bg-[#d4e8f5] border border-[#4a8ab8] px-3 py-1.5 rounded-lg hover:bg-[#4a8ab8] hover:text-white transition-all"
                  >
                    History →
                  </Link>
                </div>
                <div className="p-6 space-y-6">
                  {/* Rating History */}
                  {students.find(s => s.name === selectedStudent)?.checkride_passed_ratings?.length ? (
                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-[#dde3ec]">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-3 flex items-center gap-2">
                        <Award size={14} className="text-[#e8a020]" />
                        Ratings Completed
                      </h3>
                      <div className="space-y-2">
                        {students.find(s => s.name === selectedStudent)?.checkride_passed_ratings.map((r, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#1c2333]">{r.label}</span>
                              <button
                                onClick={() => {
                                  setRatingToUndo(r);
                                  setIsUndoConfirmOpen(true);
                                }}
                                className="p-1 text-[#6b7280] hover:text-[#c0392b] hover:bg-red-50 rounded transition-all"
                                title="Undo checkride pass"
                              >
                                <History size={12} />
                              </button>
                            </div>
                            <span className="text-[#6b7280]">Passed {r.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {undoSuccess && (
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 size={14} />
                      {undoSuccess}
                    </div>
                  )}

                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">Latest Lesson</h3>
                    <LessonSummary lesson={recentLesson} type={recentLesson?.type === 'ground' ? 'ground' : 'flight'} />
                  </div>

                  {preSoloTestResult && (
                    <div className="flex items-center gap-2 h-8">
                      {preSoloTestResult.passed ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e4f5ec] text-[#2d7a4f] rounded-full border border-[#bcf0da]">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pre-Solo Test Passed — {new Date(preSoloTestResult.date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fdecea] text-[#c0392b] rounded-full border border-[#fecaca]">
                          <XCircle size={12} strokeWidth={3} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pre-Solo Test Failed — Retest Required</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Currency Tracker */}
                  {selectedStudent && (
                    <div className="space-y-4">
                      {(() => {
                        const studentLessons = lessons.filter(l => l.student_name === selectedStudent);
                        
                        // Day Currency
                        const ninetyDaysAgo = new Date();
                        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                        const recentFlights = studentLessons.filter(l =>
                          l.student_name === selectedStudent &&
                          l.type === 'flight' &&
                          new Date(l.saved_at) >= ninetyDaysAgo
                        ).sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
                        
                        const recentTakeoffs = recentFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgTotal || '0') || 0), 0);
                        const recentLandings = recentFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgTotal || '0') || 0), 0);
                        const isDayCurrent = recentTakeoffs >= 3 && recentLandings >= 3;
                        const lastDayFlight = recentFlights.find(l => (parseInt(l.meta?.ldgTotal || '0') || 0) > 0);
                        const dayExpiryDate = lastDayFlight ? new Date(new Date(lastDayFlight.saved_at).getTime() + 90 * 24 * 60 * 60 * 1000) : null;
                        const dayDaysUntilExpiry = dayExpiryDate ? Math.ceil((dayExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        // Passenger Currency (Day) - ASEL
                        const hasEverLoggedASEL = studentLessons.some(l => l.meta?.aircraftClass === 'ASEL');
                        const aselFlights = recentFlights.filter(l => l.meta?.aircraftClass === 'ASEL');
                        const aselTakeoffs = aselFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgDay || '0') || 0) + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                        const aselLandings = aselFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgDay || '0') || 0) + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                        const isDayCurrentASEL = aselTakeoffs >= 3 && aselLandings >= 3;
                        const lastDayFlightASEL = aselFlights[0];
                        const dayExpiryDateASEL = lastDayFlightASEL ? new Date(new Date(lastDayFlightASEL.saved_at).getTime() + 90 * 24 * 60 * 60 * 1000) : null;
                        const dayDaysUntilExpiryASEL = dayExpiryDateASEL ? Math.ceil((dayExpiryDateASEL.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        // Passenger Currency (Day) - AMEL
                        const hasEverLoggedAMEL = studentLessons.some(l => l.meta?.aircraftClass === 'AMEL');
                        const amelFlights = recentFlights.filter(l => l.meta?.aircraftClass === 'AMEL');
                        const amelTakeoffs = amelFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgDay || '0') || 0) + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                        const amelLandings = amelFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgDay || '0') || 0) + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                        const isDayCurrentAMEL = amelTakeoffs >= 3 && amelLandings >= 3;
                        const lastDayFlightAMEL = amelFlights[0];
                        const dayExpiryDateAMEL = lastDayFlightAMEL ? new Date(new Date(lastDayFlightAMEL.saved_at).getTime() + 90 * 24 * 60 * 60 * 1000) : null;
                        const dayDaysUntilExpiryAMEL = dayExpiryDateAMEL ? Math.ceil((dayExpiryDateAMEL.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        // Night Currency - ASEL
                        const hasEverLoggedNightASEL = studentLessons.some(l => l.meta?.aircraftClass === 'ASEL' && (parseInt(l.meta?.ldgNight || '0') || 0) > 0);
                        const recentNightFlightsASEL = aselFlights.filter(l => (parseInt(l.meta?.ldgNight || '0') || 0) > 0 || (parseInt(l.meta?.nightTakeoffs || '0') || 0) > 0);
                        const recentNightTakeoffsASEL = recentNightFlightsASEL.reduce((sum, l) => sum + (parseInt(l.meta?.nightTakeoffs || '0') || 0), 0);
                        const recentNightLandingsASEL = recentNightFlightsASEL.reduce((sum, l) => sum + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                        const isNightCurrentASEL = recentNightTakeoffsASEL >= 3 && recentNightLandingsASEL >= 3;
                        const lastNightFlightASEL = recentNightFlightsASEL[0];
                        const nightExpiryDateASEL = lastNightFlightASEL ? new Date(new Date(lastNightFlightASEL.saved_at).getTime() + 90 * 24 * 60 * 60 * 1000) : null;
                        const nightDaysUntilExpiryASEL = nightExpiryDateASEL ? Math.ceil((nightExpiryDateASEL.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        // Night Currency - AMEL
                        const hasEverLoggedNightAMEL = studentLessons.some(l => l.meta?.aircraftClass === 'AMEL' && (parseInt(l.meta?.ldgNight || '0') || 0) > 0);
                        const recentNightFlightsAMEL = amelFlights.filter(l => (parseInt(l.meta?.ldgNight || '0') || 0) > 0 || (parseInt(l.meta?.nightTakeoffs || '0') || 0) > 0);
                        const recentNightTakeoffsAMEL = recentNightFlightsAMEL.reduce((sum, l) => sum + (parseInt(l.meta?.nightTakeoffs || '0') || 0), 0);
                        const recentNightLandingsAMEL = recentNightFlightsAMEL.reduce((sum, l) => sum + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                        const isNightCurrentAMEL = recentNightTakeoffsAMEL >= 3 && recentNightLandingsAMEL >= 3;
                        const lastNightFlightAMEL = recentNightFlightsAMEL[0];
                        const nightExpiryDateAMEL = lastNightFlightAMEL ? new Date(new Date(lastNightFlightAMEL.saved_at).getTime() + 90 * 24 * 60 * 60 * 1000) : null;
                        const nightDaysUntilExpiryAMEL = nightExpiryDateAMEL ? Math.ceil((nightExpiryDateAMEL.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        // IFR Currency
                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        const recentIFRLessons = studentLessons.filter(l =>
                          l.student_name === selectedStudent &&
                          l.type === 'flight' &&
                          new Date(l.saved_at) >= sixMonthsAgo
                        ).sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
                        
                        const hasEverLoggedApproaches = studentLessons.some(l => (parseInt(l.meta?.approachCount || '0') || 0) > 0);
                        const totalApproaches = recentIFRLessons.reduce((sum, l) => sum + (parseInt(l.meta?.approachCount || '0') || 0), 0);
                        const holdPerformed = recentIFRLessons.some(l => l.meta?.holdPerformed === true);
                        const isIFRCurrent = totalApproaches >= 6 && holdPerformed;
                        const lastIFRFlight = recentIFRLessons.find(l => (parseInt(l.meta?.approachCount || '0') || 0) > 0 || l.meta?.holdPerformed);
                        const ifrExpiryDate = lastIFRFlight ? new Date(new Date(lastIFRFlight.saved_at).setMonth(new Date(lastIFRFlight.saved_at).getMonth() + 6)) : null;
                        const ifrDaysUntilExpiry = ifrExpiryDate ? Math.ceil((ifrExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

                        // Summary
                        let totalCurrencies = 1; // IFR is always counted if logged
                        let currentCount = (hasEverLoggedApproaches && isIFRCurrent ? 1 : 0);
                        
                        if (hasEverLoggedASEL) {
                          totalCurrencies += 1;
                          if (isDayCurrentASEL) currentCount += 1;
                          if (hasEverLoggedNightASEL) {
                            totalCurrencies += 1;
                            if (isNightCurrentASEL) currentCount += 1;
                          }
                        }
                        
                        if (hasEverLoggedAMEL) {
                          totalCurrencies += 1;
                          if (isDayCurrentAMEL) currentCount += 1;
                          if (hasEverLoggedNightAMEL) {
                            totalCurrencies += 1;
                            if (isNightCurrentAMEL) currentCount += 1;
                          }
                        }

                        const allApplicableCurrent = currentCount === totalCurrencies;
                        const noneCurrent = currentCount === 0;

                        return (
                          <div className={cn(
                            "rounded-xl border-2 overflow-hidden transition-all shadow-sm",
                            allApplicableCurrent ? "border-[#2d7a4f]" : noneCurrent ? "border-[#c0392b]" : "border-[#e8a020]"
                          )}>
                            {/* Header */}
                            <button
                              onClick={() => setIsCurrencyExpanded(!isCurrencyExpanded)}
                              className={cn(
                                "w-full p-4 flex items-center justify-between transition-colors",
                                allApplicableCurrent ? "bg-[#e4f5ec]" : noneCurrent ? "bg-[#fdecea]" : "bg-[#fffbeb]"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Shield size={18} className={cn(
                                  allApplicableCurrent ? "text-[#2d7a4f]" : noneCurrent ? "text-[#c0392b]" : "text-[#e8a020]"
                                )} />
                                <h3 className={cn(
                                  "text-sm font-bold",
                                  allApplicableCurrent ? "text-[#166534]" : noneCurrent ? "text-[#991b1b]" : "text-[#92400e]"
                                )}>
                                  Currency Status
                                </h3>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                                  allApplicableCurrent ? "bg-[#2d7a4f] text-white" : noneCurrent ? "bg-[#c0392b] text-white" : "bg-[#e8a020] text-white"
                                )}>
                                  {currentCount}/{totalCurrencies} Current
                                </span>
                                <ChevronDown 
                                  size={18} 
                                  className={cn(
                                    "transition-transform duration-200",
                                    isCurrencyExpanded ? "rotate-180" : "rotate-0",
                                    allApplicableCurrent ? "text-[#2d7a4f]" : noneCurrent ? "text-[#c0392b]" : "text-[#e8a020]"
                                  )} 
                                />
                              </div>
                            </button>

                            {/* Collapsible Content */}
                            <AnimatePresence>
                              {isCurrencyExpanded && (
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: 'auto' }}
                                  exit={{ height: 0 }}
                                  className="bg-white divide-y divide-[#dde3ec]"
                                >
                                  {/* Day Currency Row - ASEL */}
                                  {hasEverLoggedASEL && (
                                    <CurrencyRow 
                                      title="Passenger Currency Day"
                                      reference="§61.57(a)"
                                      isCurrent={isDayCurrentASEL}
                                      classBadge="ASEL"
                                      isExpanded={expandedCurrencyRow === 'day_asel'}
                                      onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'day_asel' ? null : 'day_asel')}
                                    >
                                      <div className="space-y-3 p-4 bg-[#f8fafc]">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Takeoffs (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{aselTakeoffs}</span>
                                            {aselTakeoffs >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Landings (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{aselLandings}</span>
                                            {aselLandings >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="pt-2 border-t border-[#dde3ec] space-y-1 text-[10px]">
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Last flight date</span>
                                            <span className="font-medium">{lastDayFlightASEL ? new Date(lastDayFlightASEL.saved_at).toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Currency expires on</span>
                                            <span className="font-medium">{dayExpiryDateASEL ? dayExpiryDateASEL.toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          {dayDaysUntilExpiryASEL > 0 && dayDaysUntilExpiryASEL < 15 && (
                                            <div className="text-right font-bold text-[#e8a020]">
                                              Expires in {dayDaysUntilExpiryASEL} days
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CurrencyRow>
                                  )}

                                  {/* Day Currency Row - AMEL */}
                                  {hasEverLoggedAMEL && (
                                    <CurrencyRow 
                                      title="Passenger Currency Day"
                                      reference="§61.57(a)"
                                      isCurrent={isDayCurrentAMEL}
                                      classBadge="AMEL"
                                      isExpanded={expandedCurrencyRow === 'day_amel'}
                                      onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'day_amel' ? null : 'day_amel')}
                                    >
                                      <div className="space-y-3 p-4 bg-[#f8fafc]">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Takeoffs (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{amelTakeoffs}</span>
                                            {amelTakeoffs >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Landings (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{amelLandings}</span>
                                            {amelLandings >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="pt-2 border-t border-[#dde3ec] space-y-1 text-[10px]">
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Last flight date</span>
                                            <span className="font-medium">{lastDayFlightAMEL ? new Date(lastDayFlightAMEL.saved_at).toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Currency expires on</span>
                                            <span className="font-medium">{dayExpiryDateAMEL ? dayExpiryDateAMEL.toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          {dayDaysUntilExpiryAMEL > 0 && dayDaysUntilExpiryAMEL < 15 && (
                                            <div className="text-right font-bold text-[#e8a020]">
                                              Expires in {dayDaysUntilExpiryAMEL} days
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CurrencyRow>
                                  )}

                                  {/* Night Currency Row - ASEL */}
                                  {hasEverLoggedNightASEL && (
                                    <CurrencyRow 
                                      title="Passenger Currency Night"
                                      reference="§61.57(b)"
                                      isCurrent={isNightCurrentASEL}
                                      classBadge="ASEL"
                                      isExpanded={expandedCurrencyRow === 'night_asel'}
                                      onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'night_asel' ? null : 'night_asel')}
                                    >
                                      <div className="space-y-3 p-4 bg-[#f8fafc]">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Night takeoffs (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{recentNightTakeoffsASEL}</span>
                                            {recentNightTakeoffsASEL >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Night landings (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{recentNightLandingsASEL}</span>
                                            {recentNightLandingsASEL >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="pt-2 border-t border-[#dde3ec] space-y-1 text-[10px]">
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Last night flight</span>
                                            <span className="font-medium">{lastNightFlightASEL ? new Date(lastNightFlightASEL.saved_at).toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Currency expires on</span>
                                            <span className="font-medium">{nightExpiryDateASEL ? nightExpiryDateASEL.toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          {nightDaysUntilExpiryASEL > 0 && nightDaysUntilExpiryASEL < 15 && (
                                            <div className="text-right font-bold text-[#e8a020]">
                                              Expires in {nightDaysUntilExpiryASEL} days
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CurrencyRow>
                                  )}

                                  {/* Night Currency Row - AMEL */}
                                  {hasEverLoggedNightAMEL && (
                                    <CurrencyRow 
                                      title="Passenger Currency Night"
                                      reference="§61.57(b)"
                                      isCurrent={isNightCurrentAMEL}
                                      classBadge="AMEL"
                                      isExpanded={expandedCurrencyRow === 'night_amel'}
                                      onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'night_amel' ? null : 'night_amel')}
                                    >
                                      <div className="space-y-3 p-4 bg-[#f8fafc]">
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Night takeoffs (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{recentNightTakeoffsAMEL}</span>
                                            {recentNightTakeoffsAMEL >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-[#6b7280]">Night landings (past 90 days)</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold">{recentNightLandingsAMEL}</span>
                                            {recentNightLandingsAMEL >= 3 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                          </div>
                                        </div>
                                        <div className="pt-2 border-t border-[#dde3ec] space-y-1 text-[10px]">
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Last night flight</span>
                                            <span className="font-medium">{lastNightFlightAMEL ? new Date(lastNightFlightAMEL.saved_at).toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[#6b7280]">Currency expires on</span>
                                            <span className="font-medium">{nightExpiryDateAMEL ? nightExpiryDateAMEL.toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                          {nightDaysUntilExpiryAMEL > 0 && nightDaysUntilExpiryAMEL < 15 && (
                                            <div className="text-right font-bold text-[#e8a020]">
                                              Expires in {nightDaysUntilExpiryAMEL} days
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </CurrencyRow>
                                  )}

                                  {/* IFR Currency Row */}
                                  <CurrencyRow 
                                    title="IFR Currency"
                                    reference="§61.57(c)"
                                    isCurrent={isIFRCurrent}
                                    isNotApplicable={!hasEverLoggedApproaches}
                                    isExpanded={expandedCurrencyRow === 'ifr'}
                                    onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'ifr' ? null : 'ifr')}
                                  >
                                    <div className="space-y-3 p-4 bg-[#f8fafc]">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#6b7280]">Instrument approaches (past 6 months)</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono font-bold">{totalApproaches}</span>
                                          {totalApproaches >= 6 ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#6b7280]">Holding performed (past 6 months)</span>
                                        <div className="flex items-center gap-1.5">
                                          {holdPerformed ? <CheckCircle2 size={14} className="text-[#2d7a4f]" /> : <X size={14} className="text-[#c0392b]" />}
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-[#dde3ec] space-y-1 text-[10px]">
                                        <div className="flex justify-between">
                                          <span className="text-[#6b7280]">Last IFR flight date</span>
                                          <span className="font-medium">{lastIFRFlight ? new Date(lastIFRFlight.saved_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-[#6b7280]">Currency expires on</span>
                                          <span className="font-medium">{ifrExpiryDate ? ifrExpiryDate.toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        {ifrDaysUntilExpiry > 0 && ifrDaysUntilExpiry < 30 && (
                                          <div className="text-right font-bold text-[#e8a020]">
                                            Expires in {ifrDaysUntilExpiry} days
                                          </div>
                                        )}
                                      </div>

                                      {isIFRCurrent ? (
                                        <div className="mt-2 p-2 bg-[#e4f5ec] rounded-lg text-[10px] text-[#2d7a4f] font-medium leading-tight">
                                          IFR Current — valid until {ifrExpiryDate?.toLocaleDateString()}
                                        </div>
                                      ) : hasEverLoggedApproaches ? (
                                        <div className="mt-2 p-2 bg-[#fdecea] rounded-lg text-[10px] text-[#c0392b] font-medium leading-tight">
                                          IFR currency lapsed. Student must complete an IPC with a CFII before acting as PIC under IFR
                                        </div>
                                      ) : null}
                                      
                                      {ifrDaysUntilExpiry > 0 && ifrDaysUntilExpiry < 30 && (
                                        <div className="mt-2 p-2 bg-[#fffbeb] rounded-lg text-[10px] text-[#92400e] font-medium leading-tight">
                                          IFR currency expires in {ifrDaysUntilExpiry} days. Schedule approaches soon.
                                        </div>
                                      )}
                                    </div>
                                  </CurrencyRow>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={openPriorHoursModal}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#dde3ec] rounded-xl hover:bg-[#f4f5f7] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#f4f5f7] rounded-lg flex items-center justify-center text-[#1a3a5c] group-hover:bg-white transition-colors">
                          <BookOpen size={16} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#1c2333]">Prior Logbook Hours</div>
                          <div className="text-[10px] text-[#6b7280]">Import totals from physical logbook</div>
                        </div>
                      </div>
                      {manualHours.some(m => m.student_name === selectedStudent && m.field_key.startsWith('prior_')) && (
                        <span className="text-[8px] font-bold uppercase tracking-widest bg-[#e4f5ec] text-[#2d7a4f] px-2 py-0.5 rounded-full">
                          Prior hours on file
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="pt-2">
                    {(() => {
                      const student = students.find(s => s.name === selectedStudent);
                      if (!student) return null;
                      
                      const isPassed = student.checkride_passed_ratings?.some(r => r.code === student.current_rating);
                      if (isPassed) {
                        const passDate = student.checkride_passed_ratings?.find(r => r.code === student.current_rating)?.date;
                        return (
                          <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-xl p-4 flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2 text-[#166534] font-bold">
                              <CheckCircle size={20} />
                              Checkride Passed
                            </div>
                            <div className="text-[10px] text-[#166534] opacity-70 font-bold uppercase tracking-widest">
                              Completed on {passDate}
                            </div>
                          </div>
                        );
                      }

                      const { canPassCheckride } = checkRequirements(student);
                      
                      return (
                        <div className="space-y-2">
                          <button
                            onClick={() => setIsCheckrideConfirmOpen(true)}
                            disabled={!canPassCheckride}
                            className={cn(
                              "w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm",
                              canPassCheckride 
                                ? "bg-[#2d7a4f] text-white hover:bg-[#24633f] animate-pulse shadow-[0_0_15px_rgba(45,122,79,0.4)]" 
                                : "bg-[#dde3ec] text-[#6b7280] cursor-not-allowed"
                            )}
                          >
                            <CheckCircle size={18} />
                            Checkride Passed
                          </button>
                          {!canPassCheckride && (
                            <p className="text-[10px] text-center text-[#6b7280] font-medium">
                              Give A.1 endorsement in the Checkride tab to unlock.
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleStartLesson}
                  className="w-full bg-[#1a3a5c] text-white font-bold py-4 rounded-xl hover:bg-[#2a5a8c] transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plane size={20} />
                  Start New Lesson →
                </button>

                <Link
                  to={`/iacra/${encodeURIComponent(selectedStudent)}`}
                  className="w-full bg-white text-[#1a3a5c] font-bold py-3 rounded-xl border-2 border-[#1a3a5c]/20 hover:bg-[#1a3a5c]/5 transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  IACRA Summary
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isRatingModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-[#f8fafc] w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 bg-white border-b border-[#dde3ec] flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-xl font-black text-[#1a3a5c]">Add New Student</h2>
                    <p className="text-xs text-[#6b7280] mt-1">Enter details and select a rating</p>
                  </div>
                  <button 
                    onClick={() => setIsRatingModalOpen(false)}
                    className="p-2 hover:bg-[#f4f5f7] rounded-full transition-all"
                  >
                    <X size={20} className="text-[#6b7280]" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                  <div className="max-w-2xl mx-auto space-y-10">
                    {/* Name Input */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-[#1a3a5c] uppercase tracking-widest ml-1">Student Name</label>
                      <input
                        type="text"
                        value={pendingStudentName}
                        onChange={(e) => setPendingStudentName(e.target.value)}
                        placeholder="Enter student name"
                        className="w-full text-lg font-bold border-2 border-[#dde3ec] rounded-2xl px-6 py-4 focus:outline-none focus:border-[#1a3a5c] transition-all placeholder:text-[#dde3ec]"
                        autoFocus
                      />
                    </div>

                    {/* Rating Selection */}
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-[#1c2333]">Select Initial Rating</h3>
                        <p className="text-sm text-[#6b7280]">Choose the certificate they are working toward</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(RATINGS).map(([code, rating]) => {
                          const isSelected = selectedRatingCode === code;
                          const icons: Record<string, any> = {
                            ppl: Plane,
                            ir: Cloud,
                            cpl: Gauge,
                            cfi: ClipboardList,
                            cfii: Compass,
                            mei: Navigation
                          };
                          const colors: Record<string, string> = {
                            ppl: 'bg-[#d4e8f5] text-[#1a3a5c] border-[#1a3a5c]',
                            ir: 'bg-[#ede8f8] text-[#5b3fa0] border-[#5b3fa0]',
                            cpl: 'bg-[#e4f5ec] text-[#2d7a4f] border-[#2d7a4f]',
                            cfi: 'bg-[#fdf0e4] text-[#c05c10] border-[#c05c10]',
                            cfii: 'bg-[#e0f5f2] text-[#1a7a6e] border-[#1a7a6e]',
                            mei: 'bg-[#fdecea] text-[#c0392b] border-[#c0392b]'
                          };
                          const Icon = icons[code];

                          return (
                            <motion.div
                              key={code}
                              whileHover={{ y: -3 }}
                              onClick={() => setSelectedRatingCode(code)}
                              className={cn(
                                "bg-white rounded-2xl border-2 p-6 text-center transition-all relative flex flex-col items-center gap-3 cursor-pointer",
                                isSelected ? cn("shadow-xl scale-[1.05]", colors[code]) : "border-[#dde3ec] hover:border-[#1a3a5c]/30 hover:shadow-lg"
                              )}
                            >
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                                isSelected ? "bg-white/20" : colors[code].split(' ').slice(0, 2).join(' ')
                              )}>
                                <Icon size={24} />
                              </div>
                              <div>
                                <div className="text-sm font-bold leading-tight">{rating.label}</div>
                                <div className="text-[10px] opacity-60 mt-1">{rating.acs}</div>
                              </div>
                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle size={16} />
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-[#dde3ec] flex gap-3 shrink-0">
                  <button
                    onClick={() => setIsRatingModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-[#6b7280] hover:bg-[#f4f5f7] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewStudent}
                    disabled={adding || !selectedRatingCode || !pendingStudentName.trim()}
                    className={cn(
                      "flex-[2] py-4 text-white font-bold rounded-2xl transition-all shadow-lg",
                      adding || !selectedRatingCode || !pendingStudentName.trim() 
                        ? "bg-[#dde3ec] cursor-not-allowed" 
                        : "bg-[#1a3a5c] hover:bg-[#2a5a8c]"
                    )}
                  >
                    {adding ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Save Student'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {isCheckrideConfirmOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#e4f5ec] text-[#2d7a4f] rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Award size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1c2333] mb-2">Confirm Checkride Pass</h3>
                <p className="text-sm text-[#6b7280] mb-8 leading-relaxed">
                  You are about to record that <strong>{selectedStudent}</strong> has passed their <strong>{students.find(s => s.name === selectedStudent)?.current_rating_label}</strong> checkride. This will lock this rating and prompt you to select the next rating. Are you sure?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsCheckrideConfirmOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-[#6b7280] hover:bg-[#f4f5f7] rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckridePassed}
                    disabled={processingCheckride}
                    className="flex-[2] py-3 bg-[#2d7a4f] text-white font-bold rounded-xl hover:bg-[#24633f] transition-all shadow-md disabled:opacity-50"
                  >
                    {processingCheckride ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Pass'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {isUndoConfirmOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
              >
                <div className="w-16 h-16 bg-[#fdecea] text-[#c0392b] rounded-full flex items-center justify-center mb-6 mx-auto">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#1c2333] mb-2">Undo Checkride Pass?</h3>
                <p className="text-sm text-[#6b7280] mb-8 leading-relaxed">
                  Are you sure you want to undo the checkride pass for <strong>{ratingToUndo?.label}</strong>? This cannot be undone easily.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsUndoConfirmOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-[#6b7280] hover:bg-[#f4f5f7] rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUndoCheckride}
                    disabled={processingCheckride}
                    className="flex-[2] py-3 bg-[#c0392b] text-white font-bold rounded-xl hover:bg-[#a93226] transition-all shadow-md disabled:opacity-50"
                  >
                    {processingCheckride ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Undo Pass'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Next Rating Modal (Checkride Passed) */}
          {isNextRatingModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-[#f8fafc] w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 bg-white border-b border-[#dde3ec] flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-xl font-black text-[#1a3a5c]">Checkride Passed!</h2>
                    <p className="text-xs text-[#6b7280] mt-1">What rating is {selectedStudent} pursuing next?</p>
                  </div>
                  <button 
                    onClick={() => setIsNextRatingModalOpen(false)}
                    className="p-2 hover:bg-[#f4f5f7] rounded-full transition-all"
                  >
                    <X size={20} className="text-[#6b7280]" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-10">
                  <div className="max-w-2xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.entries(RATINGS).map(([code, rating]) => {
                        const isSelected = selectedRatingCode === code;
                        const icons: Record<string, any> = {
                          ppl: Plane,
                          ir: Cloud,
                          cpl: Gauge,
                          cfi: ClipboardList,
                          cfii: Compass,
                          mei: Navigation
                        };
                        const colors: Record<string, string> = {
                          ppl: 'bg-[#d4e8f5] text-[#1a3a5c] border-[#1a3a5c]',
                          ir: 'bg-[#ede8f8] text-[#5b3fa0] border-[#5b3fa0]',
                          cpl: 'bg-[#e4f5ec] text-[#2d7a4f] border-[#2d7a4f]',
                          cfi: 'bg-[#fdf0e4] text-[#c05c10] border-[#c05c10]',
                          cfii: 'bg-[#e0f5f2] text-[#1a7a6e] border-[#1a7a6e]',
                          mei: 'bg-[#fdecea] text-[#c0392b] border-[#c0392b]'
                        };
                        const Icon = icons[code];

                        return (
                          <motion.div
                            key={code}
                            whileHover={{ y: -3 }}
                            onClick={() => setSelectedRatingCode(code)}
                            className={cn(
                              "bg-white rounded-2xl border-2 p-6 text-center transition-all relative flex flex-col items-center gap-3 cursor-pointer",
                              isSelected ? cn("shadow-xl scale-[1.05]", colors[code]) : "border-[#dde3ec] hover:border-[#1a3a5c]/30 hover:shadow-lg"
                            )}
                          >
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                              isSelected ? "bg-white/20" : colors[code].split(' ').slice(0, 2).join(' ')
                            )}>
                              <Icon size={24} />
                            </div>
                            <div>
                              <div className="text-sm font-bold leading-tight">{rating.label}</div>
                              <div className="text-[10px] opacity-60 mt-1">{rating.acs}</div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle size={16} />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-[#dde3ec] flex gap-3 shrink-0">
                  <button
                    onClick={() => setIsNextRatingModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-[#6b7280] hover:bg-[#f4f5f7] rounded-2xl transition-all"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={() => selectedRatingCode && handleSelectNextRating(selectedRatingCode)}
                    disabled={!selectedRatingCode}
                    className={cn(
                      "flex-[2] py-4 text-white font-bold rounded-2xl transition-all shadow-lg",
                      !selectedRatingCode ? "bg-[#dde3ec] cursor-not-allowed" : "bg-[#1a3a5c] hover:bg-[#2a5a8c]"
                    )}
                  >
                    Confirm Next Rating
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {isPriorHoursModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-[#f8fafc] w-full h-full sm:h-auto sm:max-w-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 bg-white border-b border-[#dde3ec] flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-xl font-black text-[#1a3a5c]">Prior Logbook Hours</h2>
                    <p className="text-xs text-[#6b7280] mt-1">Enter totals from the student's existing logbook for {selectedStudent}</p>
                  </div>
                  <button 
                    onClick={() => setIsPriorHoursModalOpen(false)}
                    className="p-2 hover:bg-[#f4f5f7] rounded-full transition-all"
                  >
                    <X size={20} className="text-[#6b7280]" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle size={18} className="text-[#d97706] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#92400e] leading-relaxed">
                        <strong>Note:</strong> These hours will be added to all logged lesson totals throughout the app including the Checkride tab IACRA Summary and Cumulative tab. Only enter hours not already logged in this app.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Totals Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">Totals</h3>
                        {[
                          { key: 'prior_totalFlight', label: 'Total Flight Time', unit: 'hrs' },
                          { key: 'prior_ldgTotal', label: 'Total Landings', unit: 'count' },
                          { key: 'prior_ldgDay', label: 'Day Landings', unit: 'count' },
                          { key: 'prior_ldgNight', label: 'Night Landings', unit: 'count' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Solo Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">Solo</h3>
                        {[
                          { key: 'prior_solo', label: 'Solo Flight Time', unit: 'hrs' },
                          { key: 'prior_xcSolo', label: 'Solo Cross Country', unit: 'hrs' },
                          { key: 'prior_nightSolo', label: 'Night Solo', unit: 'hrs' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* PIC Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">PIC</h3>
                        {[
                          { key: 'prior_pic', label: 'PIC Time', unit: 'hrs' },
                          { key: 'prior_xcPic', label: 'Cross Country PIC', unit: 'hrs' },
                          { key: 'prior_nightPic', label: 'Night PIC', unit: 'hrs' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Dual Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">Dual</h3>
                        {[
                          { key: 'prior_dual', label: 'Dual Received', unit: 'hrs' },
                          { key: 'prior_xcDual', label: 'Cross Country Dual', unit: 'hrs' },
                          { key: 'prior_nightDual', label: 'Night Dual', unit: 'hrs' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Instrument Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">Instrument</h3>
                        {[
                          { key: 'prior_simInst', label: 'Simulated Instrument', unit: 'hrs' },
                          { key: 'prior_imc', label: 'Actual Instrument', unit: 'hrs' },
                          { key: 'prior_atdInst', label: 'Instrument on Simulator', unit: 'hrs' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Night Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">Night</h3>
                        {[
                          { key: 'prior_night', label: 'Night Total', unit: 'hrs' },
                          { key: 'prior_nightTakeoffs', label: 'Night Takeoffs', unit: 'count' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Approaches Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">Approaches</h3>
                        {[
                          { key: 'prior_approachCount', label: 'Number of Approaches', unit: 'count' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Simulator Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] border-b border-[#dde3ec] pb-1">Simulator</h3>
                        {[
                          { key: 'prior_atd', label: 'ATD Time', unit: 'hrs' },
                          { key: 'prior_ftd', label: 'FTD Time', unit: 'hrs' },
                          { key: 'prior_ffs', label: 'FFS Time', unit: 'hrs' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#475569]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#1a3a5c]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* R-ATP Group */}
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#7c3aed] border-b border-[#ddd6fe] pb-1">R-ATP (§61.160)</h3>
                        {[
                          { key: 'prior_ratpXC', label: 'R-ATP Eligible XC', unit: 'hrs' },
                          { key: 'prior_ratpSimInst', label: 'R-ATP Sim Instrument', unit: 'hrs' },
                          { key: 'prior_ratpActualInst', label: 'R-ATP Actual Instrument', unit: 'hrs' }
                        ].map(f => (
                          <div key={f.key} className="flex items-center justify-between gap-4">
                            <label className="text-xs text-[#6d28d9]">{f.label}</label>
                            <div className="relative w-24">
                              <input
                                type="number"
                                step="0.1"
                                value={priorHoursForm[f.key] || ''}
                                onChange={(e) => setPriorHoursForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="w-full text-right text-xs font-bold border border-[#ddd6fe] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#7c3aed]"
                              />
                              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-[9px] text-[#a78bfa]">{f.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-[#dde3ec] flex gap-3 shrink-0">
                  <button
                    onClick={() => setIsPriorHoursModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-[#6b7280] hover:bg-[#f4f5f7] rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePriorHours}
                    disabled={savingPrior}
                    className="flex-[2] py-4 bg-[#1a3a5c] text-white font-bold rounded-2xl hover:bg-[#2a5a8c] transition-all shadow-lg disabled:opacity-50"
                  >
                    {savingPrior ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Save Prior Hours'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>
      </div>
    </main>
    </div>
  );
}
