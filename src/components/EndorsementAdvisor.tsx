import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plane, CheckCircle, AlertTriangle, RefreshCw, MapPin, Moon, Clock, Repeat, Award, CloudLightning, Loader2, Plus, ChevronRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EndorsementAdvisorProps {
  studentName?: string;
  ratingCode?: string;
}

// Exact text from AC 61-65K Appendix A
const ENDORSEMENTS_DATA: Record<string, { ref: string; title: string; text: string; expires?: string }> = {
  'A.3': {
    ref: '14 CFR § 61.87(b)',
    title: 'Pre-solo aeronautical knowledge',
    text: 'I certify that [First name, MI, Last name] has satisfactorily completed the pre-solo knowledge test of 14 CFR § 61.87(b) for the [make and model] aircraft.',
  },
  'A.4': {
    ref: '14 CFR § 61.87(c)(1) and (2)',
    title: 'Pre-solo flight training',
    text: 'I certify that [First name, MI, Last name] has received and logged pre-solo flight training for the maneuvers and procedures that are appropriate to the [make and model] aircraft. I have determined they have demonstrated satisfactory proficiency and safety on the maneuvers and procedures required by 14 CFR § 61.87 in this or similar make and model of aircraft to be flown.',
  },
  'A.5': {
    ref: '14 CFR § 61.87(o)',
    title: 'Pre-solo flight training at night',
    text: 'I certify that [First name, MI, Last name] has received flight training at night on night flying procedures that include takeoffs, approaches, landings, and go-arounds at night at the [airport name] airport where the solo flight will be conducted; navigation training at night in the vicinity of the [airport name] airport where the solo flight will be conducted. This endorsement expires 90 calendar days from the date the flight training at night was received.',
    expires: '90 calendar days from date of training',
  },
  'A.6': {
    ref: '14 CFR § 61.87(n)',
    title: 'Solo flight — first 90-calendar-day period',
    text: 'I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined they meet the applicable requirements of 14 CFR § 61.87(n) and are proficient to make solo flights in [make and model].',
    expires: '90 calendar days from date of endorsement',
  },
  'A.7': {
    ref: '14 CFR § 61.87(p)',
    title: 'Solo flight — each additional 90-calendar-day period',
    text: 'I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined that they meet the applicable requirements of 14 CFR § 61.87(p) and are proficient to make solo flights in [make and model].',
    expires: '90 calendar days from date of endorsement',
  },
  'A.8': {
    ref: '14 CFR § 61.93(b)(1)',
    title: 'Solo takeoffs and landings at another airport within 25 NM',
    text: 'I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.93(b)(1). I have determined that they are proficient to practice solo takeoffs and landings at [airport name]. The takeoffs and landings at [airport name] are subject to the following conditions: [List any applicable conditions or limitations.]',
  },
  'A.9': {
    ref: '14 CFR § 61.93(c)(1) and (2)',
    title: 'Solo cross-country flight — general authorization',
    text: 'I certify that [First name, MI, Last name] has received the required solo cross-country training. I find they have met the applicable requirements of 14 CFR § 61.93 and are proficient to make solo cross-country flights in a [make and model] aircraft, [aircraft category].',
  },
  'A.10': {
    ref: '14 CFR § 61.93(c)(3)',
    title: 'Solo cross-country flight — individual flight planning review',
    text: 'I have reviewed the cross-country planning of [First name, MI, Last name]. I find the planning and preparation to be correct to make the solo flight from [origination airport] to [destination airport] via [route of flight] with landings at [names of the airports] in a [make and model] aircraft on [date]. [List any applicable conditions or limitations.]',
  },
  'A.11': {
    ref: '14 CFR § 61.93(b)(2)',
    title: 'Repeated solo cross-country flights not more than 50 NM',
    text: 'I certify that [First name, MI, Last name] has received the required training in both directions between and at both [airport names]. I have determined that they are proficient of 14 CFR § 61.93(b)(2) to conduct repeated solo cross-country flights over that route, subject to the following conditions: [List any applicable conditions or limitations.]',
  },
  'A.12': {
    ref: '14 CFR § 61.95(a)',
    title: 'Solo flight in Class B airspace',
    text: 'I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.95(a). I have determined they are proficient to conduct solo flights in [name of Class B] airspace. [List any applicable conditions or limitations.]',
    expires: '90 calendar days from date of endorsement',
  },
  'A.13': {
    ref: '14 CFR §§ 61.95(b) and 91.131(b)(1)',
    title: 'Solo flight to, from, or at an airport located in Class B airspace',
    text: 'I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.95(b)(1). I have determined that they are proficient to conduct solo flight operations at [name of airport]. [List any applicable conditions or limitations.]',
    expires: '90 calendar days from date of endorsement',
  },
};

