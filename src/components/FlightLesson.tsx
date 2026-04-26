import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ALL_ACS, RATINGS } from '../constants';
import { IR_FLIGHT_ACS } from '../constants/irACS';
import { AIRCRAFT_MODELS, isAMEL } from '../constants/aircraft';
import { Grade, LessonMeta, ACSTask, ACSStandard } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Save, Trash2, ArrowLeft, ArrowRight, Plane, CheckCircle2, AlertCircle, HelpCircle, ChevronRight, ChevronLeft, Loader2, Check, Search, X, Plus, ClipboardList, Clock, AlertTriangle } from 'lucide-react';
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
    ratpXCEligible: false,
    ratpXCTime: '',
    nightSolo: '',
    approachCount: '',
    approachTypes: '[]',
    holdPerformed: false,
    cfiDidLandings: false,
    cfiFlewApproaches: false,
    cfiApproachCount: '',
    cfiApproachTypes: '[]',
    cfiHoldPerformed: false,
    cfiDayLandings: '',
    cfiNightLandings: '',
    aircraftClass: 'ASEL',
    mePic: '',
    meDual: '',
    meNight: '',
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
    sim: false,
    cfiHours: false
  });
  const [approachSearch, setApproachSearch] = useState('');
  const [cfiApproachSearch, setCfiApproachSearch] = useState('');
  const [soloGroupExpanded, setSoloGroupExpanded] = useState(false);
  const [isFlightLogOpen, setIsFlightLogOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [fillState, setFillState] = useState<Grade>('');
  const [rating, setRating] = useState<any>(null);
  const [activeACSTask, setActiveACSTask] = useState<{ task: ACSTask, id: string, prevGrade: Grade, pendingGrade: Grade } | null>(null);
  const [lessonLabel, setLessonLabel] = useState('');
  const [lessonNum, setLessonNum] = useState(1);
  const [aircraftSearch, setAircraftSearch] = useState('');
  const [showAircraftDropdown, setShowAircraftDropdown] = useState(false);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  const [recentAircraft, setRecentAircraft] = useState<any[]>([]);
  const [showClassToggle, setShowClassToggle] = useState(false);
  const [showAddAircraftModal, setShowAddAircraftModal] = useState(false);
  const [newAircraftModel, setNewAircraftModel] = useState('');
  const [newAircraftIcao, setNewAircraftIcao] = useState('');
  const [newAircraftClass, setNewAircraftClass] = useState('ASEL');
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [lessonType, setLessonType] = useState<string>('review');
  const [stepValidationError, setStepValidationError] = useState<string | null>(null);
  const [totalFlightError, setTotalFlightError] = useState(false);
  const [nightWarning, setNightWarning] = useState(false);
  const [overallGrade, setOverallGrade] = useState<'' | 'S' | 'N'>('');
  const navigate = useNavigate();

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  const isIR = rating?.code === 'ir';
  const isCPL = rating?.code === 'cpl';
  const isCFI = ['cfi', 'cfii', 'mei'].includes(rating?.code);

  const isPassingGrade = (grade: any) => {
    if (grade === null || grade === undefined || grade === '') return false;
    const g = String(grade);
    return ['S', '3', '4'].includes(g);
  };

  const CPL_LESSON_TYPE_TILES = [
    {
      id: 'landings',
      label: 'Landings',
      subtitle: 'Takeoffs, approaches, go-arounds, power-off 180°',
      emoji: '🛩️',
      color: '#1a3a5c',
      taskCodes: ['CA.IV.A','CA.IV.B','CA.IV.C','CA.IV.D','CA.IV.E','CA.IV.F','CA.IV.G','CA.IV.H','CA.IV.I'],
    },
    {
      id: 'performance',
      label: 'Performance & Ground Reference',
      subtitle: 'Steep turns, spirals, chandelles, lazy eights, eights on pylons',
      emoji: '📐',
      color: '#7c3aed',
      taskCodes: ['CA.V.A','CA.V.B','CA.V.C','CA.V.D','CA.VI.A'],
    },
    {
      id: 'stalls',
      label: 'Slow Flight & Stalls',
      subtitle: 'Slow flight, power-off/on stalls, accelerated stalls, spin awareness',
      emoji: '🌀',
      color: '#0891b2',
      taskCodes: ['CA.VIII.A','CA.VIII.B','CA.VIII.C','CA.VIII.D','CA.VIII.E'],
    },
    {
      id: 'instrument',
      label: 'Basic Instrument',
      subtitle: 'Full IR flight ACS — for students without instrument rating',
      emoji: '🧭',
      color: '#1a5c3a',
      taskCodes: [],
      isIRTasks: true,
    },
    {
      id: 'cross-country',
      label: 'Cross-Country',
      subtitle: 'Pilotage, nav systems, diversion, lost procedures',
      emoji: '🗺️',
      color: '#e67e22',
      taskCodes: ['CA.VII.A','CA.VII.B','CA.VII.C','CA.VII.D'],
    },
    {
      id: 'emergencies',
      label: 'Emergencies',
      subtitle: 'Oxygen, pressurization, emergency descent, malfunctions',
      emoji: '⚠️',
      color: '#c0392b',
      taskCodes: ['CA.IX.A','CA.IX.B','CA.X.A','CA.X.B','CA.X.C','CA.X.D'],
    },
    {
      id: 'review',
      label: 'Full Review',
      subtitle: 'All ACS tasks — use for checkride prep or general review',
      emoji: '📋',
      color: '#475569',
      taskCodes: [],
    },
  ];

  const CPL_PREFLIGHT_POSTFLIGHT_CODES = [
    'CA.II.A','CA.II.B','CA.II.C','CA.II.D','CA.II.E',
    'CA.III.A','CA.III.B','CA.III.C',
    'CA.XI.A',
  ];

  const CFI_LESSON_TYPE_TILES = [
    {
      id: 'landings',
      label: 'Landings',
      subtitle: 'Takeoffs, approaches, landings, power-off 180°',
      emoji: '🛩️',
      color: '#1a3a5c',
      taskCodes: ['AI.VI.A', 'AI.VI.B', 'AI.VII.A', 'AI.VII.B', 'AI.VII.C', 'AI.VII.D', 'AI.VII.E', 'AI.VII.F', 'AI.VII.M', 'AI.VII.N', 'AI.VII.O'],
    },
    {
      id: 'ground-ref',
      label: 'Ground Reference',
      subtitle: 'Rectangular course, S-turns, turns around a point',
      emoji: '🌾',
      color: '#2d7a4f',
      taskCodes: ['AI.IX.E.S3a', 'AI.IX.E.S3b', 'AI.IX.E.S3c', 'AI.IX.F'],
    },
    {
      id: 'performance',
      label: 'Performance',
      subtitle: 'Steep turns, spirals, chandelles, lazy eights',
      emoji: '📐',
      color: '#7c3aed',
      taskCodes: ['AI.IX.A', 'AI.IX.B', 'AI.IX.C', 'AI.IX.D'],
    },
    {
      id: 'stalls',
      label: 'Slow Flight Stalls and Spins',
      subtitle: 'Slow flight, various stalls, spin awareness',
      emoji: '🌀',
      color: '#0891b2',
      taskCodes: ['AI.X.A', 'AI.X.B', 'AI.X.C', 'AI.X.D', 'AI.X.E', 'AI.X.F', 'AI.X.G', 'AI.X.H', 'AI.X.I'],
    },
    {
      id: 'emergencies',
      label: 'Emergencies',
      subtitle: 'Emergency descent, approach, malfunctions',
      emoji: '⚠️',
      color: '#c0392b',
      taskCodes: ['AI.XII.A', 'AI.XII.B', 'AI.XII.C', 'AI.XII.D'],
    },
    {
      id: 'instrument',
      label: 'Basic Instrument',
      subtitle: 'Straight & level, climbs, descents, unusual attitudes',
      emoji: '🧭',
      color: '#0d9488',
      taskCodes: ['AI.VIII.A', 'AI.VIII.B', 'AI.VIII.C', 'AI.VIII.D', 'AI.XI.A', 'AI.XI.B', 'AI.XI.C', 'AI.XI.D', 'AI.XI.E'],
    },
    {
      id: 'review',
      label: 'Full Review',
      subtitle: 'All CFI ACS tasks — use for checkride prep or general review',
      emoji: '📋',
      color: '#475569',
      taskCodes: [],
    },
  ];

  const CFI_PREFLIGHT_POSTFLIGHT_CODES = [
    'AI.V.A', 'AI.V.B', 'AI.V.C', 'AI.V.D', 'AI.V.E', 'AI.V.F', 'AI.XIV.A'
  ];

  const LESSON_TYPE_TILES = [
    {
      id: 'landings',
      label: 'Landings',
      subtitle: 'Takeoffs, approaches, go-arounds',
      emoji: '🛩️',
      color: '#1a3a5c',
      taskCodes: ['PA.IV.A','PA.IV.B','PA.IV.C','PA.IV.D','PA.IV.E','PA.IV.F','PA.IV.G','PA.IV.H'],
    },
    {
      id: 'ground-maneuvers',
      label: 'Ground Maneuvers',
      subtitle: 'S-turns, rectangular course, turns around a point',
      emoji: '🌾',
      color: '#2d7a4f',
      taskCodes: ['PA.V.B1', 'PA.V.B2', 'PA.V.B3'],
    },
    {
      id: 'performance',
      label: 'Performance',
      subtitle: 'Steep turns, stalls, slow flight, spin awareness',
      emoji: '📐',
      color: '#7c3aed',
      taskCodes: ['PA.V.A','PA.VII.A','PA.VII.B','PA.VII.C','PA.VII.D'],
    },
    {
      id: 'instrument',
      label: 'Basic Instrument',
      subtitle: 'Straight & level, climbs, descents, unusual attitudes',
      emoji: '🧭',
      color: '#0891b2',
      taskCodes: ['PA.VIII.A','PA.VIII.B','PA.VIII.C','PA.VIII.D','PA.VIII.E','PA.VIII.F'],
    },
    {
      id: 'cross-country',
      label: 'Cross-Country',
      subtitle: 'Pilotage, nav systems, diversion, lost procedures',
      emoji: '🗺️',
      color: '#e67e22',
      taskCodes: ['PA.VI.A','PA.VI.B','PA.VI.C','PA.VI.D'],
    },
    {
      id: 'emergencies',
      label: 'Emergencies',
      subtitle: 'Emergency descent, engine out, systems malfunctions',
      emoji: '⚠️',
      color: '#c0392b',
      taskCodes: ['PA.IX.A','PA.IX.B','PA.IX.C','PA.IX.D'],
    },
    {
      id: 'review',
      label: 'Full Review',
      subtitle: 'All ACS tasks — use for checkride prep or general review',
      emoji: '📋',
      color: '#475569',
      taskCodes: [],
    },
  ];

  const PREFLIGHT_POSTFLIGHT_CODES = [
    'PA.II.A','PA.II.B','PA.II.C','PA.II.E',
    'PA.III.A','PA.III.B','PA.III.C',
    'PA.XII.A',
  ];

  const showLessonTypeStep = rating?.code !== 'ir';
  const activeTiles = isCFI ? CFI_LESSON_TYPE_TILES : (isCPL ? CPL_LESSON_TYPE_TILES : LESSON_TYPE_TILES);
  const activePrefPostCodes = isCFI ? CFI_PREFLIGHT_POSTFLIGHT_CODES : (isCPL ? CPL_PREFLIGHT_POSTFLIGHT_CODES : PREFLIGHT_POSTFLIGHT_CODES);

  const steps = showLessonTypeStep ? [
    { number: 1, label: 'Lesson Setup', icon: ClipboardList },
    { number: 2, label: 'Lesson Type', icon: Plane },
    { number: 3, label: 'Flight Time Log', icon: Clock },
    { number: 4, label: 'ACS Grading', icon: CheckCircle2 }
  ] : [
    { number: 1, label: 'Lesson Setup', icon: ClipboardList },
    { number: 2, label: 'Flight Time Log', icon: Clock },
    { number: 3, label: 'ACS Grading', icon: CheckCircle2 }
  ];

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
      cfiFlewApproaches: false,
      cfiApproachCount: '',
      cfiApproachTypes: '[]',
      cfiHoldPerformed: false,
      ratpSimInst: '',
      ratpActualInst: '',
      ratpXCEligible: false,
      ratpXCTime: '',
      nightSolo: '',
      approachCount: '',
      approachTypes: '[]',
      holdPerformed: false,
      cfiDidLandings: false,
      cfiDayLandings: '',
      cfiNightLandings: '',
      aircraftClass: 'ASEL',
      mePic: '',
      meDual: '',
      meNight: '',
    });
    setFillState('');
    setIsFlightLogOpen(true);
    
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
    if (editLesson && editLesson.type === 'flight') {
      setEditId(editLesson.id);
      setGrades(editLesson.grades || {});
      setNotes(editLesson.notes || {});
      setMeta(prev => ({ ...prev, ...editLesson.meta }));
      setInstructorName(editLesson.instructor || '');
      setLessonLabel(editLesson.label || '');
      setLessonNum(editLesson.lesson_num || 1);
      setLessonType(editLesson.meta?.lessonType || 'review');
      setOverallGrade(editLesson.meta?.overallGrade || '');
      setCurrentStep(3); // Skip to flight log in edit mode
      // Auto-open logbook if any field is filled
      const hasLogData = Object.entries(editLesson.meta || {}).some(([k, v]) => k !== 'date' && k !== 'notes' && v);
      if (hasLogData) setIsFlightLogOpen(true);
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

  const EMERGENCY_EXTRA_TASKS = [
    { name: 'Wing Fire', id: 'extra_wing_fire', stds: [] },
    { name: 'Engine Fire', id: 'extra_engine_fire', stds: [] },
    { name: 'Engine Failure', id: 'extra_engine_failure', stds: [] },
    { name: 'Alternator Failure', id: 'extra_alternator_failure', stds: [] },
  ];

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

  const handleGradeSet = (taskId: string, grade: Grade) => {
    let current: Grade = (grades[taskId] as Grade) || '';

    // Backwards compatibility normalization
    if (current === 'S') current = '3';
    if (current === 'N') current = '2';

    const next = current === grade ? '' : grade;
    
    if (next === '1' || next === '2') {
      let task;
      if (taskId.startsWith('extra_')) {
        task = EMERGENCY_EXTRA_TASKS.find(t => t.id === taskId);
      } else if (taskId.startsWith('ir_')) {
        const [_, ari, ti] = taskId.split('_');
        task = IR_FLIGHT_ACS[parseInt(ari)].tasks[parseInt(ti)];
      } else {
        task = flightTasks.find(t => t.id === taskId);
      }
      
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
    const cycle: Grade[] = ['', '3', '4', '1', '2'];
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
    let newMeta = { ...meta, [field]: val };
    
    // Auto-detect aircraft class when model changes
    if (field === 'aircraftModel') {
      const detectedClass = isAMEL(val) ? 'AMEL' : 'ASEL';
      newMeta.aircraftClass = detectedClass;
    }

    if (field === 'ldgDay' || field === 'ldgNight') {
      newMeta.ldgTotal = (parseInt(newMeta.ldgDay || '0') + parseInt(newMeta.ldgNight || '0')).toString();
    }

    if (['night', 'ldgNight', 'nightDual', 'nightPic', 'nightTakeoffs', 'meNight', 'nightSolo'].includes(field)) {
      setNightWarning(false);
    }

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
          .select('aircraft_model, aircraft_icao, aircraft_class')
          .eq('user_id', session.user.id)
          .eq('tail_number', meta.aircraft.toUpperCase().trim())
          .maybeSingle();

        if (data && !error) {
          setMeta(prev => ({
            ...prev,
            aircraftModel: data.aircraft_model,
            aircraftIcao: data.aircraft_icao,
            aircraftClass: data.aircraft_class || 'ASEL'
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

  const handleSaveNewAircraft = async () => {
    if (!newAircraftModel.trim()) {
      alert('Please enter an aircraft model.');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('saved_aircraft')
        .upsert({
          user_id: session.user.id,
          tail_number: meta.aircraft.toUpperCase().trim() || 'UNKNOWN',
          aircraft_model: newAircraftModel.trim(),
          aircraft_icao: newAircraftIcao.trim(),
          aircraft_class: newAircraftClass,
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          use_count: 1
        }, { onConflict: 'user_id,tail_number' });

      if (error) throw error;

      setMeta(prev => ({
        ...prev,
        aircraftModel: newAircraftModel.trim(),
        aircraftClass: newAircraftClass as 'ASEL' | 'AMEL'
      }));
      setIsAutoPopulated(true);
      setShowAddAircraftModal(false);
      
      // Refresh recent aircraft
      const { data: recentData } = await supabase
        .from('saved_aircraft')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (recentData) setRecentAircraft(recentData);

      // Reset modal state
      setNewAircraftModel('');
      setNewAircraftIcao('');
      setNewAircraftClass('ASEL');
    } catch (err: any) {
      console.error('Error saving new aircraft:', err);
      alert('Failed to save aircraft: ' + err.message);
    }
  };

  // Backfill aircraft from historical lessons
  useEffect(() => {
    const backfillAircraft = async () => {
      if (localStorage.getItem('saved_aircraft_backfilled')) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('meta')
        .eq('user_id', session.user.id);

      if (lessons && !error) {
        const aircraftMap = new Map();
        lessons.forEach(l => {
          const m = l.meta || {};
          if (m.aircraft && m.aircraftModel) {
            const tail = m.aircraft.toUpperCase().trim();
            if (!aircraftMap.has(tail)) {
              aircraftMap.set(tail, {
                user_id: session.user.id,
                tail_number: tail,
                aircraft_model: m.aircraftModel.trim(),
                aircraft_icao: m.aircraftIcao || '',
                last_used: m.date || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                use_count: 1
              });
            }
          }
        });

        const uniqueAircraft = Array.from(aircraftMap.values());
        if (uniqueAircraft.length > 0) {
          await supabase.from('saved_aircraft').upsert(uniqueAircraft, { onConflict: 'user_id,tail_number' });
        }
        localStorage.setItem('saved_aircraft_backfilled', 'true');
      }
    };
    backfillAircraft();
  }, []);

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleNoteExpand = (taskId: string) => {
    setExpandedNotes(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleSave = async () => {
    if (!studentName) return;

    if (!overallGrade) {
      setStepValidationError('Please select an overall lesson grade before saving');
      return;
    }

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
      nightTakeoffs: parseInt(meta.nightTakeoffs || '0') || 0,
      ldgTotal: parseInt(meta.ldgTotal || '0') || 0,
      ldgDay: parseInt(meta.ldgDay || '0') || 0,
      ldgNight: parseInt(meta.ldgNight || '0') || 0,
      groundSim: meta.groundSim,
      cfi: meta.cfi,
      rating_code: rating?.code || 'ppl',
      rating_label: rating?.label || 'Private Pilot ASEL',
      lessonType: lessonType || 'review',
      studentFlewSolo: meta.studentFlewSolo,
      notes: meta.notes,
      simDeviceType: meta.simDeviceType,
      ratpSimInst: meta.ratpSimInst,
      ratpActualInst: meta.ratpActualInst,
      ratpXCEligible: meta.ratpXCEligible,
      ratpXCTime: meta.ratpXCTime,
      approachCount: meta.approachCount,
      approachTypes: meta.approachTypes,
      holdPerformed: meta.holdPerformed,
      cfiFlewApproaches: meta.cfiFlewApproaches || false,
      cfiApproachCount: parseInt(meta.cfiApproachCount || '0') || 0,
      cfiApproachTypes: meta.cfiApproachTypes || '[]',
      cfiHoldPerformed: meta.cfiHoldPerformed || false,
      cfiDidLandings: meta.cfiDidLandings,
      cfiDayLandings: parseInt(meta.cfiDayLandings || '0') || 0,
      cfiNightLandings: parseInt(meta.cfiNightLandings || '0') || 0,
      aircraftClass: meta.aircraftClass || 'ASEL',
      mePic: meta.mePic,
      meDual: meta.meDual,
      meNight: meta.meNight,
      overallGrade,
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
    let savedLessonId = editId;
    if (editId) {
      const { error: updateError } = await supabase.from('lessons').update(lessonData).eq('id', editId);
      error = updateError;
    } else {
      const { data: insertData, error: insertError } = await supabase.from('lessons').insert(lessonData).select().single();
      error = insertError;
      if (insertData) savedLessonId = insertData.id;
    }

    if (!error && meta.aircraft && meta.aircraftModel) {
      const { error: aircraftError } = await supabase
        .from('saved_aircraft')
        .upsert({
          user_id: session.user.id,
          tail_number: meta.aircraft.toUpperCase().trim(),
          aircraft_model: meta.aircraftModel.trim(),
          aircraft_icao: meta.aircraftIcao || '',
          aircraft_class: meta.aircraftClass || 'ASEL',
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

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      // Auto-save CFI hours if dual instruction was given
      if (parseFloat(meta.dual || '0') > 0 && (editId || savedLessonId)) {
        const cfiRecord = {
          user_id: session.user.id,
          lesson_id: editId || savedLessonId,
          student_name: studentName,
          date: meta.date,
          aircraft: meta.aircraft || '',
          aircraft_model: meta.aircraftModel || '',
          route: meta.route || '',
          total_flight: parseFloat(meta.totalFlight || '0') || 0,
          dual_given: parseFloat(meta.dual || '0') || 0,
          night_dual: parseFloat(meta.nightDual || '0') || 0,
          instrument_given: parseFloat(meta.simInst || '0') || 0,
          day_landings: meta.cfiDidLandings ? parseInt(meta.cfiDayLandings || '0') || 0 : 0,
          night_landings: meta.cfiDidLandings ? parseInt(meta.cfiNightLandings || '0') || 0 : 0,
          xc_pic: parseFloat(meta.xcDual || '0') || 0,
          ratp_xc: parseFloat(meta.ratpXCTime || '0') || 0,
          ratp_xc_eligible: meta.ratpXCEligible || false,
          aircraft_class: meta.aircraftClass || 'ASEL',
          rating_code: meta.rating_code || 'ppl',
          cfi_approach_count: meta.cfiFlewApproaches ? parseInt(meta.cfiApproachCount || '0') || 0 : 0,
          cfi_approach_types: meta.cfiFlewApproaches ? (meta.cfiApproachTypes || '[]') : '[]',
          cfi_hold_performed: meta.cfiFlewApproaches ? (meta.cfiHoldPerformed || false) : false
        };

        await supabase
          .from('cfi_hours')
          .upsert(cfiRecord, { onConflict: 'lesson_id' });
      }

      // Handle the case where dual time was previously greater than zero but has been edited to zero
      if (parseFloat(meta.dual || '0') === 0 && editId) {
        await supabase
          .from('cfi_hours')
          .delete()
          .eq('lesson_id', editId);
      }

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
      cfiFlewApproaches: false,
      cfiApproachCount: '',
      cfiApproachTypes: '[]',
      cfiHoldPerformed: false,
      ratpSimInst: '',
      ratpActualInst: '',
      ratpXCEligible: false,
      ratpXCTime: '',
      nightSolo: '',
      approachCount: '',
      approachTypes: '[]',
      holdPerformed: false,
      cfiDidLandings: false,
      cfiDayLandings: '',
      cfiNightLandings: '',
    });
    localStorage.removeItem('faa_current_lesson_flight');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!lessonLabel || !meta.date) {
        setStepValidationError('Please fill in the lesson label and date before continuing.');
        return;
      }
      // For IR: skip step 2 (lesson type) — jump straight to flight log
      if (!showLessonTypeStep) {
        setStepValidationError(null);
        setDirection(1);
        setCurrentStep(2);
        window.scrollTo(0, 0);
        return;
      }
    }

    if (currentStep === 2 && showLessonTypeStep) {
      if (!lessonType) {
        setStepValidationError('Please select a lesson type before continuing.');
        return;
      }
    }

    // Flight log step: step 3 with lesson type, step 2 without
    const flightLogStep = showLessonTypeStep ? 3 : 2;
    if (currentStep === flightLogStep) {
      if (!meta.totalFlight || parseFloat(meta.totalFlight) <= 0) {
        setTotalFlightError(true);
        setStepValidationError('Total flight time is required.');
        return;
      }
      setTotalFlightError(false);

      const hasNightActivity =
        parseInt(meta.ldgNight || '0') > 0 ||
        parseFloat(meta.nightDual || '0') > 0 ||
        parseFloat(meta.nightPic || '0') > 0 ||
        parseFloat(meta.nightSolo || '0') > 0 ||
        parseInt(meta.nightTakeoffs || '0') > 0 ||
        parseFloat(meta.meNight || '0') > 0;

      const hasNightTime = parseFloat(meta.night || '0') > 0;

      if (hasNightActivity && !hasNightTime) {
        setNightWarning(true);
        return;
      }
    }

    setStepValidationError(null);
    setDirection(1);
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const counts = {
    s: Object.values(grades).filter(v => isPassingGrade(v)).length,
    n: Object.values(grades).filter(v => ['1', '2', 'N'].includes(v)).length,
  };

  const acsData = rating ? ALL_ACS[rating.code] : [];
  const flightAreas = acsData.slice(1);
  const extraEmergenciesCount = (!isIR && (lessonType === 'emergencies' || !lessonType || lessonType === 'review')) ? EMERGENCY_EXTRA_TASKS.length : 0;
  const totalTasks = flightAreas.reduce((acc, area) => acc + area.tasks.length, 0) + extraEmergenciesCount;
  const gradedTasks = Object.values(grades).filter(v => v).length;
  const progressPct = totalTasks > 0 ? Math.round((gradedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
              <Link to="/dashboard" className="hover:text-[#1a3a5c] transition-colors">Home</Link>
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
            <Link to="/lesson-type" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#dde3ec] bg-white text-[#6b7280] hover:bg-[#f4f5f7] hover:-translate-y-0.5 transition-all text-xs font-bold">
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-lg shadow-[#1a3a5c]/5 p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#dde3ec] -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#1a3a5c] -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isActive = currentStep === step.number;
              
              return (
                <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted ? "bg-[#2d7a4f] border-[#2d7a4f] text-white" :
                    isActive ? "bg-[#1a3a5c] border-[#1a3a5c] text-white" :
                    "bg-white border-[#dde3ec] text-[#6b7280]"
                  )}>
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest transition-colors",
                      isActive || isCompleted ? "text-[#1a3a5c]" : "text-[#6b7280]"
                    )}>
                      Step {step.number}
                    </span>
                    <span className={cn(
                      "text-[11px] font-bold transition-colors whitespace-nowrap",
                      isActive || isCompleted ? "text-[#1c2333]" : "text-[#6b7280]"
                    )}>
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
        >
          {stepValidationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{stepValidationError}</span>
            </div>
          )}

          {currentStep === 1 && (
            <>
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
                              aircraftModel: ac.aircraft_model,
                              aircraftIcao: ac.aircraft_icao
                            }));
                            setIsAutoPopulated(true);
                          }}
                          className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#f4f5f7] text-[#1a3a5c] border border-[#dde3ec] hover:border-[#1a3a5c] hover:bg-white transition-all flex items-center gap-1.5"
                        >
                          <Plane size={10} className="opacity-50" />
                          {ac.tail_number} — {ac.aircraft_model}
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
                              const detectedClass = isAMEL(model) ? 'AMEL' : 'ASEL';
                              setMeta(prev => ({
                                ...prev,
                                aircraftModel: model,
                                aircraftClass: detectedClass
                              }));
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
                        <div
                          onClick={() => setShowAddAircraftModal(true)}
                          className="px-3 py-2 flex items-center gap-2 text-sm text-[#1a3a5c] font-bold border-t border-[#dde3ec] hover:bg-[#f4f5f7] cursor-pointer sticky bottom-0 bg-white"
                        >
                          <Plus size={14} className="text-[#1a3a5c]" />
                          Add Aircraft Not in List
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest text-white",
                        meta.aircraftClass === 'AMEL' ? "bg-[#7c3aed]" : "bg-[#1a3a5c]"
                      )}>
                        {meta.aircraftClass || 'ASEL'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowClassToggle(!showClassToggle)}
                        className="text-[10px] text-[#6b7280] hover:text-[#1a3a5c] underline transition-colors"
                      >
                        Change Class
                      </button>
                      {showClassToggle && (
                        <div className="flex gap-1 animate-in fade-in slide-in-from-left-1">
                          {['ASEL', 'AMEL'].map(cls => (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => {
                                handleMetaChange('aircraftClass', cls);
                                setShowClassToggle(false);
                              }}
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded border transition-all",
                                meta.aircraftClass === cls
                                  ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                                  : "bg-white text-[#6b7280] border-[#dde3ec] hover:border-[#1a3a5c]"
                              )}
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={handleClear}
                  className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] font-medium text-sm hover:bg-[#f4f5f7] transition-all"
                >
                  Clear Page
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-[#1a3a5c] text-white font-bold text-sm hover:bg-[#2a5a8c] transition-all shadow-md flex items-center gap-2"
                >
                  {showLessonTypeStep ? 'Next: Lesson Type' : 'Next: Flight Log'}
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && showLessonTypeStep && (
            <>
              <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-[#1a3a5c] mb-1">What type of lesson is this?</h2>
                <p className="text-xs text-[#6b7280] mb-6">Preflight and postflight tasks are always included. Tap a tile to auto-advance.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {activeTiles.map(tile => {
                    const isSelected = lessonType === tile.id;
                    return (
                      <button
                        key={tile.id}
                        onClick={() => {
                          setLessonType(tile.id);
                          setStepValidationError(null);
                          setTimeout(() => {
                            setDirection(1);
                            setCurrentStep(3);
                            window.scrollTo(0, 0);
                          }, 150);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-lg text-center",
                          isSelected
                            ? "border-transparent shadow-lg scale-[1.02]"
                            : "border-[#dde3ec] bg-white hover:border-[#1a3a5c]"
                        )}
                        style={isSelected ? { backgroundColor: tile.color, borderColor: tile.color } : {}}
                      >
                        <span className="text-3xl">{tile.emoji}</span>
                        <span className={cn(
                          "text-sm font-bold leading-tight",
                          isSelected ? "text-white" : "text-[#1c2333]"
                        )}>
                          {tile.label}
                        </span>
                        <span className={cn(
                          "text-[10px] leading-tight",
                          isSelected ? "text-white/70" : "text-[#6b7280]"
                        )}>
                          {tile.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] font-medium text-sm hover:bg-[#f4f5f7] transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-xl bg-[#1a3a5c] text-white font-bold text-sm hover:bg-[#2a5a8c] transition-all shadow-md flex items-center gap-2"
                >
                  Next: Flight Log
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {((showLessonTypeStep && currentStep === 3) || (!showLessonTypeStep && currentStep === 2)) && (
            <>
              <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-md overflow-hidden mb-6">
        <div
          onClick={() => setIsFlightLogOpen(!isFlightLogOpen)}
          className="p-4 border-b border-[#dde3ec] flex items-center justify-between cursor-pointer hover:bg-[#f4f5f7] transition-all"
        >
          <div className="flex items-center gap-3">
            <ChevronRight size={14} className={cn("text-[#6b7280] transition-transform", isFlightLogOpen && "rotate-90")} />
            <span className="text-sm font-bold text-[#1c2333]">Flight Time Log — IACRA Compatible</span>
          </div>
          <div className="text-[10px] text-[#6b7280] font-medium uppercase tracking-wider">
            FAA logbook fields — Part 61 <span className="italic ml-2">{isFlightLogOpen ? 'click to collapse' : 'click to expand'}</span>
          </div>
        </div>
        <AnimatePresence>
          {isFlightLogOpen && (
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Total Flight Time</label>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            value={meta.totalFlight}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleMetaChange('totalFlight', val);
                              if (parseFloat(val) > 0) {
                                setTotalFlightError(false);
                              }
                            }}
                            className={cn(
                              "w-full text-sm font-bold font-mono border rounded-lg px-3 py-2 focus:outline-none transition-all",
                              totalFlightError 
                                ? "border-red-500 focus:border-red-500 bg-red-50" 
                                : "border-[#dde3ec] focus:border-[#2a5a8c]"
                            )}
                            placeholder="0.0"
                          />
                          <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                        </div>
                        {totalFlightError && (
                          <p className="text-[9px] text-red-500 font-bold">Total flight time is required.</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Day Landings</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          min="0"
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
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
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
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
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

                {/* CFI Hours */}
                {(() => {
                  const hasDualTime = parseFloat(meta.dual || '0') > 0;
                  if (!hasDualTime) return null;

                  return (
                    <div className="bg-white border-t border-[#f1f5f9]">
                      <button
                        onClick={() => setExpandedGroups(prev => ({ ...prev, cfiHours: !prev.cfiHours }))}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.cfiHours && "rotate-90")} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">CFI Hours</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#6b7280]">
                          {meta.totalFlight || '0.0'} hrs
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedGroups.cfiHours && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-[#f8fafc]"
                          >
                            <div className="p-4 space-y-4">
                              <p className="text-[10px] text-[#64748b] italic">These hours are automatically logged to your CFI record when this lesson is saved.</p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">CFI Flight Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={meta.totalFlight || '0.0'} className="w-full text-sm font-mono bg-[#f1f5f9] border border-[#dde3ec] rounded-lg px-2 py-1 text-[#64748b]" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                  <p className="text-[8px] text-[#94a3b8]">Auto-filled from Total Flight Time</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">CFI Dual Given</label>
                                  <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={meta.dual || '0.0'} className="w-full text-sm font-mono bg-[#f1f5f9] border border-[#dde3ec] rounded-lg px-2 py-1 text-[#64748b]" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                  <p className="text-[8px] text-[#94a3b8]">Auto-filled from Dual Received</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">CFI Night Time</label>
                                  <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={meta.nightDual || '0.0'} className="w-full text-sm font-mono bg-[#f1f5f9] border border-[#dde3ec] rounded-lg px-2 py-1 text-[#64748b]" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                  <p className="text-[8px] text-[#94a3b8]">Auto-filled from Night Dual</p>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">CFI Instrument Given</label>
                                  <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={meta.simInst || '0.0'} className="w-full text-sm font-mono bg-[#f1f5f9] border border-[#dde3ec] rounded-lg px-2 py-1 text-[#64748b]" />
                                    <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                  </div>
                                  <p className="text-[8px] text-[#94a3b8]">Auto-filled from Simulated Instrument</p>
                                </div>
                              </div>

                              <div className="h-px bg-[#e2e8f0]" />

                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">CFI Landings</h4>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={meta.cfiDidLandings} 
                                    onChange={(e) => handleMetaChange('cfiDidLandings', e.target.checked)}
                                    className="rounded border-[#cbd5e1] text-[#0ea5e9] focus:ring-[#0ea5e9]" 
                                  />
                                  <span className="text-[11px] text-[#334155] group-hover:text-[#0ea5e9] transition-colors">I performed landings this lesson</span>
                                </label>

                                {meta.cfiDidLandings && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">CFI Day Landings</label>
                                      <input 
                                        type="number" 
                                        step="1"
                                        min="0"
                                        value={meta.cfiDayLandings} 
                                        onChange={(e) => handleMetaChange('cfiDayLandings', e.target.value)} 
                                        className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" 
                                        placeholder="0" 
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">CFI Night Landings</label>
                                      <input 
                                        type="number" 
                                        step="1"
                                        min="0"
                                        value={meta.cfiNightLandings} 
                                        onChange={(e) => handleMetaChange('cfiNightLandings', e.target.value)} 
                                        className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" 
                                        placeholder="0" 
                                      />
                                    </div>
                                  </div>
                                )}
                                <p className="text-[9px] text-[#64748b] bg-[#f1f5f9] p-2 rounded border border-[#e2e8f0]">
                                  Only log landings where you as the CFI physically performed the landing. Leave unchecked if the student did all landings.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {/* Instrument */}
                <div className="bg-white border-t border-[#f1f5f9]">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, instrument: !prev.instrument }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
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
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
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

                          <div className="h-px bg-[#e2e8f0] my-4" />

                          {/* CFI Approaches section only when dual time > 0 */}
                          {parseFloat(meta.dual || '0') > 0 && (
                            <div className="space-y-4 pt-2">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">CFI Approaches</h4>
                              <p className="text-[9px] text-[#64748b] bg-[#f1f5f9] p-2 rounded border border-[#e2e8f0]">
                                Log instrument approaches where you as the CFI physically flew and served as PIC for currency.
                              </p>
                              
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  checked={meta.cfiFlewApproaches} 
                                  onChange={(e) => handleMetaChange('cfiFlewApproaches', e.target.checked)}
                                  className="rounded border-[#cbd5e1] text-[#0ea5e9] focus:ring-[#0ea5e9]" 
                                />
                                <span className="text-[11px] text-[#334155] group-hover:text-[#0ea5e9] transition-colors">CFI flew approaches this lesson</span>
                              </label>

                              {meta.cfiFlewApproaches && (
                                <div className="space-y-4 border-l-2 border-[#e2e8f0] pl-4 ml-1">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Number of CFI Approaches</label>
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="number" 
                                          value={meta.cfiApproachCount} 
                                          onChange={(e) => handleMetaChange('cfiApproachCount', e.target.value)} 
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
                                            checked={meta.cfiHoldPerformed}
                                            onChange={(e) => handleMetaChange('cfiHoldPerformed', e.target.checked)}
                                            className="peer sr-only"
                                          />
                                          <div className="w-4 h-4 border-2 border-[#dde3ec] rounded bg-white peer-checked:bg-[#1a3a5c] peer-checked:border-[#1a3a5c] transition-all" />
                                          <Check size={10} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] group-hover:text-[#1a3a5c] transition-colors">CFI performed holding procedure this lesson</span>
                                      </label>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">CFI Approach Types</label>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      {JSON.parse(meta.cfiApproachTypes || '[]').map((type: string) => (
                                        <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1a3a5c] text-white text-[10px] font-bold rounded-full">
                                          {type}
                                          <button
                                            onClick={() => {
                                              const current = JSON.parse(meta.cfiApproachTypes || '[]');
                                              handleMetaChange('cfiApproachTypes', JSON.stringify(current.filter((t: string) => t !== type)));
                                            }}
                                            className="hover:text-red-300 transition-colors"
                                          >
                                            <X size={10} />
                                          </button>
                                        </span>
                                      ))}
                                    </div>

                                    <div className="relative">
                                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                                      <input
                                        type="text"
                                        value={cfiApproachSearch}
                                        onChange={(e) => setCfiApproachSearch(e.target.value)}
                                        placeholder="Search CFI approach types..."
                                        className="w-full text-xs border border-[#dde3ec] rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:border-[#1a3a5c] transition-all"
                                      />
                                    </div>

                                    <div className="max-h-40 overflow-y-auto border border-[#dde3ec] rounded-lg bg-white divide-y divide-[#f1f5f9] custom-scrollbar">
                                      {APPROACH_TYPES.filter(t => 
                                        t.label.toLowerCase().includes(cfiApproachSearch.toLowerCase()) || 
                                        t.code.toLowerCase().includes(cfiApproachSearch.toLowerCase())
                                      ).map(type => {
                                        const isSelected = JSON.parse(meta.cfiApproachTypes || '[]').includes(type.code);
                                        return (
                                          <button
                                            key={type.code}
                                            onClick={() => {
                                              const current = JSON.parse(meta.cfiApproachTypes || '[]');
                                              if (isSelected) {
                                                handleMetaChange('cfiApproachTypes', JSON.stringify(current.filter((t: string) => t !== type.code)));
                                              } else {
                                                handleMetaChange('cfiApproachTypes', JSON.stringify([...current, type.code]));
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
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Group 4 — Cross Country */}
                <div className="bg-white">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, xc: !prev.xc }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
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

                        <div className="h-px bg-[#dde3ec] mx-4 mb-4" />
                        <div className="mx-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7c3aed]">R-ATP Cross Country — §61.160</span>
                          </div>
                          
                          <div className="space-y-4 p-4 bg-[#f5f3ff] border border-[#ddd6fe] rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center h-5">
                                <input
                                  id="ratpXCEligible"
                                  type="checkbox"
                                  checked={meta.ratpXCEligible}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    handleMetaChange('ratpXCEligible', checked);
                                    if (!checked) handleMetaChange('ratpXCTime', '');
                                  }}
                                  className="w-4 h-4 text-[#7c3aed] border-[#ddd6fe] rounded focus:ring-[#7c3aed]"
                                />
                              </div>
                              <div className="flex-1">
                                <label htmlFor="ratpXCEligible" className="flex items-center gap-2 text-xs font-semibold text-[#1e1b4b] cursor-pointer">
                                  This flight went more than 50NM from departure but did not include a landing at the distant point
                                  <div className="group relative">
                                    <HelpCircle size={14} className="text-[#7c3aed] cursor-help" />
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1e293b] text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                                      Log R-ATP XC hours here only when the flight included a point more than 50NM from the original departure airport but no landing was made at that distant point. If a landing was made log those hours in XC Dual XC Solo or XC PIC above. R-ATP XC captures the unique case where the flight qualifies under §61.160 but not as a regular cross country under §61.1.
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </div>

                            <AnimatePresence>
                              {meta.ratpXCEligible && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden space-y-3 pt-2 border-t border-[#ddd6fe]"
                                >
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">R-ATP Cross Country Time</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={meta.ratpXCTime}
                                        onChange={(e) => handleMetaChange('ratpXCTime', e.target.value)}
                                        placeholder="0.0"
                                        className="w-32 text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#7c3aed] transition-all"
                                      />
                                      <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                    </div>
                                    <p className="text-[10px] text-[#6b7280] italic">
                                      Enter the total flight time for this flight. This will be tracked separately from regular XC hours toward the R-ATP 200 hour cross country requirement.
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

                {/* Group 5 — Night Flying */}
                <div className="bg-white" id="night-group">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, night: !prev.night }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
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
                              <input type="number" step="1" min="0" value={meta.nightTakeoffs} onChange={(e) => handleMetaChange('nightTakeoffs', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0" />
                              <span className="text-[10px] text-[#6b7280] font-mono">count</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Night Landings</label>
                            <div className="flex items-center gap-2">
                              <input type="number" step="1" min="0" value={meta.ldgNight} onChange={(e) => handleMetaChange('ldgNight', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0" />
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

                {/* Group 5.5 — Multi Engine Time (Conditional) */}
                {meta.aircraftClass === 'AMEL' && (
                  <div className="bg-white">
                    <button
                      onClick={() => setExpandedGroups(prev => ({ ...prev, multi: !prev.multi }))}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.multi && "rotate-90")} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#7c3aed]">Multi Engine Time</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#6b7280]">
                        {meta.totalFlight || '0.0'} hrs
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedGroups.multi && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-[#f5f3ff]"
                        >
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi Total Time</label>
                              <div className="flex items-center gap-2">
                                <input type="number" step="0.1" value={meta.totalFlight} readOnly className="w-full text-sm font-mono bg-gray-50 border border-[#dde3ec] rounded-lg px-2 py-1 text-[#64748b]" />
                                <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi PIC</label>
                              <div className="flex items-center gap-2">
                                <input type="number" step="0.1" value={meta.mePic} onChange={(e) => handleMetaChange('mePic', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi Dual</label>
                              <div className="flex items-center gap-2">
                                <input type="number" step="0.1" value={meta.meDual} onChange={(e) => handleMetaChange('meDual', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi Night</label>
                              <div className="flex items-center gap-2">
                                <input type="number" step="0.1" value={meta.meNight} onChange={(e) => handleMetaChange('meNight', e.target.value)} className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" placeholder="0.0" />
                                <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Group 6 — Sim Time */}
                <div className="bg-white">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, sim: !prev.sim }))}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gradient-to-r hover:from-[#f4f5f7] hover:to-[#f8fafc] transition-all duration-200"
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

                {/* Multi Engine Time Group */}
                {meta.aircraftClass === 'AMEL' && (
                  <div className="bg-white border border-[#dde3ec] rounded-xl shadow-sm overflow-hidden mt-4">
                    <button
                      type="button"
                      onClick={() => setExpandedGroups(prev => ({ ...prev, multiEngine: !prev.multiEngine }))}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f8fafc] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#7c3aed] bg-opacity-10 rounded-lg flex items-center justify-center text-[#7c3aed]">
                          <Plane size={18} />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-[#1c2333]">Multi Engine Time</div>
                          <div className="text-[10px] text-[#6b7280]">AMEL specific flight hours</div>
                        </div>
                      </div>
                      <ChevronRight size={12} className={cn("text-[#6b7280] transition-transform", expandedGroups.multiEngine && "rotate-90")} />
                    </button>

                    <AnimatePresence>
                      {expandedGroups.multiEngine && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-[#f8fafc] border-t border-[#dde3ec] space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi Total Time</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    readOnly 
                                    value={meta.totalFlight} 
                                    className="w-full text-sm font-mono bg-[#f1f5f9] border border-[#dde3ec] rounded-lg px-2 py-1 text-[#64748b]" 
                                  />
                                  <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                </div>
                                <p className="text-[8px] text-[#6b7280] italic">Auto-filled from Total Flight Time</p>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi PIC</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    step="0.1" 
                                    value={meta.mePic} 
                                    onChange={(e) => handleMetaChange('mePic', e.target.value)} 
                                    className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" 
                                    placeholder="0.0" 
                                  />
                                  <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi Dual</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    step="0.1" 
                                    value={meta.meDual} 
                                    onChange={(e) => handleMetaChange('meDual', e.target.value)} 
                                    className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" 
                                    placeholder="0.0" 
                                  />
                                  <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280]">Multi Night</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    step="0.1" 
                                    value={meta.meNight} 
                                    onChange={(e) => handleMetaChange('meNight', e.target.value)} 
                                    className="w-full text-sm font-mono bg-white border border-[#dde3ec] rounded-lg px-2 py-1" 
                                    placeholder="0.0" 
                                  />
                                  <span className="text-[10px] text-[#6b7280] font-mono">hrs</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrev}
          className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] font-medium text-sm hover:bg-[#f4f5f7] transition-all flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-2.5 rounded-xl bg-[#1a3a5c] text-white font-bold text-sm shadow-md shadow-[#1a3a5c]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a3a5c]/30 active:translate-y-0 active:shadow-sm transition-all duration-150 flex items-center gap-2"
        >
          Next: ACS Grading
          <ChevronRight size={18} />
        </button>
      </div>
    </>
  )}

  {((showLessonTypeStep && currentStep === 4) || (!showLessonTypeStep && currentStep === 3)) && (
    <>
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#2d7a4f]">{counts.s}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Proficient</div>
        </div>
        <div className="bg-white rounded-xl border border-[#dde3ec] p-3 text-center shadow-sm">
          <div className="text-2xl font-mono font-bold text-[#c0392b]">{counts.n}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Below Standard</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-lg overflow-hidden mb-8">
        <div className="grid grid-cols-[1fr_72px_1.3fr] bg-[#f4f5f7] border-b border-[#dde3ec] text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
          <div className="px-4 py-2 flex items-center">Area of Operation / Task</div>
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
          {(() => {
            const selectedTile = activeTiles.find(t => t.id === lessonType);
            const isReview = !lessonType || lessonType === 'review';
            const isIRInstrumentTile = isCPL && lessonType === 'instrument';

            const shouldShowTask = (taskCode: string) => {
              if (isReview) return true;
              if (isIRInstrumentTile) return activePrefPostCodes.includes(taskCode);
              const specificCodes = selectedTile?.taskCodes || [];
              return specificCodes.includes(taskCode) || activePrefPostCodes.includes(taskCode);
            };

            const renderTaskRow = (task: any, id: string) => {
              const gValue = grades[id] || '';
              const displayGrade = gValue === 'S' ? '3' : gValue === 'N' ? '2' : gValue;
              const n = notes[id] || '';
              const isExpanded = expandedTasks[id];
              const isEmergencyMalfunction = task.code === 'CA.X.C' || task.code === 'PA.IX.C';
              return (
                <div key={id} className="grid grid-cols-[1fr_72px_1.3fr] hover:bg-[#fafbfd] transition-colors">
                  <div className="p-4">
                    <div
                      onClick={() => toggleExpand(id)}
                      className="text-[13px] font-medium text-[#1c2333] cursor-pointer flex items-center gap-2 hover:text-[#2a5a8c]"
                    >
                      {task.name}
                      {(task.stds && task.stds.length > 0) || isEmergencyMalfunction ? (
                        <ChevronDown size={14} className={cn("text-[#6b7280] transition-transform", isExpanded && "rotate-180")} />
                      ) : null}
                    </div>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-3 p-3 bg-[#d4e8f5] rounded-lg border-l-4 border-[#2a5a8c] space-y-1.5"
                      >
                        {task.stds && task.stds.map((std: any, idx: number) => (
                          <div key={idx} className="text-[11px] text-[#1a3a5c] leading-relaxed flex gap-2">
                            <span className="opacity-40 shrink-0">·</span>
                            <span>{std.code} — {std.description}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-start justify-center px-0.5 pt-3 border-x border-[#dde3ec]">
                    <div className="grid grid-cols-2 gap-0.5">
                      {[1, 2, 3, 4].map((g) => {
                        const gradeStr = g.toString();
                        const isSelected = displayGrade === gradeStr;
                        return (
                          <button
                            key={g}
                            onClick={() => handleGradeSet(id, gradeStr as Grade)}
                            className={cn(
                              "w-8 h-7 rounded-md border font-mono text-[10px] font-bold transition-all active:scale-95",
                              isSelected 
                                ? g === 4 ? "bg-[#2d7a4f] border-[#2d7a4f] text-white shadow-sm" :
                                  g === 3 ? "bg-[#5a9e6f] border-[#5a9e6f] text-white shadow-sm" :
                                  g === 2 ? "bg-[#e8a020] border-[#e8a020] text-white shadow-sm" :
                                  "bg-[#c0392b] border-[#c0392b] text-white shadow-sm"
                                : "bg-[#f4f5f7] border-[#dde3ec] text-[#6b7280] hover:border-[#2a5a8c]"
                            )}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
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
            };

            // CPL Basic Instrument tile — render CPL preflight tasks + full IR_FLIGHT_ACS
            if (isIRInstrumentTile) {
              return (
                <>
                  {/* CPL preflight/postflight tasks first */}
                  {flightAreas.map((area, fi) => {
                    const ai = fi + 1;
                    const visibleTasks = area.tasks.filter(task => activePrefPostCodes.includes(task.code));
                    if (visibleTasks.length === 0) return null;
                    return (
                      <React.Fragment key={area.area}>
                        <div className="bg-[#1a3a5c] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex justify-between items-center">
                          <span>{area.area}</span>
                          <span className="opacity-60 font-normal text-[10px]">{visibleTasks.length} tasks</span>
                        </div>
                        {visibleTasks.map((task) => {
                          const ti = area.tasks.indexOf(task);
                          return renderTaskRow(task, `${ai}_${ti}`);
                        })}
                      </React.Fragment>
                    );
                  })}
                  {/* IR flight ACS areas */}
                  <div className="bg-[#1a5c3a] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider">
                    ── Instrument Training (IR ACS) ──
                  </div>
                  {IR_FLIGHT_ACS.map((area, ari) => {
                    if (area.tasks.length === 0) return null;
                    return (
                      <React.Fragment key={`ir_${area.area}`}>
                        <div className="bg-[#1a5c3a] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex justify-between items-center opacity-90">
                          <span>{area.area}</span>
                          <span className="opacity-60 font-normal text-[10px]">{area.tasks.length} tasks</span>
                        </div>
                        {area.tasks.map((task, ti) => {
                          const id = `ir_${ari}_${ti}`;
                          return renderTaskRow(task, id);
                        })}
                      </React.Fragment>
                    );
                  })}
                </>
              );
            }

            // Standard CPL or PPL filter
            const standardAreas = flightAreas.map((area, fi) => {
              const ai = fi + 1;
              const visibleTasks = area.tasks.filter(task => shouldShowTask(task.code));
              if (visibleTasks.length === 0) return null;
              return (
                <React.Fragment key={area.area}>
                  <div className="bg-[#1a3a5c] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex justify-between items-center">
                    <span>{area.area}</span>
                    <span className="opacity-60 font-normal text-[10px]">{visibleTasks.length} tasks</span>
                  </div>
                  {visibleTasks.map((task) => {
                    const ti = area.tasks.indexOf(task);
                    const id = `${ai}_${ti}`;
                    return renderTaskRow(task, id);
                  })}
                </React.Fragment>
              );
            });

            const showExtraEmergencies = !isIR && (lessonType === 'emergencies' || !lessonType || lessonType === 'review');
            const extraEmergencies = showExtraEmergencies ? (
              <React.Fragment key="extra_emergencies">
                <div className="bg-[#c0392b] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider flex justify-between items-center">
                  <span>Additional Emergency Tasks</span>
                  <span className="opacity-60 font-normal text-[10px]">{EMERGENCY_EXTRA_TASKS.length} tasks</span>
                </div>
                {EMERGENCY_EXTRA_TASKS.map((task) => renderTaskRow(task, task.id))}
              </React.Fragment>
            ) : null;

            return (
              <>
                {standardAreas}
                {extraEmergencies}
              </>
            );
          })()}
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

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrev}
          className="px-5 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] font-medium text-sm hover:bg-[#f4f5f7] transition-all flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <div className="flex gap-3">
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
      </div>
    </>
  )}
    </motion.div>
  </AnimatePresence>

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

      <AnimatePresence>
        {showAddAircraftModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl border border-[#dde3ec] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[#dde3ec] flex items-center justify-between bg-[#f8fafc]">
                <h3 className="text-lg font-bold text-[#1a3a5c]">Add New Aircraft</h3>
                <button 
                  onClick={() => setShowAddAircraftModal(false)}
                  className="p-2 hover:bg-[#dde3ec] rounded-full transition-colors"
                >
                  <X size={20} className="text-[#6b7280]" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Aircraft Model</label>
                  <input
                    type="text"
                    value={newAircraftModel}
                    onChange={(e) => setNewAircraftModel(e.target.value)}
                    placeholder="e.g. C-172, Cessna"
                    className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">ICAO Code</label>
                  <input
                    type="text"
                    value={newAircraftIcao}
                    onChange={(e) => setNewAircraftIcao(e.target.value)}
                    placeholder="e.g. C172"
                    className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#2a5a8c] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Aircraft Class</label>
                  <div className="flex gap-2">
                    {['ASEL', 'AMEL'].map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setNewAircraftClass(cls)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                          newAircraftClass === cls 
                            ? "bg-[#1a3a5c] text-white border-[#1a3a5c]" 
                            : "bg-white text-[#6b7280] border-[#dde3ec] hover:bg-[#f4f5f7]"
                        )}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#dde3ec] flex justify-end gap-3">
                <button
                  onClick={() => setShowAddAircraftModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#6b7280] hover:bg-[#dde3ec] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewAircraft}
                  className="px-6 py-2 bg-[#1a3a5c] text-white text-sm font-bold rounded-lg hover:bg-[#2a5a8c] transition-all shadow-md"
                >
                  Save Aircraft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {nightWarning && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-yellow-200"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-[#1a3a5c] mb-2">Night time required</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-6">
                  You have logged night activity but Night Total Time is empty. Please enter the total night flight time before saving.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setExpandedGroups(prev => ({ ...prev, night: true }));
                      setNightWarning(false);
                      setTimeout(() => {
                        document.getElementById('night-group')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="w-full py-3 bg-[#1a3a5c] text-white rounded-xl font-bold text-sm hover:bg-[#2a5a8c] transition-all shadow-md"
                  >
                    Go to Night Fields
                  </button>
                  <button
                    onClick={() => {
                      setNightWarning(false);
                    }}
                    className="w-full py-3 bg-[#f3f4f6] text-[#6b7280] rounded-xl font-bold text-sm hover:bg-[#e5e7eb] transition-all"
                  >
                    Dismiss
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
