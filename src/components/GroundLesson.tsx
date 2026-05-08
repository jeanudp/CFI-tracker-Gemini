import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ALL_ACS, ALL_GROUND_ACS, RATINGS } from '../constants';
import { Grade, LessonMeta, ACSTask, ACSStandard } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Save, Trash2, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, AlertCircle, HelpCircle, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import ACSStandardsModal from './ACSStandardsModal';

export default function GroundLesson() {
  const [studentName, setStudentName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [lessonNotes, setLessonNotes] = useState('');
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [expandedAreas, setExpandedAreas] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [fillState, setFillState] = useState<Grade>('');
  const [overallGrade, setOverallGrade] = useState<'' | 'S' | 'N'>('');
  const [rating, setRating] = useState<any>(null);
  const [activeACSTask, setActiveACSTask] = useState<{ task: ACSTask, id: string, prevGrade: Grade, pendingGrade: Grade } | null>(null);
  const [lessonLabel, setLessonLabel] = useState('');
  const [lessonNum, setLessonNum] = useState(1);
  const navigate = useNavigate();

  const resetLessonState = () => {
    setGrades({});
    setNotes({});
    setLessonNotes('');
    setLessonDate(new Date().toISOString().split('T')[0]);
    setFillState('');
    
    localStorage.removeItem('faa_ground_grades');
    localStorage.removeItem('faa_ground_notes');
    localStorage.removeItem('faa_flight_grades');
    localStorage.removeItem('faa_flight_notes');
    localStorage.removeItem('current_lesson_id');
  };

  useEffect(() => {
    const savedStudent = localStorage.getItem('sb_selected_student') ||
      JSON.parse(localStorage.getItem('faa_student_info') || '{}').student || '';
    const savedRating = JSON.parse(localStorage.getItem('selected_rating') || '{}');

    if (!savedStudent) {
      navigate('/dashboard');
      return;
    }
    if (!savedRating.code) {
      navigate('/rating');
      return;
    }

    setStudentName(savedStudent);
    setRating(savedRating);

    // Check for edit mode
    const editLesson = JSON.parse(localStorage.getItem('faa_edit_lesson') || 'null');
    if (editLesson && editLesson.type === 'ground') {
      setEditId(editLesson.id);
      setGrades(editLesson.grades || {});
      setNotes(editLesson.notes || {});
      setLessonNotes(editLesson.meta?.notes || '');
      setLessonDate(editLesson.meta?.date || new Date().toISOString().split('T')[0]);
      setInstructorName(editLesson.instructor || '');
      setLessonLabel(editLesson.label || '');
      setLessonNum(editLesson.lesson_num || 1);
      setOverallGrade(editLesson.meta?.overallGrade || '');
      // Clear edit lesson from storage so it doesn't persist on next new lesson
      localStorage.removeItem('faa_edit_lesson');
    } else {
      resetLessonState();
      
      // Fetch next lesson number
      supabase.from('lessons')
        .select('lesson_num')
        .eq('student_name', savedStudent)
        .eq('type', 'ground')
        .order('lesson_num', { ascending: false })
        .limit(1)
        .then(({ data: existing }) => {
          const nextNum = existing && existing.length > 0 ? (existing[0].lesson_num || 0) + 1 : 1;
          setLessonNum(nextNum);
          setLessonLabel(`Ground Lesson ${nextNum}`);
        });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !editLesson) {
        setInstructorName(session.user.user_metadata?.full_name || session.user.email || '');
      }
    });
  }, [navigate]);

