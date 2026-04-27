import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  const navigate = useNavigate();
  const darkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header - Matching Landing Page Style */}
      <header
        className="sticky top-0 z-20 px-6 h-20 border-b flex items-center justify-between backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 2px 12px rgba(26,58,92,0.08)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--navy)' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Logo Numerals */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className="block font-black leading-none tracking-tighter select-none"
              style={{
                fontSize: '32px',
                color: 'var(--navy)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-1px',
              }}
            >
              61
            </span>
            <div
              className="absolute rounded-full"
              style={{
                bottom: '-2px',
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: '#e8a020',
              }}
            />
          </div>
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline" style={{ color: 'var(--navy)', opacity: 0.8 }}>
            Tracker
          </span>
        </div>

        <div className="w-16" />
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-6 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <p>
              I didn't start out wanting to build software. I started out wanting to teach people how to fly. But as my student roster grew, I found myself spending more time wrestling with messy spreadsheets and double-checking paper logbooks than I did actually instructing. I was constantly worried about missing a specific ACS task or miscounting the hours required for a 61.129 commercial cross-country. 
            </p>

            <p>
              The breaking point came when I spent three hours one night just trying to figure out if a student was truly ready for their checkride, or if we were going to get sent home by the DPE for a missing endorsement. I looked for a tool that focused specifically on Part 61 requirements—something that understood exactly how we track grades and endorsements—and I couldn't find anything that wasn't either bloated or outdated. So, I decided to build it myself.
            </p>

            <p>
              I’m still an active FAA certificated flight instructor. I’m out on the ramp every day, just like you, dealing with maintenance delays and unforecasted crosswinds. I built 61 Tracker because I wanted my own students to be perfectly prepared for their practical tests and I wanted to make sure my own records were bulletproof for the FAA's eyes. I care about this because our signatures as CFIs matter, and our students deserve a clear path to their ratings.
            </p>

            <p>
              Today, 61 Tracker is a dedicated platform for CFIs to manage their business without the clutter. While the app currently focuses on ASEL and AMEL fixed-wing training, expansion to other aircraft classes is on the roadmap. It’s moving toward being an even more comprehensive digital assistant—one that not only tracks where your students are, but helps you predict when they'll be ready for the ride. It’s a tool built for the reality of flight training.
            </p>
          </div>

          <div className="pt-12 border-t mt-12" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20">
                <Mail size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Questions or feedback?
                </p>
                <a 
                  href="mailto:61trckr@gmail.com" 
                  className="text-amber-600 font-bold hover:underline"
                >
                  61trckr@gmail.com
                </a>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                Built by a CFI, for CFIs
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
