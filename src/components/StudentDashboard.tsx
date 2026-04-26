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
      if (g === '4') scoreTotal += 1;
      else if (['S', '3'].includes(g)) scoreTotal += 0.5;
    });
    const lessonScore = gradedTasksCount > 0 
      ? Math.round((scoreTotal / gradedTasksCount) * 1000) / 10 
      : 0;

    return {
      date: new Date(lesson.saved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      mastery: masteryPercentage,
      lessonLabel: lesson.label || 'Lesson',
      overallGrade: lesson.meta?.overallGrade || 'N',
      lessonScore: lessonScore
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

  const uncoveredTasks = taskAnalysis.filter(t => t.neverGraded);
  const uncoveredByArea = acsData.map((area, ai) => ({
    area: area.area,
    tasks: uncoveredTasks.filter(t => t.areaIndex === ai)
  })).filter(a => a.tasks.length > 0);

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

  const [expandedAreas, setExpandedAreas] = useState<Record<number, boolean>>({});

  const heatmapAreas = acsData.map((area, ai) => ({
    areaName: area.area,
    areaIndex: ai,
    tasks: area.tasks.map((task, ti) => {
      const taskId = `${ai}_${ti}`;
      return {
        taskName: task.name,
        taskId,
        grades: studentLessons.map(lesson => {
          const grade = lesson.grades?.[taskId] || null;
          let numericGrade = 0;
          if (grade === '4') numericGrade = 4;
          else if (grade === '3' || grade === 'S') numericGrade = 3;
          else if (grade === '2') numericGrade = 2;
          else if (grade === '1' || grade === 'N') numericGrade = 1;
          
          return {
            lessonLabel: lesson.label || 'Lesson',
            date: new Date(lesson.saved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            grade,
            numericGrade
          };
        })
      };
    })
  }));

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

  const getAverageColor = (avg: number) => {
    if (avg === 0) return 'bg-[#f1f5f9]';
    if (avg < 2) return 'bg-[#c0392b]';
    if (avg < 3) return 'bg-[#e8a020]';
    if (avg < 4) return 'bg-[#5a9e6f]';
    return 'bg-[#2d7a4f]';
  };

  const getGradeColor = (numericGrade: number) => {
    if (numericGrade === 0) return 'bg-[#f1f5f9]';
    if (numericGrade === 1) return 'bg-[#c0392b] text-white';
    if (numericGrade === 2) return 'bg-[#e8a020] text-white';
    if (numericGrade === 3) return 'bg-[#5a9e6f] text-white';
    if (numericGrade === 4) return 'bg-[#2d7a4f] text-white';
    return 'bg-[#f1f5f9]';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Rating Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link to="/history" className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dde3ec] rounded-xl text-[#6b7280] hover:text-[#1a3a5c] hover:border-[#1a3a5c] transition-all shadow-sm font-bold text-xs uppercase tracking-widest">
            <ArrowLeft size={16} />
            <span>Back to Student Progress</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3a5c] tracking-tight">{studentName}'s Proficiency Analytics</h1>
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

      {/* Lesson Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
        className="bg-white rounded-[2rem] border border-[#dde3ec] p-8 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-[#1a3a5c]">Lesson Timeline</h3>
            <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest">{timelineData.length} Lessons • {totalHoursCount.toFixed(1)} Total Hours</p>
          </div>
        </div>

        {timelineData.length >= 2 ? (
          <div className="relative">
            <div className="overflow-x-auto pb-8 -mx-4 px-4 custom-scrollbar">
              <div className="relative min-w-max pb-4">
                {/* Progress Line */}
                <div className="absolute top-[7px] left-6 right-6 h-[2px] bg-[#f1f5f9] z-0">
                  {timelineTrend === 'improving' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500 rounded-full" />
                  )}
                </div>

                <div className="flex justify-start items-start gap-12 pt-0">
                  {timelineData.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center group relative cursor-help w-[60px]">
                      {/* Tooltip */}
                      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-48 bg-[#1c2333] p-3 rounded-xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 scale-95 group-hover:scale-100 origin-bottom">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{item.date}</p>
                        <p className="text-xs font-bold text-white mb-2">{item.lessonLabel}</p>
                        <div className="flex flex-col gap-1.5">
                          {item.overallGrade && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white/70">Overall</span>
                              <div className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black",
                                item.overallGrade === 'S' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              )}>
                                {item.overallGrade === 'S' ? 'Satisfactory' : 'Needs Improvement'}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/70">Avg Task Grade</span>
                            <span className="text-[10px] font-black text-white">{item.avgGrade.toFixed(1)}</span>
                          </div>
                          {item.totalFlight && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-white/70">Flight Time</span>
                              <span className="text-[10px] font-black text-white">{item.totalFlight}h</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dot */}
                      <div className="relative z-10">
                        <div className={cn(
                          "w-[14px] h-[14px] rounded-full border-2 transition-transform group-hover:scale-125",
                          item.overallGrade === 'S' ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" :
                          item.overallGrade === 'N' ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" :
                          "bg-white border-[#94a3b8]"
                        )} />
                        {/* Optional Vertical Line Segment (as requested) */}
                        {idx < timelineData.length - 1 && (
                          <div className="hidden absolute top-[7px] left-[14px] w-12 h-[2px] bg-[#f1f5f9] -z-10" />
                        )}
                      </div>

                      <div className="mt-4 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-tighter mb-2 whitespace-nowrap">{item.date}</span>
                        
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-black border",
                          item.avgGrade === 0 ? "bg-[#f1f5f9] text-[#94a3b8] border-[#dde3ec]" :
                          item.avgGrade < 2 ? "bg-[#fdecea] text-[#c0392b] border-[#fdecea]" :
                          item.avgGrade < 3 ? "bg-[#fffbeb] text-[#e8a020] border-[#fffbeb]" :
                          item.avgGrade < 3.5 ? "bg-[#e4f5ec] text-[#5a9e6f] border-[#e4f5ec]" :
                          "bg-[#dcfce7] text-[#2d7a4f] border-[#bbf7d0]"
                        )}>
                          {item.avgGrade > 0 ? item.avgGrade.toFixed(1) : '—'}
                        </div>
                        
                        <span className="text-[8px] text-[#94a3b8] font-bold uppercase mt-1 whitespace-nowrap">
                          {item.tasksGraded} {item.tasksGraded === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
        className="bg-white rounded-[2rem] border border-[#dde3ec] p-8 shadow-sm mb-8"
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
                              <span className="text-[10px] text-white/70">Lesson Score</span>
                              <span className="text-[10px] font-black text-[#e8a020]">{data.lessonScore}%</span>
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
                  dataKey="lessonScore" 
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
      
      {/* ACS Task Heatmap */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[2rem] border border-[#dde3ec] p-8 shadow-sm mb-8"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#1a3a5c]">ACS Task Heatmap</h3>
          <p className="text-xs text-[#6b7280] font-bold uppercase tracking-widest">Grade per task per lesson — tap an area to expand</p>
        </div>

        <div className="space-y-3">
          {heatmapAreas.map((area, ai) => {
            const isExpanded = expandedAreas[ai];
            return (
              <div key={ai} className="border border-[#f1f5f9] rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedAreas(prev => ({ ...prev, [ai]: !prev[ai] }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-[#f8fafc] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight size={16} className={cn("text-[#94a3b8] transition-transform", isExpanded && "rotate-90")} />
                    <span className="text-sm font-bold text-[#1a3a5c] text-left">{area.areaName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {studentLessons.map((_, li) => {
                      const lessonGrades = area.tasks.map(t => t.grades[li].numericGrade).filter(g => g > 0);
                      const avg = lessonGrades.length > 0 ? lessonGrades.reduce((a, b) => a + b, 0) / lessonGrades.length : 0;
                      return (
                        <div key={li} className={cn("w-2 h-2 rounded-full", getAverageColor(avg))} title={avg > 0 ? `Avg: ${avg.toFixed(1)}` : 'No data'} />
                      );
                    })}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0">
                        <div className="overflow-x-auto pb-4">
                          <table className="min-w-full border-separate border-spacing-0">
                            <thead>
                              <tr>
                                <th className="sticky left-0 bg-white z-10 text-left p-2 min-w-[200px] border-b border-[#f1f5f9]">
                                  <span className="text-[10px] font-black uppercase text-[#6b7280] tracking-widest pl-2">Task</span>
                                </th>
                                {studentLessons.map((lesson, li) => (
                                  <th key={li} className="p-2 border-b border-[#f1f5f9] h-16">
                                    <div className="w-12 h-12 flex items-end justify-center relative">
                                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-[#94a3b8] origin-bottom-left rotate-[-45deg]">
                                        {new Date(lesson.saved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {area.tasks.map((task, ti) => (
                                <tr key={ti} className="hover:bg-[#f8fafc] group">
                                  <td className="sticky left-0 bg-white group-hover:bg-[#f8fafc] z-10 p-2 border-b border-[#f1f5f9] max-w-[200px]">
                                    <div className="text-[11px] font-medium text-[#1a3a5c] whitespace-nowrap overflow-hidden text-ellipsis pl-2" title={task.taskName}>
                                      {task.taskName}
                                    </div>
                                  </td>
                                  {task.grades.map((gradeInfo, gi) => (
                                    <td key={gi} className="p-1 border-b border-[#f1f5f9]">
                                      <div 
                                        className={cn(
                                          "w-7 h-7 rounded-md flex items-center justify-center transition-transform hover:scale-110",
                                          getGradeColor(gradeInfo.numericGrade)
                                        )}
                                        title={`${gradeInfo.lessonLabel} (${gradeInfo.date}): ${gradeDescriptions[gradeInfo.grade || ''] || 'No grade'}`}
                                      >
                                        <span className="text-[10px] font-black">
                                          {gradeInfo.grade}
                                        </span>
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {ai === heatmapAreas.findIndex((_, index) => expandedAreas[index]) && (
                          <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-[#f1f5f9]">
                            {['1', '2', '3', '4'].map(g => (
                              <div key={g} className="flex items-center gap-2">
                                <div className={cn("w-4 h-4 rounded shadow-sm", getGradeColor(parseInt(g)))} />
                                <span className="text-[10px] font-medium text-[#6b7280]">{gradeDescriptions[g]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
            className="bg-white rounded-[2rem] border border-[#dde3ec] p-8 shadow-sm"
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
                      <div className="text-sm font-bold text-[#1a3a5c] truncate mb-2" title={area.areaName}>{area.areaName}</div>
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
                      <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden flex">
                        <div style={{ width: `${area.distribution[1]}%` }} className="h-full bg-[#c0392b]" title="Grade 1" />
                        <div style={{ width: `${area.distribution[2]}%` }} className="h-full bg-[#e8a020]" title="Grade 2" />
                        <div style={{ width: `${area.distribution[3]}%` }} className="h-full bg-[#5a9e6f]" title="Grade 3" />
                        <div style={{ width: `${area.distribution[4]}%` }} className="h-full bg-[#2d7a4f]" title="Grade 4" />
                        <div style={{ width: `${area.distribution.ungraded}%` }} className="h-full bg-[#f1f5f9]" title="Ungraded" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-16 justify-end shrink-0">
                      <div className="text-right">
                        <div className={cn("text-lg font-black leading-none", avgColor)}>
                          {area.averageGrade > 0 ? area.averageGrade.toFixed(2) : '—'}
                        </div>
                        {area.trend && (
                          <div className={cn(
                            "flex justify-end mt-0.5",
                            area.trend === 'improving' ? "text-[#2d7a4f]" : 
                            area.trend === 'regressing' ? "text-[#c0392b]" : "text-[#94a3b8]"
                          )}>
                            {area.trend === 'improving' ? <ArrowUp size={10} /> : area.trend === 'regressing' ? <ArrowDown size={10} /> : <Minus size={10} />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Section 5 — Ground vs Flight Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#e4f5ec] rounded-xl flex items-center justify-center text-[#2d7a4f]">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3a5c]">Ground Knowledge</h3>
                  <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest">Area I Summary</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#f4f5f7] rounded-xl">
                  <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">Total Tasks</div>
                  <div className="text-xl font-mono font-bold text-[#1a3a5c]">{groundSummary.total}</div>
                </div>
                <div className="p-3 bg-[#e4f5ec] rounded-xl">
                  <div className="text-[10px] font-bold text-[#2d7a4f] uppercase tracking-widest mb-1">Satisfactory</div>
                  <div className="text-xl font-mono font-bold text-[#2d7a4f]">{groundSummary.s}</div>
                </div>
                <div className="p-3 bg-[#fdecea] rounded-xl">
                  <div className="text-[10px] font-bold text-[#c0392b] uppercase tracking-widest mb-1">Needs Impr.</div>
                  <div className="text-xl font-mono font-bold text-[#c0392b]">{groundSummary.n}</div>
                </div>
                <div className="p-3 bg-[#f4f5f7] rounded-xl">
                  <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">Not Covered</div>
                  <div className="text-xl font-mono font-bold text-[#6b7280]">{groundSummary.none}</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#d4e8f5] rounded-xl flex items-center justify-center text-[#1a3a5c]">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3a5c]">Flight Proficiency</h3>
                  <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest">Areas II-XII Summary</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#f4f5f7] rounded-xl">
                  <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">Total Tasks</div>
                  <div className="text-xl font-mono font-bold text-[#1a3a5c]">{flightSummary.total}</div>
                </div>
                <div className="p-3 bg-[#e4f5ec] rounded-xl">
                  <div className="text-[10px] font-bold text-[#2d7a4f] uppercase tracking-widest mb-1">Satisfactory</div>
                  <div className="text-xl font-mono font-bold text-[#2d7a4f]">{flightSummary.s}</div>
                </div>
                <div className="p-3 bg-[#fdecea] rounded-xl">
                  <div className="text-[10px] font-bold text-[#c0392b] uppercase tracking-widest mb-1">Needs Impr.</div>
                  <div className="text-xl font-mono font-bold text-[#c0392b]">{flightSummary.n}</div>
                </div>
                <div className="p-3 bg-[#f4f5f7] rounded-xl">
                  <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">Not Covered</div>
                  <div className="text-xl font-mono font-bold text-[#6b7280]">{flightSummary.none}</div>
                </div>
              </div>
            </motion.div>
          </div>

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
              {(() => {
                const last3 = [...studentLessons].sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()).slice(0, 3);
                const nInLast3 = last3.filter(l => l.meta?.overallGrade === 'N').length;
                if (nInLast3 > 0) {
                  return (
                    <div className="mb-6 p-4 bg-[#fff7ed] border border-[#ffedd5] rounded-xl flex items-center gap-3 text-[#9a3412]">
                      <AlertTriangle size={18} />
                      <p className="text-xs font-bold">
                        Note: {nInLast3} of your last {last3.length} lessons were rated N overall.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
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
                          className="p-5 bg-[#f8fafc] rounded-2xl border border-[#dde3ec] transition-all hover:shadow-md"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-[#1a3a5c] bg-[#d4e8f5] px-2 py-0.5 rounded uppercase tracking-wider">
                                  {task.code}
                                </span>
                                <span className="text-[10px] text-[#6b7280] font-medium italic">
                                  {task.areaName}
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-[#1a3a5c] leading-tight">{task.name}</h4>
                              <p className="text-[10px] text-[#6b7280] mt-1 italic font-medium">
                                {gradeDescriptions[task.mostRecentGrade || ''] || ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="px-2 py-0.5 bg-[#e8a020]/10 text-[#e8a020] rounded-full text-[9px] font-black border border-[#e8a020]/20">
                                  Avg: {task.averageGrade.toFixed(1)}
                                </div>
                                {task.trend && (
                                  <div className={cn(
                                    "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border",
                                    task.trend === 'improving' ? "bg-[#e4f5ec] text-[#2d7a4f] border-[#2d7a4f]/20" :
                                    task.trend === 'regressing' ? "bg-[#fdecea] text-[#c0392b] border-[#c0392b]/20" :
                                    "bg-[#f4f5f7] text-[#6b7280] border-[#dde3ec]"
                                  )}>
                                    {task.trend === 'improving' ? <ArrowUp size={8} /> : task.trend === 'regressing' ? <ArrowDown size={8} /> : <Minus size={8} />}
                                    <span className="capitalize">{task.trend}</span>
                                  </div>
                                )}
                              </div>
                              <div className="px-3 py-1.5 bg-[#c0392b] text-white rounded-xl text-xs font-black shadow-sm">
                                {task.mostRecentGrade} × {task.nCount}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl border border-[#dde3ec] p-4">
                            <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
                              <Target size={12} className="text-[#c0392b]" />
                              Failed Standards Breakdown
                            </div>
                            {failedStandards.length > 0 ? (
                              <div className="space-y-2">
                                {failedStandards.map((std, idx) => (
                                  <div key={idx} className="flex items-start gap-3 group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] mt-1.5 shrink-0" />
                                    <div className="text-xs leading-relaxed">
                                      <span className="font-bold text-[#1a3a5c] mr-2">{std.code}</span>
                                      <span className="text-[#4b5563]">{std.description}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-[#6b7280] italic">
                                <Info size={14} />
                                No specific standard recorded for this failure.
                              </div>
                            )}
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
            <div className="p-8 border-b border-[#dde3ec] flex items-center justify-between bg-gradient-to-r from-white to-[#f0fdf4]">
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
            
            <div className="p-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

            {/* Section 4 — Not Yet Covered */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "bg-white rounded-3xl border border-[#dde3ec] overflow-hidden shadow-sm",
                improvedTasks.length === 0 && "lg:col-span-2"
              )}
            >
              <div className="p-6 border-b border-[#dde3ec] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f4f5f7] rounded-xl flex items-center justify-center text-[#6b7280]">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1a3a5c]">Not Yet Covered</h3>
                </div>
                <div className="text-xs font-bold text-[#6b7280] bg-[#f4f5f7] px-3 py-1 rounded-full">
                  {uncoveredTasks.length} Tasks Remaining
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {uncoveredByArea.map((area, idx) => (
                    <div key={idx}>
                      <h4 className="text-[10px] font-black text-[#1a3a5c] uppercase tracking-[0.2em] mb-3 pb-1 border-b border-[#f4f5f7]">
                        {area.area}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {area.tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2 text-xs text-[#6b7280]">
                            <div className="w-1 h-1 rounded-full bg-[#dde3ec]" />
                            {task.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
