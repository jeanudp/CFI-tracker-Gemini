import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Student, Lesson, PassedRating } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ChevronRight, ChevronDown, Plane, History, Loader2, CheckCircle2, AlertCircle, Award, CheckCircle, X, Check, FileText, Cloud, Gauge, ClipboardList, Compass, Navigation, Archive, RotateCcw, Shield, XCircle, Phone, Mail, Calendar, Heart, Info, LogOut, Moon, Sun, WifiOff, BarChart3, User, Settings, Share2, Map, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { ALL_ACS, RATINGS } from '../constants';
import NewStudentModal from './NewStudentModal';

const ratingConfig: Record<string, { bg: string, text: string, light: string, border: string, icon: any, label: string }> = {
  ppl:  { bg: '#1a3a5c', text: 'white', light: '#d4e8f5', border: '#1a3a5c', icon: Plane,        label: 'Private Pilot' },
  ir:   { bg: '#7c3aed', text: 'white', light: '#ede8f8', border: '#7c3aed', icon: Cloud,        label: 'Instrument Rating' },
  cpl:  { bg: '#2d7a4f', text: 'white', light: '#e4f5ec', border: '#2d7a4f', icon: Gauge,        label: 'Commercial Pilot' },
  cfi:  { bg: '#e67e22', text: 'white', light: '#fdf0e4', border: '#e67e22', icon: ClipboardList, label: 'CFI' },
  cfii: { bg: '#16a34a', text: 'white', light: '#e0f5f2', border: '#16a34a', icon: Compass,      label: 'CFII' },
  mei:  { bg: '#c0392b', text: 'white', light: '#fdecea', border: '#c0392b', icon: Navigation,   label: 'MEI' },
};

function getMedicalStatus(medicalClass: string, examDateStr: string, dobStr: string) {
  if (!medicalClass || !examDateStr || !dobStr) return null;

  const examDate = new Date(examDateStr);
  const dob = new Date(dobStr);
  const today = new Date();

  // Age at time of exam
  let ageAtExam = examDate.getFullYear() - dob.getFullYear();
  const m = examDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && examDate.getDate() < dob.getDate())) {
    ageAtExam--;
  }

  let monthsOfValidity = 0;
  let firstClassMonths = 0;
  let secondClassMonths = 12;

  if (medicalClass === 'First Class') {
    firstClassMonths = ageAtExam < 40 ? 12 : 6;
    monthsOfValidity = ageAtExam < 40 ? 60 : 24;
  } else if (medicalClass === 'Second Class') {
    monthsOfValidity = ageAtExam < 40 ? 60 : 24;
  } else if (medicalClass === 'Third Class') {
    monthsOfValidity = ageAtExam < 40 ? 60 : 24;
  } else if (medicalClass === 'BasicMed') {
    monthsOfValidity = 48;
  } else if (medicalClass === 'Sport Pilot') {
    monthsOfValidity = 1440; // 120 years
  }

  const expiryDate = new Date(examDate);
  expiryDate.setMonth(expiryDate.getMonth() + monthsOfValidity + 1);
  expiryDate.setDate(0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = daysUntilExpiry < 0;

  let currentPrivileges = medicalClass;
  if (medicalClass === 'First Class') {
    const firstExpiry = new Date(examDate);
    firstExpiry.setMonth(firstExpiry.getMonth() + firstClassMonths + 1);
    firstExpiry.setDate(0);
    if (today > firstExpiry) {
      currentPrivileges = "1st — 3rd Class Privileges";
    }
  } else if (medicalClass === 'Second Class') {
    const secondExpiry = new Date(examDate);
    secondExpiry.setMonth(secondExpiry.getMonth() + secondClassMonths + 1);
    secondExpiry.setDate(0);
    if (today > secondExpiry) {
      currentPrivileges = "2nd — 3rd Class Privileges";
    }
  }

  if (isExpired) currentPrivileges = "Expired";

  let statusColor = "green";
  if (isExpired || daysUntilExpiry < 30) {
    statusColor = "red";
  } else if (daysUntilExpiry <= 60) {
    statusColor = "amber";
  }

  return {
    currentClass: medicalClass,
    currentPrivileges,
    isExpired,
    expiryDate,
    daysUntilExpiry,
    statusColor
  };
}

