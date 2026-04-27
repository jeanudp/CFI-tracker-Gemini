import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, User, Mail, Shield, AlertCircle, Loader2, ExternalLink, Check } from 'lucide-react';

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);

      const { data: sub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      setSubscription(sub);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    if (!subscription?.stripe_customer_id) {
      setError('No billing account found. You may not have an active subscription.');
      return;
    }
    setPortalLoading(true);
    try {
      const response = await fetch('/api/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: subscription.stripe_customer_id }),
      });
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/account`,
      });
      if (error) throw error;
      setPasswordSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    setDeleteLoading(true);
    try {
      const { data: students } = await supabase
        .from('students')
        .select('name')
        .eq('user_id', user.id);

      if (students) {
        const studentNames = students.map(s => s.name);
        for (const student of students) {
          await supabase.from('lessons').delete().eq('student_name', student.name);
          await supabase.from('endorsements').delete().eq('student_name', student.name);
          await supabase.from('manual_hours').delete().eq('student_name', student.name);
        }
        
        if (studentNames.length > 0) {
          await supabase.from('student_tests').delete().in('student_name', studentNames);
        }
      }

      // Delete user-centric data
      await supabase.from('cfi_hours').delete().eq('user_id', user.id);
      await supabase.from('cfi_profile').delete().eq('user_id', user.id);
      await supabase.from('solo_checklist').delete().eq('user_id', user.id);
      await supabase.from('saved_aircraft').delete().eq('user_id', user.id);
      await supabase.from('endorsements').delete().eq('user_id', user.id);
      await supabase.from('students').delete().eq('user_id', user.id);
      await supabase.from('user_subscriptions').delete().eq('user_id', user.id);

      // Delete the Auth user account permanently
      const deleteAuthResponse = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const deleteAuthData = await deleteAuthResponse.json();
      if (!deleteAuthResponse.ok || deleteAuthData.error) {
        throw new Error(deleteAuthData.error || 'Failed to delete authentication account');
      }

      await supabase.auth.signOut();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getPlanLabel = () => {
    if (!subscription) return 'Free';
    const labels: Record<string, string> = {
      free: 'Free — Private Pilot only',
      invite: 'Invite — Full Access',
      all_monthly: 'All Ratings — Monthly',
      all_annual: 'All Ratings — Annual',
    };
    return labels[subscription.plan] || subscription.plan;
  };

  const getStatusColor = () => {
    if (!subscription) return '#9ca3af';
    if (subscription.status === 'active' || subscription.status === 'trialing') return '#2d7a4f';
    if (subscription.status === 'past_due') return '#e8a020';
    return '#ef4444';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Header */}
      <header
        className="sticky top-0 z-20 px-6 h-16 border-b flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 2px 12px rgba(26,58,92,0.08)',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-bold transition-all hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--navy)' }}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
        <h1 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>My Account</h1>
        <div className="w-20" />
      </header>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-6">

        {error && (
          <div className="p-3 rounded-xl flex items-center gap-2 text-xs font-bold border"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
            <AlertCircle size={14} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto cursor-pointer">✕</button>
          </div>
        )}

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-color)', background: 'linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)' }}>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-white">{user?.user_metadata?.full_name || 'CFI'}</p>
              <p className="text-xs text-white/70">{user?.email}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <Mail size={15} style={{ color: 'var(--navy)' }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Email</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <User size={15} style={{ color: 'var(--navy)' }} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Password</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>••••••••</p>
              </div>
              {passwordSent ? (
                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#2d7a4f' }}>
                  <Check size={13} />
                  Email sent
                </div>
              ) : (
                <button
                  onClick={handlePasswordReset}
                  disabled={passwordLoading}
                  className="text-xs font-bold cursor-pointer hover:opacity-70 transition-all disabled:opacity-50"
                  style={{ color: 'var(--navy)' }}
                >
                  {passwordLoading ? 'Sending...' : 'Reset →'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Subscription</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <Shield size={15} style={{ color: 'var(--navy)' }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Current Plan</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{getPlanLabel()}</p>
                </div>
              </div>
              <span
                className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: `${getStatusColor()}15`, color: getStatusColor(), border: `1px solid ${getStatusColor()}30` }}
              >
                {subscription?.status || 'free'}
              </span>
            </div>

            {subscription?.trial_end && subscription?.status === 'trialing' && (
              <div className="p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.2)' }}>
                <AlertCircle size={14} style={{ color: '#e8a020' }} />
                <p className="text-xs font-bold" style={{ color: '#e8a020' }}>
                  Free trial ends {formatDate(subscription.trial_end)} — no charge until then
                </p>
              </div>
            )}

            {subscription?.current_period_end && subscription?.status !== 'trialing' && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <CreditCard size={15} style={{ color: 'var(--navy)' }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Next Billing Date</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(subscription.current_period_end)}</p>
                </div>
              </div>
            )}

            {subscription?.stripe_customer_id ? (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--navy)', color: 'white', boxShadow: '0 4px 12px rgba(26,58,92,0.3)' }}
              >
                {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                {portalLoading ? 'Opening...' : 'Manage Billing & Cancel →'}
              </button>
            ) : (
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>You are on the free plan. Upgrade to access all ratings.</p>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setTimeout(() => {
                      const event = new CustomEvent('openPaywall');
                      window.dispatchEvent(event);
                    }, 400);
                  }}
                  className="mt-2 text-xs font-bold cursor-pointer hover:opacity-70 transition-all"
                  style={{ color: 'var(--navy)' }}
                >
                  See Plans →
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(239,68,68,0.2)', boxShadow: '0 4px 16px rgba(239,68,68,0.06)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
            <h2 className="text-sm font-black" style={{ color: '#ef4444' }}>Danger Zone</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Deleting your account is permanent and cannot be undone. All students, lessons, endorsements and hours will be deleted immediately.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer hover:bg-red-50"
                style={{ borderColor: '#ef4444', color: '#ef4444', backgroundColor: 'transparent' }}
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold" style={{ color: '#ef4444' }}>Type DELETE to confirm:</p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full text-sm rounded-xl px-4 py-3 border-2 focus:outline-none font-mono tracking-widest text-center"
                  style={{ borderColor: '#ef4444', backgroundColor: 'var(--bg-tertiary)', color: '#ef4444' }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirm(''); }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : 'Delete Forever'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
