import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Printer, Copy, CheckCircle2, AlertCircle, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface IacraTotals {
  totalTime: number;
  atdTime: number;
  dualReceived: number;
  soloTime: number;
  picTime: number;
  sicTime: number;
  cfiTime: number;
  xcTotal: number;
  xcDual: number;
  xcSolo: number;
  xcPic: number;
  instTotal: number;
  atdInst: number;
  nightTotal: number;
  nightDual: number;
  nightPic: number;
  nightTakeoffs: number;
  nightLandings: number;
  nightTakeoffsPic: number;
  nightLandingsPic: number;
  ftdTime: number;
  ffsTime: number;
  atdSE: number;
}

export default function IACRASummary() {
  const { studentName } = useParams<{ studentName: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!studentName) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_name', studentName)
        .eq('type', 'flight');
      
      if (!error && data) {
        setLessons(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [studentName]);

  const calculateTotals = (): IacraTotals => {
    const pplLessons = lessons.filter(l => l.meta?.rating_code === 'ppl');
    
    const totals: IacraTotals = {
      totalTime: 0, atdTime: 0, dualReceived: 0, soloTime: 0, picTime: 0, sicTime: 0, cfiTime: 0,
      xcTotal: 0, xcDual: 0, xcSolo: 0, xcPic: 0, instTotal: 0, atdInst: 0,
      nightTotal: 0, nightDual: 0, nightPic: 0, nightTakeoffs: 0, nightLandings: 0,
      nightTakeoffsPic: 0, nightLandingsPic: 0, ftdTime: 0, ffsTime: 0, atdSE: 0
    };

    pplLessons.forEach(l => {
      const m = l.meta || {};
      totals.totalTime += parseFloat(m.totalFlight || '0') || 0;
      totals.atdTime += parseFloat(m.atd || '0') || 0;
      totals.dualReceived += parseFloat(m.dual || '0') || 0;
      totals.soloTime += parseFloat(m.solo || '0') || 0;
      totals.picTime += parseFloat(m.pic || '0') || (parseFloat(m.solo || '0') > 0 ? parseFloat(m.totalFlight || '0') : 0);
      totals.sicTime += parseFloat(m.sic || '0') || 0;
      totals.cfiTime += parseFloat(m.cfi || '0') || 0;
      totals.xcTotal += parseFloat(m.xc || '0') || 0;
      totals.xcDual += parseFloat(m.xcDual || '0') || 0;
      totals.xcSolo += parseFloat(m.xcSolo || '0') || 0;
      totals.xcPic += parseFloat(m.xcPic || '0') || 0;
      totals.instTotal += (parseFloat(m.simInst || '0') || 0) + (parseFloat(m.imc || '0') || 0);
      totals.atdInst += parseFloat(m.atdInst || '0') || 0;
      totals.nightTotal += parseFloat(m.night || '0') || 0;
      totals.nightDual += parseFloat(m.nightDual || '0') || 0;
      totals.nightPic += parseFloat(m.nightPic || '0') || 0;
      totals.nightTakeoffs += parseInt(m.nightTakeoffs || '0') || 0;
      totals.nightLandings += parseInt(m.ldgNight || '0') || 0;
      totals.nightTakeoffsPic += parseInt(m.nightTakeoffsPic || '0') || 0;
      totals.nightLandingsPic += parseInt(m.nightLandingsPic || '0') || 0;
      totals.ftdTime += parseFloat(m.ftd || '0') || 0;
      totals.ffsTime += parseFloat(m.ffs || '0') || 0;
      totals.atdSE += parseFloat(m.atdSE || '0') || 0;
    });

    return totals;
  };

  const totals = calculateTotals();

  const requirements = [
    { label: 'Total Flight Time', have: totals.totalTime, need: 40, unit: 'hrs', ref: '§61.109(a)' },
    { label: 'Dual Instruction', have: totals.dualReceived, need: 20, unit: 'hrs', ref: '§61.109(a)(1)' },
    { label: 'Solo Flight Time', have: totals.soloTime, need: 10, unit: 'hrs', ref: '§61.109(a)(2)' },
    { label: 'Dual XC', have: totals.xcDual, need: 3, unit: 'hrs', ref: '§61.109(a)(1)(i)' },
    { label: 'Solo XC', have: totals.xcSolo, need: 5, unit: 'hrs', ref: '§61.109(a)(2)(i)' },
    { label: 'Night Dual', have: totals.nightDual, need: 3, unit: 'hrs', ref: '§61.109(a)(1)(ii)' },
    { label: 'Night Landings', have: totals.nightLandings, need: 10, unit: 'landings', ref: '§61.109(a)(1)(ii)' },
    { label: 'Instrument Training', have: totals.instTotal, need: 3, unit: 'hrs', ref: '§61.109(a)(1)(iii)' },
  ];

  const overallProgress = Math.min(100, Math.round((requirements.filter(r => r.have >= r.need).length / requirements.length) * 100));

  const handleCopy = () => {
    const text = `IACRA Summary for ${studentName}\n\n` +
      requirements.map(r => `${r.label}: ${r.have.toFixed(1)} / ${r.need} ${r.unit} (${r.have >= r.need ? 'MET' : 'REMAINING: ' + (r.need - r.have).toFixed(1)})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#1a3a5c]" size={40} />
        <p className="text-[#6b7280] font-medium">Calculating IACRA totals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 print:p-0 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl text-[#6b7280] transition-all border border-transparent hover:border-[#dde3ec]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#1a3a5c]">IACRA Summary</h1>
            <p className="text-sm text-[#6b7280]">{studentName} · Private Pilot ASEL</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dde3ec] rounded-xl text-xs font-bold text-[#1a3a5c] hover:bg-[#f8fafc] transition-all shadow-sm"
          >
            {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] rounded-xl text-xs font-bold text-white hover:bg-[#2a5a8c] transition-all shadow-md"
          >
            <Printer size={14} />
            Print Summary
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-1">
        <div className="md:col-span-1 bg-white rounded-3xl border border-[#dde3ec] p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-[#f1f5f9]"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * overallProgress) / 100}
                className="text-[#1a3a5c] transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#1a3a5c]">{overallProgress}%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">Complete</span>
            </div>
          </div>
          <h3 className="font-bold text-[#1a3a5c]">§61.109(a) Progress</h3>
          <p className="text-xs text-[#6b7280] mt-1">Aeronautical Experience Requirements</p>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl border border-[#dde3ec] p-6 shadow-sm">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-4">Requirement Checklist</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {requirements.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-[#f1f5f9] last:border-0">
                <div className="flex items-center gap-2">
                  {r.have >= r.need ? (
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={14} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <AlertCircle size={14} />
                    </div>
                  )}
                  <span className="text-xs font-medium text-[#1c2333]">{r.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#1a3a5c]">{r.have.toFixed(1)} / {r.need}</div>
                  {r.have < r.need && (
                    <div className="text-[9px] font-bold text-amber-600">{(r.need - r.have).toFixed(1)} remaining</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IACRA Grid */}
      <div className="bg-white rounded-3xl border border-[#dde3ec] shadow-lg overflow-hidden">
        <div className="bg-[#1a3a5c] p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={24} />
            <h2 className="text-xl font-black">Aeronautical Experience Grid</h2>
          </div>
          <p className="text-xs opacity-80">Values calculated from PPL flight lessons only. Verify against your logbook.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#dde3ec]">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] w-1/3">Category</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] text-center">Airplanes</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] text-center">ATD / Sim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde3ec]">
              {[
                { label: 'Total Time', airplane: totals.totalTime, atd: totals.atdTime, min: 40, ref: '§61.109(a)' },
                { label: 'Instruction Received', airplane: totals.dualReceived, atd: 0, min: 20, ref: '§61.109(a)(1)' },
                { label: 'Solo', airplane: totals.soloTime, atd: 0, min: 10, ref: '§61.109(a)(2)' },
                { label: 'Pilot in Command', airplane: totals.picTime, atd: 0 },
                { label: 'Second in Command', airplane: totals.sicTime, atd: 0 },
                { label: 'As Flight Instructor', airplane: totals.cfiTime, atd: 0 },
                { label: 'Cross Country (Total)', airplane: totals.xcTotal, atd: 0 },
                { label: 'Cross Country Instruction', airplane: totals.xcDual, atd: 0, min: 3, ref: '§61.109(a)(1)(i)' },
                { label: 'Cross Country Solo', airplane: totals.xcSolo, atd: 0, min: 5, ref: '§61.109(a)(2)(i)' },
                { label: 'Cross Country PIC', airplane: totals.xcPic, atd: 0 },
                { label: 'Instrument (Total)', airplane: totals.instTotal, atd: totals.atdInst, min: 3, ref: '§61.109(a)(1)(iii)' },
                { label: 'Night (Total)', airplane: totals.nightTotal, atd: 0 },
                { label: 'Night Instruction', airplane: totals.nightDual, atd: 0, min: 3, ref: '§61.109(a)(1)(ii)' },
                { label: 'Night PIC', airplane: totals.nightPic, atd: 0 },
                { label: 'Night Takeoffs', airplane: totals.nightTakeoffs, atd: 0 },
                { label: 'Night Landings', airplane: totals.nightLandings, atd: 0, min: 10, ref: '§61.109(a)(1)(ii)' },
                { label: 'Night Takeoffs PIC', airplane: totals.nightTakeoffsPic, atd: 0 },
                { label: 'Night Landings PIC', airplane: totals.nightLandingsPic, atd: 0 },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="p-4">
                    <div className="text-sm font-bold text-[#1c2333]">{row.label}</div>
                    {row.ref && <div className="text-[10px] text-[#6b7280] font-medium mt-0.5">{row.ref} min: {row.min}</div>}
                  </td>
                  <td className={cn(
                    "p-4 text-center font-mono text-sm font-bold",
                    row.min !== undefined ? (row.airplane >= row.min ? "text-green-600 bg-green-50/30" : "text-amber-600 bg-amber-50/30") : "text-[#1a3a5c]"
                  )}>
                    {row.airplane.toFixed(1)}
                  </td>
                  <td className="p-4 text-center font-mono text-sm text-[#6b7280]">
                    {row.atd.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">FTD Time</div>
          <div className="text-2xl font-black text-[#1a3a5c]">{totals.ftdTime.toFixed(1)}<span className="text-xs font-medium ml-1">hrs</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">FFS Time</div>
          <div className="text-2xl font-black text-[#1a3a5c]">{totals.ffsTime.toFixed(1)}<span className="text-xs font-medium ml-1">hrs</span></div>
        </div>
        <div className="bg-white rounded-2xl border border-[#dde3ec] p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">ATD SE</div>
          <div className="text-2xl font-black text-[#1a3a5c]">{totals.atdSE.toFixed(1)}<span className="text-xs font-medium ml-1">hrs</span></div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 print:bg-white print:border-gray-200">
        <AlertCircle className="text-amber-600 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-amber-900">Important Disclaimer</h4>
          <p className="text-xs text-amber-800 leading-relaxed mt-1">
            This summary is automatically generated based on digital lesson logs. It is intended for planning purposes only. 
            Before submitting your IACRA application, you <strong>MUST</strong> verify all totals against your official pilot logbook. 
            The CFI and Student are responsible for the accuracy of all aeronautical experience reported to the FAA.
          </p>
        </div>
      </div>
    </div>
  );
}
