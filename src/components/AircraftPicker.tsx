import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AIRCRAFT_MODELS, isAMEL } from '../constants/aircraft';
import { Plane, Plus, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AircraftValue {
  tailNumber: string;
  model: string;
  icao: string;
  aircraftClass: 'ASEL' | 'AMEL';
  complex: boolean;
}

interface AircraftPickerProps {
  value: AircraftValue;
  onChange: (val: AircraftValue) => void;
  accentColor?: string;
}

export default function AircraftPicker({
  value,
  onChange,
  accentColor = '#1a3a5c'
}: AircraftPickerProps) {
  // Helper state
  const [aircraftSearch, setAircraftSearch] = useState('');
  const [showAircraftDropdown, setShowAircraftDropdown] = useState(false);
  const [isAutoPopulated, setIsAutoPopulated] = useState(false);
  const [recentAircraft, setRecentAircraft] = useState<any[]>([]);
  const [showClassToggle, setShowClassToggle] = useState(false);
  const [showAddAircraftModal, setShowAddAircraftModal] = useState(false);

  // New aircraft modal fields
  const [newAircraftModel, setNewAircraftModel] = useState('');
  const [newAircraftIcao, setNewAircraftIcao] = useState('');
  const [newAircraftClass, setNewAircraftClass] = useState<'ASEL' | 'AMEL'>('ASEL');

  // Input focus tracking states
  const [isTailFocused, setIsTailFocused] = useState(false);
  const [isModelFocused, setIsModelFocused] = useState(false);
  const [isNewModelFocused, setIsNewModelFocused] = useState(false);
  const [isNewIcaoFocused, setIsNewIcaoFocused] = useState(false);

  // Fetch recent aircraft on mount
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('saved_aircraft')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (data && !error) {
          setRecentAircraft(data);
        }
      } catch (err) {
        console.error('Error fetching recent aircraft:', err);
      }
    };

    fetchRecent();
  }, []);

  // Debounced auto-populate query on tail number changes
  useEffect(() => {
    const lookupAircraft = async () => {
      if (!value.tailNumber || value.tailNumber.trim().length < 3) {
        setIsAutoPopulated(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('saved_aircraft')
          .select('aircraft_model, aircraft_icao, aircraft_class, complex')
          .eq('user_id', session.user.id)
          .eq('tail_number', value.tailNumber.toUpperCase().trim())
          .maybeSingle();

        if (data && !error) {
          onChange({
            tailNumber: value.tailNumber,
            model: data.aircraft_model || '',
            icao: data.aircraft_icao || '',
            aircraftClass: (data.aircraft_class as 'ASEL' | 'AMEL') || 'ASEL',
            complex: data.complex === true,
          });
          setIsAutoPopulated(true);
        } else {
          setIsAutoPopulated(false);
        }
      } catch (err) {
        console.error('Error looking up aircraft:', err);
        setIsAutoPopulated(false);
      }
    };

    const timer = setTimeout(lookupAircraft, 500);
    return () => clearTimeout(timer);
  }, [value.tailNumber]);

  // Handle saving custom aircraft from modal
  const handleSaveNewAircraft = async () => {
    if (!newAircraftModel.trim()) {
      alert('Please enter an aircraft model.');
      return;
    }

    const currentTail = value.tailNumber.toUpperCase().trim() || 'UNKNOWN';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('saved_aircraft')
        .upsert({
          user_id: session.user.id,
          tail_number: currentTail,
          aircraft_model: newAircraftModel.trim(),
          aircraft_icao: newAircraftIcao.trim(),
          aircraft_class: newAircraftClass,
          complex: value.complex,
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          use_count: 1
        }, { onConflict: 'user_id,tail_number' });

      if (error) throw error;

      onChange({
        ...value,
        model: newAircraftModel.trim(),
        icao: newAircraftIcao.trim(),
        aircraftClass: newAircraftClass as 'ASEL' | 'AMEL',
      });
      setIsAutoPopulated(true);
      setShowAddAircraftModal(false);
      
      // Refresh recent aircraft list
      const { data: recentData } = await supabase
        .from('saved_aircraft')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      if (recentData) setRecentAircraft(recentData);

      // Reset modal state
      setNewAircraftModel('');
      setNewAircraftIcao('');
      setNewAircraftClass('ASEL');
    } catch (err: any) {
      console.error('Error saving new aircraft:', err);
      alert('Failed to save aircraft: ' + err.message);
    }
  };

  return (
    <>
      {/* Recent Aircraft Pills */}
      {recentAircraft.length > 0 && (
        <div className="mb-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2 block">
            Recent Aircraft
          </label>
          <div className="flex flex-wrap gap-2">
            {recentAircraft.map((ac, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange({
                    tailNumber: ac.tail_number || '',
                    model: ac.aircraft_model || '',
                    icao: ac.aircraft_icao || '',
                    aircraftClass: (ac.aircraft_class as 'ASEL' | 'AMEL') || 'ASEL',
                    complex: ac.complex === true,
                  });
                  setIsAutoPopulated(true);
                }}
                className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#f4f5f7] border border-[#dde3ec] hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer"
                style={{
                  color: accentColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dde3ec';
                }}
              >
                <Plane size={10} className="opacity-50" />
                {ac.tail_number} — {ac.aircraft_model}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Tail Number (N-Number) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
            Tail Number (N-Number)
          </label>
          <input
            type="text"
            value={value.tailNumber}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              onChange({
                ...value,
                tailNumber: val
              });
            }}
            onFocus={() => setIsTailFocused(true)}
            onBlur={() => setIsTailFocused(false)}
            placeholder="N12345"
            className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none transition-all placeholder:text-[#94a3b8] text-[#1c2333]"
            style={{
              borderColor: isTailFocused ? accentColor : '#dde3ec',
              boxShadow: isTailFocused ? `0 0 0 2px ${accentColor}20` : 'none',
            }}
          />
        </div>

        {/* Aircraft Model */}
        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
              Aircraft Model
            </label>
            {isAutoPopulated && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-[#2d7a4f] bg-[#e4f5ec] px-1.5 py-0.5 rounded animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={10} />
                AUTO-FILLED
              </div>
            )}
          </div>
          <input
            type="text"
            value={value.model || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                ...value,
                model: val
              });
              setAircraftSearch(val);
              setShowAircraftDropdown(true);
              setIsAutoPopulated(false); // Reset if user typing manually
            }}
            onFocus={() => {
              setIsModelFocused(true);
              setShowAircraftDropdown(true);
            }}
            onBlur={() => {
              setIsModelFocused(false);
              setTimeout(() => setShowAircraftDropdown(false), 150);
            }}
            placeholder="e.g. C-172, Cessna"
            className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none transition-all placeholder:text-[#94a3b8] text-[#1c2333]"
            style={{
              borderColor: isModelFocused ? accentColor : '#dde3ec',
              boxShadow: isModelFocused ? `0 0 0 2px ${accentColor}20` : 'none',
            }}
          />
          
          {/* Autocomplete Dropdown */}
          {showAircraftDropdown && aircraftSearch && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-[#dde3ec] rounded-lg shadow-lg max-h-60 overflow-auto">
              {(() => {
                const filtered = AIRCRAFT_MODELS.filter(m => 
                  m.toLowerCase().includes(aircraftSearch.toLowerCase())
                );
                
                return (
                  <>
                    {filtered.slice(0, 50).map((model, idx) => {
                      return (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#f4f5f7] cursor-pointer text-[#1c2333]"
                          onClick={() => {
                            const detectedClass = isAMEL(model) ? 'AMEL' : 'ASEL';
                            onChange({
                              ...value,
                              model: model,
                              aircraftClass: detectedClass,
                            });
                            setAircraftSearch('');
                            setShowAircraftDropdown(false);
                            setIsAutoPopulated(false);
                          }}
                        >
                          {model}
                        </button>
                      );
                    })}
                    
                    {filtered.length === 0 && (
                      <div className="px-3 py-2 text-sm text-[#6b7280] italic">
                        No matching models found
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setShowAddAircraftModal(true)}
                      className="w-full px-3 py-2 flex items-center gap-2 text-sm font-bold border-t border-[#dde3ec] hover:bg-[#f4f5f7] cursor-pointer sticky bottom-0 bg-white"
                      style={{ color: accentColor }}
                    >
                      <Plus size={14} style={{ color: accentColor }} />
                      Add Aircraft Not in List
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Class Tag, Class Switch, and Complex Checkbox */}
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest text-white transition-colors"
            style={{ backgroundColor: value.aircraftClass === 'AMEL' ? '#7c3aed' : accentColor }}
          >
            {value.aircraftClass || 'ASEL'}
          </span>
          <button
            type="button"
            onClick={() => setShowClassToggle(!showClassToggle)}
            className="text-[10px] text-[#6b7280] hover:underline transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            Change Class
          </button>
          
          {showClassToggle && (
            <div className="flex gap-1 animate-in fade-in slide-in-from-left-1">
              {['ASEL', 'AMEL'].map(cls => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    onChange({
                      ...value,
                      aircraftClass: cls as 'ASEL' | 'AMEL'
                    });
                    setShowClassToggle(false);
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer"
                  style={{
                    backgroundColor: value.aircraftClass === cls ? accentColor : 'white',
                    color: value.aircraftClass === cls ? 'white' : '#6b7280',
                    borderColor: value.aircraftClass === cls ? accentColor : '#dde3ec'
                  }}
                >
                  {cls}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.complex}
            onChange={(e) => {
              onChange({
                ...value,
                complex: e.target.checked
              });
            }}
            className="w-4 h-4 rounded text-white"
            style={{
              accentColor: accentColor
            }}
          />
          <span 
            className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            Complex aircraft
          </span>
        </label>
      </div>

      {/* Add Aircraft Modal inside AnimatePresence */}
      <AnimatePresence>
        {showAddAircraftModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl border border-[#dde3ec] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[#dde3ec] flex items-center justify-between bg-[#f8fafc]">
                <h3 className="text-lg font-bold" style={{ color: accentColor }}>
                  Add New Aircraft
                </h3>
                <button 
                  type="button"
                  onClick={() => setShowAddAircraftModal(false)}
                  className="p-2 hover:bg-[#dde3ec] rounded-full transition-colors"
                >
                  <X size={20} className="text-[#6b7280]" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                    Aircraft Model
                  </label>
                  <input
                    type="text"
                    value={newAircraftModel}
                    onChange={(e) => setNewAircraftModel(e.target.value)}
                    placeholder="e.g. C-172, Cessna"
                    className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none transition-all placeholder:text-[#94a3b8] text-[#1c2333]"
                    onFocus={() => setIsNewModelFocused(true)}
                    onBlur={() => setIsNewModelFocused(false)}
                    style={{
                      borderColor: isNewModelFocused ? accentColor : '#dde3ec',
                      boxShadow: isNewModelFocused ? `0 0 0 2px ${accentColor}20` : 'none',
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                    ICAO Code
                  </label>
                  <input
                    type="text"
                    value={newAircraftIcao}
                    onChange={(e) => setNewAircraftIcao(e.target.value)}
                    placeholder="e.g. C172"
                    className="w-full text-sm border border-[#dde3ec] rounded-lg px-3 py-2 focus:outline-none transition-all placeholder:text-[#94a3b8] text-[#1c2333]"
                    onFocus={() => setIsNewIcaoFocused(true)}
                    onBlur={() => setIsNewIcaoFocused(false)}
                    style={{
                      borderColor: isNewIcaoFocused ? accentColor : '#dde3ec',
                      boxShadow: isNewIcaoFocused ? `0 0 0 2px ${accentColor}20` : 'none',
                    }}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">
                    Aircraft Class
                  </label>
                  <div className="flex gap-2">
                    {['ASEL', 'AMEL'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setNewAircraftClass(cls as 'ASEL' | 'AMEL')}
                        className="px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer"
                        style={{
                          backgroundColor: newAircraftClass === cls ? accentColor : 'white',
                          color: newAircraftClass === cls ? 'white' : '#6b7280',
                          borderColor: newAircraftClass === cls ? accentColor : '#dde3ec'
                        }}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#dde3ec] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddAircraftModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#6b7280] hover:bg-[#dde3ec] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewAircraft}
                  className="px-6 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-md cursor-pointer"
                  style={{
                    backgroundColor: accentColor,
                  }}
                >
                  Save Aircraft
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
