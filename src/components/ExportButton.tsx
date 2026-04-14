import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Table } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ExportButtonProps {
  onExportCSV: () => void;
  className?: string;
  buttonText?: string;
}

export default function ExportButton({ onExportCSV, className, buttonText = "Export" }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-flex shadow-sm rounded-lg", className)} ref={dropdownRef}>
      {/* Left Side: Main Button */}
      <button
        onClick={onExportCSV}
        className="flex items-center gap-2 bg-[#1a3a5c] text-white px-4 py-2 hover:bg-[#2a5a8c] transition-all text-sm font-bold uppercase tracking-wider rounded-l-lg border-r border-white/10"
      >
        <Download size={16} />
        {buttonText}
      </button>

      {/* Right Side: Chevron */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center bg-[#1a3a5c] text-white px-2 hover:bg-[#2a5a8c] transition-all rounded-r-lg"
      >
        <ChevronDown size={16} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#dde3ec] rounded-xl shadow-xl z-[100] overflow-hidden"
          >
            <div className="py-1">
              {/* CSV Option */}
              <button
                onClick={() => {
                  onExportCSV();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors text-left group min-h-[44px]"
              >
                <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#1a3a5c] group-hover:bg-[#1a3a5c] group-hover:text-white transition-colors">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a3a5c]">Export as CSV</div>
                  <div className="text-[10px] text-[#64748b]">MyFlightBook Compatible</div>
                </div>
              </button>

              {/* Excel Option (Disabled) */}
              <div className="w-full flex items-center justify-between px-4 py-3 opacity-50 cursor-not-allowed border-t border-[#f1f5f9] min-h-[44px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                    <Table size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#64748b]">Export as Excel</div>
                  </div>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest bg-[#f1f5f9] px-1.5 py-0.5 rounded text-[#94a3b8]">Coming Soon</span>
              </div>

              {/* PDF Option (Disabled) */}
              <div className="w-full flex items-center justify-between px-4 py-3 opacity-50 cursor-not-allowed border-t border-[#f1f5f9] min-h-[44px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#64748b]">Export as PDF</div>
                  </div>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest bg-[#f1f5f9] px-1.5 py-0.5 rounded text-[#94a3b8]">Coming Soon</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
