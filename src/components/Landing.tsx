import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, BookOpen, Award, Plane } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f0f4f8' }}>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-16 h-16 bg-[#1a3a5c] rounded-2xl flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="36" height="36">
              <ellipse cx="50" cy="50" rx="5" ry="38" />
              <path d="M 50 45 Q 20 40 5 55 Q 20 52 50 52" />
              <path d="M 50 45 Q 80 40 95 55 Q 80 52 50 52" />
              <path d="M 50 82 Q 35 80 28 86 Q 35 84 50 84" />
              <path d="M 50 82 Q 65 80 72 86 Q 65 84 50 84" />
              <path d="M 47 14 Q 50 10 53 14" />
              <ellipse cx="50" cy="18" rx="4" ry="5" />
              <line x1="50" y1="12" x2="50" y2="8" />
              <path d="M 44 10 Q 50 8 56 10" />
              <rect x="47" y="30" width="6" height="5" rx="1" />
              <rect x="47" y="37" width="6" height="4" rx="1" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-[#1a3a5c] tracking-tight">61 Tracker</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Built for CFIs</p>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xl mb-10"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-[#1a2333] leading-tight mb-4">
            From first lesson<br />
            <span className="text-[#1a3a5c]">to checkride.</span>
          </h2>
          <p className="text-lg text-[#4b5563] leading-relaxed">
            The complete lesson tracker for Part 61 flight instructors. Track ACS grades, manage endorsements, and know exactly when your student is checkride ready.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-[#1a3a5c] text-white font-bold rounded-2xl text-sm hover:bg-[#2a5a8c] transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl flex items-center gap-2 justify-center cursor-pointer"
          >
            <Plane size={18} />
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="px-8 py-4 bg-white text-[#1a3a5c] font-bold rounded-2xl text-sm border-2 border-[#1a3a5c]/20 hover:border-[#1a3a5c] transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2 justify-center cursor-pointer"
          >
            Create Account
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full"
        >
          {[
            {
              icon: <BookOpen size={24} className="text-[#1a3a5c]" />,
              title: "Track Every Lesson",
              description: "Log ground and flight lessons with full ACS task grading. Ground and flight. Every rating."
            },
            {
              icon: <Award size={24} className="text-[#e8a020]" />,
              title: "Manage Endorsements",
              description: "AC 61-65K endorsements built in. Know exactly which endorsements your student needs and when you gave them."
            },
            {
              icon: <CheckCircle2 size={24} className="text-[#2d7a4f]" />,
              title: "Checkride Ready",
              description: "Real time §61.109 hour tracking. The app tells you the moment your student meets every requirement."
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="bg-white rounded-2xl border border-[#dde3ec] p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f0f4f8] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-[#1a2333] mb-2">{feature.title}</h3>
              <p className="text-xs text-[#6b7280] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-[#dde3ec]" style={{ backgroundColor: '#f0f4f8' }}>
        <p className="text-xs text-[#9ca3af]">
          61 Tracker · Built for flight instructors · FAR Part 61
        </p>
      </footer>
    </div>
  );
}
