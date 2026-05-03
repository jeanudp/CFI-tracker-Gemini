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
import History from './components/History';
import StudentDashboard from './components/StudentDashboard';
import StudentView from './components/StudentView';
import IACRASummary from './components/IACRASummary';
import PreSoloTest from './components/PreSoloTest';
import CFIHours from './components/CFIHours';
import Schedule from './components/Schedule';
import Landing from './components/Landing';
import Admin from './components/Admin';
import Account from './components/Account';
import OnboardingModal from './components/OnboardingModal';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import Contact from './pages/Contact';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
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
        
        if (session) {
          const { data: profile } = await supabase
            .from('cfi_profile')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setShowOnboarding(!profile);
        }
        
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
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1a3a5c]/20 border-t-[#1a3a5c] rounded-full animate-spin" />
          <div className="text-sm font-medium text-[#1a3a5c] animate-pulse">Initializing...</div>
        </div>
      </div>
    );
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
      {session && showOnboarding && (
        <OnboardingModal 
          user={session.user} 
          onComplete={() => setShowOnboarding(false)} 
        />
      )}
      <AnimatePresence mode="wait">
        <Routes location={location}>
        <Route 
          path="/auth" 
          element={!session ? <Auth /> : <Navigate to="/dashboard" />} 
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

        <Route
          path="/dashboard"
          element={
            session ? (
              <PageTransition>
                <Dashboard />
              </PageTransition>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/rating"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <RatingSelection />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/lesson-type"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <LessonType />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/ground"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <GroundLesson />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/flight"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <FlightLesson />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/history"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <History />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route path="/student/:studentName" element={<StudentDashboard />} />
        <Route
          path="/iacra/:studentName"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <IACRASummary />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/presolo-test"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <PreSoloTest />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/cfi-hours"
          element={
            session ? (
              <Layout user={session.user}>
                <PageTransition>
                  <CFIHours />
                </PageTransition>
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/schedule"
          element={
            session ? (
              <PageTransition>
                <Schedule />
              </PageTransition>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            session ? (
              <PageTransition>
                <Admin />
              </PageTransition>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route path="/account" element={<Account />} />
      </Routes>
    </AnimatePresence>
    </>
  );
}

