import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Copy, Check, Plus, RefreshCw, Shield, Users, Key, LogOut, X } from 'lucide-react';

const ADMIN_EMAIL = 'jeanudp@gmail.com';

export default function Admin() {
  const [codes, setCodes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    if (session.user.email !== ADMIN_EMAIL) {
      navigate('/dashboard');
      return;
    }
    setUserEmail(session.user.email);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesRes, subsRes, lessonsRes] = await Promise.all([
        supabase.from('invite_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('lessons').select('*').order('saved_at', { ascending: false }),
      ]);
      setCodes(codesRes.data || []);
      setUsers(subsRes.data || []);
      setAllLessons(lessonsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const segments = [4, 4, 4];
      let newCode = '';
      let isUnique = false;
      const existing = codes.map(c => c.code);

      while (!isUnique) {
        const parts = segments.map(len =>
          Array.from({ length: len }, () =>
            chars[Math.floor(Math.random() * chars.length)]
          ).join('')
        );
        newCode = `61T-${parts.join('-')}`;
        if (!existing.includes(newCode)) isUnique = true;
      }

      const { error } = await supabase.from('invite_codes').insert({ code: newCode });
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevokeInvite = async (email: string, codeId: string) => {
    if (!window.confirm(`Revoke access for ${email}? This will lock their account to PPL only.`)) return;
    try {
      // Reset their subscription to free
      await supabase
        .from('user_subscriptions')
        .update({
          plan: 'free',
          ratings_unlocked: ['ppl'],
        })
        .eq('email', email);

      // Mark the invite code as unused so it can be reused
      await supabase
        .from('invite_codes')
        .update({
          used: false,
          used_by: null,
          used_at: null,
        })
        .eq('id', codeId);

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const unusedCodes = codes.filter(c => !c.used);
  const usedCodes = codes.filter(c => c.used);
  const paidUsers = users.filter(u => u.plan !== 'free');
  const freeUsers = users.filter(u => u.plan === 'free');

  // Platform Stats
  const totalLessons = allLessons.length;
  const totalHours = allLessons.reduce((acc, l) => acc + parseFloat(l.meta?.totalFlight || '0'), 0);
  const uniqueStudents = new Set(allLessons.map(l => l.student_name)).size;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const lessonsLast7Days = allLessons.filter(l => new Date(l.saved_at) >= sevenDaysAgo).length;
  const lessonsLast30Days = allLessons.filter(l => new Date(l.saved_at) >= thirtyDaysAgo).length;

  // CFI Activity
  const cfiActivity = users.map(user => {
    const userLessons = allLessons.filter(l => l.user_id === user.user_id);
    const userStudents = new Set(userLessons.map(l => l.student_name)).size;
    const userHours = userLessons.reduce((acc, l) => acc + parseFloat(l.meta?.totalFlight || '0'), 0);
    const lastLesson = userLessons.length > 0 ? userLessons[0].saved_at : null;
    
    return {
      email: user.email,
      students: userStudents,
      lessons: userLessons.length,
      hours: userHours,
      lastLesson
    };
  }).sort((a, b) => {
    if (!a.lastLesson) return 1;
    if (!b.lastLesson) return -1;
    return new Date(b.lastLesson).getTime() - new Date(a.lastLesson).getTime();
  });

  // Recent Activity Feed
  const recentLessons = allLessons.slice(0, 20).map(lesson => {
    const cfi = users.find(u => u.user_id === lesson.user_id);
    return {
      ...lesson,
      cfiEmail: cfi?.email || 'Unknown CFI'
    };
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20 px-6 h-16 border-b flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 2px 12px rgba(26,58,92,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black" style={{ color: 'var(--navy)' }}>61 Tracker Admin</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <LogOut size={13} />
            Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {error && (
          <div className="p-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: '#1a3a5c', icon: Users },
            { label: 'Paid / Trial', value: paidUsers.length, color: '#2d7a4f', icon: Shield },
            { label: 'Free Users', value: freeUsers.length, color: '#e8a020', icon: Users },
            { label: 'Unused Codes', value: unusedCodes.length, color: '#7c3aed', icon: Key },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 8px rgba(26,58,92,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Lessons', value: totalLessons, color: '#1a3a5c' },
            { label: 'Flight Hours', value: totalHours.toFixed(1), color: '#2d7a4f' },
            { label: 'Total Students', value: uniqueStudents, color: '#e8a020' },
            { label: 'Last 7 Days', value: lessonsLast7Days, color: '#f59e0b' },
            { label: 'Last 30 Days', value: lessonsLast30Days, color: '#10b981' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 8px rgba(26,58,92,0.06)',
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
              <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="space-y-6">
          <div className="pt-4 border-t flex flex-col gap-0.5" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-black" style={{ color: 'var(--navy)' }}>Analytics</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>Platform usage, metrics, and educational compliance statistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Subsection 1 — User Engagement */}
            <div
              className="rounded-2xl border p-6 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 4px 16px rgba(26,58,92,0.08)',
              }}
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>User Engagement</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Active Users (30d)', value: users.filter(u => allLessons.some(l => l.user_id === u.user_id && new Date(l.saved_at) >= thirtyDaysAgo)).length, color: '#1a3a5c' },
                    { label: 'Dormant Users', value: users.filter(u => !allLessons.some(l => l.user_id === u.user_id && new Date(l.saved_at) >= thirtyDaysAgo)).length, color: '#e8a020' },
                    { label: 'Never Logged', value: users.filter(u => !allLessons.some(l => l.user_id === u.user_id)).length, color: '#9ca3af' },
                    { label: 'Avg Lessons / Active User', value: (() => {
                      const activeUsersCount = users.filter(u => allLessons.some(l => l.user_id === u.user_id && new Date(l.saved_at) >= thirtyDaysAgo)).length;
                      return activeUsersCount > 0 ? (totalLessons / activeUsersCount).toFixed(1) : "0.0";
                    })(), color: '#2d7a4f' },
                  ].map(engagementStat => (
                    <div key={engagementStat.label} className="p-3 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-widest block mb-1 truncate" style={{ color: 'var(--text-muted)' }}>{engagementStat.label}</span>
                      <div className="text-xl font-black" style={{ color: engagementStat.color }}>{engagementStat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subsection 2 — Lesson Type Breakdown */}
            <div
              className="rounded-2xl border p-6 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 4px 16px rgba(26,58,92,0.08)',
              }}
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>Lesson Type Breakdown</h3>
                {(() => {
                  const countFlight = allLessons.filter(l => l.type === 'flight').length;
                  const countGround = allLessons.filter(l => l.type === 'ground').length;
                  const countFlightReview = allLessons.filter(l => l.type === 'flight_review').length;
                  const countIPC = allLessons.filter(l => l.type === 'ipc').length;
                  const countOther = allLessons.filter(l => !['flight', 'ground', 'flight_review', 'ipc'].includes(l.type)).length;

                  const totalAllLessons = allLessons.length;
                  const getPct = (cnt: number) => {
                    if (totalAllLessons === 0) return "0.0%";
                    return `${((cnt / totalAllLessons) * 100).toFixed(1)}%`;
                  };

                  const flightPctNum = totalAllLessons > 0 ? (countFlight / totalAllLessons) * 100 : 0;
                  const groundPctNum = totalAllLessons > 0 ? (countGround / totalAllLessons) * 100 : 0;
                  const bfrPctNum = totalAllLessons > 0 ? (countFlightReview / totalAllLessons) * 100 : 0;
                  const ipcPctNum = totalAllLessons > 0 ? (countIPC / totalAllLessons) * 100 : 0;
                  const otherPctNum = totalAllLessons > 0 ? (countOther / totalAllLessons) * 100 : 0;

                  return (
                    <>
                      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex mb-4">
                        <div style={{ width: `${flightPctNum}%`, backgroundColor: '#1a3a5c' }} title={`Flight: ${countFlight}`} />
                        <div style={{ width: `${groundPctNum}%`, backgroundColor: '#e8a020' }} title={`Ground: ${countGround}`} />
                        <div style={{ width: `${bfrPctNum}%`, backgroundColor: '#7c3aed' }} title={`BFR: ${countFlightReview}`} />
                        <div style={{ width: `${ipcPctNum}%`, backgroundColor: '#2d7a4f' }} title={`IPC: ${countIPC}`} />
                        <div style={{ width: `${otherPctNum}%`, backgroundColor: '#9ca3af' }} title={`Other: ${countOther}`} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Flight', count: countFlight, color: '#1a3a5c' },
                          { label: 'Ground', count: countGround, color: '#e8a020' },
                          { label: 'BFR', count: countFlightReview, color: '#7c3aed' },
                          { label: 'IPC', count: countIPC, color: '#2d7a4f' },
                          { label: 'Other', count: countOther, color: '#9ca3af' },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                            <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                              {item.count} ({getPct(item.count)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Subsection 3 — Training Focus (Top Ratings) */}
            <div
              className="rounded-2xl border p-6 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 4px 16px rgba(26,58,92,0.08)',
              }}
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>Most Trained Ratings</h3>
                {(() => {
                  const ratingCounts: Record<string, number> = {};
                  allLessons.forEach(l => {
                    const code = l.meta?.rating_code;
                    if (code) {
                      ratingCounts[code] = (ratingCounts[code] || 0) + 1;
                    }
                  });
                  const sortedRatings = Object.entries(ratingCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6);

                  if (sortedRatings.length === 0) {
                    return <div className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No training focus data found.</div>;
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {sortedRatings.map(([code, count]) => (
                        <div key={code} className="p-3 rounded-xl border flex flex-col justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                          <span className="text-[9px] font-bold uppercase tracking-widest truncate" style={{ color: 'var(--text-muted)' }}>{code}</span>
                          <span className="text-sm font-black mt-1" style={{ color: 'var(--navy)' }}>{count} {count === 1 ? 'lesson' : 'lessons'}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Subsection 4 — Feature Adoption */}
            <div
              className="rounded-2xl border p-6 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 4px 16px rgba(26,58,92,0.08)',
              }}
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>Feature Adoption</h3>
                {(() => {
                  const gradedLessonsCount = allLessons.filter(l => l.meta?.overallGrade === 'S' || l.meta?.overallGrade === 'N').length;
                  const gradedPct = totalLessons > 0 ? (gradedLessonsCount / totalLessons) * 100 : 0;

                  const flightTimeLessonsCount = allLessons.filter(l => {
                    const flight = parseFloat(l.meta?.totalFlight || '0');
                    return !isNaN(flight) && flight > 0;
                  }).length;
                  const flightTimePct = totalLessons > 0 ? (flightTimeLessonsCount / totalLessons) * 100 : 0;

                  const notesLessonsCount = allLessons.filter(l => typeof l.meta?.notes === 'string' && l.meta.notes.trim() !== '').length;
                  const notesPct = totalLessons > 0 ? (notesLessonsCount / totalLessons) * 100 : 0;

                  const acsLessonsCount = allLessons.filter(l => l.grades && typeof l.grades === 'object' && Object.keys(l.grades).length > 0).length;
                  const acsPct = totalLessons > 0 ? (acsLessonsCount / totalLessons) * 100 : 0;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Lessons Graded', pct: gradedPct, count: gradedLessonsCount },
                        { label: 'Flight Time Logged', pct: flightTimePct, count: flightTimeLessonsCount },
                        { label: 'Notes Written', pct: notesPct, count: notesLessonsCount },
                        { label: 'ACS Tasks Used', pct: acsPct, count: acsLessonsCount },
                      ].map(item => (
                        <div key={item.label} className="p-3 rounded-xl border flex flex-col justify-center" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                          <span className="text-[9px] font-bold uppercase tracking-widest block mb-1 truncate" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                          <div className="text-sm font-black truncate" style={{ color: 'var(--navy)' }}>
                            {item.pct.toFixed(1)}%
                            <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}> — {item.count} {item.count === 1 ? 'lesson' : 'lessons'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Subsection 5 — Grade Health */}
            <div
              className="rounded-2xl border p-6 flex flex-col justify-between md:col-span-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 4px 16px rgba(26,58,92,0.08)',
              }}
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-primary)' }}>Grade Health</h3>
                {(() => {
                  const gradedList = allLessons.filter(l => l.meta?.overallGrade === 'S' || l.meta?.overallGrade === 'N');
                  const totalGraded = gradedList.length;
                  const countS = gradedList.filter(l => l.meta?.overallGrade === 'S').length;
                  const countN = gradedList.filter(l => l.meta?.overallGrade === 'N').length;

                  const pctS = totalGraded > 0 ? (countS / totalGraded) * 100 : 0;
                  const pctN = totalGraded > 0 ? (countN / totalGraded) * 100 : 0;

                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Satisfactory Card (Green) */}
                      <div className="p-4 rounded-xl border flex flex-col justify-between shadow-sm" style={{ borderColor: '#2d7a4f', backgroundColor: 'rgba(45,122,79,0.05)' }}>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-[#2d7a4f]">Satisfactory (S)</span>
                          <div className="text-3xl font-black text-[#2d7a4f]">{pctS.toFixed(1)}%</div>
                        </div>
                        <div className="text-xs font-bold mt-2 text-[#2d7a4f] opacity-80">
                          {countS} {countS === 1 ? 'lesson' : 'lessons'}
                        </div>
                      </div>

                      {/* Needs Improvement Card (Red) */}
                      <div className="p-4 rounded-xl border flex flex-col justify-between shadow-sm" style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)' }}>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest block mb-1 text-[#ef4444]">Needs Improvement (N)</span>
                          <div className="text-3xl font-black text-[#ef4444]">{pctN.toFixed(1)}%</div>
                        </div>
                        <div className="text-xs font-bold mt-2 text-[#ef4444] opacity-80">
                          {countN} {countN === 1 ? 'lesson' : 'lessons'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        </div>

        {/* Invite Codes */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Invite Codes</h2>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{unusedCodes.length} unused · {usedCodes.length} used</p>
            </div>
            <button
              onClick={generateCode}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: '#1a3a5c', boxShadow: '0 4px 12px rgba(26,58,92,0.3)' }}
            >
              <Plus size={13} />
              {generating ? 'Generating...' : 'New Code'}
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {/* Unused codes first */}
              {unusedCodes.map(code => (
                <div key={code.id} className="px-6 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{code.code}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: 'rgba(45,122,79,0.1)', color: '#2d7a4f' }}>Available</span>
                  </div>
                  <button
                    onClick={() => copyCode(code.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-[var(--bg-secondary)] cursor-pointer"
                    style={{ color: copiedCode === code.code ? '#2d7a4f' : 'var(--navy)', backgroundColor: copiedCode === code.code ? 'rgba(45,122,79,0.1)' : 'var(--bg-tertiary)' }}
                  >
                    {copiedCode === code.code ? <Check size={12} /> : <Copy size={12} />}
                    {copiedCode === code.code ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
              {/* Used codes */}
              {usedCodes.map(code => (
                <div key={code.id} className="px-6 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{code.code}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Used</span>
                    {code.used_by && (
                      <span className="text-[10px] truncate max-w-[120px] sm:max-w-none" style={{ color: 'var(--text-muted)' }}>{code.used_by}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRevokeInvite(code.used_by, code.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80 cursor-pointer"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                    title="Revoke access"
                  >
                    <X size={12} />
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CFI Activity */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>CFI Activity</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Grouped by instructor</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Instructor</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Students</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Lessons</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Hours</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {cfiActivity.map((cfi, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-6 py-3">
                      <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{cfi.email}</div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="text-xs font-mono font-bold" style={{ color: 'var(--navy)' }}>{cfi.students}</div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="text-xs font-mono font-bold" style={{ color: 'var(--navy)' }}>{cfi.lessons}</div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="text-xs font-mono font-bold text-green-600">{cfi.hours.toFixed(1)}</div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                        {cfi.lastLesson ? formatRelativeTime(cfi.lastLesson) : 'Never'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Latest 20 lessons platform-wide</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {recentLessons.map((lesson, idx) => (
              <div key={idx} className="px-6 py-4 hover:bg-[var(--bg-tertiary)] transition-colors flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{lesson.meta?.lesson_num || '—'}. {lesson.student_name}</span>
                    <span className="shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter" 
                      style={{ 
                        backgroundColor: lesson.type === 'flight' ? 'rgba(26,58,92,0.1)' : 'rgba(232,160,32,0.1)',
                        color: lesson.type === 'flight' ? 'var(--navy)' : '#e8a020'
                      }}
                    >
                      {lesson.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-bold">{lesson.cfiEmail}</span>
                    <span>•</span>
                    <span>{parseFloat(lesson.meta?.totalFlight || '0').toFixed(1)}h</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--navy)' }}>
                    {formatRelativeTime(lesson.saved_at)}
                  </div>
                  <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                    {new Date(lesson.saved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>All Users</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {users.length} total accounts · {users.filter(u => u.account_type !== 'student').length} CFIs · {users.filter(u => u.account_type === 'student').length} Students
            </p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {users.map(user => {
                const planColors: Record<string, string> = {
                  free: '#9ca3af',
                  invite: '#7c3aed',
                  all_monthly: '#2d7a4f',
                  all_annual: '#2d7a4f',
                };
                const color = planColors[user.plan] || '#9ca3af';
                const isStudent = user.account_type === 'student';

                return (
                  <div key={user.id} className="px-6 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold truncate max-w-[140px] sm:max-w-none" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          backgroundColor: isStudent ? 'rgba(232,160,32,0.1)' : 'rgba(26,58,92,0.1)',
                          color: isStudent ? '#e8a020' : 'var(--navy)',
                        }}
                      >
                        {isStudent ? 'Student' : 'CFI'}
                      </span>
                      <span
                        className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {user.plan}
                      </span>
                      <span
                        className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          backgroundColor: user.status === 'active' || user.status === 'trialing' ? 'rgba(45,122,79,0.1)' : 'rgba(239,68,68,0.1)',
                          color: user.status === 'active' || user.status === 'trialing' ? '#2d7a4f' : '#ef4444',
                        }}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
