import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ALL_ACS, ACS_ELEMENTS, RATINGS } from '../constants';
import { Grade, LessonMeta } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Save, Trash2, ArrowLeft, ArrowRight, Plane, CheckCircle2, AlertCircle, HelpCircle, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function FlightLesson() {
  const [studentName, setStudentName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [meta, setMeta] = useState<LessonMeta>({
    date: new Date().toISOString().split('T')[0],
    aircraft: '',
    notes: '',
    route: '',
    ldgTotal: '',
    ldgDay: '',
    ldgNight: '',
    xc: '',
    night: '',
    simInst: '',
    imc: '',
    groundSim: '',
    dual: '',
    cfi: '',
    sic: '',
    pic: '',
    totalFlight: '',
    solo: '',
    soloXc: '',
    atd: '',
    xcDual: '',
    xcSolo: '',
    xcPic: '',
    atdInst: '',
    nightDual: '',
    nightTakeoffs: '',
    nightPic: '',
    nightTakeoffsPic: '',
    nightLandingsPic: '',
    ftd: '',
    ffs: '',
    atdSE: '',
  });
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [fillState, setFillState] = useState<Grade>('');
  const [rating, setRating] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedStudent = localStorage.getItem('sb_selected_student') ||
      JSON.parse(localStorage.getItem('faa_student_info') || '{}').student || '';
    const savedRating = JSON.parse(localStorage.getItem('selected_rating') || '{}');

    if (!savedStudent) {
      navigate('/');
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
    if (editLesson && editLesson.type === 'flight') {
      setEditId(editLesson.id);
      setGrades(editLesson.grades || {});
      setNotes(editLesson.notes || {});
      setMeta(prev => ({ ...prev, ...editLesson.meta }));
      setInstructorName(editLesson.instructor || '');
      // Auto-open logbook if any field is filled
      const hasLogData = Object.entries(editLesson.meta || {}).some(([k, v]) => k !== 'date' && k !== 'notes' && v);
      if (hasLogData) setIsLogbookOpen(true);
      // Clear edit lesson from storage
      localStorage.removeItem('faa_edit_lesson');
    } else {
      const saved = JSON.parse(localStorage.getItem(`faa_current_flight_lesson_${savedRating.code}`) || 'null');
      if (saved) {
        setGrades(saved.grades || {});
        setNotes(saved.notes || {});
        setMeta(prev => ({ ...prev, ...saved.meta }));
        const hasLogData = Object.entries(saved.meta || {}).some(([k, v]) => k !== 'date' && k !== 'notes' && v);
        if (hasLogData) setIsLogbookOpen(true);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !editLesson) {
        setInstructorName(session.user.user_metadata?.full_name || session.user.email || '');
      }
    });
  }, [navigate]);

  const flightTasks = rating ? ALL_ACS[rating.code].flatMap((area, ai) => 
    area.tasks
      .filter(task => !task.includes('N/A') && !task.includes('ASEL') && !task.includes('Seaplane') && !task.includes('Water'))
      .map((task, ti) => ({
        id: `${ai}_${ti}`,
        area: area.area,
        task,
        ai,
        ti,
        stds: ACS_ELEMENTS[task] || []
      }))
  ) : [];

  const saveToLocal = (newGrades = grades, newNotes = notes, newMeta = meta) => {
    if (!rating || editId) return;
    localStorage.setItem(`faa_current_flight_lesson_${rating.code}`, JSON.stringify({
      grades: newGrades,
      notes: newNotes,
      meta: newMeta
    }));
  };

  const handleGradeCycle = (taskId: string) => {
    const cycle: Grade[] = ['', 'S', 'N', 'I'];
    const current = grades[taskId] || '';
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    const newGrades = { ...grades, [taskId]: next };
    setGrades(newGrades);
    saveToLocal(newGrades);
  };

  const handleFillAll = () => {
    const cycle: Grade[] = ['', 'S', 'N', 'I'];
    const next = cycle[(cycle.indexOf(fillState) + 1) % cycle.length];
    setFillState(next);
    const newGrades = { ...grades };
    flightTasks.forEach(t => { newGrades[t.id] = next; });
    setGrades(newGrades);
    saveToLocal(newGrades);
  };

  const handleNoteChange = (taskId: string, val: string) => {
    const newNotes = { ...notes, [taskId]: val };
    setNotes(newNotes);
    saveToLocal(grades, newNotes);
  };

  const handleMetaChange = (field: keyof LessonMeta, val: string) => {
    const newMeta = { ...meta, [field]: val };
    setMeta(newMeta);
    saveToLocal(grades, notes, newMeta);
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleSave = async () => {
    if (!studentName) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Session expired — please sign in again.');
      navigate('/auth');
      return;
    }

    let flightNum = 1;
    if (!editId) {
      const { data: existing } = await supabase.from('lessons')
        .select('lesson_num')
        .eq('student_name', studentName)
        .eq('type', 'flight')
        .order('lesson_num', { ascending: false })
        .limit(1);
      flightNum = existing && existing.length > 0 ? (existing[0].lesson_num || 0) + 1 : 1;
    }

    const ratingInfo = JSON.parse(localStorage.getItem('selected_rating') || '{}');

    const lessonData: any = {
      user_id: session.user.id,
      student_name: studentName,
      type: 'flight',
      instructor: instructorName,
      meta: {
        ...meta,
        rating_code: ratingInfo.code || 'ppl',
        rating_label: ratingInfo.label || 'Private Pilot ASEL'
      },
      grades,
      notes
    };

    if (!editId) {
      lessonData.lesson_num = flightNum;
      lessonData.label = `Flight Lesson ${flightNum}`;
    }

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
      localStorage.removeItem(`faa_current_flight_lesson_${ratingInfo.code}`);
      navigate('/history');
    }
    setSaving(false);
  };

  const handleClear = () => {
    if (!confirm('Clear all data on this page? This cannot be undone.')) return;
    setGrades({});
    setNotes({});
    setMeta({
      date: new Date().toISOString().split('T')[0],
      aircraft: '',
      notes: '',
      route: '',
      ldgTotal: '',
      ldgDay: '',
      ldgNight: '',
      xc: '',
      night: '',
      simInst: '',
      imc: '',
      groundSim: '',
      dual: '',
      cfi: '',
      sic: '',
      pic: '',
      totalFlight: '',
      solo: '',
      soloXc: '',
      atd: '',
      xcDual: '',
      xcSolo: '',
      xcPic: '',
      atdInst: '',
      nightDual: '',
      nightTakeoffs: '',
      nightPic: '',
      nightTakeoffsPic: '',
      nightLandingsPic: '',
      ftd: '',
      ffs: '',
      atdSE: '',
    });
    localStorage.removeItem('faa_current_lesson_flight');
  };

  const counts = {
    s: Object.values(grades).filter(v => v === 'S').length,
    n: Object.values(grades).filter(v => v === 'N').length,
    i: Object.values(grades).filter(v => v === 'I').length,
  };

  const acsData = rating ? ALL_ACS[rating.code] : [];
  const flightAreas = acsData.slice(1);
  const totalTasks = flightAreas.reduce((acc, area) => acc + area.tasks.length, 0);
  const gradedTasks = Object.values(grades).filter(v => v).length;
  const progressPct = totalTasks > 0 ? Math.round((gradedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
            <Link to="/" className="hover:text-[#1a3a5c] transition-colors">Students</Link>
            <ChevronRight size={10} />
            <Link to="/rating" className="hover:text-[#1a3a5c] transition-colors">Rating</Link>
            <ChevronRight size={10} />
            <Link to="/lesson-type" className="hover:text-[#1a3a5c] transition-colors">Lesson Type</Link>
            <ChevronRight size={10} />
            <span className="text-[#1a3a5c]">Flight Lesson</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#e8a020] rounded-lg flex items-center justify-center text-[#1a3a5c] text-xl font-bold">🛩</div>
            <div>
              <h1 className="text-xl font-bold text-[#1c2333]">Flight Lesson Entry</h1>
              <p className="text-xs text-[#6b7280]">{rating?.label || 'Private Pilot ASEL'} · Areas II–XII</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/lesson-type" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#dde3ec] bg-white text-[#6b7280] hover:bg-[#f4f5f7] transition-all text-xs font-bold">
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Lesson Date</label>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => handleMetaChange('date', e.target.value)}
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Aircraft N-Number</label>
            <input
              type="text"
              value={meta.aircraft}
              onChange={(e) => handleMetaChange('aircraft', e.target.value)}
              placeholder="N12345"
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Lesson Objectives / Notes</label>
          <textarea
            value={meta.notes}
            onChange={(e) => handleMetaChange('notes', e.target.value)}
            placeholder="Maneuvers practiced, airport used, weather..."
            rows={2}
            className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all resize-none"
          />
        </div>
      </div>

      {/* Logbook Section */}
      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-md overflow-hidden mb-6">
        <div
          onClick={() => setIsLogbookOpen(!isLogbookOpen)}
          className="p-4 border-b border-[#dde3ec] flex items-center justify-between cursor-pointer hover:bg-[#f4f5f7] transition-all"
        >
          <div className="flex items-center gap-3">
            <ChevronRight size={14} className={cn("text-[#6b7280] transition-transform", isLogbookOpen && "rotate-90")} />
            <span className="text-sm font-bold text-[#1c2333]">Flight Time Log — IACRA Compatible</span>
          </div>
          <div className="text-[10px] text-[#6b7280] font-medium uppercase tracking-wider">
            FAA logbook fields — Part 61 <span className="italic ml-2">{isLogbookOpen ? 'click to collapse' : 'click to expand'}</span>
          </div>
        </div>
        <AnimatePresence>
          {isLogbookOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Route</div>
              <div className="p-4 border-b border-[#dde3ec]">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Route (From → To, via)</label>
                  <input
                    type="text"
                    value={meta.route}
                    onChange={(e) => handleMetaChange('route', e.target.value.toUpperCase())}
                    placeholder="e.g. KORD → KMDW → KORD"
                    className="w-full text-sm font-mono border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] focus:bg-[#d4e8f5] transition-all"
                  />
                </div>
              </div>

              {/* Group 1 — Total Time */}
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Group 1 — Total Time</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Total Flight Time</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.totalFlight} onChange={(e) => handleMetaChange('totalFlight', e.target.value)} className="w-full text-sm font-bold font-mono bg-transparent outline-none text-[#1a3a5c]" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">ATD Time</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.atd} onChange={(e) => handleMetaChange('atd', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
              </div>

              {/* Group 2 — Instruction and Solo */}
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Group 2 — Instruction and Solo</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Dual Instruction</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.dual} onChange={(e) => handleMetaChange('dual', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Solo Flight Time</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.solo} onChange={(e) => handleMetaChange('solo', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Solo XC</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.soloXc} onChange={(e) => handleMetaChange('soloXc', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
              </div>

              {/* Group 3 — Pilot in Command */}
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Group 3 — Pilot in Command</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">PIC Time</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.pic} onChange={(e) => handleMetaChange('pic', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">SIC Time</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.sic} onChange={(e) => handleMetaChange('sic', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">As CFI</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.cfi} onChange={(e) => handleMetaChange('cfi', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
              </div>

              {/* Group 4 — Cross Country */}
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Group 4 — Cross Country</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC (Total)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.xc} onChange={(e) => handleMetaChange('xc', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC Dual</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.xcDual} onChange={(e) => handleMetaChange('xcDual', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC Solo</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.xcSolo} onChange={(e) => handleMetaChange('xcSolo', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC PIC</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.xcPic} onChange={(e) => handleMetaChange('xcPic', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
              </div>

              {/* Group 5 — Instrument */}
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Group 5 — Instrument</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Simulated Instrument</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.simInst} onChange={(e) => handleMetaChange('simInst', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Actual IMC</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.imc} onChange={(e) => handleMetaChange('imc', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">ATD Instrument</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.atdInst} onChange={(e) => handleMetaChange('atdInst', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
              </div>

              {/* Group 6 — Night */}
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Group 6 — Night</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night (Total)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.night} onChange={(e) => handleMetaChange('night', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Dual</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.nightDual} onChange={(e) => handleMetaChange('nightDual', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night PIC</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.nightPic} onChange={(e) => handleMetaChange('nightPic', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Takeoffs</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={meta.nightTakeoffs} onChange={(e) => handleMetaChange('nightTakeoffs', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Landings</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={meta.ldgNight} onChange={(e) => handleMetaChange('ldgNight', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night TO PIC</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={meta.nightTakeoffsPic} onChange={(e) => handleMetaChange('nightTakeoffsPic', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Ldg PIC</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={meta.nightLandingsPic} onChange={(e) => handleMetaChange('nightLandingsPic', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                  </div>
                </div>
              </div>

              {/* Group 7 — Simulator and Device */}
              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Group 7 — Simulator and Device</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">FTD Time</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.ftd} onChange={(e) => handleMetaChange('ftd', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">FFS Time</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.ffs} onChange={(e) => handleMetaChange('ffs', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">ATD SE</label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={meta.atdSE} onChange={(e) => handleMetaChange('atdSE', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Other Fields</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#dde3ec] border-b border-[#dde3ec]">
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Total Landings</label>
                  <input type="number" value={meta.ldgTotal} onChange={(e) => handleMetaChange('ldgTotal', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0" />
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Day Landings</label>
                  <input type="number" value={meta.ldgDay} onChange={(e) => handleMetaChange('ldgDay', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0" />
                </div>
                <div className="p-3 space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Ground Sim</label>
                  <input type="number" step="0.1" value={meta.groundSim} onChange={(e) => handleMetaChange('groundSim', e.target.value)} className="w-full text-sm font-mono bg-transparent outline-none" placeholder="0.0" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-[#1c2333]">Flight Progress</div>
          <div className="text-xs text-[#6b7280]">{gradedTasks} of {totalTasks} graded</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-[#f4f5f7] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              className="h-full bg-[#1a3a5c] rounded-full"
            />
          </div>
          <div className="text-sm font-mono font-bold text-[#1a3a5c] min-w-[40px] text-right">{progressPct}%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#2d7a4f]">{counts.s}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Satisfactory</div>
        </div>
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#c0392b]">{counts.n}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Needs Impr.</div>
        </div>
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#e8a020]">{counts.i}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Incomplete</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-lg overflow-hidden mb-8">
        <div className="grid grid-cols-[1fr_72px_1.3fr] bg-[#f4f5f7] border-b border-[#dde3ec] text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
          <div className="px-4 py-2 flex items-center">Area of Operation / Task</div>
          <div className="px-2 py-2 flex flex-col items-center justify-center gap-1 border-x border-[#dde3ec]">
            <button
              onClick={handleFillAll}
              className={cn(
                "w-12 h-6 rounded border font-mono text-[11px] transition-all",
                fillState === 'S' ? "bg-[#2d7a4f] border-[#2d7a4f] text-white" :
                fillState === 'N' ? "bg-[#c0392b] border-[#c0392b] text-white" :
                fillState === 'I' ? "bg-[#e8a020] border-[#e8a020] text-white" :
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
          {flightAreas.map((area, fi) => {
            const ai = fi + 1;
            if (area.tasks.length === 0) return null;
            return (
              <React.Fragment key={area.area}>
                <div className="bg-[#1a3a5c] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider">
                  {area.area}
                </div>
                {area.tasks.map((task, ti) => {
                  const id = `${ai}_${ti}`;
                  const g = grades[id] || '';
                  const n = notes[id] || '';
                  const isExpanded = expandedTasks[id];
                  return (
                    <div key={id} className="grid grid-cols-[1fr_72px_1.3fr] hover:bg-[#fafbfd] transition-colors">
                      <div className="p-4">
                        <div
                          onClick={() => toggleExpand(id)}
                          className="text-[13px] font-medium text-[#1c2333] cursor-pointer flex items-center gap-2 hover:text-[#2a5a8c]"
                        >
                          {task}
                          {ACS_ELEMENTS[task]?.length > 0 && (
                            <ChevronDown size={14} className={cn("text-[#6b7280] transition-transform", isExpanded && "rotate-180")} />
                          )}
                        </div>
                        {isExpanded && ACS_ELEMENTS[task]?.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-3 p-3 bg-[#d4e8f5] rounded-lg border-l-4 border-[#2a5a8c] space-y-1.5"
                          >
                            {ACS_ELEMENTS[task].map((std, idx) => (
                              <div key={idx} className="text-[11px] text-[#1a3a5c] leading-relaxed flex gap-2">
                                <span className="opacity-40 shrink-0">·</span>
                                <span>{std}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-start justify-center p-2 pt-4 border-x border-[#dde3ec]">
                        <button
                          onClick={() => handleGradeCycle(id)}
                          className={cn(
                            "w-12 h-7 rounded-md border font-mono text-xs font-bold transition-all",
                            g === 'S' ? "bg-[#2d7a4f] border-[#2d7a4f] text-white" :
                            g === 'N' ? "bg-[#c0392b] border-[#c0392b] text-white" :
                            g === 'I' ? "bg-[#e8a020] border-[#e8a020] text-white" :
                            "bg-[#f4f5f7] border-[#dde3ec] text-[#6b7280] hover:border-[#2a5a8c]"
                          )}
                        >
                          {g || '—'}
                        </button>
                      </div>
                      <div className="p-2 pt-3 pr-4">
                        <textarea
                          value={n}
                          onChange={(e) => handleNoteChange(id, e.target.value)}
                          placeholder="Notes..."
                          rows={1}
                          className="w-full text-xs border border-transparent rounded-md px-2 py-1.5 bg-transparent focus:outline-none focus:border-[#2a5a8c] focus:bg-[#d4e8f5] transition-all resize-none min-h-[32px]"
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
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
          className="px-8 py-2.5 rounded-xl bg-[#1a3a5c] text-white font-bold text-sm hover:bg-[#2a5a8c] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Lesson
        </button>
      </div>
    </div>
  );
}
