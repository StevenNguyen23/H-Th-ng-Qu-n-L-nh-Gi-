import React, { useState, useEffect } from 'react';
import { collection, query, doc, setDoc, updateDoc, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { 
  Users, FileText, UserX, UserCheck, Shield, Plus, X, LogOut, 
  Activity, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Modular components
import AdminCharts from './AdminCharts';
import UserProfileModal from './UserProfileModal';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create user states
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newSchoolType, setNewSchoolType] = useState('VA3');
  const [newRole, setNewRole] = useState<'teacher' | 'specialist'>('teacher');
  const [newCanManagePlacementTest, setNewCanManagePlacementTest] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  
  // Modals & selection
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{ id: string, email: string, role: string, isFromSubmission?: boolean, name?: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Filtering/Searching
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  const [stats, setStats] = useState({
    activeStudents: 0,
    totalTeachers: 0,
    uploadedFiles: 0,
    deactivatedAccounts: 0
  });

  useEffect(() => {
    const fetchUsers = () => {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsubscribeUsers = onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
        
        let activeStudents = 0;
        let totalTeachers = 0;
        let deactivatedAccounts = 0;
        
        usersData.forEach((u: any) => {
          if (u.status === 'deactivated') {
            deactivatedAccounts++;
          } else {
            if (u.role === 'student') activeStudents++;
            if (u.role === 'teacher') totalTeachers++;
          }
        });
        
        setStats(prev => ({
          ...prev,
          activeStudents,
          totalTeachers,
          deactivatedAccounts
        }));
      }, (error) => {
        console.error("Admin Users snapshot error:", error);
      });

      return unsubscribeUsers;
    };

    const fetchLogs = () => {
      const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
      const unsubscribeLogs = onSnapshot(q, (snapshot) => {
        setAuditLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Admin Audit logs error:", error);
      });
      return unsubscribeLogs;
    };

    const fetchFiles = () => {
      const q = query(collection(db, 'files'));
      const unsubscribeFiles = onSnapshot(q, (snapshot) => {
        const filesData: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFiles(filesData);
        setStats(prev => ({
          ...prev,
          uploadedFiles: filesData.length
        }));
        
        const fileCounts: Record<string, number> = {};
        filesData.forEach((file: any) => {
          if (file.userId) {
            fileCounts[file.userId] = (fileCounts[file.userId] || 0) + 1;
          }
        });
        
        setUsers(currentUsers => currentUsers.map(u => ({
          ...u,
          fileCount: fileCounts[u.id] || 0
        })));
      }, (error) => {
        console.error("Admin Files error:", error);
      });
      return unsubscribeFiles;
    };

    const fetchSubmissions = () => {
      const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
      const unsubscribeSubmissions = onSnapshot(q, (snapshot) => {
        const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubmissions(subs);
      }, (error) => {
        console.error("Admin Submissions error:", error);
      });
      return unsubscribeSubmissions;
    };

    const unsubUsers = fetchUsers();
    const unsubLogs = fetchLogs();
    const unsubFiles = fetchFiles();
    const unsubSubmissions = fetchSubmissions();
    setLoading(false);

    return () => {
      unsubUsers();
      unsubLogs();
      unsubFiles();
      unsubSubmissions();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/teacher/login');
  };

  const addAuditLog = async (action: string) => {
    try {
      const newLogRef = doc(collection(db, 'auditLogs'));
      await setDoc(newLogRef, {
        action,
        timestamp: new Date().toISOString(),
        adminId: auth.currentUser?.uid
      });
    } catch (e) {
      console.error("Error adding audit log: ", e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      const primaryApp = getApp();
      const secondaryApp = getApps().find(app => app.name === 'Secondary') || initializeApp(primaryApp.options, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      await updateProfile(userCred.user, { displayName: newName });
      
      const userData: any = {
        email: newEmail,
        name: newName,
        role: newRole,
        status: 'active',
        createdAt: new Date().toISOString(),
        fileCount: 0
      };

      if (newRole === 'teacher') {
        userData.schoolType = newSchoolType;
        userData.canManagePlacementTest = newCanManagePlacementTest;
      }

      await setDoc(doc(db, 'users', userCred.user.uid), userData);
      
      if (newRole === 'teacher') {
        await setDoc(doc(db, 'teachers', userCred.user.uid), {
          email: newEmail,
          name: newName,
          schoolType: newSchoolType
        });
      }

      await addAuditLog(`Admin created ${newRole} ${newName} (${newEmail})`);
      
      await secondaryAuth.signOut();
      
      setIsCreatingUser(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewSchoolType('VA3');
      setNewRole('teacher');
      setNewCanManagePlacementTest(false);
    } catch (err: any) {
      setCreateError(err.message || t('errorCreatingUser'));
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string, email: string) => {
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    try {
      const userRef = doc(db, 'users', userId);
      const userObj = getCombinedUsersList().find(u => u.id === userId);
      if (userObj?.isFromSubmission) {
        await setDoc(userRef, {
          email: userObj.email || 'N/A',
          name: userObj.name || t('student'),
          role: 'student',
          status: newStatus,
          createdAt: userObj.createdAt || new Date().toISOString(),
          fileCount: 0
        });
      } else {
        await updateDoc(userRef, {
          status: newStatus
        });
      }
      await addAuditLog(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'} account ${email}`);
    } catch (e) {
      console.error("Error toggling status: ", e);
    }
  };

  const executeDeleteUser = async () => {
    if (deleteConfirmUser) {
      const { id, email, role, isFromSubmission, name } = deleteConfirmUser;
      try {
        if (isFromSubmission) {
          const userSubmissions = submissions.filter(s => 
            (s.email && s.email.toLowerCase() === email.toLowerCase()) || 
            (!s.email && s.name && s.name.toLowerCase() === (name || '').toLowerCase())
          );
          for (const sub of userSubmissions) {
            await deleteDoc(doc(db, 'submissions', sub.id));
          }
          await addAuditLog(`Admin deleted all submissions for virtual user ${email || name}`);
        } else {
          await deleteDoc(doc(db, 'users', id));
          if (role === 'teacher') {
            await deleteDoc(doc(db, 'teachers', id));
          }
          await addAuditLog(`Admin deleted user account ${email}`);
        }
      } catch (e) {
        console.error("Error deleting user: ", e);
      }
      setDeleteConfirmUser(null);
    }
  };

  const getCombinedUsersList = () => {
    const list = [...users];
    
    const studentEmails = new Set(list.filter(u => u.role === 'student').map(u => u.email?.toLowerCase()));
    const studentNames = new Set(list.filter(u => u.role === 'student').map(u => u.name?.toLowerCase()));
    
    submissions.forEach(sub => {
      const email = sub.email || '';
      const name = sub.name || '';
      const emailLower = email.toLowerCase();
      const nameLower = name.toLowerCase();
      
      if ((email && !studentEmails.has(emailLower)) || (!email && name && !studentNames.has(nameLower))) {
        if (email) studentEmails.add(emailLower);
        if (name) studentNames.add(nameLower);
        
        list.push({
          id: sub.id,
          name: name || t('student'),
          email: email || 'N/A',
          role: 'student',
          status: 'active',
          createdAt: sub.createdAt ? (sub.createdAt.toDate ? sub.createdAt.toDate().toISOString() : new Date(sub.createdAt).toISOString()) : new Date().toISOString(),
          isFromSubmission: true,
          fileCount: 0
        });
      }
    });
    
    let filtered = list;
    if (userRoleFilter !== 'all') {
      filtered = list.filter(u => (u.role || 'student') === userRoleFilter);
    }
    
    if (userSearchTerm.trim()) {
      const term = userSearchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name || '').toLowerCase().includes(term) || 
        (u.email || '').toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans text-slate-500">{t('loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('confirmPermanentDelete')}</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to permanently delete <strong className="text-red-600">{deleteConfirmUser.email}</strong>? {t('cannotUndo')}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                {t('cancelUppercase')}
              </button>
              <button 
                onClick={executeDeleteUser}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                {t('permanentDeleteUppercase')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed User Profile Drawer Modal */}
      {selectedUser && (
        <UserProfileModal 
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          files={files}
          submissions={submissions}
          onViewReport={(subId) => {
            setSelectedUser(null);
            navigate(`/report/${subId}`);
          }}
        />
      )}

      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-8 border-b-4 border-red-500 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-wide uppercase leading-none">{t('adminTitle')}</h1>
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse border border-red-500 shadow-sm flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> ADMIN VIEW
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{t('systemSubname')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <LanguageToggle />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Administrator</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded transition-colors uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" /> {t('logout')}
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> Total Active Students
              </div>
              <div className="text-3xl font-black text-slate-800">{stats.activeStudents}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" /> Total Teachers
              </div>
              <div className="text-3xl font-black text-slate-800">{stats.totalTeachers}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Total Uploaded Files
              </div>
              <div className="text-3xl font-black text-slate-800">{stats.uploadedFiles}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                <UserX className="w-4 h-4 text-red-500" /> Deactivated Accounts
              </div>
              <div className="text-3xl font-black text-slate-800">{stats.deactivatedAccounts}</div>
            </div>
          </div>

          {/* DYNAMIC PERFORMANCE DASHBOARD VISUALISATIONS (CHARTS AT TOP) */}
          <AdminCharts submissions={submissions} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* USER MANAGEMENT */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider">
                    <Users className="w-5 h-5 text-slate-400" />
                    User Management
                  </h2>
                  <button 
                    onClick={() => setIsCreatingUser(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors animate-in duration-200"
                  >
                    <Plus className="w-4 h-4" /> Add Teacher
                  </button>
                </div>
                
                {/* Search & Tabs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input 
                      type="text"
                      placeholder="{t('searchPlaceholder')}"
                      value={userSearchTerm}
                      onChange={e => setUserSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 bg-white font-medium"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { key: 'all', label: t('all') },
                      { key: 'admin', label: 'Admin' },
                      { key: 'teacher', label: t('teacher') },
                      { key: 'student', label: t('student') }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setUserRoleFilter(tab.key)}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors whitespace-nowrap ${
                          userRoleFilter === tab.key 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isCreatingUser && (
                <div className="p-6 bg-slate-100 border-b border-slate-200 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm text-slate-800">Create New Account</h3>
                    <button onClick={() => setIsCreatingUser(false)} className="text-slate-500 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {createError && <div className="text-red-500 text-xs font-bold mb-3">{createError}</div>}
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      required 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)}
                      className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-slate-500"
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      required 
                      value={newEmail} 
                      onChange={e => setNewEmail(e.target.value)}
                      className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-slate-500"
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      required 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-slate-500"
                    />
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value as 'teacher' | 'specialist')}
                      className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-slate-500 bg-white"
                    >
                      <option value="teacher">{t('teacher')}</option>
                      <option value="specialist">{t('specialist')}</option>
                    </select>

                    {newRole === 'teacher' && (
                      <select
                        value={newSchoolType}
                        onChange={e => setNewSchoolType(e.target.value)}
                        className="p-2 border border-slate-300 rounded text-sm outline-none focus:border-slate-500 bg-white"
                      >
                        <option value="VA1">{t('primary')} (VA1)</option>
                        <option value="VA3">{t('secondary')} (VA3)</option>
                      </select>
                    )}

                    {newRole === 'teacher' && (
                      <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-1">
                        <input
                          type="checkbox"
                          checked={newCanManagePlacementTest}
                          onChange={(e) => setNewCanManagePlacementTest(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        {t('allowPlacementTest')}
                      </label>
                    )}
                    <button 
                      type="submit" 
                      disabled={createLoading}
                      className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold py-2 rounded text-xs uppercase tracking-wider transition-colors"
                    >
                      {createLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </form>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 sticky top-0 z-10">
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Files</th>
                      <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCombinedUsersList().map(u => (
                      <tr 
                        key={u.id} 
                        onClick={() => setSelectedUser(u)}
                        className="border-b border-slate-100 hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-sm text-slate-800">{u.name || 'Unnamed'}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                              u.role === 'teacher' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {u.role || 'student'}
                            </span>
                            {u.role === 'teacher' && u.schoolType && (
                              <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200">
                                {u.schoolType}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                            u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-600">
                          {u.fileCount || 0}
                        </td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleUserStatus(u.id, u.status || 'active', u.email);
                                }}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                                  u.status === 'active' 
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                }`}
                              >
                                {u.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmUser({ id: u.id, email: u.email, role: u.role || 'student', isFromSubmission: u.isFromSubmission, name: u.name });
                                }}
                                className="px-2 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                title="{t('deleteUser')}"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {getCombinedUsersList().length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 text-sm font-medium">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUDIT LOG TIMELINE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider">
                  <Activity className="w-5 h-5 text-slate-400" />
                  Audit Logs
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex gap-3 items-start relative pl-4 border-l-2 border-slate-200">
                    <div className="absolute w-2 h-2 rounded-full bg-slate-400 -left-[5px] top-1.5 animate-pulse"></div>
                    <div>
                      <p className="text-sm text-slate-700 font-medium">{log.action}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-8">No recent activity.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
