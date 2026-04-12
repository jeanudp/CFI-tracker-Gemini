import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Student, Lesson, PassedRating } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, User, Trash2, ChevronRight, BookOpen, Plane, History, Loader2, TrendingUp, CheckCircle2, AlertCircle, Award, CheckCircle, X, FileText, Cloud, Gauge, ClipboardList, Compass, Navigation, Archive, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

import { ALL_ACS, RATINGS } from '../constants';

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [recentGround, setRecentGround] = useState<Lesson | null>(null);
  const [recentFlight, setRecentFlight] = useState<Lesson | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  
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
  const [ratingToUndo, setRatingToUndo] = useState<PassedRating | null>(null);
  const [undoSuccess, setUndoSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('sb_selected_student');
    if (saved) {
      setSelectedStudent(saved);
      fetchRecentLessons(saved);
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
      setRecentGround(null);
      setRecentFlight(null);
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
    const { data: groundData } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_name', studentName)
      .eq('type', 'ground')
      .order('saved_at', { ascending: false })
      .limit(1);

    const { data: flightData } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_name', studentName)
      .eq('type', 'flight')
      .order('saved_at', { ascending: false })
      .limit(1);

    setRecentGround(groundData?.[0] || null);
    setRecentFlight(flightData?.[0] || null);
  };

  const handleSelectStudent = (name: string) => {
    setSelectedStudent(name);
    setUndoSuccess(null);
    localStorage.setItem('sb_selected_student', name);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: name }));
    fetchRecentLessons(name);
  };

  const getCumulativeStats = (studentName: string) => {
    const studentLessons = lessons.filter(l => l.student_name === studentName);
    let totFlight = 0, totDual = 0, totXc = 0, totNight = 0, totNightLdg = 0, totSim = 0, totSolo = 0, totSoloXc = 0;
    let totXcDual = 0, totXcPic = 0, totSimInst = 0, totNightDual = 0, totInstDual = 0;
    
    studentLessons.forEach(l => {
      const m = l.meta || {};
      totFlight += parseFloat(m.totalFlight || '0') || 0;
      totDual += parseFloat(m.dual || '0') || 0;
      totXc += parseFloat(m.xc || '0') || 0;
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
      e.endorsement_key === 'A1' && 
      e.completed === true && 
      e.student_name === student.name &&
      e.rating === student.current_rating
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
      .filter(([_, grade]) => grade === 'N' || grade === 'I')
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
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#c0392b]">Focus Areas (N/I)</div>
            {niTasks.map(task => (
              <div key={task.id} className="flex items-start gap-2 text-[11px] leading-tight">
                <span className={cn(
                  "shrink-0 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold text-white mt-0.5",
                  task.grade === 'N' ? "bg-[#c0392b]" : "bg-[#e8a020]"
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
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">My Students</h2>
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
            <span className="text-[#1a3a5c]">Students</span>
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
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">Latest Ground Lesson</h3>
                    <LessonSummary lesson={recentGround} type="ground" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">Latest Flight Lesson</h3>
                    <LessonSummary lesson={recentFlight} type="flight" />
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
                  to="/history"
                  className="w-full bg-white text-[#6b7280] font-medium py-3 rounded-xl border-2 border-[#dde3ec] hover:bg-[#f4f5f7] hover:text-[#1c2333] transition-all flex items-center justify-center gap-2"
                >
                  <History size={18} />
                  View Full Lesson History
                </Link>
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

        </AnimatePresence>
      </div>
    </main>
    </div>
  );
}