const acsData = ALL_GROUND_ACS[rating?.code || 'ppl'] || ALL_GROUND_ACS['ppl'];

  const groundTasks = rating ? acsData.flatMap((area, ai) =>
    area.tasks
      .filter(task => !task.name.includes('N/A') && !task.name.includes('ASEL') && !task.name.includes('Seaplane') && !task.name.includes('Water'))
      .map((task, ti) => ({
        ...task,
        id: `${ai}_${ti}`,
        area: area.area,
        ai,
        ti
      }))
  ) : [];

  const saveToLocal = (newGrades = grades, newNotes = notes, newMetaNotes = lessonNotes, newDate = lessonDate) => {
    if (!rating || editId) return;
    localStorage.setItem(`faa_current_lesson_${rating.code}`, JSON.stringify({
      grades: newGrades,
      notes: newNotes,
      meta: { date: newDate, notes: newMetaNotes }
    }));
  };

  const handleGradeSet = (taskId: string, grade: Grade) => {
    let current: Grade = (grades[taskId] as Grade) || '';

    // Backwards compatibility normalization
    if (current === 'S') current = '3';
    if (current === 'N') current = '2';

    const next = current === grade ? '' : grade;
    
    if (next === '1' || next === '2') {
      const task = groundTasks.find(t => t.id === taskId);
      if (task) {
        setActiveACSTask({ task, id: taskId, prevGrade: current, pendingGrade: next });
        return;
      }
    }

    const newGrades = { ...grades, [taskId]: next };
    setGrades(newGrades);
    saveToLocal(newGrades);
  };

  const handleACSConfirm = (selectedStds: ACSStandard[], acsNotes: string) => {
    if (!activeACSTask) return;
    
    const taskId = activeACSTask.id;
    const gradeToSave = activeACSTask.pendingGrade;
    const newGrades = { ...grades, [taskId]: gradeToSave };
    
    // Format the note: Failed standards: PA.I.A.R1 Proficiency versus currency, PA.I.A.R2 Personal minimums. Notes: Student had difficulty explaining the difference.
    const stdsText = selectedStds.map(s => `${s.code} ${s.description}`).join(', ');
    const prefix = gradeToSave === '1' ? "Grade 1 — Failed standards:" : "Grade 2 — Below standard:";
    const formattedNote = `${prefix} ${stdsText}.${acsNotes ? ` Notes: ${acsNotes}` : ''}`;
    
    const newNotes = { ...notes, [taskId]: formattedNote };
    
    setGrades(newGrades);
    setNotes(newNotes);
    saveToLocal(newGrades, newNotes);
    setActiveACSTask(null);
  };

  const handleACSCancel = () => {
    if (!activeACSTask) return;
    const taskId = activeACSTask.id;
    const newGrades = { ...grades, [taskId]: activeACSTask.prevGrade };
    setGrades(newGrades);
    saveToLocal(newGrades);
    setActiveACSTask(null);
  };

  const handleFillAll = () => {
    const cycle: Grade[] = ['', '3', '4', '1', '2'];
    const next = cycle[(cycle.indexOf(fillState) + 1) % cycle.length];
    setFillState(next);
    const newGrades = { ...grades };
    groundTasks.forEach(t => { newGrades[t.id] = next; });
    setGrades(newGrades);
    saveToLocal(newGrades);
  };

  const handleNoteChange = (taskId: string, val: string) => {
    const newNotes = { ...notes, [taskId]: val };
    setNotes(newNotes);
    saveToLocal(grades, newNotes);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleNoteExpand = (taskId: string) => {
    setExpandedNotes(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAreaToggle = (ai: number) => {
    setExpandedAreas(prev => {
      const isCurrentlyOpen = !!prev[ai];
      if (isCurrentlyOpen) {
        return { ...prev, [ai]: false };
      } else {
        const nextExpanded = { ...prev, [ai]: true };
        Object.keys(prev).forEach(keyStr => {
          const areaIdx = parseInt(keyStr);
          if (areaIdx !== ai && prev[areaIdx]) {
            const areaTasks = groundTasks.filter(t => t.ai === areaIdx);
            const hasGraded = areaTasks.some(t => grades[t.id] && grades[t.id] !== '');
            if (!hasGraded) {
              nextExpanded[areaIdx] = false;
            }
          }
        });
        return nextExpanded;
      }
    });
  };

  const handleSave = async () => {
    if (!studentName) return;

    if (!overallGrade) {
      alert('Please select an overall lesson grade before saving');
      return;
    }

    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Session expired — please sign in again.');
      navigate('/auth');
      return;
    }

    const lessonData: any = {
      user_id: session.user.id,
      student_name: studentName,
      type: 'ground',
      instructor: instructorName,
      lesson_num: lessonNum,
      label: lessonLabel,
      meta: {
        date: lessonDate,
        notes: lessonNotes,
        rating_code: rating?.code || 'ppl',
        rating_label: rating?.label || 'Private Pilot ASEL',
        overallGrade
      },
      grades,
      notes
    };

    let error;
    if (editId) {
      const { error: updateError } = await supabase.from('lessons').update(lessonData).eq('id', editId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('lessons').insert(lessonData);
      error = insertError;
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      localStorage.removeItem(`faa_current_lesson_${rating?.code}`);
      navigate('/history');
    }
    setSaving(false);
  };

  const handleClear = () => {
    if (!confirm('Clear all grades and notes? This cannot be undone.')) return;
    setGrades({});
    setNotes({});
    setLessonNotes('');
    setLessonDate(new Date().toISOString().split('T')[0]);
    localStorage.removeItem('faa_current_lesson');
  };

  const counts = {
    s: Object.values(grades).filter(v => ['S', '3', '4'].includes(v as string)).length,
    n: Object.values(grades).filter(v => ['N', '1', '2'].includes(v as string)).length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
            <Link to="/dashboard" className="hover:text-[#1a3a5c] transition-colors">Home</Link>
            <span className="hidden sm:inline-flex items-center gap-2">
              <ChevronRight size={10} />
              <Link to="/rating" className="hover:text-[#1a3a5c] transition-colors">Rating</Link>
            </span>
            <span className="hidden sm:inline-flex items-center gap-2">
              <ChevronRight size={10} />
              <Link to="/lesson-type" className="hover:text-[#1a3a5c] transition-colors">Lesson Type</Link>
            </span>
            <ChevronRight size={10} />
            <span className="text-[#1a3a5c]">Ground Lesson</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#e8a020] rounded-lg flex items-center justify-center text-[#1a3a5c] text-xl font-bold">📚</div>
            <div>
              <h1 className="text-xl font-bold text-[#1c2333]">Ground Lesson Entry</h1>
              <p className="text-xs text-[#6b7280]">{rating?.label || 'Private Pilot ASEL'}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/lesson-type" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#dde3ec] bg-white text-[#6b7280] hover:bg-[#f4f5f7] hover:-translate-y-0.5 transition-all text-xs font-bold">
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Student Name</label>
            <input
              type="text"
              value={studentName}
              readOnly
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 bg-[#f4f5f7] text-[#1c2333] cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Lesson Label</label>
            <input
              type="text"
              value={lessonLabel}
              onChange={(e) => setLessonLabel(e.target.value)}
              placeholder="e.g. Ground Lesson 1"
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Instructor (CFI)</label>
            <input
              type="text"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              placeholder="Instructor name"
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Date</label>
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => { setLessonDate(e.target.value); saveToLocal(grades, notes, lessonNotes, e.target.value); }}
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Lesson Notes</label>
          <textarea
            value={lessonNotes}
            onChange={(e) => { setLessonNotes(e.target.value); saveToLocal(grades, notes, e.target.value); }}
            placeholder="General lesson notes..."
            rows={2}
            className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#2d7a4f]">{counts.s}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Satisfactory</div>
        </div>
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#c0392b]">{counts.n}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Needs Impr.</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-lg overflow-hidden mb-8">
        <div className="hidden sm:grid grid-cols-[1fr_72px_1.3fr] bg-[#f4f5f7] border-b border-[#dde3ec] text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
          <div className="px-4 py-2 flex items-center">Task</div>
          <div className="px-2 py-2 flex flex-col items-center justify-center gap-1 border-x border-[#dde3ec]">
            <button
              onClick={handleFillAll}
              className={cn(
                "w-12 h-6 rounded border font-mono text-[11px] transition-all active:scale-95",
                fillState === '4' ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-md shadow-[#2d7a4f]/30" :
                fillState === '3' ? "bg-[#5a9e6f] border-[#5a9e6f] text-white shadow-md shadow-[#5a9e6f]/30" :
                fillState === '2' ? "bg-[#e8a020] border-[#e8a020] text-white shadow-md shadow-[#e8a020]/30" :
                fillState === '1' ? "bg-[#c0392b] border-[#c0392b] text-white shadow-md shadow-[#c0392b]/30" :
                "bg-white border-[#dde3ec] text-[#6b7280] hover:border-[#2a5a8c]"
              )}
            >
              {fillState || '—'}
            </button>
            <span>Grade</span>
          </div>
          <div className="px-4 py-2 flex items-center">Notes</div>
        </div>

        <div className="divide-y divide-[#dde3ec]">
          {rating?.code === 'cfii' ? (
            acsData.map((area, ai) => {
              const areaTasks = groundTasks.filter(t => t.ai === ai);
              if (areaTasks.length === 0) return null;
              const isAreaExpanded = expandedAreas[ai];
              return (
                <div key={area.area} className="border-b border-[#dde3ec] last:border-0">
                  <button 
                    onClick={() => handleAreaToggle(ai)}
                    className="w-full bg-[#1a3a5c] text-white px-4 py-3 text-xs font-bold flex justify-between items-center hover:bg-[#1a3a5c]/95 transition-colors text-left"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span>{area.area}</span>
                      <span className="opacity-60 font-normal text-[10px]">{areaTasks.length} tasks</span>
                    </div>
                    {isAreaExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  <AnimatePresence>
                    {isAreaExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden divide-y divide-[#dde3ec]"
                      >
                        {areaTasks.map(task => {
                          const g = grades[task.id] || '';
                          const displayGrade = g === 'S' ? '3' : g === 'N' ? '2' : g;
                          const n = notes[task.id] || '';
                          const isExpanded = expandedTasks[task.id];
                          return (
                            <div key={task.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_72px_1.3fr] hover:bg-[#fafbfd] transition-colors">
                              <div className="p-4">
                                <div
                                  onClick={() => toggleExpand(task.id)}
                                  className="text-[13px] font-medium text-[#1c2333] cursor-pointer flex items-center gap-2 hover:text-[#2a5a8c]"
                                >
                                  {task.name}
                                  <ChevronDown size={14} className={cn("text-[#6b7280] transition-transform", isExpanded && "rotate-180")} />
                                </div>
                                {isExpanded && task.stds && task.stds.length > 0 && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-3 p-3 bg-[#e4f5ec] rounded-lg border-l-4 border-[#2d7a4f] space-y-1.5"
                                  >
                                    {task.stds.map((std, idx) => (
                                      <div key={idx} className="text-[11px] text-[#1a4a2e] leading-relaxed flex gap-2">
                                        <span className="opacity-40 shrink-0">·</span>
                                        <span>{std.code} — {std.description}</span>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex items-center justify-start px-4 sm:px-0.5 sm:pt-3 py-2 sm:border-x border-[#dde3ec]">
                                <div className="grid grid-cols-4 sm:grid-cols-2 gap-1">
                                  {[1, 2, 3, 4].map((gVal) => {
                                    const gradeStr = gVal.toString();
                                    const isSelected = displayGrade === gradeStr;
                                    return (
                                      <button
                                        key={gVal}
                                        onClick={() => handleGradeSet(task.id, gradeStr as Grade)}
                                        className={cn(
                                          "w-8 h-7 rounded-md border font-mono text-[10px] font-bold transition-all active:scale-95",
                                          isSelected 
                                            ? gVal === 4 ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-sm" :
                                              gVal === 3 ? "bg-[#5a9e6f] border-[#5a9e6f] text-white shadow-sm" :
                                              gVal === 2 ? "bg-[#e8a020] border-[#e8a020] text-white shadow-sm" :
                                              "bg-[#c0392b] border-[#c0392b] text-white shadow-sm"
                                            : "bg-[#f4f5f7] border-[#dde3ec] text-[#6b7280] hover:border-[#2a5a8c]"
                                        )}
                                      >
                                        {gVal}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="px-4 py-2 sm:p-2 sm:pt-3 sm:pr-4 relative group">
                                <textarea
                                  value={n}
                                  onChange={(e) => handleNoteChange(task.id, e.target.value)}
                                  placeholder="Notes..."
                                  rows={expandedNotes[task.id] ? undefined : 1}
                                  className={cn(
                                    "w-full text-xs border border-transparent rounded-md px-2 py-1.5 bg-transparent focus:outline-none focus:border-[#2a5a8c] focus:bg-[#d4e8f5] transition-all resize-none",
                                    expandedNotes[task.id] ? "h-auto min-h-[32px]" : "h-[32px] overflow-hidden"
                                  )}
                                  onInput={(e) => {
                                    if (expandedNotes[task.id]) {
                                      const target = e.target as HTMLTextAreaElement;
                                      target.style.height = 'auto';
                                      target.style.height = target.scrollHeight + 'px';
                                    }
                                  }}
                                  ref={(el) => {
                                    if (el && expandedNotes[task.id]) {
                                      el.style.height = 'auto';
                                      el.style.height = el.scrollHeight + 'px';
                                    }
                                  }}
                                />
                                {!expandedNotes[task.id] && n.length > 0 && (
                                  <div className="absolute bottom-3 right-10 w-1.5 h-1.5 bg-[#6b7280] rounded-full opacity-30 pointer-events-none" />
                                )}
                                <button
                                  onClick={() => toggleNoteExpand(task.id)}
                                  className="absolute right-0 top-1.5 w-[44px] h-[44px] flex items-center justify-center text-[#6b7280] hover:text-[#1a3a5c] transition-colors"
                                  title={expandedNotes[task.id] ? "Collapse Notes" : "Expand Notes"}
                                >
                                  {expandedNotes[task.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            acsData.map((area, ai) => {
              const areaTasks = groundTasks.filter(t => t.ai === ai);
              if (areaTasks.length === 0) return null;
              return (
                <React.Fragment key={area.area}>
                  <div className="bg-[#1a3a5c] text-white px-4 py-3 text-xs font-bold flex justify-between items-center">
                    <span>{area.area}</span>
                    <span className="opacity-60 font-normal">{areaTasks.length} tasks</span>
                  </div>
                  {areaTasks.map(task => {
                    const g = grades[task.id] || '';
                    const displayGrade = g === 'S' ? '3' : g === 'N' ? '2' : g;
                    const n = notes[task.id] || '';
                    const isExpanded = expandedTasks[task.id];
                    return (
                      <div key={task.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_72px_1.3fr] hover:bg-[#fafbfd] transition-colors border-b border-[#dde3ec]">
                        <div className="p-4">
                          <div
                            onClick={() => toggleExpand(task.id)}
                            className="text-[13px] font-medium text-[#1c2333] cursor-pointer flex items-center gap-2 hover:text-[#2a5a8c]"
                          >
                            {task.name}
                            <ChevronDown size={14} className={cn("text-[#6b7280] transition-transform", isExpanded && "rotate-180")} />
                          </div>
                          {isExpanded && task.stds && task.stds.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-3 p-3 bg-[#e4f5ec] rounded-lg border-l-4 border-[#2d7a4f] space-y-1.5"
                            >
                              {task.stds.map((std, idx) => (
                                <div key={idx} className="text-[11px] text-[#1a4a2e] leading-relaxed flex gap-2">
                                  <span className="opacity-40 shrink-0">·</span>
                                  <span>{std.code} — {std.description}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                        <div className="flex items-center justify-start px-4 sm:px-0.5 sm:pt-3 py-2 sm:border-x border-[#dde3ec]">
                          <div className="grid grid-cols-4 sm:grid-cols-2 gap-1">
                            {[1, 2, 3, 4].map((gVal) => {
                              const gradeStr = gVal.toString();
                              const isSelected = displayGrade === gradeStr;
                              return (
                                <button
                                  key={gVal}
                                  onClick={() => handleGradeSet(task.id, gradeStr as Grade)}
                                  className={cn(
                                    "w-8 h-7 rounded-md border font-mono text-[10px] font-bold transition-all active:scale-95",
                                    isSelected 
                                      ? gVal === 4 ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-sm" :
                                        gVal === 3 ? "bg-[#5a9e6f] border-[#5a9e6f] text-white shadow-sm" :
                                        gVal === 2 ? "bg-[#e8a020] border-[#e8a020] text-white shadow-sm" :
                                        "bg-[#c0392b] border-[#c0392b] text-white shadow-sm"
                                      : "bg-[#f4f5f7] border-[#dde3ec] text-[#6b7280] hover:border-[#2a5a8c]"
                                  )}
                                >
                                  {gVal}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="px-4 py-2 sm:p-2 sm:pt-3 sm:pr-4 relative group">
                          <textarea
                            value={n}
                            onChange={(e) => handleNoteChange(task.id, e.target.value)}
                            placeholder="Notes..."
                            rows={expandedNotes[task.id] ? undefined : 1}
                            className={cn(
                              "w-full text-xs border border-transparent rounded-md px-2 py-1.5 bg-transparent focus:outline-none focus:border-[#2a5a8c] focus:bg-[#d4e8f5] transition-all resize-none",
                              expandedNotes[task.id] ? "h-auto min-h-[32px]" : "h-[32px] overflow-hidden"
                            )}
                            onInput={(e) => {
                              if (expandedNotes[task.id]) {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                              }
                            }}
                            ref={(el) => {
                              if (el && expandedNotes[task.id]) {
                                el.style.height = 'auto';
                                el.style.height = el.scrollHeight + 'px';
                              }
                            }}
                          />
                          {!expandedNotes[task.id] && n.length > 0 && (
                            <div className="absolute bottom-3 right-10 w-1.5 h-1.5 bg-[#6b7280] rounded-full opacity-30 pointer-events-none" />
                          )}
                          <button
                            onClick={() => toggleNoteExpand(task.id)}
                            className="absolute right-0 top-1.5 w-[44px] h-[44px] flex items-center justify-center text-[#6b7280] hover:text-[#1a3a5c] transition-colors"
                            title={expandedNotes[task.id] ? "Collapse Notes" : "Expand Notes"}
                          >
                            {expandedNotes[task.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm p-6 mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3 text-center">Overall Lesson Assessment</div>
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <button
            onClick={() => setOverallGrade('S')}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-xl border transition-all",
              overallGrade === 'S' 
                ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-md shadow-[#2d7a4f]/20" 
                : "bg-white border-[#dde3ec] text-[#6b7280] hover:border-[#2d7a4f] hover:text-[#2d7a4f]"
            )}
          >
            <span className="text-sm font-bold">S — Satisfactory</span>
          </button>
          <button
            onClick={() => setOverallGrade('N')}
            className={cn(
              "flex flex-col items-center gap-1 py-3 rounded-xl border transition-all",
              overallGrade === 'N' 
                ? "bg-[#c0392b] border-[#c0392b] text-white shadow-md shadow-[#c0392b]/20" 
                : "bg-white border-[#dde3ec] text-[#6b7280] hover:border-[#c0392b] hover:text-[#c0392b]"
            )}
          >
            <span className="text-sm font-bold">N — Needs Improvement</span>
          </button>
        </div>
        <p className="text-[10px] text-[#94a3b8] text-center mt-3 font-medium">Required before saving.</p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleClear}
          className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] font-medium text-sm hover:bg-[#f4f5f7] transition-all"
        >
          Clear Page
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !rating}
          className="px-8 py-2.5 rounded-xl bg-[#1a3a5c] text-white font-bold text-sm shadow-md shadow-[#1a3a5c]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a3a5c]/30 active:translate-y-0 active:shadow-sm transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Lesson
        </button>
      </div>

      {activeACSTask && (
        <ACSStandardsModal 
          isOpen={!!activeACSTask}
          taskId={activeACSTask.task.code}
          taskName={activeACSTask.task.name}
          onConfirm={handleACSConfirm}
          onCancel={handleACSCancel}
          pendingGrade={activeACSTask?.pendingGrade}
        />
      )}
    </div>
  );
}
