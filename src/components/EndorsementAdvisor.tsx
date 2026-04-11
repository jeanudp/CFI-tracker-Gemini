import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plane, CheckCircle, AlertTriangle, RefreshCw, ChevronRight, Award, BookOpen, MapPin, CheckSquare, Square, Loader2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EndorsementAdvisorProps {
  studentName?: string;
  ratingCode?: string;
}

const ENDORSEMENTS_DATA: Record<string, { ref: string; text: string }> = {
  'A.1': {
    ref: '§61.39(a)(6)(i) and (ii)',
    text: 'I certify that [First name, MI, Last name] has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of [applicable] certificate.'
  },
  'A.2': {
    ref: '§61.39(a)(6)(iii)',
    text: 'I certify that [First name, MI, Last name] has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the [applicable] airman knowledge test.'
  },
  'A.3': {
    ref: '§61.87(b)',
    text: 'I certify that [First name, MI, Last name] has satisfactorily completed the pre-solo knowledge test of 14 CFR § 61.87(b) for the [make and model] aircraft.'
  },
  'A.4': {
    ref: '§61.87(c)(1) and (2)',
    text: 'I certify that [First name, MI, Last name] has received and logged pre-solo flight training for the maneuvers and procedures that are appropriate to the [make and model] aircraft. I have determined they have demonstrated satisfactory proficiency and safety on the maneuvers and procedures required by 14 CFR § 61.87 in this or similar make and model of aircraft to be flown.'
  },
  'A.5': {
    ref: '§61.87(o)',
    text: 'I certify that [First name, MI, Last name] has received flight training at night on night flying procedures that include takeoffs, approaches, landings, and go-arounds at night at the [airport name] airport where the solo flight will be conducted; navigation training at night in the vicinity of the [airport name] airport where the solo flight will be conducted. This endorsement expires 90 calendar days from the date the flight training at night was received.'
  },
  'A.6': {
    ref: '§61.87(n)',
    text: 'I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined they meet the applicable requirements of 14 CFR § 61.87(n) and are proficient to make solo flights in [make and model].'
  },
  'A.7': {
    ref: '§61.87(p)',
    text: 'I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined that they meet the applicable requirements of 14 CFR § 61.87(p) and are proficient to make solo flights in [make and model].'
  },
  'A.8': {
    ref: '§61.93(b)(1)',
    text: 'I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.93(b)(1). I have determined that they are proficient to practice solo takeoffs and landings at [airport name]. The takeoffs and landings at [airport name] are subject to the following conditions: [List any applicable conditions or limitations.]'
  },
  'A.9': {
    ref: '§61.93(c)(1) and (2)',
    text: 'I certify that [First name, MI, Last name] has received the required solo cross-country training. I find they have met the applicable requirements of 14 CFR § 61.93 and are proficient to make solo cross-country flights in a [make and model] aircraft, [aircraft category].'
  },
  'A.10': {
    ref: '§61.93(c)(3)',
    text: 'I have reviewed the cross-country planning of [First name, MI, Last name]. I find the planning and preparation to be correct to make the solo flight from [origination airport] to [destination airport] via [route of flight] with landings at [names of the airports] in a [make and model] aircraft on [date]. [List any applicable conditions or limitations.]'
  },
  'A.11': {
    ref: '§61.93(b)(2)',
    text: 'I certify that [First name, MI, Last name] has received the required training in both directions between and at both [airport names]. I have determined that they are proficient of 14 CFR § 61.93(b)(2) to conduct repeated solo cross-country flights over that route, subject to the following conditions: [List any applicable conditions or limitations.]'
  },
  'A.12': {
    ref: '§61.95(a)',
    text: 'I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.95(a). I have determined they are proficient to conduct solo flights in [name of Class B] airspace. [List any applicable conditions or limitations.]'
  },
  'A.13': {
    ref: '§61.95(b) and §91.131(b)(1)',
    text: 'I certify that [First name, MI, Last name] has received the required training of 14 CFR § 61.95(b)(1). I have determined that they are proficient to conduct solo flight operations at [name of airport]. [List any applicable conditions or limitations.]'
  },
  'A.36': {
    ref: '§61.35(a)(1) §61.103(d) and §61.105',
    text: 'I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR § 61.105. I have determined they are prepared for the [name of] knowledge test.'
  },
  'A.37': {
    ref: '§61.103(f) §61.107(b) and §61.109',
    text: 'I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR §§ 61.107 and 61.109. I have determined they are prepared for the [name of] practical test.'
  }
};

