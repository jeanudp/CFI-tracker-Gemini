import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { IR_GROUND_ACS, IR_FLIGHT_ACS } from '../constants/irACS';
import AircraftPicker from './AircraftPicker';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronUp, 
  Save, 
  ArrowLeft, 
  Loader2, 
  ChevronRight, 
  BookOpen, 
  Plane, 
  CheckCircle2, 
  Circle,
  Compass,
  Printer
} from 'lucide-react';
import { cn } from '../lib/utils';
import EndorsementPrinter from './EndorsementPrinter';

export default function IPC() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('id');

  // Local date formatting (using local timezone components as requested)
  const getLocalDateString = () => {
    const d = new Date();
    const localYear = d.getFullYear();
    const localMonth = String(d.getMonth() + 1).padStart(2, '0');
    const localDay = String(d.getDate()).padStart(2, '0');
    return `${localYear}-${localMonth}-${localDay}`;
  };

  // State variables
  const [studentName, setStudentName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [lessonDate, setLessonDate] = useState(getLocalDateString());
  const [lessonNotes, setLessonNotes] = useState('');
  const [aircraft, setAircraft] = useState({
    tailNumber: '',
    model: '',
    icao: '',
    aircraftClass: 'ASEL' as 'ASEL' | 'AMEL',
    complex: false
  });
  
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  
  const [groundCovered, setGroundCovered] = useState<Record<string, boolean>>({});
  const [flightCovered, setFlightCovered] = useState<Record<string, boolean>>({});
  
  const [groundNotes, setGroundNotes] = useState<Record<string, string>>({});
  const [flightNotes, setFlightNotes] = useState<Record<string, string>>({});

  const [groundExpanded, setGroundExpanded] = useState(true);
  const [flightExpanded, setFlightExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [overallGrade, setOverallGrade] = useState<'' | 'S' | 'N'>('');
  const [showEndorsement, setShowEndorsement] = useState(false);

  // Accordion task expansion states
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function initPage() {
      const { data: { session } } = await supabase.auth.getSession();
      const defaultCfi = session
        ? (session.user.user_metadata?.full_name || session.user.email || '')
        : '';

      if (!draftId) {
        // No draft ID in URL
        const savedStudent = localStorage.getItem('sb_selected_student') || '';
        if (!savedStudent) {
          navigate('/dashboard');
          return;
        }
        setStudentName(savedStudent);
        setInstructorName(defaultCfi);
      } else {
        // Resuming a draft
        if (!session) {
          navigate('/auth');
          return;
        }
        
        try {
          setLoadingDraft(true);
          const { data: row, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', draftId)
            .eq('user_id', session.user.id)
            .single();

          if (error) throw error;
          if (!row) throw new Error('Lesson not found');

          setLessonId(draftId);
          setStudentName(row.student_name || '');
          setInstructorName(row.instructor || defaultCfi);

          const meta = row.meta || {};
          setLessonDate(meta.date || getLocalDateString());
          setLessonNotes(meta.notes || '');
          setOverallGrade(meta.overallGrade || '');

          setAircraft({
            tailNumber: meta.aircraft || '',
            model: meta.aircraftModel || '',
            icao: meta.aircraftIcao || '',
            aircraftClass: meta.aircraftClass || 'ASEL',
            complex: meta.complex === true
          });

          const grades = row.grades || {};
          const notesObj = row.notes || {};

          // Rebuild groundCovered & groundNotes
          const newGroundCovered: Record<string, boolean> = {};
          const newGroundNotes: Record<string, string> = {};
          IR_GROUND_ACS.forEach(area => {
            area.tasks.forEach(task => {
              if (grades[task.code] === '3') {
                newGroundCovered[task.code] = true;
              }
              if (notesObj[task.code]) {
                newGroundNotes[task.code] = notesObj[task.code];
              }
            });
          });
          setGroundCovered(newGroundCovered);
          setGroundNotes(newGroundNotes);

          // Rebuild flightCovered & flightNotes
          const newFlightCovered: Record<string, boolean> = {};
          const newFlightNotes: Record<string, string> = {};
          IR_FLIGHT_ACS.forEach(area => {
            area.tasks.forEach(task => {
              if (grades[task.code] === '3') {
                newFlightCovered[task.code] = true;
              }
              if (notesObj[task.code]) {
                newFlightNotes[task.code] = notesObj[task.code];
              }
            });
          });
          setFlightCovered(newFlightCovered);
          setFlightNotes(newFlightNotes);

        } catch (err: any) {
          alert(err.message || 'Error loading draft.');
        } finally {
          setLoadingDraft(false);
        }
      }
    }

    initPage();
  }, [draftId, navigate]);

  // Helpers to calculate stats for combined count boxes
  const totalGroundTasks = IR_GROUND_ACS.reduce((acc, area) => acc + area.tasks.length, 0);
  const totalFlightTasks = IR_FLIGHT_ACS.reduce((acc, area) => acc + area.tasks.length, 0);

  const coveredGroundCount = Object.values(groundCovered).filter(Boolean).length;
  const coveredFlightCount = Object.values(flightCovered).filter(Boolean).length;
  const totalCoveredCount = coveredGroundCount + coveredFlightCount;

  const notesGroundCount = Object.values(groundNotes).filter(n => typeof n === 'string' && n.trim() !== '').length;
  const notesFlightCount = Object.values(flightNotes).filter(n => typeof n === 'string' && n.trim() !== '').length;
  const totalNotesCount = notesGroundCount + notesFlightCount;

  const toggleTaskExpand = (code: string) => {
    setExpandedTasks(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleNoteExpand = (code: string) => {
    setExpandedNotes(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleGroundCovered = (code: string) => {
    setGroundCovered(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleFlightCovered = (code: string) => {
    setFlightCovered(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleGroundNoteChange = (code: string, val: string) => {
    setGroundNotes(prev => ({ ...prev, [code]: val }));
  };

  const handleFlightNoteChange = (code: string, val: string) => {
    setFlightNotes(prev => ({ ...prev, [code]: val }));
  };

  const handleClear = () => {
    if (!confirm('Clear all covered tasks, notes and aircraft model? This cannot be undone.')) return;
    setGroundCovered({});
    setFlightCovered({});
    setGroundNotes({});
    setFlightNotes({});
    setLessonNotes('');
    setAircraft({
      tailNumber: '',
      model: '',
      icao: '',
      aircraftClass: 'ASEL',
      complex: false
    });
    setLessonDate(getLocalDateString());
    setOverallGrade('');
    setLessonId(null);
  };

  const saveLesson = async (isGroundDraft: boolean) => {
    if (!isGroundDraft) {
      if (!overallGrade) {
        alert("Please select an overall assessment before saving.");
        return;
      }

      if (overallGrade === 'S' && !aircraft.model.trim()) {
        alert("Aircraft Make & Model is required for satisfactory IPC endorsement.");
        return;
      }
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Session expired");
        navigate('/auth');
        return;
      }

      // Build grades object: '3' if covered, '' if not covered
      const grades: Record<string, string> = {};
      IR_GROUND_ACS.forEach(area => {
        area.tasks.forEach(task => {
          grades[task.code] = groundCovered[task.code] ? '3' : '';
        });
      });
      IR_FLIGHT_ACS.forEach(area => {
        area.tasks.forEach(task => {
          grades[task.code] = flightCovered[task.code] ? '3' : '';
        });
      });

      // Build unified notes object
      const notes = { ...groundNotes, ...flightNotes };

      const progress = isGroundDraft ? 'ground' : 'complete';
      const ipc_endorsed = isGroundDraft ? false : (overallGrade === 'S');

      const meta = {
        date: lessonDate,
        notes: lessonNotes,
        overallGrade: isGroundDraft ? (overallGrade || '') : overallGrade,
        ipc_endorsed,
        aircraft: aircraft.tailNumber,
        aircraftModel: aircraft.model,
        aircraftIcao: aircraft.icao,
        aircraftClass: aircraft.aircraftClass,
        complex: aircraft.complex,
        progress
      };

      const lessonData = {
        user_id: session.user.id,
        student_name: studentName,
        type: 'ipc',
        instructor: instructorName,
        lesson_num: 1,
        label: 'IPC (§61.57)',
        grades,
        notes,
        meta
      };

      let currentId = lessonId;

      if (currentId) {
        // UPDATE existing row
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            student_name: studentName,
            instructor: instructorName,
            grades,
            notes,
            meta
          })
          .eq('id', currentId)
          .eq('user_id', session.user.id);

        if (updateError) throw updateError;
      } else {
        // INSERT a new row
        const { data: insertedRows, error: insertError } = await supabase
          .from('lessons')
          .insert(lessonData)
          .select('id');

        if (insertError) throw insertError;
        
        if (insertedRows && insertedRows.length > 0) {
          currentId = insertedRows[0].id;
          if (isGroundDraft) {
            setLessonId(currentId);
          }
        }
      }

      if (!isGroundDraft && overallGrade === 'S') {
        const { error: updateError } = await supabase
          .from('students')
          .update({ last_ipc_date: lessonDate })
          .eq('name', studentName)
          .eq('user_id', session.user.id);
        
        if (updateError) throw updateError;
      }

      if (aircraft.tailNumber && aircraft.model) {
        const { error: aircraftError } = await supabase
          .from('saved_aircraft')
          .upsert({
            user_id: session.user.id,
            tail_number: aircraft.tailNumber.toUpperCase().trim(),
            aircraft_model: aircraft.model.trim(),
            aircraft_icao: aircraft.icao || '',
            aircraft_class: aircraft.aircraftClass || 'ASEL',
            complex: aircraft.complex === true,
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            use_count: 1
          }, {
            onConflict: 'user_id,tail_number',
            ignoreDuplicates: false
          });

        if (aircraftError) {
          console.error('Failed to save aircraft:', aircraftError);
        }
      }

      navigate('/history');
    } catch (err: any) {
      alert(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGround = () => saveLesson(true);
  const handleSave = () => saveLesson(false);

  if (loadingDraft) {
    return (
      <div className="min-h-screen bg-[#fafbfd] flex flex-col items-center justify-center p-8">
        <Loader2 size={40} className="text-[#1a3a5c] animate-spin mb-4" />
        <p className="text-sm font-medium text-[#6b7280]">Loading instrument proficiency check draft...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
            <Link to="/dashboard" className="hover:text-[#1a3a5c] transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-[#1a3a5c]">IPC (§61.57)</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0ea5e9] rounded-lg flex items-center justify-center text-white text-xl font-bold">
              <Compass size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1c2333]">Instrument Proficiency Check</h1>
              <p className="text-xs text-[#6b7280]">§61.57(d) — Instrument Currency Restoration</p>
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

      {/* Resume banner */}
      {lessonId && (
        <div id="resume-banner" className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 text-sky-800 text-xs sm:text-sm font-medium flex items-center gap-3 shadow-sm">
          <Compass className="text-sky-600 shrink-0" size={18} />
          <span>Resuming an in-progress IPC — complete the flight activities below and finalize.</span>
        </div>
      )}

      {/* Info Card */}
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Instructor (CFI)</label>
            <input
              type="text"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              placeholder="Instructor name"
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#0ea5e9] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Date</label>
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#0ea5e9] transition-all"
            />
          </div>
        </div>
        <div className="border-t border-[#dde3ec] my-4 pt-4 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Aircraft</label>
          <AircraftPicker value={aircraft} onChange={setAircraft} accentColor="#0ea5e9" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Review Notes</label>
          <textarea
            value={lessonNotes}
            onChange={(e) => setLessonNotes(e.target.value)}
            placeholder="General instrument proficiency check notes..."
            rows={2}
            className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#0ea5e9] transition-all resize-none"
          />
        </div>
      </div>

      {/* Progress Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#2d7a4f]">{totalCoveredCount}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Tasks Covered</div>
        </div>
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#1a3a5c]">{totalNotesCount}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">With Notes</div>
        </div>
      </div>

      {/* Ground Review Collapsible Section */}
      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-md overflow-hidden mb-6">
        <button
          onClick={() => setGroundExpanded(prev => !prev)}
          className="w-full bg-[#0ea5e9] text-white px-5 py-4 font-bold flex justify-between items-center hover:bg-[#0ea5e9]/95 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-white" />
            <span className="text-sm tracking-wide">Ground Review</span>
            <span className="ml-2 px-2.5 py-0.5 text-[10px] bg-white/20 text-white rounded-full font-bold">
              {coveredGroundCount} / {totalGroundTasks} covered
            </span>
          </div>
          {groundExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <AnimatePresence initial={false}>
          {groundExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-[#fafbfd]"
            >
              {/* Outer Header Row for Visual Alignment */}
              <div className="hidden sm:grid grid-cols-[1fr_72px_1.3fr] bg-[#f4f5f7] border-b border-[#dde3ec] text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                <div className="px-4 py-2 flex items-center">Task</div>
                <div className="px-2 py-2 flex items-center justify-center border-x border-[#dde3ec]">Covered</div>
                <div className="px-4 py-2 flex items-center">Notes</div>
              </div>

              <div className="divide-y divide-[#dde3ec]">
                {IR_GROUND_ACS.map((area) => {
                  return (
                    <React.Fragment key={area.area}>
                      <div className="bg-[#0ea5e9] text-white px-4 py-2.5 text-[11px] font-bold flex justify-between items-center">
                        <span className="tracking-wide">{area.area}</span>
                        <span className="opacity-60 font-medium text-[10px]">{area.tasks.length} tasks</span>
                      </div>
                      {area.tasks.map(task => {
                        const isCovered = !!groundCovered[task.code];
                        const noteText = groundNotes[task.code] || '';
                        const isExpanded = !!expandedTasks[task.code];
                        const isNoteExpanded = !!expandedNotes[task.code];

                        return (
                          <div key={task.code} className="flex flex-col sm:grid sm:grid-cols-[1fr_72px_1.3fr] hover:bg-[#fafbfd] transition-colors border-b border-[#dde3ec] bg-white">
                            {/* Column 1: Task and objective */}
                            <div className="p-4">
                              <div
                                onClick={() => toggleTaskExpand(task.code)}
                                className="text-[13px] font-medium text-[#1c2333] cursor-pointer flex items-center gap-2 hover:text-[#0ea5e9]"
                              >
                                <span>{task.name}</span>
                                <ChevronDown size={14} className={cn("text-[#6b7280] transition-transform", isExpanded && "rotate-180")} />
                              </div>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  className="mt-3 p-3 bg-[#f8fafc] rounded-lg border-l-4 border-[#0ea5e9] space-y-1.5 text-[11px]"
                                >
                                  <div>
                                    <span className="font-bold text-[#475569]">References: </span>
                                    <span className="text-[#334155]">{task.references}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#475569]">Objective: </span>
                                    <span className="text-[#334155] leading-relaxed">{task.objective}</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Column 2: Covered toggle */}
                            <div className="flex items-center justify-start sm:justify-center px-4 sm:px-0.5 sm:pt-3 py-2 sm:border-x border-[#dde3ec]">
                              <button
                                onClick={() => toggleGroundCovered(task.code)}
                                className={cn(
                                  "w-8 h-8 rounded-md border flex items-center justify-center transition-all active:scale-95",
                                  isCovered
                                    ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-sm"
                                    : "bg-[#f4f5f7] border-[#dde3ec] text-[#94a3b8] hover:border-[#0ea5e9] bg-white"
                                )}
                              >
                                {isCovered ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                              </button>
                            </div>

                            {/* Column 3: Notes column */}
                            <div className="px-4 py-2 sm:p-2 sm:pt-3 sm:pr-4 relative group">
                              <textarea
                                value={noteText}
                                onChange={(e) => handleGroundNoteChange(task.code, e.target.value)}
                                placeholder="Notes..."
                                rows={isNoteExpanded ? undefined : 1}
                                className={cn(
                                  "w-full text-xs border border-transparent rounded-md px-2 py-1.5 bg-transparent focus:outline-none focus:border-[#0ea5e9] focus:bg-[#e0f2fe] transition-all resize-none",
                                  isNoteExpanded ? "h-auto min-h-[32px]" : "h-[32px] overflow-hidden"
                                )}
                                onInput={(e) => {
                                  if (isNoteExpanded) {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                  }
                                }}
                                ref={(el) => {
                                  if (el && isNoteExpanded) {
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                  }
                                }}
                              />
                              {!isNoteExpanded && noteText.length > 0 && (
                                <div className="absolute bottom-3 right-10 w-1.5 h-1.5 bg-[#6b7280] rounded-full opacity-30 pointer-events-none" />
                              )}
                              <button
                                onClick={() => toggleNoteExpand(task.code)}
                                className="absolute right-0 top-1.5 w-[44px] h-[44px] flex items-center justify-center text-[#6b7280] hover:text-[#0ea5e9] transition-colors"
                                title={isNoteExpanded ? "Collapse Notes" : "Expand Notes"}
                              >
                                {isNoteExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Flight Activities Collapsible Section */}
      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-md overflow-hidden mb-6">
        <button
          onClick={() => setFlightExpanded(prev => !prev)}
          className="w-full bg-[#0ea5e9] text-white px-5 py-4 font-bold flex justify-between items-center hover:bg-[#0ea5e9]/95 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Plane size={20} className="text-white" />
            <span className="text-sm tracking-wide">Flight Activities</span>
            <span className="ml-2 px-2.5 py-0.5 text-[10px] bg-white/20 text-white rounded-full font-bold">
              {coveredFlightCount} / {totalFlightTasks} covered
            </span>
          </div>
          {flightExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <AnimatePresence initial={false}>
          {flightExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-[#fafbfd]"
            >
              {/* Outer Header Row for Visual Alignment */}
              <div className="hidden sm:grid grid-cols-[1fr_72px_1.3fr] bg-[#f4f5f7] border-b border-[#dde3ec] text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                <div className="px-4 py-2 flex items-center">Task</div>
                <div className="px-2 py-2 flex items-center justify-center border-x border-[#dde3ec]">Covered</div>
                <div className="px-4 py-2 flex items-center">Notes</div>
              </div>

              <div className="divide-y divide-[#dde3ec]">
                {IR_FLIGHT_ACS.map((area) => {
                  return (
                    <React.Fragment key={area.area}>
                      <div className="bg-[#0ea5e9] text-white px-4 py-2.5 text-[11px] font-bold flex justify-between items-center">
                        <span className="tracking-wide">{area.area}</span>
                        <span className="opacity-60 font-medium text-[10px]">{area.tasks.length} tasks</span>
                      </div>
                      {area.tasks.map(task => {
                        const isCovered = !!flightCovered[task.code];
                        const noteText = flightNotes[task.code] || '';
                        const isExpanded = !!expandedTasks[task.code];
                        const isNoteExpanded = !!expandedNotes[task.code];

                        return (
                          <div key={task.code} className="flex flex-col sm:grid sm:grid-cols-[1fr_72px_1.3fr] hover:bg-[#fafbfd] transition-colors border-b border-[#dde3ec] bg-white">
                            {/* Column 1: Task and objective */}
                            <div className="p-4">
                              <div
                                onClick={() => toggleTaskExpand(task.code)}
                                className="text-[13px] font-medium text-[#1c2333] cursor-pointer flex items-center gap-2 hover:text-[#0ea5e9]"
                              >
                                <span>{task.name}</span>
                                <ChevronDown size={14} className={cn("text-[#6b7280] transition-transform", isExpanded && "rotate-180")} />
                              </div>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  className="mt-3 p-3 bg-[#f8fafc] rounded-lg border-l-4 border-[#0ea5e9] space-y-1.5 text-[11px]"
                                >
                                  <div>
                                    <span className="font-bold text-[#475569]">References: </span>
                                    <span className="text-[#334155]">{task.references}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[#475569]">Objective: </span>
                                    <span className="text-[#334155] leading-relaxed">{task.objective}</span>
                                  </div>
                                </motion.div>
                              )}
                            </div>

                            {/* Column 2: Covered toggle */}
                            <div className="flex items-center justify-start sm:justify-center px-4 sm:px-0.5 sm:pt-3 py-2 sm:border-x border-[#dde3ec]">
                              <button
                                onClick={() => toggleFlightCovered(task.code)}
                                className={cn(
                                  "w-8 h-8 rounded-md border flex items-center justify-center transition-all active:scale-95",
                                  isCovered
                                    ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-sm"
                                    : "bg-[#f4f5f7] border-[#dde3ec] text-[#94a3b8] hover:border-[#0ea5e9] bg-white"
                                )}
                              >
                                {isCovered ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                              </button>
                            </div>

                            {/* Column 3: Notes column */}
                            <div className="px-4 py-2 sm:p-2 sm:pt-3 sm:pr-4 relative group">
                              <textarea
                                value={noteText}
                                onChange={(e) => handleFlightNoteChange(task.code, e.target.value)}
                                placeholder="Notes..."
                                rows={isNoteExpanded ? undefined : 1}
                                className={cn(
                                  "w-full text-xs border border-transparent rounded-md px-2 py-1.5 bg-transparent focus:outline-none focus:border-[#0ea5e9] focus:bg-[#e0f2fe] transition-all resize-none",
                                  isNoteExpanded ? "h-auto min-h-[32px]" : "h-[32px] overflow-hidden"
                                )}
                                onInput={(e) => {
                                  if (isNoteExpanded) {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                  }
                                }}
                                ref={(el) => {
                                  if (el && isNoteExpanded) {
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                  }
                                }}
                              />
                              {!isNoteExpanded && noteText.length > 0 && (
                                <div className="absolute bottom-3 right-10 w-1.5 h-1.5 bg-[#6b7280] rounded-full opacity-30 pointer-events-none" />
                              )}
                              <button
                                onClick={() => toggleNoteExpand(task.code)}
                                className="absolute right-0 top-1.5 w-[44px] h-[44px] flex items-center justify-center text-[#6b7280] hover:text-[#0ea5e9] transition-colors"
                                title={isNoteExpanded ? "Collapse Notes" : "Expand Notes"}
                              >
                                {isNoteExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overall Assessment */}
      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm p-6 mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3 text-center">Overall Review Assessment</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
          <button
            onClick={() => setOverallGrade('S')}
            className={cn(
              "flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer",
              overallGrade === 'S' 
                ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-md shadow-[#2d7a4f]/20" 
                : "bg-white border-[#dde3ec] text-[#6b7280] hover:border-[#2d7a4f] hover:text-[#2d7a4f]"
            )}
          >
            <span className="text-sm font-bold text-center">S — Satisfactory / IPC Endorsement Given</span>
          </button>
          <button
            onClick={() => setOverallGrade('N')}
            className={cn(
              "flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer",
              overallGrade === 'N' 
                ? "bg-[#c0392b] border-[#c0392b] text-white shadow-md shadow-[#c0392b]/20" 
                : "bg-white border-[#dde3ec] text-[#6b7280] hover:border-[#c0392b] hover:text-[#c0392b]"
            )}
          >
            <span className="text-sm font-bold text-center">N — Unsatisfactory / No Endorsement / Training Given</span>
          </button>
        </div>
        <p className="text-[11px] text-[#94a3b8] text-center mt-3 font-medium leading-relaxed">
          Per §61.57(d), an unsatisfactory IPC is logged as dual instruction given — no endorsement is issued.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 flex-wrap">
        <button
          onClick={handleClear}
          className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] font-medium text-sm hover:bg-[#f4f5f7] transition-all cursor-pointer"
        >
          Clear Page
        </button>
        <button
          onClick={handleSaveGround}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#1c2333] hover:bg-[#f4f5f7] font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
          Save Ground & Finish Later
        </button>
        {overallGrade === 'S' && (
          <button
            onClick={() => setShowEndorsement(true)}
            className="px-6 py-2.5 rounded-xl bg-[#0ea5e9] text-white font-bold text-sm shadow-md shadow-[#0ea5e9]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0ea5e9]/30 active:translate-y-0 active:shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer"
          >
            <Printer size={18} />
            Print Endorsement
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !overallGrade}
          className="px-8 py-2.5 rounded-xl bg-[#1a3a5c] text-white font-bold text-sm shadow-md shadow-[#1a3a5c]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a3a5c]/30 active:translate-y-0 active:shadow-sm transition-all duration-150 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Complete IPC
        </button>
      </div>

      {showEndorsement && (
        <EndorsementPrinter
          ratingCode="ipc"
          onClose={() => setShowEndorsement(false)}
        />
      )}
    </div>
  );
}
