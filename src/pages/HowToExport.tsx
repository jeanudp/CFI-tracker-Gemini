import React from 'react';
import { Download, AlertTriangle } from 'lucide-react';

const HowToExport: React.FC = () => {
  const steps = [
    {
      step: 1,
      label: "Click Export Unsynced or Export Full Logbook",
      caption: "Choose based on what you need to sync"
    },
    {
      step: 2,
      label: "Click Save As and choose a dedicated folder",
      caption: "Keep all your logbook exports in one place"
    },
    {
      step: 3,
      label: "Save the CSV file",
      caption: "Note the filename — it includes today's date"
    },
    {
      step: 4,
      label: "Go to myflightbook.com — hover Logbook then click Import",
      caption: "Sign in or create a free account first if needed"
    },
    {
      step: 5,
      label: "Click Proceed to Upload",
      caption: "This starts the MyFlightbook import wizard"
    },
    {
      step: 6,
      label: "Click Upload a CSV File and select your saved file",
      caption: "Find the file you saved in Step 2"
    },
    {
      step: 7,
      label: "Review for errors and click Next",
      caption: "Note any errors — fix in 61 Tracker or add those flights manually later. Report any errors you cannot fix to 61 Tracker support."
    },
    {
      step: 8,
      label: "Click Import",
      caption: "Your flights are now in MyFlightbook. Return to 61 Tracker and click Yes Confirm Upload."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black text-[#1a3a5c]">61</span>
              <div className="h-1 bg-amber-400 w-full rounded-full" />
            </div>
            <span className="text-2xl font-black text-[#1a3a5c] tracking-tighter">TRACKER</span>
          </div>
          <div className="bg-amber-100/50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Export Guide
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[640px] mx-auto px-4 py-12 space-y-12 bg-white">
        {/* Section 1: Page Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#1a3a5c] tracking-tight">How to Export to MyFlightbook</h1>
          <p className="text-gray-500 text-base">Follow these steps to sync your flights. Keep this tab open while you work.</p>
        </div>

        {/* Section 2: Which export should I use? */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Which export should I use?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c]">
                <Download size={20} />
              </div>
              <h3 className="font-bold text-[#1a3a5c]">Export Unsynced</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Only new flights not yet uploaded. Use this every time you sync.
              </p>
            </div>
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-600">
                <Download size={20} />
              </div>
              <h3 className="font-bold text-[#1a3a5c]">Export Full Logbook</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every flight regardless of sync history. Use for a fresh start or full backup.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Step-by-Step Guide */}
        <div className="space-y-8">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">Step by step — MyFlightbook import</h2>
          <div className="space-y-10">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-[#1a3a5c]/20">
                    {s.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#1a3a5c] text-lg leading-tight">{s.label}</h3>
                    <p className="text-sm text-gray-500 leading-snug">{s.caption}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-2">
                  <img 
                    src={`/images/howto/step${s.step}.png`}
                    alt={`Step ${s.step}`}
                    className="w-full max-h-[220px] object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amber Info Box */}
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-start">
          <AlertTriangle className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-amber-900 font-medium leading-relaxed">
            If you encounter errors you cannot resolve yourself, please report them to 61 Tracker support so we can improve the export.
          </p>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">61 Tracker — Aviation Logistics</p>
        </footer>
      </main>
    </div>
  );
};

export default HowToExport;
