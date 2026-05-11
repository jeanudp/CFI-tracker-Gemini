import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, AlertTriangle, X } from 'lucide-react';

interface HowToExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToExportModal: React.FC<HowToExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
      caption: "Note the filename — it includes the date"
    },
    {
      step: 4,
      label: "Go to myflightbook.com → Logbook → Import",
      caption: "Sign in or create a free account first"
    },
    {
      step: 5,
      label: "Click Proceed to Upload",
      caption: "This starts the import wizard"
    },
    {
      step: 6,
      label: "Click Upload a CSV File and select your file",
      caption: "Find the file you saved in Step 2"
    },
    {
      step: 7,
      label: "Review for errors and click Next",
      caption: "Note any errors — fix in 61 Tracker or add manually later"
    },
    {
      step: 8,
      label: "Click Import",
      caption: "Your flights are now in MyFlightbook"
    },
    {
      step: 9,
      label: "Return to 61 Tracker and confirm the upload",
      caption: "Click Yes, confirm upload only after MyFlightbook shows the import was successful. Confirming early marks flights as synced."
    },
    {
      step: 10,
      label: "Report any errors you cannot fix",
      caption: "If you see errors you cannot resolve yourself, please report them to 61 Tracker support so we can improve the export."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ backgroundColor: '#ffffff', color: '#111827' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-xl font-bold text-[#1a3a5c]">Exporting to MyFlightbook</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide" style={{ backgroundColor: '#ffffff' }}>
            {/* Section 1 */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">
                Which export should I use?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <Download size={18} />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">Export Unsynced</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Only flights not yet uploaded. Use this for regular syncing.
                  </p>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <Download size={18} />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">Export Full Logbook</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Every flight regardless of sync status. Use for a fresh start or full backup.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1a3a5c]">
                How to import into MyFlightbook
              </h3>
              <div className="space-y-6">
                {steps.map((s) => (
                  <div key={s.step} className="relative p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-[#1a3a5c]/20">
                      {s.step}
                    </div>
                    <div className="pl-2">
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{s.label}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {s.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Alert */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 items-start">
              <AlertTriangle className="text-amber-500 shrink-0" size={18} />
              <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                If you see errors you cannot fix yourself, report them to 61 Tracker support.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50" style={{ backgroundColor: '#f9fafb' }}>
            <button
              onClick={onClose}
              className="w-full bg-[#1a3a5c] hover:bg-[#2a5a8c] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#1a3a5c]/10 active:scale-[0.98]"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HowToExportModal;
