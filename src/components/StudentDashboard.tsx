import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson, Grade, Student } from '../types';
import { ALL_ACS, RATINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, TrendingUp, Target, Clock, AlertTriangle, CheckCircle2, Calendar, BookOpen, ChevronRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const parseFailedStandards = (notesString: string): { code: string, description: string }[] => {
  if (!notesString) return [];
  const match = notesString.match(/Failed standards: (.+?)(?:\. Notes:|$)/);
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
      
      const mostRecentGrade = taskGrades[0]?.grades[id] || null;
      const nGrades = taskGrades.filter(l => l.grades[id] === 'N');
      const sGrades = taskGrades.filter(l => l.grades[id] === 'S');
      
      const mostRecentN = nGrades[0];
      const hadNBefore = nGrades.length > 0;
      
      return {
        id,
        name: task.name,
        areaName: area.area,
        areaIndex: ai,
        code: task.code,
        mostRecentGrade,
        nCount: nGrades.length,
        mostRecentNDate: mostRecentN ? mostRecentN.saved_at : null,
        mostRecentNNote: mostRecentN ? mostRecentN.notes?.[id] : null,
        mostRecentSDate: sGrades[0] ? sGrades[0].saved_at : null,
        neverGraded: taskGrades.length === 0,
        isGround: ai === 0
      };
    })
  );

  const readinessScore = Math.round((taskAnalysis.filter(t => t.mostRecentGrade === 'S').length / taskAnalysis.length) * 100) || 0;
  
  const strugglingTasks = taskAnalysis
    .filter(t => t.mostRecentGrade === 'N')
    .sort((a, b) => b.nCount - a.nCount);

  const improvedTasks = taskAnalysis
    .filter(t => t.mostRecentGrade === 'S' && t.mostRecentSDate && t.nCount > 0)
    .sort((a, b) => new Date(b.mostRecentSDate!).getTime() - new Date(a.mostRecentSDate!).getTime());

  const uncoveredTasks = taskAnalysis.filter(t => t.neverGraded);
  const uncoveredByArea = acsData.map((area, ai) => ({
    area: area.area,
    tasks: uncoveredTasks.filter(t => t.areaIndex === ai)
  })).filter(a => a.tasks.length > 0);

  const groundTasks = taskAnalysis.filter(t => t.isGround);
  const flightTasks = taskAnalysis.filter(t => !t.isGround);

  const getSummary = (tasks: typeof taskAnalysis) => ({
    total: tasks.length,
    s: tasks.filter(t => t.mostRecentGrade === 'S').length,
    n: tasks.filter(t => t.mostRecentGrade === 'N').length,
    none: tasks.filter(t => t.neverGraded).length
  });

  const groundSummary = getSummary(groundTasks);
  const flightSummary = getSummary(flightTasks);

  const getReadinessColor = (score: number) => {
    if (score >= 80) return '#2d7a4f';
    if (score >= 40) return '#e8a020';
    return '#c0392b';
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
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-[#1a3a5c]">{readinessScore}%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280] mb-1">Overall Readiness</div>
            <div className="text-lg font-bold text-[#1a3a5c]">ACS Mastery Level</div>
            <div className="text-[11px] text-[#6b7280] mt-1 font-medium italic">
              {taskAnalysis.filter(t => t.mostRecentGrade === 'S').length} of {taskAnalysis.length} tasks mastered
            </div>
          </div>
        </div>
      </div>

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
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-1">Last Failed</div>
                                <div className="text-xs font-mono font-bold text-[#1a3a5c]">
                                  {task.mostRecentNDate ? new Date(task.mostRecentNDate).toLocaleDateString() : '—'}
                                </div>
                              </div>
                              <div className="px-3 py-1.5 bg-[#c0392b] text-white rounded-xl text-xs font-black shadow-sm">
                                N × {task.nCount}
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
                          S
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
