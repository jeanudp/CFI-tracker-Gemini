import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Printer, X, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface EndorsementPrinterProps {
  onClose: () => void;
  ratingCode?: string;
}

type EndorsementDef = {
  key: string;
  title: string;
  ref: string;
  template: string;
  group?: string;
};

const ALL_ENDORSEMENTS: Record<string, EndorsementDef[]> = {
  ppl: [
    { key: 'A.3', title: 'Pre-solo aeronautical knowledge', ref: '14 CFR § 61.87(b)', template: 'I certify that {First name, MI, Last name} has satisfactorily completed the pre-solo knowledge test of 14 CFR § 61.87(b) for the {make and model} aircraft.' },
    { key: 'A.4', title: 'Pre-solo flight training', ref: '14 CFR § 61.87(c)(1) and (2)', template: 'I certify that {First name, MI, Last name} has received and logged pre-solo flight training for the maneuvers and procedures that are appropriate to the {make and model} aircraft. I have determined they have demonstrated satisfactory proficiency and safety on the maneuvers and procedures required by 14 CFR § 61.87 in this or similar make and model of aircraft to be flown.' },
    { key: 'A.5', title: 'Pre-solo flight training at night', ref: '14 CFR § 61.87(o)', template: 'I certify that {First name, MI, Last name} has received flight training at night on night flying procedures that include takeoffs, approaches, landings, and go-arounds at night at the {airport name} airport where the solo flight will be conducted; navigation training at night in the vicinity of the {airport name for navigation} airport where the solo flight will be conducted. This endorsement expires 90 calendar days from the date the flight training at night was received.' },
    { key: 'A.6', title: 'Solo flight — first 90-calendar-day period', ref: '14 CFR § 61.87(n)', template: 'I certify that {First name, MI, Last name} has received the required training to qualify for solo flying. I have determined they meet the applicable requirements of 14 CFR § 61.87(n) and are proficient to make solo flights in {make and model}.' },
    { key: 'A.7', title: 'Solo flight — each additional 90-calendar-day period', ref: '14 CFR § 61.87(p)', template: 'I certify that {First name, MI, Last name} has received the required training to qualify for solo flying. I have determined that they meet the applicable requirements of 14 CFR § 61.87(p) and are proficient to make solo flights in {make and model}.' },
    { key: 'A.8', title: 'Solo takeoffs and landings at another airport within 25 NM', ref: '14 CFR § 61.93(b)(1)', template: 'I certify that {First name, MI, Last name} has received the required training of 14 CFR § 61.93(b)(1). I have determined that they are proficient to practice solo takeoffs and landings at {airport name}. The takeoffs and landings at {airport name for conditions} are subject to the following conditions: {conditions or limitations}.' },
    { key: 'A.9', title: 'Solo cross-country flight — general authorization', ref: '14 CFR § 61.93(c)(1) and (2)', template: 'I certify that {First name, MI, Last name} has received the required solo cross-country training. I find they have met the applicable requirements of 14 CFR § 61.93 and are proficient to make solo cross-country flights in a {make and model} aircraft, {aircraft category}.' },
    { key: 'A.10', title: 'Solo cross-country flight — individual flight planning review', ref: '14 CFR § 61.93(c)(3)', template: 'I have reviewed the cross-country planning of {First name, MI, Last name}. I find the planning and preparation to be correct to make the solo flight from {origination airport} to {destination airport} via {route of flight} with landings at {names of airports} in a {make and model} aircraft on {date}. {Conditions or limitations, if any}.' },
    { key: 'A.11', title: 'Repeated solo cross-country flights not more than 50 NM', ref: '14 CFR § 61.93(b)(2)', template: 'I certify that {First name, MI, Last name} has received the required training in both directions between and at both {airport names}. I have determined that they are proficient of 14 CFR § 61.93(b)(2) to conduct repeated solo cross-country flights over that route, subject to the following conditions: {conditions or limitations}.' },
    { key: 'A.12', title: 'Solo flight in Class B airspace', ref: '14 CFR § 61.95(a)', template: 'I certify that {First name, MI, Last name} has received the required training of 14 CFR § 61.95(a). I have determined they are proficient to conduct solo flights in {name of Class B airspace} airspace. {Conditions or limitations, if any}.' },
    { key: 'A.13', title: 'Solo flight to, from, or at an airport in Class B airspace', ref: '14 CFR §§ 61.95(b) and 91.131(b)(1)', template: 'I certify that {First name, MI, Last name} has received the required training of 14 CFR § 61.95(b)(1). I have determined that they are proficient to conduct solo flight operations at {name of airport}. {Conditions or limitations, if any}.' },
    { key: 'A.1', title: 'Prerequisites for practical test', ref: '14 CFR § 61.39(a)(6)(i) and (ii)', template: 'I certify that {First name, MI, Last name} has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of {applicable certificate}.', group: 'Checkride' },
    { key: 'A.2', title: 'Review of deficiencies identified on knowledge test', ref: '14 CFR § 61.39(a)(6)(iii)', template: 'I certify that {First name, MI, Last name} has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the {applicable} airman knowledge test.', group: 'Checkride' },
    { key: 'A.36', title: 'Aeronautical knowledge test — Private Pilot', ref: '14 CFR §§ 61.35(a)(1), 61.103(d), and 61.105', template: 'I certify that {First name, MI, Last name} has received the required training in accordance with 14 CFR § 61.105. I have determined they are prepared for the {name of} knowledge test.', group: 'Checkride' },
    { key: 'A.37', title: 'Flight proficiency / practical test — Private Pilot', ref: '14 CFR §§ 61.103(f), 61.107(b), and 61.109', template: 'I certify that {First name, MI, Last name} has received the required training in accordance with 14 CFR §§ 61.107 and 61.109. I have determined they are prepared for the {name of} practical test.', group: 'Checkride' },
  ],
  ir: [
    { key: 'A.42', title: 'Aeronautical knowledge test — Instrument Rating', ref: '14 CFR §§ 61.35(a)(1) and 61.65(a) and (b)', template: 'I certify that {First name, MI, Last name} has received the required training of 14 CFR § 61.65(b). I have determined that they are prepared for the Instrument–airplane knowledge test.', group: 'Knowledge Test' },
    { key: 'A.1', title: 'Prerequisites for practical test', ref: '14 CFR § 61.39(a)(6)(i) and (ii)', template: 'I certify that {First name, MI, Last name} has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of {applicable certificate}.', group: 'Practical Test' },
    { key: 'A.2', title: 'Review of deficiencies identified on knowledge test', ref: '14 CFR § 61.39(a)(6)(iii)', template: 'I certify that {First name, MI, Last name} has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the {applicable} airman knowledge test.', group: 'Practical Test' },
    { key: 'A.44', title: 'Prerequisites for instrument practical test', ref: '14 CFR § 61.39(a)', template: 'I certify that {First name, MI, Last name} has received and logged the required flight time/training of 14 CFR § 61.39(a) in preparation for the practical test within 2 calendar months preceding the date of the test and has satisfactory knowledge of the subject areas in which they were shown to be deficient by the FAA Airman Knowledge Test Report. I have determined they are prepared for the Instrument–airplane practical test.', group: 'Practical Test' },
    { key: 'A.43', title: 'Flight proficiency / practical test — Instrument Rating', ref: '14 CFR § 61.65(a)(6)', template: 'I certify that {First name, MI, Last name} has received the required training of 14 CFR § 61.65(c) and (d). I have determined they are prepared for the Instrument–airplane practical test.', group: 'Practical Test' },
  ],
  cpl: [
    { key: 'A.38', title: 'Aeronautical knowledge test — Commercial Pilot', ref: '14 CFR §§ 61.35(a)(1), 61.123(c), and 61.125', template: 'I certify that {First name, MI, Last name} has received the required training in accordance with 14 CFR § 61.125. I have determined they are prepared for the {name of} knowledge test.', group: 'Knowledge Test' },
    { key: 'A.1', title: 'Prerequisites for practical test', ref: '14 CFR § 61.39(a)(6)(i) and (ii)', template: 'I certify that {First name, MI, Last name} has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of {applicable certificate}.', group: 'Practical Test' },
    { key: 'A.2', title: 'Review of deficiencies identified on knowledge test', ref: '14 CFR § 61.39(a)(6)(iii)', template: 'I certify that {First name, MI, Last name} has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the {applicable} airman knowledge test.', group: 'Practical Test' },
    { key: 'A.39', title: 'Flight proficiency / practical test — Commercial Pilot', ref: '14 CFR §§ 61.123(e), 61.127, and 61.129', template: 'I certify that {First name, MI, Last name} has received the required training in accordance with 14 CFR §§ 61.127 and 61.129. I have determined they are prepared for the {name of} practical test.', group: 'Practical Test' },
    { key: 'A.77', title: 'Retesting after failure of knowledge or practical test', ref: '14 CFR § 61.49', template: 'I certify that {First name, MI, Last name} has received the additional training required for retesting by 14 CFR § 61.49. I have determined that they are prepared for the {name of} {knowledge/practical} test.', group: 'Retesting' },
  ],
  cfi: [
    { key: 'A.45', title: 'Fundamentals of instructing knowledge test', ref: '14 CFR § 61.183(d)', template: 'I certify that {First name, MI, Last name} has received a home study course on the fundamentals of instructing from {name of course}. I have reviewed the course and determined it meets the requirements of 14 CFR § 61.185(a)(1).', group: 'Knowledge Tests' },
    { key: 'A.46', title: 'Flight instructor aeronautical knowledge test', ref: '14 CFR § 61.183(f)', template: 'I certify that {First name, MI, Last name} has received the required ground training of 14 CFR § 61.185. I have determined they are prepared for the flight instructor aeronautical knowledge test.', group: 'Knowledge Tests' },
    { key: 'A.49', title: 'Spin training', ref: '14 CFR § 61.183(i)(1)', template: 'I certify that {First name, MI, Last name} has received the required training in spin entry, spins, and spin recovery procedures in accordance with 14 CFR § 61.183(i)(1).', group: 'Flight Training' },
    { key: 'A.1', title: 'Prerequisites for practical test', ref: '14 CFR § 61.39(a)(6)(i) and (ii)', template: 'I certify that {First name, MI, Last name} has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of {applicable certificate}.', group: 'Practical Test' },
    { key: 'A.2', title: 'Review of deficiencies identified on knowledge test', ref: '14 CFR § 61.39(a)(6)(iii)', template: 'I certify that {First name, MI, Last name} has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the {applicable} airman knowledge test.', group: 'Practical Test' },
    { key: 'A.47', title: 'Flight instructor ground and flight proficiency / practical test', ref: '14 CFR § 61.183(g)', template: 'I certify that {First name, MI, Last name} has received the required ground and flight training of 14 CFR § 61.187. I have determined they are prepared for the {name of} flight instructor practical test.', group: 'Practical Test' },
  ],
  cfii: [
    { key: 'A.46', title: 'Flight instructor aeronautical knowledge test', ref: '14 CFR § 61.183(f)', template: 'I certify that {First name, MI, Last name} has received the required ground training of 14 CFR § 61.185. I have determined they are prepared for the flight instructor aeronautical knowledge test.', group: 'Knowledge Test' },
    { key: 'A.1', title: 'Prerequisites for practical test', ref: '14 CFR § 61.39(a)(6)(i) and (ii)', template: 'I certify that {First name, MI, Last name} has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of {applicable certificate}.', group: 'Practical Test' },
    { key: 'A.2', title: 'Review of deficiencies identified on knowledge test', ref: '14 CFR § 61.39(a)(6)(iii)', template: 'I certify that {First name, MI, Last name} has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the {applicable} airman knowledge test.', group: 'Practical Test' },
    { key: 'A.48', title: 'Flight instructor with instrument rating / practical test', ref: '14 CFR §§ 61.183(g) and 61.187(a) and (b)(7)', template: 'I certify that {First name, MI, Last name} has received the required ground and flight training of 14 CFR § 61.187(b)(7). I have determined they are prepared for the flight instructor with instrument rating practical test.', group: 'Practical Test' },
  ],
  mei: [
    { key: 'A.46', title: 'Flight instructor aeronautical knowledge test', ref: '14 CFR § 61.183(f)', template: 'I certify that {First name, MI, Last name} has received the required ground training of 14 CFR § 61.185. I have determined they are prepared for the flight instructor aeronautical knowledge test.', group: 'Knowledge Test' },
    { key: 'A.1', title: 'Prerequisites for practical test', ref: '14 CFR § 61.39(a)(6)(i) and (ii)', template: 'I certify that {First name, MI, Last name} has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of {applicable certificate}.', group: 'Practical Test' },
    { key: 'A.2', title: 'Review of deficiencies identified on knowledge test', ref: '14 CFR § 61.39(a)(6)(iii)', template: 'I certify that {First name, MI, Last name} has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the {applicable} airman knowledge test.', group: 'Practical Test' },
    { key: 'A.47', title: 'Flight instructor ground and flight proficiency / practical test', ref: '14 CFR § 61.183(g)', template: 'I certify that {First name, MI, Last name} has received the required ground and flight training of 14 CFR § 61.187. I have determined they are prepared for the {name of} flight instructor practical test.', group: 'Practical Test' },
  ],
};

