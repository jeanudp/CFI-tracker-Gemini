import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Check, Loader2, X, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface OnboardingModalProps {
  user: any;
}

export default function OnboardingModal({ user }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ 
    full_name: '', 
    cert_number: '', 
    re_exp_date: '' 
  });
  const navigate = useNavigate();

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        full_name: profileDraft.full_name,
        cert_number: profileDraft.cert_number,
        re_exp_date: profileDraft.re_exp_date,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('cfi_profile')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      setStep(2);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('61t_onboarded', 'true');
    navigate('/dashboard');
  };

  const handleStartGuide = () => {
    localStorage.setItem('61t_onboarded', 'true');
    localStorage.setItem('61t_start_guide', 'true');
    window.dispatchEvent(new Event('storage'));
    navigate('/dashboard');
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#dde3ec]"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-[#1a3a5c] rounded-xl flex items-center justify-center shadow-lg shadow-[#1a3a5c]/20">
                    <Plane className="text-white rotate-[-45deg]" size={20} />
                  </div>
                  <div className="text-xl font-black tracking-tight text-[#1a3a5c]">
                    61 Tracker
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">Welcome to 61 Tracker</h1>
                <p className="text-sm text-[#64748b]">Your professional flight training logbook — let's get you set up.</p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { label: 'Full Name', key: 'full_name' as const, placeholder: 'e.g. John J. Smith' },
                  { label: 'CFI Certificate #', key: 'cert_number' as const, placeholder: 'e.g. 987654321CFI' },
                  { label: 'RE End Date / Exp. Date', key: 're_exp_date' as const, placeholder: 'e.g. 12-31-2026' },
                ].map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280]">{field.label}</label>
                    <input
                      type="text"
                      value={profileDraft[field.key]}
                      onChange={e => setProfileDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full text-sm border border-[#dde3ec] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] transition-all bg-[#f8fafc] hover:bg-white focus:bg-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full py-4 bg-[#1a3a5c] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#1a3a5c]/20 hover:bg-[#2a5a8c] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>Get Started <span className="text-lg">→</span></>}
                </button>
                <button 
                  onClick={() => setStep(2)}
                  className="text-[11px] font-bold text-[#94a3b8] hover:text-[#1a3a5c] transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
                  <Check className="text-[#059669]" size={32} strokeWidth={3} />
                </div>
                <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">You're all set!</h1>
                <p className="text-sm text-[#64748b]">Your profile has been created.</p>
              </div>

              <div className="bg-[#f8fafc] border border-[#dde3ec] rounded-2xl p-6 mb-8 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl border border-[#dde3ec] flex items-center justify-center shrink-0">
                  <Plane size={20} className="text-[#1a3a5c]" />
                </div>
                <div>
                  <p className="text-sm text-[#1a3a5c] leading-relaxed font-medium">
                    Your first step is adding a student. Head to the Dashboard to add your first student and choose their rating.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleFinish}
                  className="w-full py-4 bg-[#1a3a5c] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#1a3a5c]/20 hover:bg-[#2a5a8c] transition-all active:scale-[0.98]"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleStartGuide}
                  className="w-full py-4 bg-white text-[#64748b] border border-[#dde3ec] rounded-2xl font-bold text-sm hover:bg-[#f8fafc] transition-all active:scale-[0.98]"
                >
                  Guide me through the app
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
