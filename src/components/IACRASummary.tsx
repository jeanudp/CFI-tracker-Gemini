import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson } from '../types';
import { ArrowLeft, Printer, Copy, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface IacraTotals {
  totalTime: number;
  atdTime: number;
  dualReceived: number;
  soloTime: number;
  picTime: number;
  xcDual: number;
  xcSolo: number;
  xcPic: number;
  instTotal: number;
  atdInst: number;
  ftdInst: number;
  ffsInst: number;
  nightDual: number;
  nightTotal: number;
  nightTakeoffs: number;
  nightLandings: number;
  nightPic: number;
  ftdTime: number;
  ffsTime: number;
  atdSE: number;
  numFlights: number;
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
    const totals: IacraTotals = {
      totalTime: 0, atdTime: 0, dualReceived: 0, soloTime: 0, picTime: 0,
      xcDual: 0, xcSolo: 0, xcPic: 0, instTotal: 0, atdInst: 0,
      ftdInst: 0, ffsInst: 0,
      nightDual: 0, nightTotal: 0, nightTakeoffs: 0, nightLandings: 0,
      nightPic: 0, ftdTime: 0, ffsTime: 0, atdSE: 0,
      numFlights: 0
    };

    lessons.forEach(l => {
      const m = l.meta || {};
      totals.totalTime += parseFloat(m.totalFlight || '0') || 0;
      totals.atdTime += parseFloat(m.atd || '0') || 0;
      totals.dualReceived += parseFloat(m.dual || '0') || 0;
      totals.soloTime += parseFloat(m.solo || '0') || 0;
      totals.picTime += parseFloat(m.pic || '0') || 0;
      totals.xcDual += parseFloat(m.xcDual || '0') || 0;
      totals.xcSolo += parseFloat(m.xcSolo || '0') || 0;
      totals.xcPic += parseFloat(m.xcPic || '0') || 0;
      totals.instTotal += (parseFloat(m.simInst || '0') || 0) + (parseFloat(m.imc || '0') || 0);
      totals.atdInst += parseFloat(m.atdInst || '0') || 0;
      totals.ftdInst += parseFloat(m.ftdInst || '0') || 0;
      totals.ffsInst += parseFloat(m.ffsInst || '0') || 0;
      totals.nightDual += parseFloat(m.nightDual || '0') || 0;
      totals.nightTotal += parseFloat(m.night || '0') || 0;
      totals.nightTakeoffs += parseInt(m.nightTakeoffs || '0') || 0;
      totals.nightLandings += parseInt(m.ldgNight || '0') || 0;
      totals.nightPic += parseFloat(m.nightPic || '0') || 0;
      totals.ftdTime += parseFloat(m.ftd || '0') || 0;
      totals.ffsTime += parseFloat(m.ffs || '0') || 0;
      totals.atdSE += parseFloat(m.atdSE || '0') || 0;
      totals.numFlights += 1;
    });

    return totals;
  };

  const totals = calculateTotals();

  const checkMet = (val: number, min: number) => {
    if (val >= min) return <Check size={12} className="text-green-600 inline ml-1" />;
    return <X size={12} className="text-red-600 inline ml-1" />;
  };

  const handleCopy = () => {
    const ratingCode = lessons[0]?.meta?.rating_code || 'ppl';
    const text = `Aeronautical Experience Grid - ${studentName}\n\n` +
      `Total: ${totals.totalTime.toFixed(1)}\n` +
      `Instruction Received: ${totals.dualReceived.toFixed(1)}\n` +
      `Solo: ${totals.soloTime.toFixed(1)}\n` +
      `PIC: ${totals.picTime.toFixed(1)}\n` +
      `XC Instruction: ${totals.xcDual.toFixed(1)}\n` +
      `XC Solo: ${totals.xcSolo.toFixed(1)}\n` +
      `XC PIC: ${totals.xcPic.toFixed(1)}\n` +
      `Instrument: ${totals.instTotal.toFixed(1)}\n` +
      `Night Instruction: ${totals.nightDual.toFixed(1)}\n` +
      `Night T/O & Ldg: ${(totals.nightTakeoffs + totals.nightLandings)}\n` +
      `Night PIC: ${totals.nightPic.toFixed(1)}\n` +
      `Night T/O & Ldg PIC: ${(totals.nightTakeoffs + totals.nightLandings)}\n` +
      `ATD Total: ${totals.atdTime.toFixed(1)}`;
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
        <Loader2 className="animate-spin text-[#1a3a8c]" size={40} />
        <p className="text-[#6b7280] font-medium">Loading IACRA Experience Grid...</p>
      </div>
    );
  }

  const Cell = ({ children, className, type = 'white' }: { children?: React.ReactNode, className?: string, type?: 'white' | 'dark' | 'medium' | 'light' | 'gray' }) => {
    const bgClass = {
      white: 'bg-white',
      dark: 'bg-[#003366]',
      medium: 'bg-[#6699CC]',
      light: 'bg-[#99CCFF]',
      gray: 'bg-[#CCCCCC]'
    }[type];

    return (
      <td className={cn("border border-black p-1 text-[12px] min-h-[24px]", bgClass, className)}>
        {children}
      </td>
    );
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 font-sans text-black">
      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#6b7280] hover:text-[#1a3a8c] transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-[#dde3ec] rounded-lg text-sm font-bold text-[#1a3a8c] hover:bg-[#f8fafc] transition-all"
          >
            {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy Values'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a3a8c] rounded-lg text-sm font-bold text-white hover:bg-[#2a5a8c] transition-all shadow-md"
          >
            <Printer size={16} />
            Print Grid
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto print:max-w-none">
        <div className="text-center mb-4">
          <p className="text-red-600 text-[11px] font-bold mb-1">* At least one field is required</p>
          <h1 className="text-[#1a3a8c] text-xl font-bold uppercase tracking-tight">Aeronautical Experience Grid</h1>
        </div>

        <div className="overflow-x-auto border-collapse">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-white">
                <th className="border border-black p-2 w-[180px]"></th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase">Airplanes</th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase">Rotorcraft</th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase leading-tight">Powered<br/>Lift</th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase">Gliders</th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase leading-tight">Lighter<br/>than Air</th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase">FTD</th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase leading-tight">FFS<br/>(Simulator)</th>
                <th className="border border-black p-2 text-[#1a3a8c] text-[11px] font-bold uppercase">ATD</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Total */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Total</td>
                <Cell className="text-right font-mono">{totals.totalTime.toFixed(1)}{checkMet(totals.totalTime, 40)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell className="text-right font-mono">{totals.ftdTime.toFixed(1)}</Cell>
                <Cell className="text-right font-mono">{totals.ffsTime.toFixed(1)}</Cell>
                <Cell className="text-right font-mono">{totals.atdTime.toFixed(1)}</Cell>
              </tr>
              {/* Row 2: Instruction Received */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Instruction Received</td>
                <Cell className="text-right font-mono">{totals.dualReceived.toFixed(1)}{checkMet(totals.dualReceived, 20)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell className="text-right font-mono">{totals.atdTime.toFixed(1)}</Cell>
              </tr>
              {/* Row 3: Solo */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Solo</td>
                <Cell className="text-right font-mono">{totals.soloTime.toFixed(1)}{checkMet(totals.soloTime, 10)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 4: PIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">PIC</td>
                <Cell className="text-right font-mono">{totals.picTime.toFixed(1)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="light" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 5: XC Instruction */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Cross Country Instruction Received</td>
                <Cell className="text-right font-mono">{totals.xcDual.toFixed(1)}{checkMet(totals.xcDual, 3)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 6: XC Solo */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Cross Country Solo</td>
                <Cell className="text-right font-mono">{totals.xcSolo.toFixed(1)}{checkMet(totals.xcSolo, 5)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 7: XC PIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Cross Country PIC</td>
                <Cell className="text-right font-mono">{totals.xcPic.toFixed(1)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="light" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 8: Instrument */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Instrument</td>
                <Cell className="text-right font-mono">{totals.instTotal.toFixed(1)}{checkMet(totals.instTotal, 3)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell className="text-right font-mono">{totals.ftdInst.toFixed(1)}</Cell>
                <Cell className="text-right font-mono">{totals.ffsInst.toFixed(1)}</Cell>
                <Cell className="text-right font-mono">{totals.atdInst.toFixed(1)}</Cell>
              </tr>
              {/* Row 9: Night Instruction */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Night Instruction Received</td>
                <Cell className="text-right font-mono">{totals.nightDual.toFixed(1)}{checkMet(totals.nightDual, 3)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 10: Night T/O / Ldg */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Night Take-off / Landing</td>
                <Cell className="text-right font-mono">{(totals.nightTakeoffs + totals.nightLandings)}{checkMet(totals.nightTakeoffs + totals.nightLandings, 10)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 11: Night PIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Night PIC</td>
                <Cell className="text-right font-mono">{totals.nightPic.toFixed(1)}</Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="light" />
                <Cell type="light" />
                <Cell type="light" />
                <Cell type="gray" />
              </tr>
              {/* Row 12: Night T/O / Ldg PIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Night Take-off / Landing PIC</td>
                <Cell className="text-right font-mono">
                  {(totals.nightTakeoffs + totals.nightLandings)}
                </Cell>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="white" />
                <Cell type="white" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 13: Number of Flights */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Number of Flights</td>
                <Cell type="dark" className="text-right text-white font-mono">{totals.numFlights}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="gray" />
                <Cell type="medium" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 14: Number of Aero-Tows */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Number of Aero-Tows</td>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="white" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 15: Number of Ground Launches */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Number of Ground Launches</td>
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="white" />
                <Cell type="white" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
              {/* Row 16: Number of Powered Launches */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]">Number of Powered Launches</td>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="gray" />
                <Cell type="medium" />
                <Cell type="gray" />
                <Cell type="gray" />
                <Cell type="gray" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Class Hours Section */}
        <div className="mt-8 border border-black p-4">
          <h2 className="text-[#1a3a8c] text-center font-bold text-sm mb-4 uppercase">Class Hours</h2>
          <div className="grid grid-cols-4 border-t border-l border-black">
            {/* Row 1 */}
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - SEL PIC: <span className="font-mono font-bold">{totals.picTime.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - SES PIC:</div>
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - MEL PIC:</div>
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - MES PIC:</div>
            {/* Row 2 */}
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            {/* Row 3 */}
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - SEL Instruct Rcvd: <span className="font-mono font-bold">{totals.dualReceived.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - SES Instruct Rcvd:</div>
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - MEL Instruct Rcvd:</div>
            <div className="border-b border-r border-black p-1 text-[11px]">Airplane - MES Instruct Rcvd:</div>
            {/* Row 4 */}
            <div className="border-b border-r border-black p-1 text-[11px]">Rotorcraft - HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px]">Rotorcraft - GYRO:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            {/* Row 5 */}
            <div className="border-b border-r border-black p-1 text-[11px]">LTA - Balloon:</div>
            <div className="border-b border-r border-black p-1 text-[11px]">LTA - Airship:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            {/* Row 6 */}
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">FFS ME:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">FTD ME:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">ATD ME:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            {/* Row 7 */}
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">FFS SE:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">FTD SE:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">ATD SE: <span className="font-mono font-bold">{totals.atdSE.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
            {/* Row 8 */}
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">FFS HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">FTD HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#99CCFF]">ATD HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px] bg-[#CCCCCC]"></div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 border border-black p-4 text-[11px] leading-relaxed italic">
          Class hours entered will go to the appropriate Record of Pilot Time on the 8710-1. Failure to enter the appropriate hours, if required, will render the applicant not eligible for the certificate/rating sought and will result in a Correction Notice from the Airmen Certification Branch.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { padding: 0; margin: 0; }
          .print\\:hidden { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid black !important; }
          .max-w-6xl { max-width: none !important; }
          @page { margin: 1cm; }
        }
      `}} />
    </div>
  );
}
