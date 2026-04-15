import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PRE_SOLO_TEST_QUESTIONS, PRE_SOLO_TEST_CONFIG } from '../constants/preSoloTest';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Printer, CheckCircle2, XCircle, AlertCircle, Save, Loader2, Info, Check, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

type Mode = 'test' | 'results' | 'print';

export default function PreSoloTest() {
  const [mode, setMode] = useState<Mode>('test');
  const [studentName, setStudentName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reviewed, setReviewed] = useState<Record<number, boolean>>({});
  const [cfiNotes, setCfiNotes] = useState('');
  const [cfiName, setCfiName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const selected = localStorage.getItem('sb_selected_student');
    if (selected) setStudentName(selected);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === PRE_SOLO_TEST_QUESTIONS.length;

  const calculateScore = () => {
    let correct = 0;
    PRE_SOLO_TEST_QUESTIONS.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  const score = calculateScore();
  const percentage = Math.round((score / PRE_SOLO_TEST_QUESTIONS.length) * 100);
  const passed = percentage >= PRE_SOLO_TEST_CONFIG.passingScore;

  const handleSignOff = async () => {
    if (!cfiName.trim()) {
      alert('Please enter your name for the sign off.');
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const incorrectIds = PRE_SOLO_TEST_QUESTIONS
        .filter(q => answers[q.id] !== q.correct)
        .map(q => q.id);

      const { error } = await supabase
        .from('student_tests')
        .insert({
          user_id: session.user.id,
          student_name: studentName,
          test_type: 'pre_solo',
          date: date,
          score: percentage,
          passing_score: 80,
          passed: percentage >= 80,
          total_questions: PRE_SOLO_TEST_QUESTIONS.length,
          correct_answers: score,
          incorrect_question_ids: incorrectIds,
          cfi_review_notes: cfiNotes,
          cfi_signed_off: true,
          cfi_signoff_date: new Date().toISOString().split('T')[0],
          cfi_name: cfiName
        });

      if (error) throw error;

      alert('Test result signed off successfully!');
      navigate('/history');
    } catch (err: any) {
      console.error('Error signing off test:', err);
      alert('Failed to sign off test: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    setMode('print');
    setTimeout(() => {
      window.print();
      setMode('results');
    }, 100);
  };

  if (mode === 'print') {
    return (
      <div className="p-10 bg-white min-h-screen font-serif">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold uppercase mb-2">{PRE_SOLO_TEST_CONFIG.title}</h1>
          <p className="text-sm italic">{PRE_SOLO_TEST_CONFIG.regulation}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 border-b pb-6">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Student Name</label>
            <div className="border-b border-black h-8 flex items-end pb-1">{studentName}</div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Date</label>
            <div className="border-b border-black h-8 flex items-end pb-1">{date}</div>
          </div>
        </div>

        <div className="space-y-8">
          {PRE_SOLO_TEST_CONFIG.sections.map(section => (
            <div key={section} className="space-y-4">
              <h2 className="text-lg font-bold border-b-2 border-black pb-1">{section}</h2>
              {PRE_SOLO_TEST_QUESTIONS.filter(q => q.section === section).map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium">{idx + 1}. {q.question}</p>
                  <div className="grid grid-cols-1 gap-1 ml-4">
                    {Object.entries(q.options).map(([key, text]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-black rounded-full" />
                        <span className="text-sm">{key}. {text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-6 border-b border-dashed border-gray-300 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-2 gap-20">
          <div className="space-y-1">
            <div className="border-b border-black h-10" />
            <p className="text-xs font-bold uppercase">Student Signature</p>
          </div>
          <div className="space-y-1">
            <div className="border-b border-black h-10" />
            <p className="text-xs font-bold uppercase">Instructor Signature / Date</p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            nav, .no-print, button, .sidebar-nav { display: none !important; }
            body { background: white !important; }
            .print-only { display: block !important; }
            .max-w-5xl, .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f8] pb-20 no-print">
      {/* Header */}
      <div className="bg-[#1a3a5c] text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/history')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold leading-tight">Pre-Solo Knowledge Test</h1>
              <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">14 CFR §61.87(b)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mode === 'results' && (
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all"
              >
                <Printer size={18} />
                Print Test
              </button>
            )}
            {mode === 'test' && (
              <div className="flex flex-col items-end">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">Progress</div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4ade80] transition-all duration-500" 
                      style={{ width: `${(answeredCount / PRE_SOLO_TEST_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-bold">{answeredCount}/{PRE_SOLO_TEST_QUESTIONS.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Student Info Bar */}
        <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm p-6 mb-8 flex flex-wrap gap-8">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">Student Name</label>
            <input 
              type="text" 
              value={studentName} 
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-[#1a3a5c]/20 outline-none transition-all"
              placeholder="Enter student name..."
            />
          </div>
          <div className="w-48">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1.5">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-[#1a3a5c]/20 outline-none transition-all"
            />
          </div>
        </div>

        {mode === 'results' && (
          <div className={cn(
            "rounded-2xl border p-8 mb-8 text-center",
            passed ? "bg-[#f0fdf4] border-[#bcf0da] text-[#166534]" : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
          )}>
            <div className="flex flex-col items-center gap-2">
              <div className="text-4xl font-black mb-1">{score} / {PRE_SOLO_TEST_QUESTIONS.length}</div>
              <div className="text-xl font-bold uppercase tracking-widest">{percentage}% — {passed ? 'PASSED' : 'FAILED'}</div>
              <p className="text-sm opacity-80 mt-2">
                {passed 
                  ? 'Minimum passing score of 80% achieved. CFI must review all incorrect answers with the student.' 
                  : 'Minimum passing score of 80% not achieved. Student must retake the test after further study.'}
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-12">
          {PRE_SOLO_TEST_CONFIG.sections.map((section, sIdx) => (
            <div key={section} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-xs font-bold">
                  {sIdx + 1}
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#1a3a5c]">{section}</h2>
              </div>

              <div className="space-y-4">
                {PRE_SOLO_TEST_QUESTIONS.filter(q => q.section === section).map((q, qIdx) => {
                  const studentAnswer = answers[q.id];
                  const isCorrect = studentAnswer === q.correct;
                  
                  return (
                    <div key={q.id} className={cn(
                      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
                      mode === 'results' && !isCorrect ? "border-red-200" : "border-[#dde3ec]",
                      mode === 'results' && isCorrect ? "border-green-200" : "border-[#dde3ec]"
                    )}>
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <p className="text-sm font-bold text-[#1e293b] leading-relaxed">
                            {qIdx + 1}. {q.question}
                          </p>
                          {mode === 'results' && (
                            isCorrect ? (
                              <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                            ) : (
                              <XCircle size={20} className="text-red-500 shrink-0" />
                            )
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {Object.entries(q.options).map(([key, text]) => (
                            <label 
                              key={key}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                                mode === 'test' && studentAnswer === key ? "bg-[#f1f5f9] border-[#1a3a5c] ring-1 ring-[#1a3a5c]" : "bg-[#f8fafc] border-[#dde3ec] hover:border-[#cbd5e1]",
                                mode === 'results' && key === q.correct ? "bg-green-50 border-green-200 ring-1 ring-green-200" : "",
                                mode === 'results' && studentAnswer === key && !isCorrect ? "bg-red-50 border-red-200 ring-1 ring-red-200" : ""
                              )}
                            >
                              <input 
                                type="radio" 
                                name={`q-${q.id}`} 
                                value={key}
                                checked={studentAnswer === key}
                                onChange={() => mode === 'test' && setAnswers(prev => ({ ...prev, [q.id]: key }))}
                                disabled={mode !== 'test'}
                                className="hidden"
                              />
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                studentAnswer === key ? "border-[#1a3a5c] bg-[#1a3a5c]" : "border-[#cbd5e1] bg-white"
                              )}>
                                {studentAnswer === key && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <span className="text-xs font-medium text-[#334155]">{key}. {text}</span>
                            </label>
                          ))}
                        </div>

                        {mode === 'results' && (
                          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                              <Info size={12} />
                              Reference: {q.reference}
                            </div>
                            {!isCorrect && (
                              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                Correct Answer: {q.correct}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {mode === 'test' && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setMode('results')}
              disabled={!isComplete}
              className={cn(
                "px-10 py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center gap-3",
                isComplete ? "bg-[#1a3a5c] hover:bg-[#2a5a8c] hover:-translate-y-1 active:translate-y-0" : "bg-[#cbd5e1] cursor-not-allowed"
              )}
            >
              <CheckCircle2 size={20} />
              Submit Test
            </button>
          </div>
        )}

        {mode === 'results' && (
          <div className="mt-12 space-y-8">
            <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
              <div className="bg-[#f8fafc] px-6 py-4 border-b border-[#dde3ec] flex items-center gap-2">
                <AlertCircle size={18} className="text-[#1a3a5c]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a3a5c]">CFI Review and Sign Off</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-xs text-[#64748b] font-medium">
                    The instructor must review all incorrect answers with the student and ensure they have the required aeronautical knowledge before solo flight.
                  </p>
                  
                  <div className="space-y-3">
                    {PRE_SOLO_TEST_QUESTIONS.filter(q => answers[q.id] !== q.correct).map(q => (
                      <label key={q.id} className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl border border-[#dde3ec] cursor-pointer hover:bg-[#f1f5f9] transition-colors">
                        <input 
                          type="checkbox" 
                          checked={reviewed[q.id] || false}
                          onChange={(e) => setReviewed(prev => ({ ...prev, [q.id]: e.target.checked }))}
                          className="rounded border-[#cbd5e1] text-[#1a3a5c] focus:ring-[#1a3a5c]" 
                        />
                        <span className="text-xs font-medium text-[#334155]">
                          Question {q.id}: Reviewed and discussed with student
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Instructor Notes</label>
                    <textarea 
                      value={cfiNotes}
                      onChange={(e) => setCfiNotes(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-xl px-4 py-3 text-sm font-medium text-[#1e293b] focus:ring-2 focus:ring-[#1a3a5c]/20 outline-none transition-all min-h-[100px]"
                      placeholder="Enter review notes..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Instructor Name (Sign Off)</label>
                    <input 
                      type="text"
                      value={cfiName}
                      onChange={(e) => setCfiName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-xl px-4 py-3 text-sm font-bold text-[#1e293b] focus:ring-2 focus:ring-[#1a3a5c]/20 outline-none transition-all"
                      placeholder="Enter your full name..."
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleSignOff}
                    disabled={saving}
                    className="px-10 py-4 bg-[#1a3a5c] text-white rounded-2xl font-bold shadow-xl hover:bg-[#2a5a8c] transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    Sign Off and Save Result
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