type Goal = 'first-solo' | 'solo-nearby' | 'solo-xc' | 'knowledge-test' | 'checkride';

export default function EndorsementAdvisor({ studentName, ratingCode = 'ppl' }: EndorsementAdvisorProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedEndorsements, setSavedEndorsements] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (studentName) {
      fetchEndorsements();
    }
  }, [studentName, ratingCode]);

  const fetchEndorsements = async () => {
    const { data } = await supabase
      .from('endorsements')
      .select('endorsement_key')
      .eq('student_name', studentName)
      .eq('rating', ratingCode)
      .eq('completed', true);
    
    if (data) {
      setSavedEndorsements(data.map(e => e.endorsement_key));
    }
  };

  const handleMarkAsGiven = async (key: string) => {
    if (!studentName) return;
    setSaving(key);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const label = `AC 61-65K ${key}: ${ENDORSEMENTS_DATA[key].text}`;

    const { error } = await supabase
      .from('endorsements')
      .insert({
        user_id: session.user.id,
        student_name: studentName,
        rating: ratingCode,
        endorsement_key: key,
        endorsement_label: label,
        completed: true,
        completed_date: new Date().toISOString()
      });

    if (!error) {
      setSavedEndorsements(prev => [...prev, key]);
    }
    setSaving(null);
  };

  const reset = () => {
    setStep(1);
    setGoal(null);
    setAnswers({});
  };

  const handleGoalSelect = (selectedGoal: Goal) => {
    setGoal(selectedGoal);
    setStep(2);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setStep(prev => prev + 1);
  };

  const renderQuestion = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#1a3a5c]">What does the student need to do?</h3>
            <p className="text-sm text-[#6b7280]">Select the primary goal to determine required endorsements</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'first-solo', label: 'First Solo Flight', icon: <Plane size={24} /> },
              { id: 'solo-nearby', label: 'Solo at a Nearby Airport within 25NM', icon: <MapPin size={24} /> },
              { id: 'solo-xc', label: 'Solo Cross-Country Flight', icon: <ChevronRight size={24} /> },
              { id: 'knowledge-test', label: 'Knowledge Test', icon: <BookOpen size={24} /> },
              { id: 'checkride', label: 'Checkride Practical Test', icon: <Award size={24} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleGoalSelect(item.id as Goal)}
                className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#dde3ec] rounded-2xl hover:border-[#1a3a5c] hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-[#f4f5f7] rounded-xl flex items-center justify-center text-[#1a3a5c] mb-4 group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-[#1c2333] text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Logic for subsequent questions
    if (goal === 'first-solo') {
      if (step === 2) return renderYesNo('q2', 'Has the student completed and passed the pre-solo aeronautical knowledge test per §61.87(b)?');
      if (step === 3) return renderYesNo('q3', 'Has the student received and logged pre-solo flight training for the maneuvers and procedures in §61.87(d) for this make and model?');
      if (step === 4) return renderYesNo('q4', 'Will this solo flight include any flying after official sunset?');
      if (step === 5) return renderYesNo('q5', 'Will this solo flight be in Class B airspace or to a Class B airport?');
      if (step === 6 && answers.q5 === 'yes') {
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#1a3a5c] text-center">Class B Operations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => handleAnswer('q5_sub', 'airspace')} className="p-6 bg-white border-2 border-[#dde3ec] rounded-2xl hover:border-[#1a3a5c] font-bold text-sm">Class B Airspace only</button>
              <button onClick={() => handleAnswer('q5_sub', 'airport')} className="p-6 bg-white border-2 border-[#dde3ec] rounded-2xl hover:border-[#1a3a5c] font-bold text-sm">Class B Airport</button>
            </div>
          </div>
        );
      }
    }

    if (goal === 'solo-nearby') {
      if (step === 2) return renderYesNo('q2', "Is the student's 90-day solo endorsement current and not expired?");
      if (step === 3) return renderYesNo('q3', 'Has the student received training for operations at this specific airport?');
    }

    if (goal === 'solo-xc') {
      if (step === 2) return renderYesNo('q2', "Is the student's 90-day solo endorsement current and not expired?");
      if (step === 3) return renderYesNo('q3', 'Has the student ever been given the general solo cross-country authorization before?');
      if (step === 4) return renderYesNo('q4', 'Is this a specific planned cross-country flight that needs a planning review today?');
      if (step === 5) return renderYesNo('q5', 'Is this a repeated cross-country to the same airport within 50NM that has been flown before?');
      if (step === 6) return renderYesNo('q6', 'Will the flight go through Class B airspace or land at a Class B airport?');
      if (step === 7 && answers.q6 === 'yes') {
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#1a3a5c] text-center">Class B Operations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => handleAnswer('q6_sub', 'airspace')} className="p-6 bg-white border-2 border-[#dde3ec] rounded-2xl hover:border-[#1a3a5c] font-bold text-sm">Class B Airspace</button>
              <button onClick={() => handleAnswer('q6_sub', 'airport')} className="p-6 bg-white border-2 border-[#dde3ec] rounded-2xl hover:border-[#1a3a5c] font-bold text-sm">Class B Airport</button>
            </div>
          </div>
        );
      }
    }

    if (goal === 'knowledge-test') {
      if (step === 2) return renderYesNo('q2', 'Has the student received ground training covering all required knowledge areas of §61.105?');
    }

    if (goal === 'checkride') {
      if (step === 2) return renderYesNo('q2', 'Has the student passed the FAA Private Pilot knowledge test?');
      if (step === 3) return renderYesNo('q3', 'Has the student met all aeronautical experience requirements of §61.109?');
      if (step === 4) return renderYesNo('q4', 'Has the student received flight training within the past 60 calendar days in preparation for this practical test?');
      if (step === 5) return renderYesNo('q5', 'Is this a retest after a Notice of Disapproval?');
    }

    return renderResults();
  };

  const renderYesNo = (id: string, question: string) => (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-[#1a3a5c] text-center">{question}</h3>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleAnswer(id, 'yes')}
          className="px-12 py-4 bg-white border-2 border-[#dde3ec] rounded-2xl hover:border-[#1a3a5c] hover:bg-[#f4f5f7] font-bold text-[#1a3a5c] transition-all"
        >
          Yes
        </button>
        <button
          onClick={() => handleAnswer(id, 'no')}
          className="px-12 py-4 bg-white border-2 border-[#dde3ec] rounded-2xl hover:border-[#1a3a5c] hover:bg-[#f4f5f7] font-bold text-[#1a3a5c] transition-all"
        >
          No
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    const endorsements: string[] = [];
    const warnings: { type: 'red' | 'orange'; text: string }[] = [];

    if (goal === 'first-solo') {
      endorsements.push('A.6');
      if (answers.q2 === 'yes') endorsements.push('A.3');
      else warnings.push({ type: 'red', text: 'Student must pass the pre-solo knowledge test before solo flight is authorized per §61.87(b)' });
      
      if (answers.q3 === 'yes') endorsements.push('A.4');
      else warnings.push({ type: 'red', text: 'Student must receive and log the required pre-solo flight training per §61.87(c) before solo flight is authorized' });
      
      if (answers.q4 === 'yes') endorsements.push('A.5');
      
      if (answers.q5_sub === 'airspace') endorsements.push('A.12');
      if (answers.q5_sub === 'airport') endorsements.push('A.13');
    }

    if (goal === 'solo-nearby') {
      if (answers.q2 === 'no') warnings.push({ type: 'red', text: 'The 90-day solo endorsement A.6 or A.7 must be current before authorizing any solo flight. A.6 is for the first 90-day period §61.87(n) and A.7 is for each additional 90-day period §61.87(p)' });
      
      if (answers.q2 === 'yes' && answers.q3 === 'yes') endorsements.push('A.8');
      
      if (answers.q3 === 'no') warnings.push({ type: 'orange', text: 'Student must receive training for operations at the specific airport before this endorsement can be given per §61.93(b)(1)' });
    }

    if (goal === 'solo-xc') {
      if (answers.q2 === 'no') warnings.push({ type: 'red', text: 'The 90-day solo endorsement must be current before any solo cross-country flight. Give A.6 Solo flight first 90-day period §61.87(n) if first time or A.7 Solo flight each additional 90-day period §61.87(p) if renewing' });
      
      if (answers.q3 === 'no') endorsements.push('A.9');
      
      if (answers.q4 === 'yes') endorsements.push('A.10');
      
      if (answers.q5 === 'yes') endorsements.push('A.11');
      
      if (answers.q6_sub === 'airspace') endorsements.push('A.12');
      if (answers.q6_sub === 'airport') endorsements.push('A.13');
    }

    if (goal === 'knowledge-test') {
      if (answers.q2 === 'yes') endorsements.push('A.36');
      else warnings.push({ type: 'red', text: 'The student must complete ground training covering all areas of §61.105 before the knowledge test endorsement can be given' });
    }

    if (goal === 'checkride') {
      endorsements.push('A.1', 'A.37');
      if (answers.q2 === 'no') warnings.push({ type: 'red', text: 'Student must pass the FAA knowledge test before the practical test endorsement can be given' });
      if (answers.q3 === 'no') warnings.push({ type: 'orange', text: 'Student does not yet meet the aeronautical experience requirements of §61.109. Review the Checkride tab requirements' });
      if (answers.q4 === 'no') warnings.push({ type: 'red', text: 'The 60-day recency requirement is not met per §61.39(a)(6)(i). Flight training must be received within 60 calendar days preceding the month of application' });
      if (answers.q5 === 'yes') endorsements.push('A.2');
    }

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {endorsements.length > 0 && (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl overflow-hidden">
            <div className="bg-[#2d7a4f] px-6 py-3 text-white font-bold text-sm flex items-center gap-2">
              <CheckCircle size={18} />
              Required Endorsements
            </div>
            <div className="p-6 space-y-6">
              {endorsements.map(key => {
                const data = ENDORSEMENTS_DATA[key];
                const isSaved = savedEndorsements.includes(key);
                return (
                  <div key={key} className="bg-white p-4 rounded-xl border border-[#dde3ec] shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#1a3a5c] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{key}</span>
                        <span className="text-[10px] font-mono text-[#6b7280]">{data.ref}</span>
                      </div>
                      <button
                        onClick={() => !isSaved && handleMarkAsGiven(key)}
                        disabled={isSaved || saving === key}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                          isSaved 
                            ? "bg-[#e4f5ec] text-[#2d7a4f] cursor-default" 
                            : "bg-[#1a3a5c] text-white hover:bg-[#2a5a8c] shadow-sm"
                        )}
                      >
                        {saving === key ? <Loader2 size={12} className="animate-spin" /> : (isSaved ? <CheckCircle size={12} /> : <Plus size={12} />)}
                        {isSaved ? 'Endorsement Given' : 'Mark as Given'}
                      </button>
                    </div>
                    <p className="text-xs text-[#1c2333] leading-relaxed italic border-l-4 border-[#f4f5f7] pl-4 py-1">
                      "{data.text.replace('[First name, MI, Last name]', studentName || '[Student Name]')}"
                    </p>
                    {key === 'A.5' && (
                      <div className="mt-2 text-[10px] text-[#e8a020] font-bold flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Note: This endorsement expires 90 calendar days from date of training
                      </div>
                    )}
                    {(key === 'A.9' || key === 'A.10') && (
                      <div className="mt-2 text-[10px] text-[#6b7280] italic">
                        Note: {key === 'A.9' ? 'This is the one-time general authorization for solo cross-country flights.' : 'This endorsement is required for every individual solo cross-country flight. The instructor must review the student\'s specific flight planning each time.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-2xl overflow-hidden">
            <div className="bg-[#c0392b] px-6 py-3 text-white font-bold text-sm flex items-center gap-2">
              <AlertTriangle size={18} />
              Action Required
            </div>
            <div className="p-6 space-y-3">
              {warnings.map((w, idx) => (
                <div key={idx} className={cn(
                  "p-4 rounded-xl border flex items-start gap-3 text-xs font-medium",
                  w.type === 'red' ? "bg-red-50 border-red-100 text-red-700" : "bg-orange-50 border-orange-100 text-orange-700"
                )}>
                  <AlertTriangle size={16} className="shrink-0" />
                  {w.text}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-[#dde3ec] rounded-xl text-sm font-bold text-[#6b7280] hover:text-[#1a3a5c] hover:border-[#1a3a5c] transition-all"
          >
            <RefreshCw size={18} />
            Start Over
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-[#dde3ec] shadow-sm overflow-hidden">
      <div className="bg-[#1a3a5c] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Plane size={20} className="text-[#e8a020]" />
          </div>
          <div>
            <h3 className="text-white font-bold">Endorsement Advisor</h3>
            <p className="text-white/60 text-[10px] uppercase tracking-widest">Rule-Based Compliance Tool</p>
          </div>
        </div>
        {step > 1 && (
          <button
            onClick={reset}
            className="text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="p-8 min-h-[400px] flex flex-col justify-center">
        {renderQuestion()}
      </div>

      <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#dde3ec] flex items-center gap-3">
        <div className="w-5 h-5 bg-[#1a3a5c]/10 rounded flex items-center justify-center text-[#1a3a5c]">
          <Award size={12} />
        </div>
        <p className="text-[10px] text-[#64748b] leading-relaxed">
          This tool uses rule-based logic from <strong>AC 61-65K</strong>. Always verify requirements in the current FAR/AIM before signing.
        </p>
      </div>
    </div>
  );
}
