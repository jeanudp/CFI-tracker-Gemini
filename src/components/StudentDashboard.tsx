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

  const acsData = ALL_ACS[rating.code] || ALL_ACS['ppl'];

  // Helper for Mastery Maps
  const getMostRecentGrade = (ai: number, ti: number) => {
    const id = `${ai}_${ti}`;
    for (let i = lessons.length - 1; i >= 0; i--) {
      const grade = lessons[i].grades?.[id];
      if (grade) return grade;
    }
    return null;
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
  const trendData = lessons.map((l, idx) => {
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
  const hoursData = lessons.map((l, idx) => {
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
      const nGrades = lessons.filter(l => l.grades?.[id] === 'N').length;
      const iGrades = lessons.filter(l => l.grades?.[id] === 'I').length;
      const totalAttempts = lessons.filter(l => l.grades?.[id]).length;
      const isMastered = lessons.some(l => l.grades?.[id] === 'S');
      return { task: task.name, area: area.area, nGrades, iGrades, totalAttempts, isMastered, score: nGrades * 2 + iGrades };
    })
  ).filter(t => t.score > 0 && !t.isMastered)
   .sort((a, b) => b.score - a.score)
   .slice(0, 5);

  // 5. Readiness Score
  const totalTasksDenominator = 46;
  const masteredTasks = acsData.flatMap((area, ai) => 
    area.tasks.map((_, ti) => `${ai}_${ti}`)
  ).filter(id => lessons.some(l => l.grades?.[id] === 'S')).length;
  const readinessScore = Math.min(100, Math.round((masteredTasks / totalTasksDenominator) * 100));

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#2d7a4f'; // Green
    if (score >= 40) return '#e8a020'; // Gold
    return '#c0392b'; // Red
  };

  // 6. Radar Chart Data
  const getMasteryValue = (grade: string | null) => {
    if (grade === 'S') return 100;
    return 0;
  };

  // Ground Radar (Area I)
  const groundRadarData = acsData[0]?.tasks.map((task, ti) => {
    const grade = getMostRecentGrade(0, ti);
    const { letter, name } = parseTask(task.name);
    return {
      subject: `${letter}. ${name.substring(0, 25)}${name.length > 25 ? '...' : ''}`,
      fullSubject: `${letter}. ${name}`,
      value: getMasteryValue(grade),
      grade: grade || 'None'
    };
  }) || [];

  // Flight Radar (Areas II-XII)
  const flightRadarData = acsData.slice(1).map((area, aiOffset) => {
    const ai = aiOffset + 1;
    const scores = area.tasks.map((_, ti) => getMasteryValue(getMostRecentGrade(ai, ti)));
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    return {
      subject: area.area,
      value: Math.round(avgScore),
      fullArea: area.area
    };
  });

  // Summary Counts
  const getSummaryCounts = (areaIndices: number[]) => {
    let s = 0, n = 0, i = 0, none = 0;
    areaIndices.forEach(ai => {
      acsData[ai]?.tasks.forEach((_, ti) => {
        const grade = getMostRecentGrade(ai, ti);
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
              <div className="text-[11px] text-[#6b7280] mt-1 font-medium italic">Based on {masteredTasks} of 46 tasks mastered</div>
            </div>
          </div>
        </div>
      </div>

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
              <p className="text-[10px] text-[#6b7280] font-medium italic">Area scores averaged across all component tasks</p>
            </div>
          </div>
        </motion.div>
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
            {lessons.slice(-3).reverse().map((l) => (
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
    </div>
  );
}
