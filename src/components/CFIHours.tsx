import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { GraduationCap, Search, Calendar, Clock, Plane, MapPin, Download, ChevronRight, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import ExportButton from './ExportButton';

export default function CFIHours() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const runBackfill = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if cfi_hours has any records for this user
      const { count, error: countError } = await supabase
        .from('cfi_hours')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (countError) return;

      if (count === 0) {
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
            day_landings: parseInt(lesson.meta?.cfiDayLandings || '0') || 0,
            night_landings: parseInt(lesson.meta?.cfiNightLandings || '0') || 0,
            xc_pic: parseFloat(lesson.meta?.xcDual || '0') || 0,
            ratp_xc: parseFloat(lesson.meta?.ratpXCTime || '0') || 0,
            ratp_xc_eligible: lesson.meta?.ratpXCEligible || false,
            rating_code: lesson.meta?.rating_code || 'ppl'
          }));

        if (cfiEntries.length > 0) {
          await supabase.from('cfi_hours').upsert(cfiEntries, { onConflict: 'lesson_id' });
          fetchEntries(); // Refresh the list
        }
      }
    };

    runBackfill();
    fetchEntries();
  }, []);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Currency Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden h-full">
            <div className="bg-[#f8fafc] px-4 py-3 border-b border-[#dde3ec] flex items-center gap-2">
              <Info size={16} className="text-[#1a3a5c]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a3a5c]">CFI Currency Requirements</h3>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="text-[11px] font-bold text-[#334155]">Flight Review</div>
                  <div className="text-[10px] text-[#64748b]">24 Calendar Months</div>
                </div>
                <div className="p-3 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0]">
                  {lastInstruction ? (
                    <>
                      <div className="text-[11px] text-[#475569] mb-1">Last instruction given on <span className="font-bold">{lastInstruction}</span></div>
                      <div className="text-[10px] text-[#64748b]">{daysSinceLast} days since last instruction</div>
                    </>
                  ) : (
                    <div className="text-[11px] text-[#64748b]">No instruction logged yet</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="text-[11px] font-bold text-[#334155]">Instrument Instruction Given</div>
                  <div className="text-[10px] text-[#64748b]">Past 6 Months</div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (instrumentPast6Months / 15) * 100)}%` }}
                      className="h-full bg-[#0ea5e9]"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#0ea5e9]">{instrumentPast6Months.toFixed(1)} hrs</span>
                    <span className="text-[10px] text-[#94a3b8]">Goal: 15h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logbook Table */}
        <div className="lg:col-span-2 space-y-4">
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
