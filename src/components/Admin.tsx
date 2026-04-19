import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Copy, Check, Plus, RefreshCw, Shield, Users, Key, LogOut } from 'lucide-react';

const ADMIN_EMAIL = 'jeanudp@gmail.com';

export default function Admin() {
  const [codes, setCodes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    if (session.user.email !== ADMIN_EMAIL) {
      navigate('/dashboard');
      return;
    }
    setUserEmail(session.user.email);
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codesRes, subsRes] = await Promise.all([
        supabase.from('invite_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false }),
      ]);
      setCodes(codesRes.data || []);
      setUsers(subsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const segments = [4, 4, 4];
      let newCode = '';
      let isUnique = false;
      const existing = codes.map(c => c.code);

      while (!isUnique) {
        const parts = segments.map(len =>
          Array.from({ length: len }, () =>
            chars[Math.floor(Math.random() * chars.length)]
          ).join('')
        );
        newCode = `61T-${parts.join('-')}`;
        if (!existing.includes(newCode)) isUnique = true;
      }

      const { error } = await supabase.from('invite_codes').insert({ code: newCode });
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const unusedCodes = codes.filter(c => !c.used);
  const usedCodes = codes.filter(c => c.used);
  const paidUsers = users.filter(u => u.plan !== 'free');
  const freeUsers = users.filter(u => u.plan === 'free');

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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black" style={{ color: 'var(--navy)' }}>61 Tracker Admin</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:bg-[var(--bg-tertiary)] cursor-pointer"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <LogOut size={13} />
            Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {error && (
          <div className="p-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, color: '#1a3a5c', icon: Users },
            { label: 'Paid / Trial', value: paidUsers.length, color: '#2d7a4f', icon: Shield },
            { label: 'Free Users', value: freeUsers.length, color: '#e8a020', icon: Users },
            { label: 'Unused Codes', value: unusedCodes.length, color: '#7c3aed', icon: Key },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 8px rgba(26,58,92,0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Invite Codes */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Invite Codes</h2>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{unusedCodes.length} unused · {usedCodes.length} used</p>
            </div>
            <button
              onClick={generateCode}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: '#1a3a5c', boxShadow: '0 4px 12px rgba(26,58,92,0.3)' }}
            >
              <Plus size={13} />
              {generating ? 'Generating...' : 'New Code'}
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {/* Unused codes first */}
              {unusedCodes.map(code => (
                <div key={code.id} className="px-6 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{code.code}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: 'rgba(45,122,79,0.1)', color: '#2d7a4f' }}>Available</span>
                  </div>
                  <button
                    onClick={() => copyCode(code.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-[var(--bg-secondary)] cursor-pointer"
                    style={{ color: copiedCode === code.code ? '#2d7a4f' : 'var(--navy)', backgroundColor: copiedCode === code.code ? 'rgba(45,122,79,0.1)' : 'var(--bg-tertiary)' }}
                  >
                    {copiedCode === code.code ? <Check size={12} /> : <Copy size={12} />}
                    {copiedCode === code.code ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
              {/* Used codes */}
              {usedCodes.map(code => (
                <div key={code.id} className="px-6 py-3 flex items-center justify-between opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{code.code}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Used</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{code.used_by}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', boxShadow: '0 4px 16px rgba(26,58,92,0.08)' }}
        >
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>All Users</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{users.length} total accounts</p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {users.map(user => {
                const planColors: Record<string, string> = {
                  free: '#9ca3af',
                  invite: '#7c3aed',
                  all_monthly: '#2d7a4f',
                  all_annual: '#2d7a4f',
                };
                const color = planColors[user.plan] || '#9ca3af';
                return (
                  <div key={user.id} className="px-6 py-3 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {user.plan}
                      </span>
                      <span
                        className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          backgroundColor: user.status === 'active' || user.status === 'trialing' ? 'rgba(45,122,79,0.1)' : 'rgba(239,68,68,0.1)',
                          color: user.status === 'active' || user.status === 'trialing' ? '#2d7a4f' : '#ef4444',
                        }}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
