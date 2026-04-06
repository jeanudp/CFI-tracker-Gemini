import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Plane, ChevronRight, Sparkles, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_ACS } from '../constants';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

export default function LessonType() {
  const [studentName, setStudentName] = useState('');
  const [rating, setRating] = useState<any>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiType, setAiType] = useState<'ground' | 'flight'>('ground');
  const [context, setContext] = useState({
    lastLesson: '',
    struggles: '',
    hours: '',
    goals: ''
  });
  const [generating, setGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedStudent = localStorage.getItem('sb_selected_student') ||
      JSON.parse(localStorage.getItem('faa_student_info') || '{}').student || '';
    const savedRating = JSON.parse(localStorage.getItem('selected_rating') || '{}');

    if (!savedStudent) {
      navigate('/');
      return;
    }
    if (!savedRating.code) {
      navigate('/rating');
      return;
    }

    setStudentName(savedStudent);
    setRating(savedRating);
  }, [navigate]);

  const handleSelectType = (type: 'ground' | 'flight') => {
    if (type === 'ground') navigate('/ground');
    else navigate('/flight');
  };

  const openAIModal = (e: React.MouseEvent, type: 'ground' | 'flight') => {
    e.stopPropagation();
    setAiType(type);
    setIsAIModalOpen(true);
    setAiPlan(null);
  };

  const generateAIPlan = async () => {
    setGenerating(true);
    setAiPlan(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setAiPlan('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables in Netlify.');
        setGenerating(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      let ratingSpecifics = "";
      if (rating.code === 'ppl') ratingSpecifics = "Reference Private Pilot ASEL ACS tasks (FAA-S-ACS-6B). Focus on basic maneuvers, takeoffs, landings, and private pilot knowledge.";
      if (rating.code === 'ir') ratingSpecifics = "Reference Instrument Rating ACS tasks (FAA-S-ACS-8B). Focus on IFR procedures, instrument scans, approaches, and holding.";
      if (rating.code === 'cpl') ratingSpecifics = "Reference Commercial Pilot ACS tasks (FAA-S-ACS-7A). Focus on commercial maneuvers (Chandelles, Lazy Eights, Power-off 180), and higher precision.";
      if (rating.code === 'cfi') ratingSpecifics = "Reference Flight Instructor ACS tasks (FAA-S-ACS-25). Focus on teaching methods, Fundamentals of Instruction (FOI), and demonstrating maneuvers from the right seat.";
      if (rating.code === 'cfii') ratingSpecifics = "Reference Instrument Flight Instructor ACS tasks. Focus on instrument instruction techniques and teaching IFR procedures.";
      if (rating.code === 'mei') ratingSpecifics = "Reference Multiengine Instructor ACS tasks. Focus on multiengine procedures, Vmc demonstration theory, and engine-out instruction.";

      const prompt = `Generate a structured ${aiType} lesson plan for a flight student.
      Student: ${studentName}
      Rating: ${rating.label}
      Context:
      - Last lesson covered: ${context.lastLesson}
      - Student struggles: ${context.struggles}
      - Total hours: ${context.hours}
      - Specific goals: ${context.goals}
      
      ${ratingSpecifics}
      
      Provide a detailed plan including:
      1. Recommended ACS Tasks to focus on
      2. Suggested Exercises/Maneuvers
      3. Estimated Time for each section
      4. Ground discussion points (if applicable)
      
      Format as clear Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiPlan(response.text || "Failed to generate plan.");
    } catch (err) {
      console.error(err);
      setAiPlan("Error connecting to AI service. Please check your API key.");
    } finally {
      setGenerating(false);
    }
  };

  const acsData = rating ? (ALL_ACS as any)[rating.code] || [] : [];
  const groundTasks = acsData.length > 0 ? acsData[0].tasks.filter((t: string) => !t.includes('N/A') && !t.includes('ASEL') && !t.includes('Seaplane') && !t.includes('Water')) : [];
  const flightTasks = acsData.slice(1).reduce((acc: number, area: any) => acc + area.tasks.filter((t: string) => !t.includes('N/A') && !t.includes('ASEL') && !t.includes('Seaplane') && !t.includes('Water')).length, 0);
  const flightAreas = acsData.length > 1 ? acsData.length - 1 : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-8 flex-wrap justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#2d7a4f] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <span>Student</span>
        </div>
        <ChevronRight size={14} className="text-[#dde3ec]" />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#2d7a4f] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <span>Rating</span>
        </div>
        <ChevronRight size={14} className="text-[#dde3ec]" />
        <div className="flex items-center gap-1.5 text-[#1c2333] font-medium">
          <div className="w-5 h-5 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-[10px] font-bold">3</div>
          <span>Ground / Flight</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8 flex-wrap justify-center">
        <div className="bg-white border border-[#dde3ec] rounded-full px-4 py-1.5 text-sm flex items-center gap-2 shadow-sm">
          👤 Grading: <span className="font-bold text-[#1a3a5c]">{studentName}</span>
        </div>
        <div className="bg-white border border-[#dde3ec] rounded-full px-4 py-1.5 text-sm flex items-center gap-2 shadow-sm">
          🏆 Rating: <span className="font-bold text-[#1a3a5c]">{rating?.label}</span>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-[#1c2333] mb-2">What are you grading today?</h1>
        <p className="text-sm text-[#6b7280]">Choose the type of lesson for this session</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => handleSelectType('ground')}
          className="bg-white rounded-2xl border-2 border-[#dde3ec] shadow-lg p-8 text-center cursor-pointer hover:border-[#2d7a4f] hover:shadow-xl transition-all flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#e4f5ec] text-[#2d7a4f] flex items-center justify-center text-3xl">
            <BookOpen size={30} />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1c2333] mb-1">Ground</div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Preflight preparation, regulations, weather, systems, and oral knowledge tasks
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#6b7280] bg-[#f4f5f7] px-3 py-1 rounded-full uppercase tracking-wider">
            Area I · {groundTasks.length} tasks
          </div>
          <button
            onClick={(e) => openAIModal(e, 'ground')}
            className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#a855f7] hover:text-[#9333ea] transition-colors"
          >
            <Sparkles size={12} />
            Generate Lesson Plan with AI
          </button>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => handleSelectType('flight')}
          className="bg-white rounded-2xl border-2 border-[#dde3ec] shadow-lg p-8 text-center cursor-pointer hover:border-[#2a5a8c] hover:shadow-xl transition-all flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#d4e8f5] text-[#2a5a8c] flex items-center justify-center text-3xl">
            <Plane size={30} />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1c2333] mb-1">Flight</div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Preflight procedures, maneuvers, navigation, emergencies, and all airborne tasks
            </p>
          </div>
          <div className="text-[10px] font-mono text-[#6b7280] bg-[#f4f5f7] px-3 py-1 rounded-full uppercase tracking-wider">
            Areas II–{acsData.length > 0 ? (acsData.length === 2 ? 'II' : String.fromCharCode(73 + flightAreas - 1)) : 'XII'} · {flightTasks} tasks
          </div>
          <button
            onClick={(e) => openAIModal(e, 'flight')}
            className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#a855f7] hover:text-[#9333ea] transition-colors"
          >
            <Sparkles size={12} />
            Generate Lesson Plan with AI
          </button>
        </motion.div>
      </div>

      <Link to="/rating" className="text-sm text-[#6b7280] hover:text-[#1c2333] transition-colors flex items-center gap-1.5">
        ← Back to Rating Selection
      </Link>

      {/* AI Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1a3a5c]/40 backdrop-blur-sm" onClick={() => setIsAIModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-[#dde3ec] flex items-center justify-between bg-[#f4f5f7]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f5e4f5] rounded-lg text-[#a855f7]"><Sparkles size={20} /></div>
                <h3 className="text-lg font-bold text-[#1a3a5c]">AI {aiType === 'ground' ? 'Ground' : 'Flight'} Lesson Plan</h3>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="p-2 hover:bg-[#dde3ec] rounded-xl text-[#6b7280] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {!aiPlan ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2">Last Lesson Coverage</label>
                      <textarea
                        value={context.lastLesson}
                        onChange={(e) => setContext({ ...context, lastLesson: e.target.value })}
                        placeholder="What was covered in the last session?"
                        className="w-full text-sm border border-[#dde3ec] rounded-xl px-4 py-3 bg-[#f4f5f7] focus:outline-none focus:border-[#4a8ab8] focus:bg-white h-24 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2">Student Struggles</label>
                      <textarea
                        value={context.struggles}
                        onChange={(e) => setContext({ ...context, struggles: e.target.value })}
                        placeholder="What did the student struggle with?"
                        className="w-full text-sm border border-[#dde3ec] rounded-xl px-4 py-3 bg-[#f4f5f7] focus:outline-none focus:border-[#4a8ab8] focus:bg-white h-24 resize-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2">Total Hours</label>
                      <input
                        type="text"
                        value={context.hours}
                        onChange={(e) => setContext({ ...context, hours: e.target.value })}
                        placeholder="e.g. 15.5 hours"
                        className="w-full text-sm border border-[#dde3ec] rounded-xl px-4 py-3 bg-[#f4f5f7] focus:outline-none focus:border-[#4a8ab8] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2">Specific Goals</label>
                      <input
                        type="text"
                        value={context.goals}
                        onChange={(e) => setContext({ ...context, goals: e.target.value })}
                        placeholder="e.g. Solo prep, cross-country"
                        className="w-full text-sm border border-[#dde3ec] rounded-xl px-4 py-3 bg-[#f4f5f7] focus:outline-none focus:border-[#4a8ab8] focus:bg-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={generateAIPlan}
                    disabled={generating}
                    className="w-full bg-[#1a3a5c] text-white font-bold py-4 rounded-xl hover:bg-[#2a5a8c] transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
                  >
                    {generating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {generating ? 'Generating Plan...' : 'Generate Lesson Plan'}
                  </button>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none prose-slate prose-headings:text-[#1a3a5c] prose-strong:text-[#1a3a5c] prose-p:text-[#6b7280]">
                  <ReactMarkdown>{aiPlan}</ReactMarkdown>
                </div>
              )}
            </div>

            {aiPlan && (
              <div className="p-6 border-t border-[#dde3ec] bg-[#f4f5f7] flex justify-end gap-3">
                <button
                  onClick={() => setAiPlan(null)}
                  className="px-6 py-2.5 bg-white border border-[#dde3ec] rounded-xl text-sm font-bold text-[#1a3a5c] hover:bg-[#dde3ec] transition-all shadow-sm"
                >
                  Edit Context
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-bold hover:bg-[#2a5a8c] transition-all shadow-md"
                >
                  Print Plan
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
