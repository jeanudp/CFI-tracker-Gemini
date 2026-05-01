import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, ManualHours, Endorsement } from '../types';
import { ALL_ACS, ACS_ELEMENTS, RATINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  History as HistoryIcon, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  Info,
  Trophy,
  Award,
  Map
} from 'lucide-react';
import { cn } from '../lib/utils';
import RouteMap from './RouteMap';

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

export default function StudentView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{ student_name: string; user_id: string } | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [manualHours, setManualHours] = useState<ManualHours[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'this-lesson' | 'cumulative' | 'checkride' | 'analytics' | 'routes'>('this-lesson');

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const studentName = studentInfo?.student_name;
  const studentLessons = studentName ? lessons.filter(l => l.student_name === studentName) : [];

  useEffect(() => {
    if (token) {
      validateAndFetch();
    }
  }, [token]);

  const validateAndFetch = async () => {
    setLoading(true);
    try {
      const { data: shareToken, error: tokenError } = await supabase
        .from('student_share_tokens')
        .select('student_name, user_id')
        .eq('token', token)
        .eq('active', true)
        .single();

      if (tokenError || !shareToken) {
        setTokenValid(false);
        return;
      }

      setTokenValid(true);
      setStudentInfo(shareToken);

      // Fetch student data
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_name', shareToken.student_name)
        .eq('user_id', shareToken.user_id)
        .is('deleted_at', null)
        .order('saved_at', { ascending: false });

      const { data: manualData } = await supabase
        .from('manual_hours')
        .select('*')
        .eq('student_name', shareToken.student_name)
        .eq('user_id', shareToken.user_id);

      const { data: endorsementsData } = await supabase
        .from('endorsements')
        .select('*')
        .eq('student_name', shareToken.student_name)
        .eq('user_id', shareToken.user_id);

      setLessons(lessonsData || []);
      setManualHours(manualData || []);
      setEndorsements(endorsementsData || []);

      if (lessonsData && lessonsData.length > 0) {
        setSelectedLessonId(lessonsData[0].id);
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
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
      totAtd, totXcDual, totXcSolo, totXcPic, totAtdInst, totNightDual, totNightPic, totNightTakeoffs, totFtd, totFfs, totAtdSE, totFtdInst, totFfsInst, 
      totRatpSimInst, totRatpActualInst, totApproachCount, totHoldPerformed, approachTypesFreq, totRatpXC, totIacraXC
    };
  };

  const stats = getCumulativeStats();
  const lessonRating = selectedLesson?.meta?.rating_code || 'ppl';
  const acsData = ALL_ACS[lessonRating] || ALL_ACS['ppl'];

  const getManualValue = (key: string) => {
    if (!studentName) return 0;
    const m = manualHours.find(h => h.student_name === studentName && h.field_key === key);
    return m ? m.total : 0;
  };

  const getManualDate = (key: string) => {
    const dateKey = key === 'nightXc100' ? 'nightXCDate' : 
                   key === 'soloXc150' ? 'soloXC150Date' : 
                   key === 'soloTowered' ? 'soloToweredDate' : 
                   key === 'ifrXc250' ? 'ifrXc250Date' : '';
    if (!dateKey) return '';
    const m = manualHours.find(h => h.student_name === studentName && h.field_key === dateKey);
    if (!m || m.entries.length === 0) return '';
    return m.entries[0].completedDate || m.entries[0].date;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

  const getMostRecentGradeInfo = (tasks: Lesson[], taskId: string) => {
    const sortedLessons = [...tasks]
      .filter(l => l.grades && l.grades[taskId])
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
    if (sortedLessons.length === 0) return null;
    return {
      grade: sortedLessons[0].grades[taskId],
      date: sortedLessons[0].saved_at
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#1a3a5c] animate-spin" />
          <p className="text-sm font-medium text-[#1a3a5c]">Validating access...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-[#dde3ec] shadow-xl p-10 w-full max-w-[450px] text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[#1c2333] mb-3">Link Not Found</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            The share link you followed is either invalid, inactive, or has expired. Please check with your CFI for a new link.
          </p>
          <a
            href="https://61tracker.com"
            className="inline-block w-full bg-[#1a3a5c] text-white font-bold py-4 rounded-xl hover:bg-[#2a5a8c] transition-all"
          >
            Go to 61 Tracker
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      {/* Read-Only Header */}
      <header className="bg-[#1a3a5c] text-white py-4 px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="text-amber-400" size={28} />
            <div>
              <h1 className="text-lg font-black tracking-tighter">61 TRACKER</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Aviation Logistics</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">
                <span className="sm:hidden">Student · View Only</span>
                <span className="hidden sm:inline">Student View — Read Only</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Student Profile & Quick Stats */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[#dde3ec] p-4 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-[#1a3a5c] tracking-tight">{studentName}'s Training Progress</h2>
                  <p className="text-[10px] sm:text-sm text-[#64748b] mt-1 font-medium italic">Shared via 61 Tracker · Read-only access</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#94a3b8] tracking-widest mb-0.5 sm:mb-1">Lessons</p>
                    <p className="text-lg sm:text-2xl font-black text-[#1a3a5c]">{studentLessons.length}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#94a3b8] tracking-widest mb-0.5 sm:mb-1">Total Hours</p>
                    <p className="text-lg sm:text-2xl font-black text-[#1a3a5c]">{stats.totFlight.toFixed(1)}</p>
                  </div>
                  <div className="text-center md:text-left hidden lg:block">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase text-[#94a3b8] tracking-widest mb-0.5 sm:mb-1">Passing Tasks</p>
                    <p className="text-lg sm:text-2xl font-black text-[#2d7a4f]">
                      {studentLessons.reduce((sum, l) => sum + Object.values(l.grades || {}).filter(g => isPassingGrade(g)).length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex sm:flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8 bg-white/50 p-1.5 rounded-2xl border border-white/50 w-full sm:w-fit backdrop-blur-sm shadow-sm overflow-x-auto scrollbar-hide shrink-0">
            {[
              { id: 'this-lesson', label: 'Lesson', fullLabel: 'This Lesson', icon: BookOpen },
              { id: 'cumulative', label: 'Stats', fullLabel: 'Cumulative', icon: HistoryIcon },
              { id: 'checkride', label: 'Checkride', fullLabel: 'Checkride', icon: CheckSquare },
              { id: 'routes', label: 'Routes', fullLabel: 'Routes', icon: Map },
              { id: 'analytics', label: 'Analytics', fullLabel: 'Analytics', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'analytics') {
                    navigate(`/student/${encodeURIComponent(studentName || '')}`);
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "bg-[#1a3a5c] text-white shadow-md"
                    : "text-[#64748b] hover:bg-white hover:text-[#1a3a5c]"
                )}
              >
                <tab.icon size={13} className="sm:w-[14px] sm:h-[14px]" />
                <span className="sm:hidden">{tab.id === 'analytics' ? tab.fullLabel : tab.label}</span>
                <span className="hidden sm:inline">{tab.fullLabel}</span>
              </button>
            ))}
          </div>

          {/* Lesson Selection Pills */}
          <div className="mb-8 sm:mb-10 sm:px-4">
            <h3 className="text-[8px] sm:text-[10px] font-black uppercase text-[#94a3b8] tracking-widest mb-3 sm:mb-4">Lesson History — Tap to view details</h3>
<div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {studentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={cn(
                    "shrink-0 px-6 py-4 rounded-2xl border text-left transition-all min-w-[180px]",
                    selectedLessonId === lesson.id
                      ? "bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-lg scale-[1.02]"
                      : "bg-white border-[#dde3ec] text-[#1a3a5c] hover:border-[#1a3a5c]/30 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                      selectedLessonId === lesson.id ? "bg-white/20 text-white" : "bg-gray-100 text-[#64748b]"
                    )}>
                      {lesson.type}
                    </span>
                    {lesson.meta?.overallGrade && (
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                        lesson.meta.overallGrade === 'S' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      )}>
                        {lesson.meta.overallGrade}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm leading-tight mb-2">{lesson.label}</div>
                  <div className={cn(
                    "text-[10px] font-medium flex items-center gap-1.5",
                    selectedLessonId === lesson.id ? "text-white/60" : "text-[#94a3b8]"
                  )}>
                    <Calendar size={10} />
                    {new Date(lesson.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence mode="wait">
              {activeTab === 'this-lesson' && selectedLesson && (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[#dde3ec] shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-8 bg-gradient-to-r from-[#1a3a5c] to-[#2a5a8c] text-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                             <div className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                               {selectedLesson.type} Lesson
                             </div>
                             {selectedLesson.meta?.rating_code && (
                               <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400">
                                 {selectedLesson.meta.rating_code.toUpperCase()}
                               </div>
                             )}
                          </div>
                          <h3 className="text-xl sm:text-3xl font-black tracking-tight">{selectedLesson.label}</h3>
                          <p className="text-[10px] sm:text-sm text-white/60 mt-1 font-medium">{formatDate(selectedLesson.saved_at)}</p>
                        </div>
                        {selectedLesson.meta?.overallGrade && (
                          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                            <div className="text-right">
                              <p className="text-[8px] sm:text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5 sm:mb-1">Overall Grade</p>
                              <p className="text-[11px] sm:text-sm font-bold">{selectedLesson.meta.overallGrade === 'S' ? 'Satisfactory' : 'Needs Impr.'}</p>
                            </div>
                            <div className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-black shadow-lg",
                              selectedLesson.meta.overallGrade === 'S' ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
                            )}>
                              {selectedLesson.meta.overallGrade}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 sm:p-8">
                      {/* Lesson Notes */}
                      {selectedLesson.notes?.[`lesson_notes`] && (
                        <div className="mb-8 sm:mb-10 bg-[#f8fafc] p-4 sm:p-6 rounded-2xl border border-[#dde3ec] relative">
                          <div className="absolute -top-3 left-4 sm:left-6 px-3 py-1 bg-white border border-[#dde3ec] rounded-full text-[8px] sm:text-[10px] font-black text-[#1a3a5c] uppercase tracking-widest">
                            Instructor Comments
                          </div>
                          <p className="text-xs sm:text-sm text-[#1a3a5c] leading-relaxed italic whitespace-pre-wrap">{selectedLesson.notes[`lesson_notes`]}</p>
                        </div>
                      )}

                      {/* Flight Time Details */}
                      {selectedLesson.type === 'flight' && selectedLesson.meta && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
                          {[
                            { label: 'Total Flight', val: selectedLesson.meta.totalFlight, unit: 'h' },
                            { label: 'Dual Instruction', fullLabel: 'Dual Given', val: selectedLesson.meta.dual, unit: 'h' },
                            { label: 'Solo', val: selectedLesson.meta.solo, unit: 'h' },
                            { label: 'Landings', val: selectedLesson.meta.ldgTotal, unit: '' },
                            { label: 'Day Ldgs', fullLabel: 'Day Landings', val: selectedLesson.meta.ldgDay, unit: '' },
                            { label: 'Night Ldgs', fullLabel: 'Night Landings', val: selectedLesson.meta.ldgNight, unit: '' },
                            { label: 'Night', val: selectedLesson.meta.night, unit: 'h' },
                            { label: 'X-Country', fullLabel: 'Cross Country', val: (parseFloat(selectedLesson.meta.xcDual||'0')+parseFloat(selectedLesson.meta.xcSolo||'0')).toFixed(1), unit: 'h' },
                          ].map((s, i) => (
                            <div key={i} className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#dde3ec] shadow-sm">
                              <p className="text-[8px] sm:text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-0.5 sm:mb-1">
                                <span className="sm:hidden">{s.label}</span>
                                <span className="hidden sm:inline">{s.fullLabel || s.label}</span>
                              </p>
                              <p className="text-lg sm:text-xl font-black text-[#1a3a5c]">{s.val || '0'}{s.unit}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Task Performance Table */}
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] sm:text-xs font-black text-[#1a3a5c] uppercase tracking-widest flex items-center gap-2">
                             <FileText size={13} className="text-amber-500 sm:w-[14px] sm:h-[14px]" />
                             Task Performance
                          </h4>
                          <span className="text-[9px] sm:text-[11px] text-[#64748b] font-medium">{Object.keys(selectedLesson.grades || {}).length} tasks graded</span>
                        </div>
                        
                        <div className="border border-[#dde3ec] rounded-xl sm:rounded-2xl overflow-hidden divide-y divide-[#dde3ec]">
                          {acsData.map((area, ai) => {
                            const areaTasks = area.tasks.filter((_, ti) => selectedLesson.grades?.[`${ai}_${ti}`]);
                            if (areaTasks.length === 0) return null;
                            return (
                              <div key={ai} className="bg-white">
                                <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#f8fafc] flex items-center justify-between">
                                  <span className="text-[9px] sm:text-[11px] font-black uppercase text-[#64748b] tracking-wider">{area.area}</span>
                                </div>
                                <div className="divide-y divide-[#f1f5f9]">
                                  {area.tasks.map((task, ti) => {
                                    const grade = selectedLesson.grades?.[`${ai}_${ti}`];
                                    if (!grade) return null;
                                    const note = selectedLesson.notes?.[`${ai}_${ti}`];
                                    return (
                                      <div key={ti} className="p-4 sm:p-6 bg-white">
                                        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-1 sm:mb-2">
                                          <div>
                                            <p className="text-[11px] sm:text-xs font-black text-[#1a3a5c]">{task.code}: {task.name}</p>
                                          </div>
                                          <div className={cn(
                                            "shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-[10px] sm:text-xs font-black shadow-sm",
                                            gradeDisplayColor(grade)
                                          )}>
                                            {grade}
                                          </div>
                                        </div>
                                        {note && (
                                          <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 text-[10px] sm:text-[11px] text-[#475569] leading-relaxed italic">
                                            {note}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cumulative' && (
                <motion.div
                  key="cumulative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Hours Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="md:col-span-3 bg-white p-5 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-[#dde3ec] shadow-sm">
                       <h3 className="text-lg sm:text-xl font-bold text-[#1a3a5c] mb-6 flex items-center gap-2">
                         <Clock className="text-amber-500" size={20} />
                         <span className="sm:inline hidden">Total Cumulative Training Time</span>
                         <span className="sm:hidden">Total Training Time</span>
                       </h3>
                       <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-5 sm:gap-6">
                         {[
                           { label: 'Total Flight', val: stats.totFlight.toFixed(1) },
                           { label: 'Dual Instruction', fullLabel: 'Dual Given', val: stats.totDual.toFixed(1) },
                           { label: 'Solo', val: stats.totSolo.toFixed(1) },
                           { label: 'Cross Country', val: stats.totXc.toFixed(1) },
                           { label: 'Night', val: stats.totNight.toFixed(1) },
                           { label: 'Simulated Inst.', val: stats.totSim.toFixed(1) },
                         ].map((s, i) => (
                           <div key={i}>
                             <p className="text-[8px] sm:text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-0.5 sm:mb-1">
                               <span className="sm:hidden">{s.label.split(' ')[0]}</span>
                               <span className="hidden sm:inline">{s.fullLabel || s.label}</span>
                             </p>
                             <p className="text-lg sm:text-2xl font-black text-[#1a3a5c]">{s.val}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>

                  {/* ACS Performance Tracking */}
                  <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[#dde3ec] p-5 sm:p-8 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-[#1a3a5c] mb-6 sm:mb-8 flex items-center gap-2">
                       <Trophy className="text-amber-500" size={20} />
                       ACS Performance Tracking
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      {acsData.map((area, ai) => (
                        <div key={ai} className="bg-[#f8fafc] rounded-xl sm:rounded-2xl border border-[#dde3ec] p-4 sm:p-5">
                          <h4 className="text-[10px] sm:text-xs font-black uppercase text-[#1a3a5c] tracking-widest mb-3 sm:mb-4">{area.area}</h4>
                          <div className="space-y-2 sm:space-y-3">
                            {area.tasks.map((task, ti) => {
                              const taskId = `${ai}_${ti}`;
                              const gradeInfo = getMostRecentGradeInfo(studentLessons, taskId);
                              return (
                                <div key={ti} className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-[#dde3ec] shadow-sm">
                                  <span className="text-[11px] sm:text-xs font-bold text-[#1a3a5c] truncate">{task.code}: {task.name}</span>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    {gradeInfo ? (
                                      <>
                                        <span className="text-[8px] sm:text-[10px] text-[#94a3b8] font-medium hidden sm:block">Last: {new Date(gradeInfo.date).toLocaleDateString()}</span>
                                        <div className={cn(
                                          "w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white text-[9px] sm:text-[10px] font-black shadow-sm",
                                          gradeDisplayColor(gradeInfo.grade)
                                        )}>
                                          {gradeInfo.grade}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-[9px] font-black uppercase text-gray-200">N/A</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'routes' && (
                <motion.div
                  key="routes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RouteMap lessons={studentLessons} studentName={studentName || ''} />
                </motion.div>
              )}

              {activeTab === 'checkride' && (
                <motion.div
                  key="checkride"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[#dde3ec] p-5 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                       <h3 className="text-lg sm:text-xl font-bold text-[#1a3a5c] flex items-center gap-2">
                         <CheckSquare className="text-amber-500" size={20} />
                         <span className="sm:inline hidden">Regulatory Requirements Progress (61.109)</span>
                         <span className="sm:hidden">Checkride Progress</span>
                       </h3>
                       <div className="w-fit px-3 py-1 bg-[#f8fafc] border border-[#dde3ec] rounded-full text-[8px] sm:text-[10px] font-black text-[#64748b] uppercase tracking-widest">
                         Rating: {selectedLesson?.meta?.rating_code?.toUpperCase() || 'PPL'}
                       </div>
                    </div>
                    
                    <div className="space-y-6 sm:space-y-8">
                      {(() => {
                        const lessonRating = selectedLesson?.meta?.rating_code || 'ppl';
                        const sls = studentLessons.filter(l => (l.meta?.rating_code || 'ppl') === lessonRating);
                        const stats = getCumulativeStats(sls);
                        let REQS: any[] = [];

                        if (lessonRating === 'ppl') {
                          REQS = [
                            { section: 'Flight Training Requirements', rows: [
                              { label: 'Total flight time', need: 40, have: stats.totFlight, unit: 'h' },
                              { label: 'Dual Instruction', need: 20, have: stats.totDual, unit: 'h' },
                              { label: 'Solo Time', need: 10, have: stats.totSolo, unit: 'h' },
                              { label: 'Solo XC Time', need: 5, have: stats.totSoloXc, unit: 'h' },
                              { label: 'Night Dual', need: 3, have: stats.totNightDual, unit: 'h' },
                              { label: 'Instrument Dual', need: 3, have: stats.totSim, unit: 'h' },
                              { label: '3.0h Dual in 60d', need: 3, have: stats.totDual, unit: 'h' },
                            ]}
                          ];
                        } else if (lessonRating === 'ir') {
                          REQS = [
                            { section: 'Instrument Rating Requirements', rows: [
                              { label: 'XC PIC Time', need: 50, have: stats.totXcPic, unit: 'h' },
                              { label: 'Instrument Time', need: 40, have: stats.totSim, unit: 'h' },
                              { label: 'Dual Inst. Time', need: 15, have: stats.totDual, unit: 'h' },
                              { label: '3.0h Dual in 60d', need: 3, have: stats.totDual, unit: 'h' },
                            ]}
                          ];
                        }

                        if (REQS.length === 0) return <p className="text-sm text-gray-500 italic">Detailed requirements for this rating are being updated.</p>;

                        return REQS.map((section, idx) => (
                          <div key={idx} className="space-y-3 sm:space-y-4">
                            <h4 className="text-[9px] sm:text-[10px] font-black uppercase text-[#94a3b8] tracking-widest">{section.section}</h4>
                            
                            {/* Mobile Requirements Card View */}
                            <div className="sm:hidden space-y-2">
                              {section.rows.map((row: any, i: number) => (
                                <div key={i} className="bg-[#f8fafc] border border-[#dde3ec] p-3 rounded-xl flex items-center justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-[#1a3a5c] truncate">{row.label}</p>
                                    <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-widest">Goal: {row.need}{row.unit}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      "text-[10px] font-black px-2 py-1 rounded-full",
                                      row.have >= row.need ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                      {row.have.toFixed(1)}{row.unit}
                                    </span>
                                    {row.have >= row.need ? (
                                      <CheckCircle2 className="text-green-500" size={16} />
                                    ) : (
                                      <AlertCircle className="text-amber-500" size={16} />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-hidden border border-[#dde3ec] rounded-2xl">
                              <table className="min-w-full divide-y divide-[#dde3ec]">
                                <thead className="bg-[#f8fafc]">
                                  <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-[#1a3a5c] uppercase tracking-widest">Requirement Item</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-[#1a3a5c] uppercase tracking-widest">Minimum</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-[#1a3a5c] uppercase tracking-widest">Current</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-[#1a3a5c] uppercase tracking-widest">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#f1f5f9]">
                                  {section.rows.map((row: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50/50">
                                      <td className="px-6 py-4 text-sm font-bold text-[#1a3a5c]">{row.label}</td>
                                      <td className="px-6 py-4 text-center text-[11px] font-black text-[#6b7280]">{row.need}{row.unit}</td>
                                      <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                          "text-[11px] font-black px-2 py-1 rounded-full",
                                          row.have >= row.need ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                          {row.have.toFixed(1)}{row.unit}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {row.have >= row.need ? (
                                          <div className="flex justify-center"><CheckCircle2 className="text-green-500" size={18} /></div>
                                        ) : (
                                          <div className="flex justify-center group relative">
                                            <AlertCircle className="text-amber-500" size={18} />
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Endorsements Section */}
                  <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[#dde3ec] p-5 sm:p-8 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-bold text-[#1a3a5c] mb-6 sm:mb-8 flex items-center gap-2">
                       <Award className="text-amber-500" size={20} />
                       Endorsements Verified
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {endorsements.filter(e => e.completed).map((e, i) => (
                        <div key={i} className="p-3 sm:p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                              <Check size={16} />
                            </div>
                            <div className="truncate">
                               <p className="text-[9px] sm:text-[10px] font-black text-[#166534] uppercase tracking-widest">{e.endorsement_key}</p>
                               <p className="text-[10px] sm:text-[11px] text-[#166534] font-medium truncate">{e.endorsement_label}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-[8px] sm:text-[10px] font-bold text-[#166534]/60 whitespace-nowrap">
                            {formatDate(e.completed_date || '')}
                          </div>
                        </div>
                      ))}
                      {endorsements.filter(e => e.completed).length === 0 && (
                        <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl sm:rounded-[2rem] border border-dashed border-gray-200">
                          <Award size={28} className="text-gray-300 mx-auto mb-3" />
                          <p className="text-[11px] sm:text-sm font-medium text-gray-400 italic">No instructor endorsements recorded.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="py-8 px-6 text-center bg-white border-t border-[#dde3ec]">
        <p className="text-sm font-medium text-[#64748b]">
          Shared by your CFI via <a href="https://61tracker.com" className="text-[#1a3a5c] font-bold hover:underline">61 Tracker</a> · The fastest way to your private pilot certificate.
        </p>
      </footer>
    </div>
  );
}

function Plane(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    </svg>
  );
}

function Check(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
}
