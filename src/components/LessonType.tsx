import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plane, ChevronRight, ShieldCheck, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_ACS } from '../constants';

export default function LessonType() {
  const [studentName, setStudentName] = useState('');
  const [rating, setRating] = useState<any>(null);
  const [reviewExpanded, setReviewExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedStudent = localStorage.getItem('sb_selected_student') ||
      JSON.parse(localStorage.getItem('faa_student_info') || '{}').student || '';
    const savedRating = JSON.parse(localStorage.getItem('selected_rating') || '{}');

    console.log('studentName:', savedStudent);
    console.log('rating:', savedRating);

    if (!savedStudent) {
      navigate('/dashboard');
      return;
    }
    if (!savedRating.code) {
      navigate('/dashboard');
      return;
    }

    setStudentName(savedStudent);
    setRating(savedRating);
  }, [navigate]);

  const handleSelectType = (type: 'ground' | 'flight') => {
    if (type === 'ground') navigate('/ground');
    else if (type === 'flight') navigate('/flight');
  };

  const acsData = rating ? (ALL_ACS as any)[rating.code] || [] : [];
  const groundTasks = acsData.length > 0 ? acsData[0].tasks.filter((t: any) => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water')) : [];
  const flightTasks = acsData.slice(1).reduce((acc: number, area: any) => acc + area.tasks.filter((t: any) => !t.name.includes('N/A') && !t.name.includes('ASEL') && !t.name.includes('Seaplane') && !t.name.includes('Water')).length, 0);
  const flightAreas = acsData.length > 1 ? acsData.length - 1 : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 sm:py-12 flex flex-col items-center">
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
          className="bg-white rounded-2xl border-2 border-[#dde3ec] shadow-lg p-5 sm:p-8 text-center cursor-pointer hover:border-[#2d7a4f] hover:shadow-xl transition-all flex flex-col items-center gap-4"
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
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => handleSelectType('flight')}
          className="bg-white rounded-2xl border-2 border-[#dde3ec] shadow-lg p-5 sm:p-8 text-center cursor-pointer hover:border-[#2a5a8c] hover:shadow-xl transition-all flex flex-col items-center gap-4"
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
        </motion.div>
      </div>

      {/* Flight Review (BFR / IPC) Collapsible Options */}
      <div className="w-full max-w-2xl mb-10">
        <button
          type="button"
          onClick={() => setReviewExpanded(!reviewExpanded)}
          className="w-full p-3 bg-white border border-[#dde3ec] hover:border-[#e8a020]/40 hover:bg-[#fff9eb]/20 rounded-xl flex items-center justify-between cursor-pointer transition-all gap-3 text-left focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#fef3d4] text-[#e8a020] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1c2333]">Flight Review</h3>
              <p className="text-[10px] text-[#6b7280] font-medium leading-normal">§61.56 BFR / §61.57 IPC</p>
            </div>
          </div>
          {reviewExpanded ? (
            <ChevronUp size={14} className="text-[#94a3b8]" />
          ) : (
            <ChevronDown size={14} className="text-[#94a3b8]" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {reviewExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 mt-3">
                <button
                  type="button"
                  onClick={() => navigate('/flight-review')}
                  className="w-full p-4 bg-white border border-[#dde3ec] hover:border-[#e8a020] hover:bg-[#fffdf9] rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[#fef3d4] text-[#e8a020] flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1c2333]">BFR</h4>
                    <p className="text-[10px] text-[#6b7280] font-medium leading-normal">§61.56 Flight Review</p>
                    <p className="text-[9px] text-[#94a3b8] mt-1 font-normal">Any certificated pilot</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/ipc')}
                  className="w-full p-4 bg-white border border-[#dde3ec] hover:border-[#0ea5e9] hover:bg-[#fbfaff] rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f3effd] text-[#0ea5e9] flex items-center justify-center shrink-0">
                    <Compass size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1c2333]">IPC</h4>
                    <p className="text-[10px] text-[#6b7280] font-medium leading-normal">§61.57 Instrument Check</p>
                    <p className="text-[9px] text-[#94a3b8] mt-1 font-normal">Instrument-rated pilots</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link to="/dashboard" className="text-sm text-[#6b7280] hover:text-[#1c2333] transition-colors flex items-center gap-1.5">
        ← Back to Home
      </Link>
    </div>
  );
}
