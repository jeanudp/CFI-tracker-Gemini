import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, ManualHours, ManualHoursEntry, Grade, Endorsement } from '../types';
import { ALL_ACS, ACS_ELEMENTS, RATINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import EndorsementAdvisor from './EndorsementAdvisor';

import { Search, Trash2, ChevronRight, ChevronLeft, ChevronDown, Filter, Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Plus, X, Loader2, BookOpen, Edit, History as HistoryIcon, CheckSquare, Square, BarChart3, Sparkles, Pencil, Check, ClipboardList, FileText, HelpCircle, Download, Info, RotateCcw, Archive, Share2, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import HowToExportModal from './HowToExportModal';

const CHECKLIST_PPL = [
  {
    title: "Student Documents",
    items: [
      { key: "checklist_ppl_medicalCert", label: "FAA Medical Certificate (valid and appropriate class)" },
      { key: "checklist_ppl_studentCert", label: "Student Pilot Certificate or Pilot Certificate" },
      { key: "checklist_ppl_photoId", label: "Government-issued Photo ID" },
      { key: "checklist_ppl_knowledgeTest", label: "FAA Knowledge Test Report (passing score, not expired)" },
      { key: "checklist_ppl_iacraApp", label: "Completed FAA Form 8710-1 or IACRA application" },
    ]
  },
  {
    title: "Instructor Requirements",
    items: [
      { 
        key: "checklist_ppl_endorsements", 
        label: "All required endorsements given", 
        auto: (data: any) => {
          const endorsements = data as any[];
          const required = ['A.1', 'A.33', 'A.34'];
          return required.every(k => endorsements.some(e => e.endorsement_key === k && e.completed));
        },
        autoText: "Auto-verified from app data"
      },
      { key: "checklist_ppl_logbookReviewed", label: "Logbook reviewed and all flight time verified" },
      { 
        key: "checklist_ppl_recency", 
        label: "60-day recency requirement met §61.39", 
        auto: (data: any) => {
          const stats = data as any;
          return stats.recentDual >= 3;
        },
        autoText: "Auto-verified from app data"
      },
      { key: "checklist_ppl_deficienciesReviewed", label: "Knowledge test deficiencies reviewed if applicable (A.2 endorsement)" },
    ]
  },
  {
    title: "Aircraft Documents (AROW)",
    items: [
      { key: "checklist_ppl_airworthiness", label: "Airworthiness Certificate" },
      { key: "checklist_ppl_registration", label: "Registration Certificate" },
      { key: "checklist_ppl_poh", label: "Operating Limitations (POH)" },
      { key: "checklist_ppl_weightBalance", label: "Weight and Balance data current" },
    ]
  },
  {
    title: "IACRA and Examiner Preparation",
    items: [
      { key: "checklist_ppl_hoursVerified", label: "Flight hours verified against logbook" },
      { key: "checklist_ppl_iacraStarted", label: "IACRA application started" },
      { key: "checklist_ppl_dpeScheduled", label: "Designated Pilot Examiner (DPE) scheduled" },
      { key: "checklist_ppl_examinerFee", label: "Examiner fee arranged" },
      { key: "checklist_ppl_briefed", label: "Student briefed on checkride procedures" },
    ]
  }
];

export default function History() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [manualHours, setManualHours] = useState<ManualHours[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [activeStudentFilter, setActiveStudentFilter] = useState<string | null>(
    localStorage.getItem('sb_selected_student')
  );
  const [selectedSoloOption, setSelectedSoloOption] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [shareModalData, setShareModalData] = useState<{ url: string, studentName: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'lesson' | 'cumulative' | 'checkride' | 'endorsements'>('lesson');
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
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [checklistExpanded, setChecklistExpanded] = useState(false);
  const [preSoloTestResult, setPreSoloTestResult] = useState<any>(null);
  const [archivedLessons, setArchivedLessons] = useState<Lesson[]>([]);
  const [isFlightLogOpen, setIsFlightLogOpen] = useState(true);
  const [isACSCoverageOpen, setIsACSCoverageOpen] = useState(false);
  const [isHoursSummaryOpen, setIsHoursSummaryOpen] = useState(false);
  const [isFlightReqOpen, setIsFlightReqOpen] = useState(false);
  const [showFullTaskList, setShowFullTaskList] = useState(false);
  const [cfiHoursPrompt, setCfiHoursPrompt] = useState<{
    lessonId: string;
    lessonLabel: string;
    dualTime: number;
    isPermanent?: boolean;
  } | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);
  const [pendingExportLessonIds, setPendingExportLessonIds] = useState<string[]>([]);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

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

  useEffect(() => {
    setIsFlightLogOpen(true);
  }, [selectedLessonId]);

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
            : "border-[#dde3ec] bg-[var(--bg-secondary)] hover:border-[#1a3a5c] hover:bg-[#f8fafc]"
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
            {lesson.meta?.overallGrade && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white",
                lesson.meta.overallGrade === 'S' ? "bg-[#2d7a4f]" : "bg-[#c0392b]"
              )}>
                {lesson.meta.overallGrade}
              </span>
            )}
            {Object.values(lesson.grades || {}).filter(g => ['S', '3', '4'].includes(g)).length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#e4f5ec] text-[#2d7a4f] rounded-full">3-4: {Object.values(lesson.grades || {}).filter(g => ['S', '3', '4'].includes(g)).length}</span>
            )}
            {Object.values(lesson.grades || {}).filter(g => ['N', '1', '2'].includes(g)).length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#fdecea] text-[#c0392b] rounded-full">1-2: {Object.values(lesson.grades || {}).filter(g => ['N', '1', '2'].includes(g)).length}</span>
            )}
            {lesson.meta?.totalFlight && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#d4e8f5] text-[#1a3a5c] rounded-full">{lesson.meta.totalFlight}h</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onPointerDown={(e) => handleDeleteLesson(e, lesson.id, lesson.label)}
          className="shrink-0 mt-1 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-100"
          title="Archive lesson"
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
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .is('deleted_at', null)
        .order('saved_at', { ascending: false });
      if (lessonsError) throw lessonsError;

      const { data: archivedData } = await supabase
        .from('lessons')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      setArchivedLessons(archivedData || []);

      const { data: manualData, error: manualError } = await supabase.from('manual_hours').select('*');
      if (manualError) throw manualError;

      const { data: endorsementsData, error: endorsementsError } = await supabase.from('endorsements').select('*');
      if (endorsementsError) throw endorsementsError;

      setLessons(lessonsData || []);
      setManualHours(manualData || []);
      setEndorsements(endorsementsData || []);
      const preSelectedStudent = localStorage.getItem('sb_selected_student');
      if (preSelectedStudent && lessonsData && lessonsData.length > 0) {
        const studentLesson = lessonsData.find(l => l.student_name === preSelectedStudent);
        if (studentLesson) {
          setSelectedLessonId(studentLesson.id);
        } else {
          setSelectedLessonId(lessonsData[0].id);
        }
      } else if (lessonsData && lessonsData.length > 0) {
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

  const archiveLesson = async (lessonId: string, lessonLabel: string) => {
    if (!window.confirm(`Archive lesson ${lessonLabel}? You can restore it later from the Archived Lessons section.`)) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('lessons')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: session.user.email
      })
      .eq('id', lessonId);
      
    if (error) { window.alert('Archive failed: ' + error.message); return; }
    setLessons(prev => prev.filter(l => l.id !== lessonId));
    if (selectedLessonId === lessonId) setSelectedLessonId(null);
    fetchData();
  };

  const handleDeleteLesson = async (e: React.PointerEvent, lessonId: string, lessonLabel: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const lesson = lessons.find(l => l.id === lessonId) || archivedLessons.find(l => l.id === lessonId);
    const dualTime = parseFloat(lesson?.meta?.dual || '0') || 0;
    
    if (dualTime > 0) {
      setCfiHoursPrompt({ lessonId, lessonLabel, dualTime });
      return;
    }
    
    await archiveLesson(lessonId, lessonLabel);
  };

  const handleRestoreLesson = async (lessonId: string) => {
    const { error } = await supabase
      .from('lessons')
      .update({ 
        deleted_at: null,
        deleted_by: null
      })
      .eq('id', lessonId);
      
    if (error) { window.alert('Failed to restore lesson: ' + error.message); return; }
    fetchData();
  };

  const finishPermanentDelete = async (lessonId: string, lessonLabel: string) => {
    if (!window.confirm(`Permanently delete ${lessonLabel}? This cannot be undone.`)) return;
    
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId);
      
    if (error) { window.alert('Failed to permanently delete: ' + error.message); return; }
    fetchData();
  };

  const handlePermanentDeleteLesson = async (lessonId: string, lessonLabel: string) => {
    const lesson = lessons.find(l => l.id === lessonId) || archivedLessons.find(l => l.id === lessonId);
    const dualTime = parseFloat(lesson?.meta?.dual || '0') || 0;
    
    if (dualTime > 0) {
      setCfiHoursPrompt({ lessonId, lessonLabel, dualTime, isPermanent: true });
      return;
    }
    
    await finishPermanentDelete(lessonId, lessonLabel);
  };

  const handleStudentExport = async (newOnly: boolean) => {
    if (!studentName) return;
    setExportLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setExportLoading(false);
        return;
      }

      const { data: exportRecords } = await supabase
        .from('student_exports')
        .select('lesson_ids')
        .eq('student_name', studentName)
        .eq('user_id', session.user.id);
      
      const alreadyExportedIds: string[] = (exportRecords || []).flatMap(r => r.lesson_ids || []);
      
      let lessonsToExport = studentLessons.filter(l => l.type === 'flight');
      if (newOnly) {
        lessonsToExport = lessonsToExport.filter(l => !alreadyExportedIds.includes(l.id));
      }

      if (lessonsToExport.length === 0) {
        window.alert("No new lessons to export");
        setExportLoading(false);
        return;
      }

      const headers = ["Date", "Tail Number", "Model", "Total Flight Time", "PIC", "Dual Received", "Solo", "Night", "IMC", "Simulated Instrument", "Ground Simulator", "Approaches", "Hold", "Landings", "FS Day Landings", "FS Night Landings", "X-Country", "Night Takeoffs", "Route", "Comments"];
      
      const rows = [headers];

      lessonsToExport.forEach(l => {
        const m = l.meta || {};
        
        // Date: convert from YYYY-MM-DD to M/D/YYYY
        let formattedDate = '';
        if (m.date) {
           const parts = m.date.split('-');
           if (parts.length === 3) {
             formattedDate = `${parseInt(parts[1])}/${parseInt(parts[2])}/${parseInt(parts[0])}`;
           }
        }

        const totalFlight = parseFloat(m.totalFlight || '0');
        const pic = parseFloat(m.pic || '0');
        const dual = parseFloat(m.dual || '0');
        const solo = parseFloat(m.solo || '0');
        const night = parseFloat(m.night || '0');
        const imc = parseFloat(m.imc || '0');
        const simInst = parseFloat(m.simInst || '0');
        const groundSim = (parseFloat(m.atd || '0') || 0) + (parseFloat(m.ftd || '0') || 0) + (parseFloat(m.ffs || '0') || 0);
        const approaches = parseInt(m.approachCount || '0');
        const landings = parseInt(m.ldgTotal || '0');
        const ldgDay = parseInt(m.ldgDay || '0');
        const ldgNight = parseInt(m.ldgNight || '0');
        const xc = (parseFloat(m.xcDual || '0') || 0) + (parseFloat(m.xcSolo || '0') || 0) + (parseFloat(m.xcPic || '0') || 0);
        const nightTakeoffs = parseInt(m.nightTakeoffs || '0');

        const row = [
          formattedDate,
          m.aircraft || '',
          m.aircraftModel || '',
          totalFlight > 0 ? totalFlight.toFixed(1) : '',
          pic > 0 ? pic.toFixed(1) : '',
          dual > 0 ? dual.toFixed(1) : '',
          solo > 0 ? solo.toFixed(1) : '',
          night > 0 ? night.toFixed(1) : '',
          imc > 0 ? imc.toFixed(1) : '',
          simInst > 0 ? simInst.toFixed(1) : '',
          groundSim > 0 ? groundSim.toFixed(1) : '',
          approaches > 0 ? approaches.toString() : '',
          m.holdPerformed ? 'Yes' : '',
          landings > 0 ? landings.toString() : '',
          ldgDay > 0 ? ldgDay.toString() : '',
          ldgNight > 0 ? ldgNight.toString() : '',
          xc > 0 ? xc.toFixed(1) : '',
          nightTakeoffs > 0 ? nightTakeoffs.toString() : '',
          m.route || '',
          l.label || ''
        ];
        rows.push(row);
      });

      const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const today = new Date().toISOString().split('T')[0];
      const filename = `MyFlightBook-Student-${today}.csv`;
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      setPendingExportLessonIds(lessonsToExport.map(l => l.id));
      setShowExportConfirm(true);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const confirmStudentExport = async () => {
    setExportLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setExportLoading(false);
        return;
      }

      const { error } = await supabase
        .from('student_exports')
        .insert({
          student_name: studentName,
          user_id: session.user.id,
          token: '',
          lesson_ids: pendingExportLessonIds,
          lesson_count: pendingExportLessonIds.length
        });
      
      if (error) throw error;
      
      setShowExportConfirm(false);
      setPendingExportLessonIds([]);
    } catch (err) {
      console.error('Finalize export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);

  useEffect(() => {
    if (selectedLesson?.student_name) {
      const fetchTestResult = async () => {
        const { data } = await supabase
          .from('student_tests')
          .select('*')
          .eq('student_name', selectedLesson.student_name)
          .eq('test_type', 'pre_solo')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setPreSoloTestResult(data);
      };
      fetchTestResult();
    } else {
      setPreSoloTestResult(null);
    }
  }, [selectedLesson?.student_name]);
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
    const filterName = studentName || activeStudentFilter;
    if (filterName) {
      return matchesSearch && l.student_name === filterName;
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
          if (['S', '3', '4'].includes(g)) s++;
          if (['N', '1', '2'].includes(g)) n++;
        });
      }
    });
    return { s, n };
  };

  const groundGrades = getSectionGrades(groundLessons);
  const flightGrades = getSectionGrades(flightLessons);

  const getMostRecentGrade = (lessons: Lesson[], taskId: string) => {
    const sortedLessons = [...lessons]
      .filter(l => l.grades && l.grades[taskId])
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
    return sortedLessons.length > 0 ? sortedLessons[0].grades[taskId] : null;
  };

  const isPassingGrade = (grade: any) => {
    if (grade === null || grade === undefined || grade === '') return false;
    const g = String(grade);
    return ['S', '3', '4'].includes(g);
  };

  const gradeDisplayColor = (grade: any) => {
    const g = String(grade);
    if (g === '4' || g === 'S') return 'bg-[#2d7a4f]';
    if (g === '3') return 'bg-[#5a9e6f]';
    if (g === '2') return 'bg-[#e8a020]';
    if (g === 'N' || g === '1') return 'bg-[#c0392b]';
    return 'bg-[#94a3b8]';
  };

  const studentStats = studentName ? {
    count: studentLessons.length,
    hours: studentLessons.reduce((sum, l) => sum + (parseFloat(l.meta?.totalFlight || '0') || 0), 0),
    sGrades: studentLessons.reduce((sum, l) => sum + Object.values(l.grades || {}).filter(g => isPassingGrade(g)).length, 0)
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

  const getMostRecentGradeInfo = (lessons: Lesson[], taskId: string) => {
    const sortedLessons = [...lessons]
      .filter(l => l.grades && l.grades[taskId])
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
    if (sortedLessons.length === 0) return null;
    return {
      grade: sortedLessons[0].grades[taskId],
      date: sortedLessons[0].saved_at
    };
  };

  const getCumulativeStats = (lessonsToSum = studentLessons) => {
    let totFlight = 0, totDual = 0, totXc = 0, totNight = 0, totNightLdg = 0, totSim = 0, totSolo = 0, totSoloXc = 0, totLdg = 0, totLdgDay = 0, totLdgNight = 0;
    let totAtd = 0, totXcDual = 0, totXcSolo = 0, totXcPic = 0, totAtdInst = 0, totNightDual = 0, totNightPic = 0, totNightTakeoffs = 0, totFtd = 0, totFfs = 0, totAtdSE = 0;
    let totFtdInst = 0, totFfsInst = 0, totRatpSimInst = 0, totRatpActualInst = 0;
    let totApproachCount = 0, totHoldPerformed = 0, totRatpXC = 0, totIacraXC = 0;
    const approachTypesFreq: Record<string, number> = {};
    
    lessonsToSum.forEach(l => {
      const m = l.meta || {};
      const regXC = (parseFloat(m.xcDual || '0') || 0) + (parseFloat(m.xcSolo || '0') || 0) + (parseFloat(m.xcPic || '0') || 0);
      const rXCTime = parseFloat(m.ratpXCTime || '0') || 0;

      totFlight += parseFloat(m.totalFlight || '0') || 0;
      totDual += parseFloat(m.dual || '0') || 0;
      totXc += regXC;
      totNight += parseFloat(m.night || '0') || 0;
      totNightLdg += parseInt(m.ldgNight || '0') || 0;
      totSim += (parseFloat(m.simInst || '0') || 0) + (parseFloat(m.atdInst || '0') || 0) + (parseFloat(m.ftdInst || '0') || 0) + (parseFloat(m.ffsInst || '0') || 0);
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
      totFtd += parseFloat(m.ftd || '0') || 0;
      totFfs += parseFloat(m.ffs || '0') || 0;
      totAtdSE += parseFloat(m.atdSE || '0') || 0;
      totFtdInst += parseFloat(m.ftdInst || '0') || 0;
      totFfsInst += parseFloat(m.ffsInst || '0') || 0;
      totRatpSimInst += parseFloat(m.ratpSimInst || '0') || 0;
      totRatpActualInst += parseFloat(m.ratpActualInst || '0') || 0;
      totRatpXC += rXCTime;
      totIacraXC += Math.max(regXC, rXCTime);

      totApproachCount += parseInt(m.approachCount || '0') || 0;
      if (m.holdPerformed) totHoldPerformed += 1;
      
      try {
        const types = JSON.parse(m.approachTypes || '[]');
        if (Array.isArray(types)) {
          types.forEach(t => {
            approachTypesFreq[t] = (approachTypesFreq[t] || 0) + 1;
          });
        }
      } catch (e) {
        console.error('Error parsing approach types', e);
      }
    });

    const picTime = lessonsToSum.reduce((sum, l) => sum + (parseFloat(l.meta?.pic || '0') || (parseFloat(l.meta?.solo || '0') > 0 ? parseFloat(l.meta.totalFlight || '0') : 0)), 0);

    const getPriorValue = (key: string) => {
      const m = manualHours.find(h =>
        h.student_name === studentName &&
        h.field_key === `prior_${key}`
      );
      return m ? m.total : 0;
    };

    totFlight += getPriorValue('totalFlight');
    totDual += getPriorValue('dual');
    totSolo += getPriorValue('solo');
    totXcDual += getPriorValue('xcDual');
    totXcSolo += getPriorValue('xcSolo');
    totXcPic += getPriorValue('xcPic');
    totNight += getPriorValue('night');
    totNightDual += getPriorValue('nightDual');
    totNightPic += getPriorValue('nightPic');
    totSim += getPriorValue('simInst') + getPriorValue('atdInst');
    totAtdInst += getPriorValue('atdInst');
    totLdg += getPriorValue('ldgTotal');
    totLdgDay += getPriorValue('ldgDay');
    totLdgNight += getPriorValue('ldgNight');
    totNightTakeoffs += getPriorValue('nightTakeoffs');
    totAtd += getPriorValue('atd');
    totFtd += getPriorValue('ftd');
    totFfs += getPriorValue('ffs');
    totApproachCount += getPriorValue('approachCount');
    
    const priorRatpXC = getPriorValue('ratpXC');
    totRatpXC += priorRatpXC;
    
    const priorRegXC = getPriorValue('xcDual') + getPriorValue('xcSolo') + getPriorValue('xcPic');
    totIacraXC += Math.max(priorRegXC, priorRatpXC);

    return { 
      totFlight, totDual, totXc, totNight, totNightLdg, totSim, totSolo, totSoloXc, totLdg, totLdgDay, totLdgNight,
      totAtd, totXcDual, totXcSolo, totXcPic, totAtdInst, totNightDual, totNightPic, totNightTakeoffs, totFtd, totFfs, totAtdSE, totFtdInst, totFfsInst, picTime,
      totRatpSimInst, totRatpActualInst, totApproachCount, totHoldPerformed, approachTypesFreq, totRatpXC, totIacraXC
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

  const handleToggleChecklist = async (key: string, currentVal: boolean) => {
    if (!selectedLesson) return;
    const studentName = selectedLesson.student_name;
    const newVal = !currentVal;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const existing = manualHours.find(m => m.student_name === studentName && m.field_key === key);
    
    if (existing) {
      const { error } = await supabase
        .from('manual_hours')
        .update({ total: newVal ? 1 : 0, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (!error) {
        setManualHours(prev => prev.map(m => m.id === existing.id ? { ...m, total: newVal ? 1 : 0 } : m));
      }
    } else {
      const { data, error } = await supabase
        .from('manual_hours')
        .insert({ 
          user_id: session.user.id, 
          student_name: studentName, 
          field_key: key, 
          total: newVal ? 1 : 0,
          entries: [{ val: newVal ? 1 : 0, date: new Date().toLocaleDateString() }]
        })
        .select()
        .single();
      if (!error && data) {
        setManualHours(prev => [...prev, data]);
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

  const handleShareFromHistory = async () => {
    if (!selectedLesson?.student_name) return;
    const studentName = selectedLesson.student_name;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: existingToken } = await supabase
        .from('student_share_tokens')
        .select('token')
        .eq('student_name', studentName)
        .eq('user_id', session.user.id)
        .eq('active', true)
        .maybeSingle();
      
      let token = existingToken?.token;
      if (!token) {
        const { data: newToken, error: insertError } = await supabase
          .from('student_share_tokens')
          .insert({ 
            student_name: studentName, 
            user_id: session.user.id, 
            active: true 
          })
          .select('token')
          .single();
        if (insertError) throw insertError;
        token = newToken.token;
      }
      
      const shareUrl = `${window.location.origin}/view/${token}`;
      setShareModalData({ url: shareUrl, studentName: studentName });
    } catch (err: any) {
      console.error('Share error:', err);
      window.alert('Failed to share: ' + err.message);
    }
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
            to="/dashboard"
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
    <div className="flex h-full w-full bg-[#f8fafc] relative overflow-hidden">
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
          "fixed md:relative top-0 bottom-0 left-0 z-50 bg-[var(--bg-secondary)] border-r border-[#dde3ec] flex flex-col transition-all duration-300 ease-in-out shadow-sm overflow-hidden",
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
                    {studentStats?.sGrades} Passing Grades
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#1a3a5c] rounded-lg">
                  <HistoryIcon size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-black tracking-tight text-[#1a3a5c] uppercase">Student Progress</h1>
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
                    {groundGrades.s > 0 && <span className="bg-[#f0fdf4] text-[#166534] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#bbf7d0]">{groundGrades.s} 3-4</span>}
                    {groundGrades.n > 0 && <span className="bg-[#fef2f2] text-[#991b1b] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#fecaca]">{groundGrades.n} 1-2</span>}
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
                    {flightGrades.s > 0 && <span className="bg-[#f0fdf4] text-[#166534] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#bbf7d0]">{flightGrades.s} 3-4</span>}
                    {flightGrades.n > 0 && <span className="bg-[#fef2f2] text-[#991b1b] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#fecaca]">{flightGrades.n} 1-2</span>}
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

                {/* Archived Lessons Section */}
                <div className="mt-8 border-t border-[#dde3ec]">
                  <button 
                    onClick={() => setArchivedExpanded(!archivedExpanded)}
                    className="w-full px-4 py-3 flex justify-between items-center hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Archive size={14} className="text-[#6b7280]" />
                      <span className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest">Archived Lessons ({archivedLessons.length})</span>
                    </div>
                    <ChevronRight size={14} className={cn("text-[#6b7280] transition-transform", archivedExpanded && "rotate-90")} />
                  </button>
                  <AnimatePresence>
                    {archivedExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden divide-y divide-[#f1f5f9] bg-[#f8fafc]"
                      >
                        {archivedLessons.length === 0 ? (
                          <div className="p-6 text-center text-[11px] text-[#94a3b8] italic">No archived lessons.</div>
                        ) : (
                          archivedLessons.map(l => (
                            <div key={l.id} className="p-3 pl-6 group">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-[#64748b]">{l.label}</span>
                                <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleRestoreLesson(l.id)}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Restore lesson"
                                  >
                                    <RotateCcw size={14} />
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDeleteLesson(l.id, l.label)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Permanently delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <div className="text-[10px] text-[#94a3b8]">
                                Archived on {l.deleted_at ? formatDate(l.deleted_at) : '—'}
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-[var(--bg-primary)] p-3 sm:p-8 overflow-y-auto">
        {!selectedLesson ? (
          <div className="h-full flex flex-col items-center justify-center text-[#6b7280]">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <HistoryIcon size={48} className="opacity-20" />
            </div>
            <h3 className="text-xl font-black text-[#1a3a5c] tracking-tight mb-2">Select a lesson</h3>
            <p className="text-sm text-[#94a3b8] max-w-[240px] text-center leading-relaxed">
              Choose a lesson from the sidebar to view detailed performance metrics and student progress.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-[var(--bg-secondary)] rounded-3xl shadow-2xl shadow-[#1a3a5c]/10 border border-[#dde3ec] border-t-white border-t-2 overflow-hidden flex flex-col h-full relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
              <div className="p-4 sm:p-8 relative">
                {/* Print-only logo */}
                <div className="hidden print:block absolute top-8 right-8">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 900,
                      color: '#1a3a5c',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      letterSpacing: '-1px',
                      lineHeight: 1,
                    }}>61</span>
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      width: '100%',
                      height: '3px',
                      backgroundColor: '#e8a020',
                      borderRadius: '1.5px',
                    }} />
                  </div>
                </div>
                <div className="flex flex-col gap-5 mb-8">
                  {/* Action Buttons Row */}
                  <div className="flex justify-end gap-3 order-1">
                    {activeTab === 'lesson' && selectedLesson && (
                      <button
                        onClick={handleShareFromHistory}
                        className="bg-white text-[#1a3a5c] border border-[#dde3ec] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#f8fafc] transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Share2 size={14} />
                        <span>Share</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleEditLesson(selectedLesson)}
                      className="bg-white text-[#1a3a5c] border border-[#dde3ec] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#f8fafc] transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Edit size={14} />
                      Edit Lesson
                    </button>
                  </div>

                  {/* Tabs Row */}
                  <div className="flex bg-[#f8fafc] rounded-2xl p-1.5 border border-[#e2e8f0] w-full overflow-x-auto order-2">
                    <button
                      onClick={() => setActiveTab('lesson')}
                      className={cn(
                        "px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center",
                        activeTab === 'lesson' 
                          ? "bg-[#1a3a5c] text-white shadow-md shadow-[#1a3a5c]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a3a5c]/30 active:translate-y-0 active:shadow-sm" 
                          : "text-[#64748b] hover:text-[#1a3a5c] hover:-translate-y-0.5"
                      )}
                    >
                      <BookOpen size={14} />
                      This Lesson
                    </button>
                    <button
                      onClick={() => setActiveTab('cumulative')}
                      className={cn(
                        "px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center",
                        activeTab === 'cumulative' 
                          ? "bg-[#1a3a5c] text-white shadow-md shadow-[#1a3a5c]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a3a5c]/30 active:translate-y-0 active:shadow-sm" 
                          : "text-[#64748b] hover:text-[#1a3a5c] hover:-translate-y-0.5"
                      )}
                    >
                      <BarChart3 size={14} />
                      Cumulative
                    </button>
                    <button
                      onClick={() => setActiveTab('checkride')}
                      className={cn(
                        "px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center",
                        activeTab === 'checkride' 
                          ? "bg-[#1a3a5c] text-white shadow-md shadow-[#1a3a5c]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a3a5c]/30 active:translate-y-0 active:shadow-sm" 
                          : "text-[#64748b] hover:text-[#1a3a5c] hover:-translate-y-0.5"
                      )}
                    >
                      <CheckCircle2 size={14} />
                      Checkride
                    </button>
                    <button
                      onClick={() => setActiveTab('endorsements')}
                      className={cn(
                        "px-3 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center",
                        activeTab === 'endorsements' 
                          ? "bg-[#1a3a5c] text-white shadow-md shadow-[#1a3a5c]/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a3a5c]/30 active:translate-y-0 active:shadow-sm" 
                          : "text-[#64748b] hover:text-[#1a3a5c] hover:-translate-y-0.5"
                      )}
                    >
                      <MapPin size={14} />
                      Endorsements
                    </button>
                    <button
                      onClick={() => navigate(`/student/${studentName}`)}
                      className="px-3 sm:px-5 py-2 rounded-xl text-xs font-bold text-[#64748b] hover:text-[#1a3a5c] transition-all flex items-center gap-2 whitespace-nowrap flex-1 justify-center"
                    >
                      <BarChart3 size={14} />
                      Analytics
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
                  {selectedLesson.meta?.overallGrade === 'N' && (
                    <>
                      <br />
                      <span className="text-[11px] text-[#6b7280] font-medium">Lesson outcome: needs further work</span>
                    </>
                  )}
                </p>

                <div className="space-y-3">
                  {selectedLesson.meta?.overallGrade === 'S' && (
                    <div className={cn(
                      "col-span-2 flex items-center justify-between p-4 rounded-xl border-2 transition-all bg-[#f0fdf4] border-[#2d7a4f] text-[#166534] shadow-sm"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#2d7a4f]">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Overall Assessment</p>
                          <p className="text-lg font-black">Satisfactory</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Section 61.39</div>
                    </div>
                  )}

                  {!selectedLesson.meta?.overallGrade && (
                    <div className="col-span-2 bg-[#f8fafc] border border-[#dde3ec] p-4 rounded-xl text-center">
                      <p className="text-xs font-bold text-[#64748b]">No overall grade recorded</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-[#dde3ec] p-3 shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Satisfactory</div>
                    <div className="text-xl font-mono font-bold text-[#2d7a4f]">{Object.values(selectedLesson.grades || {}).filter(v => ['S', '3', '4'].includes(v as string)).length || '—'}</div>
                    <div className="text-[9px] text-[#6b7280] mt-1">tasks</div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#dde3ec] p-3 shadow-sm text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Needs Impr.</div>
                    <div className="text-xl font-mono font-bold text-[#c0392b]">{Object.values(selectedLesson.grades || {}).filter(v => ['N', '1', '2'].includes(v as string)).length || '—'}</div>
                    <div className="text-[9px] text-[#6b7280] mt-1">tasks</div>
                  </div>
                </div>
              </div>

                {selectedLesson.meta?.notes && (
                  <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                    <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec]">Lesson Notes</div>
                    <div className="p-4 text-sm text-[#1c2333] leading-relaxed whitespace-pre-wrap">{selectedLesson.meta.notes}</div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <button
                    onClick={() => setIsFlightLogOpen(!isFlightLogOpen)}
                    className="w-full bg-[var(--bg-tertiary)] px-4 py-3 flex items-center justify-between hover:bg-[#ebedf0] transition-all border-b border-[#dde3ec]"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#6b7280]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                        {selectedLesson.label || 'Flight Time Log'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isFlightLogOpen && selectedLesson.meta?.totalFlight && (
                        <span className="text-[10px] font-bold font-mono text-[#1a3a5c] bg-white px-2 py-0.5 rounded border border-[#dde3ec]">
                          {selectedLesson.meta.totalFlight} hrs
                        </span>
                      )}
                      <ChevronRight 
                        size={14} 
                        className={cn("text-[#6b7280] transition-transform duration-200", isFlightLogOpen && "rotate-90")} 
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isFlightLogOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
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
                                ['XC (Total)', (parseFloat(selectedLesson.meta?.xcDual || '0') + parseFloat(selectedLesson.meta?.xcSolo || '0') + parseFloat(selectedLesson.meta?.xcPic || '0')) > 0 ? `${(parseFloat(selectedLesson.meta?.xcDual || '0') + parseFloat(selectedLesson.meta?.xcSolo || '0') + parseFloat(selectedLesson.meta?.xcPic || '0')).toFixed(1)}h` : ''],
                                ['XC Dual', selectedLesson.meta?.xcDual ? `${selectedLesson.meta.xcDual}h` : ''],
                                ['XC Solo', selectedLesson.meta?.xcSolo ? `${selectedLesson.meta.xcSolo}h` : ''],
                                ['XC PIC', selectedLesson.meta?.xcPic ? `${selectedLesson.meta.xcPic}h` : ''],
                              ].filter(d => d[1]).map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <span className="text-xs text-[#64748b]">{label}</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                </div>
                              ))}
                              {selectedLesson.meta?.ratpXCTime && (
                                <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#64748b]">R-ATP XC Time</span>
                                    <span className="px-1.5 py-0.5 bg-[#f5f3ff] text-[#7c3aed] text-[9px] font-bold rounded border border-[#ddd6fe]">R-ATP</span>
                                  </div>
                                  <span className="text-sm font-bold text-[#1e293b]">{selectedLesson.meta.ratpXCTime}h</span>
                                </div>
                              )}
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
                                ['FTD Instrument', selectedLesson.meta?.ftdInst ? `${selectedLesson.meta.ftdInst}h` : ''],
                                ['FFS Instrument', selectedLesson.meta?.ffsInst ? `${selectedLesson.meta.ffsInst}h` : ''],
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
                              {(lessonRating === 'ppl' ? [
                                ['Night (Total)', selectedLesson.meta?.night ? `${selectedLesson.meta.night}h` : ''],
                                ['Night Dual', selectedLesson.meta?.nightDual ? `${selectedLesson.meta.nightDual}h` : ''],
                                ['Night PIC', selectedLesson.meta?.nightPic ? `${selectedLesson.meta.nightPic}h` : ''],
                                ['Night Takeoffs', selectedLesson.meta?.nightTakeoffs],
                                ['Night Landings', selectedLesson.meta?.ldgNight],
                              ] : [
                                ['Night (Total)', selectedLesson.meta?.night ? `${selectedLesson.meta.night}h` : ''],
                                ['Night Dual', selectedLesson.meta?.nightDual ? `${selectedLesson.meta.nightDual}h` : ''],
                                ['Night Takeoffs', selectedLesson.meta?.nightTakeoffs],
                                ['Night Landings', selectedLesson.meta?.ldgNight],
                              ]).filter(d => d[1]).map(([label, val]) => (
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

                          {/* Restricted ATP */}
                          {(selectedLesson.meta?.ratpSimInst || selectedLesson.meta?.ratpActualInst) && (
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Restricted ATP</h4>
                              <div className="space-y-1">
                                {[
                                  ['Simulated Instrument (R-ATP)', selectedLesson.meta?.ratpSimInst ? `${selectedLesson.meta.ratpSimInst}h` : ''],
                                  ['Actual Instrument (R-ATP)', selectedLesson.meta?.ratpActualInst ? `${selectedLesson.meta.ratpActualInst}h` : ''],
                                ].filter(d => d[1]).map(([label, val]) => (
                                  <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                    <span className="text-xs text-[#64748b]">{label}</span>
                                    <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Approaches and Holds */}
                          {(selectedLesson.meta?.approachCount || selectedLesson.meta?.holdPerformed || (selectedLesson.meta?.approachTypes && selectedLesson.meta.approachTypes !== '[]')) && (
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Approaches and Holds</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                                  <span className="text-xs text-[#64748b]">Number of Approaches</span>
                                  <span className="text-sm font-bold text-[#1e293b]">{selectedLesson.meta?.approachCount || '0'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                                  <span className="text-xs text-[#64748b]">Holding Performed</span>
                                  {selectedLesson.meta?.holdPerformed ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#dcfce7] text-[#166534] text-[10px] font-bold rounded-full">
                                      <Check size={10} /> Performed
                                    </span>
                                  ) : (
                                    <span className="text-sm font-bold text-[#1e293b]">No</span>
                                  )}
                                </div>
                                {selectedLesson.meta?.approachTypes && selectedLesson.meta.approachTypes !== '[]' && (
                                  <div className="py-1">
                                    <span className="text-xs text-[#64748b] block mb-1.5">Approach Types</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {JSON.parse(selectedLesson.meta.approachTypes).map((type: string) => (
                                        <span key={type} className="px-2 py-0.5 bg-[#f1f5f9] text-[#475569] text-[10px] font-bold rounded-md border border-[#e2e8f0]">
                                          {type}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Other Details */}
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Other Details</h4>
                            <div className="space-y-1">
                              {[
                                ['Date', selectedLesson.meta?.date],
                                ['Aircraft', selectedLesson.meta?.aircraftModel ? `${selectedLesson.meta.aircraft} — ${selectedLesson.meta.aircraftModel}` : selectedLesson.meta?.aircraft],
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <div className="bg-[#f4f5f7] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] border-b border-[#dde3ec] flex justify-between">
                    <span>ACS Grades</span>
                    <span className="font-normal opacity-60">Graded tasks only</span>
                  </div>
                  <div className="divide-y divide-[#dde3ec]">
                    {acsData.map((area, ai) => {
                      const tasksInArea = area.tasks.map((task, ti) => ({ name: task.name, id: `${ai + 1}_${ti}` }))
                        .filter(t => selectedLesson.grades?.[t.id]);
                      if (tasksInArea.length === 0) return null;

                      return (
                        <React.Fragment key={area.area}>
                          <div className="bg-[#1a3a5c] text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                            {area.area}
                          </div>
                          {tasksInArea.map(t => (
                            <div key={t.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_50px_1fr] items-start sm:items-center min-h-[34px] border-b border-[#dde3ec] last:border-0">
                              <div className="px-4 py-2 text-xs font-medium text-[#1c2333]">{t.name}</div>
                              <div className="text-center">
                                <span className={cn(
                                  "inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold font-mono text-white mx-4 sm:mx-auto my-1 sm:my-0",
                                  selectedLesson.grades[t.id] === '4' ? "bg-[#2d7a4f]" :
                                  selectedLesson.grades[t.id] === '3' ? "bg-[#5a9e6f]" :
                                  selectedLesson.grades[t.id] === '2' ? "bg-[#e8a020]" :
                                  selectedLesson.grades[t.id] === '1' ? "bg-[#c0392b]" :
                                  selectedLesson.grades[t.id] === 'S' ? "bg-[#2d7a4f]" :
                                  selectedLesson.grades[t.id] === 'N' ? "bg-[#c0392b]" : ""
                                )}>
                                  {(selectedLesson.grades[t.id] as any) === 'I' ? '' : selectedLesson.grades[t.id]}
                                </span>
                              </div>
                              <div className="px-4 py-1 sm:py-2 text-[11px] text-[#6b7280] italic">{selectedLesson.notes?.[t.id] || ''}</div>
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">
                      Cumulative — {selectedLesson.student_name}
                    </div>
                    {(() => {
                      const lessonsWithGrade = studentLessons.filter(l => l.meta?.overallGrade);
                      if (lessonsWithGrade.length === 0) return null;
                      const sCount = lessonsWithGrade.filter(l => l.meta?.overallGrade === 'S').length;
                      return (
                        <div className="text-[11px] text-[#64748b] mt-1 font-medium italic">
                          {sCount} of {lessonsWithGrade.length} lessons rated S ({Math.round((sCount / lessonsWithGrade.length) * 100)}% pass rate)
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStudentExport(true)}
                      className="bg-[#fef3c7] hover:bg-[#fef3c7]/80 text-[#d97706] border border-amber-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Download size={14} style={{ color: '#d97706' }} />
                      Export Unsynced Lessons
                    </button>
                    <button
                      onClick={() => handleStudentExport(false)}
                      className="bg-[#dbeafe] hover:bg-[#dbeafe]/80 text-[#2563eb] border border-blue-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Download size={14} style={{ color: '#2563eb' }} />
                      Export Full Logbook
                    </button>
                    <button
                      onClick={() => setShowHowTo(true)}
                      className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all shadow-sm"
                    >
                      <HelpCircle size={14} />
                      How To
                    </button>
                  </div>

                  {showExportConfirm && (
                    <div className="w-full bg-amber-50 border border-amber-300 rounded-xl p-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-3">
                          <p className="text-xs text-amber-900 leading-relaxed font-medium">
                            Only confirm after verifying your upload was successful in your logbook app. MyFlightbook, ForeFlight, and most electronic logbooks accept this CSV format. Confirming early will mark these flights as synced and hide them from future Unsynced exports.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={confirmStudentExport}
                              disabled={exportLoading}
                              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 transition-all shadow-sm"
                            >
                              {exportLoading ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={14} />
                              )}
                              Yes, confirm upload
                            </button>
                            <button
                              onClick={() => {
                                setShowExportConfirm(false);
                                setPendingExportLessonIds([]);
                              }}
                              className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <button
                    onClick={() => setIsACSCoverageOpen(!isACSCoverageOpen)}
                    className="w-full bg-[#f4f5f7] px-4 py-3 flex items-center justify-between hover:bg-[#ebedf0] transition-all border-b border-[#dde3ec]"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#6b7280]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                        ACS Coverage — All Lessons
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isACSCoverageOpen && (
                        <span className="text-[10px] font-bold text-[#2a5a8c] bg-white px-2 py-0.5 rounded border border-[#dde3ec]">
                          {(() => {
                            const totalTasks = acsData.reduce((sum, area) => {
                              const tasks = area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'));
                              return sum + tasks.length;
                            }, 0);
                            const totalSat = acsData.reduce((sum, area, ai) => {
                              const tasks = area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'));
                              const sat = tasks.filter((_, ti) => isPassingGrade(getMostRecentGrade(studentLessons, `${ai + 1}_${ti}`))).length;
                              return sum + sat;
                            }, 0);
                            return totalTasks > 0 ? Math.round((totalSat / totalTasks) * 100) : 0;
                          })()}% Complete
                        </span>
                      )}
                      <ChevronRight 
                        size={14} 
                        className={cn("text-[#6b7280] transition-transform duration-200", isACSCoverageOpen && "rotate-90")} 
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isACSCoverageOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          <div className="space-y-3">
                            {acsData.map((area, ai) => {
                              const tasks = area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'));
                              if (tasks.length === 0) return null;
                              const sat = tasks.filter((_, ti) => isPassingGrade(getMostRecentGrade(studentLessons, `${ai + 1}_${ti}`))).length;
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

                          <div className="pt-2">
                            <button
                              onClick={() => setShowFullTaskList(!showFullTaskList)}
                              className="w-full py-2 px-4 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#475569] transition-colors flex items-center justify-center gap-2"
                            >
                              {showFullTaskList ? 'Hide Full Task List' : 'Show Full Task List'}
                            </button>
                          </div>

                          <AnimatePresence>
                            {showFullTaskList && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 border-t border-[#f1f5f9] space-y-6">
                                  {/* Legend */}
                                  <div className="flex flex-wrap gap-4 px-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded bg-[#2d7a4f]" />
                                      <span className="text-[10px] font-medium text-[#64748b]">Grade 4 - Exceeds ACS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded bg-[#5a9e6f]" />
                                      <span className="text-[10px] font-medium text-[#64748b]">Grade 3 - Meets ACS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded bg-[#e8a020]" />
                                      <span className="text-[10px] font-medium text-[#64748b]">Grade 2 - Below ACS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded bg-[#c0392b]" />
                                      <span className="text-[10px] font-medium text-[#64748b]">Grade 1 - Unsatisfactory</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded bg-[#94a3b8]" />
                                      <span className="text-[10px] font-medium text-[#64748b]">Not Yet Covered</span>
                                    </div>
                                  </div>

                                  {acsData.map((area, ai) => {
                                    const tasks = area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'));
                                    if (tasks.length === 0) return null;
                                    return (
                                      <div key={area.area} className="space-y-2">
                                        <div className="text-[10px] font-bold text-[#1a3a5c] uppercase tracking-wider opacity-60">
                                          {area.area}
                                        </div>
                                        <div className="space-y-1">
                                          {tasks.map((task, ti) => {
                                            const info = getMostRecentGradeInfo(studentLessons, `${ai + 1}_${ti}`);
                                            return (
                                              <div key={task.name} className="flex justify-between items-start py-2 border-b border-[#f1f5f9] last:border-0 gap-4">
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-xs text-[#1e293b] font-medium leading-tight">{task.name}</div>
                                                  {info?.date && (
                                                    <div className="text-[10px] text-[#64748b] mt-0.5">
                                                      Last graded: {new Date(info.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                  )}
                                                </div>
                                                <span className={cn(
                                                  "inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-bold font-mono text-white shrink-0 min-w-[24px]",
                                                  info?.grade === '4' ? "bg-[#2d7a4f]" :
                                                  info?.grade === '3' ? "bg-[#5a9e6f]" :
                                                  info?.grade === '2' ? "bg-[#e8a020]" :
                                                  info?.grade === '1' ? "bg-[#c0392b]" :
                                                  info?.grade === 'S' ? "bg-[#2d7a4f]" :
                                                  info?.grade === 'N' ? "bg-[#c0392b]" : "bg-[#94a3b8]"
                                                )}>
                                                  {info?.grade || 'Not Yet Covered'}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <button
                    onClick={() => setIsHoursSummaryOpen(!isHoursSummaryOpen)}
                    className="w-full bg-[#f4f5f7] px-4 py-3 flex items-center justify-between hover:bg-[#ebedf0] transition-all border-b border-[#dde3ec]"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#6b7280]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                        Hours Summary
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isHoursSummaryOpen && (
                        <span className="text-[10px] font-bold font-mono text-[#1a3a5c] bg-white px-2 py-0.5 rounded border border-[#dde3ec]">
                          {getCumulativeStats().totFlight.toFixed(1)} hrs total
                        </span>
                      )}
                      <ChevronRight 
                        size={14} 
                        className={cn("text-[#6b7280] transition-transform duration-200", isHoursSummaryOpen && "rotate-90")} 
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isHoursSummaryOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
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
                                    {(() => {
                                      const xcTotal = stats.totXcDual + stats.totXcSolo + stats.totXcPic + stats.totRatpXC;
                                      return (
                                        <>
                                          <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                                            <span className="text-xs text-[#64748b]">XC (Total)</span>
                                            <span className="text-sm font-bold text-[#1e293b]">{xcTotal.toFixed(1)}h</span>
                                          </div>
                                          <div className="text-[9px] text-[#94a3b8] mb-2">Includes regular XC and R-ATP XC combined.</div>
                                          {[
                                            ['XC Dual', `${stats.totXcDual.toFixed(1)}h`],
                                            ['XC Solo', `${stats.totXcSolo.toFixed(1)}h`],
                                            ['XC PIC', `${stats.totXcPic.toFixed(1)}h`],
                                          ].map(([label, val]) => (
                                            <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                              <span className="text-xs text-[#64748b]">{label}</span>
                                              <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                            </div>
                                          ))}
                                        </>
                                      );
                                    })()}
                                    <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-[#1e293b] font-bold">R-ATP XC</span>
                                      </div>
                                      <span className="text-sm font-bold text-[#1e293b]">{stats.totRatpXC.toFixed(1)}h</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-[#1a3a5c] font-bold">Total XC for IACRA</span>
                                        <div className="group relative">
                                          <HelpCircle size={10} className="text-[#1a3a5c] cursor-help" />
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1e293b] text-white text-[9px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            Combined total of regular cross country and R-ATP eligible cross country time, ensuring no double counting.
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-sm font-bold text-[#1a3a5c]">{stats.totIacraXC.toFixed(1)}h</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Instrument</h4>
                                  <div className="space-y-1">
                                    {[
                                      ['Instrument (Total)', `${stats.totSim.toFixed(1)}h`],
                                      ['ATD Instrument', `${stats.totAtdInst.toFixed(1)}h`],
                                      ['FTD Instrument', `${stats.totFtdInst.toFixed(1)}h`],
                                      ['FFS Instrument', `${stats.totFfsInst.toFixed(1)}h`],
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
                                    {(lessonRating === 'ppl' ? [
                                      ['Night (Total)', `${stats.totNight.toFixed(1)}h`],
                                      ['Night Dual', `${stats.totNightDual.toFixed(1)}h`],
                                      ['Night PIC', `${stats.totNightPic.toFixed(1)}h`],
                                      ['Night Takeoffs', stats.totNightTakeoffs],
                                      ['Night Landings', stats.totNightLdg],
                                    ] : [
                                      ['Night (Total)', `${stats.totNight.toFixed(1)}h`],
                                      ['Night Dual', `${stats.totNightDual.toFixed(1)}h`],
                                      ['Night Takeoffs', stats.totNightTakeoffs],
                                      ['Night Landings', stats.totNightLdg],
                                    ]).map(([label, val]) => (
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
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Restricted ATP</h4>
                                  <div className="space-y-1">
                                    {[
                                      ['Simulated Instrument (R-ATP)', `${stats.totRatpSimInst.toFixed(1)}h`],
                                      ['Actual Instrument (R-ATP)', `${stats.totRatpActualInst.toFixed(1)}h`],
                                    ].map(([label, val]) => (
                                      <div key={label} className="flex justify-between items-center py-1 border-b border-[#f1f5f9] last:border-0">
                                        <span className="text-xs text-[#64748b]">{label}</span>
                                        <span className="text-sm font-bold text-[#1e293b]">{val}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-2">Approaches and Holds</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                                      <span className="text-xs text-[#64748b]">Total Approaches</span>
                                      <span className="text-sm font-bold text-[#1e293b]">{stats.totApproachCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-[#f1f5f9]">
                                      <span className="text-xs text-[#64748b]">Lessons with Holding</span>
                                      <span className="text-sm font-bold text-[#1e293b]">{stats.totHoldPerformed}</span>
                                    </div>
                                    {Object.keys(stats.approachTypesFreq).length > 0 && (
                                      <div className="py-1">
                                        <span className="text-xs text-[#64748b] block mb-1.5">Approach Type Frequency</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {Object.entries(stats.approachTypesFreq)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([type, count]) => (
                                              <span key={type} className="px-2 py-0.5 bg-[#f1f5f9] text-[#475569] text-[10px] font-bold rounded-md border border-[#e2e8f0]">
                                                {type}: {count}
                                              </span>
                                            ))}
                                        </div>
                                      </div>
                                    )}
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                  <div className="bg-[#f4f5f7] px-4 py-2 border-b border-[#dde3ec]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Current Needs-Improvement Grades</div>
                    <div className="text-[9px] text-[#94a3b8] font-medium">Only showing tasks where the most recent grade is below standard (N, 1, or 2). Tasks improved to 3 or 4 are removed automatically.</div>
                  </div>
                  <div className="p-4 space-y-2">
                    {(() => {
                      const niGrades: any[] = [];

                      acsData.forEach((area, ai) => {
                        area.tasks
                          .filter(task =>
                            !task.name.includes('N/A') &&
                            !task.name.includes('ASEL') &&
                            !task.name.includes('Seaplane') &&
                            !task.name.includes('Water')
                          )
                          .forEach((task, ti) => {
                            const taskId = `${ai + 1}_${ti}`;
                            const mostRecentGrade = getMostRecentGrade(studentLessons, taskId);
                       
                            if (['N', '1', '2'].includes(mostRecentGrade || '')) {
                              // Find the most recent lesson where this task was graded N, 1, or 2
                              const mostRecentNLesson = [...studentLessons]
                                .filter(l => l.grades && ['N', '1', '2'].includes(l.grades[taskId] || ''))
                                .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime())[0];
                       
                              if (mostRecentNLesson) {
                                niGrades.push({
                                  task,
                                  area: area.area,
                                  grade: mostRecentNLesson.grades[taskId],
                                  lesson: mostRecentNLesson.label,
                                  date: new Date(mostRecentNLesson.saved_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  }),
                                  notes: mostRecentNLesson.notes?.[taskId] || ''
                                });
                              }
                            }
                          });
                      });

                      if (niGrades.length === 0) return <div className="text-sm text-[#6b7280] italic">No below-standard grades.</div>;

                      return niGrades.map((g, idx) => (
                        <div key={idx} className="flex flex-col gap-1 py-2 border-b border-[#dde3ec] last:border-0">
                          <div className="flex gap-3">
                            <span className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded h-fit whitespace-nowrap text-white",
                              g.grade === '1' ? "bg-[#c0392b]" : g.grade === '2' ? "bg-[#e8a020]" : "bg-[#c0392b]"
                            )}>
                              {g.grade} · {g.lesson} · {g.date}
                            </span>
                            <span className="text-xs">
                              <strong className="text-[#1c2333]">{g.task.name}</strong> <span className="text-[#6b7280]">({g.area})</span>
                            </span>
                          </div>
                          {g.notes && (
                            <div className="ml-[70px] text-[11px] text-[#64748b] italic leading-relaxed">
                              "{g.notes}"
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'endorsements' && (
              <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-xl overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-[#1a3a5c] px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl text-white">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white tracking-tight">Endorsement Manager</h1>
                      <p className="text-xs text-white/70">AC 61-65K Appendix A</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <EndorsementAdvisor 
                    studentName={studentName} 
                    ratingCode={lessonRating.startsWith('mei') ? 'mei' : lessonRating.startsWith('cfii') ? 'cfii' : lessonRating} 
                  />
                </div>
              </div>
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
                        { label: 'Cross-country PIC', ref: '§61.129(a)(3)(ii)', have: stats.totXcPic, need: 50, unit: 'hrs' },
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
                      { key: 'A.1', text: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii)' },
                      { key: 'A.2', text: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required' },
                      { key: 'A.38', text: 'A.38 — Aeronautical knowledge test: 14 CFR §§ 61.35(a)(1), 61.123(c), and 61.125' },
                      { key: 'A.39', text: 'A.39 — Flight proficiency/practical test: 14 CFR §§ 61.123(e), 61.127, and 61.129' },
                      { key: 'A.77', text: 'A.77 — Retesting after failure of a knowledge or practical test: 14 CFR § 61.49' }
                    ];
                    SOLO_OPTIONS = [
                      {
                        id: '1',
                        label: 'Section 1 — Knowledge Test',
                        description: 'Required before the FAA Commercial Pilot knowledge test.',
                        endorsements: [ENDORSEMENTS[2]]
                      },
                      {
                        id: '2',
                        label: 'Section 2 — Practical Test Prerequisites',
                        description: 'Required before the FAA Commercial Pilot practical test.',
                        endorsements: [ENDORSEMENTS[0], ENDORSEMENTS[1]]
                      },
                      {
                        id: '3',
                        label: 'Section 3 — Practical Test Endorsement',
                        description: 'Required before the FAA Commercial Pilot practical test with a DPE.',
                        endorsements: [ENDORSEMENTS[3]]
                      },
                      {
                        id: '4',
                        label: 'Section 4 — Retesting After Failure',
                        description: 'Required if the student fails any knowledge or practical test.',
                        endorsements: [ENDORSEMENTS[4]]
                      }
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
                      { section: 'Flight Time Requirements', ref: '§61.183 + §61.187(b)(7) + §61.191', rows: [
                        { label: 'Commercial Pilot certificate with appropriate category and class rating held', ref: '§61.183(c)(1)', have: getManualValue('commercialHeld'), need: 1, unit: 'cert', mk: 'commercialHeld', checkbox: true },
                        { label: 'Instrument rating held on pilot certificate', ref: '§61.183(c)(2)', have: getManualValue('instrumentHeld'), need: 1, unit: 'rating', mk: 'instrumentHeld', checkbox: true },
                        { label: 'CFI certificate held (required for add-on)', ref: '§61.191', have: getManualValue('cfiHeld'), need: 1, unit: 'cert', mk: 'cfiHeld', checkbox: true },
                        { 
                          label: 'PIC in airplane category', 
                          ref: '§61.183(j)', 
                          have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.aselPic || '0') || 0) + (parseFloat(l.meta?.amelPic || '0') || 0), 0), 
                          need: 15, 
                          unit: 'hrs' 
                        },
                        { label: 'Instrument currency under §61.57(c)', ref: '§61.187(b)', have: getManualValue('instRecent'), need: 1, unit: 'current', mk: 'instRecent', checkbox: true },
                        { 
                          label: 'Practical test prep dual within preceding 2 calendar months', 
                          ref: '§61.39(a)(6)(i)', 
                          have: recentDual, 
                          need: 3, 
                          unit: 'hrs', 
                          note: sixtyDaysStr 
                        },
                        { label: 'Logbook endorsement on §61.187(b)(7) areas of operation for instrument', ref: '§61.183(g)', have: getManualValue('cfiiAreasEndorsement'), need: 1, unit: 'endorsement', mk: 'cfiiAreasEndorsement', checkbox: true }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.1', label: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii). I certify that [First name, MI, Last name] has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of Flight Instructor Instrument Add-On.' },
                      { key: 'A.2', label: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required. I certify that [First name, MI, Last name] has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the airman knowledge test.' },
                      { key: 'A.48', label: 'A.48 — Flight instructor certificate with instrument–(category/class) rating/practical test: 14 CFR §§ 61.183(g) and 61.187(a) and (b)(7). I certify that [First name, MI, Last name] has received the required certificated flight instructor - instrument training of 14 CFR § 61.187(b)(7). I have determined they are prepared for the certificated flight instructor - instrument–airplane practical test.' },
                      { key: 'A.77', label: 'A.77 — Retesting after failure of a knowledge or practical test: 14 CFR § 61.49. I certify that [First name, MI, Last name] has received the additional [flight and/or ground, as appropriate] training as required by 14 CFR § 61.49. I have determined that they are proficient to pass the [name of] knowledge/practical test.' }
                    ];
                    SOLO_OPTIONS = [
                      {
                        id: '1',
                        label: 'Section 1 — Practical Test Prerequisites',
                        description: 'Required before the FAA Flight Instructor Instrument Add-On practical test.',
                        endorsements: [ENDORSEMENTS[0], ENDORSEMENTS[1]]
                      },
                      {
                        id: '2',
                        label: 'Section 2 — Practical Test Endorsement',
                        description: 'Required before the FAA Flight Instructor Instrument Add-On practical test with a DPE.',
                        endorsements: [ENDORSEMENTS[2]]
                      },
                      {
                        id: '3',
                        label: 'Section 3 — Retesting After Failure',
                        description: 'Required only if the applicant fails a knowledge or practical test and needs to retake it.',
                        endorsements: [ENDORSEMENTS[3]]
                      }
                    ];
                  } else if (['mei', 'mei_addon', 'mei_initial'].includes(lessonRating)) {
                    REQS = [
                      { section: 'Flight Time Requirements', ref: '§61.183 + §61.191', rows: [
                        { label: 'Commercial Pilot certificate with AMEL class rating held', ref: '§61.183(c)(1)', have: getManualValue('commercialAMELHeld'), need: 1, unit: 'cert', mk: 'commercialAMELHeld', checkbox: true },
                        { label: 'Instrument rating held', ref: '§61.183(c)(2)(ii)', have: getManualValue('instrumentHeld'), need: 1, unit: 'rating', mk: 'instrumentHeld', checkbox: true },
                        { label: 'CFI certificate held (required for add-on)', ref: '§61.191', have: getManualValue('cfiHeld'), need: 1, unit: 'cert', mk: 'cfiHeld', checkbox: true },
                        { 
                          label: 'PIC in multiengine airplane', 
                          ref: '§61.183(j)', 
                          have: sls.reduce((sum, l) => sum + (parseFloat(l.meta?.amelPic || '0') || 0), 0), 
                          need: 15, 
                          unit: 'hrs' 
                        },
                        { 
                          label: 'Practical test prep dual within preceding 2 calendar months', 
                          ref: '§61.39(a)(6)(i)', 
                          have: recentDual, 
                          need: 3, 
                          unit: 'hrs', 
                          note: sixtyDaysStr 
                        },
                        { label: 'Logbook endorsement on §61.187(b) areas of operation for multiengine', ref: '§61.183(g)', have: getManualValue('meiAreasEndorsement'), need: 1, unit: 'endorsement', mk: 'meiAreasEndorsement', checkbox: true }
                      ]}
                    ];
                    ENDORSEMENTS = [
                      { key: 'A.1', label: 'A.1 — Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii). I certify that [First name, MI, Last name] has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of Flight Instructor Multiengine Add-On.' },
                      { key: 'A.2', label: 'A.2 — Review of deficiencies identified on airman knowledge test: 14 CFR § 61.39(a)(6)(iii), as required. I certify that [First name, MI, Last name] has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the airman knowledge test.' },
                      { key: 'A.47', label: 'A.47 — Flight instructor ground and flight proficiency/practical test: 14 CFR § 61.183(g). I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.183(g) for the multiengine instructor rating. I have determined they are prepared for the Flight Instructor Multiengine Add-On practical test.' },
                      { key: 'A.77', label: 'A.77 — Retesting after failure of a knowledge or practical test: 14 CFR § 61.49. I certify that [First name, MI, Last name] has received the additional [flight and/or ground, as appropriate] training as required by 14 CFR § 61.49. I have determined that they are proficient to pass the [name of] knowledge/practical test.' }
                    ];
                    SOLO_OPTIONS = [
                      {
                        id: '1',
                        label: 'Section 1 — Practical Test Prerequisites',
                        description: 'Required before the FAA Flight Instructor Multiengine Add-On practical test.',
                        endorsements: [ENDORSEMENTS[0], ENDORSEMENTS[1]]
                      },
                      {
                        id: '2',
                        label: 'Section 2 — Practical Test Endorsement',
                        description: 'Required before the FAA Flight Instructor Multiengine Add-On practical test with a DPE.',
                        endorsements: [ENDORSEMENTS[2]]
                      },
                      {
                        id: '3',
                        label: 'Section 3 — Retesting After Failure',
                        description: 'Required only if the applicant fails a knowledge or practical test and needs to retake it.',
                        endorsements: [ENDORSEMENTS[3]]
                      }
                    ];
                  }

                  const allRows = REQS.flatMap(r => r.rows);
                  const metCount = allRows.filter(r => r.have >= r.need).length;
                  const endorsementsMet = ENDORSEMENTS.filter(e => isEndorsementMet(e.key)).length;

                  const allAcsMet = acsData.every((area, ai) => {
                    const tasks = area.tasks.filter(t => 
                      !t.name.includes('N/A') && 
                      !t.name.includes('ASEL') && 
                      !t.name.includes('Seaplane') && 
                      !t.name.includes('Water')
                    );
                    return tasks.every((_, ti) => isPassingGrade(getMostRecentGrade(studentLessons, `${ai + 1}_${ti}`)));
                  });
                  
                  let allMet = false;
                  if (lessonRating === 'ppl') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.37') && allAcsMet;
                  } else if (lessonRating === 'ir') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.43') && isEndorsementMet('A.44') && isEndorsementMet('A.1') && allAcsMet;
                  } else if (lessonRating === 'cpl') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.39') && allAcsMet;
                  } else if (lessonRating === 'cfi') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.47') && isEndorsementMet('A.49') && allAcsMet;
                  } else if (lessonRating === 'cfii') {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.48') && allAcsMet;
                  } else if (['mei', 'mei_addon', 'mei_initial'].includes(lessonRating)) {
                    allMet = metCount === allRows.length && isEndorsementMet('A.1') && isEndorsementMet('A.47') && allAcsMet;
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

                  const getFlightReqLabel = (ratingCode: string) => {
                    if (ratingCode === 'ppl') return 'Flight Time Requirements — §61.109(a)';
                    if (ratingCode === 'ir') return 'Flight Time Requirements — §61.65(d)';
                    if (ratingCode === 'cpl') return 'Flight Time Requirements — §61.129(a)';
                    if (ratingCode === 'cfi') return 'Flight Time Requirements — §61.183';
                    if (ratingCode === 'cfii') return 'Flight Time Requirements — §61.183 + §61.187(b)(7) + §61.191';
                    if (['mei', 'mei_addon', 'mei_initial'].includes(ratingCode)) return 'Flight Time Requirements — §61.183 + §61.191';
                    return 'Flight Time Requirements';
                  };

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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl border border-[#dde3ec] p-4 shadow-sm text-center">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Flight Requirements</div>
                          <div className={cn("text-2xl font-mono font-bold", metCount === allRows.length ? "text-[#2d7a4f]" : "text-[#e8a020]")}>{metCount}/{allRows.length}</div>
                          <div className="text-[9px] text-[#6b7280] mt-1">met</div>
                        </div>
                        <div className="bg-white rounded-xl border border-[#dde3ec] p-4 shadow-sm text-center">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">Total Time</div>
                          <div className="text-2xl font-mono font-bold text-[#1a3a5c]">{stats.totFlight.toFixed(1)}</div>
                          <div className="text-[9px] text-[#6b7280] mt-1">hours logged</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                        <button
                          onClick={() => setIsFlightReqOpen(!isFlightReqOpen)}
                          className="w-full bg-[#f4f5f7] px-4 py-3 flex items-center justify-between hover:bg-[#ebedf0] transition-all border-b border-[#dde3ec]"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-[#6b7280]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                              {getFlightReqLabel(lessonRating)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {!isFlightReqOpen && (
                              <span className="text-[10px] font-bold text-[#2a5a8c] bg-white px-2 py-0.5 rounded border border-[#dde3ec]">
                                {metCount}/{allRows.length} Met
                              </span>
                            )}
                            <ChevronRight 
                              size={14} 
                              className={cn("text-[#6b7280] transition-transform duration-200", isFlightReqOpen && "rotate-90")} 
                            />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isFlightReqOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="divide-y divide-[#dde3ec]">
                                {REQS.map(section => (
                                  <div key={section.section}>
                                    {section.rows.map(row => {
                                      const met = row.have >= row.need;
                                      const pct = Math.min(100, Math.round((row.have / row.need) * 100));

                                      if (row.checkbox) {
                                        return (
                                          <div key={row.label} className={cn("p-4 flex items-center justify-between gap-4", met && "bg-[#fafffe]")}>
                                            <div className="flex items-center gap-3">
                                              <div className="shrink-0">
                                                <span className="text-[10px] font-bold font-mono text-[#6b7280] bg-[#f4f5f7] px-1.5 py-0.5 rounded">{row.ref}</span>
                                              </div>
                                              <div className="text-[13px] font-medium text-[#1c2333] leading-tight">{row.label}</div>
                                            </div>
                                            <button 
                                              onClick={() => handleToggleChecklist(row.mk!, row.have >= 1)}
                                              className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                met ? "bg-[#2d7a4f] border-[#2d7a4f] text-white" : "border-[#dde3ec] text-transparent hover:border-[#2a5a8c]"
                                              )}
                                            >
                                              <Check size={14} strokeWidth={3} />
                                            </button>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div key={row.label} className={cn("p-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-4", met && "bg-[#fafffe]")}>
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
                                            <div className="shrink-0 w-full sm:w-auto">
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
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                            <div className="mb-2">
                              <button
                                onClick={() => navigate('/presolo-test')}
                                className="w-full flex items-center justify-between p-4 bg-[#e8a020] border border-[#e8a020] rounded-2xl shadow-sm hover:bg-[#e8a020]/90 transition-all group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center transition-colors">
                                    <FileText size={24} />
                                  </div>
                                  <div className="text-left">
                                    <h3 className="text-sm font-bold text-white">Pre-Solo Knowledge Test</h3>
                                    <p className="text-xs text-white/80">Aeronautical knowledge test required by §61.87(b)</p>
                                  </div>
                                </div>
                                <ChevronRight size={18} className="text-white transition-colors" />
                              </button>
                            </div>

                            {preSoloTestResult ? (
                              <div className="mb-6 bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                                <div className="p-4 flex items-center justify-between border-b border-[#f1f5f9]">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center",
                                      preSoloTestResult.passed ? "bg-[#f0fdf4] text-[#2d7a4f]" : "bg-[#fef2f2] text-[#991b1b]"
                                    )}>
                                      <FileText size={20} />
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-bold text-[#1e293b]">Pre-Solo Knowledge Test Result</h3>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className={cn(
                                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                          preSoloTestResult.passed ? "bg-[#2d7a4f] text-white" : "bg-[#991b1b] text-white"
                                        )}>
                                          {preSoloTestResult.passed ? 'Passed' : 'Failed'}
                                        </span>
                                        <span className="text-[10px] text-[#64748b] font-medium">
                                          Score: {preSoloTestResult.correct_answers} out of {preSoloTestResult.total_questions} — {preSoloTestResult.score}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => navigate('/presolo-test')}
                                    className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider"
                                  >
                                    Retake Test
                                  </button>
                                </div>
                                <div className="px-4 py-3 bg-[#f8fafc] grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-[8px] font-bold text-[#94a3b8] uppercase tracking-widest mb-0.5">Date Taken</div>
                                    <div className="text-[11px] font-bold text-[#1e293b]">{new Date(preSoloTestResult.date).toLocaleDateString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-[8px] font-bold text-[#94a3b8] uppercase tracking-widest mb-0.5">CFI Signed Off</div>
                                    <div className="text-[11px] font-bold text-[#1e293b]">{new Date(preSoloTestResult.cfi_signoff_date).toLocaleDateString()}</div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mb-6 px-4 py-3 bg-[#f1f5f9] rounded-xl border border-[#dde3ec] border-dashed flex items-center gap-2">
                                <Info size={14} className="text-[#64748b]" />
                                <p className="text-[10px] text-[#64748b] font-medium">
                                  No test on record. Click Pre-Solo Knowledge Test to administer the test.
                                </p>
                              </div>
                            )}

                            {/* Endorsements Summary */}
                            {(() => {
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
                                  label: section.label,
                                  endorsements: givenInSection
                                };
                              }).filter(s => s.endorsements.length > 0);

                              if (summarySections.length === 0) return (
                                <div className="p-12 text-center bg-white border border-[#dde3ec] rounded-2xl border-dashed">
                                  <div className="text-3xl mb-4 opacity-10">📜</div>
                                  <h4 className="text-sm font-bold text-[#1a3a5c] mb-1">No Endorsements Found</h4>
                                  <p className="text-xs text-[#64748b]">Go to the Endorsements tab to manage and add new logbook endorsements.</p>
                                </div>
                              );

                              return (
                                <div className="bg-white rounded-2xl border border-[#dde3ec] border-l-4 border-l-[#2d7a4f] shadow-sm overflow-hidden mb-6">
                                  <div className="px-4 py-3 border-b border-[#dde3ec] bg-[#f8fafc] flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-[#1a3a5c]">Endorsements Given</h3>
                                    <button 
                                      onClick={() => setActiveTab('endorsements')}
                                      className="text-[10px] font-bold text-[#1a3a5c] hover:underline uppercase tracking-wider"
                                    >
                                      Manage All
                                    </button>
                                  </div>
                                  <div className="p-4 space-y-4">
                                    {summarySections.map(s => (
                                      <div key={s.id} className="space-y-1">
                                        <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest ml-1">{s.label}</div>
                                        <div className="space-y-1">
                                          {s.endorsements.map(e => (
                                            <div key={e.key} className="p-3 flex items-center justify-between bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-[9px] font-bold bg-[#1a3a5c] text-white px-1.5 py-0.5 rounded shrink-0">
                                                  {e.key}
                                                </span>
                                                <span className="text-[11px] font-medium text-[#1c2333] truncate">
                                                  {e.text.length > 80 ? e.text.substring(0, 80) + '...' : e.text}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                                <span className="text-[10px] text-[#6b7280] font-medium">
                                                  {new Date(e.completed_date).toLocaleDateString()}
                                                </span>
                                                <div className="w-5 h-5 rounded-full bg-[#2d7a4f]/10 flex items-center justify-center text-[#2d7a4f]">
                                                  <Check size={12} strokeWidth={3} />
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

                            {/* Checkride Readiness Checklist (PPL Only) */}
                            {lessonRating === 'ppl' && (
                              <div className="mt-12">
                                {(() => {
                                  const allChecklistItems = CHECKLIST_PPL.flatMap(g => g.items);
                                  const checkedCount = allChecklistItems.filter(item => {
                                    if (item.auto) {
                                      if (item.key === 'checklist_ppl_endorsements') return item.auto(endorsements);
                                      if (item.key === 'checklist_ppl_recency') return item.auto({ ...stats, recentDual });
                                      return false;
                                    }
                                    return getManualValue(item.key) > 0;
                                  }).length;
                                  const totalCount = allChecklistItems.length;
                                  const progressPct = Math.round((checkedCount / totalCount) * 100);

                                  return (
                                    <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                                      <button
                                        onClick={() => setChecklistExpanded(!checklistExpanded)}
                                        className="w-full px-4 py-4 flex items-center justify-between bg-[#2d7a4f] hover:bg-[#2d7a4f]/90 transition-all"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 bg-white/20 rounded-lg text-white">
                                            <ClipboardList size={20} />
                                          </div>
                                          <div className="text-left">
                                            <h2 className="text-sm font-bold text-white tracking-tight">Checkride Readiness Checklist</h2>
                                            <p className="text-[10px] text-white/80">Verify all items before scheduling the practical test.</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                                            {checkedCount}/{totalCount}
                                          </span>
                                          <ChevronRight size={16} className={cn("text-white transition-transform", checklistExpanded && "rotate-90")} />
                                        </div>
                                      </button>

                                      <AnimatePresence>
                                        {checklistExpanded && (
                                          <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-[#dde3ec]"
                                          >
                                            <div className="p-6 space-y-6 bg-[#f8fafc]">
                                              <div className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm">
                                                <div className="flex justify-between items-end mb-2">
                                                  <span className="text-xs font-bold text-[#1a3a5c] uppercase tracking-widest">{checkedCount} of {totalCount} complete</span>
                                                  <span className="text-xs font-bold text-[#1a3a5c]">{progressPct}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-[#f4f5f7] rounded-full overflow-hidden">
                                                  <div 
                                                    className={cn("h-full rounded-full transition-all duration-500", progressPct === 100 ? "bg-[#2d7a4f]" : "bg-[#1a3a5c]")} 
                                                    style={{ width: `${progressPct}%` }} 
                                                  />
                                                </div>
                                              </div>

                                              <div className="space-y-4">
                                                {CHECKLIST_PPL.map(group => {
                                                  const groupItems = group.items;
                                                  const groupCheckedCount = groupItems.filter(item => {
                                                    if (item.auto) {
                                                      if (item.key === 'checklist_ppl_endorsements') return item.auto(endorsements);
                                                      if (item.key === 'checklist_ppl_recency') return item.auto({ ...stats, recentDual });
                                                      return false;
                                                    }
                                                    return getManualValue(item.key) > 0;
                                                  }).length;
                                                  
                                                  const isGroupComplete = groupCheckedCount === groupItems.length;
                                                  const isGroupInProgress = groupCheckedCount > 0 && !isGroupComplete;
                                                  
                                                  const headerBg = isGroupComplete ? "bg-[#2d7a4f]" : (isGroupInProgress ? "bg-[#e8a020]" : "bg-[#1a3a5c]");

                                                  return (
                                                    <div key={group.title} className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
                                                      <div className={cn("px-4 py-3 text-white text-[10px] font-bold uppercase tracking-widest", headerBg)}>
                                                        {group.title}
                                                      </div>
                                                      <div className="divide-y divide-[#dde3ec]">
                                                        {groupItems.map(item => {
                                                          const isAuto = !!item.auto;
                                                          let isChecked = false;
                                                          if (isAuto) {
                                                            if (item.key === 'checklist_ppl_endorsements') isChecked = item.auto!(endorsements);
                                                            if (item.key === 'checklist_ppl_recency') isChecked = item.auto!({ ...stats, recentDual });
                                                          } else {
                                                            isChecked = getManualValue(item.key) > 0;
                                                          }

                                                          return (
                                                            <div 
                                                              key={item.key}
                                                              onClick={() => !isAuto && handleToggleChecklist(item.key, isChecked)}
                                                              className={cn(
                                                                "min-h-[44px] px-4 py-3 flex items-start gap-4 transition-all",
                                                                !isAuto && "cursor-pointer hover:bg-[#f8fafc]",
                                                                isChecked && "bg-[#fafffe]"
                                                              )}
                                                            >
                                                              <div className="mt-0.5 shrink-0">
                                                                {isChecked ? (
                                                                  <CheckCircle2 size={18} className="text-[#2d7a4f]" />
                                                                ) : (
                                                                  <Square size={18} className="text-[#dde3ec]" />
                                                                )}
                                                              </div>
                                                              <div className="flex-1 min-w-0">
                                                                <div className={cn("text-[13px] font-medium leading-tight", isChecked ? "text-[#2d7a4f]" : "text-[#1c2333]")}>
                                                                  {item.label}
                                                                </div>
                                                                {isAuto && isChecked && (
                                                                  <div className="text-[9px] font-bold text-[#2d7a4f] mt-1 uppercase tracking-tighter">
                                                                    Auto-verified from app data
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>

                                              <div className="pt-4 space-y-3">
                                                <button
                                                  disabled={checkedCount < totalCount}
                                                  onClick={() => navigate(`/iacra/${encodeURIComponent(selectedLesson.student_name || '')}`)}
                                                  className={cn(
                                                    "w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2",
                                                    checkedCount === totalCount 
                                                      ? "bg-[#2d7a4f] text-white hover:bg-[#24633f] shadow-[#2d7a4f]/20" 
                                                      : "bg-[#dde3ec] text-[#6b7280] cursor-not-allowed"
                                                  )}
                                                >
                                                  <FileText size={18} />
                                                  Open IACRA Summary
                                                </button>
                                                {checkedCount < totalCount && (
                                                  <p className="text-[10px] text-center text-[#6b7280] font-medium">
                                                    Complete all checklist items to proceed to IACRA Summary.
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Endorsement Summary — Non-PPL */}
                            {(() => {
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
                                  label: section.label,
                                  endorsements: givenInSection
                                };
                              }).filter(s => s.endorsements.length > 0);

                              if (summarySections.length === 0) return (
                                <div className="p-12 text-center bg-white border border-[#dde3ec] rounded-2xl border-dashed">
                                  <div className="text-3xl mb-4 opacity-10">📜</div>
                                  <h4 className="text-sm font-bold text-[#1a3a5c] mb-1">No Endorsements Found</h4>
                                  <p className="text-xs text-[#64748b]">Go to the Endorsements tab to manage and add new logbook endorsements.</p>
                                </div>
                              );

                              return (
                                <div className="bg-white rounded-2xl border border-[#dde3ec] border-l-4 border-l-[#2d7a4f] shadow-sm overflow-hidden mb-6">
                                  <div className="px-4 py-3 border-b border-[#dde3ec] bg-[#f8fafc] flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-[#1a3a5c]">Endorsements Given</h3>
                                    <button 
                                      onClick={() => setActiveTab('endorsements')}
                                      className="text-[10px] font-bold text-[#1a3a5c] hover:underline uppercase tracking-wider"
                                    >
                                      Manage All
                                    </button>
                                  </div>
                                  <div className="p-4 space-y-4">
                                    {summarySections.map(s => (
                                      <div key={s.id} className="space-y-1">
                                        <div className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-widest ml-1">{s.label}</div>
                                        <div className="space-y-1">
                                          {s.endorsements.map(e => (
                                            <div key={e.key} className="p-3 flex items-center justify-between bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                                              <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-[9px] font-bold bg-[#1a3a5c] text-white px-1.5 py-0.5 rounded shrink-0">
                                                  {e.key}
                                                </span>
                                                <span className="text-[11px] font-medium text-[#1c2333] truncate">
                                                  {typeof e.text === 'string' && e.text.length > 80 ? e.text.substring(0, 80) + '...' : (e.label || (typeof e.text === 'string' ? e.text : 'Endorsement'))}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                                <span className="text-[10px] text-[#6b7280] font-medium">
                                                  {new Date(e.completed_date).toLocaleDateString()}
                                                </span>
                                                <div className="w-5 h-5 rounded-full bg-[#2d7a4f]/10 flex items-center justify-center text-[#2d7a4f]">
                                                  <Check size={12} strokeWidth={3} />
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

      {cfiHoursPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCfiHoursPrompt(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fffbeb] rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-[#d97706]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e293b]">Keep CFI Hours?</h3>
                <p className="text-[11px] text-[#64748b]">This lesson has {cfiHoursPrompt.dualTime.toFixed(1)} hours of dual instruction logged.</p>
              </div>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Would you like to keep these hours in your CFI logbook? The flight was flown regardless of whether this lesson record is {cfiHoursPrompt.isPermanent ? 'permanently deleted' : 'archived'}.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={async () => {
                  const id = cfiHoursPrompt.lessonId;
                  const label = cfiHoursPrompt.lessonLabel;
                  const isPerm = cfiHoursPrompt.isPermanent;
                  setCfiHoursPrompt(null);
                  if (isPerm) {
                    await finishPermanentDelete(id, label);
                  } else {
                    await archiveLesson(id, label);
                  }
                }}
                className="flex-1 py-2.5 bg-[#1a3a5c] text-white text-xs font-bold rounded-xl hover:bg-[#2a5a8c] transition-all"
              >
                Keep Hours
              </button>
              <button
                onClick={async () => {
                  const id = cfiHoursPrompt.lessonId;
                  const label = cfiHoursPrompt.lessonLabel;
                  const isPerm = cfiHoursPrompt.isPermanent;
                  await supabase
                    .from('cfi_hours')
                    .delete()
                    .eq('lesson_id', id);
                  setCfiHoursPrompt(null);
                  if (isPerm) {
                    await finishPermanentDelete(id, label);
                  } else {
                    await archiveLesson(id, label);
                  }
                }}
                className="flex-1 py-2.5 bg-white text-[#64748b] text-xs font-bold rounded-xl border border-[#dde3ec] hover:bg-[#f8fafc] transition-all"
              >
                Remove Hours
              </button>
            </div>
            <button
              onClick={() => setCfiHoursPrompt(null)}
              className="w-full py-2 text-[10px] text-[#94a3b8] hover:text-[#64748b] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Share Progress Modal */}
      <AnimatePresence>
        {shareModalData && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareModalData(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1a3a5c]">Share Progress</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{shareModalData.studentName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalData(null)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 text-center">
                <div className="bg-[#f8fafc] p-6 rounded-3xl inline-block border-2 border-dashed border-gray-100 mb-6">
                  <QRCodeSVG 
                    value={shareModalData.url} 
                    size={220}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <p className="text-sm font-bold text-[#1a3a5c] mb-1">Student Scan QR Code</p>
                <p className="text-xs text-gray-500 mb-8 px-6">Your student can scan this to view their progress, cumulative hours, and lesson notes.</p>

                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <span className="relative px-4 bg-white text-[10px] font-black uppercase tracking-widest text-gray-400">or</span>
                </div>

                <button
                  onClick={async () => {
                    const shareData = {
                      title: '61 Tracker — Student View',
                      text: `View your flight training progress for ${shareModalData.studentName}`,
                      url: shareModalData.url,
                    };
                    
                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {
                        console.error('Share failed:', err);
                      }
                    } else {
                      await navigator.clipboard.writeText(shareModalData.url);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }
                  }}
                  className="w-full py-4 bg-[#1a3a5c] text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  {linkCopied ? (
                    <>
                      <Check size={18} className="text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} className="text-white/50 group-hover:text-white transition-colors" />
                      <span>Send Link</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <HowToExportModal isOpen={showHowTo} onClose={() => setShowHowTo(false)} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          :root, html, body {
            font-size: 9px !important;
          }
          body {
            padding: 0.5in !important;
          }
          /* Targeting common Tailwind spacing classes used in History */
          .p-8 { padding: 1rem !important; }
          .p-6 { padding: 0.75rem !important; }
          .p-4 { padding: 0.5rem !important; }
          .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .m-8 { margin: 1rem !important; }
          .m-6 { margin: 0.75rem !important; }
          .m-4 { margin: 0.5rem !important; }
          .gap-8 { gap: 1rem !important; }
          .gap-6 { gap: 0.75rem !important; }
          .gap-4 { gap: 0.5rem !important; }
          
          /* Hide non-essential print elements */
          .print\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
