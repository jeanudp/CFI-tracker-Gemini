import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LessonType from './components/LessonType';
import GroundLesson from './components/GroundLesson';
import FlightLesson from './components/FlightLesson';
import History from './components/History';
import StudentDashboard from './components/StudentDashboard';
import IACRASummary from './components/IACRASummary';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

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
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            session ? (
              <Layout user={session.user}>
                <Dashboard />
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
                <LessonType />
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
                <GroundLesson />
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
                <FlightLesson />
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
                <History />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/student/:studentName"
          element={
            session ? (
              <Layout user={session.user}>
                <StudentDashboard />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
        <Route
          path="/iacra/:studentName"
          element={
            session ? (
              <Layout user={session.user}>
                <IACRASummary />
              </Layout>
            ) : (
              <Navigate to="/auth" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
