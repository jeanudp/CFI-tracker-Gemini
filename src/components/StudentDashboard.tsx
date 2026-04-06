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
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_name', studentName)
        .order('saved_at', { ascending: true });
      
      if (lessonsError) throw lessonsError;
      
      setLessons(lessonsData || []);
      
      const savedRating = JSON.parse(localStorage.getItem('selected_rating') || '{}');
      if (savedRating.code) {
        setRating((RATINGS as any)[savedRating.code] || Object.values(RATINGS)[0]);
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
      .filter(task => !task.includes('N/A') && !task.includes('ASEL') && !task.includes('Seaplane') && !task.includes('Water'))
      .map((task, ti) => {
        const id = `${ai}_${ti}`;
      const nGrades = lessons.filter(l => l.grades?.[id] === 'N').length;
      const iGrades = lessons.filter(l => l.grades?.[id] === 'I').length;
      const totalAttempts = lessons.filter(l => l.grades?.[id]).length;
      const isMastered = lessons.some(l => l.grades?.[id] === 'S');
      return { task, area: area.area, nGrades, iGrades, totalAttempts, isMastered, score: nGrades * 2 + iGrades };
    })
  ).filter(t => t.score > 0 && !t.isMastered)
   .sort((a, b) => b.score - a.score)
   .slice(0, 5);

  // 5. Readiness Score
  const totalTasks = acsData.reduce((acc, area) => 
    acc + area.tasks.filter(t => !t.includes('N/A') && !t.includes('ASEL') && !t.includes('Seaplane') && !t.includes('Water')).length, 0);
  const masteredTasks = acsData.flatMap((area, ai) => 
    area.tasks
      .filter(t => !t.includes('N/A') && !t.includes('ASEL') && !t.includes('Seaplane') && !t.includes('Water'))
      .map((_, ti) => `${ai}_${ti}`)
  ).filter(id => lessons.some(l => l.grades?.[id] === 'S')).length;
  const readinessScore = totalTasks > 0 ? Math.round((masteredTasks / totalTasks) * 100) : 0;

  // 6. Consistency Score (based on last 3 lessons)
  const last3 = lessons.slice(-3);
  const consistencyScore = last3.length > 0 ? Math.round(last3.reduce((acc, l) => {
    const grades = Object.values(l.grades || {});
    const s = grades.filter(g => g === 'S').length;
    return acc + (grades.length > 0 ? (s / grades.length) : 0);
  }, 0) / last3.length * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-xl bg-white border border-[#dde3ec] text-[#6b7280] hover:text-[#1a3a5c] hover:border-[#1a3a5c] transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">{studentName}'s Progress</h1>
            <p className="text-[#6b7280] text-sm font-medium">{rating.label} · {lessons.length} Lessons Completed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dde3ec] rounded-xl text-sm font-bold text-[#1a3a5c] hover:bg-[#f4f5f7] transition-all shadow-sm">
            <Share2 size={16} />
            Share Report
          </button>
          <Link to="/history" className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] text-white rounded-xl text-sm font-bold hover:bg-[#2a5a8c] transition-all shadow-md">
            View History
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#e4f5ec] rounded-lg text-[#2d7a4f]"><Target size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Readiness Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-mono font-bold text-[#1a3a5c]">{readinessScore}%</span>
            <span className="text-xs text-[#6b7280] mb-1.5">to checkride</span>
          </div>
          <div className="mt-3 h-1.5 bg-[#f4f5f7] rounded-full overflow-hidden">
            <div className="h-full bg-[#2d7a4f]" style={{ width: `${readinessScore}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dde3ec] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#d4e8f5] rounded-lg text-[#2a5a8c]"><TrendingUp size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Consistency</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-mono font-bold text-[#1a3a5c]">{consistencyScore}%</span>
            <span className="text-xs text-[#6b7280] mb-1.5">last 3 lessons</span>
          </div>
          <div className="mt-3 h-1.5 bg-[#f4f5f7] rounded-full overflow-hidden">
            <div className="h-full bg-[#2a5a8c]" style={{ width: `${consistencyScore}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dde3ec] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#fdf0d4] rounded-lg text-[#e8a020]"><Clock size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Total Hours</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-mono font-bold text-[#1a3a5c]">{cumulativeHours.toFixed(1)}</span>
            <span className="text-xs text-[#6b7280] mb-1.5">logged</span>
          </div>
          <div className="mt-3 text-[10px] text-[#6b7280] font-medium">Avg {lessons.length > 0 ? (cumulativeHours / lessons.length).toFixed(1) : 0}h per lesson</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dde3ec] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#fdecea] rounded-lg text-[#c0392b]"><AlertTriangle size={20} /></div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Weak Areas</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-mono font-bold text-[#1a3a5c]">{weakAreas.length}</span>
            <span className="text-xs text-[#6b7280] mb-1.5">priority tasks</span>
          </div>
          <div className="mt-3 text-[10px] text-[#6b7280] font-medium">Requiring immediate focus</div>
        </div>
      </div>

      {/* ACS Mastery Maps */}
      <div className="space-y-6 mb-8">
        {/* Map 1: Ground Mastery Map */}
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1c2333] mb-6 flex items-center gap-2">
            <BookOpen size={18} className="text-[#1a3a5c]" />
            Ground ACS Mastery — Area I
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {acsData[0]?.tasks.filter(t => !t.includes('N/A') && !t.includes('ASEL') && !t.includes('Seaplane') && !t.includes('Water')).map((task, ti) => {
              const grade = getMostRecentGrade(0, ti);
              const { letter, name } = parseTask(task);
              return (
                <div 
                  key={ti}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col items-center justify-center text-center min-h-[80px] transition-all hover:scale-105 shadow-sm",
                    getGradeColor(grade)
                  )}
                >
                  <span className="text-lg font-black leading-none mb-1">{letter}</span>
                  <span className="text-[9px] font-bold leading-tight uppercase opacity-80">{name}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-[#f4f5f7]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#2d7a4f]" />
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Satisfactory (S)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#c0392b]" />
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Needs Improvement (N)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e8a020]" />
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Incomplete (I)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f4f5f7]" />
              <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Not Graded</span>
            </div>
          </div>
        </div>

        {/* Map 2: Flight ACS Mastery Map */}
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1c2333] mb-6 flex items-center gap-2">
            <Target size={18} className="text-[#2d7a4f]" />
            Flight ACS Mastery — Areas II through XII
          </h3>

          <div className="space-y-8">
            {acsData.slice(1).map((area, aiOffset) => {
              const ai = aiOffset + 1;
              const filteredTasks = area.tasks.filter(t => 
                !t.includes('N/A') && 
                !t.includes('Seaplane') && 
                !t.includes('Multiengine') &&
                !t.includes('ASEL') && 
                !t.includes('Water')
              );

              if (filteredTasks.length === 0) return null;

              return (
                <div key={ai} className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dde3ec]" />
                    {area.area}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                    {filteredTasks.map((task, ti) => {
                      const originalTi = area.tasks.indexOf(task);
                      const grade = getMostRecentGrade(ai, originalTi);
                      const { letter, name } = parseTask(task);
                      return (
                        <div 
                          key={ti}
                          className={cn(
                            "p-3 rounded-xl border flex flex-col items-center justify-center text-center min-h-[80px] transition-all hover:scale-105 shadow-sm",
                            getGradeColor(grade)
                          )}
                        >
                          <span className="text-lg font-black leading-none mb-1">{letter}</span>
                          <span className="text-[9px] font-bold leading-tight uppercase opacity-80">{name}</span>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grade Trend */}
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1c2333] mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#2a5a8c]" />
            Grade Trend Analysis
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f5f7" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="satisfactory" stroke="#2d7a4f" strokeWidth={3} dot={{ r: 4, fill: '#2d7a4f' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="needsImprovement" stroke="#c0392b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#c0392b' }} />
                <Line type="monotone" dataKey="incomplete" stroke="#e8a020" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: '#e8a020' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hours Progress */}
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1c2333] mb-6 flex items-center gap-2">
            <Clock size={18} className="text-[#e8a020]" />
            Aeronautical Experience Growth
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hoursData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a3a5c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f5f7" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="cumulative" stroke="#1a3a5c" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                <Bar dataKey="hours" fill="#e8a020" radius={[4, 4, 0, 0]} barSize={20} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Areas Report */}
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1c2333] mb-6 flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#c0392b]" />
            Weak Areas Report
          </h3>
          <div className="space-y-4">
            {weakAreas.length > 0 ? weakAreas.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 bg-[#fdecea] rounded-xl border border-[#f5c0bc]">
                <div className="w-8 h-8 rounded-full bg-[#c0392b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#1c2333] truncate">{item.task}</div>
                  <div className="text-[10px] text-[#6b7280] mt-0.5">{item.area}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#c0392b] bg-white px-1.5 py-0.5 rounded">
                      {item.nGrades} Needs Impr.
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#e8a020] bg-white px-1.5 py-0.5 rounded">
                      {item.iGrades} Incomplete
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-[#6b7280] italic text-sm">
                <CheckCircle2 size={32} className="text-[#2d7a4f] mb-2 opacity-20" />
                No critical weak areas identified.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Timeline */}
      <div className="bg-white rounded-2xl border border-[#dde3ec] p-6 shadow-sm mb-8">
        <h3 className="text-sm font-bold text-[#1c2333] mb-6 flex items-center gap-2">
          <Calendar size={18} className="text-[#1a3a5c]" />
          Lesson Notes Timeline
        </h3>
        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#f4f5f7]">
          {lessons.slice().reverse().map((l, idx) => (
            <div key={l.id} className="relative pl-10">
              <div className="absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full bg-[#1a3a5c] border-2 border-white shadow-sm" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#1c2333]">{l.label}</span>
                  <span className="text-[10px] font-mono text-[#6b7280]">{new Date(l.saved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex gap-1.5">
                  {Object.values(l.grades || {}).filter(g => g === 'S').length > 0 && (
                    <span className="text-[9px] font-bold bg-[#e4f5ec] text-[#2d7a4f] px-1.5 py-0.5 rounded">
                      {Object.values(l.grades || {}).filter(g => g === 'S').length} S
                    </span>
                  )}
                  {Object.values(l.grades || {}).filter(g => g === 'N').length > 0 && (
                    <span className="text-[9px] font-bold bg-[#fdecea] text-[#c0392b] px-1.5 py-0.5 rounded">
                      {Object.values(l.grades || {}).filter(g => g === 'N').length} N
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-[#f4f5f7] rounded-xl text-xs text-[#6b7280] leading-relaxed italic">
                {l.meta?.notes || "No notes recorded for this lesson."}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
