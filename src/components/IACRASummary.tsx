import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lesson } from '../types';
import { ArrowLeft, Printer, Download, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface IacraTotals {
  totalTime: number;
  atdTime: number;
  dualReceived: number;
  dualReceivedASEL: number;
  dualReceivedAMEL: number;
  soloTime: number;
  picTime: number;
  picTimeASEL: number;
  picTimeAMEL: number;
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
  ratpXC: number;
  iacraXC: number;
}

export default function IACRASummary() {
  const { studentName } = useParams<{ studentName: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [manualHours, setManualHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!studentName) return;
      setLoading(true);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_name', studentName)
        .eq('type', 'flight');
      
      if (!lessonsError && lessonsData) {
        setLessons(lessonsData);
      }

      const { data: manualData, error: manualError } = await supabase
        .from('manual_hours')
        .select('*')
        .eq('student_name', studentName);
      
      if (!manualError && manualData) {
        setManualHours(manualData);
      }

      setLoading(false);
    }
    fetchData();
  }, [studentName]);

  const calculateTotals = (): IacraTotals => {
    const totals: IacraTotals = {
      totalTime: 0, atdTime: 0, dualReceived: 0, dualReceivedASEL: 0, dualReceivedAMEL: 0,
      soloTime: 0, picTime: 0, picTimeASEL: 0, picTimeAMEL: 0,
      xcDual: 0, xcSolo: 0, xcPic: 0, instTotal: 0, atdInst: 0,
      ftdInst: 0, ffsInst: 0,
      nightDual: 0, nightTotal: 0, nightTakeoffs: 0, nightLandings: 0,
      nightPic: 0, ftdTime: 0, ffsTime: 0, atdSE: 0,
      numFlights: 0, ratpXC: 0, iacraXC: 0
    };

    lessons.forEach(l => {
      const m = l.meta || {};
      const regXC = (parseFloat(m.xcDual || '0') || 0) + (parseFloat(m.xcSolo || '0') || 0) + (parseFloat(m.xcPic || '0') || 0);
      const rXCTime = parseFloat(m.ratpXCTime || '0') || 0;
      const isAMEL = m.aircraftClass === 'AMEL';

      totals.totalTime += parseFloat(m.totalFlight || '0') || 0;
      totals.atdTime += parseFloat(m.atd || '0') || 0;
      totals.dualReceived += parseFloat(m.dual || '0') || 0;
      if (isAMEL) totals.dualReceivedAMEL += parseFloat(m.dual || '0') || 0;
      else totals.dualReceivedASEL += parseFloat(m.dual || '0') || 0;

      totals.soloTime += parseFloat(m.solo || '0') || 0;
      totals.picTime += parseFloat(m.pic || '0') || 0;
      if (isAMEL) totals.picTimeAMEL += parseFloat(m.pic || '0') || 0;
      else totals.picTimeASEL += parseFloat(m.pic || '0') || 0;

      totals.xcDual += parseFloat(m.xcDual || '0') || 0;
      totals.xcSolo += parseFloat(m.xcSolo || '0') || 0;
      totals.xcPic += parseFloat(m.xcPic || '0') || 0;
      totals.ratpXC += rXCTime;
      totals.iacraXC += Math.max(regXC, rXCTime);
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

    const getPriorValue = (key: string) => {
      const m = manualHours.find(h => h.field_key === `prior_${key}`);
      return m ? m.total : 0;
    };

    totals.totalTime += getPriorValue('totalFlight');
    totals.dualReceived += getPriorValue('dual');
    // For prior values, we assume ASEL unless specified, but here we'll just add to ASEL for simplicity
    // or we could add a way to specify class in prior hours. For now, let's just add to ASEL.
    totals.dualReceivedASEL += getPriorValue('dual');
    totals.soloTime += getPriorValue('solo');
    totals.picTime += getPriorValue('pic');
    totals.picTimeASEL += getPriorValue('pic');
    totals.xcDual += getPriorValue('xcDual');
    totals.xcSolo += getPriorValue('xcSolo');
    totals.xcPic += getPriorValue('xcPic');
    totals.ratpXC += getPriorValue('ratpXC');
    totals.iacraXC += Math.max(getPriorValue('xcDual') + getPriorValue('xcSolo') + getPriorValue('xcPic'), getPriorValue('ratpXC'));
    totals.instTotal += getPriorValue('simInst') + getPriorValue('atdInst');
    totals.atdInst += getPriorValue('atdInst');
    totals.nightDual += getPriorValue('nightDual');
    totals.nightTotal += getPriorValue('night');
    totals.nightTakeoffs += getPriorValue('nightTakeoffs');
    totals.nightLandings += getPriorValue('ldgNight');
    totals.nightPic += getPriorValue('nightPic');
    totals.ftdTime += getPriorValue('ftd');
    totals.ffsTime += getPriorValue('ffs');
    totals.atdTime += getPriorValue('atd');
    totals.atdSE += getPriorValue('atdSE');

    return totals;
  };

  const totals = calculateTotals();

  const checkMet = (val: number, min: number) => {
    if (val >= min) return <Check size={10} className="text-green-600 inline ml-1" />;
    return <X size={10} className="text-red-600 inline ml-1" />;
  };

  const exportToMyFlightBook = () => {
    const toHHMM = (decimal: string | number): string => {
      const val = parseFloat(String(decimal)) || 0;
      const hours = Math.floor(val);
      const minutes = Math.round((val - hours) * 60);
      return `${hours}:${String(minutes).padStart(2, '0')}`;
    };

    const downloadCSV = (rows: string[][], filename: string) => {
      const csvContent = rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    const headers = [
      "Date", "Flight ID", "Model", "ICAO Model", "Tail Number", "Display Tail", "Aircraft ID", "Category/Class", "Approaches", "Hold", "Landings", "FS Night Landings", "FS Day Landings", "X-Country", "Night", "IMC", "Simulated Instrument", "Ground Simulator", "Dual Received", "CFI", "SIC", "PIC", "Total Flight Time", "CFI Time (HH:MM)", "SIC Time (HH:MM)", "PIC (HH:MM)", "Total Flight Time (HH:MM)", "Route", "Flight Properties", "Comments", "Hobbs Start", "Hobbs End", "Engine Start", "Engine End", "Engine Time", "Flight Start", "Flight End", "Flying Time", "Complex", "Controllable pitch prop", "Flaps", "Retract", "Tailwheel", "High Performance", "Turbine", "TAA", "Signature State", "Date of Signature", "CFI Comment", "CFI Certificate", "CFI Name", "CFI Email", "CFI Expiration", "Public", "Approach Name(s)", "Approaches - ILS", "Approaches - Localizer", "Approaches - RNAV/GPS (LNAV)", "Approaches - RNAV/GPS (LPV)", "Checkride - Certified Flight Instructor", "Checkride - ATP", "Checkride - Commercial", "Checkride - Instrument", "Checkride - New Category/Class/Type", "Pilot Flying Time", "Pilot Monitoring Time", "Simulator/Training Device Identifier", "Solo Time", "Takeoffs (any)"
    ];

    const rows = [headers];
    lessons.forEach(l => {
      const m = l.meta || {};
      const xc = parseFloat(m.xcDual || '0') + parseFloat(m.xcSolo || '0') + parseFloat(m.xcPic || '0');
      const row = new Array(headers.length).fill('');
      row[0] = m.date || '';
      row[2] = m.aircraftModel || '';
      row[4] = m.aircraft || '';
      row[5] = m.aircraft || '';
      row[7] = 'ASEL';
      row[8] = m.approachCount || '';
      row[9] = m.holdPerformed ? 'Yes' : '';
      row[10] = m.ldgTotal || '';
      row[11] = m.ldgNight || '';
      row[12] = m.ldgDay || '';
      row[13] = xc > 0 ? xc.toFixed(1) : '';
      row[14] = m.night || '';
      row[15] = m.imc || '';
      row[16] = m.simInst || '';
      row[17] = m.atd || '';
      row[18] = m.dual || '';
      row[19] = m.dual || '';
      row[21] = m.pic || '';
      row[22] = m.totalFlight || '';
      row[23] = toHHMM(m.dual);
      row[25] = toHHMM(m.pic);
      row[26] = toHHMM(m.totalFlight);
      row[27] = m.route || '';
      row[29] = `${l.label}${m.notes ? ': ' + m.notes : ''}`;
      row[67] = m.solo || '';
      row[68] = m.ldgTotal || '';
      rows.push(row);
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `MyFlightBook-${studentName?.replace(/\s+/g, '-')}-${dateStr}.csv`;
    downloadCSV(rows, filename);
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

  const Cell = ({ children, className, type = 'white', picSic = false }: { children?: React.ReactNode, className?: string, type?: 'white' | 'dark' | 'disabled', picSic?: boolean }) => {
    const style = {
      white: { backgroundColor: '#ffffff' },
      dark: { backgroundColor: '#1a3a5c' },
      disabled: { backgroundColor: '#e8edf2' }
    }[type];

    return (
      <td 
        className={cn("border border-black p-1 text-[12px] min-h-[24px] relative", className)}
        style={style}
      >
        {picSic && (
          <div className="absolute left-0.5 top-0.5 text-[8px] font-bold opacity-40 pointer-events-none" style={{ color: type === 'dark' ? 'white' : 'black' }}>
            PIC<br/>SIC
          </div>
        )}
        <div className="text-right" style={{ color: type === 'dark' ? 'white' : 'black' }}>
          {children}
        </div>
      </td>
    );
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 font-sans text-black" data-theme="light" style={{ backgroundColor: 'white', color: 'black' }}>
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
            onClick={exportToMyFlightBook}
            className="flex items-center gap-2 px-4 py-2 border border-[#dde3ec] rounded-lg text-sm font-bold text-[#1a3a8c] hover:bg-[#f8fafc] transition-all"
          >
            <Download size={16} />
            Export to MyFlightBook
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
              <tr className="bg-white" style={{ backgroundColor: 'white' }}>
                <th className="border border-black p-2 w-[180px]" style={{ backgroundColor: '#1a3a5c', color: 'white' }}></th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>Airplanes</th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>Rotorcraft</th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center leading-tight" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>Powered<br/>Lift</th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>Gliders</th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center leading-tight" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>Lighter<br/>than Air</th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>FTD</th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center leading-tight" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>FFS<br/>(Simulator)</th>
                <th className="border border-black p-2 text-black text-[11px] font-bold uppercase text-center" style={{ backgroundColor: '#1a3a5c', color: 'white' }}>ATD</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Total */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Total</td>
                <Cell className="font-mono">{totals.totalTime.toFixed(1)}{checkMet(totals.totalTime, 40)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell className="font-mono">{totals.ftdTime.toFixed(1)}</Cell>
                <Cell className="font-mono">{totals.ffsTime.toFixed(1)}</Cell>
                <Cell className="font-mono">{totals.atdTime.toFixed(1)}</Cell>
              </tr>
              {/* Row 2: Instruction Received */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Instruction Received</td>
                <Cell className="font-mono">{totals.dualReceived.toFixed(1)}{checkMet(totals.dualReceived, 20)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell className="font-mono">{totals.atdInst.toFixed(1)}</Cell>
              </tr>
              {/* Row 3: Solo */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Solo</td>
                <Cell className="font-mono">{totals.soloTime.toFixed(1)}{checkMet(totals.soloTime, 10)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 4: PIC and SIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>PIC and SIC</td>
                <Cell className="font-mono" picSic>
                  {totals.picTime.toFixed(1)}<br/>
                  &nbsp;
                </Cell>
                <Cell type="dark" picSic />
                <Cell type="dark" picSic />
                <Cell type="dark" picSic />
                <Cell type="dark" picSic />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 5: XC Instruction Received */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Cross Country Instruction Received</td>
                <Cell className="font-mono">{totals.xcDual.toFixed(1)}{checkMet(totals.xcDual, 3)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 6: XC Solo */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Cross Country Solo</td>
                <Cell className="font-mono">{totals.xcSolo.toFixed(1)}{checkMet(totals.xcSolo, 5)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 7: XC PIC/SIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Cross Country PIC/SIC</td>
                <Cell className="font-mono" picSic>
                  {totals.xcPic.toFixed(1)}<br/>
                  &nbsp;
                </Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" picSic />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 7.1: R-ATP Eligible XC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px] text-[#7c3aed]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>R-ATP Eligible XC (§61.160)</td>
                <Cell className="font-mono text-[#7c3aed]">{totals.ratpXC.toFixed(1)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 7.2: Total XC for IACRA */}
              <tr className="bg-[#f8fafc]">
                <td className="border border-black p-2 font-bold text-[12px] text-[#1a3a8c]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Total XC for IACRA</td>
                <Cell className="font-mono text-[#1a3a8c] font-bold">{totals.iacraXC.toFixed(1)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 8: Instrument */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Instrument</td>
                <Cell className="font-mono">{totals.instTotal.toFixed(1)}{checkMet(totals.instTotal, 3)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell className="font-mono">{totals.ftdInst.toFixed(1)}</Cell>
                <Cell className="font-mono">{totals.ffsInst.toFixed(1)}</Cell>
                <Cell className="font-mono">{totals.atdInst.toFixed(1)}</Cell>
              </tr>
              {/* Row 9: Night Instruction Received */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Night Instruction Received</td>
                <Cell className="font-mono">{totals.nightDual.toFixed(1)}{checkMet(totals.nightDual, 3)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 10: Night Take-off / Landing */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Night Take-off / Landing</td>
                <Cell className="font-mono">{(totals.nightTakeoffs + totals.nightLandings)}{checkMet(totals.nightTakeoffs + totals.nightLandings, 10)}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 11: Night PIC/SIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Night PIC/SIC</td>
                <Cell className="font-mono" picSic>
                  {totals.nightPic.toFixed(1)}<br/>
                  &nbsp;
                </Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" picSic />
                <Cell type="dark" picSic />
                <Cell type="dark" picSic />
                <Cell type="dark" />
              </tr>
              {/* Row 12: Night Take-off/Landing PIC/SIC */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Night Take-off/Landing PIC/SIC</td>
                <Cell className="font-mono" picSic>
                  {totals.nightTakeoffs}<br/>
                  &nbsp;
                </Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" picSic />
                <Cell type="dark" />
                <Cell type="dark" picSic />
                <Cell type="dark" />
              </tr>
              {/* Row 13: Number of Flights */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Number of Flights</td>
                <Cell className="font-mono">{totals.numFlights}</Cell>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 14: Number of Aero-Tows */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Number of Aero-Tows</td>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 15: Number of Ground Launches */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Number of Ground Launches</td>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
              {/* Row 16: Number of Powered Launches */}
              <tr>
                <td className="border border-black p-2 font-bold text-[12px]" style={{ backgroundColor: '#f4f7fa', color: '#1a3a5c', fontWeight: 'bold' }}>Number of Powered Launches</td>
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
                <Cell type="dark" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Class Hours Section */}
        <div className="mt-8 border border-black p-4">
          <h2 className="text-[#1a3a5c] text-center font-bold text-sm mb-4 uppercase">Class Hours</h2>
          <div className="grid grid-cols-4 border-t border-l border-black" style={{ color: '#1a3a5c' }}>
            {/* Row 1 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - SEL PIC: <span className="font-mono font-bold">{totals.picTimeASEL.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - SES PIC:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - MEL PIC: <span className="font-mono font-bold">{totals.picTimeAMEL.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - MES PIC:</div>
            {/* Row 2 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - SEL SIC:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - SES SIC:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - MEL SIC:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - MES SIC:</div>
            {/* Row 3 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - SEL Instruct Rcvd: <span className="font-mono font-bold">{totals.dualReceivedASEL.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - SES Instruct Rcvd:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - MEL Instruct Rcvd: <span className="font-mono font-bold">{totals.dualReceivedAMEL.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Airplane - MES Instruct Rcvd:</div>
            {/* Row 4 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Rotorcraft - HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>Rotorcraft - GYRO:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}></div>
            {/* Row 5 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>LTA - Balloon:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>LTA - Airship:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}></div>
            {/* Row 6 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>FFS ME:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>FTD ME:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>ATD ME:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}></div>
            {/* Row 7 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>FFS SE: <span className="font-mono font-bold">{totals.ffsTime.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>FTD SE: <span className="font-mono font-bold">{totals.ftdTime.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>ATD SE: <span className="font-mono font-bold">{totals.atdSE.toFixed(1)}</span></div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}></div>
            {/* Row 8 */}
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>FFS HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>FTD HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}>ATD HEL:</div>
            <div className="border-b border-r border-black p-1 text-[11px]" style={{ backgroundColor: '#e8edf2' }}></div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 border border-black p-4 text-[11px] leading-relaxed italic" style={{ backgroundColor: 'white', color: '#1a3a5c' }}>
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
