import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Shield,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  UserMinus,
  Plus,
  ArrowRight,
  LogOut,
  Sparkles,
  Plane,
  Wrench,
  Eye,
  EyeOff,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AIRCRAFT_MODELS } from '../constants/aircraft';
import NewStudentModal from './NewStudentModal';

const normalizeString = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

interface OrgMember {
  user_id: string;
  full_name: string;
  role: 'owner' | 'manager' | 'member';
  joined_at: string;
}

interface Organization {
  id: string;
  name: string;
  join_code: string;
  created_at?: string;
}

export default function FlightSchool() {
  const navigate = useNavigate();
  
  // App-level loading and session state
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'manager' | 'member'>('member');

  // Input states
  const [createName, setCreateName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // UI operation states
  const [copied, setCopied] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [rotateLoading, setRotateLoading] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(null); // holds user_id while processing

  // Error and Success inline messages
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Fleet management states
  const [fleet, setFleet] = useState<any[]>([]);
  const [archivedFleet, setArchivedFleet] = useState<any[]>([]);
  const [newTail, setNewTail] = useState('');
  const [newModel, setNewModel] = useState('');
  const [addingInProgress, setAddingInProgress] = useState(false);
  const [removingTail, setRemovingTail] = useState<string | null>(null);
  const [updatingMaintenanceTail, setUpdatingMaintenanceTail] = useState<string | null>(null);
  const [hidingOrRestoringTail, setHidingOrRestoringTail] = useState<string | null>(null);
  const [fleetError, setFleetError] = useState<string | null>(null);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const modelSearchContainerRef = useRef<HTMLDivElement>(null);

  // Students management states
  const [students, setStudents] = useState<any[]>([]);
  const [newStudentCfi, setNewStudentCfi] = useState('unassigned');
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [reassigningStudentId, setReassigningStudentId] = useState<string | null>(null);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  useEffect(() => {
    loadFlightSchoolData();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modelSearchContainerRef.current && !modelSearchContainerRef.current.contains(e.target as Node)) {
        setShowModelSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const loadFlightSchoolData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        // Safe redirect to auth if not authenticated
        navigate('/auth');
        return;
      }
      setSessionUser(session.user);

      // Plain select of all columns from organizations
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('*');

      if (orgsError) throw orgsError;

      if (orgs && orgs.length > 0) {
        const school = orgs[0] as Organization;
        setOrganization(school);
        
        // Fetch organization members
        await fetchMembers(school.id, session.user.id);

        // Fetch organization shared fleet
        await fetchFleet(school.id);

        // Fetch school students
        await fetchStudents(school.id);
      } else {
        setOrganization(null);
        setMembers([]);
        setFleet([]);
        setStudents([]);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Error loading Flight School information.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (orgId: string, currentUserId: string) => {
    try {
      const { data: membersList, error: membersError } = await supabase.rpc('get_org_members', {
        p_org_id: orgId
      });

      if (membersError) throw membersError;

      if (membersList) {
        const typedMembers = membersList as OrgMember[];
        setMembers(typedMembers);
        
        // Determine current user's role
        const match = typedMembers.find((m) => m.user_id === currentUserId);
        if (match) {
          setCurrentUserRole(match.role);
        } else {
          setCurrentUserRole('member');
        }
      }
    } catch (err: any) {
      setMemberError(err.message || 'Failed to fetch school members list.');
    }
  };

  const fetchFleet = async (orgId: string) => {
    setFleetError(null);
    try {
      const { data, error } = await supabase
        .from('organization_aircraft')
        .select('id, tail_number, aircraft_model, is_down, maintenance_note, archived_at')
        .eq('org_id', orgId)
        .order('tail_number');

      if (error) throw error;
      
      const rawFleet = data || [];
      const activeFleet = rawFleet.filter((ac: any) => !ac.archived_at);
      const hiddenFleet = rawFleet.filter((ac: any) => ac.archived_at).sort((a: any, b: any) => {
        const tailA = a.tail_number || '';
        const tailB = b.tail_number || '';
        return tailA.localeCompare(tailB);
      });

      setFleet(activeFleet);
      setArchivedFleet(hiddenFleet);
    } catch (err: any) {
      setFleetError(err.message || 'Failed to load shared fleet.');
    }
  };

  const fetchStudents = async (orgId: string) => {
    setStudentsError(null);
    try {
      const { data, error } = await supabase.rpc('get_school_students', {
        p_org_id: orgId
      });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      setStudentsError(err.message || 'Failed to load school students.');
    }
  };

  const handleStudentCreated = () => {
    if (organization) {
      fetchStudents(organization.id);
    }
    setNewStudentCfi('unassigned');
    setIsNewStudentModalOpen(false);
  };

  const handleReassignStudent = async (studentId: string, newCfiId: string) => {
    if (reassigningStudentId) return;

    setReassigningStudentId(studentId);
    setStudentsError(null);

    const targetCfiId = newCfiId === 'unassigned' ? null : newCfiId;

    try {
      const { data, error } = await supabase.rpc('set_student_assignment', {
        p_student_id: studentId,
        p_assigned_cfi: targetCfiId
      });

      if (error) throw error;

      // Refetch students list
      if (organization) {
        await fetchStudents(organization.id);
      }
    } catch (err: any) {
      setStudentsError(err.message || 'Failed to reassign student.');
    } finally {
      setReassigningStudentId(null);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || createLoading) return;
    
    setCreateLoading(true);
    setCreateError(null);
    try {
      const { data, error } = await supabase.rpc('create_organization', {
        p_name: createName.trim()
      });

      if (error) throw error;

      // Reload page data to transition to the management view
      setCreateName('');
      await loadFlightSchoolData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create flight school.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = joinCodeInput.trim().toUpperCase();
    if (!formattedCode || joinLoading) return;

    setJoinLoading(true);
    setJoinError(null);
    try {
      const { data, error } = await supabase.rpc('join_organization', {
        p_code: formattedCode
      });

      if (error) {
        // If error message contains "Invalid join code", show inline indicator as requested
        if (error.message?.toLowerCase().includes('invalid join code')) {
          setJoinError('Invalid join code. Please double-check and try again.');
        } else {
          throw error;
        }
        return;
      }

      setJoinCodeInput('');
      await loadFlightSchoolData();
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join flight school.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRotateJoinCode = async () => {
    if (!organization || rotateLoading) return;
    
    setRotateLoading(true);
    setGlobalError(null);
    try {
      const { data: newCode, error } = await supabase.rpc('rotate_join_code', {
        p_org_id: organization.id
      });

      if (error) throw error;

      if (newCode) {
        setOrganization(prev => prev ? { ...prev, join_code: newCode } : null);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to update join code.');
    } finally {
      setRotateLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!organization) return;
    navigator.clipboard.writeText(organization.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetMemberRole = async (targetUserId: string, newRole: 'manager' | 'member') => {
    if (!organization || memberActionLoading) return;

    setMemberActionLoading(targetUserId);
    setMemberError(null);
    try {
      const { error } = await supabase.rpc('set_member_role', {
        p_org_id: organization.id,
        p_user_id: targetUserId,
        p_role: newRole
      });

      if (error) throw error;

      // Refresh members list
      await fetchMembers(organization.id, sessionUser.id);
    } catch (err: any) {
      setMemberError(err.message || `Failed to change member role to ${newRole}.`);
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!organization || memberActionLoading) return;

    const isSelf = targetUserId === sessionUser?.id;
    const confirmMessage = isSelf 
      ? 'Are you sure you want to leave this flight school?' 
      : 'Are you sure you want to remove this member from the flight school?';

    if (!window.confirm(confirmMessage)) return;

    setMemberActionLoading(targetUserId);
    setMemberError(null);
    try {
      const { error } = await supabase.rpc('remove_member', {
        p_org_id: organization.id,
        p_user_id: targetUserId
      });

      if (error) throw error;

      if (isSelf) {
        // Returns the user to the initial view by resetting state
        setOrganization(null);
        setMembers([]);
        setFleet([]);
        setStudents([]);
        setCurrentUserRole('member');
      } else {
        // Refresh members list for others
        await fetchMembers(organization.id, sessionUser.id);
      }
    } catch (err: any) {
      setMemberError(err.message || 'Failed to remove member.');
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleTransferOwnership = async (targetUserId: string) => {
    if (!organization || memberActionLoading) return;

    const confirmMessage = "WARNING: You are about to transfer ownership of this school. This will hand full ownership to that instructor, and you will step down to a manager role. You will lose the ability to assign managers or transfer ownership in the future, and you cannot undo this action yourself. Are you absolutely sure you want to proceed?";
    if (!window.confirm(confirmMessage)) return;

    setMemberActionLoading(targetUserId);
    setMemberError(null);
    try {
      const { error } = await supabase.rpc('transfer_ownership', {
        p_org_id: organization.id,
        p_user_id: targetUserId
      });

      if (error) throw error;

      // Refresh members list
      await fetchMembers(organization.id, sessionUser.id);
    } catch (err: any) {
      setMemberError(err.message || 'Failed to transfer ownership.');
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleAddAircraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !newTail.trim() || !newModel.trim() || addingInProgress) return;

    setAddingInProgress(true);
    setFleetError(null);
    try {
      const { error } = await supabase.rpc('add_org_aircraft', {
        p_org_id: organization.id,
        p_tail: newTail.trim().toUpperCase(),
        p_model: newModel.trim()
      });

      if (error) throw error;

      setNewTail('');
      setNewModel('');
      await fetchFleet(organization.id);
    } catch (err: any) {
      setFleetError(err.message || 'Failed to add shared aircraft.');
    } finally {
      setAddingInProgress(false);
    }
  };

  const handleRemoveAircraft = async (tailNumber: string) => {
    if (!organization || removingTail) return;

    if (!window.confirm(`Are you sure you want to remove aircraft ${tailNumber} from the shared fleet?`)) return;

    setRemovingTail(tailNumber);
    setFleetError(null);
    try {
      const { error } = await supabase.rpc('remove_org_aircraft', {
        p_org_id: organization.id,
        p_tail: tailNumber
      });

      if (error) throw error;

      await fetchFleet(organization.id);
    } catch (err: any) {
      setFleetError(err.message || `Failed to remove aircraft ${tailNumber}.`);
    } finally {
      setRemovingTail(null);
    }
  };

  const handleHideAircraft = async (tailNumber: string) => {
    if (!organization || hidingOrRestoringTail) return;

    setHidingOrRestoringTail(tailNumber);
    setFleetError(null);
    try {
      const { error } = await supabase.rpc('set_org_aircraft_archived', {
        p_org_id: organization.id,
        p_tail: tailNumber,
        p_archived: true
      });

      if (error) throw error;

      await fetchFleet(organization.id);
    } catch (err: any) {
      setFleetError(err.message || `Failed to hide aircraft ${tailNumber}.`);
    } finally {
      setHidingOrRestoringTail(null);
    }
  };

  const handleRestoreAircraft = async (tailNumber: string) => {
    if (!organization || hidingOrRestoringTail) return;

    setHidingOrRestoringTail(tailNumber);
    setFleetError(null);
    try {
      const { error } = await supabase.rpc('set_org_aircraft_archived', {
        p_org_id: organization.id,
        p_tail: tailNumber,
        p_archived: false
      });

      if (error) throw error;

      await fetchFleet(organization.id);
    } catch (err: any) {
      setFleetError(err.message || `Failed to restore aircraft ${tailNumber}.`);
    } finally {
      setHidingOrRestoringTail(null);
    }
  };

  const handleToggleMaintenanceStatus = async (tailNumber: string, currentDown: boolean) => {
    if (!organization || updatingMaintenanceTail) return;

    let note: string | null = null;
    const newDown = !currentDown;

    if (newDown) {
      const input = window.prompt(`Enter a short maintenance note for ${tailNumber} (optional):`);
      if (input === null) return; // User canceled the prompt
      note = input.trim();
    }

    setUpdatingMaintenanceTail(tailNumber);
    setFleetError(null);

    try {
      const { error } = await supabase.rpc('set_org_aircraft_status', {
        p_org_id: organization.id,
        p_tail: tailNumber,
        p_is_down: newDown,
        p_note: note
      });

      if (error) throw error;

      await fetchFleet(organization.id);
    } catch (err: any) {
      setFleetError(err.message || `Failed to update status for ${tailNumber}.`);
    } finally {
      setUpdatingMaintenanceTail(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--navy)' }} />
        <p className="mt-4 text-xs font-semibold text-[var(--text-secondary)]">
          Checking flight school status...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
      {/* Title Header */}
      <div className="mb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Flight School
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Collaborate, manage permissions, and align flight instruction records across active CFIs.
        </p>
      </div>

      {/* Global Error Notice */}
      {globalError && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold text-left">
            <span className="font-bold">Error:</span> {globalError}
          </div>
        </div>
      )}

      {/* Not in a School UI */}
      {!organization ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create a School Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-blue-50 dark:bg-[#1e3050]">
                <Plus className="w-5 h-5" style={{ color: 'var(--navy)' }} />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Create a Flight School
              </h3>
              <p className="text-xs mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Establish a new private group. You will become the primary Owner, granting you power to assign managers and rotate invite codes.
              </p>
            </div>
            
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  School Name
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Skyline Aviation Academy"
                  className="w-full text-xs rounded-xl px-4 py-2.5 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)]"
                />
              </div>

              {createError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                  {createError}
                </p>
              )}

              <button
                type="submit"
                disabled={!createName.trim() || createLoading}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
                style={{ backgroundColor: 'var(--navy)' }}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating School...
                  </>
                ) : (
                  <>
                    Create School
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Join a School Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-emerald-50 dark:bg-emerald-950/20">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Join a Flight School
              </h3>
              <p className="text-xs mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Already have a flight school established by another instructor? Paste their active join code here to synchronize your CFI rosters.
              </p>
            </div>

            <form onSubmit={handleJoinSchool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Invite Join Code
                </label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="e.g. SCH-XXXX-XXXX"
                  className="w-full text-xs rounded-xl px-4 py-2.5 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-mono tracking-wider"
                />
              </div>

              {joinError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1">
                  {joinError}
                </p>
              )}

              <button
                type="submit"
                disabled={!joinCodeInput.trim() || joinLoading}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
                style={{ backgroundColor: 'var(--green)' }}
              >
                {joinLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join School
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Management view */
        <div className="space-y-6">
          {/* Header Card with join code */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                  Active Flight School
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
                  {organization.name}
                </h2>
                
                {/* Join code section */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    School Invite Code:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs font-mono font-bold uppercase bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-2.5 py-1 rounded-lg text-[var(--text-primary)] select-all tracking-wider">
                      {organization.join_code}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                      title="Copy join code to clipboard"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {copied && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner/Manager rotate credentials button */}
              {(currentUserRole === 'owner' || currentUserRole === 'manager') && (
                <div className="sm:self-end">
                  <button
                    type="button"
                    onClick={handleRotateJoinCode}
                    disabled={rotateLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-[var(--bg-tertiary)] text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", rotateLoading && "animate-spin")} />
                    New Code
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Members Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden text-left">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Instructors &amp; Roster Members
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                {members.length} Total
              </span>
            </div>

            {memberError && (
              <div className="p-4 mx-5 mt-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold">
                {memberError}
              </div>
            )}

            <div className="divide-y divide-[var(--border-color)]">
              {members.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-[var(--text-muted)]">
                  No registered members found.
                </div>
              ) : (
                members.map((member) => {
                  const isCurrent = member.user_id === sessionUser?.id;
                  const isOwner = member.role === 'owner';
                  const isManager = member.role === 'manager';

                  return (
                    <div
                      key={member.user_id}
                      className={cn(
                        "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors",
                        isCurrent && "bg-slate-50/50 dark:bg-slate-800/10"
                      )}
                    >
                      {/* Name & Badge Info */}
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold uppercase text-[11px] shrink-0">
                          {member.full_name ? member.full_name.substring(0, 2) : 'CF'}
                        </div>
                        <div className="overflow-hidden text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[var(--text-primary)] truncate">
                              {member.full_name || 'Unnamed CFI'}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-1 py-0.5 rounded leading-none shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            Joined on {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Badges & Actions */}
                      <div className="flex items-center justify-end gap-3 shrink-0">
                        {/* Member Role Badge */}
                        <span>
                          {isOwner ? (
                            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--navy)' }}>
                              Owner
                            </span>
                          ) : isManager ? (
                            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--green)' }}>
                              Manager
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                              Instructor
                            </span>
                          )}
                        </span>

                        {/* Loading indication for currently loading member row */}
                        {memberActionLoading === member.user_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                        ) : (
                          /* Render action controls conditionally */
                          <div className="flex items-center gap-1.5">
                            {currentUserRole === 'owner' && !isCurrent && (
                              <>
                                {/* Make Owner Button */}
                                <button
                                  type="button"
                                  onClick={() => handleTransferOwnership(member.user_id)}
                                  className="px-2 py-1 text-[10px] font-bold rounded-lg border hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                  style={{ color: 'var(--navy)', borderColor: 'var(--navy)' }}
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  Make Owner
                                </button>

                                {/* Owner assign manager button */}
                                {member.role === 'member' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMemberRole(member.user_id, 'manager')}
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                                  >
                                    Make Manager
                                  </button>
                                ) : isManager ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetMemberRole(member.user_id, 'member')}
                                    className="px-2 py-1 text-[10px] font-bold rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                                  >
                                    Remove Manager
                                  </button>
                                ) : null}

                                {/* Owner remove any other member / manager */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(member.user_id)}
                                  className="p-1 px-2 text-[10px] font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Remove
                                </button>
                              </>
                            )}

                            {currentUserRole === 'manager' && !isCurrent && member.role === 'member' && (
                              /* Manager remove plain member button */
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.user_id)}
                                className="p-1 px-2 text-[10px] font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors flex items-center gap-1 shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Students Card */}
          {(() => {
            // Group students by current school CFIs
            const groupedByCfi: { [cfieId: string]: { cfiName: string; list: any[] } } = {};
            const unassignedStudents: any[] = [];

            // Set up groups for current school CFIs
            members.forEach((m) => {
              groupedByCfi[m.user_id] = {
                cfiName: m.full_name || 'Unnamed CFI',
                list: []
              };
            });

            // Process each student
            students.forEach((s) => {
              const cfiId = s.assigned_cfi || s.p_assigned_cfi || s.cfi_user_id || s.assigned_cfi_id || null;
              if (cfiId && groupedByCfi[cfiId]) {
                groupedByCfi[cfiId].list.push(s);
              } else {
                unassignedStudents.push(s);
              }
            });

            // Filter out CFI groups that have no assigned students
            const activeCfiGroups = Object.entries(groupedByCfi)
              .filter(([_, group]) => group.list.length > 0)
              .map(([cfiId, group]) => ({ cfiId, ...group }));

            return (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-sm text-left">
                <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      Students
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-white bg-green-600 px-2.5 py-0.5 rounded-full">
                    {students.length} {students.length === 1 ? 'Student' : 'Students'}
                  </span>
                </div>

                <div className="divide-y divide-[var(--border-color)] max-h-[400px] overflow-y-auto">
                  {students.length === 0 ? (
                    <div className="p-10 text-center text-xs text-[var(--text-muted)] italic">
                      No students found
                    </div>
                  ) : (
                    <div className="p-4 space-y-6">
                      {/* CFI active groups */}
                      {activeCfiGroups.map((group) => (
                        <div key={group.cfiId} className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-[var(--navy)] bg-[var(--bg-tertiary)] px-3 py-1 rounded inline-block">
                            Instructor: {group.cfiName}
                          </div>
                          <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] overflow-hidden">
                            {group.list.map((student) => {
                              const selectedVal = student.assigned_cfi || student.p_assigned_cfi || student.cfi_user_id || student.assigned_cfi_id || 'unassigned';
                              return (
                                <div key={student.id} className="p-3 flex items-center justify-between text-xs hover:bg-[var(--bg-tertiary)] transition-colors">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-[var(--text-primary)] block">
                                      {student.name}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] block">
                                      {student.current_rating_label || 'Student Pilot'}
                                    </span>
                                  </div>

                                  {/* Reassign select actions for owner / manager */}
                                  <div className="flex items-center gap-2">
                                    {reassigningStudentId === student.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)] shrink-0" />
                                    ) : (
                                      (currentUserRole === 'owner' || currentUserRole === 'manager') ? (
                                        <select
                                          value={selectedVal}
                                          disabled={reassigningStudentId !== null}
                                          onChange={(e) => handleReassignStudent(student.id, e.target.value)}
                                          className="text-[10px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-2 py-1 max-w-[150px] focus:outline-none focus:ring-1 focus:ring-[var(--navy)] cursor-pointer"
                                        >
                                          <option value="unassigned">Unassigned</option>
                                          {members.map((member) => (
                                            <option key={member.user_id} value={member.user_id}>
                                              {member.full_name || 'Unnamed CFI'}
                                            </option>
                                          ))}
                                        </select>
                                      ) : null
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* CFI Unassigned Group */}
                      {unassignedStudents.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded inline-block">
                            CFI Unassigned
                          </div>
                          <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] overflow-hidden">
                            {unassignedStudents.map((student) => (
                              <div key={student.id} className="p-3 flex items-center justify-between text-xs hover:bg-[var(--bg-tertiary)] transition-colors">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[var(--text-primary)] block">
                                    {student.name}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] block">
                                    {student.current_rating_label || 'Student Pilot'}
                                  </span>
                                </div>

                                {/* Reassign select actions for owner / manager */}
                                <div className="flex items-center gap-2">
                                  {reassigningStudentId === student.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)] shrink-0" />
                                  ) : (
                                    (currentUserRole === 'owner' || currentUserRole === 'manager') ? (
                                      <select
                                        value="unassigned"
                                        disabled={reassigningStudentId !== null}
                                        onChange={(e) => handleReassignStudent(student.id, e.target.value)}
                                        className="text-[10px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] px-2 py-1 max-w-[150px] focus:outline-none focus:ring-1 focus:ring-[var(--navy)] cursor-pointer"
                                      >
                                        <option value="unassigned">Unassigned</option>
                                        {members.map((member) => (
                                          <option key={member.user_id} value={member.user_id}>
                                            {member.full_name || 'Unnamed CFI'}
                                          </option>
                                        ))}
                                      </select>
                                    ) : null
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Error display for students card */}
                {studentsError && (
                  <div className="px-5 py-2.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-t border-[var(--border-color)] flex items-center gap-1.5 font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{studentsError}</span>
                  </div>
                )}

                {/* Create-student form at the bottom */}
                {(currentUserRole === 'owner' || currentUserRole === 'manager') && (
                  <div className="p-5 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] rounded-b-2xl">
                    <div className="flex flex-col sm:flex-row items-end gap-3">
                      <div className="w-full sm:flex-1 space-y-1.5 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                          Assigned CFI
                        </label>
                        <select
                          value={newStudentCfi}
                          onChange={(e) => setNewStudentCfi(e.target.value)}
                          className="w-full text-xs rounded-xl px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)] cursor-pointer"
                        >
                          <option value="unassigned">Unassigned</option>
                          {members.map((member) => (
                            <option key={member.user_id} value={member.user_id}>
                              {member.full_name || 'Unnamed CFI'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsNewStudentModalOpen(true)}
                        className="w-full sm:w-auto h-[34px] px-6 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm shrink-0"
                        style={{ backgroundColor: 'var(--navy)' }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Student
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Shared Fleet Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-sm text-left">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Shared Fleet
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                {fleet.length} Total
              </span>
            </div>

            {fleetError && (
              <div className="p-4 mx-5 mt-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold">
                {fleetError}
              </div>
            )}

            <div className="divide-y divide-[var(--border-color)]">
              {fleet.length === 0 ? (
                <div className="p-8 text-center text-xs font-medium text-[var(--text-muted)]">
                  No registered aircraft found.
                </div>
              ) : (
                fleet.map((aircraft) => {
                  const isRemoving = removingTail === aircraft.tail_number;
                  return (
                    <div
                      key={aircraft.id || aircraft.tail_number}
                      className="p-4 flex flex-row items-center justify-between gap-3 text-xs transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                    >
                      <div className="flex items-center gap-3 overflow-hidden text-left">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-bold uppercase text-[11px] shrink-0">
                          <Plane className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[var(--text-primary)]">
                              {aircraft.tail_number}
                            </span>
                            {aircraft.is_down && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
                                DOWN — MAINTENANCE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] block truncate">
                            {aircraft.aircraft_model}
                          </span>
                          {aircraft.is_down && aircraft.maintenance_note && (
                            <span className="text-[10px] text-[var(--text-muted)] block truncate mt-0.5" title={aircraft.maintenance_note}>
                              Note: {aircraft.maintenance_note}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls: Owner & Manager only */}
                      {(currentUserRole === 'owner' || currentUserRole === 'manager') && (
                        <div className="flex items-center gap-2 justify-end shrink-0">
                          {updatingMaintenanceTail === aircraft.tail_number ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleMaintenanceStatus(aircraft.tail_number, !!aircraft.is_down)}
                              disabled={!!updatingMaintenanceTail || !!removingTail}
                              className={cn(
                                "p-1 px-2 text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0 disabled:opacity-40",
                                aircraft.is_down
                                  ? "hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 dark:text-green-400"
                                  : "hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-500"
                              )}
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              {aircraft.is_down ? 'Return to Service' : 'Mark Down'}
                            </button>
                          )}

                          {hidingOrRestoringTail === aircraft.tail_number ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)] mx-2 shrink-0" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleHideAircraft(aircraft.tail_number)}
                              disabled={!!removingTail || !!updatingMaintenanceTail || !!hidingOrRestoringTail}
                              className="p-1 px-2 text-[10px] font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-colors flex items-center gap-1 shrink-0 disabled:opacity-40"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              Hide
                            </button>
                          )}

                          {isRemoving ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)] px-3" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveAircraft(aircraft.tail_number)}
                              disabled={!!removingTail || !!updatingMaintenanceTail}
                              className="p-1 px-2 text-[10px] font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors flex items-center gap-1 shrink-0 disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Addition row: Owner & Manager only */}
            {(currentUserRole === 'owner' || currentUserRole === 'manager') && (
              <div className="p-5 bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] rounded-b-2xl">
                <form onSubmit={handleAddAircraft} className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="w-full sm:w-1/3 space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Tail Number
                    </label>
                    <input
                      type="text"
                      required
                      value={newTail}
                      onChange={(e) => setNewTail(e.target.value.toUpperCase())}
                      placeholder="e.g. N172SP"
                      className="w-full text-xs rounded-xl px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)] uppercase font-mono"
                    />
                  </div>
                  <div ref={modelSearchContainerRef} className="w-full sm:w-1/2 space-y-1.5 text-left relative">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Aircraft Model
                    </label>
                    <input
                      type="text"
                      required
                      value={newModel}
                      onChange={(e) => {
                        setNewModel(e.target.value);
                        setShowModelSuggestions(true);
                      }}
                      onFocus={() => setShowModelSuggestions(true)}
                      placeholder="e.g. Cessna 172S"
                      className="w-full text-xs rounded-xl px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--navy)] text-left"
                    />
                    {showModelSuggestions && newModel.trim() !== '' && (() => {
                      const normalizedQuery = normalizeString(newModel);
                      const filteredModels = AIRCRAFT_MODELS.filter(model =>
                        normalizeString(model).includes(normalizedQuery)
                      ).slice(0, 50);

                      return (
                        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 divide-y divide-[var(--border-color)]">
                          {filteredModels.length === 0 ? (
                            <div className="p-3 text-xs text-[var(--text-muted)] italic">
                              No matching models found
                            </div>
                          ) : (
                            filteredModels.map((model) => (
                              <button
                                key={model}
                                type="button"
                                onClick={() => {
                                  setNewModel(model);
                                  setShowModelSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                              >
                                {model}
                              </button>
                            ))
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    type="submit"
                    disabled={!newTail.trim() || !newModel.trim() || addingInProgress}
                    className="w-full sm:w-auto h-[34px] px-6 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
                    style={{ backgroundColor: 'var(--navy)' }}
                  >
                    {addingInProgress ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Aircraft
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Hidden Aircraft Subsection: Owner/Manager only when archivedFleet has records */}
            {(currentUserRole === 'owner' || currentUserRole === 'manager') && archivedFleet.length > 0 && (
              <div className="p-5 border-t bg-[var(--bg-tertiary)]/30" style={{ borderColor: 'var(--border-color)' }}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      Hidden Aircraft ({archivedFleet.length})
                    </h4>
                    <p className="text-[9px] text-[var(--text-muted)] opacity-85 mt-0.5">
                      Archived flight equipment excluded from general schedule booking
                    </p>
                  </div>
                </div>
                <div 
                  className="divide-y border rounded-xl overflow-hidden bg-[var(--bg-secondary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {archivedFleet.map((aircraft) => {
                    const isRemoving = removingTail === aircraft.tail_number;
                    const isHidingOrRestoring = hidingOrRestoringTail === aircraft.tail_number;
                    return (
                      <div
                        key={aircraft.id || aircraft.tail_number}
                        className="p-3 flex flex-row items-center justify-between gap-3 opacity-60 hover:opacity-100 transition-opacity bg-zinc-500/[0.01]"
                        style={{ borderBottomColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-center gap-2 overflow-hidden text-left">
                          <Plane className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          <div className="overflow-hidden">
                            <span className="font-bold text-[var(--text-primary)]">
                              {aircraft.tail_number}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block">
                              {aircraft.aircraft_model}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isHidingOrRestoring ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)] mx-2" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRestoreAircraft(aircraft.tail_number)}
                              disabled={!!removingTail || !!updatingMaintenanceTail || !!hidingOrRestoringTail}
                              className="p-1 px-2 text-[10px] font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-[var(--text-primary)] border cursor-pointer transition-colors flex items-center gap-1 shrink-0 disabled:opacity-40"
                              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Unhide
                            </button>
                          )}

                          {isRemoving ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)] px-3" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveAircraft(aircraft.tail_number)}
                              disabled={!!removingTail || !!updatingMaintenanceTail || !!hidingOrRestoringTail}
                              className="p-1 px-2 text-[10px] font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 text-red-650 dark:text-red-400 cursor-pointer transition-colors flex items-center gap-1 shrink-0 disabled:opacity-40 border border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Leave Section - Only visible if not the owner */}
          {currentUserRole !== 'owner' && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => handleRemoveMember(sessionUser?.id)}
                disabled={!!memberActionLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer opacity-80 hover:opacity-100 disabled:opacity-40"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave this school
              </button>
            </div>
          )}
        </div>
      )}

      {/* New Student Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        onStudentCreated={handleStudentCreated}
        orgId={organization?.id}
        assignedCfiId={newStudentCfi}
      />
    </div>
  );
}
