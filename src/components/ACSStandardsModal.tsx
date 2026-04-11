import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ACSTask, ACSStandard } from '../types';
import { cn } from '../lib/utils';

interface ACSStandardsModalProps {
  task: ACSTask;
  onConfirm: (selectedStds: ACSStandard[], notes: string) => void;
  onCancel: () => void;
}

export const ACSStandardsModal: React.FC<ACSStandardsModalProps> = ({
  task,
  onConfirm,
  onCancel,
}) => {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    K: true,
    R: true,
    S: true,
  });

  const toggleStandard = (code: string) => {
    setSelectedCodes(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : [...prev, code]
    );
  };

  const toggleSection = (section: 'K' | 'R' | 'S') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleConfirm = () => {
    const selectedStds = task.stds.filter(s => selectedCodes.includes(s.code));
    onConfirm(selectedStds, notes);
  };

  const knowledgeStds = task.stds.filter(s => s.category === 'K');
  const riskStds = task.stds.filter(s => s.category === 'R');
  const skillStds = task.stds.filter(s => s.category === 'S');

  const Section = ({ 
    title, 
    category, 
    stds, 
    borderColor 
  }: { 
    title: string; 
    category: 'K' | 'R' | 'S'; 
    stds: ACSStandard[]; 
    borderColor: string;
  }) => {
    if (stds.length === 0) return null;
    const isExpanded = expandedSections[category];

    return (
      <div className="mb-4">
        <button 
          onClick={() => toggleSection(category)}
          className="w-full flex items-center justify-between p-3 bg-[#f4f5f7] rounded-lg border border-[#dde3ec] hover:bg-[#ebedf0] transition-colors"
        >
          <span className="text-sm font-bold text-[#1a3a5c]">{title}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {stds.map(std => {
              const isSelected = selectedCodes.includes(std.code);
              return (
                <div 
                  key={std.code}
                  onClick={() => toggleStandard(std.code)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected 
                      ? cn("bg-opacity-10 border-opacity-50", borderColor, category === 'K' ? "bg-blue-500 border-blue-500" : category === 'R' ? "bg-orange-500 border-orange-500" : "bg-green-500 border-green-500")
                      : "bg-white border-[#dde3ec] hover:bg-[#f9fafb]"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSelected 
                      ? "bg-red-500 border-red-500 text-white" 
                      : "bg-white border-[#dde3ec]"
                  )}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-[#6b7280] mb-0.5">{std.code}</div>
                    <div className="text-sm text-[#1a3a5c] leading-tight">{std.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[600px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-600 p-4 flex items-center justify-between shrink-0">
          <div className="text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">{task.code}</div>
            <div className="text-lg font-bold leading-tight">{task.name}</div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* References & Objective */}
          <div className="mb-6 space-y-4">
            <div>
              <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">References</div>
              <div className="text-sm text-[#1a3a5c] bg-[#f4f5f7] p-3 rounded-lg border border-[#dde3ec]">
                {task.references}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mb-1">Objective</div>
              <div className="text-sm text-[#1a3a5c] bg-[#f4f5f7] p-3 rounded-lg border border-[#dde3ec]">
                {task.objective}
              </div>
            </div>
          </div>

          {/* Standards Sections */}
          {task.stds.length > 0 ? (
            <>
              <Section title="Knowledge" category="K" stds={knowledgeStds} borderColor="border-l-4 border-l-blue-500" />
              <Section title="Risk Management" category="R" stds={riskStds} borderColor="border-l-4 border-l-orange-500" />
              <Section title="Skills" category="S" stds={skillStds} borderColor="border-l-4 border-l-green-500" />
            </>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm mb-6">
              ACS standards for this task will be added in a future update. Select N to record the failure and add notes manually.
            </div>
          )}

          {/* Additional Notes */}
          <div className="mt-6">
            <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider mb-1 block">Additional Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter details about the failure..."
              className="w-full h-24 p-3 bg-white border border-[#dde3ec] rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f4f5f7] border-t border-[#dde3ec] flex flex-col gap-3 shrink-0">
          {selectedCodes.length === 0 && task.stds.length > 0 && (
            <div className="text-center text-xs font-bold text-red-600 animate-pulse">
              Select at least one standard that the student failed.
            </div>
          )}
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 h-12 bg-white border border-[#dde3ec] rounded-xl text-sm font-bold text-[#1a3a5c] hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedCodes.length === 0 && task.stds.length > 0}
              className={cn(
                "flex-[2] h-12 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-red-500/20",
                selectedCodes.length === 0 && task.stds.length > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 active:scale-[0.98]"
              )}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