const CurrencyRow = ({ title, reference, isCurrent, isNotApplicable, classBadge, children, isExpanded, onToggle }: {
  title: string, reference: string, isCurrent: boolean, isNotApplicable?: boolean,
  classBadge?: 'ASEL' | 'AMEL', children: React.ReactNode, isExpanded: boolean, onToggle: () => void
}) => (
  <div className="flex flex-col">
    <button onClick={onToggle} className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          {classBadge && (
            <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter text-white", classBadge === 'AMEL' ? "bg-[#7c3aed]" : "bg-[var(--navy)]")}>
              {classBadge}
            </span>
          )}
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{reference}</span>
      </div>
      <div className="flex items-center gap-3">
        {isNotApplicable ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>N/A</span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest" style={{ backgroundColor: isCurrent ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: isCurrent ? 'var(--green)' : 'var(--red)' }}>
            {isCurrent ? 'Current' : 'Not Current'}
          </span>
        )}
        <ChevronRight size={16} className={cn("transition-transform duration-200", isExpanded ? "rotate-90" : "rotate-0")} style={{ color: 'var(--text-secondary)' }} />
      </div>
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [recentLesson, setRecentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualHours, setManualHours] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [preSoloTestResult, setPreSoloTestResult] = useState<any>(null);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingInfo, setSavingInfo] = useState(false);
  const [isCheckrideConfirmOpen, setIsCheckrideConfirmOpen] = useState(false);
  const [isNextRatingModalOpen, setIsNextRatingModalOpen] = useState(false);
  const [isUndoConfirmOpen, setIsUndoConfirmOpen] = useState(false);
  const [processingCheckride, setProcessingCheckride] = useState(false);
  const [ratingToUndo, setRatingToUndo] = useState<PassedRating | null>(null);
  const [undoSuccess, setUndoSuccess] = useState<string | null>(null);
  const [selectedNextRating, setSelectedNextRating] = useState<string | null>(null);
  const [isCurrencyExpanded, setIsCurrencyExpanded] = useState(false);
  const [expandedCurrencyRow, setExpandedCurrencyRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [archivedExpanded, setArchivedExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [reExpWarning, setReExpWarning] = useState<number | null>(null);
  const [reExpDate, setReExpDate] = useState<string>('');
  const [showReExpModal, setShowReExpModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showBirthdayBalloons, setShowBirthdayBalloons] = useState(false);
  const [paywallInviteCode, setPaywallInviteCode] = useState('');
  const [paywallInviteLoading, setPaywallInviteLoading] = useState(false);
  const [paywallInviteError, setPaywallInviteError] = useState<string | null>(null);
  const [paywallInviteSuccess, setPaywallInviteSuccess] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ url: string, studentName: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem('61t_banner_dismissed') === 'true');
  const [cfiHomeAirport, setCfiHomeAirport] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [tafData, setTafData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [progChartError, setProgChartError] = useState(false);
  const [remarksExpanded, setRemarksExpanded] = useState(false);

  useEffect(() => {
    const checkGuide = () => {
      const startGuide = localStorage.getItem('61t_start_guide');
      if (startGuide === 'true') {
        setTimeout(() => {
          setOnboardingStep(1);
          localStorage.removeItem('61t_start_guide');
        }, 300);
      }
    };

    checkGuide();
    window.addEventListener('storage', checkGuide);
    return () => window.removeEventListener('storage', checkGuide);
  }, []);

  const ratingOrder = ['ppl', 'ir', 'cpl', 'cfi', 'cfii', 'mei'];
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const ratingDiff = ratingOrder.indexOf(a.current_rating) - ratingOrder.indexOf(b.current_rating);
    if (ratingDiff !== 0) return ratingDiff;
    return a.name.localeCompare(b.name);
  });

  const dismissOnboarding = (step: number) => {
    if (step >= 3) {
      localStorage.setItem('onboarding_done', 'true');
      setOnboardingStep(0);
    } else {
      setOnboardingStep(step + 1);
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('sb_selected_student');
    if (saved) fetchRecentLessons(saved);

    const handleOpenPaywall = () => setShowPaywall(true);
    window.addEventListener('openPaywall', handleOpenPaywall);

    // Show success banner after payment
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success') {
      setShowSuccessBanner(true);
      window.history.replaceState({}, '', '/dashboard');
      setTimeout(() => setShowSuccessBanner(false), 6000);
    }

    return () => window.removeEventListener('openPaywall', handleOpenPaywall);
  }, []);

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { error } = await supabase.from('students').select('id').limit(1);
        setIsOnline(!error || error.message !== 'Failed to fetch');
      } catch { setIsOnline(false); }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        
        // Fetch subscription and CFI profile in parallel
        const [subRes, profileRes] = await Promise.all([
          supabase.from('user_subscriptions').select('*').eq('user_id', session.user.id).single(),
          supabase.from('cfi_profile').select('re_exp_date, home_airport').eq('user_id', session.user.id).maybeSingle()
        ]);

        setUserSubscription(subRes.data);
        if (profileRes.data?.home_airport) {
          setCfiHomeAirport(profileRes.data.home_airport);
        }

        if (profileRes.data?.re_exp_date) {
          setReExpDate(profileRes.data.re_exp_date);
          const parts = profileRes.data.re_exp_date.split('/');
          if (parts.length === 2) {
            const month = parseInt(parts[0]);
            const year = 2000 + parseInt(parts[1]);
            const expiryDate = new Date(year, month, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            expiryDate.setHours(0, 0, 0, 0);
            const diffTime = expiryDate.getTime() - today.getTime();
            setReExpWarning(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (onboardingStep === 2 && sortedStudents.length === 0) {
      const timer = setTimeout(() => {
        dismissOnboarding(2);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep, sortedStudents.length]);

  const fetchWeather = async () => {
    if (!cfiHomeAirport) return;
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const [metarRes, tafRes] = await Promise.all([
        fetch(`/api/metar?ids=${cfiHomeAirport}`),
        fetch(`/api/taf?ids=${cfiHomeAirport}`)
      ]);

      if (metarRes.ok) {
        const metarData = await metarRes.json();
        if (Array.isArray(metarData) && metarData.length > 0) {
          setWeatherData(metarData[0]);
        } else {
          setWeatherError('No weather data found');
        }
      } else {
        throw new Error('METAR fetch failed');
      }

      if (tafRes.ok) {
        const tafRawData = await tafRes.json();
        console.log('TAF raw response:', JSON.stringify(tafRawData));
        if (Array.isArray(tafRawData) && tafRawData.length > 0) {
          const matchingTaf = tafRawData.find((t: any) => t.icaoId === cfiHomeAirport);
          setTafData(matchingTaf || null);
        } else {
          setTafData(null);
        }
      } else {
        setTafData(null);
      }
    } catch (err: any) {
      setWeatherError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (cfiHomeAirport) {
      fetchWeather();
      const interval = setInterval(fetchWeather, 600000); // 10 minutes
      return () => clearInterval(interval);
    }
  }, [cfiHomeAirport]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRedeemInviteCode = async () => {
    setPaywallInviteLoading(true);
    setPaywallInviteError(null);
    try {
      const code = paywallInviteCode.trim().toUpperCase();
      if (!code) throw new Error('Please enter an invite code');

      const { data: codeData, error: codeError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', code)
        .eq('used', false)
        .single();

      if (codeError || !codeData) {
        throw new Error('Invalid or already used invite code');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      await supabase
        .from('invite_codes')
        .update({
          used: true,
          used_by: session.user.email,
          used_at: new Date().toISOString(),
        })
        .eq('code', code);

      await supabase
        .from('user_subscriptions')
        .update({
          plan: 'invite',
          ratings_unlocked: ['ppl', 'ir', 'cpl', 'cfi', 'cfii', 'mei'],
        })
        .eq('user_id', session.user.id);

      setPaywallInviteSuccess(true);
      setTimeout(() => {
        setShowPaywall(false);
        setPaywallInviteSuccess(false);
        setPaywallInviteCode('');
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setPaywallInviteError(err.message);
    } finally {
      setPaywallInviteLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const [studentsRes, archivedRes, lessonsRes, manualRes, endorsementsRes] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', session.user.id).is('deleted_at', null).order('name'),
        supabase.from('students').select('*').eq('user_id', session.user.id).not('deleted_at', 'is', null).order('deleted_at', { ascending: false }),
        supabase.from('lessons').select('*'),
        supabase.from('manual_hours').select('*'),
        supabase.from('endorsements').select('*'),
      ]);
      setStudents(studentsRes.data || []);
      setArchivedStudents(archivedRes.data || []);
      setLessons(lessonsRes.data || []);
      setManualHours(manualRes.data || []);
      setEndorsements(endorsementsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentLessons = async (studentName: string) => {
    const { data } = await supabase.from('lessons').select('*').eq('student_name', studentName).order('saved_at', { ascending: false }).limit(1);
    setRecentLesson(data?.[0] || null);
  };

  const fetchTestResult = async (studentName: string) => {
    const { data } = await supabase.from('student_tests').select('*').eq('student_name', studentName).eq('test_type', 'pre_solo').order('created_at', { ascending: false }).limit(1).single();
    setPreSoloTestResult(data);
  };

  const handleSaveStudentInfo = async () => {
    if (!selectedStudent) return;
    setSavingInfo(true);
    try {
      await supabase
        .from('students')
        .update({
          phone: editForm.phone || null,
          email_address: editForm.email_address || null,
          dob: editForm.dob || null,
          student_cert_number: editForm.student_cert_number || null,
          medical_class: editForm.medical_class || null,
          medical_exam_date: editForm.medical_exam_date || null,
          notes: editForm.notes || null,
        })
        .eq('id', selectedStudent.id);

      setStudents(prev => prev.map(s =>
        s.id === selectedStudent.id ? { ...s, ...editForm } : s
      ));
      setSelectedStudent(prev => prev ? { ...prev, ...editForm } : null);
      setIsEditingInfo(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
    setUndoSuccess(null);
    localStorage.setItem('sb_selected_student', student.name);
    localStorage.setItem('faa_student_info', JSON.stringify({ student: student.name }));
    fetchRecentLessons(student.name);
    fetchTestResult(student.name);

    // Birthday balloons and confetti
    if (isBirthday((student as any).dob)) {
      setShowBirthdayBalloons(true);
      setTimeout(() => setShowBirthdayBalloons(false), 8000);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#e8a020', '#1a3a5c', '#2d7a4f', '#7c3aed', '#ef4444'],
        shapes: ['circle'],
      });
    }
  };
  
  const handleShareStudent = async (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Query for existing active token
      const { data: existingToken } = await supabase
        .from('student_share_tokens')
        .select('token')
        .eq('student_name', student.name)
        .eq('user_id', session.user.id)
        .eq('active', true)
        .maybeSingle();

      let token = existingToken?.token;

      if (!token) {
        // Insert new token if none exists
        const { data: newToken, error: insertError } = await supabase
          .from('student_share_tokens')
          .insert({
            student_name: student.name,
            user_id: session.user.id,
            active: true
          })
          .select('token')
          .single();
        
        if (insertError) throw insertError;
        token = newToken.token;
      }

      const shareUrl = `${window.location.origin}/view/${token}`;
      setShareModalData({ url: shareUrl, studentName: student.name });
    } catch (err) {
      console.error('Error sharing student:', err);
    }
  };

  const handleStartLesson = async () => {
    if (!selectedStudent) return;

    // Check subscription for locked ratings
    if (selectedStudent.current_rating !== 'ppl') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: sub } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        console.log('Subscription:', sub);
        console.log('Rating:', selectedStudent.current_rating);
        console.log('Ratings unlocked:', sub?.ratings_unlocked);

        const isUnlocked =
          sub?.plan === 'invite' ||
          ((sub?.status === 'active' || sub?.status === 'trialing') &&
            sub?.ratings_unlocked?.includes(selectedStudent.current_rating));

        console.log('Is unlocked:', isUnlocked);

        if (!isUnlocked) {
          setShowPaywall(true);
          return;
        }
      }
    }

    localStorage.removeItem('faa_ground_grades');
    localStorage.removeItem('faa_ground_notes');
    localStorage.removeItem('faa_flight_grades');
    localStorage.removeItem('faa_flight_notes');
    localStorage.removeItem('current_lesson_id');
    localStorage.setItem('sb_selected_student', selectedStudent.name);
    localStorage.setItem('selected_rating', JSON.stringify({
      code: selectedStudent.current_rating || 'ppl',
      label: selectedStudent.current_rating_label || 'Private Pilot ASEL'
    }));
    localStorage.setItem('faa_student_info', JSON.stringify({ student: selectedStudent.name }));
    navigate('/lesson-type');
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Archive student ${studentName}?`)) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('students').update({ deleted_at: new Date().toISOString(), deleted_by: session.user.email }).eq('id', studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (selectedStudent?.name === studentName) { setSelectedStudent(null); setIsDetailOpen(false); }
    fetchData();
  };

  const handleRestoreStudent = async (studentId: string) => {
    await supabase.from('students').update({ deleted_at: null, deleted_by: null }).eq('id', studentId);
    fetchData();
  };

  const handlePermanentDelete = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Permanently delete ${studentName} and ALL their data?`)) return;
    setProcessingCheckride(true);
    try {
      await supabase.from('manual_hours').delete().eq('student_name', studentName);
      await supabase.from('endorsements').delete().eq('student_name', studentName);
      await supabase.from('lessons').delete().eq('student_name', studentName);
      await supabase.from('students').delete().eq('id', studentId);
      fetchData();
    } catch (err: any) { window.alert(err.message); }
    finally { setProcessingCheckride(false); }
  };

  const handleCheckridePassed = async () => {
    if (!selectedStudent) return;
    setProcessingCheckride(true);
    try {
      const passedRating: PassedRating = { code: selectedStudent.current_rating, label: selectedStudent.current_rating_label, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
      const updatedHistory = [...(selectedStudent.checkride_passed_ratings || []), passedRating];
      await supabase.from('students').update({ checkride_passed_ratings: updatedHistory }).eq('id', selectedStudent.id);
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, checkride_passed_ratings: updatedHistory } : s));
      setSelectedStudent(prev => prev ? { ...prev, checkride_passed_ratings: updatedHistory } : null);
      setIsCheckrideConfirmOpen(false);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#1a3a5c', '#2d7a4f', '#e8a020', '#c0392b'] });
      setTimeout(() => { setSelectedNextRating(null); setIsNextRatingModalOpen(true); }, 3000);
    } catch (err) { console.error(err); }
    finally { setProcessingCheckride(false); }
  };

  const handleSelectNextRating = async (code: string) => {
    if (!selectedStudent) return;
    const rating = (RATINGS as any)[code];
    await supabase.from('students').update({ current_rating: code, current_rating_label: rating.label }).eq('id', selectedStudent.id);
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, current_rating: code, current_rating_label: rating.label } : s));
    setSelectedStudent(prev => prev ? { ...prev, current_rating: code, current_rating_label: rating.label } : null);
    setIsNextRatingModalOpen(false);
  };

  const handleUndoCheckride = async () => {
    if (!selectedStudent || !ratingToUndo) return;
    setProcessingCheckride(true);
    try {
      const updatedHistory = (selectedStudent.checkride_passed_ratings || []).filter(r => r.code !== ratingToUndo.code);
      await supabase.from('students').update({ checkride_passed_ratings: updatedHistory, current_rating: ratingToUndo.code, current_rating_label: ratingToUndo.label }).eq('id', selectedStudent.id);
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, checkride_passed_ratings: updatedHistory, current_rating: ratingToUndo.code, current_rating_label: ratingToUndo.label } : s));
      setSelectedStudent(prev => prev ? { ...prev, checkride_passed_ratings: updatedHistory, current_rating: ratingToUndo.code, current_rating_label: ratingToUndo.label } : null);
      setUndoSuccess(`Checkride pass undone. Student is back on ${ratingToUndo.label}`);
      setIsUndoConfirmOpen(false);
      setRatingToUndo(null);
    } catch (err) { console.error(err); }
    finally { setProcessingCheckride(false); }
  };

  const checkRequirements = (student: Student) => {
    const a1Given = endorsements.some(e => (e.endorsement_key === 'A1' || e.endorsement_key === 'A.1') && e.completed === true && e.student_name === student.name && e.rating?.toLowerCase() === student.current_rating?.toLowerCase());
    return { canPassCheckride: a1Given };
  };

  const FloatingBalloons = () => {
    const balloons = ['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'];
    return (
      <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
        {balloons.map((balloon, i) => (
          <motion.div
            key={i}
            initial={{
              y: '110vh',
              x: `${8 + i * 9}vw`,
              rotate: Math.random() * 30 - 15,
              scale: 0.8 + Math.random() * 0.6,
            }}
            animate={{
              y: '-20vh',
              rotate: [
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
              ],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              delay: i * 0.3,
              ease: 'easeOut',
              rotate: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'mirror',
              },
            }}
            style={{ position: 'absolute', fontSize: `${28 + Math.random() * 24}px` }}
          >
            {balloon}
          </motion.div>
        ))}
      </div>
    );
  };

  const isBirthday = (dob: string | null) => {
    if (!dob) return false;
    const today = new Date();
    // Parse date parts directly to avoid timezone shift
    const parts = dob.split('-');
    if (parts.length < 3) return false;
    const birthMonth = parseInt(parts[1], 10) - 1; // months are 0-indexed
    const birthDay = parseInt(parts[2], 10);
    return (
      birthMonth === today.getMonth() &&
      birthDay === today.getDate()
    );
  };

  const getStudentStats = (name: string) => {
    const studentLessons = lessons.filter(l => l.student_name === name);
    let hrs = 0;
    studentLessons.forEach(l => { hrs += parseFloat(l.meta?.totalFlight || '0') || 0; });
    return {
      count: studentLessons.length,
      hrs: hrs.toFixed(1),
      groundCount: studentLessons.filter(l => l.type === 'ground').length,
      flightCount: studentLessons.filter(l => l.type === 'flight').length
    };
  };

  const getTaskName = (ratingCode: string, taskId: string) => {
    const [ai, ti] = taskId.split('_').map(Number);
    const areas = ALL_ACS[ratingCode] || ALL_ACS['ppl'];
    const task = areas[ai]?.tasks[ti];
    return task ? task.name : taskId;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  function decodeMetarRemarks(rawText: string): { label: string, value: string }[] {
    if (!rawText || !rawText.includes('RMK')) return [];
    const remarksPart = rawText.split('RMK')[1].trim();
    const tokens = remarksPart.split(/\s+/);
    const decoded: { label: string, value: string }[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // AO1/AO2
      if (token === 'AO1') {
        decoded.push({ label: 'Station Type', value: 'Automated, no precipitation discriminator' });
        continue;
      }
      if (token === 'AO2') {
        decoded.push({ label: 'Station Type', value: 'Automated with precipitation discriminator' });
        continue;
      }

      // SLP
      const slpMatch = token.match(/^SLP(\d{3})$/);
      if (slpMatch) {
        const val = slpMatch[1];
        const prefix = ['0', '1', '2', '3'].includes(val[0]) ? '10' : '9';
        const pressure = prefix + val.slice(0, 2) + '.' + val[2];
        decoded.push({ label: 'Sea Level Pressure', value: `${pressure} hPa` });
        continue;
      }

      // T exactly 8 digits
      const tMatch = token.match(/^T([01])(\d{3})([01])(\d{3})$/);
      if (tMatch) {
        const tSign = tMatch[1] === '0' ? '' : '-';
        const tVal = (parseInt(tMatch[2], 10) / 10).toFixed(1);
        const dSign = tMatch[3] === '0' ? '' : '-';
        const dVal = (parseInt(tMatch[4], 10) / 10).toFixed(1);
        decoded.push({ label: 'Precise Temp / Dewpoint', value: `${tSign}${tVal}°C / ${dSign}${dVal}°C` });
        continue;
      }

      // Pressure Tendency
      if (token === 'PRESRR') {
        decoded.push({ label: 'Pressure Tendency', value: 'Rapidly Rising' });
        continue;
      }
      if (token === 'PRESFR') {
        decoded.push({ label: 'Pressure Tendency', value: 'Rapidly Falling' });
        continue;
      }

      // Peak Wind
      if (token === 'PK' && tokens[i+1] === 'WND') {
        const pkVal = tokens[i+2];
        const pkMatch = pkVal?.match(/^(\d{3})(\d{2,3})\/(\d{4})$/);
        if (pkMatch) {
          decoded.push({ label: 'Peak Wind', value: `${pkMatch[1]}° at ${pkMatch[2]}kt (${pkMatch[3].slice(0, 2)}:${pkMatch[3].slice(2)}Z)` });
          i += 2;
          continue;
        }
      }

      // Wind Shift
      if (token === 'WSHFT') {
        const nextToken = tokens[i+1];
        if (nextToken?.match(/^\d{4}$/)) {
          decoded.push({ label: 'Wind Shift', value: `At ${nextToken.slice(0, 2)}:${nextToken.slice(2)}Z` });
          i++;
          continue;
        }
      }

      // Lightning
      if (token === 'LTGICCC' || token === 'LTGIC') {
        decoded.push({ label: 'Lightning', value: 'In Cloud' });
        continue;
      }
      if (token === 'LTGCG') {
        decoded.push({ label: 'Lightning', value: 'Cloud to Ground' });
        continue;
      }
      if (token === 'LTGCC') {
        decoded.push({ label: 'Lightning', value: 'Cloud to Cloud' });
        continue;
      }
      if (token === 'LTGCA') {
        decoded.push({ label: 'Lightning', value: 'Cloud to Air' });
        continue;
      }
      if (token === 'LTG') {
        decoded.push({ label: 'Lightning', value: 'Lightning observed' });
        continue;
      }

      // Virga
      if (token === 'VIRGA') {
        decoded.push({ label: 'Virga', value: 'Precipitation not reaching ground' });
        continue;
      }

      // Maintenance
      if (token === '$') {
        decoded.push({ label: 'Maintenance', value: 'Station requires maintenance check' });
        continue;
      }

      // TSNO, PWINO, FZRANO
      if (token === 'TSNO') {
        decoded.push({ label: 'Thunderstorm Sensor', value: 'Not available' });
        continue;
      }
      if (token === 'PWINO') {
        decoded.push({ label: 'Sensor', value: 'Precipitation identifier not available' });
        continue;
      }
      if (token === 'FZRANO') {
        decoded.push({ label: 'Sensor', value: 'Freezing rain sensor not available' });
        continue;
      }

      // Precip Event [A-Z]{2,3}[BE]\d{2,4}
      const precipMatch = token.match(/^([A-Z]{2,3})(B|E)(\d{2,4})$/);
      if (precipMatch) {
        const typeCode = precipMatch[1];
        const action = precipMatch[2] === 'B' ? 'began' : 'ended';
        const time = precipMatch[3];
        const formattedTime = time.length === 4 ? `${time.slice(0, 2)}:${time.slice(2)}Z` : 
                             time.length === 2 ? `${time}Z` : `${time}Z`;
        const typeMap: any = { 'RA': 'Rain', 'SN': 'Snow', 'DZ': 'Drizzle', 'FG': 'Fog', 'TS': 'Thunderstorm' };
        decoded.push({ label: 'Precip Event', value: `${typeMap[typeCode] || typeCode} ${action} at ${formattedTime}` });
        continue;
      }
    }
    return decoded;
  }

  function getCardinalDirection(deg: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.floor(((deg + 22.5) % 360) / 45);
    return directions[index];
  }

  function decodeWeatherPhenomena(rawText: string, wxString?: string): string | null {
    if (wxString) {
      // Basic check for common codes in wxString if it's just raw codes
      if (!wxString.includes(' ') && wxString.length <= 8 && wxString.match(/^[+-]?[A-Z]+$/)) {
        // Fall through to decoder
      } else {
        return wxString;
      }
    }
    
    if (!rawText) return null;
    const parts = rawText.split(/\s+/);
    let visIdx = -1;
    for(let i=0; i<parts.length; i++) {
        if (parts[i].match(/^\d+\/?\d*SM$/) || parts[i] === 'M1/4SM' || parts[i] === 'P6SM') {
            visIdx = i; break;
        }
    }
    if (visIdx === -1) return null;
    
    const wxCodes = [];
    for(let i = visIdx + 1; i < parts.length; i++) {
        const token = parts[i];
        if (token.match(/^(SCT|FEW|BKN|OVC|VV|SKC|CLR|CAVOK)/) || token.match(/^-?\d{2}\/(-?\d{2})?$/)) break;
        if (token.match(/^(\+|-|VC)?([A-Z]{2,8})$/)) wxCodes.push(token);
    }
    
    if (wxCodes.length === 0) return null;
    
    const intensity: any = { '-': 'Light', '+': 'Heavy', 'VC': 'In Vicinity' };
    const descriptors: any = { 'MI': 'Shallow', 'BC': 'Patches', 'PR': 'Partial', 'DR': 'Drifting', 'BL': 'Blowing', 'SH': 'Showers', 'TS': 'Thunderstorm', 'FZ': 'Freezing' };
    const types: any = { 'RA': 'Rain', 'SN': 'Snow', 'DZ': 'Drizzle', 'GR': 'Hail', 'GS': 'Small Hail', 'PL': 'Ice Pellets', 'IC': 'Ice Crystals', 'FG': 'Fog', 'BR': 'Mist', 'HZ': 'Haze', 'FU': 'Smoke', 'DU': 'Dust', 'SA': 'Sand', 'SQ': 'Squall', 'FC': 'Funnel Cloud', 'SS': 'Sandstorm', 'DS': 'Duststorm', 'UP': 'Unknown precipitation' };

    return wxCodes.map(code => {
        let result = '';
        let rest = code;
        if (code.startsWith('+') || code.startsWith('-')) {
            result += intensity[code[0]] + ' ';
            rest = code.slice(1);
        } else if (code.startsWith('VC')) {
            result += intensity['VC'] + ' ';
            rest = code.slice(2);
        }
        
        for (const [dCode, dText] of Object.entries(descriptors)) {
            if (rest.startsWith(dCode)) {
                result += dText + ' ';
                rest = rest.slice(2);
                break;
            }
        }
        
        const typeParts = [];
        while (rest.length >= 2) {
            const tCode = rest.slice(0, 2);
            if (types[tCode]) {
                typeParts.push(types[tCode]);
                rest = rest.slice(2);
            } else break;
        }
        
        if (typeParts.length > 0) {
            if (result.includes('Thunderstorm')) {
                result = result.trim() + ' with ' + typeParts.join(' and ');
            } else if (result.includes('Showers')) {
                result = typeParts.join(' and ') + ' ' + result.trim();
            } else {
                result += typeParts.join(' and ');
            }
        }
        return result.trim();
    }).filter(Boolean).join(', ');
  }


  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {showBirthdayBalloons && <FloatingBalloons />}

      {/* Success banner */}
      <AnimatePresence>
        {showSuccessBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl"
            style={{
              backgroundColor: '#1a3a5c',
              boxShadow: '0 8px 32px rgba(26,58,92,0.4), 0 2px 8px rgba(26,58,92,0.3)',
              minWidth: '320px',
              maxWidth: '90vw',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(232,160,32,0.2)' }}
            >
              <span className="text-xl">🎉</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-white">Welcome to 61 Tracker Pro!</p>
              <p className="text-[11px] text-white/70 mt-0.5">All ratings are now unlocked. Your free trial has started.</p>
            </div>
            <div
              className="w-1 self-stretch rounded-full shrink-0"
              style={{ backgroundColor: '#e8a020' }}
            />
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <header
        className="sticky top-0 z-20 px-4 sm:px-6 h-16 border-b flex items-center justify-between shrink-0 backdrop-blur-md transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 2px 12px rgba(26,58,92,0.08)' }}
      >
        <div className="flex items-center gap-3">
          {/* 61 numeral mark */}
          <div className="relative">
            <span
              className="block font-black leading-none select-none"
              style={{
                fontSize: '34px',
                color: 'var(--navy)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-1.5px',
                lineHeight: 1,
              }}
            >
              61
            </span>
            <div
              className="absolute rounded-full"
              style={{
                bottom: '-3px',
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: '#e8a020',
              }}
            />
          </div>

          {/* Amber divider */}
          <div
            style={{
              width: '2px',
              height: '30px',
              backgroundColor: '#e8a020',
              opacity: 0.3,
              borderRadius: '1px',
              flexShrink: 0,
            }}
          />

          {/* TRACKER + subtitle */}
          <div className="flex flex-col justify-center gap-0.5">
            <span
              className="font-black uppercase leading-none"
              style={{
                fontSize: '13px',
                color: 'var(--navy)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '1.5px',
              }}
            >
              TRACKER
            </span>
            <span
              className="font-bold uppercase"
              style={{
                fontSize: '7px',
                color: 'var(--text-muted)',
                letterSpacing: '2px',
              }}
            >
              My Students
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-widest">
              <WifiOff size={10} />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setIsNewStudentOpen(true)}
              className={cn(
                "px-4 py-2 bg-[var(--navy)] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer",
                onboardingStep === 1 && "shadow-[0_0_50px_16px_rgba(232,160,32,0.8)] ring-4 ring-[#e8a020] ring-offset-4 animate-pulse scale-110"
              )}
            >
              <Plus size={14} />
              Add Student
            </button>

          </div>
          {user && (
            <div className="flex items-center gap-2">
              {reExpWarning !== null && reExpWarning <= 90 && (
                <button 
                  onClick={() => setShowReExpModal(true)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight transition-all hover:scale-105 active:scale-95 cursor-pointer",
                    reExpWarning < 0 ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-[#e8a020]/10 text-[#e8a020] border border-[#e8a020]/20"
                  )}
                >
                  <AlertCircle size={10} />
                  <span>{reExpWarning < 0 ? "CFI Exp" : `Expiring ${reExpWarning}d`}</span>
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(prev => !prev)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer",
                    onboardingStep === 3 && "shadow-[0_0_50px_16px_rgba(232,160,32,0.8)] ring-4 ring-[#e8a020] ring-offset-4 animate-pulse scale-110"
                  )}
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: 'var(--navy)' }}>
                  {(user?.user_metadata?.full_name || user?.email || '?')[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-[11px] font-bold max-w-[120px] truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                {(userSubscription?.plan === 'all_monthly' || userSubscription?.plan === 'all_annual' || userSubscription?.plan === 'invite') && (
                  <span className="hidden sm:inline text-[8px] font-black px-1.5 py-0.5 rounded-full text-white uppercase tracking-wider" style={{ backgroundColor: '#e8a020' }}>PRO</span>
                )}
                <ChevronDown size={12} className={cn("transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>

      {/* Content */}
      <div className="px-4 pt-2 pb-8 mt-[116px]">

        {!loading && sortedStudents.length > 0 && (
          <div className="flex items-center justify-between px-1 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {sortedStudents.length} {sortedStudents.length === 1 ? 'Student' : 'Students'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              Sorted by rating
              <ChevronDown size={10} />
            </span>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto mb-3 text-[#c0392b]" />
            <p className="text-sm text-[#c0392b]">{error}</p>
            <button onClick={fetchData} className="mt-4 text-xs font-bold text-[#1a3a5c] hover:underline cursor-pointer">Try Again</button>
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">👨‍✈️</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchQuery ? 'No students found' : 'No students yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery ? 'Try a different search' : 'Tap the + button to add your first student'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsNewStudentOpen(true)}
                className="px-6 py-3 bg-[#1a3a5c] text-white font-bold rounded-xl text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
              >
                Add First Student
              </button>
            )}
          </div>
        ) : (
          <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 relative")}>
            {sortedStudents.map(student => {
              const ratingAccents: Record<string, string> = {
                ppl:  '#2563eb',
                ir:   '#7c3aed',
                cpl:  '#059669',
                cfi:  '#d97706',
                cfii: '#0d9488',
                mei:  '#dc2626',
              };
              const accent = ratingAccents[student.current_rating] || '#2563eb';

              return (
                <motion.div
                  key={student.id}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectStudent(student)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderLeft: `3px solid ${accent}`,
                    boxShadow: '0 1px 4px rgba(37, 99, 235, 0.06)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="px-3 py-3 flex items-center gap-2.5">
                    {/* Initials avatar */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 relative"
                      style={{
                        backgroundColor: isBirthday((student as any).dob) ? 'rgba(232,160,32,0.15)' : `${accent}15`,
                        color: isBirthday((student as any).dob) ? '#e8a020' : accent,
                      }}
                    >
                      {isBirthday((student as any).dob) ? '🎂' : student.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>

                    {/* Name and rating */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p
                          className="text-xs font-bold truncate leading-tight"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {student.name}
                        </p>
                        {isBirthday((student as any).dob) && (
                          <motion.span
                            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                            className="text-sm shrink-0"
                          >
                            🎈
                          </motion.span>
                        )}
                      </div>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: isBirthday((student as any).dob) ? '#e8a020' : accent, opacity: 0.8 }}
                      >
                        {isBirthday((student as any).dob) ? '🎉 Happy Birthday!' : student.current_rating.toUpperCase()}
                      </span>
                    </div>

                    {/* Medical status badge */}
                    {(() => {
                      const status = getMedicalStatus((student as any).medical_class, (student as any).medical_exam_date, (student as any).dob);
                      if (!status) return null;

                      if (status.statusColor === 'red') {
                        return (
                          <div
                            className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter"
                            style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                            title={status.isExpired ? "Medical Expired" : `Medical Expiring Soon: ${status.daysUntilExpiry} days`}
                          >
                            {status.isExpired ? "EXP" : `${status.daysUntilExpiry}d`}
                          </div>
                        );
                      }
                      if (status.statusColor === 'amber') {
                        return (
                          <motion.div
                            animate={{ opacity: [1, 0.6, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter"
                            style={{ backgroundColor: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.3)', color: '#e8a020' }}
                            title={`Medical Expiring: ${status.daysUntilExpiry} days`}
                          >
                            {status.daysUntilExpiry}d
                          </motion.div>
                        );
                      }
                      return null;
                    })()}

                    {/* Action buttons — visible on hover */}
                    <div className="flex items-center gap-1 opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedStudent(student); setIsInfoOpen(true); }}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: `${accent}15`, color: accent }}
                        title="Student Info"
                      >
                        <Info size={11} />
                      </button>
                      <button
                        onClick={e => handleShareStudent(e, student)}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: 'rgba(45,122,79,0.1)', color: '#2d7a4f' }}
                        title="Share Student Progress"
                      >
                        <Share2 size={11} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteStudent(student.id, student.name); }}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                        title="Archive Student"
                      >
                        <Archive size={11} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Weather Widget */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* METAR Panel */}
            <div className="bg-[var(--bg-secondary)] border rounded-2xl p-4 shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <Cloud size={16} style={{ color: 'var(--navy)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Live METAR</span>
                  {cfiHomeAirport && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[var(--navy)] text-white uppercase">{cfiHomeAirport}</span>
                  )}
                  {weatherData?.fltcat && (
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-black text-white uppercase",
                      weatherData.fltcat === 'VFR' ? "bg-[#16a34a]" :
                      weatherData.fltcat === 'MVFR' ? "bg-[#2563eb]" :
                      weatherData.fltcat === 'IFR' ? "bg-[#dc2626]" :
                      weatherData.fltcat === 'LIFR' ? "bg-[#7c3aed]" : "bg-gray-500"
                    )}>
                      {weatherData.fltcat}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {weatherLoading && <Loader2 size={12} className="animate-spin text-[var(--text-muted)]" />}
                  <button 
                    onClick={fetchWeather}
                    disabled={weatherLoading || !cfiHomeAirport}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-muted)] disabled:opacity-30"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>

              {weatherError && (
                <div className="py-4 text-center">
                  <p className="text-xs font-bold text-red-500">{weatherError}</p>
                </div>
              )}

              {!cfiHomeAirport && (
                <div className="py-8 text-center px-4">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Set airport in profile to see METAR
                  </p>
                </div>
              )}

              {weatherData && (weatherData.raw_text || weatherData.obs_time || weatherData.rawOb || weatherData.reportTime) && !weatherError && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Raw METAR</span>
                    <span className="text-[10px] font-mono font-medium max-w-[200px] text-right" style={{ color: 'var(--text-primary)' }}>{weatherData.raw_text || weatherData.rawOb || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Wind</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {(() => {
                        const wspd = weatherData.wspd ?? 0;
                        const wdir = weatherData.wdir ?? 0;
                        const raw = weatherData.raw_text || weatherData.rawOb || '';
                        const varMatch = raw.match(/(\d{3})V(\d{3})/);
                        const varString = varMatch ? ` variable ${varMatch[1]}° to ${varMatch[2]}°` : '';
                        
                        if (wspd === 0 && (wdir === 0 || wdir === 'CALM' || wdir === '000')) return 'Calm';
                        if (wdir === 'VRB') return `Variable at ${wspd}kt${weatherData.wgst ? ` gusting ${weatherData.wgst}kt` : ''}${varString}`;
                        
                        const dirNum = typeof wdir === 'string' ? parseInt(wdir, 10) : wdir;
                        const cardinal = getCardinalDirection(dirNum);
                        return `${dirNum.toString().padStart(3, '0')}° (${cardinal}) at ${wspd}kt${weatherData.wgst ? ` gusting ${weatherData.wgst}kt` : ''}${varString}`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Visibility</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{weatherData.visib ?? '—'} SM</span>
                  </div>
                  {/* Weather Phenomena Row */}
                  {(() => {
                    const wx = decodeWeatherPhenomena(weatherData.raw_text || weatherData.rawOb || '', weatherData.wxString);
                    if (!wx) return null;
                    return (
                      <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Weather</span>
                        <span className="text-xs font-bold text-right pl-4" style={{ color: 'var(--text-primary)' }}>{wx}</span>
                      </div>
                    );
                  })()}
                  <div className="flex justify-between items-start py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>Sky Condition</span>
                    <div className="flex flex-col items-end gap-0.5">
                      {weatherData.clouds && weatherData.clouds.length > 0 ? 
                        (weatherData.clouds as any[]).map((cloud: any, idx: number) => {
                          const cloudMap: any = {
                            'SKC': 'Sky Clear',
                            'CLR': 'Clear below 12,000ft',
                            'FEW': 'Few',
                            'SCT': 'Scattered',
                            'BKN': 'Broken',
                            'OVC': 'Overcast',
                            'VV': 'Vertical Visibility'
                          };
                          const cover = cloudMap[cloud.cover] || cloud.cover;
                          const base = (cloud.base != null && cloud.base >= 0) ? ` @ ${cloud.base.toLocaleString()}ft` : '';
                          const extra = cloud.type === 'CB' ? ' (Cumulonimbus)' : cloud.type === 'TCU' ? ' (Towering Cumulus)' : '';
                          return (
                            <span key={idx} className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                              {cover}{base}{extra}
                            </span>
                          );
                        }) 
                        : <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Clear</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Temperature</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {(weatherData.temp_c ?? weatherData.temp)?.toFixed(1) ?? '—'}°C / {(weatherData.dewpoint_c ?? weatherData.dewp)?.toFixed(1) ?? '—'}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Altimeter</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {(weatherData.altim_in_hg ?? (() => {
                        const match = (weatherData.raw_text || weatherData.rawOb || '').match(/\bA(\d{4})\b/);
                        return match ? parseInt(match[1], 10) / 100 : null;
                      })())?.toFixed(2) ?? '—'} inHg
                    </span>
                  </div>

                  {/* Remarks Section */}
                  {(() => {
                    const remarks = decodeMetarRemarks(weatherData.raw_text || weatherData.rawOb || '');
                    if (remarks.length === 0) return null;
                    return (
                      <div className="mt-2">
                        <button 
                          onClick={() => setRemarksExpanded(!remarksExpanded)}
                          className="flex items-center justify-between w-full py-2 border-b border-[var(--border-color)] hover:opacity-80 transition-opacity"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Remarks</span>
                          <ChevronRight 
                            size={12} 
                            className={cn("transition-transform text-[var(--text-muted)]", remarksExpanded ? "rotate-90" : "")} 
                          />
                        </button>
                        <AnimatePresence>
                          {remarksExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 mt-1">
                                {remarks.map((rmk, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-1 border-b border-[var(--border-color)] last:border-0">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{rmk.label}</span>
                                    <span className="text-xs font-bold text-[var(--text-primary)] text-right pl-4">{rmk.value}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] font-bold text-[var(--text-muted)] italic">
                      Observed at {new Date(weatherData.obs_time || weatherData.reportTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* TAF Panel */}
            <div className="bg-[var(--bg-secondary)] border rounded-2xl p-4 shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: 'var(--navy)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>TAF</span>
                  {cfiHomeAirport && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[var(--navy)] text-white uppercase">{cfiHomeAirport}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {weatherLoading && <Loader2 size={12} className="animate-spin text-[var(--text-muted)]" />}
                  <button 
                    onClick={fetchWeather}
                    disabled={weatherLoading || !cfiHomeAirport}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-muted)] disabled:opacity-30"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
              </div>

              {!cfiHomeAirport && (
                <div className="py-8 text-center px-4">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Set airport in profile to see TAF
                  </p>
                </div>
              )}

              {weatherLoading && !tafData && (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={24} className="animate-spin text-[var(--text-muted)] opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Loading TAF...</p>
                </div>
              )}

              {tafData && tafData.rawTAF ? (
                <div className="space-y-4">
                  {tafData.name && (
                    <p className="text-[9px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-muted)' }}>{tafData.name}</p>
                  )}
                  <div className="p-3 rounded-lg text-xs font-mono leading-relaxed break-words overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                    {tafData.rawTAF}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Valid:</span>
                      <span className="text-[10px] font-bold text-[var(--text-primary)]">
                        {(() => {
                          const formatDate = (timestamp: number) => {
                            if (!timestamp) return '';
                            const d = new Date(timestamp * 1000);
                            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                            return `${months[d.getUTCMonth()]} ${d.getUTCDate().toString().padStart(2, '0')} ${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}Z`;
                          };
                          return `${formatDate(tafData.validTimeFrom)} to ${formatDate(tafData.validTimeTo)}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Issued:</span>
                      <span className="text-[10px] font-bold text-[var(--text-primary)]">
                        {new Date(tafData.issueTime).toUTCString()}
                      </span>
                    </div>
                  </div>

                  {/* Decoded Forecasts */}
                  {tafData.fcsts && tafData.fcsts.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Forecast Periods</span>
                      <div className="space-y-4">
                        {tafData.fcsts.map((fcst: any, idx: number) => {
                          const formatTimeShort = (ts: number) => {
                            const d = new Date(ts * 1000);
                            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                            return `${d.getUTCDate().toString().padStart(2, '0')}${months[d.getUTCMonth()]}${d.getUTCHours().toString().padStart(2, '0')}Z`;
                          };

                          return (
                            <div key={idx} className="space-y-1">
                              {/* Period Header */}
                              <div className="px-2 py-1 flex items-center justify-between rounded-lg bg-[var(--bg-tertiary)]">
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                  {formatTimeShort(fcst.timeFrom)} — {formatTimeShort(fcst.timeTo)}
                                  {fcst.fcstChange && <span className="ml-2 font-bold opacity-60">[{fcst.fcstChange}]</span>}
                                </span>
                              </div>

                              {/* Change Type Badge */}
                              {fcst.fcstChange && (
                                <div className="flex pt-1 pb-1">
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white",
                                    fcst.fcstChange === 'FM' ? "bg-[var(--navy)]" :
                                    fcst.fcstChange === 'TEMPO' ? "bg-amber-500" :
                                    fcst.fcstChange === 'BECMG' ? "bg-green-600" :
                                    "bg-slate-500"
                                  )}>
                                    {fcst.fcstChange}
                                  </span>
                                </div>
                              )}

                              {/* Wind Row */}
                              {fcst.wspd !== null && fcst.wspd !== 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Wind</span>
                                  <span className="text-sm font-bold text-[var(--text-primary)]">
                                    {fcst.wdir === 'VRB' ? 'VRB' : `${fcst.wdir}°`} at {fcst.wspd}kt
                                    {fcst.wgst && ` G${fcst.wgst}kt`}
                                  </span>
                                </div>
                              )}

                              {/* Visibility Row */}
                              {fcst.visib !== null && (
                                <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Visibility</span>
                                  <span className="text-sm font-bold text-[var(--text-primary)]">{fcst.visib} SM</span>
                                </div>
                              )}

                              {/* Clouds Row */}
                              {fcst.clouds && fcst.clouds.length > 0 && (
                                <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Clouds</span>
                                  <span className="text-sm font-bold text-[var(--text-primary)]">
                                    {fcst.clouds.map((c: any) => c.base != null ? `${c.cover} @ ${c.base}ft` : c.cover).join(' ')}
                                  </span>
                                </div>
                              )}

                              {/* Weather Row */}
                              {fcst.wxString && (
                                <div className="flex justify-between items-center py-1 border-b border-[var(--border-color)]">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Weather</span>
                                  <span className="text-sm font-bold text-[var(--text-primary)]">{fcst.wxString}</span>
                                </div>
                              )}

                              {/* Divider between periods if not the last one */}
                              {idx < tafData.fcsts.length - 1 && <div className="mt-4 border-b border-[var(--border-color)] opacity-20" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : !weatherLoading && cfiHomeAirport && (
                <div className="py-8 text-center">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    No TAF available for this airport
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Archived Students */}
        <div className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setArchivedExpanded(!archivedExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <Archive size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Archived Students ({archivedStudents.length})</span>
            </div>
            <ChevronRight size={14} className={cn("transition-transform", archivedExpanded && "rotate-90")} />
          </button>
          <AnimatePresence>
            {archivedExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {archivedStudents.length === 0 ? (
                  <p className="text-xs italic text-center py-4" style={{ color: 'var(--text-muted)' }}>No archived students.</p>
                ) : archivedStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between px-4 py-3 rounded-xl opacity-60 mb-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{student.name}</p>
                      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Archived {formatDate(student.deleted_at!)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleRestoreStudent(student.id)} className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer" style={{ color: 'var(--green)' }}>
                        <RotateCcw size={13} />
                      </button>
                      <button onClick={() => handlePermanentDelete(student.id, student.name)} className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer" style={{ color: 'var(--red)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================
          STUDENT INFO POPUP
          ============================================ */}
      <AnimatePresence>
        {isInfoOpen && selectedStudent && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsInfoOpen(false); setIsEditingInfo(false); }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden max-h-[80vh] flex flex-col"
              style={{ boxShadow: '0 -8px 40px rgba(26,58,92,0.15)' }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-[#dde3ec] rounded-full" />
              </div>
              <div
                className="px-6 py-4 flex items-center justify-between shrink-0"
                style={{ background: `linear-gradient(135deg, ${ratingConfig[selectedStudent.current_rating]?.bg || '#1a3a5c'} 0%, ${ratingConfig[selectedStudent.current_rating]?.bg || '#2a5a8c'}dd 100%)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
                    {selectedStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{selectedStudent.name}</h2>
                    <p className="text-xs text-white/70 font-bold">{selectedStudent.current_rating_label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditingInfo(!isEditingInfo);
                      setEditForm({
                        phone: (selectedStudent as any).phone || '',
                        email_address: (selectedStudent as any).email_address || '',
                        dob: (selectedStudent as any).dob || '',
                        student_cert_number: (selectedStudent as any).student_cert_number || '',
                        medical_class: (selectedStudent as any).medical_class || '',
                        medical_exam_date: (selectedStudent as any).medical_exam_date || '',
                        notes: (selectedStudent as any).notes || '',
                      });
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer text-xs font-bold"
                    title={isEditingInfo ? 'Cancel edit' : 'Edit info'}
                  >
                    {isEditingInfo ? <X size={14} /> : <span>✏️</span>}
                  </button>
                  <button onClick={() => { setIsInfoOpen(false); setIsEditingInfo(false); }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isEditingInfo ? (
                  /* Edit mode */
                  <div className="space-y-4">
                    {[
                      { key: 'phone', label: 'Phone', icon: Phone, type: 'tel', placeholder: '(555) 000-0000' },
                      { key: 'email_address', label: 'Email', icon: Mail, type: 'email', placeholder: 'student@email.com' },
                      { key: 'dob', label: 'Date of Birth', icon: Calendar, type: 'date', placeholder: '' },
                      { key: 'student_cert_number', label: 'Student Cert Number', icon: FileText, type: 'text', placeholder: 'Certificate number' },
                      { key: 'medical_exam_date', label: 'Medical Exam Date', icon: Calendar, type: 'date', placeholder: '' },
                    ].map(({ key, label, icon: Icon, type, placeholder }) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</label>
                        <div className="relative">
                          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input
                            type={type}
                            value={editForm[key] || ''}
                            onChange={e => setEditForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full text-sm rounded-xl pl-9 pr-4 py-2.5 border focus:outline-none focus:border-[#1a3a5c] transition-all"
                            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Medical class select */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Medical Class</label>
                      <div className="relative">
                        <Heart size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <select
                          value={editForm.medical_class || ''}
                          onChange={e => setEditForm((prev: any) => ({ ...prev, medical_class: e.target.value }))}
                          className="w-full text-sm rounded-xl pl-9 pr-4 py-2.5 border focus:outline-none focus:border-[#1a3a5c] transition-all"
                          style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        >
                          <option value="">Select class</option>
                          <option value="First Class">First Class</option>
                          <option value="Second Class">Second Class</option>
                          <option value="Third Class">Third Class</option>
                          <option value="BasicMed">BasicMed</option>
                          <option value="Sport Pilot">Sport Pilot (Driver License)</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Notes</label>
                      <textarea
                        value={editForm.notes || ''}
                        onChange={e => setEditForm((prev: any) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any notes about this student..."
                        rows={3}
                        className="w-full text-sm rounded-xl px-4 py-2.5 border focus:outline-none focus:border-[#1a3a5c] transition-all resize-none"
                        style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <>
                    {[
                      { icon: Phone, label: 'Phone', value: (selectedStudent as any).phone },
                      { icon: Mail, label: 'Email', value: (selectedStudent as any).email_address },
                      { icon: Calendar, label: 'Date of Birth', value: (selectedStudent as any).dob ? formatDate((selectedStudent as any).dob) : null },
                      { icon: FileText, label: 'Student Cert Number', value: (selectedStudent as any).student_cert_number },
                    ].map(({ icon: Icon, label, value }) => (
                      value ? (
                        <div key={label} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <Icon size={14} style={{ color: 'var(--navy-light)' }} />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</p>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
                          </div>
                        </div>
                      ) : null
                    ))}

                    {/* Medical Section */}
                    {(selectedStudent as any).medical_class && (selectedStudent as any).medical_exam_date && (
                      <div className="py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                            <Heart size={14} style={{ color: 'var(--navy-light)' }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Medical Status</p>
                              {(() => {
                                const status = getMedicalStatus((selectedStudent as any).medical_class, (selectedStudent as any).medical_exam_date, (selectedStudent as any).dob);
                                if (!status) return null;
                                return (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{
                                    backgroundColor: status.statusColor === 'green' ? 'rgba(74,222,128,0.1)' : status.statusColor === 'amber' ? 'rgba(232,160,32,0.1)' : 'rgba(239,68,68,0.1)',
                                    color: status.statusColor === 'green' ? 'var(--green)' : status.statusColor === 'amber' ? 'var(--amber)' : 'var(--red)'
                                  }}>
                                    {status.isExpired ? 'Expired' : status.daysUntilExpiry <= 60 ? 'Expiring Soon' : 'Current'}
                                  </span>
                                );
                              })()}
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{(selectedStudent as any).medical_class}</p>
                              {(() => {
                                const status = getMedicalStatus((selectedStudent as any).medical_class, (selectedStudent as any).medical_exam_date, (selectedStudent as any).dob);
                                if (!status) return null;
                                return (
                                  <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                                    {status.isExpired ? 'Expired' : `Expires ${status.expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                  </p>
                                );
                              })()}
                            </div>
                            {(() => {
                              const status = getMedicalStatus((selectedStudent as any).medical_class, (selectedStudent as any).medical_exam_date, (selectedStudent as any).dob);
                              if (status && status.currentClass !== status.currentPrivileges && !status.isExpired) {
                                return (
                                  <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--amber)' }}>
                                    Exercising: {status.currentPrivileges}
                                  </p>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                    {(selectedStudent as any).notes && (
                      <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{(selectedStudent as any).notes}</p>
                      </div>
                    )}
                    {!((selectedStudent as any).phone || (selectedStudent as any).email_address || (selectedStudent as any).notes) && (
                      <div className="py-8 text-center">
                        <div className="text-3xl mb-2">📋</div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No info on file</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tap the pencil icon to add details</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Save button in edit mode */}
              {isEditingInfo && (
                <div className="px-6 py-4 border-t shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                  <button
                    onClick={handleSaveStudentInfo}
                    disabled={savingInfo}
                    className="w-full py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#2d7a4f', boxShadow: '0 4px 12px rgba(45,122,79,0.3)' }}
                  >
                    {savingInfo ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {savingInfo ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          STUDENT DETAIL SLIDE UP
          ============================================ */}
      <AnimatePresence>
        {isDetailOpen && selectedStudent && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-t-3xl overflow-hidden flex flex-col"
              style={{ maxHeight: '92vh', boxShadow: '0 -8px 40px rgba(26,58,92,0.2)' }}
            >
              <div className="flex justify-center pt-3 shrink-0">
                <div className="w-10 h-1 bg-[#dde3ec] rounded-full" />
              </div>
              <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white"
                    style={{ backgroundColor: ratingConfig[selectedStudent.current_rating]?.bg || '#1a3a5c' }}
                  >
                    {selectedStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{selectedStudent.name}</h2>
                    <p className="text-xs font-bold" style={{ color: 'var(--navy-light)' }}>{selectedStudent.current_rating_label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsDetailOpen(false); localStorage.setItem('sb_selected_student', selectedStudent.name); navigate('/history'); }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--navy-light)' }}
                  >
                    History →
                  </button>
                  <button onClick={() => setIsDetailOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {selectedStudent.checkride_passed_ratings?.length ? (
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--navy-light)' }}>
                      <Award size={14} style={{ color: 'var(--amber)' }} />
                      Ratings Completed
                    </h3>
                    <div className="space-y-2">
                      {selectedStudent.checkride_passed_ratings.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{r.label}</span>
                            <button onClick={() => { setRatingToUndo(r); setIsUndoConfirmOpen(true); }} style={{ color: 'var(--text-secondary)' }} className="p-1 hover:text-[var(--red)] rounded transition-all cursor-pointer">
                              <History size={12} />
                            </button>
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }}>Passed {r.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {undoSuccess && (
                  <div className="border text-xs font-bold p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'var(--green)', color: 'var(--green)' }}>
                    <CheckCircle2 size={14} />
                    {undoSuccess}
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Latest Lesson</h3>
                  {recentLesson ? (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{recentLesson.label}</h4>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(recentLesson.saved_at).toLocaleDateString()} · {recentLesson.instructor}
                          </p>
                        </div>
                        {recentLesson.meta?.totalFlight && (
                          <span className="text-sm font-mono font-bold" style={{ color: 'var(--amber)' }}>{recentLesson.meta.totalFlight}h</span>
                        )}
                      </div>
                      {Object.values(recentLesson.grades || {}).filter(g => g === 'N').length > 0 ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--red)' }}>Focus Areas</p>
                          {Object.entries(recentLesson.grades || {}).filter(([_, g]) => g === 'N').slice(0, 3).map(([id]) => (
                            <div key={id} className="flex items-center gap-2 text-[11px]">
                              <span className="w-3 h-3 rounded-full bg-[#c0392b] text-white flex items-center justify-center text-[7px] font-bold shrink-0">N</span>
                              <span style={{ color: 'var(--text-primary)' }}>{getTaskName(recentLesson.meta?.rating_code || 'ppl', id)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--green)' }}>
                          <CheckCircle2 size={12} />
                          All tasks satisfactory
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>No lessons yet</p>
                    </div>
                  )}
                </div>

                {preSoloTestResult && (
                  <div className="flex items-center gap-2">
                    {preSoloTestResult.passed ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: 'var(--green)', borderColor: 'var(--green)' }}>
                        <CheckCircle2 size={12} strokeWidth={3} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pre-Solo Test Passed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: 'var(--red)', borderColor: 'var(--red)' }}>
                        <XCircle size={12} strokeWidth={3} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pre-Solo Test Failed</span>
                      </div>
                    )}
                  </div>
                )}

                {(() => {
                  const studentLessons = lessons.filter(l => l.student_name === selectedStudent.name);
                  const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                  const recentFlights = studentLessons.filter(l => l.type === 'flight' && new Date(l.saved_at) >= ninetyDaysAgo);
                  const aselFlights = recentFlights.filter(l => l.meta?.aircraftClass === 'ASEL');
                  const aselLandings = aselFlights.reduce((sum, l) => sum + (parseInt(l.meta?.ldgDay || '0') || 0) + (parseInt(l.meta?.ldgNight || '0') || 0), 0);
                  const isDayCurrentASEL = aselLandings >= 3;
                  const hasEverLoggedASEL = studentLessons.some(l => l.meta?.aircraftClass === 'ASEL');
                  const recentIFR = studentLessons.filter(l => l.type === 'flight' && new Date(l.saved_at) >= sixMonthsAgo);
                  const totalApproaches = recentIFR.reduce((sum, l) => sum + (parseInt(l.meta?.approachCount || '0') || 0), 0);
                  const holdPerformed = recentIFR.some(l => l.meta?.holdPerformed === true);
                  const isIFRCurrent = totalApproaches >= 6 && holdPerformed;
                  const hasEverLoggedApproaches = studentLessons.some(l => (parseInt(l.meta?.approachCount || '0') || 0) > 0);
                  const allCurrent = (!hasEverLoggedASEL || isDayCurrentASEL) && (!hasEverLoggedApproaches || isIFRCurrent);
                  const noneCurrent = (hasEverLoggedASEL && !isDayCurrentASEL) && (hasEverLoggedApproaches && !isIFRCurrent);

                  return (
                    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }}>
                      <button
                        onClick={() => setIsCurrencyExpanded(!isCurrencyExpanded)}
                        className="w-full p-4 flex items-center justify-between transition-colors cursor-pointer"
                        style={{ backgroundColor: allCurrent ? 'rgba(74,222,128,0.1)' : noneCurrent ? 'rgba(239,68,68,0.1)' : 'rgba(232,160,32,0.1)' }}
                      >
                        <div className="flex items-center gap-3">
                          <Shield size={18} style={{ color: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }} />
                          <span className="text-sm font-bold" style={{ color: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }}>Currency Status</span>
                        </div>
                        <ChevronDown size={18} className={cn("transition-transform duration-200", isCurrencyExpanded && "rotate-180")} style={{ color: allCurrent ? 'var(--green)' : noneCurrent ? 'var(--red)' : 'var(--amber)' }} />
                      </button>
                      <AnimatePresence>
                        {isCurrencyExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden divide-y" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                            {hasEverLoggedASEL && (
                              <CurrencyRow title="Passenger Currency Day" reference="§61.57(a)" isCurrent={isDayCurrentASEL} classBadge="ASEL" isExpanded={expandedCurrencyRow === 'day_asel'} onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'day_asel' ? null : 'day_asel')}>
                                <div className="p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                  <div className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-secondary)' }}>Landings (90 days)</span>
                                    <span className="font-mono font-bold" style={{ color: isDayCurrentASEL ? 'var(--green)' : 'var(--red)' }}>{aselLandings} / 3</span>
                                  </div>
                                </div>
                              </CurrencyRow>
                            )}
                            <CurrencyRow title="IFR Currency" reference="§61.57(c)" isCurrent={isIFRCurrent} isNotApplicable={!hasEverLoggedApproaches} isExpanded={expandedCurrencyRow === 'ifr'} onToggle={() => setExpandedCurrencyRow(expandedCurrencyRow === 'ifr' ? null : 'ifr')}>
                              <div className="p-4 space-y-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--text-secondary)' }}>Approaches (6 months)</span>
                                  <span className="font-mono font-bold" style={{ color: totalApproaches >= 6 ? 'var(--green)' : 'var(--red)' }}>{totalApproaches} / 6</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span style={{ color: 'var(--text-secondary)' }}>Holding performed</span>
                                  <span style={{ color: holdPerformed ? 'var(--green)' : 'var(--red)' }}>{holdPerformed ? 'Yes' : 'No'}</span>
                                </div>
                              </div>
                            </CurrencyRow>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {(() => {
                  const isPassed = selectedStudent.checkride_passed_ratings?.some(r => r.code === selectedStudent.current_rating);
                  if (isPassed) {
                    const passDate = selectedStudent.checkride_passed_ratings?.find(r => r.code === selectedStudent.current_rating)?.date;
                    return (
                      <div className="border-2 rounded-xl p-4 flex flex-col items-center gap-1" style={{ backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)', color: 'var(--green)' }}>
                        <div className="flex items-center gap-2 font-bold"><CheckCircle size={20} />Checkride Passed</div>
                        <div className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Completed on {passDate}</div>
                      </div>
                    );
                  }
                  const { canPassCheckride } = checkRequirements(selectedStudent);
                  return (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsCheckrideConfirmOpen(true)}
                        disabled={!canPassCheckride}
                        className={cn("w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer", canPassCheckride ? "bg-[#2d7a4f] text-white hover:bg-[#24633f] animate-pulse shadow-[0_0_15px_rgba(45,122,79,0.4)]" : "text-[var(--text-muted)] cursor-not-allowed border")}
                        style={!canPassCheckride ? { backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' } : {}}
                      >
                        <CheckCircle size={18} />
                        Checkride Passed
                      </button>
                      {!canPassCheckride && (
                        <p className="text-[10px] text-center font-medium" style={{ color: 'var(--text-secondary)' }}>Give A.1 endorsement in the Checkride tab to unlock.</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="px-6 py-4 border-t flex gap-3 shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <button
                  onClick={handleStartLesson}
                  className="flex-1 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
                  style={{ backgroundColor: 'var(--navy)' }}
                >
                  <Plane size={18} />
                  Start New Lesson →
                </button>
                <Link
                  to={`/iacra/${encodeURIComponent(selectedStudent.name)}`}
                  className="px-4 py-3.5 font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs hover:-translate-y-0.5 hover:shadow-md"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--navy)', borderColor: 'rgba(26,58,92,0.3)' }}
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline">IACRA Summary</span>
                  <span className="sm:hidden">IACRA</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          CHECKRIDE CONFIRM MODAL
          ============================================ */}
      <AnimatePresence>
        {isCheckrideConfirmOpen && selectedStudent && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 sm:p-8 text-center border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="w-16 h-16 bg-[#e4f5ec] text-[#2d7a4f] rounded-full flex items-center justify-center mb-6 mx-auto"><Award size={32} /></div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Confirm Checkride Pass</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                You are about to record that <strong>{selectedStudent.name}</strong> has passed their <strong>{selectedStudent.current_rating_label}</strong> checkride.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsCheckrideConfirmOpen(false)} className="flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
                <button onClick={handleCheckridePassed} disabled={processingCheckride} className="flex-[2] py-3 bg-[#2d7a4f] text-white font-bold rounded-xl hover:bg-[#24633f] transition-all shadow-md disabled:opacity-50 cursor-pointer">
                  {processingCheckride ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Pass'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          UNDO CONFIRM MODAL
          ============================================ */}
      <AnimatePresence>
        {isUndoConfirmOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 sm:p-8 text-center border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}><AlertCircle size={32} /></div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Undo Checkride Pass?</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to undo the checkride pass for <strong>{ratingToUndo?.label}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setIsUndoConfirmOpen(false)} className="flex-1 py-3 text-sm font-bold rounded-xl cursor-pointer" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
                <button onClick={handleUndoCheckride} disabled={processingCheckride} className="flex-[2] py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer" style={{ backgroundColor: 'var(--red)' }}>
                  {processingCheckride ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Undo Pass'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          NEXT RATING MODAL
          ============================================ */}
      <AnimatePresence>
        {isNextRatingModalOpen && (
          <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
              style={{ boxShadow: '0 -8px 40px rgba(26,58,92,0.2)' }}
            >
              <div className="flex justify-center pt-3 sm:hidden"><div className="w-10 h-1 bg-[#dde3ec] rounded-full" /></div>
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h2 className="text-lg font-black" style={{ color: 'var(--navy-lighter)' }}>Checkride Passed! 🎉</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>What rating is {selectedStudent?.name} pursuing next?</p>
                </div>
                <button onClick={() => setIsNextRatingModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-tertiary)] cursor-pointer" style={{ color: 'var(--text-secondary)' }}><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(RATINGS).map(([code, rating]) => {
                    const isSelected = selectedNextRating === code;
                    const config = ratingConfig[code];
                    const Icon = config.icon;
                    return (
                      <motion.div key={code} whileHover={{ y: -3 }} onClick={() => setSelectedNextRating(code)}
                        className="relative rounded-2xl border-2 p-5 text-center cursor-pointer transition-all flex flex-col items-center gap-3"
                        style={{ backgroundColor: isSelected ? config.light : 'white', borderColor: isSelected ? config.border : 'var(--border-color)', boxShadow: isSelected ? `0 4px 16px ${config.bg}30` : '0 1px 4px rgba(26,58,92,0.06)' }}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: isSelected ? config.bg : config.light }}>
                          <Icon size={22} style={{ color: isSelected ? 'white' : config.bg }} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1a2333] leading-tight">{rating.label}</div>
                          <div className="text-[9px] text-[#6b7280] mt-0.5 opacity-70">{rating.acs}</div>
                        </div>
                        {isSelected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: config.bg }}><Check size={11} className="text-white" /></div>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <button onClick={() => setIsNextRatingModalOpen(false)} className="flex-1 py-4 text-sm font-bold rounded-2xl cursor-pointer" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Skip for now</button>
                <button onClick={() => selectedNextRating && handleSelectNextRating(selectedNextRating)} disabled={!selectedNextRating} className="flex-[2] py-4 text-white font-bold rounded-2xl transition-all shadow-lg disabled:opacity-50 cursor-pointer" style={{ backgroundColor: 'var(--navy)' }}>Confirm Next Rating</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================
          PAYWALL MODAL
          ============================================ */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 24px 80px rgba(26,58,92,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              {/* Header */}
              <div
                className="px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)' }}
              >
                <div>
                  <h2 className="text-2xl font-black text-white">Unlock All Ratings</h2>
                  <p className="text-sm text-white/70 mt-1">
                    Start your 1 month free trial — cancel anytime
                  </p>
                </div>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Plans */}
              <div className="p-4 sm:p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {[
                    {
                      id: 'all_monthly',
                      priceId: import.meta.env.VITE_STRIPE_PRICE_ALL_MONTHLY,
                      name: 'All Ratings',
                      price: '$9.99',
                      period: 'per month',
                      savings: null,
                      description: 'Unlock every rating — best for active CFIs',
                      features: ['All 6 ratings unlocked', 'IR CPL CFI CFII MEI', 'Full lesson tracking', 'Endorsements', 'Checkride readiness'],
                      color: '#1a3a5c',
                      popular: true,
                    },
                    {
                      id: 'all_annual',
                      priceId: import.meta.env.VITE_STRIPE_PRICE_ALL_ANNUAL,
                      name: 'All Ratings Annual',
                      price: '$99',
                      period: 'per year',
                      savings: 'Save $21 — 2 months free',
                      description: 'Best value for committed CFIs',
                      features: ['Everything in All Ratings', 'Annual billing', '2 months free vs monthly', 'Priority support'],
                      color: '#2d7a4f',
                      popular: false,
                    },
                  ].map(plan => (
                    <div
                      key={plan.id}
                      className="relative rounded-2xl border-2 p-5 flex flex-col"
                      style={{
                        borderColor: plan.popular ? plan.color : 'var(--border-color)',
                        backgroundColor: plan.popular ? `${plan.color}08` : 'var(--bg-secondary)',
                        boxShadow: plan.popular ? `0 4px 20px ${plan.color}20` : 'none',
                      }}
                    >
                      {plan.popular && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap"
                          style={{ backgroundColor: plan.color }}
                        >
                          Most Popular
                        </div>
                      )}
                      {plan.savings && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider whitespace-nowrap"
                          style={{ backgroundColor: plan.color }}
                        >
                          Best Value
                        </div>
                      )}
                      <div className="mb-3">
                        <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
                      </div>
                      <div className="mb-4">
                        <span className="text-3xl font-black" style={{ color: plan.color }}>{plan.price}</span>
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                        {plan.savings && (
                          <div className="text-[10px] font-bold mt-1" style={{ color: plan.color }}>{plan.savings}</div>
                        )}
                      </div>
                      <div className="space-y-1.5 mb-5 flex-1">
                        {plan.features.map(feature => (
                          <div key={feature} className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            <Check size={11} style={{ color: plan.color, flexShrink: 0 }} />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const { data: { session } } = await supabase.auth.getSession();
                            if (!session) return;
                            const response = await fetch('/api/create-checkout', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                priceId: plan.priceId,
                                email: session.user.email,
                                userId: session.user.id,
                              }),
                            });
                            const { url, error } = await response.json();
                            if (error) throw new Error(error);
                            window.location.href = url;
                          } catch (err: any) {
                            alert('Failed to start checkout: ' + err.message);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer"
                        style={{
                          backgroundColor: plan.color,
                          boxShadow: `0 4px 12px ${plan.color}40`,
                        }}
                      >
                        Start Free Trial →
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  1 month free trial · No charge until trial ends · Cancel anytime
                </p>

                {/* Invite code redemption */}
                <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                    Have an invite code?
                  </p>
                  {paywallInviteSuccess ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold" style={{ backgroundColor: 'rgba(45,122,79,0.1)', color: '#2d7a4f' }}>
                      <Check size={16} />
                      Access unlocked successfully!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={paywallInviteCode}
                        onChange={e => setPaywallInviteCode(e.target.value.toUpperCase())}
                        placeholder="61T-XXXX-XXXX-XXXX"
                        className="flex-1 text-sm rounded-xl px-4 py-2.5 border font-mono tracking-wider focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderColor: paywallInviteError ? '#ef4444' : 'var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <button
                        onClick={handleRedeemInviteCode}
                        disabled={paywallInviteLoading || !paywallInviteCode.trim()}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                        style={{ backgroundColor: '#1a3a5c', boxShadow: '0 4px 12px rgba(26,58,92,0.3)' }}
                      >
                        {paywallInviteLoading ? '...' : 'Redeem'}
                      </button>
                    </div>
                  )}
                  {paywallInviteError && (
                    <p className="text-[10px] mt-2 text-center font-bold" style={{ color: '#ef4444' }}>{paywallInviteError}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUserMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99]"
              onClick={() => setIsUserMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed top-16 right-4 w-52 rounded-2xl border overflow-hidden z-[100]"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 8px 32px rgba(26,58,92,0.15)' }}
            >
              <div className="px-4 py-3 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', position: 'relative', zIndex: 1 }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Signed in as</p>
                <p className="text-xs font-bold truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>{user?.user_metadata?.full_name || user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/cfi-hours"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--bg-tertiary)] cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <User size={14} style={{ color: 'var(--navy)' }} />
                  CFI Profile
                </Link>
                <Link
                  to="/account"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--bg-tertiary)] cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <User size={14} style={{ color: 'var(--navy)' }} />
                  Account
                </Link>
                {user?.email === 'jeanudp@gmail.com' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--bg-tertiary)] cursor-pointer"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Shield size={14} style={{ color: 'var(--navy)' }} />
                    Admin
                  </Link>
                )}
              </div>
              <div className="px-4 py-2.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border transition-all"
                  style={{ backgroundColor: darkMode ? 'var(--navy)' : 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: darkMode ? 'white' : 'var(--text-secondary)' }}
                >
                  {darkMode ? <Moon size={12} /> : <Sun size={12} />}
                  <span className="text-[10px] font-bold">{darkMode ? 'On' : 'Off'}</span>
                </button>
              </div>
              <div className="py-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleSignOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-red-50 cursor-pointer"
                  style={{ color: '#c0392b' }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Onboarding Toast */}
      <AnimatePresence>
        {onboardingStep > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[300] text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-3 w-[calc(100vw-2rem)] sm:w-auto"
            style={{ 
              maxWidth: '360px', 
              backgroundColor: '#1a3a5c',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="absolute top-2 right-3 text-[#e8a020] text-lg font-black animate-bounce">
                {onboardingStep === 2 ? '↑' : '↗'}
              </span>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    s === onboardingStep ? "bg-[#e8a020] w-6" : "bg-white/20 w-2"
                  )}
                />
              ))}
            </div>
            <p className="text-xs font-medium leading-relaxed">
              {onboardingStep === 1 && "👆 Tap the glowing Add Student button in the top right to add your first student and get started."}
              {onboardingStep === 2 && "👆 Use the search bar above to find students, or tap any student card to open their profile and start a lesson."}
              {onboardingStep === 3 && "👆 Tap your name in the top right to access your CFI hours, account settings, and dark mode."}
            </p>
            <button
              onClick={() => dismissOnboarding(onboardingStep)}
              className="self-end px-4 py-1.5 bg-[#e8a020] text-[#1a3a5c] text-[10px] font-black uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Got it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showReExpModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReExpModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {/* Header */}
              <div className="p-6 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>CFI Recent Experience Requirements — §61.197</h3>
                  <div className={cn(
                    "text-xs font-bold mt-1",
                    reExpWarning !== null && reExpWarning < 0 ? "text-red-500" : "text-[#e8a020]"
                  )}>
                    REED Expiry: {reExpDate}
                  </div>
                </div>
                <button
                  onClick={() => setShowReExpModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                {[
                  {
                    id: 1,
                    title: "Pass a Practical Test",
                    ref: "§61.197(b)(1)",
                    desc: "Pass a practical test for one of the ratings listed on your flight instructor certificate, or for an additional flight instructor rating. Can be done in an FFS or FTD under a Part 142 approved course."
                  },
                  {
                    id: 2,
                    title: "80% Checkride Pass Rate",
                    ref: "§61.197(b)(2)(i)",
                    desc: "Within the preceding 24 calendar months endorse at least 5 applicants for a practical test and at least 80% of all applicants you endorsed passed on their first attempt."
                  },
                  {
                    id: 3,
                    title: "Part 121 or 135 Service",
                    ref: "§61.197(b)(2)(ii)",
                    desc: "Within the preceding 24 calendar months serve as a company check pilot, chief flight instructor, company check airman, or flight instructor in a Part 121 or 135 operation, or in a position involving the regular evaluation of pilots."
                  },
                  {
                    id: 4,
                    title: "Flight Instructor Refresher Course (FIRC)",
                    ref: "§61.197(b)(2)(iii)",
                    desc: "Within the preceding 3 calendar months successfully complete an approved FIRC consisting of ground training, flight training, or a combination of both."
                  },
                  {
                    id: 5,
                    title: "Military Instructor Proficiency Check",
                    ref: "§61.197(b)(2)(iv)",
                    desc: "Within the preceding 24 calendar months pass an official U.S. Armed Forces military instructor pilot or pilot examiner proficiency check in an aircraft for which you already hold a rating or for an additional rating."
                  },
                  {
                    id: 6,
                    title: "FAA Pilot Proficiency Program",
                    ref: "§61.197(b)(2)(v)",
                    desc: "Within the preceding 24 calendar months serve as a flight instructor in an FAA-sponsored pilot proficiency program. Must complete at least one phase of the program in the preceding 12 months and conduct at least 15 flight activities evaluating at least 5 different pilots."
                  }
                ].map((opt) => (
                  <div 
                    key={opt.id}
                    className="p-4 rounded-xl border relative border-l-4 border-l-[#1a3a5c]"
                    style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-sm font-black leading-tight pr-12" style={{ color: 'var(--text-primary)' }}>{opt.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0" style={{ backgroundColor: 'var(--navy)', color: 'white' }}>
                        {opt.ref}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {opt.desc}
                    </p>
                  </div>
                ))}

                {/* Important Note */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                  <Info size={16} className="text-[#e8a020] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#92400e] leading-relaxed">
                    <span className="font-bold">Important:</span> Under the new FAA rules effective December 1, 2024, flight instructor certificates no longer display an expiration date. Your Recent Experience End Date (REED) is tracked in the FAA Airmen Registry at FAA.gov. You must establish recent experience within your 24 calendar month REED period. If you miss your REED you enter a 3-month reinstatement period per §61.199 during which you may not exercise flight instructor privileges. After the 3-month reinstatement period you must pass a practical test to regain privileges per §61.199.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Student Modal */}
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
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
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
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} className="text-white/50 group-hover:text-white transition-colors" />
                      <span>Send Progress Link</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NewStudentModal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        onStudentCreated={(student) => {
          setStudents(prev => [...prev, student].sort((a, b) => a.name.localeCompare(b.name)));
          handleSelectStudent(student);
        }}
      />
      {createPortal(
        <div className="fixed top-16 left-0 right-0 z-[90]" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
          <AnimatePresence>
            {students.length === 0 && !loading && localStorage.getItem('61t_onboarded') === 'true' && !bannerDismissed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pt-4 overflow-hidden"
              >
                <div className="bg-[#d4e8f5] border border-[#a8d0ed] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xl">👋</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a3a5c]">Welcome! Tap the Add Student button above to get started.</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        localStorage.setItem('61t_banner_dismissed', 'true');
                        setBannerDismissed(true);
                      }}
                      className="w-10 h-10 rounded-xl hover:bg-black/5 flex items-center justify-center text-[#1a3a5c]/40 hover:text-[#1a3a5c] transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-4 py-3 flex items-center">
            <div className={cn("w-full transition-all", onboardingStep === 2 && "ring-4 ring-[#e8a020] ring-offset-2 rounded-xl animate-pulse")}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full text-sm border rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#1a3a5c] transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}