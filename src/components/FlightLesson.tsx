import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ALL_ACS, RATINGS } from '../constants';
import { AIRCRAFT_MODELS } from '../constants/aircraft';
import { Grade, LessonMeta, ACSTask, ACSStandard } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Save, Trash2, ArrowLeft, ArrowRight, Plane, CheckCircle2, AlertCircle, HelpCircle, ChevronRight, Loader2, Check, Search, X } from 'lucide-react';
import { cn } from '../lib/utils';
import ACSStandardsModal from './ACSStandardsModal';

const APPROACH_TYPES = [
  { code: 'ILS', label: 'ILS — Instrument Landing System' },
  { code: 'ILS/DME', label: 'ILS/DME — ILS with DME' },
  { code: 'PAR', label: 'PAR — Precision Approach Radar' },
  { code: 'GLS', label: 'GLS — GBAS Landing System' },
  { code: 'LPV', label: 'LPV — Localizer Performance with Vertical Guidance' },
  { code: 'LNAV/VNAV', label: 'LNAV/VNAV — Lateral Navigation/Vertical Navigation' },
  { code: 'LP', label: 'LP — Localizer Performance' },
  { code: 'LNAV', label: 'LNAV — Lateral Navigation' },
  { code: 'RNAV (GPS)', label: 'RNAV (GPS) — Area Navigation GPS' },
  { code: 'VOR', label: 'VOR — VHF Omnidirectional Range' },
  { code: 'VOR/DME', label: 'VOR/DME — VOR with DME' },
  { code: 'NDB', label: 'NDB — Non-Directional Beacon' },
  { code: 'NDB/DME', label: 'NDB/DME — NDB with DME' },
  { code: 'LOC', label: 'LOC — Localizer' },
  { code: 'LOC/DME', label: 'LOC/DME — Localizer with DME' },
  { code: 'LOC BC', label: 'LOC BC — Localizer Back Course' },
  { code: 'SDF', label: 'SDF — Simplified Directional Facility' },
  { code: 'LDA', label: 'LDA — Localizer Type Directional Aid' },
  { code: 'LDA/DME', label: 'LDA/DME — LDA with DME' },
  { code: 'ASR', label: 'ASR — Airport Surveillance Radar' },
  { code: 'TACAN', label: 'TACAN — Tactical Air Navigation' }
];

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
    night: '',
    simInst: '',
    imc: '',
    dual: '',
    pic: '',
    totalFlight: '',
    solo: '',
    atd: '',
    xcDual: '',
    xcSolo: '',
    xcPic: '',
    atdInst: '',
    nightDual: '',
    nightTakeoffs: '',
    nightPic: '',
    simDeviceType: 'ATD',
    ftd: '',
    ffs: '',
    ftdInst: '',
    ffsInst: '',
    studentFlewSolo: false,
    ratpSimInst: '',
    ratpActualInst: '',
    nightSolo: '',
    approachCount: '',
    approachTypes: '[]',
    holdPerformed: false,
  });
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    solo: false,
    pic: false,
    dual: false,
    instrument: false,
    approachesHolds: false,
    xc: false,
    night: false,
    sim: false
  });
  const [approachSearch, setApproachSearch] = useState('');
  const [soloGroupExpanded, setSoloGroupExpanded] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [fillState, setFillState] = useState<Grade>('');
  const [rating, setRating] = useState<any>(null);
  const [activeACSTask, setActiveACSTask] = useState<{ task: ACSTask, id: string, prevGrade: Grade } | null>(null);
  const [lessonLabel, setLessonLabel] = useState('');
  const [lessonNum, setLessonNum] = useState(1);
  const [aircraftSearch, setAircraftSearch] = useState('');
  const [showAircraftDropdown, setShowAircraftDropdown] = useState(false);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  const [recentAircraft, setRecentAircraft] = useState<any[]>([]);
  const navigate = useNavigate();

  const resetLessonState = () => {
    setGrades({});
    setNotes({});
    setMeta({
      date: new Date().toISOString().split('T')[0],
      aircraft: '',
      aircraftModel: '',
      notes: '',
      route: '',
      ldgTotal: '',
      ldgDay: '',
      ldgNight: '',
      night: '',
      simInst: '',
      imc: '',
      dual: '',
      pic: '',
      totalFlight: '',
      solo: '',
      atd: '',
      xcDual: '',
      xcSolo: '',
      xcPic: '',
      atdInst: '',
      nightDual: '',
      nightTakeoffs: '',
      nightPic: '',
      ftd: '',
      ffs: '',
      ftdInst: '',
      ffsInst: '',
      simDeviceType: 'ATD',
      studentFlewSolo: false,
      ratpSimInst: '',
      ratpActualInst: '',
      nightSolo: '',
      approachCount: '',
      approachTypes: '[]',
      holdPerformed: false,
    });
    setFillState('');
    setIsLogbookOpen(false);
    
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
      setLessonLabel(editLesson.label || '');
      setLessonNum(editLesson.lesson_num || 1);
      // Auto-open logbook if any field is filled
      const hasLogData = Object.entries(editLesson.meta || {}).some(([k, v]) => k !== 'date' && k !== 'notes' && v);
      if (hasLogData) setIsLogbookOpen(true);
      // Clear edit lesson from storage
      localStorage.removeItem('faa_edit_lesson');
    } else {
      resetLessonState();
      
      // Fetch next lesson number
      supabase.from('lessons')
        .select('lesson_num')
        .eq('student_name', savedStudent)
        .eq('type', 'flight')
        .order('lesson_num', { ascending: false })
        .limit(1)
        .then(({ data: existing }) => {
          const nextNum = existing && existing.length > 0 ? (existing[0].lesson_num || 0) + 1 : 1;
          setLessonNum(nextNum);
          setLessonLabel(`Flight Lesson ${nextNum}`);
        });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !editLesson) {
        setInstructorName(session.user.user_metadata?.full_name || session.user.email || '');
      }
    });
  }, [navigate]);

  const flightTasks = rating ? ALL_ACS[rating.code].flatMap((area, ai) => 
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
    
    if (next === 'N' && (rating?.code === 'ppl' || rating?.code === 'ir')) {
      const task = flightTasks.find(t => t.id === taskId);
      if (task) {
        setActiveACSTask({ task, id: taskId, prevGrade: current });
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
    const newGrades = { ...grades, [taskId]: 'N' as Grade };
    
    // Format the note: Failed standards: PA.I.A.R1 Proficiency versus currency, PA.I.A.R2 Personal minimums. Notes: Student had difficulty explaining the difference.
    const stdsText = selectedStds.map(s => `${s.code} ${s.description}`).join(', ');
    const formattedNote = `Failed standards: ${stdsText}.${acsNotes ? ` Notes: ${acsNotes}` : ''}`;
    
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

  const handleMetaChange = (field: keyof LessonMeta, val: any) => {
    const newMeta = { ...meta, [field]: val };
    setMeta(newMeta);
    saveToLocal(grades, notes, newMeta);
  };

  // Auto-populate aircraft model from saved_aircraft table
  useEffect(() => {
    const lookupAircraft = async () => {
      if (!meta.aircraft || meta.aircraft.length < 3) {
        setIsAutoPopulated(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('saved_aircraft')
          .select('model, icao')
          .eq('user_id', session.user.id)
          .eq('tail_number', meta.aircraft.toUpperCase())
          .single();

        if (data && !error) {
          setMeta(prev => ({
            ...prev,
            aircraftModel: data.model,
            aircraftIcao: data.icao
          }));
          setIsAutoPopulated(true);
        } else {
          setIsAutoPopulated(false);
        }
      } catch (err) {
        console.error('Error looking up aircraft:', err);
        setIsAutoPopulated(false);
      }
    };

    const timer = setTimeout(lookupAircraft, 500);
    return () => clearTimeout(timer);
  }, [meta.aircraft]);

  // Fetch recent aircraft for pills
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('saved_aircraft')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (data && !error) {
          setRecentAircraft(data);
        }
      } catch (err) {
        console.error('Error fetching recent aircraft:', err);
      }
    };

    fetchRecent();
  }, []);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleNoteExpand = (taskId: string) => {
    setExpandedNotes(prev => ({ ...prev, [taskId]: !prev[taskId] }));
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

    const lessonMeta = {
      date: meta.date,
      aircraft: meta.aircraft,
      aircraftModel: meta.aircraftModel,
      instructor: instructorName,
      route: meta.route,
      totalFlight: meta.totalFlight,
      dual: meta.dual,
      solo: meta.solo,
      pic: meta.pic,
      xc: meta.xc,
      xcDual: meta.xcDual,
      xcSolo: meta.xcSolo,
      xcPic: meta.xcPic,
      soloXc: meta.soloXc,
      simInst: meta.simInst,
      imc: meta.imc,
      atd: meta.atd,
      atdInst: meta.atdInst,
      atdSE: meta.atdSE,
      ftd: meta.ftd,
      ftdInst: meta.ftdInst,
      ffs: meta.ffs,
      ffsInst: meta.ffsInst,
      night: meta.night,
      nightDual: meta.nightDual,
      nightSolo: meta.nightSolo,
      nightPic: meta.nightPic,
      nightTakeoffs: meta.nightTakeoffs,
      ldgTotal: meta.ldgTotal,
      ldgDay: meta.ldgDay,
      ldgNight: meta.ldgNight,
      groundSim: meta.groundSim,
      cfi: meta.cfi,
      rating_code: rating?.code || 'ppl',
      rating_label: rating?.label || 'Private Pilot ASEL',
      studentFlewSolo: meta.studentFlewSolo,
      notes: meta.notes,
      simDeviceType: meta.simDeviceType,
      ratpSimInst: meta.ratpSimInst,
      ratpActualInst: meta.ratpActualInst,
      approachCount: meta.approachCount,
      approachTypes: meta.approachTypes,
      holdPerformed: meta.holdPerformed
    };

    const lessonData: any = {
      user_id: session.user.id,
      student_name: studentName,
      type: 'flight',
      instructor: instructorName,
      lesson_num: lessonNum,
      label: lessonLabel,
      meta: lessonMeta,
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

    if (!error && meta.aircraft && meta.aircraftModel) {
      await supabase
        .from('saved_aircraft')
        .upsert({
          user_id: session.user.id,
          tail_number: meta.aircraft.toUpperCase(),
          model: meta.aircraftModel,
          icao: meta.aircraftIcao || '',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,tail_number' });
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      localStorage.removeItem(`faa_current_flight_lesson_${rating?.code}`);
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
      aircraftModel: '',
      notes: '',
      route: '',
      ldgTotal: '',
      ldgDay: '',
      ldgNight: '',
      night: '',
      simInst: '',
      imc: '',
      dual: '',
      pic: '',
      totalFlight: '',
      solo: '',
      atd: '',
      xcDual: '',
      xcSolo: '',
      xcPic: '',
      atdInst: '',
      nightDual: '',
      nightTakeoffs: '',
      nightPic: '',
      ftd: '',
      ffs: '',
      ftdInst: '',
      ffsInst: '',
      simDeviceType: 'ATD',
      studentFlewSolo: false,
      ratpSimInst: '',
      ratpActualInst: '',
      nightSolo: '',
      approachCount: '',
      approachTypes: '[]',
      holdPerformed: false,
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
        {recentAircraft.length > 0 && (
          <div className="mb-6">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2 block">Recent Aircraft</label>
            <div className="flex flex-wrap gap-2">
              {recentAircraft.map((ac, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMeta(prev => ({
                      ...prev,
                      aircraft: ac.tail_number,
                      aircraftModel: ac.model,
                      aircraftIcao: ac.icao
                    }));
                    setIsAutoPopulated(true);
                  }}
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#f4f5f7] text-[#1a3a5c] border border-[#dde3ec] hover:border-[#1a3a5c] hover:bg-white transition-all flex items-center gap-1.5"
                >
                  <Plane size={10} className="opacity-50" />
                  {ac.tail_number} — {ac.model}
                </button>
              ))}
            </div>
          </div>
        )}
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
              placeholder="e.g. Flight Lesson 1"
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Lesson Date</label>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => handleMetaChange('date', e.target.value)}
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Tail Number (N-Number)</label>
            <input
              type="text"
              value={meta.aircraft}
              onChange={(e) => handleMetaChange('aircraft', e.target.value.toUpperCase())}
              placeholder="N12345"
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
          </div>
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Aircraft Model</label>
              {isAutoPopulated && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#2d7a4f] bg-[#e4f5ec] px-1.5 py-0.5 rounded animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 size={10} />
                  AUTO-FILLED
                </div>
              )}
            </div>
            <input
              type="text"
              value={meta.aircraftModel || ''}
              onChange={(e) => {
                const val = e.target.value;
                handleMetaChange('aircraftModel', val);
                setAircraftSearch(val);
                setShowAircraftDropdown(true);
                setIsAutoPopulated(false); // Reset if manually changed
              }}
              onFocus={() => setShowAircraftDropdown(true)}
              placeholder="e.g. C-172, Cessna"
              className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
            />
            {showAircraftDropdown && aircraftSearch && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-[#dde3ec] rounded-lg shadow-lg max-h-60 overflow-auto">
                {AIRCRAFT_MODELS.filter(m => 
                  m.toLowerCase().includes(aircraftSearch.toLowerCase())
                ).slice(0, 50).map((model, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 text-sm hover:bg-[#f4f5f7] cursor-pointer text-[#1c2333]"
                    onClick={() => {
                      handleMetaChange('aircraftModel', model);
                      setAircraftSearch('');
                      setShowAircraftDropdown(false);
                      setIsAutoPopulated(false);
                    }}
                  >
                    {model}
                  </div>
                ))}
                {AIRCRAFT_MODELS.filter(m => 
                  m.toLowerCase().includes(aircraftSearch.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-2 text-sm text-[#6b7280] italic">No matching models found</div>
                )}
              </div>
            )}
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
              {/* Main Visible Fields */}
              <div className="p-4 border-b border-[#dde3ec] bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Total Flight Time</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={meta.totalFlight}
                          onChange={(e) => handleMetaChange('totalFlight', e.target.value)}
                          className="w-full text-sm font-bold font-mono border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
                          placeholder="0.0"
                        />
                        <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Total Landings</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={meta.ldgTotal}
                          onChange={(e) => handleMetaChange('ldgTotal', e.target.value)}
                          className="w-full text-sm font-bold font-mono border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Day Landings</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={meta.ldgDay}
                          onChange={(e) => handleMetaChange('ldgDay', e.target.value)}
                          className="w-full text-sm font-bold font-mono border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Groups */}
              <div className="divide-y divide-[#dde3ec]">
                {/* Group 1 — Solo Time */}
                <div className="bg-white">
                  <div className="px-4 py-3 flex items-center justify-between border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="solo-toggle"
                        checked={meta.studentFlewSolo}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          handleMetaChange('studentFlewSolo', checked);
                          setSoloGroupExpanded(checked);
                        }}
                        className="w-4 h-4 text-[#1a3a5c] border-[#dde3ec] rounded focus:ring-[#1a3a5c]"
                      />
                      <label htmlFor="solo-toggle" className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] cursor-pointer">Student Flew Solo</label>
                    </div>
                    {meta.studentFlewSolo && (
                      <button
                        onClick={() => setSoloGroupExpanded(!soloGroupExpanded)}
                        className="flex items-center gap-2"
                      >
                        <div className="text-[10px] font-mono text-[#6b7280]">
                          {meta.solo || '0.0'} hrs
                        </div>
                        <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", soloGroupExpanded && "rotate-90")} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {meta.studentFlewSolo && soloGroupExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Solo Flight Time</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.solo} onChange={(e) => handleMetaChange('solo', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Solo Cross Country</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.xcSolo} onChange={(e) => handleMetaChange('xcSolo', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 2 — Pilot in Command */}
                <div className="bg-white">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, pic: !prev.pic }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.pic && "rotate-90")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Group 2 — Pilot in Command</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280]">
                      {meta.pic || '0.0'} hrs
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedGroups.pic && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">PIC Time</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.pic} onChange={(e) => handleMetaChange('pic', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Cross Country PIC</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.xcPic} onChange={(e) => handleMetaChange('xcPic', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night PIC</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.nightPic} onChange={(e) => handleMetaChange('nightPic', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 3 — Dual Instruction Received */}
                <div className="bg-white">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, dual: !prev.dual }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.dual && "rotate-90")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Group 3 — Dual Instruction Received</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280]">
                      {meta.dual || '0.0'} hrs
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedGroups.dual && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Dual Received</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.dual} onChange={(e) => handleMetaChange('dual', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC Dual</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.xcDual} onChange={(e) => handleMetaChange('xcDual', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Dual</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.nightDual} onChange={(e) => handleMetaChange('nightDual', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Instrument */}
                <div className="bg-white border-t border-[#f1f5f9]">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, instrument: !prev.instrument }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.instrument && "rotate-90")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Instrument</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280]">
                      {(parseFloat(meta.simInst||'0') + parseFloat(meta.imc||'0') + parseFloat(meta.atdInst||'0')).toFixed(1)} hrs
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedGroups.instrument && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Simulated Instrument</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.simInst} onChange={(e) => handleMetaChange('simInst', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                            <p className="text-[8px] text-[#6b7280] italic">Foggles or view limiting device in actual aircraft</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Actual Instrument</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.imc} onChange={(e) => handleMetaChange('imc', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                            <p className="text-[8px] text-[#6b7280] italic">Flight in actual IMC conditions</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Instrument on Simulator</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.atdInst} onChange={(e) => handleMetaChange('atdInst', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                            <p className="text-[8px] text-[#6b7280] italic">Instrument procedures in ATD FTD or FFS</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Approaches and Holds */}
                <div className="bg-white border-t border-[#f1f5f9]">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, approachesHolds: !prev.approachesHolds }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.approachesHolds && "rotate-90")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Approaches and Holds</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280]">
                      {meta.approachCount || '0'} app / {meta.holdPerformed ? '1' : '0'} hold
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedGroups.approachesHolds && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Number of Approaches</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  value={meta.approachCount} 
                                  onChange={(e) => handleMetaChange('approachCount', e.target.value)} 
                                  className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" 
                                  placeholder="0" 
                                />
                                <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                              </div>
                            </div>
                            <div className="space-y-1 flex flex-col justify-end">
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={meta.holdPerformed}
                                    onChange={(e) => handleMetaChange('holdPerformed', e.target.checked)}
                                    className="peer sr-only"
                                  />
                                  <div className="w-4 h-4 border-2 border-[#dde3ec] rounded bg-white peer-checked:bg-[#1a3a5c] peer-checked:border-[#1a3a5c] transition-all" />
                                  <Check size={10} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] group-hover:text-[#1a3a5c] transition-colors">Holding procedure performed this lesson</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Approach Types</label>
                            
                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {JSON.parse(meta.approachTypes || '[]').map((type: string) => (
                                <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1a3a5c] text-white text-[10px] font-bold rounded-full">
                                  {type}
                                  <button
                                    onClick={() => {
                                      const current = JSON.parse(meta.approachTypes || '[]');
                                      handleMetaChange('approachTypes', JSON.stringify(current.filter((t: string) => t !== type)));
                                    }}
                                    className="hover:text-red-300 transition-colors"
                                  >
                                    <X size={10} />
                                  </button>
                                </span>
                              ))}
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                              <input
                                type="text"
                                value={approachSearch}
                                onChange={(e) => setApproachSearch(e.target.value)}
                                placeholder="Search approach types..."
                                className="w-full text-xs border border-[#dde3ec] rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:border-[#1a3a5c] transition-all"
                              />
                            </div>

                            {/* Options List */}
                            <div className="max-h-40 overflow-y-auto border border-[#dde3ec] rounded-lg bg-white divide-y divide-[#f1f5f9] custom-scrollbar">
                              {APPROACH_TYPES.filter(t => 
                                t.label.toLowerCase().includes(approachSearch.toLowerCase()) || 
                                t.code.toLowerCase().includes(approachSearch.toLowerCase())
                              ).map(type => {
                                const isSelected = JSON.parse(meta.approachTypes || '[]').includes(type.code);
                                return (
                                  <button
                                    key={type.code}
                                    onClick={() => {
                                      const current = JSON.parse(meta.approachTypes || '[]');
                                      if (isSelected) {
                                        handleMetaChange('approachTypes', JSON.stringify(current.filter((t: string) => t !== type.code)));
                                      } else {
                                        handleMetaChange('approachTypes', JSON.stringify([...current, type.code]));
                                      }
                                    }}
                                    className={cn(
                                      "w-full px-3 py-2 text-left text-[11px] transition-colors flex items-center justify-between",
                                      isSelected ? "bg-[#f0f9ff] text-[#1a3a5c]" : "hover:bg-[#f8fafc] text-[#64748b]"
                                    )}
                                  >
                                    <span>{type.label}</span>
                                    {isSelected && <Check size={12} className="text-[#1a3a5c]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 4 — Cross Country */}
                <div className="bg-white">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, xc: !prev.xc }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.xc && "rotate-90")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Group 4 — Cross Country</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280]">
                      {(parseFloat(meta.xcDual||'0') + parseFloat(meta.xcSolo||'0') + parseFloat(meta.xcPic||'0')).toFixed(1)} hrs
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedGroups.xc && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC Dual</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.xcDual} onChange={(e) => handleMetaChange('xcDual', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC Solo</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.xcSolo} onChange={(e) => handleMetaChange('xcSolo', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">XC PIC</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.xcPic} onChange={(e) => handleMetaChange('xcPic', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 5 — Night Flying */}
                <div className="bg-white">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, night: !prev.night }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.night && "rotate-90")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Group 5 — Night Flying</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280]">
                      {meta.night || '0.0'} hrs
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedGroups.night && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night (Total)</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={meta.night} onChange={(e) => handleMetaChange('night', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Takeoffs</label>
                            <div className="flex items-center gap-2">
                              <input type="number" value={meta.nightTakeoffs} onChange={(e) => handleMetaChange('nightTakeoffs', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Landings</label>
                            <div className="flex items-center gap-2">
                              <input type="number" value={meta.ldgNight} onChange={(e) => handleMetaChange('ldgNight', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 pb-4">
                          <p className="text-[9px] text-[#6b7280] italic">Night Dual is logged in the Dual Instruction group above.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 6 — Sim Time */}
                <div className="bg-white">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, sim: !prev.sim }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.sim && "rotate-90")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Group 6 — Sim Time</span>
                    </div>
                    <div className="text-[10px] font-mono text-[#6b7280]">
                      {(parseFloat(meta.atd || '0') + parseFloat(meta.ftd || '0') + parseFloat(meta.ffs || '0')).toFixed(1)} hrs
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedGroups.sim && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#f8fafc]"
                      >
                        <div className="p-4">
                          <div className="flex gap-2 mb-4">
                            {['ATD', 'FTD', 'FFS'].map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleMetaChange('simDeviceType', type)}
                                className={cn(
                                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                  (meta.simDeviceType || 'ATD') === type 
                                    ? "bg-[#1a3a5c] text-white shadow-sm" 
                                    : "bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1]"
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(meta.simDeviceType || 'ATD') === 'ATD' && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">ATD Total Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="number" step="0.1" value={meta.atd} onChange={(e) => handleMetaChange('atd', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">ATD Instrument Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="number" step="0.1" value={meta.atdInst} onChange={(e) => handleMetaChange('atdInst', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                </div>
                              </>
                            )}
                            {meta.simDeviceType === 'FTD' && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">FTD Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="number" step="0.1" value={meta.ftd} onChange={(e) => handleMetaChange('ftd', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">FTD Instrument Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="number" step="0.1" value={meta.ftdInst} onChange={(e) => handleMetaChange('ftdInst', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                </div>
                              </>
                            )}
                            {meta.simDeviceType === 'FFS' && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">FFS Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="number" step="0.1" value={meta.ffs} onChange={(e) => handleMetaChange('ffs', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">FFS Instrument Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="number" step="0.1" value={meta.ffsInst} onChange={(e) => handleMetaChange('ffsInst', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <p className="text-[10px] text-[#6b7280] mt-4 italic">
                            ATD = Aviation Training Device, FTD = Flight Training Device, FFS = Full Flight Simulator
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                          {task.name}
                          {task.stds && task.stds.length > 0 && (
                            <ChevronDown size={14} className={cn("text-[#6b7280] transition-transform", isExpanded && "rotate-180")} />
                          )}
                        </div>
                        {isExpanded && task.stds && task.stds.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-3 p-3 bg-[#d4e8f5] rounded-lg border-l-4 border-[#2a5a8c] space-y-1.5"
                          >
                            {task.stds.map((std, idx) => (
                              <div key={idx} className="text-[11px] text-[#1a3a5c] leading-relaxed flex gap-2">
                                <span className="opacity-40 shrink-0">·</span>
                                <span>{std.code} — {std.description}</span>
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
                      <div className="p-2 pt-3 pr-4 relative group">
                        <textarea
                          value={n}
                          onChange={(e) => handleNoteChange(id, e.target.value)}
                          placeholder="Notes..."
                          rows={expandedNotes[id] ? undefined : 1}
                          className={cn(
                            "w-full text-xs border border-transparent rounded-md px-2 py-1.5 bg-transparent focus:outline-none focus:border-[#2a5a8c] focus:bg-[#d4e8f5] transition-all resize-none",
                            expandedNotes[id] ? "h-auto min-h-[32px]" : "h-[32px] overflow-hidden"
                          )}
                          onInput={(e) => {
                            if (expandedNotes[id]) {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = target.scrollHeight + 'px';
                            }
                          }}
                          ref={(el) => {
                            if (el && expandedNotes[id]) {
                              el.style.height = 'auto';
                              el.style.height = el.scrollHeight + 'px';
                            }
                          }}
                        />
                        {!expandedNotes[id] && n.length > 0 && (
                          <div className="absolute bottom-3 right-10 w-1.5 h-1.5 bg-[#6b7280] rounded-full opacity-30 pointer-events-none" />
                        )}
                        <button
                          onClick={() => toggleNoteExpand(id)}
                          className="absolute right-0 top-1.5 w-[44px] h-[44px] flex items-center justify-center text-[#6b7280] hover:text-[#1a3a5c] transition-colors"
                          title={expandedNotes[id] ? "Collapse Notes" : "Expand Notes"}
                        >
                          {expandedNotes[id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
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

      {activeACSTask && (
        <ACSStandardsModal 
          isOpen={!!activeACSTask}
          taskId={activeACSTask.task.code}
          taskName={activeACSTask.task.name}
          onConfirm={handleACSConfirm}
          onCancel={handleACSCancel}
        />
      )}
    </div>
  );
}
