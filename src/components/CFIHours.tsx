import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Search, Calendar, Clock, Plane, MapPin, 
  Download, ChevronRight, Loader2, Info, Shield, ChevronDown, 
  Check, X, Pencil, AlertTriangle, Upload, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ExportButton from './ExportButton';

export default function CFIHours() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [expandedCurrencyRow, setExpandedCurrencyRow] = useState<string | null>(null);
  const [flightReviewData, setFlightReviewData] = useState<any>(null);
  const [isEditingFlightReview, setIsEditingFlightReview] = useState(false);
  const [newFlightReviewDate, setNewFlightReviewDate] = useState('');
  const [isSavingFlightReview, setIsSavingFlightReview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ flights: number, error: string | null } | null>(null);
  const [mfbSummary, setMfbSummary] = useState<any>(null);
  const [cfiProfile, setCfiProfile] = useState<{ full_name: string; cert_number: string; re_exp_date: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ full_name: '', cert_number: '', re_exp_date: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
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
    fetchMfbSummary();
    fetchCfiProfile();
  }, []);

  const fetchMfbSummary = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from('manual_hours')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('field_key', 'mfb_import_summary')
      .maybeSingle();
    if (data?.entries?.[0]) setMfbSummary(data.entries[0]);
  };

  const handleMFBImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

      const getCol = (row: string[], name: string) => {
        const idx = headers.indexOf(name);
        if (idx === -1) return '';
        return (row[idx] || '').trim().replace(/^"|"$/g, '');
      };

      const summary = {
        totalFlight: 0, dualGiven: 0, pic: 0, night: 0,
        simInst: 0, imc: 0, xc: 0, dayLandings: 0, nightLandings: 0,
        approaches: 0, flightCount: 0,
        importedAt: new Date().toISOString().split('T')[0],
      };

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = line.split(',');

        const total = parseFloat(getCol(row, 'Total Flight Time')) || 0;
        if (total === 0) continue;

        summary.flightCount++;
        summary.totalFlight += total;
        summary.dualGiven += parseFloat(getCol(row, 'CFI')) || 0;
        summary.pic += parseFloat(getCol(row, 'PIC')) || 0;
        summary.night += parseFloat(getCol(row, 'Night')) || 0;
        summary.simInst += parseFloat(getCol(row, 'Simulated Instrument')) || 0;
        summary.imc += parseFloat(getCol(row, 'IMC')) || 0;
        summary.xc += parseFloat(getCol(row, 'X-Country')) || 0;
        summary.dayLandings += parseInt(getCol(row, 'FS Day Landings')) || 0;
        summary.nightLandings += parseInt(getCol(row, 'FS Night Landings')) || 0;
        summary.approaches += parseInt(getCol(row, 'Approaches')) || 0;
      }

      // Round all values to 1 decimal
      Object.keys(summary).forEach(k => {
        if (typeof (summary as any)[k] === 'number' && !Number.isInteger((summary as any)[k])) {
          (summary as any)[k] = Math.round((summary as any)[k] * 10) / 10;
        }
      });

      // Save to manual_hours
      const { data: existing } = await supabase
        .from('manual_hours')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('field_key', 'mfb_import_summary')
        .maybeSingle();

      if (existing) {
        await supabase.from('manual_hours').update({
          entries: [summary],
          total: summary.totalFlight,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        await supabase.from('manual_hours').insert({
          user_id: session.user.id,
          field_key: 'mfb_import_summary',
          student_name: session.user.email,
          entries: [summary],
          total: summary.totalFlight,
        });
      }

      setMfbSummary(summary);
      setImportResult({ flights: summary.flightCount, error: null });
    } catch (err: any) {
      setImportResult({ flights: 0, error: err.message });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const fetchCfiProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from('cfi_profile')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (data) {
      setCfiProfile(data);
      setProfileDraft({ full_name: data.full_name || '', cert_number: data.cert_number || '', re_exp_date: data.re_exp_date || '' });
    }
  };

  const saveCfiProfile = async () => {
    setIsSavingProfile(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const payload = {
      user_id: session.user.id,
      full_name: profileDraft.full_name,
      cert_number: profileDraft.cert_number,
      re_exp_date: profileDraft.re_exp_date,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('cfi_profile')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    if (!error && data) {
      setCfiProfile(data);
      setIsEditingProfile(false);
    }
    setIsSavingProfile(false);
  };

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

  // Additional Stats Calculations
  const now = new Date();
  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  };
  
  const startOfWeek = getStartOfWeek(new Date(now));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const hoursThisWeek = entries
    .filter(e => new Date(e.date) >= startOfWeek)
    .reduce((sum, e) => sum + (parseFloat(e.total_flight) || 0), 0);
  
  const hoursThisMonth = entries
    .filter(e => new Date(e.date) >= startOfMonth)
    .reduce((sum, e) => sum + (parseFloat(e.total_flight) || 0), 0);
  
  const hoursThisYear = entries
    .filter(e => new Date(e.date) >= startOfYear)
    .reduce((sum, e) => sum + (parseFloat(e.total_flight) || 0), 0);
    
  const studentsThisMonth = new Set(
    entries
      .filter(e => new Date(e.date) >= startOfMonth)
      .map(e => e.student_name)
  ).size;

  const lastLessonDate = entries.length > 0 
    ? new Date(entries[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'None';

  const stats = {
    totalFlight: entries.reduce((sum, e) => sum + (parseFloat(e.total_flight) || 0), 0) + (mfbSummary?.totalFlight || 0),
    totalDual: entries.reduce((sum, e) => sum + (parseFloat(e.dual_given) || 0), 0) + (mfbSummary?.dualGiven || 0),
    nightDual: entries.reduce((sum, e) => sum + (parseFloat(e.night_dual) || 0), 0) + (mfbSummary?.night || 0),
    instrumentGiven: entries.reduce((sum, e) => sum + (parseFloat(e.instrument_given) || 0), 0) + (mfbSummary?.simInst || 0),
    dayLandings: entries.reduce((sum, e) => sum + (parseInt(e.day_landings) || 0), 0) + (mfbSummary?.dayLandings || 0),
    nightLandings: entries.reduce((sum, e) => sum + (parseInt(e.night_landings) || 0), 0) + (mfbSummary?.nightLandings || 0),
    xcPic: entries.reduce((sum, e) => sum + (parseFloat(e.xc_pic) || 0), 0) + (mfbSummary?.xc || 0),
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
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1a3a5c] flex items-center gap-2">
          <GraduationCap className="text-[#e8a020]" />
          My Profile
        </h1>
        <p className="text-sm text-[#64748b]">View your certificates, currency status, and instruction statistics.</p>
      </div>

      {/* Section 1: Profile & Currency */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94a3b8] whitespace-nowrap">Profile & Currency</div>
          <div className="h-[1px] w-full bg-[#dde3ec] opacity-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CFI Profile Card */}
          <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#dde3ec] bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-bold text-[#1a3a5c]">Instructor Information</h3>
                <p className="text-[10px] text-[#64748b]">Used for endorsement auto-fill</p>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dde3ec] text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1a3a5c] transition-all text-[10px] font-bold"
                >
                  <Pencil size={12} />
                  {cfiProfile ? 'Edit' : 'Add Info'}
                </button>
              )}
            </div>
            <div className="p-6 flex-1">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: 'Full Name', key: 'full_name', placeholder: 'e.g. John J. Smith' },
                      { label: 'CFI Certificate #', key: 'cert_number', placeholder: 'e.g. 987654321CFI' },
                      { label: 'RE End Date / Exp. Date', key: 're_exp_date', placeholder: 'e.g. 12-31-2026' },
                    ].map(field => (
                      <div key={field.key} className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">{field.label}</label>
                        <input
                          type="text"
                          value={profileDraft[field.key as keyof typeof profileDraft]}
                          onChange={e => setProfileDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a3a5c] transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveCfiProfile}
                      disabled={isSavingProfile}
                      className="flex items-center gap-2 px-5 py-2 bg-[#1a3a5c] text-white text-xs font-bold rounded-xl hover:bg-[#2a5a8c] transition-all shadow-md disabled:opacity-50"
                    >
                      {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        if (cfiProfile) setProfileDraft({ full_name: cfiProfile.full_name || '', cert_number: cfiProfile.cert_number || '', re_exp_date: cfiProfile.re_exp_date || '' });
                      }}
                      className="px-5 py-2 bg-white text-[#6b7280] text-xs font-bold rounded-xl border border-[#dde3ec] hover:bg-[#f8fafc] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : cfiProfile ? (
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: 'Full Name', value: cfiProfile.full_name },
                    { label: 'CFI Certificate #', value: cfiProfile.cert_number },
                    { label: 'RE End Date / Exp. Date', value: cfiProfile.re_exp_date },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1">{item.label}</div>
                      <div className="text-sm font-bold text-[#1a3a5c]">{item.value || '—'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-[#94a3b8]">No profile info saved yet.</p>
                  <button onClick={() => setIsEditingProfile(true)} className="mt-4 text-[#1a3a5c] text-xs font-bold hover:underline">Add Profile Info →</button>
                </div>
              )}
            </div>
          </div>

          {/* Currency Status Card */}
          <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#dde3ec] bg-[#f8fafc]">
            <div>
              <h3 className="text-sm font-bold text-[#1a3a5c]">Currency Snapshot</h3>
              <p className="text-[10px] text-[#64748b]">Based on 61 Tracker flight history</p>
            </div>
            <div className={cn(
              "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm transition-colors",
              activeCurrencies === totalCurrencies ? "bg-green-50 text-green-700 border-green-200" :
              activeCurrencies === 0 ? "bg-red-50 text-red-700 border-red-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
            )}>
              {activeCurrencies} / {totalCurrencies} Current
            </div>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
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
                        <span className="bg-[#fee2e2] text-[#991b1b] text-[9px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#fecaca]">EXPIRED</span>
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
                            <span className="text-[#64748b]">Last Event Date</span>
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Section 2: Flight Statistics */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94a3b8] whitespace-nowrap">Flight Statistics</div>
          <div className="h-[1px] w-full bg-[#dde3ec] opacity-50" />
        </div>

        {/* Top Priority Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Hours This Week', value: hoursThisWeek.toFixed(1), color: 'text-[#1a3a5c]' },
            { label: 'Hours This Month', value: hoursThisMonth.toFixed(1), color: 'text-[#1a3a5c]' },
            { label: 'Hours This Year', value: hoursThisYear.toFixed(1), color: 'text-[#1a3a5c]' },
            { label: 'Students This Month', value: studentsThisMonth, color: 'text-[#e8a020]' },
            { label: 'Last Lesson', value: lastLessonDate, color: 'text-[#64748b]' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-white p-4 rounded-2xl border border-[#dde3ec] shadow-sm">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] mb-1">{stat.label}</div>
              <div className={cn("text-xl font-black", stat.color)}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {[
            { label: 'Total Flight', value: stats.totalFlight.toFixed(1), unit: 'hrs' },
            { label: 'Total Dual', value: stats.totalDual.toFixed(1), unit: 'hrs' },
            { label: 'XC PIC', value: stats.xcPic.toFixed(1), unit: 'hrs' },
            { label: 'R-ATP XC', value: stats.ratpXc.toFixed(1), unit: 'hrs', badge: 'R-ATP' },
            { label: 'Multi-Engine', value: stats.multiEngine.toFixed(1), unit: 'hrs', badge: 'AMEL' },
            { label: 'Night Instruction', value: stats.nightDual.toFixed(1), unit: 'hrs' },
            { label: 'Day Landings', value: stats.dayLandings, unit: 'ldg' },
            { label: 'Night Landings', value: stats.nightLandings, unit: 'ldg' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-white p-3 rounded-xl border border-[#dde3ec] shadow-sm">
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-[8px] font-bold uppercase tracking-widest text-[#64748b]">{stat.label}</div>
                {stat.badge && (
                  <span className="text-[6px] font-black bg-[#1a3a5c] text-white px-1 py-0.25 rounded">
                    {stat.badge}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm font-bold text-[#1a3a5c]">{stat.value}</span>
                <span className="text-[8px] font-mono text-[#94a3b8]">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Logbook */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94a3b8] whitespace-nowrap">Logbook</div>
            <div className="h-[1px] w-full bg-[#dde3ec] opacity-50" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#dde3ec] text-[10px] font-bold text-[#64748b] cursor-not-allowed opacity-50 hover:bg-[#f8fafc] transition-all">
                <Upload size={12} />
                Import
                <input type="file" className="hidden" disabled />
              </label>
              <span className="absolute -top-1.5 -right-1.5 bg-[#e8a020] text-white text-[6px] font-black uppercase px-1 rounded-full">SOON</span>
            </div>
            <div className="relative">
              <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#dde3ec] text-[10px] font-bold text-[#64748b] cursor-not-allowed opacity-50 hover:bg-[#f8fafc] transition-all">
                <Download size={12} />
                Export
              </button>
              <span className="absolute -top-1.5 -right-1.5 bg-[#e8a020] text-white text-[6px] font-black uppercase px-1 rounded-full">SOON</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#dde3ec] bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-[#1a3a5c]">Recorded Sessions</h3>
              <span className="px-2 py-0.5 bg-[#1a3a5c]/5 text-[#1a3a5c] text-[10px] font-bold rounded-full border border-[#1a3a5c]/10">
                {entries.length} Entries
              </span>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input
                type="text"
                placeholder="Search student or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#dde3ec] rounded-xl text-sm focus:outline-none focus:border-[#1a3a5c] transition-all"
              />
            </div>
          </div>

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
                    <td className="px-4 py-3 text-[11px] text-[#475569]">{e.aircraft}</td>
                    <td className="px-4 py-3 text-[11px] text-[#475569]">{e.route || 'Local'}</td>
                    <td className="px-4 py-3 text-[11px] font-mono font-bold text-[#1e293b]">{parseFloat(e.total_flight).toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.dual_given).toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.xc_pic || 0).toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.ratp_xc || 0).toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.night_dual).toFixed(1)}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-[#475569]">{parseFloat(e.instrument_given).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
