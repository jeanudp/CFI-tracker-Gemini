import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Calendar, ChevronDown, Search, BookOpenCheck, History as HistoryIcon, Loader2, AlertTriangle, X } from 'lucide-react';

interface ScheduleMenuProps {
  className?: string;
}

export default function ScheduleMenu({ className }: ScheduleMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [isSchoolMember, setIsSchoolMember] = useState(false);
  const [checkingMembership, setCheckingMembership] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [findStudentOpen, setFindStudentOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Schedulable student states
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForActions, setSelectedStudentForActions] = useState<any | null>(null);

  // Check flight school membership on mount
  useEffect(() => {
    let active = true;
    const checkMembership = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session || !session.user) {
          if (active) {
            setIsSchoolMember(false);
            setCheckingMembership(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('organization_members')
          .select('org_id')
          .eq('user_id', session.user.id);

        if (error) throw error;

        if (active) {
          setIsSchoolMember(data && data.length > 0);
        }
      } catch (err) {
        console.error('Error checking flight school membership:', err);
        if (active) {
          setIsSchoolMember(false);
        }
      } finally {
        if (active) {
          setCheckingMembership(false);
        }
      }
    };

    checkMembership();
    return () => {
      active = false;
    };
  }, []);

  // Fetch schedulable students when search modal is opened
  useEffect(() => {
    if (findStudentOpen) {
      const fetchStudents = async () => {
        setLoadingStudents(true);
        setStudentError(null);
        try {
          const { data, error } = await supabase.rpc('get_schedulable_students');
          if (error) throw error;
          setStudents(data || []);
        } catch (err: any) {
          console.error("Error loading schedulable students:", err);
          setStudentError('Failed to load students');
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [findStudentOpen]);

  // Outside click to close schedule dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (scheduleRef.current && !scheduleRef.current.contains(e.target as Node)) {
        setScheduleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close schedule dropdown on route changes
  useEffect(() => {
    setScheduleOpen(false);
  }, [path]);

  const handleHistoryAction = (student: any) => {
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('sb_selected_student_id', student.id);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: student.name }));
    setFindStudentOpen(false);
    setSelectedStudentForActions(null);
    setSearchQuery('');
    navigate('/history');
  };

  const handleLogLessonAction = (student: any) => {
    localStorage.removeItem('faa_ground_grades');
    localStorage.removeItem('faa_ground_notes');
    localStorage.removeItem('faa_flight_grades');
    localStorage.removeItem('faa_flight_notes');
    localStorage.removeItem('current_lesson_id');
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('sb_selected_student_id', student.id);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: student.name }));
    
    const ratingCode = student.current_rating || student.currentRating || student.rating || 'ppl';
    const ratingLabel = student.current_rating_label || student.currentRatingLabel || student.rating_label || 'Private Pilot ASEL';
    
    localStorage.setItem('selected_rating', JSON.stringify({
      code: ratingCode,
      label: ratingLabel,
    }));
    setFindStudentOpen(false);
    setSelectedStudentForActions(null);
    setSearchQuery('');
    navigate('/lesson-type');
  };

  const handleScheduleAction = (student: any) => {
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('sb_selected_student_id', student.id);
    setFindStudentOpen(false);
    setSelectedStudentForActions(null);
    setSearchQuery('');
    navigate(`/schedule?new=1&studentId=${student.id}`);
  };

  // While checking membership, fallback to simple button
  if (checkingMembership || !isSchoolMember) {
    return (
      <Link
        to="/schedule"
        className={cn(
          "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-md",
          className
        )}
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}
      >
        <Calendar size={14} />
        <span className="hidden sm:inline">Schedule</span>
      </Link>
    );
  }

  // Active flight school member gets the dropdown and the search modal
  return (
    <>
      <div className="relative" ref={scheduleRef}>
        <button
          onClick={() => { setScheduleOpen(!scheduleOpen); }}
          className={cn(
            "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:shadow-md",
            className
          )}
          style={{
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            backgroundColor: scheduleOpen ? 'var(--bg-tertiary)' : 'transparent'
          }}
        >
          <Calendar size={14} />
          <span className="hidden sm:inline">Schedule</span>
          <ChevronDown size={12} className={cn("transition-transform", scheduleOpen && "rotate-180")} />
        </button>

        {scheduleOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-2xl border shadow-xl overflow-hidden z-50"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
          >
            <div className="p-1.5 space-y-0.5">
              <Link
                to="/schedule"
                onClick={() => setScheduleOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[var(--bg-tertiary)] transition-all"
                style={{ color: 'var(--text-primary)' }}
              >
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                Open Schedule
              </Link>
              <Link
                to="/schedule?new=1"
                onClick={() => setScheduleOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[var(--bg-tertiary)] transition-all"
                style={{ color: 'var(--text-primary)' }}
              >
                <BookOpenCheck size={14} style={{ color: 'var(--text-muted)' }} />
                New Booking
              </Link>
              <button
                onClick={() => {
                  setScheduleOpen(false);
                  setFindStudentOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[var(--bg-tertiary)] transition-all text-left"
                style={{ color: 'var(--text-primary)' }}
              >
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                Find a Student
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Find a Student Modal */}
      {findStudentOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => { setFindStudentOpen(false); setSelectedStudentForActions(null); setSearchQuery(''); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <Search size={18} className="text-[#e8a020]" />
                <div>
                  <h3 className="text-sm font-black text-[var(--navy)]" style={{ color: 'var(--text-primary)' }}>
                    Find a Student
                  </h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Search and trigger quick actions for any schedulable student</p>
                </div>
              </div>
              <button
                onClick={() => { setFindStudentOpen(false); setSelectedStudentForActions(null); setSearchQuery(''); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b bg-[var(--bg-tertiary)]/30" style={{ borderColor: 'var(--border-color)' }}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-muted)]">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Type student name to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full text-sm rounded-xl pl-10 pr-4 py-2.5 border focus:outline-none transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingStudents ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--text-muted)]">
                  <Loader2 size={24} className="animate-spin text-[#e8a020]" />
                  <p className="text-xs font-semibold">Loading schedulable students...</p>
                </div>
              ) : studentError ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-red-500">
                  <AlertTriangle size={24} />
                  <p className="text-xs font-semibold">{studentError}</p>
                </div>
              ) : (() => {
                const filtered = students.filter(s => 
                  (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] text-center">
                      <p className="text-sm font-bold">No students found</p>
                      <p className="text-xs max-w-xs mt-1">Try another search term or verify you have schedulable students.</p>
                    </div>
                  );
                }

                return filtered.map(s => {
                  const isSchool = s.is_school_student || s.isSchoolStudent || s.is_school || s.isSchool;
                  const cfiName = s.assigned_cfi_name || s.assignedCfiName || s.cfi_name;
                  const isSelected = selectedStudentForActions?.id === s.id;

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm",
                        isSelected 
                          ? "border-[#e8a020] bg-[rgba(232,160,32,0.05)]" 
                          : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]/40"
                      )}
                      onClick={() => {
                        setSelectedStudentForActions(isSelected ? null : s);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                          {isSchool && (
                            <span 
                              className="text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase text-white"
                              style={{ backgroundColor: 'var(--navy)' }}
                            >
                              {cfiName ? `CFI: ${cfiName}` : 'School'}
                            </span>
                          )}
                        </div>
                        <ChevronDown 
                          size={16} 
                          className={cn("transition-transform text-[var(--text-muted)]", isSelected && "rotate-180")} 
                        />
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex flex-wrap gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleHistoryAction(s)}
                            className="px-3.5 py-1.5 bg-[var(--navy)] text-white text-xs font-black rounded-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                          >
                            <HistoryIcon size={12} />
                            History
                          </button>
                          <button
                            onClick={() => handleLogLessonAction(s)}
                            className="px-3.5 py-1.5 bg-[#22c55e] text-white text-xs font-black rounded-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                          >
                            <BookOpenCheck size={12} />
                            Log Lesson
                          </button>
                          <button
                            onClick={() => handleScheduleAction(s)}
                            className="px-3.5 py-1.5 text-white text-xs font-black rounded-lg hover:opacity-95 transition-all flex items-center gap-1.5"
                            style={{ backgroundColor: '#e8a020' }}
                          >
                            <Calendar size={12} />
                            Schedule
                          </button>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
