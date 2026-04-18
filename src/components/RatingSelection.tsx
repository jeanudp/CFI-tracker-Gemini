import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { RATINGS } from '../constants';
import { ChevronRight, Plane, Cloud, Navigation, ClipboardList, Compass, Gauge } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RatingSelection() {
  const [studentName, setStudentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('sb_selected_student') ||
      JSON.parse(localStorage.getItem('faa_student_info') || '{}').student || '';
    if (!saved) {
      navigate('/dashboard');
      return;
    }
    setStudentName(saved);
  }, [navigate]);

  const handleSelectRating = (code: string) => {
    const rating = (RATINGS as any)[code];
    if (!rating || !rating.groundPage) return; // coming soon

    localStorage.setItem('selected_rating', JSON.stringify({ code, ...rating }));
    navigate('/lesson-type');
  };

  const ratingIcons: Record<string, React.ReactNode> = {
    ppl: <Plane size={24} />,
    ir: <Cloud size={24} />,
    cpl: <Gauge size={24} />,
    cfi: <ClipboardList size={24} />,
    cfii: <Compass size={24} />,
    mei: <Navigation size={24} />,
  };

  const ratingColors: Record<string, string> = {
    ppl: 'bg-[#d4e8f5] text-[#1a3a5c] border-[#4a8ab8]',
    ir: 'bg-[#ede8f8] text-[#5b3fa0] border-[#5b3fa0]',
    cpl: 'bg-[#e4f5ec] text-[#2d7a4f] border-[#2d7a4f]',
    cfi: 'bg-[#fdf0e4] text-[#c05c10] border-[#c05c10]',
    cfii: 'bg-[#e0f5f2] text-[#1a7a6e] border-[#1a7a6e]',
    mei: 'bg-[#fdecea] text-[#c0392b] border-[#c0392b]',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-8 flex-wrap justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#2d7a4f] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <span>Student</span>
        </div>
        <ChevronRight size={14} className="text-[#dde3ec]" />
        <div className="flex items-center gap-1.5 text-[#1c2333] font-medium">
          <div className="w-5 h-5 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-[10px] font-bold">2</div>
          <span>Rating</span>
        </div>
        <ChevronRight size={14} className="text-[#dde3ec]" />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#f4f5f7] text-[#6b7280] flex items-center justify-center text-[10px] font-bold">3</div>
          <span>Ground / Flight</span>
        </div>
      </div>

      <div className="bg-white border border-[#dde3ec] rounded-full px-4 py-1.5 text-sm mb-8 flex items-center gap-2 shadow-sm">
        👤 Grading: <span className="font-bold text-[#1a3a5c]">{studentName}</span>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-[#1c2333] mb-2">Select a Rating</h1>
        <p className="text-sm text-[#6b7280]">Choose the certificate or rating you are working toward</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {Object.entries(RATINGS).map(([code, rating]) => {
          const isComingSoon = !rating.groundPage;
          return (
            <motion.div
              key={code}
              whileHover={!isComingSoon ? { y: -3 } : {}}
              onClick={() => !isComingSoon && handleSelectRating(code)}
              className={cn(
                "bg-white rounded-2xl border-2 p-6 text-center transition-all relative flex flex-col items-center gap-3",
                isComingSoon ? "opacity-50 cursor-default" : "cursor-pointer border-[#dde3ec] hover:shadow-xl",
                !isComingSoon && code === 'ppl' && "hover:border-[#2a5a8c]",
                !isComingSoon && code === 'ir' && "hover:border-[#5b3fa0]",
                !isComingSoon && code === 'cpl' && "hover:border-[#2d7a4f]"
              )}
            >
              {isComingSoon && (
                <div className="absolute top-2 right-2 bg-[#fdf0d4] text-[#e8a020] text-[8px] font-bold px-2 py-0.5 rounded-full border border-[#f0c96a] uppercase tracking-wider">
                  Soon
                </div>
              )}
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                (ratingColors as any)[code]
              )}>
                {ratingIcons[code]}
              </div>
              <div>
                <div className="text-sm font-bold text-[#1c2333] leading-tight">{rating.label}</div>
                <div className="text-[10px] text-[#6b7280] mt-1">{rating.acs}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Link to="/dashboard" className="text-sm text-[#6b7280] hover:text-[#1c2333] transition-colors flex items-center gap-1.5">
        ← Back to Students
      </Link>
    </div>
  );
}
