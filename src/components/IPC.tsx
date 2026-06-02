import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { IR_GROUND_ACS, IR_FLIGHT_ACS } from '../constants/irACS';
import { AIRCRAFT_MODELS } from '../constants/aircraft';
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
  const [aircraft, setAircraft] = useState('');
  const [showAircraftDropdown, setShowAircraftDropdown] = useState(false);
  
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
    const savedStudent = localStorage.getItem('sb_selected_student') || '';
    if (!savedStudent) {
      navigate('/dashboard');
      return;
    }
    setStudentName(savedStudent);

    // Get CFI instructor name
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setInstructorName(session.user.user_metadata?.full_name || session.user.email || '');
      }
    });
  }, [navigate]);

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
    setAircraft('');
    setLessonDate(getLocalDateString());
    setOverallGrade('');
  };

  const handleSave = async () => {
    if (!overallGrade) {
      alert("Please select an overall assessment before saving.");
      return;
    }

    if (overallGrade === 'S' && !aircraft.trim()) {
      alert("Aircraft Make & Model is required for satisfactory IPC endorsement.");
      return;
    }

    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Session expired");
      navigate('/auth');
      setSaving(false);
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

    const lessonData = {
      user_id: session.user.id,
      student_name: studentName,
      type: 'ipc',
      instructor: instructorName,
      lesson_num: 1,
      label: 'IPC (§61.57)',
      grades,
      notes,
      meta: {
        date: lessonDate,
        notes: lessonNotes,
        overallGrade,
        ipc_endorsed: overallGrade === 'S',
        aircraft: aircraft
      }
    };

    try {
      const { error: insertError } = await supabase.from('lessons').insert(lessonData);
      if (insertError) throw insertError;

      if (overallGrade === 'S') {
        const { error: updateError } = await supabase
          .from('students')
          .update({ last_ipc_date: lessonDate })
          .eq('name', studentName)
          .eq('user_id', session.user.id);
        
        if (updateError) throw updateError;
      }

      navigate('/history');
    } catch (err: any) {
      alert(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

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
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Aircraft (Make & Model)</label>
            <div className="relative">
              <input
                type="text"
                value={aircraft}
                onChange={(e) => {
                  setAircraft(e.target.value);
                  setShowAircraftDropdown(true);
                }}
                onFocus={() => setShowAircraftDropdown(true)}
                onBlur={() => setTimeout(() => setShowAircraftDropdown(false), 150)}
                placeholder="e.g. C-172, Cessna"
                className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#0ea5e9] transition-all"
              />
              {showAircraftDropdown && aircraft.trim() !== '' && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-[#dde3ec] rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
                  {(() => {
                    const filtered = AIRCRAFT_MODELS.filter(m => 
                      m.toLowerCase().includes(aircraft.toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="px-3 py-2 text-xs italic text-[#94a3b8]">
                          No matching models found
                        </div>
                      );
                    }
                    return filtered.slice(0, 50).map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => {
                          setAircraft(model);
                          setShowAircraftDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-[#1c2333] hover:bg-[#0ea5e9]/10 hover:text-[#0ea5e9] transition-colors cursor-pointer"
                      >
                        {model}
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
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
      <div className="flex justify-end gap-3">
        <button
          onClick={handleClear}
          className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] font-medium text-sm hover:bg-[#f4f5f7] transition-all cursor-pointer"
        >
          Clear Page
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
          Save IPC
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
