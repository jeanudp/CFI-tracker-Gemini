import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { Plane, MapPin, Plus, X, Loader2, Copy, RefreshCw, AlertTriangle, CheckCircle, Info, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface EndorsementAdvisorProps {
  studentName?: string;
  ratingCode?: string;
}

export default function EndorsementAdvisor({ studentName, ratingCode = 'ppl' }: EndorsementAdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [flightType, setFlightType] = useState('Traffic Pattern Only');
  const [studentExperience, setStudentExperience] = useState('not soloed');
  const [estimatedDistance, setEstimatedDistance] = useState('');
  
  const [context, setContext] = useState({
    firstTimeDestination: false,
    nightFlight: false,
    classBAirspace: false,
    valid90DaySolo: false,
    passedKnowledgeTest: false,
    retestAfterDisapproval: false,
    needsXcPlanningReview: false,
    firstTimeTowered: false
  });

  const flightTypes = [
    "Traffic Pattern Only",
    "Local Solo (within 25NM)",
    "Cross-Country Solo (>25NM)",
    "Repeated Cross-Country (within 50NM)",
    "Night Solo",
    "Class B Airspace Transit",
    "Checkride Preparation Flight",
    "First Ever Solo Flight"
  ];

  const experienceLevels = [
    { id: 'not soloed', label: 'Pre-Solo (never soloed)' },
    { id: 'soloed, 90-day current', label: 'Soloed (90-day current)' },
    { id: 'soloed, 90-day expired', label: 'Soloed (90-day expired)' },
    { id: 'preparing for checkride', label: 'Preparing for Checkride' }
  ];

  const presets = [
    {
      label: 'First Solo',
      data: {
        flightType: 'First Ever Solo Flight',
        studentExperience: 'not soloed',
        context: { firstTimeTowered: true }
      }
    },
    {
      label: 'XC Solo',
      data: {
        flightType: 'Cross-Country Solo (>25NM)',
        studentExperience: 'soloed, 90-day current',
        context: { needsXcPlanningReview: true, firstTimeDestination: true }
      }
    },
    {
      label: 'Checkride Prep',
      data: {
        flightType: 'Checkride Preparation Flight',
        studentExperience: 'preparing for checkride',
        context: { passedKnowledgeTest: true }
      }
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setFlightType(preset.data.flightType);
    setStudentExperience(preset.data.studentExperience);
    setContext(prev => ({ ...prev, ...preset.data.context }));
  };

  const addWaypoint = () => {
    if (waypoints.length < 3) {
      setWaypoints([...waypoints, '']);
    }
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const updateWaypoint = (index: number, val: string) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = val.toUpperCase().slice(0, 4);
    setWaypoints(newWaypoints);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        As an expert FAA flight instructor advisor specializing in AC 61-65K, analyze the following flight details and provide a structured endorsement checklist.
        
        STUDENT NAME: ${studentName || 'Unknown'}
        RATING: ${ratingCode.toUpperCase()}
        
        FLIGHT DETAILS:
        - Departure: ${departure || 'KRDM'}
        - Destination: ${destination || 'KPDX'}
        - Waypoints: ${waypoints.join(', ') || 'None'}
        - Flight Type: ${flightType}
        - Student Experience: ${experienceLevels.find(e => e.id === studentExperience)?.label}
        - Estimated Distance: ${estimatedDistance || 'N/A'} NM
        
        CONTEXTUAL FACTORS:
        - First time to this destination: ${context.firstTimeDestination ? 'Yes' : 'No'}
        - Night flight: ${context.nightFlight ? 'Yes' : 'No'}
        - Class B airspace: ${context.classBAirspace ? 'Yes' : 'No'}
        - Valid 90-day solo endorsement: ${context.valid90DaySolo ? 'Yes' : 'No'}
        - Passed FAA knowledge test: ${context.passedKnowledgeTest ? 'Yes' : 'No'}
        - Retest after disapproval: ${context.retestAfterDisapproval ? 'Yes' : 'No'}
        - Needs XC planning review: ${context.needsXcPlanningReview ? 'Yes' : 'No'}
        - First time to towered airport: ${context.firstTimeTowered ? 'Yes' : 'No'}

        Please provide the response in the following Markdown format:
        
        ### Required Endorsements
        (List specific AC 61-65K endorsement numbers and titles, e.g., A.1, A.2, A.3, etc. with brief explanation of why)
        
        ### Warnings and Reminders
        (Important safety or regulatory warnings specific to this flight)
        
        ### Not Required for This Flight
        (Endorsements that might be thought of but are NOT needed for this specific scenario)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setResult(response.text || 'No response generated.');
    } catch (err: any) {
      console.error('AI Error:', err);
      setError(err.message || 'Failed to generate endorsement advice.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5c] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Plane size={20} className="text-[#e8a020]" />
            </div>
            <div>
              <h3 className="text-white font-bold">Endorsement Advisor</h3>
              <p className="text-white/60 text-[10px] uppercase tracking-widest">AC 61-65K Compliance Engine</p>
            </div>
          </div>
          <div className="flex gap-2">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-full transition-all border border-white/10"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Row 1: Airports */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest ml-1">Departure</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="KRDM"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8fafc] border border-[#dde3ec] rounded-xl text-sm focus:outline-none focus:border-[#1a3a5c] transition-all font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest ml-1">Destination</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="KPDX"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f8fafc] border border-[#dde3ec] rounded-xl text-sm focus:outline-none focus:border-[#1a3a5c] transition-all font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest ml-1">Waypoints</label>
              <div className="flex flex-wrap gap-2">
                {waypoints.map((wp, idx) => (
                  <div key={idx} className="relative flex items-center">
                    <input
                      type="text"
                      value={wp}
                      onChange={(e) => updateWaypoint(idx, e.target.value)}
                      placeholder="WP"
                      className="w-16 px-2 py-2 bg-[#f8fafc] border border-[#dde3ec] rounded-lg text-xs focus:outline-none focus:border-[#1a3a5c] transition-all font-mono"
                    />
                    <button 
                      onClick={() => removeWaypoint(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-all"
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
                {waypoints.length < 3 && (
                  <button
                    onClick={addWaypoint}
                    className="flex items-center justify-center w-10 h-9 border-2 border-dashed border-[#dde3ec] rounded-xl text-[#94a3b8] hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-all"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Flight Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest ml-1">Flight Type</label>
              <div className="relative">
                <select
                  value={flightType}
                  onChange={(e) => setFlightType(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 bg-[#f8fafc] border border-[#dde3ec] rounded-xl text-sm focus:outline-none focus:border-[#1a3a5c] transition-all cursor-pointer"
                >
                  {flightTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest ml-1">Student Experience</label>
                <div className="relative">
                  <select
                    value={studentExperience}
                    onChange={(e) => setStudentExperience(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-[#f8fafc] border border-[#dde3ec] rounded-xl text-sm focus:outline-none focus:border-[#1a3a5c] transition-all cursor-pointer"
                  >
                    {experienceLevels.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest ml-1">Est. Distance (NM)</label>
                <input
                  type="number"
                  value={estimatedDistance}
                  onChange={(e) => setEstimatedDistance(e.target.value)}
                  placeholder="e.g. 55"
                  className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#dde3ec] rounded-xl text-sm focus:outline-none focus:border-[#1a3a5c] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Context Checkboxes */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-[#1a3a5c] uppercase tracking-[0.2em] border-b border-[#f1f5f9] pb-2">Contextual Factors</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'firstTimeDestination', label: 'First time to this destination' },
                { id: 'nightFlight', label: 'Night flight' },
                { id: 'classBAirspace', label: 'Class B airspace' },
                { id: 'valid90DaySolo', label: 'Valid 90-day solo endorsement' },
                { id: 'passedKnowledgeTest', label: 'Passed FAA knowledge test' },
                { id: 'retestAfterDisapproval', label: 'Retest after disapproval' },
                { id: 'needsXcPlanningReview', label: 'Needs XC planning review' },
                { id: 'firstTimeTowered', label: 'First time to towered airport' }
              ].map(item => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={(context as any)[item.id]}
                      onChange={(e) => setContext({ ...context, [item.id]: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-[#dde3ec] rounded-md bg-white peer-checked:bg-[#1a3a5c] peer-checked:border-[#1a3a5c] transition-all" />
                    <CheckCircle size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-all" />
                  </div>
                  <span className="text-xs text-[#64748b] group-hover:text-[#1a3a5c] transition-all leading-tight">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-8 py-3 bg-[#1a3a5c] text-white font-bold rounded-xl hover:bg-[#2a5a8c] disabled:opacity-50 transition-all flex items-center gap-3 shadow-lg shadow-[#1a3a5c]/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              {loading ? 'Analyzing Compliance...' : 'Generate Endorsement Advice'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#f8fafc] px-6 py-4 border-b border-[#dde3ec] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-[#2d7a4f]" />
              <h4 className="text-sm font-bold text-[#1a3a5c]">Analysis Results</h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="p-2 text-[#64748b] hover:text-[#1a3a5c] hover:bg-white rounded-lg transition-all"
                title="Copy All"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => setResult(null)}
                className="p-2 text-[#64748b] hover:text-[#1a3a5c] hover:bg-white rounded-lg transition-all"
                title="New Analysis"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="p-8">
            <div className="prose prose-sm max-w-none prose-headings:text-[#1a3a5c] prose-headings:font-black prose-p:text-[#64748b] prose-li:text-[#64748b]">
              <Markdown>{result}</Markdown>
            </div>
          </div>
          <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#dde3ec] flex items-center gap-3">
            <Info size={14} className="text-[#1a3a5c]" />
            <p className="text-[10px] text-[#64748b] leading-relaxed">
              This advisor is for informational purposes only. Always verify endorsement requirements directly in AC 61-65K and 14 CFR Part 61.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