type Scenario =
  | 'first-solo'
  | 'solo-night'
  | 'solo-within-25'
  | 'solo-beyond-50'
  | 'solo-90day'
  | 'solo-classb'
  | 'xc-review';

const SCENARIOS: { id: Scenario; label: string; sub: string; icon: React.ReactNode; color: string; required: string[] }[] = [
  {
    id: 'first-solo',
    label: 'First Solo Flight',
    sub: 'A.3, A.4, A.6',
    icon: <Plane size={20} />,
    color: '#1a3a5c',
    required: ['A.3', 'A.4', 'A.6'],
  },
  {
    id: 'solo-night',
    label: 'Solo at Night',
    sub: 'A.5 + current A.6 or A.7',
    icon: <Moon size={20} />,
    color: '#1a3a5c',
    required: ['A.5'],
  },
  {
    id: 'solo-within-25',
    label: 'Solo Within 25 NM',
    sub: 'A.8 + current A.6 or A.7',
    icon: <MapPin size={20} />,
    color: '#2d7a4f',
    required: ['A.8'],
  },
  {
    id: 'solo-beyond-50',
    label: 'Solo XC Beyond 50 NM',
    sub: 'A.9 (once) + A.10 (every flight)',
    icon: <ChevronRight size={20} />,
    color: '#7c3aed',
    required: ['A.9', 'A.10'],
  },
  {
    id: 'solo-90day',
    label: 'Renew 90-Day Solo',
    sub: 'A.7 — each additional period',
    icon: <Repeat size={20} />,
    color: '#e67e22',
    required: ['A.7'],
  },
  {
    id: 'solo-classb',
    label: 'Solo in Class B',
    sub: 'A.12 (airspace) or A.13 (airport)',
    icon: <CloudLightning size={20} />,
    color: '#c0392b',
    required: ['A.12', 'A.13'],
  },
  {
    id: 'xc-review',
    label: 'XC Flight Planning Review',
    sub: 'A.10 — required every solo XC',
    icon: <Clock size={20} />,
    color: '#e8a020',
    required: ['A.10'],
  },
];

