import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Moon, Sun } from 'lucide-react';


export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [role, setRole] = useState<'cfi' | 'student'>('cfi');
  const [isResetMode, setIsResetMode] = useState(false);
  
  // Choice gating & OAuth reconciliation states
  const [roleChosen, setRoleChosen] = useState(false);
  const [showOauthRolePrompt, setShowOauthRolePrompt] = useState(false);
  const [oauthSession, setOauthSession] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Normal session redirect check: bypass when OAuth return parameter is present!
  useEffect(() => {
    const isVerified = searchParams.get('verified') === '1';
    const isOAuthReturn = searchParams.get('oauth') === 'google';
    if (isVerified || isOAuthReturn) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userMetadata = session.user?.user_metadata || {};
        if (userMetadata.account_type === 'student') {
          navigate('/my-progress');
        } else {
          navigate('/dashboard');
        }
      }
    });
  }, [navigate, searchParams]);

  // Google OAuth return reconciliation effect
  useEffect(() => {
    const isOAuthReturn = searchParams.get('oauth') === 'google';
    if (!isOAuthReturn) return;

    let mounted = true;

    const performReconciliation = async () => {
      setLoading(true);
      setError(null);
      try {
        // Retrieve standard session, retry slightly in case parsing code isn't fully completed
        let session = null;
        for (let i = 0; i < 5; i++) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            session = data.session;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        if (!mounted) return;

        if (!session) {
          setError('No valid session found after Google Sign-In.');
          setLoading(false);
          return;
        }

        const user = session.user;

        // 1. Determine whether this is a brand‑new user by checking for an existing row in user_subscriptions.
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('id, plan')
          .eq('user_id', user.id)
          .maybeSingle();

        const isBrandNew = !subData;

        // 2. Resolve the account type:
        const pendingClaim = localStorage.getItem('pending_student_claim');
        const storedMarker = localStorage.getItem('oauth_role_marker');
        const hasStudentMetadata = user.user_metadata?.account_type === 'student';

        let resolvedType: 'student' | 'cfi' | null = null;

        if (pendingClaim || storedMarker === 'student' || hasStudentMetadata) {
          resolvedType = 'student';
        } else if (storedMarker === 'cfi' || (!isBrandNew && !hasStudentMetadata)) {
          resolvedType = 'cfi';
        }

        // If the user is brand‑new AND the type is still undetermined (no claim, marker is "undetermined"),
        // show the one‑time role prompt and wait — do not provision or route yet.
        if (isBrandNew && !resolvedType) {
          setOauthSession(session);
          setShowOauthRolePrompt(true);
          setLoading(false);
          return;
        }

        const activeType = resolvedType || 'cfi';
        await handleProvisionAndRoute(session, activeType, isBrandNew);

      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'An error occurred during account routing.');
          setLoading(false);
        }
      }
    };

    performReconciliation();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleProvisionAndRoute = async (session: any, resolvedType: 'student' | 'cfi', isBrandNew: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const user = session.user;
      const emailVal = user.email || '';

      // Update auth metadata to store the resolved account type permanently
      if (resolvedType === 'student') {
        const { error: updateMetaError } = await supabase.auth.updateUser({
          data: { account_type: 'student' }
        });
        if (updateMetaError) {
          console.error('Error updating user metadata to student:', updateMetaError);
        }
      }

      // If brand-new, insert standard free-plan row
      if (isBrandNew) {
        const insertPayload: any = {
          user_id: user.id,
          email: emailVal,
          plan: 'free',
          ratings_unlocked: ['ppl'],
          status: 'active'
        };
        if (resolvedType === 'student') {
          insertPayload.account_type = 'student';
        }
        const { error: subInsertError } = await supabase
          .from('user_subscriptions')
          .insert(insertPayload);
        if (subInsertError) {
          console.error('Error inserting free subscription:', subInsertError);
        }
      }

      // Clear the markers
      localStorage.removeItem('oauth_role_marker');

      // Routing & Integration APIs
      if (resolvedType === 'student') {
        try {
          const response = await fetch('/api/set-student-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Set student account failed:', errorText);
          }
        } catch (err) {
          console.error('Error setting student account:', err);
        }

        const pendingClaim = localStorage.getItem('pending_student_claim');
        if (pendingClaim) {
          try {
            const response = await fetch('/api/student-portal', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                token: pendingClaim,
                action: 'claim'
              })
            });
            if (response.ok) {
              localStorage.removeItem('pending_student_claim');
            } else {
              const errorText = await response.text();
              console.error('Claim request failed:', errorText);
            }
          } catch (err) {
            console.error('Error claiming student token:', err);
          }
        }

        window.location.href = '/my-progress';
      } else {
        window.location.href = '/dashboard';
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during account provisioning.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const isVerified = searchParams.get('verified') === '1';
    if (isVerified) {
      setIsLogin(true);
      setLoading(true);
      const handleVerification = async () => {
        try {
          await supabase.auth.signOut();
          setSuccess('Your email is confirmed! Please sign in to access your account.');
        } catch (err: any) {
          console.error('Error signing out:', err);
        } finally {
          setLoading(false);
        }
      };
      handleVerification();
    }
  }, [searchParams]);

  useEffect(() => {
    const claim = searchParams.get('claim');
    if (claim) {
      localStorage.setItem('pending_student_claim', claim);
    }
  }, [searchParams]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email address to reset your password.');
      return;
    }

    setLoading(true);

    try {
      const redirectToUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectToUrl,
      });

      if (resetError) throw resetError;

      setSuccess("If an account exists for that email, we've sent a password reset link. Check your inbox.");
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    const pendingClaim = localStorage.getItem('pending_student_claim');
    
    let roleMarker = 'undetermined';
    if (!isLogin) {
      if (pendingClaim || role === 'student') {
        roleMarker = 'student';
      } else if (role === 'cfi') {
        roleMarker = 'cfi';
      }
    }
    
    localStorage.setItem('oauth_role_marker', roleMarker);
    setLoading(true);

    try {
      const redirectToUrl = `${window.location.origin}/auth?oauth=google`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectToUrl,
        }
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google Sign-In.');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        const tokenToClaim = localStorage.getItem('pending_student_claim');
        if (tokenToClaim && signInData?.session) {
          try {
            const response = await fetch('/api/student-portal', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${signInData.session.access_token}`
              },
              body: JSON.stringify({
                token: tokenToClaim,
                action: 'claim'
              })
            });

            if (response.ok) {
              localStorage.removeItem('pending_student_claim');
            } else {
              const errorText = await response.text();
              console.error('Claim request failed:', errorText);
            }
          } catch (err) {
            console.error('Error claiming student token:', err);
          }
          window.location.href = '/my-progress';
        } else {
          const userMetadata = signInData?.user?.user_metadata || signInData?.session?.user?.user_metadata;
          if (userMetadata?.account_type === 'student' && signInData?.session) {
            try {
              const response = await fetch('/api/set-student-account', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${signInData.session.access_token}`
                }
              });
              if (!response.ok) {
                const errorText = await response.text();
                console.error('Set student account failed:', errorText);
              }
            } catch (err) {
              console.error('Error setting student account:', err);
            }
            window.location.href = '/my-progress';
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        const pendingClaim = localStorage.getItem('pending_student_claim');
        const redirectUrl = `${window.location.origin}/auth?verified=1`;
        const isStudentSignup = role === 'student' || pendingClaim;
        const signUpDataOptions = isStudentSignup
          ? { data: { full_name: fullName, account_type: 'student' }, emailRedirectTo: redirectUrl }
          : { data: { full_name: fullName }, emailRedirectTo: redirectUrl };

        // Create the account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: signUpDataOptions,
        });
        if (signUpError) throw signUpError;

        const { user } = signUpData;

        if (user) {
          // Free plan
          await supabase
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              email: email,
              plan: 'free',
              ratings_unlocked: ['ppl'],
              status: 'active'
            });
        }

        if (pendingClaim) {
          setSuccess('Account created! Please check your email to confirm your account, then sign in to access your training progress.');
        } else {
          setSuccess('Account created! Please check your email to confirm your account, then sign in. If you have an invite code, you can enter it after logging in.');
        }
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasClaim = !!searchParams.get('claim');
  const showGoogleButton = !isResetMode && (isLogin || hasClaim || roleChosen);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-6 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(ellipse at 20% 0%, rgba(42, 90, 140, 0.07) 0%, transparent 60%)',
      }}
    >
      {/* Dark mode toggle — top right */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg border hover:bg-[var(--bg-tertiary)] transition-all"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="w-full max-w-md">

        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold transition-colors mb-6 cursor-pointer hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to 61 Tracker
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            boxShadow: '0 4px 24px rgba(26, 58, 92, 0.1), 0 16px 48px rgba(26, 58, 92, 0.08)'
          }}
        >
          {/* Header */}
          <div
            className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6"
            style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 100%)' }}
          >
            {/* Logo lockup */}
            <div className="flex items-center gap-4 mb-6">
              {/* 61 numeral */}
              <div className="relative">
                <span
                  className="block font-black leading-none select-none"
                  style={{
                    fontSize: '52px',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '-2px',
                    lineHeight: 1,
                  }}
                >
                  61
                </span>
                {/* Amber underline */}
                <div
                  className="absolute rounded-full"
                  style={{
                    bottom: '-4px',
                    left: 0,
                    width: '100%',
                    height: '3.5px',
                    backgroundColor: '#e8a020',
                  }}
                />
              </div>

              {/* Amber divider */}
              <div
                style={{
                  width: '2px',
                  height: '44px',
                  backgroundColor: '#e8a020',
                  opacity: 0.4,
                  borderRadius: '1px',
                  flexShrink: 0,
                }}
              />

              {/* TRACKER + tagline */}
              <div className="flex flex-col justify-center gap-0.5">
                <span
                  className="font-black uppercase leading-none"
                  style={{
                    fontSize: '20px',
                    color: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '1.5px',
                  }}
                >
                  TRACKER
                </span>
                <span
                  className="font-bold"
                  style={{
                    fontSize: '8px',
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    fontVariant: 'normal',
                  }}
                >
                  BUILT FOR CFI<span style={{ textTransform: 'none' }}>s</span>
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white">
              {showOauthRolePrompt ? 'One last step' : isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {showOauthRolePrompt ? 'Select your primary role' : isLogin ? 'Sign in to your dashboard' : 'Start tracking lessons today'}
            </p>
          </div>

          {/* Tab Toggle */}
          {!isResetMode && !showOauthRolePrompt && (
            <div className="px-5 sm:px-8 pt-5 sm:pt-6">
              <div
                className="flex rounded-xl p-1"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isLogin ? 'var(--bg-secondary)' : 'transparent',
                    color: isLogin ? 'var(--navy)' : 'var(--text-muted)',
                    boxShadow: isLogin ? '0 1px 4px rgba(26,58,92,0.1)' : 'none'
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setRoleChosen(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  style={{
                    backgroundColor: !isLogin ? 'var(--bg-secondary)' : 'transparent',
                    color: !isLogin ? 'var(--navy)' : 'var(--text-muted)',
                    boxShadow: !isLogin ? '0 1px 4px rgba(26,58,92,0.1)' : 'none'
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="px-5 sm:px-8 py-5 sm:py-6">
            {error && (
              <div
                className="rounded-xl p-3 mb-5 flex items-start gap-2 text-xs border"
                style={{ backgroundColor: 'rgba(192,57,43,0.1)', borderColor: 'rgba(192,57,43,0.3)', color: 'var(--red)' }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                className="rounded-xl p-3 mb-5 flex items-start gap-2 text-xs border"
                style={{ backgroundColor: 'rgba(45,122,79,0.1)', borderColor: 'rgba(45,122,79,0.3)', color: 'var(--green)' }}
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {showOauthRolePrompt ? (
              <div className="space-y-6 text-center py-2">
                <div className="text-left">
                  <h3 className="text-sm font-bold uppercase tracking-wider block text-left" style={{ color: 'var(--text-muted)' }}>
                    Complete your profile
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Please select whether you are a Student pilot or a Flight Instructor (CFI). This is a one-time setup for your new account.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOauthRolePrompt(false);
                      if (oauthSession) {
                        handleProvisionAndRoute(oauthSession, 'student', true);
                      }
                    }}
                    className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-sm text-center"
                    style={{ backgroundColor: 'var(--navy)' }}
                  >
                    I am a Student Pilot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOauthRolePrompt(false);
                      if (oauthSession) {
                        handleProvisionAndRoute(oauthSession, 'cfi', true);
                      }
                    }}
                    className="w-full py-3.5 rounded-xl text-sm font-bold transition-all border cursor-pointer text-center"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    I am a CFI (Instructor)
                  </button>
                </div>
              </div>
            ) : isResetMode ? (
              <div className="space-y-4">
                <div className="text-left mb-6">
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Reset your password
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Enter your account email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest block text-left"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm cursor-pointer"
                    style={{ backgroundColor: 'var(--navy)' }}
                  >
                    {loading ? 'Sending link...' : 'Send reset link'}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-xs font-bold hover:underline cursor-pointer"
                    style={{ color: 'var(--navy)' }}
                  >
                    Back to sign in
                  </button>
                </div>
              </div>
            ) : (
              <>
                {!isLogin && hasClaim && (
                  <div className="mb-5 p-3.5 rounded-xl border text-xs text-left" style={{ backgroundColor: 'rgba(232, 160, 32, 0.05)', borderColor: 'rgba(232, 160, 32, 0.2)', color: 'var(--text-primary)' }}>
                    <span className="font-bold text-[#e8a020] block mb-0.5">CFI Invite Verified</span>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      You are creating a private student account linked to your instructor's invite.
                    </p>
                  </div>
                )}

                {!isLogin && !hasClaim && !roleChosen ? (
                  <div className="space-y-4 py-2">
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRole('student');
                          setRoleChosen(true);
                        }}
                        className="w-full text-white font-bold py-4.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-base text-center"
                        style={{ backgroundColor: 'var(--navy)' }}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRole('cfi');
                          setRoleChosen(true);
                        }}
                        className="w-full text-white font-bold py-4.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-base text-center"
                        style={{ backgroundColor: 'var(--navy)' }}
                      >
                        CFI
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isLogin && !hasClaim && roleChosen && (
                      <div className="flex items-center justify-between p-3.5 rounded-xl border mb-5 text-xs text-left animate-fadeIn" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                        <div>
                          <span className="text-gray-400 font-bold block uppercase tracking-wider text-[9px]">Account Type</span>
                          <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>
                            {role === 'student' ? 'Student Pilot' : 'Flight Instructor (CFI)'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRoleChosen(false)}
                          className="text-xs font-bold underline text-blue-500 hover:text-blue-600 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                      {!isLogin && (
                        <div className="space-y-1.5">
                          <label
                            className="text-[10px] font-bold uppercase tracking-widest block text-left"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Full Name
                          </label>
                          <div className="relative">
                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder={role === 'student' ? 'John Smith' : 'John Smith CFI'}
                              className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                              style={{
                                backgroundColor: 'var(--bg-tertiary)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label
                          className="text-[10px] font-bold uppercase tracking-widest block text-left"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Email
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                            style={{
                              backgroundColor: 'var(--bg-tertiary)',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          className="text-[10px] font-bold uppercase tracking-widest block text-left"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Password
                        </label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                            className="w-full text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all border"
                            style={{
                              backgroundColor: 'var(--bg-tertiary)',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                        {isLogin && (
                          <div className="text-right pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsResetMode(true);
                                setError(null);
                                setSuccess(null);
                              }}
                              className="text-xs font-bold hover:underline cursor-pointer"
                              style={{ color: 'var(--navy)' }}
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm cursor-pointer"
                        style={{ backgroundColor: 'var(--navy)' }}
                      >
                        {loading ? 'Processing...' : isLogin ? 'Sign In →' : 'Create Account →'}
                      </button>
                    </form>

                    {showGoogleButton && (
                      <>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-3 text-xs uppercase" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                              or
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="w-full text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-sm border flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[12px] font-black font-sans shadow-sm border border-slate-100" style={{ color: '#4285F4' }}>G</span>
                          Continue with Google
                        </button>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            <p
              className="text-center text-[10px] mt-6"
              style={{ color: 'var(--text-muted)' }}
            >
              FAR Part 61 · AC 61-65K · FAA ACS Standards
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

