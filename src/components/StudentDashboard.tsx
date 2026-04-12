import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, Grade, Student } from '../types';
import { ALL_ACS, RATINGS } from '../constants';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Target, Clock, AlertTriangle, CheckCircle2, Calendar, BookOpen, ChevronRight, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

export default function StudentDashboard() {
  const { studentName } = useParams<{ studentName: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<any>(Object.values(RATINGS)[0]);
  const [student, setStudent] = useState<Student | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentName) {
      navigate('/');
      return;
    }
    fetchData();
  }, [studentName]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch student profile
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('name', studentName)
        .single();
      
      if (studentError && studentError.code !== 'PGRST116') throw studentError;
      
      if (studentData) {
        setStudent(studentData);
        if (studentData.current_rating) {
          setRating((RATINGS as any)[studentData.current_rating] || Object.values(RATINGS)[0]);
        }
      }

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_name', studentName)
        .order('saved_at', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      
      setLessons(lessonsData || []);
      
      // Fallback to localStorage if student profile doesn't have rating yet
      if (!studentData?.current_rating) {
        const savedRating = JSON.parse(localStorage.getItem('selected_rating') || '{}');
        if (savedRating.code) {
          setRating((RATINGS as any)[savedRating.code] || Object.values(RATINGS)[0]);
        }
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

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3a5c]"></div></div>;

  if (error) {
    return (
      <div className="min-h-screen bg-[#eef2f8] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-[#fdecea] text-[#c0392b] rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#1c2333] mb-2">Connection Error</h2>
        <p className="text-sm text-[#6b7280] max-w-md mb-8 leading-relaxed">
          {error}
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
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

  const studentLessons = lessons.filter(l => 
    l.student_name === studentName && 
    l.meta?.rating_code === rating.code
  );

  const acsData = ALL_ACS[rating.code] || ALL_ACS['ppl'];

  // Fix 3 — getMostRecentGrade returning wrong value
  const getMostRecentGrade = (lessons: Lesson[], taskId: string): string | null => {
    const sortedLessons = [...lessons]
      .filter(l => l.grades && l.grades[taskId] !== undefined && l.grades[taskId] !== '')
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
    
    if (sortedLessons.length === 0) return null;
    return sortedLessons[0].grades[taskId];
  };

  // Fix 2 — Radar chart spokes showing full value with no data
  const getAreaScore = (lessons: Lesson[], taskIds: string[]) => {
    if (lessons.length === 0) return 0;
    if (taskIds.length === 0) return 0;
    
    const gradedTasks = taskIds.filter(taskId => {
      const grade = getMostRecentGrade(lessons, taskId);
      return grade !== null;
    });
    
    if (gradedTasks.length === 0) return 0;
    
    const satTasks = gradedTasks.filter(taskId => {
      return getMostRecentGrade(lessons, taskId) === 'S';
    });
    
    return Math.round((satTasks.length / taskIds.length) * 100);
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case 'S': return 'bg-[#2d7a4f] text-white border-[#2d7a4f]';
      case 'N': return 'bg-[#c0392b] text-white border-[#c0392b]';
      case 'I': return 'bg-[#e8a020] text-white border-[#e8a020]';
      default: return 'bg-[#f4f5f7] text-[#6b7280] border-[#dde3ec]';
    }
  };

  const parseTask = (task: string) => {
    const dotIndex = task.indexOf('. ');
    if (dotIndex !== -1) {
      return { 
        letter: task.substring(0, dotIndex), 
        name: task.substring(dotIndex + 2) 
      };
    }
    return { letter: '', name: task };
  };

  // 2. Grade Trend Data
  const trendData = studentLessons.map((l, idx) => {
    const grades = Object.values(l.grades || {});
    const s = grades.filter(g => g === 'S').length;
    const n = grades.filter(g => g === 'N').length;
    const i = grades.filter(g => g === 'I').length;
    return {
      name: `L${idx + 1}`,
      satisfactory: s,
      needsImprovement: n,
      incomplete: i,
      date: new Date(l.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  // 3. Hours Progress Data
  let cumulativeHours = 0;
  const hoursData = studentLessons.map((l, idx) => {
    const h = parseFloat(l.meta?.totalFlight || l.meta?.dual || '0') || 0;
    cumulativeHours += h;
    return {
      name: `L${idx + 1}`,
      hours: h,
      cumulative: cumulativeHours,
      date: new Date(l.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  // 4. Weak Areas Report
  const weakAreas = acsData.flatMap((area, ai) => 
    area.tasks
      .filter(task => !task.name.includes('N/A') && !task.name.includes('ASEL') && !task.name.includes('Seaplane') && !task.name.includes('Water'))
      .map((task, ti) => {
        const id = `${ai}_${ti}`;
      const nGrades = studentLessons.filter(l => l.grades?.[id] === 'N').length;
      const iGrades = studentLessons.filter(l => l.grades?.[id] === 'I').length;
      const totalAttempts = studentLessons.filter(l => l.grades?.[id]).length;
      const isMastered = studentLessons.some(l => l.grades?.[id] === 'S');
      return { task: task.name, area: area.area, nGrades, iGrades, totalAttempts, isMastered, score: nGrades * 2 + iGrades };
    })
  ).filter(t => t.score > 0 && !t.isMastered)
   .sort((a, b) => b.score - a.score)
   .slice(0, 5);

  // 5. Readiness Score
  // Fix 1 — Overall readiness score showing 100 percent with no lessons
  const overallReadiness = () => {
    const allLessons = studentLessons;
    if (allLessons.length === 0) return 0;
    
    const allTaskIds = acsData.flatMap((area, ai) => 
      area.tasks.map((_, ti) => `${ai}_${ti}`)
    );
    if (allTaskIds.length === 0) return 0;
    
    const tasksWithSGrade = allTaskIds.filter(taskId => {
      const mostRecentGrade = getMostRecentGrade(allLessons, taskId);
      return mostRecentGrade === 'S';
    });
    
    return Math.round((tasksWithSGrade.length / allTaskIds.length) * 100);
  };

  const readinessScore = overallReadiness();
  const masteredTasks = acsData.flatMap((area, ai) => 
    area.tasks.map((_, ti) => `${ai}_${ti}`)
  ).filter(id => studentLessons.some(l => l.grades?.[id] === 'S')).length;
  const totalTasksCount = acsData.flatMap(area => area.tasks).length;

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#2d7a4f'; // Green
    if (score >= 40) return '#e8a020'; // Gold
    return '#c0392b'; // Red
  };

  // 6. Radar Chart Data
  // Ground Radar (Area I)
  const groundRadarData = acsData[0]?.tasks.map((task, ti) => {
    const id = `0_${ti}`;
    const score = getAreaScore(studentLessons, [id]);
    const { letter, name } = parseTask(task.name);
    return {
      subject: `${letter}. ${name.substring(0, 25)}${name.length > 25 ? '...' : ''}`,
      fullSubject: `${letter}. ${name}`,
      value: score,
      grade: getMostRecentGrade(studentLessons, id) || 'None'
    };
  }) || [];

  // Flight Radar (Areas II-XII)
  const flightRadarData = acsData.slice(1).map((area, aiOffset) => {
    const ai = aiOffset + 1;
    const taskIds = area.tasks.map((_, ti) => `${ai}_${ti}`);
    const score = getAreaScore(studentLessons, taskIds);
    
    return {
      subject: area.area,
      value: score,
      fullArea: area.area
    };
  });

  // Summary Counts
  const getSummaryCounts = (areaIndices: number[]) => {
    let s = 0, n = 0, i = 0, none = 0;
    areaIndices.forEach(ai => {
      acsData[ai]?.tasks.forEach((_, ti) => {
        const grade = getMostRecentGrade(studentLessons, `${ai}_${ti}`);
        if (grade === 'S') s++;
        else if (grade === 'N') n++;
        else if (grade === 'I') i++;
        else none++;
      });
    });
    return { s, n, i, none };
  };

  const groundSummary = getSummaryCounts([0]);
  const flightSummary = getSummaryCounts(acsData.slice(1).map((_, idx) => idx + 1));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-xl bg-white border border-[#dde3ec] text-[#6b7280] hover:text-[#1a3a5c] hover:border-[#1a3a5c] transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#1a3a5c] tracking-tight">{studentName}'s ACS Proficiency Analytics</h1>
            <p className="text-[#6b7280] text-sm font-medium uppercase tracking-widest mt-1">{rating.label} · {lessons.length} Lessons</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Overall Readiness Circle */}
          <div className="flex items-center gap-6 bg-white p-4 pr-8 rounded-3xl border border-[#dde3ec] shadow-sm">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="42"
                  fill="transparent"
                  stroke="#f4f5f7"
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="transparent"
                  stroke={getReadinessColor(readinessScore)}
                  strokeWidth="8"
                  strokeDasharray={`${readinessScore * 2.64} 264`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-[#1a3a5c]">{readinessScore}%</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280] mb-1">Overall Readiness</div>
              <div className="text-lg font-bold text-[#1a3a5c]">ACS Mastery Level</div>
              <div className="text-[11px] text-[#6b7280] mt-1 font-medium italic">Based on {masteredTasks} of {totalTasksCount} tasks mastered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fix 5 — Show correct empty state */}
      {studentLessons.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-[#dde3ec] p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-[#f4f5f7] rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={40} className="text-[#6b7280] opacity-20" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a3a5c] mb-2">No Data Yet</h2>
          <p className="text-[#6b7280] max-w-md mx-auto leading-relaxed">
            Start logging lessons for {studentName} to see their progress analytics here. No lessons logged for this rating yet.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Ground Radar Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-[#dde3ec] p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2d7a4f]/20" />
              <h3 className="text-lg font-bold text-[#1a3a5c] mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e4f5ec] rounded-xl flex items-center justify-center text-[#2d7a4f]">
                  <BookOpen size={20} />
                </div>
                Ground Knowledge — Area I
              </h3>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={groundRadarData}>
                    <PolarGrid stroke="#dde3ec" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#1a3a5c', fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Mastery"
                      dataKey="value"
                      stroke="#2d7a4f"
                      strokeWidth={3}
                      fill="#2d7a4f"
                      fillOpacity={0.4}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 flex flex-col gap-6">
                <div className="flex items-center justify-center gap-3">
                  <span className="px-4 py-1.5 bg-[#e4f5ec] text-[#2d7a4f] rounded-full text-xs font-bold border border-[#2d7a4f]/20">{groundSummary.s} Mastered</span>
                  <span className="px-4 py-1.5 bg-[#fdf0d4] text-[#e8a020] rounded-full text-xs font-bold border border-[#e8a020]/20">{groundSummary.i} Incomplete</span>
                  <span className="px-4 py-1.5 bg-[#fdecea] text-[#c0392b] rounded-full text-xs font-bold border border-[#c0392b]/20">{groundSummary.n} Needs Impr.</span>
                  <span className="px-4 py-1.5 bg-[#f4f5f7] text-[#6b7280] rounded-full text-xs font-bold border border-[#dde3ec]">{groundSummary.none} Not Graded</span>
                </div>
                
                <div className="text-center">
                  <p className="text-[10px] text-[#6b7280] font-medium italic leading-relaxed max-w-xs mx-auto">
                    This chart shows overall performance throughout training. A lower spoke indicates an area where the student needed more practice. Check the Checkride tab to see current pass or fail status for each task.
                  </p>
                </div>

                <div className="flex justify-center gap-6 pt-6 border-t border-[#f4f5f7]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2d7a4f]" />
                    <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">S = 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#e8a020]" />
                    <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">I = 0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#c0392b]" />
                    <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">N = 0</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Flight Radar Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] border border-[#dde3ec] p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#1a3a5c]/20" />
              <h3 className="text-lg font-bold text-[#1a3a5c] mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4e8f5] rounded-xl flex items-center justify-center text-[#1a3a5c]">
                  <TrendingUp size={20} />
                </div>
                Flight Proficiency — Areas II-XII
              </h3>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={flightRadarData}>
                    <PolarGrid stroke="#dde3ec" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#1a3a5c', fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Area Mastery"
                      dataKey="value"
                      stroke="#1a3a5c"
                      strokeWidth={3}
                      fill="#1a3a5c"
                      fillOpacity={0.3}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 flex flex-col gap-6">
                <div className="flex items-center justify-center gap-3">
                  <span className="px-4 py-1.5 bg-[#e4f5ec] text-[#2d7a4f] rounded-full text-xs font-bold border border-[#2d7a4f]/20">{flightSummary.s} Mastered</span>
                  <span className="px-4 py-1.5 bg-[#fdf0d4] text-[#e8a020] rounded-full text-xs font-bold border border-[#e8a020]/20">{flightSummary.i} Incomplete</span>
                  <span className="px-4 py-1.5 bg-[#fdecea] text-[#c0392b] rounded-full text-xs font-bold border border-[#c0392b]/20">{flightSummary.n} Needs Impr.</span>
                  <span className="px-4 py-1.5 bg-[#f4f5f7] text-[#6b7280] rounded-full text-xs font-bold border border-[#dde3ec]">{flightSummary.none} Not Graded</span>
                </div>
                
                <div className="text-center">
                  <p className="text-[10px] text-[#6b7280] font-medium italic leading-relaxed max-w-xs mx-auto">
                    This chart shows overall performance throughout training. A lower spoke indicates an area where the student needed more practice. Check the Checkride tab to see current pass or fail status for each task.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Most Struggled Areas */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-[#1a3a5c] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fdecea] rounded-xl flex items-center justify-center text-[#c0392b]">
                <AlertTriangle size={20} />
              </div>
              Most Struggled Areas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(() => {
                const allAreaScores = acsData.map((area, ai) => {
                  const tasks = area.tasks.filter(t => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water'));
                  if (tasks.length === 0) return null;
                  const taskIds = tasks.map((_, ti) => `${ai}_${ti}`);
                  const score = getAreaScore(studentLessons, taskIds);
                  return { area: area.area, avg: score };
                }).filter(Boolean) as { area: string, avg: number }[];

                const topStruggles = [...allAreaScores]
                  .sort((a, b) => a.avg - b.avg)
                  .slice(0, 3);

                if (topStruggles.length === 0) return <div className="col-span-3 text-sm text-[#6b7280] italic">No struggle data available yet.</div>;

                return topStruggles.map((s, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-6 rounded-2xl border shadow-sm",
                      s.avg < 50 ? "bg-[#fdecea] border-[#f5c6cb] text-[#721c24]" : "bg-[#fff3cd] border-[#ffeeba] text-[#856404]"
                    )}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Area {idx + 1}</div>
                    <div className="text-sm font-bold mb-3 leading-tight">{s.area}</div>
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-black">{Math.round(s.avg)}%</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">Mastery Score</div>
                    </div>
                    <div className="mt-4 w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-current opacity-30 rounded-full" style={{ width: `${s.avg}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Weak Areas & Recent Notes (Simplified) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl border border-[#dde3ec] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1c2333] mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#c0392b]" />
                Priority Focus Areas
              </h3>
              <div className="space-y-3">
                {weakAreas.length > 0 ? weakAreas.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#fdecea]/50 rounded-xl border border-[#fdecea] text-xs">
                    <div className="font-bold text-[#1a3a5c] mb-1">{item.task}</div>
                    <div className="text-[10px] text-[#6b7280]">{item.area}</div>
                  </div>
                )) : (
                  <div className="text-xs text-[#6b7280] italic">No critical weak areas identified.</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#dde3ec] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1c2333] mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-[#1a3a5c]" />
                Recent Instructor Feedback
              </h3>
              <div className="space-y-4">
                {studentLessons.slice(-3).reverse().map((l) => (
                  <div key={l.id} className="flex gap-4">
                    <div className="w-1 h-auto bg-[#dde3ec] rounded-full" />
                    <div>
                      <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">
                        {new Date(l.saved_at).toLocaleDateString()} · {l.label}
                      </div>
                      <div className="text-xs text-[#1a3a5c] leading-relaxed italic">
                        "{l.meta?.notes || "No notes recorded."}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
