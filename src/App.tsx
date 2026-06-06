import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import PageTransition from './components/PageTransition';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LessonType from './components/LessonType';
import RatingSelection from './components/RatingSelection';
import GroundLesson from './components/GroundLesson';
import FlightLesson from './components/FlightLesson';
import FlightReview from './components/FlightReview';
import IPC from './components/IPC';
import History from './components/History';
import StudentDashboard from './components/StudentDashboard';
import StudentView from './components/StudentView';
import IACRASummary from './components/IACRASummary';
import PreSoloTest from './components/PreSoloTest';
import CFIHours from './components/CFIHours';
import FlightSchool from './components/FlightSchool';
import Schedule from './components/Schedule';
import Landing from './components/Landing';
import Admin from './components/Admin';
import Account from './components/Account';
import OnboardingModal from './components/OnboardingModal';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import Contact from './pages/Contact';
import HowToExport from './pages/HowToExport';
import { AlertCircle, RefreshCw } from 'lucide-react';

function FullScreenLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <style>
        {`
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          .animate-pulse-logo {
            animation: pulse-scale 3s ease-in-out infinite;
          }
        `}
      </style>
      <div className="flex items-center gap-5 scale-150">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative animate-pulse-logo">
            <span
              className="block font-black leading-none select-none"
              style={{
                fontSize: '42px',
                color: 'var(--navy)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '-1.5px',
                lineHeight: 1,
              }}
            >
              61
            </span>
            <div
              className="absolute rounded-full"
              style={{ bottom: '-4px', left: 0, width: '100%', height: '4px', backgroundColor: '#e8a020' }}
            />
          </div>
          
          <div style={{ width: '2px', height: '36px', backgroundColor: '#e8a020', opacity: 0.3, borderRadius: '1px', flexShrink: 0 }} />
          
          <div className="flex flex-col justify-center gap-0.5">
            <span
              className="font-black uppercase leading-none"
              style={{ fontSize: '16px', color: 'var(--navy)', letterSpacing: '2px' }}
            >
              TRACKER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentHomeRoute({ session, accountType }: { session: any, accountType: 'not-yet-determined' | 'instructor' | 'student' }) {
  if (!session) {
    return <Navigate to="/auth" />;
  }
  if (accountType === 'not-yet-determined') {
    return <FullScreenLoading />;
  }
  if (accountType === 'instructor') {
    return <Navigate to="/dashboard" />;
  }
  return <StudentView />;
}

function CfiRouteGuard({ session, accountType, children }: { session: any, accountType: 'not-yet-determined' | 'instructor' | 'student', children: React.ReactNode }) {
  if (!session) {
    return <Navigate to="/auth" />;
  }
  if (accountType === 'not-yet-determined') {
    return <FullScreenLoading />;
  }
  if (accountType === 'student') {
    return <Navigate to="/my-progress" />;
  }
  return <>{children}</>;
}

function AuthRedirect({ session, accountType }: { session: any, accountType: 'not-yet-determined' | 'instructor' | 'student' }) {
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get('verified') === '1') {
    return <Auth />;
  }
  if (!session) {
    return <Auth />;
  }
  if (localStorage.getItem('pending_student_claim')) {
    return <FullScreenLoading />;
  }
  if (accountType === 'not-yet-determined') {
    return <FullScreenLoading />;
  }
  if (accountType === 'student') {
    return <Navigate to="/my-progress" />;
  }
  return <Navigate to="/dashboard" />;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [accountType, setAccountType] = useState<'not-yet-determined' | 'instructor' | 'student'>('not-yet-determined');
  const location = useLocation();

  const checkConnection = async () => {
    try {
      const { error } = await supabase.from('students').select('id').limit(1);
      if (error && error.message === 'Failed to fetch') {
        setConnectionError(true);
      } else {
        setConnectionError(false);
      }
    } catch (err) {
      setConnectionError(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        await checkConnection();
      } catch (err) {
        console.error('Supabase init error:', err);
        setConnectionError(true);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setAccountType('not-yet-determined');
        setShowOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      setAccountType('not-yet-determined');
      
      const fetchUserData = async () => {
        try {
          const { data: profile } = await supabase
            .from('cfi_profile')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          
          setShowOnboarding(!profile);

          const { data: sub, error } = await supabase
            .from('user_subscriptions')
            .select('account_type')
            .eq('user_id', userId)
            .maybeSingle();

          if (error || !sub || !sub.account_type) {
            const userMetadata = session?.user?.user_metadata;
            if (userMetadata?.account_type === 'student' && session?.access_token) {
              try {
                await fetch('/api/set-student-account', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                  }
                });
              } catch (err) {
                console.error('Error setting student account from metadata:', err);
              }
              setAccountType('student');
            } else {
              setAccountType('instructor');
            }
          } else {
            setAccountType(sub.account_type === 'student' ? 'student' : 'instructor');
          }
        } catch (err) {
          setAccountType('instructor');
        }
      };

      fetchUserData();
    } else {
      setAccountType('not-yet-determined');
      setShowOnboarding(false);
    }
  }, [session?.user?.id]);

  if (loading) {
    return <FullScreenLoading />;
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-[#eef2f8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#dde3ec] shadow-xl p-10 w-full max-w-[450px] text-center">
          <div className="w-16 h-16 bg-[#fdecea] text-[#c0392b] rounded-full flex items-center justify-center mb-6 mx-auto">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#1c2333] mb-3">Connection Failed</h2>
          <p className="text-sm text-[#6b7280] mb-8 leading-relaxed">
            Unable to connect to the database. This usually happens if the Supabase project is paused or the API keys are incorrect.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#1a3a5c] text-white font-bold py-3 rounded-xl hover:bg-[#2a5a8c] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Retry Connection
            </button>
            <p className="text-[11px] text-[#6b7280] mt-4">
              If you are the developer, please check your Supabase project status and environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {session && showOnboarding && accountType === 'instructor' && !localStorage.getItem('pending_student_claim') && (
        <OnboardingModal 
          user={session.user} 
          onComplete={() => setShowOnboarding(false)} 
        />
      )}
      <AnimatePresence mode="wait">
        <Routes location={location}>
        <Route 
          path="/auth" 
          element={<AuthRedirect session={session} accountType={accountType} />} 
        />
        <Route
          path="/"
          element={<Landing />}
        />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/view/:token" element={<StudentView />} />
        <Route path="/howto-export" element={<HowToExport />} />

        <Route 
          path="/my-progress" 
          element={<StudentHomeRoute session={session} accountType={accountType} />} 
        />

        <Route
          path="/dashboard"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/rating"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <RatingSelection />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/lesson-type"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <LessonType />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/ground"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <GroundLesson />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/flight"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <FlightLesson />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/flight-review"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <FlightReview />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/ipc"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <IPC />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/history"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <History />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route path="/student/:studentName" element={<StudentDashboard />} />
        <Route
          path="/iacra/:studentName"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <IACRASummary />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/presolo-test"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <PreSoloTest />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/cfi-hours"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <CFIHours />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/flight-school"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <Layout user={session?.user}>
                <PageTransition>
                  <FlightSchool />
                </PageTransition>
              </Layout>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/schedule"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <PageTransition>
                <Schedule />
              </PageTransition>
            </CfiRouteGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <CfiRouteGuard session={session} accountType={accountType}>
              <PageTransition>
                <Admin />
              </PageTransition>
            </CfiRouteGuard>
          }
        />
        <Route path="/account" element={<Account />} />
      </Routes>
    </AnimatePresence>
    </>
  );
}

