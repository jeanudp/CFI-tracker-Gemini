import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, Grade, Student } from '../types';
import { ALL_ACS, RATINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, TrendingUp, Target, Clock, AlertTriangle, CheckCircle2, Calendar, BookOpen, ChevronRight, Info, ArrowUp, ArrowDown, Minus, Trophy, Star, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const gradeDescriptions: Record<string, string> = {
  '1': "Student could not perform",
  '2': "CFI had to help significantly",
  '3': "CFI helped a little",
  '4': "Student performed independently",
  'S': "CFI helped a little", // For backwards compatibility
  'N': "Student could not perform" // For backwards compatibility
};
import { cn } from '../lib/utils';

const parseFailedStandards = (notesString: string): { code: string, description: string }[] => {
  if (!notesString) return [];
  // Match "Failed standards:", "Grade 1 — Failed standards:", or "Grade 2 — Below standard:"
  const match = notesString.match(/(?:Grade [12] — )?(?:Failed standards|Below standard): (.+?)(?:\. Notes:|$)/);
  if (!match) return [];
  const standardsText = match[1];
  const standards = standardsText.split(', ').map(s => {
    const firstSpace = s.indexOf(' ');
    if (firstSpace === -1) return { code: s, description: '' };
    return {
      code: s.substring(0, firstSpace),
      description: s.substring(firstSpace + 1)
    };
  });
  return standards;
};

export default function StudentDashboard() {
  const { studentName: rawStudentName } = useParams<{ studentName: string }>();
  const studentName = rawStudentName ? decodeURIComponent(rawStudentName) : '';
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<any>({ ...Object.values(RATINGS)[0], code: Object.keys(RATINGS)[0] });
  const [student, setStudent] = useState<Student | null>(null);
  const [showMoreStruggles, setShowMoreStruggles] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentName) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [studentName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .ilike('name', studentName.trim())
        .single();
      
      if (studentError && studentError.code !== 'PGRST116') throw studentError;
      
      if (studentData) {
        setStudent(studentData);
        if (studentData.current_rating) {
          const rCode = studentData.current_rating;
          const rData = (RATINGS as any)[rCode] || Object.values(RATINGS)[0];
          setRating({ ...rData, code: rCode });
        }
      }

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .ilike('student_name', studentName.trim())
        .order('saved_at', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Unable to connect to the database. Please check if your Supabase project is active.' 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3a5c]"></div></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-[#eef2f8] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-[#fdecea] text-[#c0392b] rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#1c2333] mb-2">Connection Error</h2>
        <p className="text-sm text-[#6b7280] max-w-md mb-8 leading-relaxed">{error}</p>
        <div className="flex gap-4">
          <Link to="/dashboard" className="px-6 py-2.5 bg-[#1a3a5c] text-white font-semibold rounded-xl hover:bg-[#2a5a8c] transition-all">Go to Dashboard</Link>
          <button onClick={fetchData} className="px-6 py-2.5 bg-white text-[#1a3a5c] font-semibold border-2 border-[#dde3ec] rounded-xl hover:bg-[#f4f5f7] transition-all">Try Again</button>
        </div>
      </div>
    );
  }

  const availableRatingCodes = Array.from(new Set(lessons.map(l => l.meta?.rating_code).filter(Boolean))) as string[];
  const ratingPills = availableRatingCodes.map(code => ({
    code,
    label: (RATINGS as any)[code]?.label || code
  })).sort((a, b) => a.label.localeCompare(b.label));

  const studentLessons = lessons.filter(l => l.meta?.rating_code === rating.code);
  const acsData = ALL_ACS[rating.code] || ALL_ACS['ppl'];

  // Task Analysis Logic
  const taskAnalysis = acsData.flatMap((area, ai) => 
    area.tasks.map((task, ti) => {
      const id = `${ai}_${ti}`;
      const taskGrades = studentLessons
        .filter(l => l.grades?.[id])
        .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
      
      const gradeHistory = [...taskGrades]
        .sort((a, b) => new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime())
        .map(l => {
          const g = l.grades[id];
          if (g === 'S') return 3;
          if (g === 'N') return 1;
          const n = parseInt(g);
          return isNaN(n) ? 0 : n;
        }).filter(n => n > 0);

      const averageGrade = gradeHistory.length > 0 
        ? gradeHistory.reduce((a, b) => a + b, 0) / gradeHistory.length 
        : 0;

      let trend: 'improving' | 'regressing' | 'plateau' | null = null;
      if (gradeHistory.length >= 3) {
        const mid = Math.floor(gradeHistory.length / 2);
        const firstHalf = gradeHistory.slice(0, mid);
        const secondHalf = gradeHistory.slice(mid);
        const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (avg2 - avg1 > 0.3) trend = 'improving';
        else if (avg1 - avg2 > 0.3) trend = 'regressing';
        else trend = 'plateau';
      }

      const mostRecentGrade = taskGrades[0]?.grades[id] || null;
      const nGrades = taskGrades.filter(l => ['N', '1', '2'].includes(l.grades[id]));
      const sGrades = taskGrades.filter(l => ['S', '3', '4'].includes(l.grades[id]));
      
      const mostRecentN = nGrades[0];
      
      return {
        id,
        name: task.name,
        areaName: area.area,
        areaIndex: ai,
        code: task.code,
        mostRecentGrade,
        averageGrade,
        gradeHistory,
        trend,
        nCount: nGrades.length,
        mostRecentNDate: mostRecentN ? mostRecentN.saved_at : null,
        mostRecentNNote: mostRecentN ? mostRecentN.notes?.[id] : null,
        mostRecentSDate: sGrades[0] ? sGrades[0].saved_at : null,
        neverGraded: taskGrades.length === 0,
        isGround: ai === 0
      };
    })
  );

  const readinessScore = Math.round((taskAnalysis.filter(t => ['S', '3', '4'].includes(t.mostRecentGrade || '')).length / taskAnalysis.length) * 100) || 0;
  
  // Mastery Trajectory Data
  const masteryOverTime = studentLessons.map((lesson, index) => {
    const lessonsUntilNow = studentLessons.slice(0, index + 1);
    const taskStatus: Record<string, string> = {};
    lessonsUntilNow.forEach(l => {
      Object.entries(l.grades || {}).forEach(([id, grade]) => {
        taskStatus[id] = grade as string;
      });
    });
    
    const masteredCount = Object.values(taskStatus).filter(g => ['S', '3', '4'].includes(g)).length;
    const masteryPercentage = Math.round((masteredCount / taskAnalysis.length) * 1000) / 10;
    
    const currentGrades = Object.values(lesson.grades || {}) as string[];
    const gradedTasksCount = currentGrades.length;
    let scoreTotal = 0;
    currentGrades.forEach(g => {
      if (g === '4') scoreTotal += 4;
      else if (['S', '3'].includes(g)) scoreTotal += 3;
      else if (g === '2') scoreTotal += 2;
      else if (['N', '1'].includes(g)) scoreTotal += 1;
    });
    const lessonAvg = gradedTasksCount > 0 
      ? scoreTotal / gradedTasksCount
      : 0;

    return {
      date: new Date(lesson.saved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      mastery: masteryPercentage,
      lessonLabel: lesson.label || 'Lesson',
      overallGrade: lesson.meta?.overallGrade || 'N',
      lessonAvg: lessonAvg
    };
  });

  const strugglingTasks = taskAnalysis
    .filter(t => ['N', '1', '2'].includes(t.mostRecentGrade || ''))
    .sort((a, b) => b.nCount - a.nCount);

  const improvedTasks = taskAnalysis
    .filter(t => ['S', '3', '4'].includes(t.mostRecentGrade || '') && t.mostRecentSDate && t.nCount > 0)
    .sort((a, b) => new Date(b.mostRecentSDate!).getTime() - new Date(a.mostRecentSDate!).getTime());

  const strengthTasks = taskAnalysis.filter(t => {
    const isMasteredRecent = ['3', '4', 'S'].includes(t.mostRecentGrade || '');
    const hasEnoughAttempts = t.gradeHistory.length >= 2;
    const hasGoodAverage = t.averageGrade >= 3.0;
    const hasNoFailures = !t.gradeHistory.includes(1);
    return isMasteredRecent && hasEnoughAttempts && hasGoodAverage && hasNoFailures;
  }).sort((a, b) => {
    if (b.averageGrade !== a.averageGrade) return b.averageGrade - a.averageGrade;
    return b.gradeHistory.length - a.gradeHistory.length;
  });

  const masteredTasks = strengthTasks.filter(t => t.averageGrade >= 3.5 && t.mostRecentGrade === '4');
  const proficientTasks = strengthTasks.filter(t => !masteredTasks.find(mt => mt.id === t.id));

  // Needs Attention Logic
  const needsAttentionConditions: string[] = [];
  
  // 1. Regressing and low grade
  const regressingLowTasks = taskAnalysis.filter(t => t.trend === 'regressing' && (t.mostRecentGrade === '1' || t.mostRecentGrade === '2' || t.mostRecentGrade === 'N'));
  if (regressingLowTasks.length > 0) {
    needsAttentionConditions.push(`Regressing performance on key tasks: ${regressingLowTasks.slice(0, 2).map(t => t.name).join(', ')}${regressingLowTasks.length > 2 ? ' and others' : ''}`);
  }

  // 2. Graded 1/2 more than twice with no passing grade after
  const stagnantLowTasks = taskAnalysis.filter(t => t.nCount > 2 && !['S', '3', '4'].includes(t.mostRecentGrade || ''));
  if (stagnantLowTasks.length > 0) {
    needsAttentionConditions.push(`Stagnant progress on tasks: ${stagnantLowTasks.slice(0, 2).map(t => t.name).join(', ')}${stagnantLowTasks.length > 2 ? ' and others' : ''}`);
  }

  // 3. Gap > 14 days between two most recent lessons
  if (studentLessons.length >= 2) {
    const lastLessonDate = new Date(studentLessons[studentLessons.length - 1].saved_at).getTime();
    const secondLastLessonDate = new Date(studentLessons[studentLessons.length - 2].saved_at).getTime();
    const gapDays = Math.round((lastLessonDate - secondLastLessonDate) / (1000 * 60 * 60 * 24));
    if (gapDays > 14) {
      needsAttentionConditions.push(`Prolonged gap of ${gapDays} days between recent lessons may impact retention`);
    }
  }

  // 4. Last 3 lessons more than 2 rated N overall
  if (studentLessons.length >= 3) {
    const last3 = [...studentLessons].sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()).slice(0, 3);
    const nInLast3 = last3.filter(l => l.meta?.overallGrade === 'N').length;
    if (nInLast3 > 2) {
      needsAttentionConditions.push(`Last ${last3.length} lessons were predominantly rated "Needs Improvement" overall`);
    }
  }

  const showAttentionAlert = needsAttentionConditions.length > 0;

  const groundTasks = taskAnalysis.filter(t => t.isGround);
  const flightTasks = taskAnalysis.filter(t => !t.isGround);

  // Area Breakdown Logic
  const areaBreakdown = acsData.map((area, ai) => {
    const areaTasks = taskAnalysis.filter(t => t.areaIndex === ai);
    const allGrades: number[] = [];
    const chronoGrades: { date: string; grade: number }[] = [];

    areaTasks.forEach(task => {
      studentLessons.forEach(lesson => {
        const grade = lesson.grades?.[task.id];
        if (grade) {
          let num = 0;
          if (grade === 'S' || grade === '3') num = 3;
          else if (grade === 'N' || grade === '1') num = 1;
          else num = parseInt(grade as string);
          
          if (!isNaN(num) && num > 0) {
            allGrades.push(num);
            chronoGrades.push({ date: lesson.saved_at, grade: num });
          }
        }
      });
    });

    const averageGrade = allGrades.length > 0 
      ? Math.round((allGrades.reduce((a, b) => a + b, 0) / allGrades.length) * 100) / 100 
      : 0;

    const masteredCount = areaTasks.filter(t => ['S', '3', '4'].includes(t.mostRecentGrade || '')).length;
    const strugglingCount = areaTasks.filter(t => ['N', '1', '2'].includes(t.mostRecentGrade || '')).length;
    const uncoveredCount = areaTasks.filter(t => t.neverGraded).length;

    // Area Trend
    let trend: 'improving' | 'regressing' | 'plateau' | null = null;
    const sortedGrades = chronoGrades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(g => g.grade);
    if (sortedGrades.length >= 3) {
      const mid = Math.floor(sortedGrades.length / 2);
      const firstHalf = sortedGrades.slice(0, mid);
      const secondHalf = sortedGrades.slice(mid);
      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      if (avg2 - avg1 > 0.3) trend = 'improving';
      else if (avg1 - avg2 > 0.3) trend = 'regressing';
      else trend = 'plateau';
    }

    const gradeDist = { 1: 0, 2: 0, 3: 0, 4: 0 };
    allGrades.forEach(g => { if (g >= 1 && g <= 4) gradeDist[g as 1|2|3|4]++; });
    const totalGrades = allGrades.length || 1;

    return {
      areaName: area.area,
      areaIndex: ai,
      totalTasks: areaTasks.length,
      gradedTasks: areaTasks.filter(t => !t.neverGraded).length,
      averageGrade,
      masteredCount,
      strugglingCount,
      uncoveredCount,
      trend,
      distribution: {
        1: (gradeDist[1] / totalGrades) * 100,
        2: (gradeDist[2] / totalGrades) * 100,
        3: (gradeDist[3] / totalGrades) * 100,
        4: (gradeDist[4] / totalGrades) * 100,
        ungraded: (uncoveredCount / areaTasks.length) * 100
      }
    };
  }).sort((a, b) => {
    if (a.averageGrade === 0 && b.averageGrade === 0) return 0;
    if (a.averageGrade === 0) return 1;
    if (b.averageGrade === 0) return -1;
    return a.averageGrade - b.averageGrade;
  });

  const getSummary = (tasks: typeof taskAnalysis) => ({
    total: tasks.length,
    s: tasks.filter(t => ['S', '3', '4'].includes(t.mostRecentGrade || '')).length,
    n: tasks.filter(t => ['N', '1', '2'].includes(t.mostRecentGrade || '')).length,
    none: tasks.filter(t => t.neverGraded).length
  });

  const groundSummary = getSummary(groundTasks);
  const flightSummary = getSummary(flightTasks);

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#2d7a4f';
    if (score >= 40) return '#e8a020';
    return '#c0392b';
  };

  // Timeline Data
  const timelineData = studentLessons.map(lesson => {
    const grades = Object.values(lesson.grades || {}) as (string | number)[];
    const tasksGraded = grades.length;
    let scoreTotal = 0;
    grades.forEach(g => {
      const gs = String(g);
      if (gs === '4') scoreTotal += 4;
      else if (gs === '3' || gs === 'S') scoreTotal += 3;
      else if (gs === '2') scoreTotal += 2;
      else if (gs === '1' || gs === 'N') scoreTotal += 1;
    });
    const avgGrade = tasksGraded > 0 ? scoreTotal / tasksGraded : 0;
    
    return {
      lessonLabel: lesson.label || 'Lesson',
      date: new Date(lesson.saved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullDate: new Date(lesson.saved_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      overallGrade: lesson.meta?.overallGrade || '',
      lessonType: lesson.meta?.lessonType || lesson.label || 'Flight Lesson',
      totalFlight: lesson.meta?.totalFlight,
      tasksGraded,
      avgGrade,
      ratingCode: lesson.meta?.rating_code
    };
  });

  const totalHoursCount = studentLessons.reduce((acc, l) => acc + (parseFloat(l.meta?.totalFlight) || 0), 0);

  let timelineTrend: 'improving' | 'regressing' | 'plateau' | null = null;
  if (timelineData.length >= 3) {
    const mid = Math.floor(timelineData.length / 2);
    const firstHalf = timelineData.slice(0, mid);
    const secondHalf = timelineData.slice(mid);
    const avg1 = firstHalf.reduce((a, b) => a + b.avgGrade, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, b) => a + b.avgGrade, 0) / secondHalf.length;
    if (avg2 - avg1 > 0.3) timelineTrend = 'improving';
    else if (avg1 - avg2 > 0.3) timelineTrend = 'regressing';
    else timelineTrend = 'plateau';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Rating Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 sm:mb-12">
        <div className="flex items-center gap-4">
          <Link to="/history" className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dde3ec] rounded-xl text-[#6b7280] hover:text-[#1a3a5c] hover:border-[#1a3a5c] transition-all shadow-sm font-bold text-xs uppercase tracking-widest">
            <ArrowLeft size={16} />
            <span>Back to Student Progress</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#1a3a5c] tracking-tight">{studentName}'s Proficiency Analytics</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {ratingPills.map(p => (
                <button
                  key={p.code}
                  onClick={() => setRating({ ...RATINGS[p.code as keyof typeof RATINGS], code: p.code })}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                    rating.code === p.code 
                      ? "bg-[#1a3a5c] text-white border-[#1a3a5c] shadow-md" 
                      : "bg-white text-[#6b7280] border-[#dde3ec] hover:border-[#1a3a5c]"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 1 — Overall Readiness Score */}
        <div className="flex items-center gap-6 bg-white p-6 rounded-[2rem] border border-[#dde3ec] shadow-sm">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="transparent" stroke="#f4f5f7" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="transparent"
                stroke={getReadinessColor(readinessScore)}
                strokeWidth="8"
                strokeDasharray={`${readinessScore * 2.64} 264`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-2xl font-black text-[#1a3a5c] leading-none">{readinessScore}%</span>
              <div className="flex flex-col items-center mt-1">
                <span className="text-[10px] font-bold text-[#1a3a5c] leading-none">
                  {(taskAnalysis.map(t => t.averageGrade).filter(g => g > 0).reduce((a, b) => a + b, 0) / (taskAnalysis.map(t => t.averageGrade).filter(g => g > 0).length || 1)).toFixed(1)}
                </span>
                <span className="text-[8px] text-[#6b7280] uppercase tracking-tighter">Avg Grade</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280] mb-1">Overall Readiness</div>
            <div className="text-lg font-bold text-[#1a3a5c]">ACS Mastery Level</div>
            <div className="text-[11px] text-[#6b7280] mt-1 font-medium italic">
              {taskAnalysis.filter(t => ['S', '3', '4'].includes(t.mostRecentGrade || '')).length} of {taskAnalysis.length} tasks mastered
            </div>
            {(() => {
              const sLessons = studentLessons.filter(l => l.meta?.overallGrade === 'S').length;
              const nLessons = studentLessons.filter(l => l.meta?.overallGrade === 'N').length;
              if (sLessons === 0 && nLessons === 0) return null;
              return (
                <div className="flex gap-2 mt-2">
                  {sLessons > 0 && (
                    <div className="bg-[#f0fdf4] text-[#166534] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#bbf7d0] uppercase tracking-wider">
                      S: {sLessons} lessons
                    </div>
                  )}
                  {nLessons > 0 && (
                    <div className="bg-[#fef2f2] text-[#991b1b] text-[9px] font-black px-2 py-0.5 rounded-full border border-[#fecaca] uppercase tracking-wider">
                      N: {nLessons} lessons
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Needs Attention Alert */}
      {showAttentionAlert && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-[#fff7ed] border border-[#ffedd5] rounded-[2rem] shadow-sm flex items-start gap-4"
        >
          <div className="w-12 h-12 bg-[#ffedd5] rounded-2xl flex items-center justify-center text-[#9a3412] shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#9a3412] mb-2">Needs Attention</h3>
            <ul className="space-y-1.5">
              {needsAttentionConditions.map((condition, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#9a3412]/80 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9a3412]/40 mt-1.5 shrink-0" />
                  {condition}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Lesson Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
        className="bg-white rounded-[2rem] border border-[#dde3ec] p-4 sm:p-8 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-[#1a3a5c]">Lesson Timeline</h3>
            <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest">{timelineData.length} Lessons • {totalHoursCount.toFixed(1)} Total Hours</p>
          </div>
        </div>

        {timelineData.length >= 2 ? (
          <div className="relative">
            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4">
                {timelineData.map((item, idx) => {
                  const nextItem = timelineData[idx + 1];
                  const dayGap = nextItem 
                    ? Math.round((new Date(nextItem.fullDate).getTime() - new Date(item.fullDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <React.Fragment key={idx}>
                      {/* Lesson Card Row */}
                      <div className="flex items-center gap-4 bg-[#f8fafc] p-4 rounded-2xl border border-[#dde3ec] hover:border-[#1a3a5c] transition-all group">
                        {/* Left Dot Indicator */}
                        <div className={cn(
                          "w-3 h-3 rounded-full shrink-0 shadow-sm",
                          item.overallGrade === 'S' ? "bg-green-500 shadow-green-500/20" :
                          item.overallGrade === 'N' ? "bg-red-500 shadow-red-500/20" :
                          "bg-[#94a3b8] shadow-slate-300/20"
                        )} />
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-0.5">
                            <p className="text-sm font-bold text-[#1a3a5c] truncate">{item.lessonLabel}</p>
                            <div className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest",
                              item.avgGrade === 0 ? "bg-white text-[#94a3b8] border-[#dde3ec]" :
                              item.avgGrade < 2 ? "bg-[#fdecea] text-[#c0392b] border-[#fdecea]" :
                              item.avgGrade < 3 ? "bg-[#fffbeb] text-[#e8a020] border-[#fffbeb]" :
                              item.avgGrade < 3.5 ? "bg-[#e4f5ec] text-[#5a9e6f] border-[#e4f5ec]" :
                              "bg-[#dcfce7] text-[#2d7a4f] border-[#bbf7d0]"
                            )}>
                              Avg: {item.avgGrade > 0 ? item.avgGrade.toFixed(1) : '—'}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[#94a3b8]">
                            <p className="text-[10px] font-bold uppercase tracking-tight">{item.date}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest">{item.tasksGraded} {item.tasksGraded === 1 ? 'task' : 'tasks'} graded</p>
                          </div>
                        </div>
                      </div>

                      {/* Gap Indicator */}
                      {nextItem && dayGap > 0 && (
                        <div className="flex items-center gap-4 py-1">
                          <div className="flex-1 h-px bg-gray-100" />
                          <div className="px-3 py-1 bg-white border border-gray-100 rounded-full shrink-0">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{dayGap} {dayGap === 1 ? 'day' : 'days'}</span>
                          </div>
                          <div className="flex-1 h-px bg-gray-100" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-6 pt-6 border-t border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-[#6b7280]">Satisfactory lesson</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-medium text-[#6b7280]">Needs improvement lesson</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 border-2 border-[#94a3b8] rounded-full bg-white" />
                <span className="text-[10px] font-medium text-[#6b7280]">No overall grade recorded</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Clock size={32} className="text-[#94a3b8] opacity-20 mb-4" />
            <h4 className="text-sm font-bold text-[#64748b] italic">Log at least 2 lessons to see the timeline</h4>
          </div>
        )}
      </motion.div>

      {/* Mastery Trajectory Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2rem] border border-[#dde3ec] p-4 sm:p-8 shadow-sm mb-8"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#1a3a5c]">Mastery Trajectory</h3>
          <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest">{rating.label} Progress</p>
        </div>
        
        <div className="h-[220px] w-full">
          {masteryOverTime.length >= 2 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={masteryOverTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1c2333] p-3 rounded-xl border border-white/10 shadow-2xl">
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{data.date}</p>
                          <p className="text-xs font-bold text-white mb-2">{data.lessonLabel}</p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-white/70">Cumulative Mastery</span>
                              <span className="text-[10px] font-black text-white">{data.mastery}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[10px] text-white/70">Lesson Avg Grade</span>
                              <span className="text-[10px] font-black text-[#e8a020]">{data.lessonAvg.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-1 pt-1 border-t border-white/10">
                              <span className="text-[10px] text-white/70">Overall Grade</span>
                              <div className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black",
                                data.overallGrade === 'S' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              )}>
                                {data.overallGrade}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mastery" 
                  stroke="#1a3a5c" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#1a3a5c', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="lessonAvg" 
                  stroke="#e8a020" 
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#e8a020', strokeWidth: 1, stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#6b7280]">
              <Clock size={32} className="opacity-20 mb-3" />
              <p className="text-sm font-medium italic">Log at least 2 lessons to see trajectory</p>
            </div>
          )}
        </div>
      </motion.div>
      
      {studentLessons.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-[#dde3ec] p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-[#f4f5f7] rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={40} className="text-[#6b7280] opacity-20" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a3a5c] mb-2">No Data for {rating.label}</h2>
          <p className="text-[#6b7280] max-w-md mx-auto leading-relaxed">
            Start logging lessons for this rating to see progress analytics.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Performance by ACS Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-[2rem] border border-[#dde3ec] p-4 sm:p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#1a3a5c]">Performance by ACS Area</h3>
                <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest">Average grade across all attempts per area</p>
              </div>
              <div className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">Sorted by weakest area first</div>
            </div>

            <div className="space-y-6">
              {areaBreakdown.map((area, idx) => {
                const avgColor = area.averageGrade === 0 ? 'text-[#94a3b8]' :
                  area.averageGrade < 2 ? 'text-[#c0392b]' :
                  area.averageGrade < 3 ? 'text-[#e8a020]' :
                  area.averageGrade < 3.5 ? 'text-[#5a9e6f]' : 'text-[#2d7a4f]';

                return (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 group">
                    <div className="md:w-1/3 min-w-0">
                      {/* Area Name Color Logic */}
                      {(() => {
                        const areaNameColor = area.averageGrade === 0 ? 'text-[#1a3a5c]' :
                          area.averageGrade < 2.5 ? 'text-[#c0392b]' :
                          area.averageGrade < 3.0 ? 'text-[#e8a020]' :
                          area.averageGrade >= 3.5 ? 'text-[#2d7a4f]' : 'text-[#1a3a5c]';
                        
                        return (
                          <div className={cn("text-sm font-bold truncate mb-2", areaNameColor)} title={area.areaName}>
                            {area.areaName}
                          </div>
                        );
                      })()}
                      <div className="flex flex-wrap gap-1.5">
                        <div className="px-1.5 py-0.5 bg-[#e4f5ec] text-[#2d7a4f] rounded-md text-[8px] font-black uppercase tracking-tighter">
                          {area.masteredCount} mastered
                        </div>
                        {area.strugglingCount > 0 && (
                          <div className="px-1.5 py-0.5 bg-[#fdecea] text-[#c0392b] rounded-md text-[8px] font-black uppercase tracking-tighter">
                            {area.strugglingCount} struggling
                          </div>
                        )}
                        {area.uncoveredCount > 0 && (
                          <div className="px-1.5 py-0.5 bg-[#f4f5f7] text-[#6b7280] rounded-md text-[8px] font-black uppercase tracking-tighter">
                            {area.uncoveredCount} uncovered
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex w-full h-2 rounded-full overflow-hidden">
                        {area.distribution[1] > 0 && <div style={{ width: area.distribution[1] + '%' }} className="h-full bg-[#c0392b]" />}
                        {area.distribution[2] > 0 && <div style={{ width: area.distribution[2] + '%' }} className="h-full bg-[#e8a020]" />}
                        {area.distribution[3] > 0 && <div style={{ width: area.distribution[3] + '%' }} className="h-full bg-[#5a9e6f]" />}
                        {area.distribution[4] > 0 && <div style={{ width: area.distribution[4] + '%' }} className="h-full bg-[#2d7a4f]" />}
                        {area.distribution.ungraded > 0 && <div style={{ width: area.distribution.ungraded + '%' }} className="h-full bg-[#e2e8f0]" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-24 justify-end shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className={cn("text-lg font-black leading-none", avgColor)}>
                            {area.averageGrade > 0 ? area.averageGrade.toFixed(2) : '—'}
                          </div>
                        </div>
                        {area.trend && (
                          <div className={cn(
                            "shrink-0",
                            area.trend === 'improving' ? "text-[#2d7a4f]" : 
                            area.trend === 'regressing' ? "text-[#c0392b]" : "text-[#94a3b8]"
                          )}>
                            {area.trend === 'improving' ? <ArrowUp size={16} /> : area.trend === 'regressing' ? <ArrowDown size={16} /> : <Minus size={16} />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Section 2 — Struggle Areas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-[#dde3ec] overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-[#dde3ec] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fdecea] rounded-xl flex items-center justify-center text-[#c0392b]">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#1a3a5c]">Areas Needing Work</h3>
              </div>
              <div className="text-xs font-bold text-[#c0392b] bg-[#fdecea] px-3 py-1 rounded-full">
                {strugglingTasks.length} Tasks
              </div>
            </div>
            
            <div className="p-6">
              {strugglingTasks.length > 0 ? (
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {(showMoreStruggles ? strugglingTasks : strugglingTasks.slice(0, 10)).map((task) => {
                      const failedStandards = parseFailedStandards(task.mostRecentNNote || '');
                      return (
                        <motion.div 
                          key={task.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                          className={cn(
                            "p-5 bg-[#f8fafc] rounded-2xl border border-[#dde3ec] transition-all hover:shadow-md border-l-4",
                            (task.mostRecentGrade === '1' || task.mostRecentGrade === 'N') ? "border-l-[#c0392b]" : "border-l-[#e8a020]"
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-[#1a3a5c] bg-[#d4e8f5] px-2 py-0.5 rounded uppercase tracking-wider">
                                  {task.code}
                                </span>
                                <span className="text-[10px] text-[#6b7280] font-medium italic">
                                  {task.areaName}
                                </span>
                                {task.trend && (
                                  <div className={cn(
                                    "p-1 rounded-full ml-1",
                                    task.trend === 'improving' ? "bg-[#e4f5ec] text-[#2d7a4f]" :
                                    task.trend === 'regressing' ? "bg-[#fdecea] text-[#c0392b]" :
                                    "bg-[#f4f5f7] text-[#6b7280]"
                                  )}>
                                    {task.trend === 'improving' ? <ArrowUp size={12} /> : task.trend === 'regressing' ? <ArrowDown size={12} /> : <Minus size={12} />}
                                  </div>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-[#1a3a5c] leading-tight">{task.name}</h4>
                              <p className="text-[10px] text-[#6b7280] mt-1 italic font-medium">
                                {gradeDescriptions[task.mostRecentGrade || ''] || ''}
                              </p>

                              {/* Inline Standard Pills */}
                              {failedStandards.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {failedStandards.map((std, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-white border border-[#dde3ec] text-[#6b7280] text-[9px] font-bold rounded shadow-sm" title={std.description}>
                                      {std.code}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 shrink-0 text-right">
                              <div>
                                <div className="text-[10px] font-black text-[#6b7280] uppercase tracking-widest mb-1">Fail Count</div>
                                <div className="text-4xl font-black text-[#c0392b] leading-none mb-1">{task.nCount}</div>
                                <div className="text-[10px] font-bold text-[#6b7280] bg-white px-2 py-0.5 rounded-full border border-[#dde3ec] active:bg-gray-50">
                                  Avg: {task.averageGrade.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  
                  {strugglingTasks.length > 10 && (
                    <button
                      onClick={() => setShowMoreStruggles(!showMoreStruggles)}
                      className="w-full py-3 text-sm font-bold text-[#1a3a5c] bg-[#f4f5f7] rounded-xl hover:bg-[#e2e8f0] transition-all flex items-center justify-center gap-2"
                    >
                      {showMoreStruggles ? 'Show Less' : `Show All ${strugglingTasks.length} Struggling Tasks`}
                      <ChevronRight size={16} className={cn("transition-transform", showMoreStruggles && "-rotate-90")} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-[#e4f5ec] border border-[#2d7a4f]/20 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-[#2d7a4f] shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-[#2d7a4f] mb-1">No struggling areas identified</h4>
                  <p className="text-sm text-[#2d7a4f]/70">All graded tasks have been marked Satisfactory.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Section: Student Strengths */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-[2rem] border border-[#dde3ec] overflow-hidden shadow-sm"
          >
            <div className="p-4 sm:p-8 border-b border-[#dde3ec] flex items-center justify-between bg-gradient-to-r from-white to-[#f0fdf4]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#dcfce7] rounded-2xl flex items-center justify-center text-[#166534] shadow-sm">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a3a5c]">Student Strengths</h3>
                  <p className="text-xs text-[#6b7280] font-medium">Tasks performed consistently well across multiple lessons</p>
                </div>
              </div>
              <div className="bg-[#166534] text-white px-4 py-1.5 rounded-full text-xs font-black shadow-sm">
                {strengthTasks.length} Strengths
              </div>
            </div>
            
            <div className="p-4 sm:p-8">
              {strengthTasks.length > 0 ? (
                <div className="space-y-10">
                  {masteredTasks.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-[#166534] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Star size={10} className="fill-[#166534]" />
                        Mastered — Performs Independently
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {masteredTasks.map((task) => (
                          <div key={task.id} className="p-4 bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0] flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                              <CheckCircle size={20} className="text-[#166534] fill-[#166534]/10" />
                              <div>
                                <h4 className="text-sm font-bold text-[#166534] leading-tight">{task.name}</h4>
                                <p className="text-[10px] text-[#2d7a4f] opacity-70 font-medium">{task.areaName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-[#166534]">Avg: {task.averageGrade.toFixed(1)}</span>
                                <span className="text-[9px] text-[#166534]/60 font-bold uppercase tracking-tighter">{task.gradeHistory.length} attempts</span>
                              </div>
                              {task.trend && (
                                <div className={cn(
                                  "p-1.5 rounded-full",
                                  task.trend === 'improving' ? "text-[#166534] bg-[#bbf7d0]" :
                                  task.trend === 'regressing' ? "text-[#c0392b] bg-[#fdecea]" :
                                  "text-[#64748b] bg-[#f1f5f9]"
                                )}>
                                  {task.trend === 'improving' ? <ArrowUp size={12} /> : task.trend === 'regressing' ? <ArrowDown size={12} /> : <Minus size={12} />}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {proficientTasks.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-[#22c55e] uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-[#22c55e] border-t-transparent animate-spin" />
                        Proficient — Consistent Performance
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {proficientTasks.map((task) => (
                          <div key={task.id} className="p-4 bg-white rounded-2xl border border-[#e4f5ec] flex items-center justify-between group hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                              <div className="relative w-5 h-5 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-2 border-[#5a9e6f]/20" />
                                <div className="absolute inset-0 rounded-full border-2 border-[#5a9e6f] border-t-transparent border-r-transparent -rotate-45" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-[#1a3a5c] leading-tight group-hover:text-[#166534] transition-colors">{task.name}</h4>
                                <p className="text-[10px] text-[#6b7280] font-medium">{task.areaName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-[#5a9e6f]">Avg: {task.averageGrade.toFixed(1)}</span>
                                <span className="text-[9px] text-[#6b7280] font-bold uppercase tracking-tighter">{task.gradeHistory.length} attempts</span>
                              </div>
                              {task.trend && (
                                <div className={cn(
                                  "p-1.5 rounded-full",
                                  task.trend === 'improving' ? "text-[#5a9e6f] bg-[#e4f5ec]" :
                                  task.trend === 'regressing' ? "text-[#c0392b] bg-[#fdecea]" :
                                  "text-[#64748b] bg-[#f1f5f9]"
                                )}>
                                  {task.trend === 'improving' ? <ArrowUp size={12} /> : task.trend === 'regressing' ? <ArrowDown size={12} /> : <Minus size={12} />}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#f8fafc] rounded-full flex items-center justify-center text-[#94a3b8] mb-4">
                    <Trophy size={32} className="opacity-20" />
                  </div>
                  <h4 className="text-sm font-bold text-[#64748b] italic">No consistent strengths identified yet</h4>
                  <p className="text-xs text-[#94a3b8] mt-1">Keep logging lessons to see patterns emerge.</p>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-8">
            {/* Section 3 — Recently Improved */}
            {improvedTasks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl border border-[#dde3ec] overflow-hidden shadow-sm"
              >
                <div className="p-6 border-b border-[#dde3ec] flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#e4f5ec] rounded-xl flex items-center justify-center text-[#2d7a4f]">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a3a5c]">Recently Improved</h3>
                </div>
                <div className="p-6 space-y-4">
                  {improvedTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-[#f8fafc] rounded-xl border border-[#dde3ec]">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#1a3a5c]">{task.name}</h4>
                          <p className="text-[10px] text-[#6b7280]">{task.areaName}</p>
                        </div>
                        <div className="px-2 py-1 bg-[#e4f5ec] text-[#2d7a4f] rounded text-[10px] font-bold">
                          {task.mostRecentGrade}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[#2d7a4f] uppercase tracking-widest">
                        <CheckCircle2 size={12} />
                        Improved on {new Date(task.mostRecentSDate!).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
