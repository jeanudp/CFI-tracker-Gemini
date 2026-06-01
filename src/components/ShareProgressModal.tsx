import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check, Mail, MessageSquare, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ShareProgressModalProps {
  shareData: {
    url: string;
    studentName: string;
  } | null;
  onClose: () => void;
}

export default function ShareProgressModal({ shareData, onClose }: ShareProgressModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareData) return;
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleTextShare = () => {
    if (!shareData) return;
    const text = `Hey! Here is my flight training progress on 61 Tracker: ${shareData.url}`;
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  };

  const handleEmailShare = () => {
    if (!shareData) return;
    const subject = `${shareData.studentName}'s 61 Tracker Student Portal Link`;
    const body = `Hi,\n\nYou can view my flight training progress and cumulative hours on 61 Tracker here:\n\n${shareData.url}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <AnimatePresence>
      {shareData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl border border-[#dde3ec]"
          >
            {/* Header row */}
            <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1a3a5c]">Share Progress</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{shareData.studentName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
              {/* QR Code Container */}
              <div className="bg-[#f8fafc] p-6 rounded-3xl inline-block border-2 border-dashed border-gray-100 mb-6">
                <QRCodeSVG
                  value={shareData.url}
                  size={220}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="text-sm font-bold text-[#1a3a5c] mb-1">Student Scan QR Code</p>
              <p className="text-xs text-gray-500 mb-8 px-6">Your student can scan this to view their progress, cumulative hours, and lesson notes.</p>

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <span className="relative px-4 bg-white text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]">or</span>
              </div>

              {/* Read-only Link Field with Copy Button */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={shareData.url}
                  className="flex-1 min-w-0 bg-[#f8fafc] text-xs font-semibold text-[#1a3a5c] px-3.5 py-3 rounded-xl border border-[#dde3ec] outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 bg-[#1a3a5c] hover:bg-[#2a5a8c] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text and Email Sharing Buttons side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTextShare}
                  className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={16} className="text-amber-600" />
                  <span>Text</span>
                </button>
                <button
                  onClick={handleEmailShare}
                  className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail size={16} className="text-amber-600" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
