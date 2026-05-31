import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RATINGS } from '../constants';
import { ChevronRight, Plane, Cloud, Navigation, ClipboardList, Compass, Gauge, Lock, X, Check, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const PRICE_SINGLE = import.meta.env.VITE_STRIPE_PRICE_SINGLE;
const PRICE_ALL_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ALL_MONTHLY;
const PRICE_ALL_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ALL_ANNUAL;

export default function RatingSelection() {
  const [studentName, setStudentName] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingMeiSubType, setPendingMeiSubType] = useState('');
  const [pendingCplSubType, setPendingCplSubType] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('sb_selected_student') ||
      JSON.parse(localStorage.getItem('faa_student_info') || '{}').student || '';
    if (!saved) {
      navigate('/dashboard');
      return;
    }
    setStudentName(saved);
    fetchSubscription();
  }, [navigate]);

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoadingSub(false);
    }
  };

  const isRatingUnlocked = (code: string) => {
    if (!subscription) return code === 'ppl';
    if (subscription.plan === 'invite') return true;
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      return subscription.ratings_unlocked?.includes(code);
    }
    return code === 'ppl';
  };

  const handleSelectRating = (code: string) => {
    if (code === 'mei') {
      setPendingMeiSubType('mei');
      setPendingCplSubType('');
      return;
    }

    if (code === 'cpl') {
      setPendingCplSubType('cpl');
      setPendingMeiSubType('');
      return;
    }

    setPendingMeiSubType('');
    setPendingCplSubType('');

    const rating = (RATINGS as any)[code];
    if (!rating || !rating.groundPage) return;

    if (!isRatingUnlocked(code)) {
      setShowPaywall(true);
      return;
    }

    localStorage.setItem('selected_rating', JSON.stringify({ code, ...rating }));
    navigate('/lesson-type');
  };

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not logged in');

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout: ' + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const ratingIcons: Record<string, React.ReactNode> = {
    ppl: <Plane size={24} />,
    ir: <Cloud size={24} />,
    cpl: <Gauge size={24} />,
    cfi: <ClipboardList size={24} />,
    cfii: <Compass size={24} />,
    mei: <Navigation size={24} />,
  };

  const ratingColors: Record<string, string> = {
    ppl: 'bg-[#d4e8f5] text-[#1a3a5c] border-[#4a8ab8]',
    ir: 'bg-[#ede8f8] text-[#5b3fa0] border-[#5b3fa0]',
    cpl: 'bg-[#e4f5ec] text-[#2d7a4f] border-[#2d7a4f]',
    cfi: 'bg-[#fdf0e4] text-[#c05c10] border-[#c05c10]',
    cfii: 'bg-[#e0f5f2] text-[#1a7a6e] border-[#1a7a6e]',
    mei: 'bg-[#fdecea] text-[#c0392b] border-[#c0392b]',
  };

  const plans = [
    {
      id: 'all_monthly',
      priceId: PRICE_ALL_MONTHLY,
      name: 'All Ratings',
      price: '$9.99',
      period: 'per month',
      annual: null,
      description: 'Unlock every rating — best for active CFIs',
      features: ['All 6 ratings unlocked', 'IR, CPL, CFI, CFII, MEI', 'Full lesson tracking', 'Endorsements', 'Checkride readiness', 'Priority support'],
      color: '#1a3a5c',
      popular: true,
    },
    {
      id: 'all_annual',
      priceId: PRICE_ALL_ANNUAL,
      name: 'All Ratings Annual',
      price: '$99',
      period: 'per year',
      annual: 'Save $21 — 2 months free',
      description: 'Best value for committed flight instructors',
      features: ['Everything in All Ratings', 'Annual billing — best value', '2 months free vs monthly', 'Priority support'],
      color: '#2d7a4f',
      popular: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 sm:py-12 flex flex-col items-center">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#6b7280] mb-8 flex-wrap justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#2d7a4f] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <span>Student</span>
        </div>
        <ChevronRight size={14} className="text-[#dde3ec]" />
        <div className="flex items-center gap-1.5 text-[#1c2333] font-medium">
          <div className="w-5 h-5 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-[10px] font-bold">2</div>
          <span>Rating</span>
        </div>
        <ChevronRight size={14} className="text-[#dde3ec]" />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#f4f5f7] text-[#6b7280] flex items-center justify-center text-[10px] font-bold">3</div>
          <span>Ground / Flight</span>
        </div>
      </div>

      <div className="bg-white border border-[#dde3ec] rounded-full px-4 py-1.5 text-sm mb-8 flex items-center gap-2 shadow-sm">
        👤 Grading: <span className="font-bold text-[#1a3a5c]">{studentName}</span>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-[#1c2333] mb-2">Select a Rating</h1>
        <p className="text-sm text-[#6b7280]">Choose the certificate or rating you are working toward</p>
        {subscription?.status === 'trialing' && subscription?.trial_end && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(232,160,32,0.1)', color: '#e8a020', border: '1px solid rgba(232,160,32,0.3)' }}>
            <Zap size={12} />
            Free trial active — ends {new Date(subscription.trial_end).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {Object.entries(RATINGS).map(([code, rating]) => {
          const isComingSoon = !rating.groundPage;
          const unlocked = isRatingUnlocked(code);
          const locked = !unlocked && !isComingSoon;

          return (
            <React.Fragment key={code}>
              <motion.div
              key={code}
              whileHover={!isComingSoon ? { y: -3 } : {}}
              onClick={() => !isComingSoon && handleSelectRating(code)}
              className={cn(
                "bg-white rounded-2xl border-2 p-4 sm:p-6 text-center transition-all relative flex flex-col items-center gap-3",
                isComingSoon ? "opacity-50 cursor-default" : "cursor-pointer",
                locked ? "border-[#dde3ec] opacity-75" : "border-[#dde3ec] hover:shadow-xl",
                !locked && !isComingSoon && code === 'ppl' && "hover:border-[#2a5a8c]",
                !locked && !isComingSoon && code === 'ir' && "hover:border-[#5b3fa0]",
                !locked && !isComingSoon && code === 'cpl' && "hover:border-[#2d7a4f]"
              )}
              style={locked ? { backgroundColor: '#fafbfd' } : {}}
            >
              {isComingSoon && (
                <div className="absolute top-2 right-2 bg-[#fdf0d4] text-[#e8a020] text-[8px] font-bold px-2 py-0.5 rounded-full border border-[#f0c96a] uppercase tracking-wider">
                  Soon
                </div>
              )}

              {locked && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1a3a5c] flex items-center justify-center">
                  <Lock size={11} className="text-white" />
                </div>
              )}

              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                locked ? "bg-[#f0f4f8] text-[#9ca3af]" : (ratingColors as any)[code]
              )}>
                {locked ? <Lock size={24} className="text-[#9ca3af]" /> : ratingIcons[code]}
              </div>
              <div>
                <div className={cn("text-sm font-bold leading-tight", locked ? "text-[#9ca3af]" : "text-[#1c2333]")}>{rating.label}</div>
                <div className="text-[10px] text-[#6b7280] mt-1">{locked ? 'Upgrade to unlock' : rating.acs}</div>
              </div>
            </motion.div>
            {code === 'cpl' && pendingCplSubType === 'cpl' && (
              <div key="cpl-subtype-panel" className="col-span-full my-2 bg-white border border-[#dde3ec] rounded-2xl p-6 shadow-xl text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#1c2333]">ASEL or AMEL Add-On?</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPendingCplSubType(''); }}
                    className="p-1 hover:bg-[#f4f5f7] rounded-full transition-colors cursor-pointer"
                  >
                    <X size={16} className="text-[#6b7280]" />
                  </button>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rating = (RATINGS as any)['cpl'];
                      localStorage.setItem('selected_rating', JSON.stringify({ 
                        code: 'cpl', 
                        ...rating,
                        subType: 'asel'
                      }));
                      navigate('/lesson-type');
                    }}
                    className="flex-1 max-w-[160px] py-3 px-4 rounded-xl border border-[#dde3ec] text-[#2d7a4f] hover:bg-[#f8fafc] transition-all cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="text-sm font-black">ASEL</span>
                    <span className="text-[9px] font-medium text-[#6b7280]">Standard commercial</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rating = (RATINGS as any)['cpl_amel'];
                      localStorage.setItem('selected_rating', JSON.stringify({ 
                        code: 'cpl_amel', 
                        ...rating,
                        subType: 'amel'
                      }));
                      navigate('/lesson-type');
                    }}
                    className="flex-1 max-w-[160px] py-3 px-4 rounded-xl bg-[#2d7a4f] text-white shadow-lg hover:bg-[#235e3d] transition-all cursor-pointer flex flex-col items-center gap-1"
                  >
                    <span className="text-sm font-black">AMEL Add-On</span>
                    <span className="text-[9px] font-medium text-white/80">Already holds CPL ASEL</span>
                  </button>
                </div>
              </div>
            )}
            {code === 'mei' && pendingMeiSubType === 'mei' && (
              <div key="mei-subtype-panel" className="col-span-full my-2 bg-white border border-[#dde3ec] rounded-2xl p-6 shadow-xl text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#1c2333]">Initial or Add-On?</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPendingMeiSubType(''); }}
                    className="p-1 hover:bg-[#f4f5f7] rounded-full transition-colors cursor-pointer"
                  >
                    <X size={16} className="text-[#6b7280]" />
                  </button>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rating = (RATINGS as any)['mei'];
                      localStorage.setItem('selected_rating', JSON.stringify({ 
                        code: 'mei', 
                        ...rating,
                        subType: 'initial'
                      }));
                      navigate('/lesson-type');
                    }}
                    className="px-6 py-2 rounded-xl border border-[#dde3ec] text-[#1a3a5c] text-sm font-bold hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  >
                    Initial
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rating = (RATINGS as any)['mei'];
                      localStorage.setItem('selected_rating', JSON.stringify({ 
                        code: 'mei_addon', 
                        ...rating,
                        subType: 'addon'
                      }));
                      navigate('/lesson-type');
                    }}
                    className="px-6 py-2 rounded-xl bg-[#1a3a5c] text-white text-sm font-bold hover:bg-[#2a5a8c] transition-colors cursor-pointer"
                  >
                    Add-On
                  </button>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
      </div>

      <Link to="/dashboard" className="text-sm text-[#6b7280] hover:text-[#1c2333] transition-colors flex items-center gap-1.5">
        ← Back to Students
      </Link>

      {/* ============================================
          PAYWALL MODAL
          ============================================ */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 24px 80px rgba(26,58,92,0.25)' }}
            >
              {/* Header */}
              <div
                className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)' }}
              >
                <div>
                  <h2 className="text-2xl font-black text-white">Unlock All Ratings</h2>
                  <p className="text-sm text-white/70 mt-1">Start your 1 month free trial — cancel anytime</p>
                </div>
                <button
                  onClick={() => setShowPaywall(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Plans */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      className="relative rounded-2xl border-2 p-5 flex flex-col"
                      style={{
                        borderColor: plan.popular ? plan.color : '#dde3ec',
                        backgroundColor: plan.popular ? `${plan.color}08` : 'white',
                        boxShadow: plan.popular ? `0 4px 20px ${plan.color}20` : 'none',
                      }}
                    >
                      {plan.popular && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider"
                          style={{ backgroundColor: plan.color }}
                        >
                          Most Popular
                        </div>
                      )}

                      {plan.annual && (
                        <div
                          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider"
                          style={{ backgroundColor: plan.color }}
                        >
                          Best Value
                        </div>
                      )}

                      <div className="mb-3">
                        <h3 className="text-sm font-black text-[#1a2333]">{plan.name}</h3>
                        <p className="text-[10px] text-[#6b7280] mt-0.5">{plan.description}</p>
                      </div>

                      <div className="mb-4">
                        <span className="text-3xl font-black" style={{ color: plan.color }}>{plan.price}</span>
                        <span className="text-xs text-[#6b7280] ml-1">{plan.period}</span>
                        {plan.annual && (
                          <div className="text-[10px] font-bold mt-1" style={{ color: plan.color }}>{plan.annual}</div>
                        )}
                      </div>

                      <div className="space-y-1.5 mb-5 flex-1">
                        {plan.features.map(feature => (
                          <div key={feature} className="flex items-center gap-2 text-[11px] text-[#4b5563]">
                            <Check size={11} style={{ color: plan.color, flexShrink: 0 }} />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCheckout(plan.priceId)}
                        disabled={checkoutLoading === plan.priceId}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                        style={{
                          backgroundColor: plan.color,
                          boxShadow: `0 4px 12px ${plan.color}40`,
                        }}
                      >
                        {checkoutLoading === plan.priceId ? 'Loading...' : 'Start Free Trial →'}
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-center text-[10px] text-[#9ca3af]">
                  1 month free trial on all plans · No charge until trial ends · Cancel anytime
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
