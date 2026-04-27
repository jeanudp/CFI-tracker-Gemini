import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { RATINGS } from '../constants';
import { X, User, Phone, Mail, Calendar, FileText, Heart, ChevronRight, Check, Loader2, Plane, Cloud, Gauge, ClipboardList, Compass, Navigation, AlertCircle, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated: (student: any) => void;
}

const STEPS = ['Details', 'Rating', 'Prior Hours'];

const ratingIcons: Record<string, any> = {
  ppl: Plane, ir: Cloud, cpl: Gauge, cfi: ClipboardList, cfii: Compass, mei: Navigation
};

const ratingColors: Record<string, { bg: string, text: string, border: string, light: string }> = {
  ppl:  { bg: '#1a3a5c', text: 'white', border: '#1a3a5c', light: '#d4e8f5' },
  ir:   { bg: '#7c3aed', text: 'white', border: '#7c3aed', light: '#ede8f8' },
  cpl:  { bg: '#2d7a4f', text: 'white', border: '#2d7a4f', light: '#e4f5ec' },
  cfi:  { bg: '#e67e22', text: 'white', border: '#e67e22', light: '#fdf0e4' },
  cfii: { bg: '#16a34a', text: 'white', border: '#16a34a', light: '#e0f5f2' },
  mei:  { bg: '#c0392b', text: 'white', border: '#c0392b', light: '#fdecea' },
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
  let secondClassMonths = 12; // Standard 2nd class window is 12 months for 2nd class privileges

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

const PRIOR_FIELDS = [
  { group: 'Totals', fields: [
    { key: 'prior_totalFlight', label: 'Total Flight Time', unit: 'hrs' },
    { key: 'prior_ldgTotal', label: 'Total Landings', unit: 'count' },
    { key: 'prior_ldgDay', label: 'Day Landings', unit: 'count' },
    { key: 'prior_ldgNight', label: 'Night Landings', unit: 'count' },
  ]},
  { group: 'Solo', fields: [
    { key: 'prior_solo', label: 'Solo Flight Time', unit: 'hrs' },
    { key: 'prior_xcSolo', label: 'Solo Cross Country', unit: 'hrs' },
  ]},
  { group: 'Dual', fields: [
    { key: 'prior_dual', label: 'Dual Received', unit: 'hrs' },
    { key: 'prior_xcDual', label: 'Cross Country Dual', unit: 'hrs' },
    { key: 'prior_nightDual', label: 'Night Dual', unit: 'hrs' },
  ]},
  { group: 'PIC', fields: [
    { key: 'prior_pic', label: 'PIC Time', unit: 'hrs' },
    { key: 'prior_xcPic', label: 'Cross Country PIC', unit: 'hrs' },
    { key: 'prior_nightPic', label: 'Night PIC', unit: 'hrs' },
  ]},
  { group: 'Instrument', fields: [
    { key: 'prior_simInst', label: 'Simulated Instrument', unit: 'hrs' },
    { key: 'prior_imc', label: 'Actual Instrument', unit: 'hrs' },
    { key: 'prior_atdInst', label: 'ATD Instrument', unit: 'hrs' },
  ]},
  { group: 'Night', fields: [
    { key: 'prior_night', label: 'Night Total', unit: 'hrs' },
    { key: 'prior_nightTakeoffs', label: 'Night Takeoffs', unit: 'count' },
  ]},
];

export default function NewStudentModal({ isOpen, onClose, onStudentCreated }: NewStudentModalProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      setSubLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        setSubscription(data);
      } finally {
        setSubLoading(false);
      }
    };
    if (isOpen) fetchSub();
  }, [isOpen]);

  const isRatingUnlocked = (code: string) => {
    if (code === 'ppl') return true;
    if (subLoading) return false;
    if (!subscription) return false;
    if (subscription.plan === 'invite') return true;
    const unlockedList = subscription.ratings_unlocked;
    if (!unlockedList) return false;
    if (!Array.isArray(unlockedList)) return false;
    if (subscription.status !== 'active' && subscription.status !== 'trialing') return false;
    return unlockedList.includes(code);
  };

  const handleRedeemCode = async () => {
    setInviteLoading(true);
    setInviteError(null);
    try {
      const code = inviteCode.trim().toUpperCase();
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

      setInviteSuccess(true);
      setSubscription((prev: any) => ({
        ...prev,
        plan: 'invite',
        ratings_unlocked: ['ppl', 'ir', 'cpl', 'cfi', 'cfii', 'mei'],
      }));
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  // Step 1 — Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [dob, setDob] = useState('');
  const [studentCertNumber, setStudentCertNumber] = useState('');
  const [medicalClass, setMedicalClass] = useState('');
  const [medicalExamDate, setMedicalExamDate] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2 — Rating
  const [selectedRating, setSelectedRating] = useState<string | null>('ppl');

  // Step 3 — Prior Hours
  const [priorHours, setPriorHours] = useState<Record<string, string>>({});
  const [includePrior, setIncludePrior] = useState(false);

  const resetForm = () => {
    setStep(0);
    setName('');
    setPhone('');
    setEmailAddress('');
    setDob('');
    setStudentCertNumber('');
    setMedicalClass('');
    setMedicalExamDate('');
    setNotes('');
    setSelectedRating('ppl');
    setPriorHours({});
    setIncludePrior(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (step === 0 && !name.trim()) {
      setError('Student name is required');
      return;
    }
    if (step === 1 && !selectedRating) {
      setError('Please select a rating');
      return;
    }
    if (step === 1 && selectedRating && !isRatingUnlocked(selectedRating)) {
      setError('This rating requires an upgrade. Please select Private Pilot or upgrade your plan.');
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const rating = (RATINGS as any)[selectedRating!];

      // Insert student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: session.user.id,
          name: name.trim(),
          current_rating: selectedRating,
          current_rating_label: rating.label,
          phone: phone || null,
          email_address: emailAddress || null,
          dob: dob || null,
          student_cert_number: studentCertNumber || null,
          medical_class: medicalClass || null,
          medical_exam_date: medicalExamDate || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Save prior hours if any
      if (includePrior) {
        const priorEntries = Object.entries(priorHours)
          .filter(([_, v]) => v && parseFloat(v) > 0)
          .map(([key, value]) => ({
            user_id: session.user.id,
            student_name: name.trim(),
            field_key: key,
            entries: [{ val: parseFloat(value), date: 'Prior logbook' }],
            total: parseFloat(value),
          }));

        if (priorEntries.length > 0) {
          await supabase.from('manual_hours').insert(priorEntries);
        }
      }

      onStudentCreated(student);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92vh]"
            style={{ boxShadow: '0 -8px 40px rgba(26, 58, 92, 0.15), 0 24px 64px rgba(26, 58, 92, 0.2)' }}
          >
            {/* Handle bar for mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-[#dde3ec] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-[#f0f4f8] flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-black text-[#1a3a5c]">Add New Student</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-[#f0f4f8] flex items-center justify-center hover:bg-[#dde3ec] transition-colors cursor-pointer">
                <X size={16} className="text-[#6b7280]" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="px-6 py-3 flex items-center gap-2 shrink-0 border-b border-[#f0f4f8]">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={cn(
                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all",
                    i === step ? "text-[#1a3a5c]" : i < step ? "text-[#2d7a4f]" : "text-[#9ca3af]"
                  )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black",
                      i === step ? "bg-[#1a3a5c] text-white" :
                      i < step ? "bg-[#2d7a4f] text-white" :
                      "bg-[#f0f4f8] text-[#9ca3af]"
                    )}>
                      {i < step ? <Check size={10} /> : i + 1}
                    </div>
                    {s}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-px", i < step ? "bg-[#2d7a4f]" : "bg-[#dde3ec]")} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Step 0 — Details */}
              {step === 0 && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Student Name *</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Full name"
                          autoFocus
                          className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Phone</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                          className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={e => setEmailAddress(e.target.value)}
                          placeholder="student@email.com"
                          className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Date of Birth</label>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="date"
                          value={dob}
                          onChange={e => setDob(e.target.value)}
                          className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Student Cert Number</label>
                      <div className="relative">
                        <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="text"
                          value={studentCertNumber}
                          onChange={e => setStudentCertNumber(e.target.value)}
                          placeholder="Certificate number"
                          className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Medical Class</label>
                      <div className="relative">
                        <Heart size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <select
                          value={medicalClass}
                          onChange={e => setMedicalClass(e.target.value)}
                          className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc]"
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

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Medical Exam Date</label>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          type="date"
                          value={medicalExamDate}
                          onChange={e => setMedicalExamDate(e.target.value)}
                          className="w-full text-sm border border-[#dde3ec] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc]"
                        />
                      </div>
                      <p className="text-[9px] text-[#6b7280] ml-1">We calculate your expiry automatically based on class and age.</p>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Notes</label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any notes about this student..."
                        rows={3}
                        className="w-full text-sm border border-[#dde3ec] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc] resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 — Rating */}
              {step === 1 && (
                <div className="p-6">
                  {subLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={24} className="animate-spin text-[#1a3a5c]" />
                    </div>
                  )}
                  {!subLoading && (
                  <>
                  <p className="text-xs text-[#6b7280] mb-2 leading-relaxed">
                    Select the certificate or rating this student is currently working toward.
                  </p>
                  <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(26,58,92,0.05)', border: '1px solid rgba(26,58,92,0.1)' }}>
                    <Lock size={12} style={{ color: 'var(--navy)' }} />
                    <p className="text-[10px] font-bold" style={{ color: 'var(--navy)' }}>
                      Private Pilot is free forever. Upgrade to unlock additional ratings.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(RATINGS).map(([code, rating]) => {
                      const isSelected = selectedRating === code;
                      const colors = ratingColors[code];
                      const Icon = ratingIcons[code];
                      const unlocked = isRatingUnlocked(code);
                      const locked = !unlocked;

                      return (
                        <motion.div
                          key={code}
                          whileHover={unlocked ? { y: -3 } : {}}
                          whileTap={unlocked ? { scale: 0.97 } : {}}
                          onClick={() => {
                            if (!unlocked) return;
                            setSelectedRating(code);
                          }}
                          className="relative rounded-2xl border-2 p-5 text-center transition-all flex flex-col items-center gap-3"
                          style={{
                            backgroundColor: locked ? '#f8fafc' : isSelected ? colors.light : 'var(--bg-secondary)',
                            borderColor: locked ? '#e2e8f0' : isSelected ? colors.bg : '#dde3ec',
                            boxShadow: locked ? 'none' : isSelected ? `0 4px 16px ${colors.bg}30` : '0 1px 4px rgba(26,58,92,0.06)',
                            opacity: locked ? 0.65 : 1,
                            cursor: locked ? 'default' : 'pointer',
                          }}
                        >
                          {/* Lock badge */}
                          {locked && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1a3a5c] flex items-center justify-center">
                              <Lock size={11} className="text-white" />
                            </div>
                          )}

                          {/* Free badge on PPL — only show for free users */}
                          {code === 'ppl' && subscription?.plan === 'free' && (
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                              style={{ backgroundColor: 'rgba(45,122,79,0.15)', color: '#2d7a4f', border: '1px solid rgba(45,122,79,0.3)' }}>
                              Free
                            </div>
                          )}

                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: locked ? '#f0f4f8' : isSelected ? colors.bg : colors.light,
                            }}
                          >
                            {locked
                              ? <Lock size={20} className="text-[#9ca3af]" />
                              : <Icon size={22} style={{ color: isSelected ? 'white' : colors.bg }} />
                            }
                          </div>

                          <div>
                            <div
                              className="text-xs font-bold leading-tight"
                              style={{ color: locked ? '#9ca3af' : isSelected ? (ratingColors[code].text === 'white' ? colors.bg : colors.bg) : 'var(--text-primary)' }}
                            >
                              {rating.label}
                            </div>
                            <div
                              className="text-[9px] mt-0.5"
                              style={{ color: locked ? '#c4c9d4' : 'var(--text-secondary)', opacity: locked ? 1 : 0.7 }}
                            >
                              {locked ? 'Upgrade to unlock' : rating.acs}
                            </div>
                          </div>

                          {isSelected && !locked && (
                            <div
                              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: colors.bg }}
                            >
                              <Check size={11} className="text-white" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <p className="text-center text-[10px] mt-4" style={{ color: '#6b7280' }}>
                    ASEL only · MEI includes AMEL · Other classes not yet supported.
                  </p>

                  {/* Upgrade prompt */}
                  {subscription?.plan === 'free' && (
                    <div className="mt-5 space-y-3">
                      <div
                        className="p-4 rounded-xl flex items-center justify-between"
                        style={{ backgroundColor: 'rgba(26,58,92,0.05)', border: '1px solid rgba(26,58,92,0.12)' }}
                      >
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--navy)' }}>Want to track all ratings?</p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>1 month free trial — cancel anytime</p>
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            // Small delay so modal closes before paywall opens
                            setTimeout(() => {
                              const event = new CustomEvent('openPaywall');
                              window.dispatchEvent(event);
                            }, 300);
                          }}
                          className="px-4 py-2 text-xs font-black text-white rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                          style={{ backgroundColor: 'var(--navy)', boxShadow: '0 4px 12px rgba(26,58,92,0.3)' }}
                        >
                          See Plans →
                        </button>
                      </div>

                      {/* Invite code box */}
                      <div
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'rgba(26,58,92,0.03)', border: '1px solid rgba(26,58,92,0.08)' }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                          Have an invite code?
                        </p>
                        {inviteSuccess ? (
                          <div className="flex items-center gap-2 py-2 text-xs font-bold" style={{ color: '#2d7a4f' }}>
                            <Check size={14} />
                            Access unlocked! All ratings are now available.
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={inviteCode}
                              onChange={e => setInviteCode(e.target.value.toUpperCase())}
                              placeholder="61T-XXXX-XXXX-XXXX"
                              className="flex-1 text-xs rounded-xl px-3 py-2 border font-mono tracking-wider focus:outline-none"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: inviteError ? '#ef4444' : 'var(--border-color)',
                                color: 'var(--text-primary)',
                              }}
                            />
                            <button
                              onClick={handleRedeemCode}
                              disabled={inviteLoading || !inviteCode.trim()}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50"
                              style={{ backgroundColor: '#1a3a5c' }}
                            >
                              {inviteLoading ? '...' : 'Redeem'}
                            </button>
                          </div>
                        )}
                        {inviteError && (
                          <p className="text-[10px] mt-1.5 font-bold" style={{ color: '#ef4444' }}>{inviteError}</p>
                        )}
                      </div>
                    </div>
                  )}
                  </>
                  )}
                </div>
              )}

              {/* Step 2 — Prior Hours */}
              {step === 2 && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#1a2333]">Prior Logbook Hours</h3>
                      <p className="text-xs text-[#6b7280] mt-0.5">Import totals from existing logbook</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setIncludePrior(!includePrior)}
                        className={cn(
                          "w-10 h-6 rounded-full transition-all relative",
                          includePrior ? "bg-[#1a3a5c]" : "bg-[#dde3ec]"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all",
                          includePrior ? "left-5" : "left-1"
                        )} />
                      </div>
                      <span className="text-xs font-bold text-[#6b7280]">Include</span>
                    </label>
                  </div>

                  {includePrior && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div
                        className="border rounded-xl p-3 flex items-start gap-2"
                        style={{ backgroundColor: 'rgba(232,160,32,0.05)', borderColor: 'rgba(232,160,32,0.2)' }}
                      >
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#e8a020]" />
                        <p className="text-[10px] text-[#e8a020] leading-relaxed">
                          Only enter hours not already logged in this app. These will be added to all totals.
                        </p>
                      </div>

                      {PRIOR_FIELDS.map(group => (
                        <div key={group.group}>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c] mb-3 pb-1 border-b border-[#f0f4f8]">
                            {group.group}
                          </h4>
                          <div className="space-y-3">
                            {group.fields.map(field => (
                              <div key={field.key} className="flex items-center justify-between gap-2">
                                <label className="text-xs text-[#4b5563] flex-1">{field.label}</label>
                                <div className="relative w-24 mr-8">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={priorHours[field.key] || ''}
                                    onChange={e => setPriorHours(prev => ({ ...prev, [field.key]: e.target.value }))}
                                    placeholder="0"
                                    className="w-full text-right text-xs font-bold border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a3a5c] bg-[#f8fafc]"
                                  />
                                  <span className="absolute -right-7 top-1/2 -translate-y-1/2 text-[9px] text-[#9ca3af]">
                                    {field.unit}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {!includePrior && (
                    <div className="py-8 text-center">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="text-sm text-[#9ca3af]">Toggle on to add prior hours</p>
                      <p className="text-xs text-[#9ca3af] mt-1">You can also add these later from the student profile</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-6 py-2 shrink-0">
                <div className="bg-[#fdecea] border border-[#f5c0bc] rounded-xl p-3 flex items-center gap-2 text-xs text-[#c0392b]">
                  <AlertCircle size={14} />
                  {error}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#f0f4f8] flex gap-3 shrink-0">
              {step > 0 && (
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-5 py-3 rounded-xl border border-[#dde3ec] text-sm font-bold text-[#6b7280] hover:bg-[#f0f4f8] transition-all cursor-pointer"
                >
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-[#1a3a5c] text-white font-bold rounded-xl text-sm hover:bg-[#2a5a8c] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#2d7a4f] text-white font-bold rounded-xl text-sm hover:bg-[#24633f] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Student'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
