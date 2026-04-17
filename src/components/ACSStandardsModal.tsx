import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ALL_ACS, ALL_GROUND_ACS } from '../constants';
import { IR_GROUND_ACS } from '../constants/irACS';
import { ACSTask, ACSStandard } from '../types';

interface ACSStandardsModalProps {
  isOpen: boolean;
  taskId: string;
  taskName: string;
  onConfirm: (selectedStandards: ACSStandard[], notes: string) => void;
  onCancel: () => void;
}

const ACSStandardsModal: React.FC<ACSStandardsModalProps> = ({
  isOpen,
  taskId,
  taskName,
  onConfirm,
  onCancel,
}) => {
  const [selectedStds, setSelectedStds] = useState<ACSStandard[]>([]);
  const [notes, setNotes] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    K: true,
    R: true,
    S: true,
  });

  // Find the task data in all ACS ratings
  const taskData = useMemo(() => {
    // Search ALL_ACS first (flight tasks for all ratings)
    for (const ratingKey of Object.keys(ALL_ACS)) {
      const ratingTasks = ALL_ACS[ratingKey as keyof typeof ALL_ACS] || [];
      for (const area of ratingTasks) {
        const task = area.tasks.find((t) => t.code === taskId);
        if (task && task.stds && task.stds.length > 0) return task;
      }
    }
    // Search ALL_GROUND_ACS (ground tasks for PPL, IR, CPL)
    for (const ratingKey of Object.keys(ALL_GROUND_ACS)) {
      const ratingTasks = ALL_GROUND_ACS[ratingKey as keyof typeof ALL_GROUND_ACS] || [];
      for (const area of ratingTasks) {
        const task = area.tasks.find((t) => t.code === taskId);
        if (task && task.stds && task.stds.length > 0) return task;
      }
    }
    // Search IR_GROUND_ACS directly as a fallback
    for (const area of IR_GROUND_ACS) {
      const task = area.tasks.find((t) => t.code === taskId);
      if (task && task.stds && task.stds.length > 0) return task;
    }
    return null;
  }, [taskId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStds([]);
      setNotes('');
      setExpandedSections({ K: true, R: true, S: true });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleStandard = (std: ACSStandard) => {
    setSelectedStds((prev) =>
      prev.some(s => s.code === std.code) 
        ? prev.filter((s) => s.code !== std.code) 
        : [...prev, std]
    );
  };

  const toggleSection = (category: 'K' | 'R' | 'S') => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const knowledgeStds = taskData?.stds.filter((s) => s.category === 'K') || [];
  const riskStds = taskData?.stds.filter((s) => s.category === 'R') || [];
  const skillStds = taskData?.stds.filter((s) => s.category === 'S') || [];

  const renderSection = (
    title: string,
    category: 'K' | 'R' | 'S',
    stds: ACSStandard[],
    activeColor: string
  ) => {
    if (stds.length === 0) return null;

    const isExpanded = expandedSections[category];

    // Group standards by parent code
    const groupedStds: { parent: ACSStandard | null, children: ACSStandard[] }[] = [];
    const processedCodes = new Set<string>();

    stds.forEach(std => {
      if (processedCodes.has(std.code)) return;

      const isSub = /[a-z]$/.test(std.code);
      const parentCode = isSub ? std.code.slice(0, -1) : std.code;
      
      if (!processedCodes.has(parentCode)) {
        const parent = stds.find(s => s.code === parentCode) || null;
        const children = stds.filter(s => s.code.startsWith(parentCode) && /[a-z]$/.test(s.code));
        
        if (children.length > 0) {
          groupedStds.push({ parent, children });
          processedCodes.add(parentCode);
          children.forEach(c => processedCodes.add(c.code));
        } else if (!isSub) {
          groupedStds.push({ parent: std, children: [] });
          processedCodes.add(std.code);
        }
      }
    });

    const renderStandardRow = (std: ACSStandard, isChild: boolean) => {
      const isSelected = selectedStds.some(s => s.code === std.code);
      return (
        <button
          key={std.code}
          onClick={() => toggleStandard(std)}
          className={`w-full flex items-start gap-3 p-4 text-left transition-colors min-h-[48px] border-l-4 ${
            isSelected
              ? `${activeColor} border-current`
              : 'hover:bg-gray-50 border-transparent'
          } ${isChild ? 'pl-8' : ''}`}
        >
          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${
            isSelected ? 'bg-current border-current' : 'border-gray-300 bg-white'
          }`}>
            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
          <div className="flex flex-col gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit ${
              isSelected ? 'bg-white/50' : 'bg-gray-100 text-gray-500'
            }`}>
              {std.code}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">
              {std.description}
            </span>
          </div>
        </button>
      );
    };

    return (
      <div className="border-b border-gray-100 last:border-0">
        <button
          onClick={() => toggleSection(category)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-700">{title}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-2">
                {groupedStds.map(group => (
                  <div key={group.parent?.code || group.children[0].code}>
                    {group.children.length > 0 ? (
                      <>
                        {/* Parent Header */}
                        <div className="px-6 py-3 bg-gray-50/50 border-y border-gray-100">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-2">
                            {group.parent?.code || group.children[0].code.slice(0, -1)}
                          </span>
                          <span className="text-xs font-bold text-gray-600">
                            {group.parent?.description || "General Knowledge"}
                          </span>
                        </div>
                        {/* Children */}
                        {group.children.map(child => renderStandardRow(child, true))}
                      </>
                    ) : (
                      group.parent && renderStandardRow(group.parent, false)
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Panel */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h2 className="text-white font-bold text-lg leading-tight">
              {taskName}
            </h2>
            <span className="text-red-100 text-xs font-medium uppercase tracking-widest">
              {taskId}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {taskData ? (
            <div className="flex flex-col">
              {/* References & Objective */}
              <div className="p-6 bg-gray-50 space-y-4 border-b border-gray-200">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                    References
                  </h3>
                  <p className="text-sm text-gray-600 font-medium italic">
                    {taskData.references}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">
                    Objective
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {taskData.objective}
                  </p>
                </div>
              </div>

              {/* Standards Sections */}
              <div className="flex flex-col">
                {renderSection('Knowledge Standards', 'K', knowledgeStds, 'bg-blue-50 text-blue-600')}
                {renderSection('Risk Management Standards', 'R', riskStds, 'bg-orange-50 text-orange-600')}
                {renderSection('Skill Standards', 'S', skillStds, 'bg-green-50 text-green-600')}
              </div>

              {/* Additional Notes */}
              <div className="p-6 border-t border-gray-100">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
                  Additional Notes
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why this task was graded as 'N'..."
                  className="w-full h-32 p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">
                  ACS standards for this task are not yet available.
                </p>
                <p className="text-sm text-gray-400">
                  Please use the Additional Notes field below to document the deficiency.
                </p>
              </div>
              <div className="w-full mt-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes here..."
                  className="w-full h-32 p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 px-6 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedStds, notes)}
            disabled={selectedStds.length === 0 && taskData !== null}
            className={`flex-[2] py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg active:scale-[0.98] transition-all ${
              selectedStds.length > 0 || taskData === null
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                : 'bg-gray-300 cursor-not-allowed shadow-none'
            }`}
          >
            Confirm Deficiency
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ACSStandardsModal;
