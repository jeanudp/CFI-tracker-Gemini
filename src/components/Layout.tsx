import React, { useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle, Lightbulb, X, Send, Menu, LogOut, LayoutDashboard, History, Settings, User } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { cn } from '../lib/utils';

export default function Layout() {
  const [isMaydayOpen, setIsMaydayOpen] = useState(false);
  const [feedbackTab, setFeedbackTab] = useState<'bug' | 'idea'>('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [user, setUser] = useState<any>(null); // This would normally come from an auth context
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    // This would normally call auth.signOut()
    navigate('/auth');
  };

  const handleMaydaySend = async () => {
    if (!feedbackText.trim()) return;
    setIsSending(true);
    try {
      const templateParams = {
        from_name: user?.email || 'Anonymous',
        message: feedbackText,
        reply_to: user?.email || '',
        type: feedbackTab,
        page: location.pathname
      };
      // Note: Replace with actual service/template/user IDs from environment variables
      await emailjs.send('service_default', 'template_default', templateParams, 'user_key');
      setFeedbackText('');
      setIsMaydayOpen(false);
      alert('Feedback sent! Thanks for your help.');
    } catch (err) {
      console.error(err);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/rating') return 'Select Rating';
    if (path === '/lesson-type') return 'Lesson Type';
    if (path === '/ground-lesson') return 'Ground Lesson';
    if (path === '/flight-lesson') return 'Flight Lesson';
    if (path === '/history') return 'History';
    return 'FlightBase';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1c2333] font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#dde3ec] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1a3a5c] rounded-lg flex items-center justify-center text-white text-lg font-bold">F</div>
                <span className="font-bold text-xl tracking-tight text-[#1a3a5c]">FlightBase</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className={cn("text-sm font-bold transition-colors", location.pathname === '/dashboard' ? "text-[#1a3a5c]" : "text-[#6b7280] hover:text-[#1a3a5c]")}>Dashboard</Link>
                <Link to="/history" className={cn("text-sm font-bold transition-colors", location.pathname === '/history' ? "text-[#1a3a5c]" : "text-[#6b7280] hover:text-[#1a3a5c]")}>History</Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setFeedbackTab('bug');
                  setIsMaydayOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#dde3ec] bg-[#f4f5f7] text-[#6b7280] hover:bg-[#eceef1] hover:text-[#1a3a5c] transition-all text-xs font-bold"
              >
                <AlertTriangle size={14} />
                <span className="hidden sm:inline">Report Issue</span>
              </button>

              <div className="h-8 w-[1px] bg-[#dde3ec] mx-1" />
              
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-bold text-[#1c2333]">{user?.email || 'Instructor'}</span>
                  <span className="text-[10px] text-[#6b7280] font-medium uppercase tracking-wider">CFI</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1a3a5c]/10 border border-[#1a3a5c]/20 flex items-center justify-center text-[#1a3a5c]">
                  <User size={18} />
                </div>
                <button onClick={handleLogout} className="p-2 text-[#6b7280] hover:text-[#c0392b] transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 sm:pb-8">
        <Outlet />
      </main>

      {/* Feedback Modal */}
      {isMaydayOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1c2333]/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#dde3ec] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#dde3ec] flex justify-between items-center bg-[#f4f5f7]">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                  feedbackTab === 'bug' ? "bg-[#c0392b] shadow-[#c0392b]/20" : "bg-[#e8a020] shadow-[#e8a020]/20"
                )}>
                  {feedbackTab === 'bug' ? <AlertTriangle size={20} /> : <Lightbulb size={20} />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1c2333]">
                    {feedbackTab === 'bug' ? 'Report a Bug' : 'Share an Idea'}
                  </h2>
                  <p className="text-[10px] text-[#6b7280] font-medium uppercase tracking-widest">Feedback to Developer</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMaydayOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#eceef1] text-[#6b7280] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-[#f4f5f7] border-b border-[#dde3ec]">
              <button
                onClick={() => setFeedbackTab('bug')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all",
                  feedbackTab === 'bug' 
                    ? "bg-white text-[#c0392b] border-b-2 border-[#c0392b]" 
                    : "text-[#6b7280] hover:text-[#1c2333] hover:bg-[#eceef1]"
                )}
              >
                <AlertTriangle size={14} />
                Report a Bug
              </button>
              <button
                onClick={() => setFeedbackTab('idea')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all",
                  feedbackTab === 'idea' 
                    ? "bg-white text-[#e8a020] border-b-2 border-[#e8a020]" 
                    : "text-[#6b7280] hover:text-[#1c2333] hover:bg-[#eceef1]"
                )}
              >
                <Lightbulb size={14} />
                Share an Idea
              </button>
            </div>

            <div className="p-6">
              {/* Context Indicator */}
              {feedbackTab === 'bug' && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-[#f4f5f7] rounded-lg border border-[#dde3ec] text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                  <span className="opacity-50">Current Page:</span>
                  <span className="text-[#1a3a5c]">{getPageTitle()}</span>
                </div>
              )}

              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full h-40 p-4 text-sm border border-[#dde3ec] rounded-xl focus:outline-none focus:border-[#1a3a5c] focus:ring-4 focus:ring-[#1a3a5c]/5 transition-all resize-none placeholder:text-[#94a3b8]"
                placeholder={feedbackTab === 'bug' 
                  ? "Describe the issue... (What happened? What did you expect?)" 
                  : "Tell us your idea for a feature or improvement..."
                }
              />

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsMaydayOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-[#6b7280] hover:text-[#1c2333] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMaydaySend}
                  disabled={isSending || !feedbackText.trim()}
                  className={cn(
                    "px-6 py-2 rounded-xl text-white text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100",
                    feedbackTab === 'bug' 
                      ? "bg-[#c0392b] shadow-[#c0392b]/20 hover:bg-[#a93226]" 
                      : "bg-[#e8a020] shadow-[#e8a020]/20 hover:bg-[#d4921d]"
                  )}
                >
                  {isSending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={14} />
                      Send to Developer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