export default function EndorsementAdvisor({ studentName, ratingCode = 'ppl' }: EndorsementAdvisorProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [classBChoice, setClassBChoice] = useState<'airspace' | 'airport' | 'both' | null>(null);
  const [savedEndorsements, setSavedEndorsements] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  // A.10 repeating log
  const [a10Reviews, setA10Reviews] = useState<{ date: string; route: string }[]>([]);
  const [newA10Date, setNewA10Date] = useState(new Date().toISOString().split('T')[0]);
  const [newA10Route, setNewA10Route] = useState('');
  const [savingA10, setSavingA10] = useState(false);

  useEffect(() => {
    if (studentName) {
      fetchEndorsements();
      fetchA10Reviews();
    }
  }, [studentName, ratingCode]);

  const fetchEndorsements = async () => {
    const { data } = await supabase
      .from('endorsements')
      .select('endorsement_key, completed_date')
      .eq('student_name', studentName)
      .eq('rating', ratingCode)
      .eq('completed', true);
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(e => { map[e.endorsement_key] = e.completed_date; });
      setSavedEndorsements(map);
    }
  };

  const fetchA10Reviews = async () => {
    const { data } = await supabase
      .from('manual_hours')
      .select('entries')
      .eq('student_name', studentName)
      .eq('field_key', 'a10_xc_reviews')
      .maybeSingle();
    if (data?.entries) {
      setA10Reviews(data.entries);
    }
  };

  const handleMarkAsGiven = async (key: string) => {
    if (!studentName || savedEndorsements[key]) return;
    setSaving(key);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(null); return; }
    const { error } = await supabase.from('endorsements').insert({
      user_id: session.user.id,
      student_name: studentName,
      rating: ratingCode,
      endorsement_key: key,
      endorsement_label: `AC 61-65K ${key} — ${ENDORSEMENTS_DATA[key].title}`,
      completed: true,
      completed_date: new Date().toISOString(),
    });
    if (!error) {
      setSavedEndorsements(prev => ({ ...prev, [key]: new Date().toISOString() }));
    }
    setSaving(null);
  };

  const handleLogA10Review = async () => {
    if (!studentName || !newA10Date) return;
    setSavingA10(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSavingA10(false); return; }
    const newEntry = { date: newA10Date, route: newA10Route || 'Route not specified' };
    const updatedReviews = [...a10Reviews, newEntry];
    const existing = await supabase
      .from('manual_hours')
      .select('id')
      .eq('student_name', studentName)
      .eq('field_key', 'a10_xc_reviews')
      .maybeSingle();
    if (existing.data) {
      await supabase.from('manual_hours').update({
        entries: updatedReviews,
        total: updatedReviews.length,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.data.id);
    } else {
      await supabase.from('manual_hours').insert({
        user_id: session.user.id,
        student_name: studentName,
        field_key: 'a10_xc_reviews',
        entries: updatedReviews,
        total: updatedReviews.length,
      });
    }
    setA10Reviews(updatedReviews);
    setNewA10Route('');
    setSavingA10(false);
  };

  const getEndorsementsForScenario = (scenario: Scenario): string[] => {
    if (scenario === 'first-solo') return ['A.3', 'A.4', 'A.6'];
    if (scenario === 'solo-night') return ['A.5'];
    if (scenario === 'solo-within-25') return ['A.8', 'A.11'];
    if (scenario === 'solo-beyond-50') return ['A.9', 'A.10'];
    if (scenario === 'solo-90day') return ['A.7'];
    if (scenario === 'solo-classb') {
      if (classBChoice === 'airspace') return ['A.12'];
      if (classBChoice === 'airport') return ['A.13'];
      if (classBChoice === 'both') return ['A.12', 'A.13'];
      return [];
    }
    if (scenario === 'xc-review') return ['A.10'];
    return [];
  };

  const renderEndorsementCard = (key: string) => {
    const data = ENDORSEMENTS_DATA[key];
    const isSaved = !!savedEndorsements[key];
    const savedDate = savedEndorsements[key]
      ? new Date(savedEndorsements[key]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null;

    // A.10 in xc-review scenario gets its own special UI
    if (key === 'A.10' && selectedScenario === 'xc-review') {
      return (
        <div key={key} className="bg-white rounded-xl border border-[#dde3ec] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#dde3ec] bg-[#fffbeb]">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#e8a020] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{key}</span>
              <span className="text-[10px] font-mono text-[#6b7280]">{data.ref}</span>
            </div>
            <p className="text-sm font-bold text-[#1a3a5c]">{data.title}</p>
            <p className="text-[11px] text-[#92400e] mt-1 font-medium">⚠️ Required before every solo XC beyond 50 NM — per AC 61-65K §20.6</p>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-[11px] text-[#6b7280] italic border-l-4 border-[#f4f5f7] pl-3 leading-relaxed">
              "{data.text.replace('[First name, MI, Last name]', studentName || '[Student Name]')}"
            </p>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Log a Planning Review</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="date"
                  value={newA10Date}
                  onChange={e => setNewA10Date(e.target.value)}
                  className="text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a3a5c]"
                />
                <input
                  type="text"
                  value={newA10Route}
                  onChange={e => setNewA10Route(e.target.value)}
                  placeholder="Route (e.g. KORD → KMDW)"
                  className="flex-1 text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a3a5c] min-w-[180px]"
                />
                <button
                  onClick={handleLogA10Review}
                  disabled={savingA10 || !newA10Date}
                  className="flex items-center gap-2 px-4 py-2 bg-[#e8a020] text-white text-xs font-bold rounded-lg hover:bg-[#d4941c] transition-all disabled:opacity-50"
                >
                  {savingA10 ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Log Review
                </button>
              </div>
            </div>
            {a10Reviews.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">{a10Reviews.length} Review{a10Reviews.length !== 1 ? 's' : ''} Logged</p>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {[...a10Reviews].reverse().map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] py-1.5 px-3 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                      <span className="font-bold text-[#1a3a5c]">{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-[#6b7280]">{r.route}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={key} className={cn("bg-white rounded-xl border shadow-sm overflow-hidden", isSaved ? "border-[#2d7a4f]" : "border-[#dde3ec]")}>
        <div className={cn("p-4 border-b", isSaved ? "bg-[#f0fdf4] border-[#bbf7d0]" : "bg-[#f8fafc] border-[#dde3ec]")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full text-white", isSaved ? "bg-[#2d7a4f]" : "bg-[#1a3a5c]")}>{key}</span>
                <span className="text-[10px] font-mono text-[#6b7280]">{data.ref}</span>
              </div>
              <p className="text-sm font-bold text-[#1a3a5c]">{data.title}</p>
              {data.expires && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle size={11} className="text-[#e8a020]" />
                  <p className="text-[10px] text-[#92400e] font-bold">Expires: {data.expires}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => !isSaved && handleMarkAsGiven(key)}
              disabled={isSaved || saving === key}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0",
                isSaved
                  ? "bg-[#e4f5ec] text-[#2d7a4f] cursor-default"
                  : "bg-[#1a3a5c] text-white hover:bg-[#2a5a8c] shadow-sm"
              )}
            >
              {saving === key ? <Loader2 size={11} className="animate-spin" /> : isSaved ? <CheckCircle size={11} /> : <Plus size={11} />}
              {isSaved ? 'Given' : 'Mark Given'}
            </button>
          </div>
          {isSaved && savedDate && (
            <p className="text-[10px] text-[#2d7a4f] font-medium mt-1">Given on {savedDate}</p>
          )}
        </div>
        <div className="p-4">
          <p className="text-[11px] text-[#475569] leading-relaxed italic border-l-4 border-[#f4f5f7] pl-3">
            "{data.text.replace('[First name, MI, Last name]', studentName || '[Student Name]')}"
          </p>
          {key === 'A.9' && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-[#f5f3ff] rounded-lg border border-[#ddd6fe]">
              <Info size={12} className="text-[#7c3aed] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#5b21b6]">A.9 is given once — it is the general solo XC authorization. A.10 must still be given before every individual solo XC flight.</p>
            </div>
          )}
          {key === 'A.10' && selectedScenario !== 'xc-review' && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-[#fffbeb] rounded-lg border border-[#fef3c7]">
              <Info size={12} className="text-[#e8a020] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#92400e]">A.10 must be given before every solo XC flight — the CFI must review the student's specific flight planning each time per §61.93(c)(3).</p>
            </div>
          )}
          {(key === 'A.6' || key === 'A.7') && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-[#eff6ff] rounded-lg border border-[#bfdbfe]">
              <Info size={12} className="text-[#2563eb] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#1e40af]">This endorsement must be given by the instructor who gave the training, within the 90-calendar-day period preceding the date of the flight per §61.87(n)/(p).</p>
            </div>
          )}
          {(key === 'A.12' || key === 'A.13') && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
              <Info size={12} className="text-[#c0392b] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#991b1b]">Both ground and flight training must be completed in the specific Class B area/airport within 90 days preceding the flight per §61.95(a)/(b).</p>
            </div>
          )}
          {key === 'A.5' && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
              <Info size={12} className="text-[#c0392b] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#991b1b]">A.6 or A.7 must also be current before authorizing any solo night flight per §61.87(o).</p>
            </div>
          )}
          {key === 'A.8' && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-[#eff6ff] rounded-lg border border-[#bfdbfe]">
              <Info size={12} className="text-[#2563eb] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#1e40af]">A.6 or A.7 must be current before using this endorsement. This authorizes the specific airport named — for repeated flights to same airport see A.11.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-[#dde3ec] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a3a5c] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Plane size={20} className="text-[#e8a020]" />
          </div>
          <div>
            <h3 className="text-white font-bold">Endorsement Advisor</h3>
            <p className="text-white/60 text-[10px] uppercase tracking-widest">Based on AC 61-65K</p>
          </div>
        </div>
        {selectedScenario && (
          <button
            onClick={() => { setSelectedScenario(null); setClassBChoice(null); }}
            className="text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={12} />
            Back
          </button>
        )}
      </div>

      <div className="p-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          {!selectedScenario ? (
            <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-bold text-[#1a3a5c] mb-4">What does the student need to do?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCENARIOS.map(s => {
                  const endorsementsForScenario = s.id === 'solo-classb'
                    ? ['A.12', 'A.13']
                    : s.required;
                  const allGiven = endorsementsForScenario.every(k => savedEndorsements[k]);
                  const someGiven = endorsementsForScenario.some(k => savedEndorsements[k]);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScenario(s.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                        allGiven
                          ? "border-[#2d7a4f] bg-[#f0fdf4]"
                          : someGiven
                          ? "border-[#e8a020] bg-[#fffbeb]"
                          : "border-[#dde3ec] bg-white hover:border-[#1a3a5c]"
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: s.color }}
                      >
                        {s.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1c2333]">{s.label}</p>
                        <p className="text-[10px] text-[#6b7280] font-mono">{s.sub}</p>
                      </div>
                      {allGiven && <CheckCircle size={18} className="text-[#2d7a4f] shrink-0" />}
                      {!allGiven && someGiven && <AlertTriangle size={18} className="text-[#e8a020] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Scenario title */}
              <div>
                <p className="text-lg font-bold text-[#1a3a5c]">
                  {SCENARIOS.find(s => s.id === selectedScenario)?.label}
                </p>
                <p className="text-[11px] text-[#6b7280]">Required endorsements per AC 61-65K</p>
              </div>

              {/* Class B sub-choice */}
              {selectedScenario === 'solo-classb' && !classBChoice && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-[#1a3a5c]">What type of Class B operation?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'airspace', label: 'Class B Airspace Only', sub: 'Flying through Class B — A.12', color: '#1a3a5c' },
                      { id: 'airport', label: 'Class B Airport', sub: 'Landing at Class B airport — A.13', color: '#c0392b' },
                      { id: 'both', label: 'Both', sub: 'Airspace + airport — A.12 + A.13', color: '#7c3aed' },
                    ].map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => setClassBChoice(choice.id as any)}
                        className="p-4 rounded-xl border-2 border-[#dde3ec] hover:border-[#1a3a5c] text-left transition-all"
                      >
                        <p className="text-sm font-bold text-[#1c2333]">{choice.label}</p>
                        <p className="text-[10px] text-[#6b7280] mt-0.5">{choice.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Endorsement cards */}
              {(selectedScenario !== 'solo-classb' || classBChoice) && (
                <div className="space-y-4">
                  {getEndorsementsForScenario(selectedScenario).map(key => renderEndorsementCard(key))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#dde3ec] flex items-start gap-3">
        <Award size={14} className="text-[#1a3a5c] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#64748b] leading-relaxed">
          All endorsements are from <strong>AC 61-65K</strong> Appendix A. Verify all requirements with the current FAR/AIM before signing any endorsement in the student's logbook.
        </p>
      </div>
    </div>
  );
}
