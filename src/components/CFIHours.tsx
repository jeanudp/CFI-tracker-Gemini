import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Search, Calendar, Clock, Plane, MapPin, 
  Download, ChevronRight, Loader2, Info, Shield, ChevronDown, 
  Check, X, Pencil, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ExportButton from './ExportButton';

export default function CFIHours() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [expandedCurrencyRow, setExpandedCurrencyRow] = useState<string | null>(null);
  const [flightReviewData, setFlightReviewData] = useState<any>(null);
  const [isEditingFlightReview, setIsEditingFlightReview] = useState(false);
  const [newFlightReviewDate, setNewFlightReviewDate] = useState('');
  const [isSavingFlightReview, setIsSavingFlightReview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('cfi_hours_backfilled');
    const runBackfill = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch flight review date
      fetchFlightReviewDate(session.user.id);

      // Fetch all lessons where dual > 0
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', session.user.id);

      if (lessonsError || !lessons) return;

      const cfiEntries = lessons
        .filter(l => parseFloat(l.meta?.dual || '0') > 0)
        .map(lesson => ({
          user_id: session.user.id,
          lesson_id: lesson.id,
          student_name: lesson.student_name,
          date: lesson.meta?.date || lesson.saved_at,
          aircraft: lesson.meta?.aircraft || '',
          aircraft_model: lesson.meta?.aircraftModel || '',
          route: lesson.meta?.route || '',
          total_flight: parseFloat(lesson.meta?.totalFlight || '0') || 0,
          dual_given: parseFloat(lesson.meta?.dual || '0') || 0,
          night_dual: parseFloat(lesson.meta?.nightDual || '0') || 0,
          instrument_given: parseFloat(lesson.meta?.simInst || '0') || 0,
          day_landings: lesson.meta?.cfiDidLandings ? (parseInt(lesson.meta?.cfiDayLandings || '0') || 0) : 0,
          night_landings: lesson.meta?.cfiDidLandings ? (parseInt(lesson.meta?.cfiNightLandings || '0') || 0) : 0,
          xc_pic: parseFloat(lesson.meta?.xcDual || '0') || 0,
          ratp_xc: parseFloat(lesson.meta?.ratpXCTime || '0') || 0,
          ratp_xc_eligible: lesson.meta?.ratpXCEligible || false,
          rating_code: lesson.meta?.rating_code || 'ppl',
          cfi_approach_count: lesson.meta?.cfiFlewApproaches ? (parseInt(lesson.meta?.cfiApproachCount || '0') || 0) : 0,
          cfi_approach_types: lesson.meta?.cfiFlewApproaches ? (lesson.meta?.cfiApproachTypes || '[]') : '[]',
          cfi_hold_performed: lesson.meta?.cfiFlewApproaches ? (lesson.meta?.cfiHoldPerformed || false) : false
        }));

      if (cfiEntries.length > 0) {
        await supabase.from('cfi_hours').upsert(cfiEntries, { onConflict: 'lesson_id' });
        fetchEntries(); // Refresh the list
      }
    };

    runBackfill();
    fetchEntries();
  }, []);

  const fetchFlightReviewDate = async (userId: string) => {
    const { data } = await supabase
      .from('manual_hours')
      .select('*')
      .eq('user_id', userId)
      .eq('field_key', 'cfi_flight_review_date')
      .maybeSingle();
    
    setFlightReviewData(data);
    if (data?.entries?.[0]?.completedDate) {
      setNewFlightReviewDate(data.entries[0].completedDate);
    }
  };

  const saveFlightReviewDate = async () => {
    if (!newFlightReviewDate) return;
    setIsSavingFlightReview(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const entry = { val: 1, date: new Date().toLocaleDateString(), completedDate: newFlightReviewDate };

    if (flightReviewData) {
      const { error } = await supabase
        .from('manual_hours')
        .update({ entries: [entry], total: 1, updated_at: new Date().toISOString() })
        .eq('id', flightReviewData.id);
      if (!error) {
        setFlightReviewData({ ...flightReviewData, entries: [entry] });
        setIsEditingFlightReview(false);
      }
    } else {
      const { data, error } = await supabase
        .from('manual_hours')
        .insert({
          user_id: session.user.id,
          field_key: 'cfi_flight_review_date',
          student_name: session.user.email,
          entries: [entry],
          total: 1
        })
        .select()
        .single();
      if (!error && data) {
        setFlightReviewData(data);
        setIsEditingFlightReview(false);
      }
    }
    setIsSavingFlightReview(false);
  };

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cfi_hours')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const filteredEntries = entries.filter(e => 
    e.student_name.toLowerCase().includes(search.toLowerCase()) ||
    e.date.includes(search)
  );

  const stats = {
    totalFlight: entries.reduce((sum, e) => sum + (parseFloat(e.total_flight) || 0), 0),
    totalDual: entries.reduce((sum, e) => sum + (parseFloat(e.dual_given) || 0), 0),
    nightDual: entries.reduce((sum, e) => sum + (parseFloat(e.night_dual) || 0), 0),
    instrumentGiven: entries.reduce((sum, e) => sum + (parseFloat(e.instrument_given) || 0), 0),
    dayLandings: entries.reduce((sum, e) => sum + (parseInt(e.day_landings) || 0), 0),
    nightLandings: entries.reduce((sum, e) => sum + (parseInt(e.night_landings) || 0), 0),
    xcPic: entries.reduce((sum, e) => sum + (parseFloat(e.xc_pic) || 0), 0),
    ratpXc: entries.reduce((sum, e) => sum + (parseFloat(e.ratp_xc) || 0), 0),
    multiEngine: entries.reduce((sum, e) => sum + (e.aircraft_class === 'AMEL' ? (parseFloat(e.total_flight) || 0) : 0), 0),
  };

  // Currency calculations
  const lastInstruction = entries.length > 0 ? entries[0].date : null;
  const daysSinceLast = lastInstruction ? Math.floor((new Date().getTime() - new Date(lastInstruction).getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const instrumentPast6Months = entries
    .filter(e => new Date(e.date) >= sixMonthsAgo)
    .reduce((sum, e) => sum + (parseFloat(e.instrument_given) || 0), 0);

  const formatTime = (decimal: number) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  // Passenger Currency Calculations
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentASEL = entries.filter(h =>
    (h.aircraft_class === 'ASEL' || !h.aircraft_class) &&
    new Date(h.date) >= ninetyDaysAgo
  );
  const aselDayLandings = recentASEL.reduce((sum, h) => 
    sum + (parseInt(h.day_landings || '0') || 0), 0);
  const aselDayTakeoffs = aselDayLandings; // Assuming landings ~= takeoffs for simplification
  const aselNightLandings = recentASEL.reduce((sum, h) => 
    sum + (parseInt(h.night_landings || '0') || 0), 0);
  const isAselDayCurrent = aselDayLandings >= 3 && aselDayTakeoffs >= 3;
  const isAselNightCurrent = aselNightLandings >= 3;

  const recentAMEL = entries.filter(h =>
    h.aircraft_class === 'AMEL' &&
    new Date(h.date) >= ninetyDaysAgo
  );
  const amelDayLandings = recentAMEL.reduce((sum, h) => 
    sum + (parseInt(h.day_landings || '0') || 0), 0);
  const amelNightLandings = recentAMEL.reduce((sum, h) => 
    sum + (parseInt(h.night_landings || '0') || 0), 0);
  const isAmelDayCurrent = amelDayLandings >= 3;
  const isAmelNightCurrent = amelNightLandings >= 3;

  const instrumentRecent = entries.filter(h => new Date(h.date) >= sixMonthsAgo);
  const totalApproaches = instrumentRecent.reduce((sum, h) =>
    sum + (parseInt(h.cfi_approach_count || '0') || 0), 0);
  const holdPerformed = instrumentRecent.some(h => h.cfi_hold_performed === true);
  const isIFRCurrent = totalApproaches >= 6 && holdPerformed;

  // Flight Review Logic
  const flightReviewDate = flightReviewData?.entries?.[0]?.completedDate || null;
  const frExpiryDate = flightReviewDate ? new Date(flightReviewDate) : null;
  if (frExpiryDate) frExpiryDate.setMonth(frExpiryDate.getMonth() + 24);
  const isFlightReviewCurrent = frExpiryDate ? new Date() < frExpiryDate : false;
  const frDaysUntilExpiry = frExpiryDate ? 
    Math.ceil((frExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const categories = [
    { 
      id: 'asel_day', 
      label: 'Passenger Currency Day ASEL', 
      ref: '§61.57(a)', 
      current: isAselDayCurrent, 
      show: entries.some(h => (h.aircraft_class === 'ASEL' || !h.aircraft_class)),
      details: [
        { label: 'Day Takeoffs (90d)', value: aselDayTakeoffs, target: 3 },
        { label: 'Day Landings (90d)', value: aselDayLandings, target: 3 },
      ],
      lastDate: recentASEL[0]?.date || 'None',
      expiryDate: recentASEL[0] ? new Date(new Date(recentASEL[0].date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    },
    { 
      id: 'asel_night', 
      label: 'Passenger Currency Night ASEL', 
      ref: '§61.57(b)', 
      current: isAselNightCurrent, 
      show: entries.some(h => (h.aircraft_class === 'ASEL' || !h.aircraft_class) && h.night_landings > 0),
      details: [
        { label: 'Night Landings (90d)', value: aselNightLandings, target: 3 },
      ],
      lastDate: recentASEL.find(h => h.night_landings > 0)?.date || 'None',
      expiryDate: recentASEL.find(h => h.night_landings > 0) ? new Date(new Date(recentASEL.find(h => h.night_landings > 0).date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    },
    { 
      id: 'amel_day', 
      label: 'Passenger Currency Day AMEL', 
      ref: '§61.57(a)', 
      current: isAmelDayCurrent, 
      show: entries.some(h => h.aircraft_class === 'AMEL'),
      details: [
        { label: 'Day Landings (90d)', value: amelDayLandings, target: 3 },
      ],
      lastDate: recentAMEL[0]?.date || 'None',
      expiryDate: recentAMEL[0] ? new Date(new Date(recentAMEL[0].date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    },
    { 
      id: 'amel_night', 
      label: 'Passenger Currency Night AMEL', 
      ref: '§61.57(b)', 
      current: isAmelNightCurrent, 
      show: entries.some(h => h.aircraft_class === 'AMEL' && h.night_landings > 0),
      details: [
        { label: 'Night Landings (90d)', value: amelNightLandings, target: 3 },
      ],
      lastDate: recentAMEL.find(h => h.night_landings > 0)?.date || 'None',
      expiryDate: recentAMEL.find(h => h.night_landings > 0) ? new Date(new Date(recentAMEL.find(h => h.night_landings > 0).date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
    },
    { 
      id: 'ifr', 
      label: 'IFR Currency', 
      ref: '§61.57(c)', 
      current: isIFRCurrent, 
      show: true, 
      details: [
        { label: 'Approaches (6m)', value: totalApproaches, target: 6 },
        { label: 'Holding Performed', value: holdPerformed ? 1 : 0, target: 1 },
      ],
      lastDate: instrumentRecent.find(h => 
        (parseInt(h.cfi_approach_count) || 0) > 0 || 
        h.cfi_hold_performed === true
      )?.date || 'None',
      expiryDate: instrumentRecent[0] ? new Date(new Date(instrumentRecent[0].date).setMonth(new Date(instrumentRecent[0].date).getMonth() + 6)).toISOString().split('T')[0] : null,
      customMsg: !isIFRCurrent ? "IFR currency lapsed. Complete an IPC with a CFII before acting as PIC under IFR." : null
    }
  ].filter(c => c.show);

  const activeCurrencies = categories.filter(c => c.current).length + (isFlightReviewCurrent ? 1 : 0);
  const totalCurrencies = categories.length + 1;

  const headerBgStyle = activeCurrencies === totalCurrencies ? 'bg-[#f0fdf4] border-[#bcf0da]' : 
                       activeCurrencies === 0 ? 'bg-[#fef2f2] border-[#fecaca]' : 
                       'bg-[#fffbeb] border-[#fde68a]';

  const formatDaysUntil = (days: number) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    return `${days} days left`;
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

    entries.forEach(e => {
      const row = new Array(headers.length).fill('');
      row[0] = e.date || '';
      row[2] = e.aircraft_model || '';
      row[4] = e.aircraft || '';
      row[5] = e.aircraft || '';
      row[11] = e.night_landings || '';
      row[12] = e.day_landings || '';
      row[13] = e.xc_pic || '';
      row[14] = e.night_dual || '';
      row[16] = e.instrument_given || '';
      row[18] = ''; // Dual Received blank for CFI
      row[19] = e.dual_given || '';
      row[22] = e.total_flight || '';
      row[23] = toHHMM(e.dual_given);
      row[26] = toHHMM(e.total_flight);
      row[27] = e.route || '';
      row[29] = `CFI instruction — ${e.student_name}`;
      rows.push(row);
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `MyFlightBook-CFI-${dateStr}.csv`;
    downloadCSV(rows, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#1a3a5c]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c] flex items-center gap-2">
            <GraduationCap className="text-[#e8a020]" />
            My CFI Hours
          </h1>
          <p className="text-sm text-[#64748b]">Cumulative flight hours as an instructor</p>
        </div>
        <ExportButton 
          onExportCSV={exportToMyFlightBook}
          buttonText="Export CFI Hours"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
      {[
        { label: 'Total Flight Time', value: stats.totalFlight.toFixed(1), unit: 'hrs' },
        { label: 'Total Dual Given', value: stats.totalDual.toFixed(1), unit: 'hrs' },
        { label: 'Cross Country PIC', value: stats.xcPic.toFixed(1), unit: 'hrs' },
        { 
          label: 'R-ATP Eligible XC', 
          value: stats.ratpXc.toFixed(1), 
          unit: 'hrs',
          badge: 'R-ATP'
        },
        { label: 'Multi Engine', value: stats.multiEngine.toFixed(1), unit: 'hrs', badge: 'AMEL' },
        { label: 'Night Instruction', value: stats.nightDual.toFixed(1), unit: 'hrs' },
        { label: 'Instrument Given', value: stats.instrumentGiven.toFixed(1), unit: 'hrs' },
        { label: 'Day Landings', value: stats.dayLandings, unit: 'ldg' },
        { label: 'Night Landings', value: stats.nightLandings, unit: 'ldg' },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white p-4 rounded-xl border border-[#dde3ec] shadow-sm"
        >
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">{stat.label}</div>
            {stat.badge && (
              <span className="text-[8px] font-bold bg-[#1a3a5c] text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                {stat.badge}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#1a3a5c]">{stat.value}</span>
            <span className="text-[10px] font-mono text-[#94a3b8]">{stat.unit}</span>
          </div>
        </motion.div>
      ))}
      </div>

      {/* Currency Section */}
      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
        <button
          onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
          className={cn(
            "w-full px-6 py-4 flex items-center justify-between transition-colors",
            headerBgStyle
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border",
              activeCurrencies === totalCurrencies ? "bg-white border-[#bcf0da] text-[#059669]" :
              activeCurrencies === 0 ? "bg-white border-[#fecaca] text-[#dc2626]" :
              "bg-white border-[#fde68a] text-[#d97706]"
            )}>
              <Shield size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-[#1a3a5c]">CFI Currency Status</h3>
              <p className="text-[10px] text-[#64748b]">FAR/AIM §61.56, §61.57 compliance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm",
              activeCurrencies === totalCurrencies ? "bg-[#dcfce7] text-[#166534] border-[#bcf0da]" :
              activeCurrencies === 0 ? "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]" :
              "bg-[#fef3c7] text-[#92400e] border-[#fde68a]"
            )}>
              {activeCurrencies}/{totalCurrencies} Current
            </div>
            <motion.div
              animate={{ rotate: isCurrencyOpen ? 180 : 0 }}
              className="text-[#94a3b8]"
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {isCurrencyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#dde3ec]"
            >
              <div className="p-4 space-y-4">
                {categories.map((cat) => {
                  const daysUntil = cat.expiryDate ? Math.ceil((new Date(cat.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <div key={cat.id} className="bg-[#f8fafc] rounded-xl border border-[#dde3ec] overflow-hidden">
                      <button
                        onClick={() => setExpandedCurrencyRow(expandedCurrencyRow === cat.id ? null : cat.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f1f5f9] transition-colors"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-[11px] font-bold text-[#1e293b]">{cat.label}</span>
                          <span className="text-[9px] text-[#64748b] tracking-wider uppercase">{cat.ref}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {cat.current ? (
                            <span className="bg-[#dcfce7] text-[#166534] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#bcf0da]">CURRENT</span>
                          ) : (
                            <span className="bg-[#fee2e2] text-[#991b1b] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#fecaca]">NOT CURRENT</span>
                          )}
                          <motion.div
                            animate={{ rotate: expandedCurrencyRow === cat.id ? 90 : 0 }}
                            className="text-[#94a3b8]"
                          >
                            <ChevronRight size={16} />
                          </motion.div>
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedCurrencyRow === cat.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="px-4 pb-4 border-t border-[#dde3ec]/10 space-y-3 pt-3"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              {cat.details.map((detail, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span className="text-[10px] text-[#64748b]">{detail.label}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className={cn(
                                      "text-[10px] font-bold font-mono",
                                      detail.value >= detail.target ? "text-[#059669]" : "text-[#dc2626]"
                                    )}>
                                      {detail.value} / {detail.target}
                                    </span>
                                    {detail.value >= detail.target ? (
                                      <Check size={12} className="text-[#059669]" />
                                    ) : (
                                      <X size={12} className="text-[#dc2626]" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col gap-1 border-t border-[#dde3ec]/50 pt-3">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-[#64748b]">Last Currency Event</span>
                                <span className="font-bold text-[#1e293b]">{cat.lastDate}</span>
                              </div>
                              {cat.expiryDate && (
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[#64748b]">Expiry Date</span>
                                  <span className={cn(
                                    "font-bold",
                                    daysUntil < 15 && daysUntil > 0 ? "text-[#d97706]" : daysUntil <= 0 ? "text-[#dc2626]" : "text-[#1e293b]"
                                  )}>
                                    {cat.expiryDate} {daysUntil < 15 && `(${formatDaysUntil(daysUntil)})`}
                                  </span>
                                </div>
                              )}
                              {cat.customMsg && (
                                <div className="mt-2 p-2 bg-[#fffbeb] border border-[#fef3c7] rounded-lg flex items-center gap-2">
                                  <AlertTriangle size={12} className="text-[#d97706]" />
                                  <span className="text-[10px] text-[#92400e] font-medium">{cat.customMsg}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {/* Flight Review Row */}
                <div className="bg-[#f8fafc] rounded-xl border border-[#dde3ec] overflow-hidden">
                  <button
                    onClick={() => setExpandedCurrencyRow(expandedCurrencyRow === 'fr' ? null : 'fr')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f1f5f9] transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] font-bold text-[#1e293b]">Flight Review</span>
                      <span className="text-[9px] text-[#64748b] tracking-wider uppercase">§61.56</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {isFlightReviewCurrent ? (
                        <span className="bg-[#dcfce7] text-[#166534] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#bcf0da]">CURRENT</span>
                      ) : (
                        <span className="bg-[#fee2e2] text-[#991b1b] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#fecaca]">EXPIRED</span>
                      )}
                      <motion.div
                        animate={{ rotate: expandedCurrencyRow === 'fr' ? 90 : 0 }}
                        className="text-[#94a3b8]"
                      >
                        <ChevronRight size={16} />
                      </motion.div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedCurrencyRow === 'fr' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="px-4 pb-4 border-t border-[#dde3ec]/10 pt-3"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-col gap-1">
                            {flightReviewDate ? (
                              <>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[#64748b]">Last Flight Review</span>
                                  <span className="font-bold text-[#1e293b]">{flightReviewDate}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[#64748b]">Expiry Date</span>
                                  <span className={cn(
                                    "font-bold",
                                    frDaysUntilExpiry < 60 && frDaysUntilExpiry > 0 ? "text-[#d97706]" : frDaysUntilExpiry <= 0 ? "text-[#dc2626]" : "text-[#1e293b]"
                                  )}>
                                    {frExpiryDate?.toISOString().split('T')[0]} {frDaysUntilExpiry < 60 && `(${formatDaysUntil(frDaysUntilExpiry)})`}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-lg text-center">
                                <p className="text-[11px] text-[#92400e] font-medium leading-relaxed">
                                  No flight review date on record. Click Edit to add your most recent flight review date.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-[#dde3ec]/50 pt-3">
                            {isEditingFlightReview ? (
                              <div className="flex gap-2 w-full">
                                <input
                                  type="date"
                                  value={newFlightReviewDate}
                                  onChange={(e) => setNewFlightReviewDate(e.target.value)}
                                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#dde3ec] rounded-lg focus:outline-none focus:border-[#1a3a5c]"
                                />
                                <button
                                  onClick={saveFlightReviewDate}
                                  disabled={isSavingFlightReview}
                                  className="px-4 py-1.5 bg-[#1a3a5c] text-white text-[11px] font-bold rounded-lg hover:bg-[#2a5a8c] transition-all flex items-center gap-2"
                                >
                                  {isSavingFlightReview ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                                </button>
                                <button
                                  onClick={() => setIsEditingFlightReview(false)}
                                  className="px-4 py-1.5 bg-white text-[#64748b] text-[11px] font-bold rounded-lg border border-[#dde3ec] hover:bg-[#f8fafc] transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-[10px] text-[#64748b]">Update flight review details</span>
                                <button
                                  onClick={() => setIsEditingFlightReview(true)}
                                  className="p-1.5 rounded-lg border border-[#dde3ec] text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1a3a5c] transition-all flex items-center gap-1.5"
                                >
                                  <Pencil size={12} />
                                  <span className="text-[10px] font-bold">Edit</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        {/* Logbook Table */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              type="text"
              placeholder="Search by student name or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#dde3ec] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/10"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#dde3ec]">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Student</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Aircraft</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Route</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Total</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Dual</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">XC PIC</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">R-ATP XC</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Night</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Inst</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Ldg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredEntries.map((e) => (
                    <tr 
                      key={e.id}
                      onClick={() => navigate('/history')}
                      className="hover:bg-[#f8fafc] cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#1e293b]">
                          <Calendar size={12} className="text-[#94a3b8]" />
                          {e.date}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-[#1a3a5c]">{e.student_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-[#1e293b]">{e.aircraft}</span>
                          <span className="text-[9px] text-[#64748b]">{e.aircraft_model}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[11px] text-[#475569]">
                          <MapPin size={12} className="text-[#94a3b8]" />
                          {e.route || 'Local'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono font-bold text-[#1e293b]">{parseFloat(e.total_flight).toFixed(1)}</td>
                      <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.dual_given).toFixed(1)}</td>
                      <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.xc_pic || 0).toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-[#475569]">{parseFloat(e.ratp_xc || 0).toFixed(1)}</span>
                          {e.ratp_xc_eligible && (
                            <span className="text-[7px] font-bold bg-[#1a3a5c] text-white px-1 py-0.5 rounded uppercase tracking-tighter">R-ATP</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.night_dual).toFixed(1)}</td>
                      <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.instrument_given).toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono bg-[#f1f5f9] px-1.5 py-0.5 rounded text-[#475569]">
                          {e.day_landings}D/{e.night_landings}N
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f8fafc] font-bold border-t border-[#dde3ec]">
                    <td colSpan={4} className="px-4 py-3 text-[10px] uppercase tracking-widest text-[#64748b]">Totals</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#1a3a5c]">{stats.totalFlight.toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#1a3a5c]">{stats.totalDual.toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#1a3a5c]">{stats.xcPic.toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#1a3a5c]">{stats.ratpXc.toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#1a3a5c]">{stats.nightDual.toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#1a3a5c]">{stats.instrumentGiven.toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#1a3a5c]">{stats.dayLandings}D/{stats.nightLandings}N</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {filteredEntries.length === 0 && (
              <div className="p-8 text-center text-[#64748b] text-sm">
                No CFI hours found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