const RATING_LABELS: Record<string, string> = {
  ppl: 'Private Pilot',
  ir: 'Instrument Rating',
  cpl: 'Commercial Pilot',
  cfi: 'CFI',
  cfii: 'CFII',
  mei: 'MEI',
};

function parseTemplate(template: string): { type: 'text' | 'field'; value: string }[] {
  const parts: { type: 'text' | 'field'; value: string }[] = [];
  const regex = /\{([^}]+)\}/g;
  let last = 0;
  let match;
  while ((match = regex.exec(template)) !== null) {
    if (match.index > last) parts.push({ type: 'text', value: template.slice(last, match.index) });
    parts.push({ type: 'field', value: match[1] });
    last = match.index + match[0].length;
  }
  if (last < template.length) parts.push({ type: 'text', value: template.slice(last) });
  return parts;
}

export default function EndorsementPrinter({ onClose, ratingCode = 'ppl' }: EndorsementPrinterProps) {
  const endorsements = ALL_ENDORSEMENTS[ratingCode] || ALL_ENDORSEMENTS['ppl'];
  const [step, setStep] = useState<'select' | 'fill'>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [cfiInfo, setCfiInfo] = useState({ name: '', cert: '', reDate: '', date: new Date().toISOString().split('T')[0] });

  // Lock body scroll
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const original = document.body.style.overflow;
    const originalPadding = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = original;
      document.body.style.paddingRight = originalPadding;
    };
  }, []);

  // Load CFI profile
  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('cfi_profile').select('*').eq('user_id', session.user.id).maybeSingle();
      if (data) setCfiInfo(prev => ({ ...prev, name: data.full_name || '', cert: data.cert_number || '', reDate: data.re_exp_date || '' }));
    };
    load();
  }, []);

  const toggleSelect = (key: string) => setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const handleFieldChange = (endorsementKey: string, fieldLabel: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [endorsementKey]: { ...(prev[endorsementKey] || {}), [fieldLabel]: value } }));
  };

  const selectedEndorsements = endorsements.filter(e => selected.includes(e.key));

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const endorsementHTML = selectedEndorsements.map(endorsement => {
      const parts = parseTemplate(endorsement.template);
      const values = fieldValues[endorsement.key] || {};
      const filledText = parts.map(p => p.type === 'text' ? p.value : (values[p.value] || `[${p.value}]`)).join('');
      const dateDisplay = cfiInfo.date
        ? new Date(cfiInfo.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '_______________';

      return `
        <div style="margin-bottom:36pt;page-break-inside:avoid;">
          <div style="margin-bottom:6pt;">
            <span style="font-weight:bold;font-size:10pt;">AC 61-65K ${endorsement.key}</span>
            <span style="color:#555;font-size:10pt;margin-left:8pt;">${endorsement.ref}</span>
          </div>
          <p style="margin:0 0 16pt 0;text-align:justify;font-size:11pt;line-height:1.6;">${filledText}</p>
          <div style="margin-top:20pt;border-top:1px solid #000;padding-top:12pt;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="width:50%;padding-right:24pt;padding-bottom:16pt;">
                  <div style="border-bottom:1px solid #000;height:24pt;margin-bottom:3pt;"></div>
                  <span style="font-size:9pt;color:#555;">Signature</span>
                </td>
                <td style="width:50%;padding-left:24pt;padding-bottom:16pt;">
                  <div style="font-size:11pt;font-weight:bold;height:24pt;display:flex;align-items:flex-end;padding-bottom:3pt;">${dateDisplay}</div>
                  <div style="border-bottom:1px solid #000;margin-bottom:3pt;"></div>
                  <span style="font-size:9pt;color:#555;">Date</span>
                </td>
              </tr>
              <tr>
                <td style="width:50%;padding-right:24pt;">
                  <div style="font-size:11pt;font-weight:bold;height:24pt;display:flex;align-items:flex-end;padding-bottom:3pt;">${cfiInfo.cert || '_______________'}</div>
                  <div style="border-bottom:1px solid #000;margin-bottom:3pt;"></div>
                  <span style="font-size:9pt;color:#555;">CFI #${cfiInfo.name ? ' — ' + cfiInfo.name : ''}</span>
                </td>
                <td style="width:50%;padding-left:24pt;">
                  <div style="font-size:11pt;font-weight:bold;height:24pt;display:flex;align-items:flex-end;padding-bottom:3pt;">${cfiInfo.reDate || '_______________'}</div>
                  <div style="border-bottom:1px solid #000;margin-bottom:3pt;"></div>
                  <span style="font-size:9pt;color:#555;">RE End Date / Exp. Date</span>
                </td>
              </tr>
            </table>
          </div>
        </div>`;
    }).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Endorsements</title><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;padding:1in;max-width:8.5in;margin:0 auto;color:#000;}@media print{body{padding:0.75in;}}</style></head><body>${endorsementHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script></body></html>`);
    printWindow.document.close();
  };

  // Group endorsements for display
  const groups = endorsements.reduce((acc, e) => {
    const g = e.group || 'General';
    if (!acc[g]) acc[g] = [];
    acc[g].push(e);
    return acc;
  }, {} as Record<string, EndorsementDef[]>);

  const hasGroups = Object.keys(groups).length > 1 || (Object.keys(groups).length === 1 && Object.keys(groups)[0] !== 'General');

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overscroll-none touch-none"
      onWheel={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
        style={{ height: '85vh', maxHeight: '720px', minHeight: '400px' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dde3ec] flex items-center justify-between bg-[#1a3a5c] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <Printer size={20} className="text-[#e8a020]" />
            <div>
              <h2 className="text-white font-bold text-sm">
                {step === 'select' ? 'Select Endorsements to Print' : 'Fill In Endorsements'}
              </h2>
              <p className="text-white/60 text-[10px]">
                {step === 'select'
                  ? `${selected.length} selected — ${RATING_LABELS[ratingCode] || 'Private Pilot'} (AC 61-65K)`
                  : `${selectedEndorsements.length} endorsement${selectedEndorsements.length !== 1 ? 's' : ''} — fill in fields then print`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Select Step */}
        {step === 'select' && (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2 min-h-0">
              {hasGroups ? (
                Object.entries(groups).map(([groupName, items]) => (
                  <div key={groupName}>
                    <div className="flex items-center gap-3 px-1 py-2">
                      <div className="flex-1 h-px bg-[#dde3ec]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#1a3a5c] bg-[#f0f4ff] px-3 py-1 rounded-full border border-[#1a3a5c]/20">
                        {groupName}
                      </span>
                      <div className="flex-1 h-px bg-[#dde3ec]" />
                    </div>
                    <div className="space-y-2">
                      {items.map(e => {
                        const isSelected = selected.includes(e.key);
                        return (
                          <button
                            key={e.key}
                            onClick={() => toggleSelect(e.key)}
                            className={cn(
                              "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                              isSelected ? "border-[#1a3a5c] bg-[#d4e8f5]" : "border-[#dde3ec] bg-white hover:border-[#1a3a5c] hover:bg-[#f8fafc]"
                            )}
                          >
                            <div className={cn("w-6 h-6 rounded border-2 flex items-center justify-center shrink-0", isSelected ? "bg-[#1a3a5c] border-[#1a3a5c]" : "bg-white border-[#dde3ec]")}>
                              {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black bg-[#1a3a5c] text-white px-1.5 py-0.5 rounded shrink-0">{e.key}</span>
                                <span className="text-sm font-bold text-[#1c2333] truncate">{e.title}</span>
                              </div>
                              <p className="text-[10px] text-[#6b7280] mt-0.5 font-mono">{e.ref}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                endorsements.map(e => {
                  const isSelected = selected.includes(e.key);
                  return (
                    <button
                      key={e.key}
                      onClick={() => toggleSelect(e.key)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                        isSelected ? "border-[#1a3a5c] bg-[#d4e8f5]" : "border-[#dde3ec] bg-white hover:border-[#1a3a5c] hover:bg-[#f8fafc]"
                      )}
                    >
                      <div className={cn("w-6 h-6 rounded border-2 flex items-center justify-center shrink-0", isSelected ? "bg-[#1a3a5c] border-[#1a3a5c]" : "bg-white border-[#dde3ec]")}>
                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black bg-[#1a3a5c] text-white px-1.5 py-0.5 rounded shrink-0">{e.key}</span>
                          <span className="text-sm font-bold text-[#1c2333] truncate">{e.title}</span>
                        </div>
                        <p className="text-[10px] text-[#6b7280] mt-0.5 font-mono">{e.ref}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="px-4 py-4 border-t border-[#dde3ec] flex gap-3 shrink-0 bg-[#f8fafc] rounded-b-2xl">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] text-sm font-bold hover:bg-[#f4f5f7] transition-all">
                Cancel
              </button>
              <button
                onClick={() => setStep('fill')}
                disabled={selected.length === 0}
                className="flex-[2] py-2.5 rounded-xl bg-[#1a3a5c] text-white text-sm font-bold hover:bg-[#2a5a8c] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Fill In {selected.length > 0 ? `${selected.length} ` : ''}Endorsement{selected.length !== 1 ? 's' : ''}
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Fill Step */}
        {step === 'fill' && (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6 min-h-0">
              {/* CFI Info */}
              <div className="bg-[#1a3a5c] rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 flex items-center gap-2">
                  <span className="text-white text-sm font-bold">CFI Information</span>
                  <span className="text-white/50 text-[10px]">Prints on every endorsement</span>
                </div>
                <div className="bg-white p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'CFI Name', key: 'name', placeholder: 'e.g. John J. Smith' },
                    { label: 'CFI Certificate #', key: 'cert', placeholder: 'e.g. 987654321CFI' },
                    { label: 'RE End Date / Exp. Date', key: 'reDate', placeholder: 'e.g. 12-31-2026' },
                    { label: 'Date of Endorsement', key: 'date', placeholder: '', type: 'date' },
                  ].map(field => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={cfiInfo[field.key as keyof typeof cfiInfo]}
                        onChange={e => setCfiInfo(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a3a5c] transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {selectedEndorsements.map(endorsement => {
                const parts = parseTemplate(endorsement.template);
                const values = fieldValues[endorsement.key] || {};
                const fields = Array.from(new Set(parts.filter(p => p.type === 'field').map(p => p.value)));
                return (
                  <div key={endorsement.key} className="bg-white rounded-xl border border-[#dde3ec] overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-[#1a3a5c] flex items-center gap-2">
                      <span className="text-[11px] font-black bg-white text-[#1a3a5c] px-1.5 py-0.5 rounded">{endorsement.key}</span>
                      <span className="text-white text-sm font-bold">{endorsement.title}</span>
                      <span className="text-white/50 text-[10px] font-mono ml-auto">{endorsement.ref}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {fields.map(field => (
                        <div key={field} className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">{field}</label>
                          <input
                            type="text"
                            value={values[field] || ''}
                            onChange={e => handleFieldChange(endorsement.key, field, e.target.value)}
                            placeholder={field}
                            className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a3a5c] focus:bg-[#d4e8f5] transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2">Preview</p>
                      <p className="text-[12px] leading-relaxed text-[#1c2333] bg-[#f8fafc] rounded-lg p-3 border border-[#dde3ec]">
                        {parts.map((part, pi) =>
                          part.type === 'text' ? (
                            <span key={pi}>{part.value}</span>
                          ) : (
                            <span key={pi} className={cn("font-bold rounded px-0.5", values[part.value] ? "text-[#1a3a5c] bg-[#d4e8f5]" : "text-[#c0392b] bg-[#fdecea]")}>
                              {values[part.value] || `[${part.value}]`}
                            </span>
                          )
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-4 border-t border-[#dde3ec] flex gap-3 shrink-0 bg-[#f8fafc] rounded-b-2xl">
              <button onClick={() => setStep('select')} className="flex-1 py-2.5 rounded-xl border border-[#dde3ec] bg-white text-[#6b7280] text-sm font-bold hover:bg-[#f4f5f7] transition-all">
                ← Back
              </button>
              <button onClick={handlePrint} className="flex-[2] py-2.5 rounded-xl bg-[#2d7a4f] text-white text-sm font-bold hover:bg-[#24633f] transition-all shadow-md flex items-center justify-center gap-2">
                <Printer size={16} />
                Print Endorsements
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
