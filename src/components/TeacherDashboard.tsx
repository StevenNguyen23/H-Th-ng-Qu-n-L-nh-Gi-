import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, onSnapshot, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LogOut, FileText, CheckCircle, Clock, Plus, Trash2, BookOpen, AlertTriangle } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [schoolType, setSchoolType] = useState('VA3');
  const [userRole, setUserRole] = useState<'teacher'|'specialist'>('teacher');
  const [canManagePlacementTest, setCanManagePlacementTest] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let unsubDocs: (() => void) | undefined;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (unsubDocs) unsubDocs();
        navigate('/teacher/login');
      } else {
        if (user.uid === 'AMZeFZGUWVe483YN8VJmmlDJMHD2' || user.email === 'minhhoangbluesky6789@gmail.com') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        let userData = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
            setSchoolType(userData.schoolType || 'VA3');
            setUserRole(userData.role || 'teacher');
            setCanManagePlacementTest(!!userData.canManagePlacementTest);
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }

        let q;
        if (userData && userData.role === 'specialist') {
          q = query(collection(db, 'submissions'));
        } else {
          q = query(
            collection(db, 'submissions'),
            where('schoolType', '==', userData ? (userData.schoolType || 'VA3') : 'VA3')
          );
        }
        unsubDocs = onSnapshot(q, (snapshot) => {
          const subs: any[] = [];
          snapshot.forEach(doc => subs.push({ id: doc.id, ...doc.data() }));
          // Sort locally for now to avoid requiring complex composite indexes
          subs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setSubmissions(subs);
          setLoading(false);
        }, (error) => {
          console.error("TeacherDashboard snapshot error:", error);
          setLoading(false);
        });
      }
    });

    return () => {
      if (unsubDocs) unsubDocs();
      unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/teacher/login');
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteDoc(doc(db, 'submissions', deleteConfirmId));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100">{t('loading')}</div>;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('confirmDelete')}</h3>
            <p className="text-sm text-slate-600 mb-6">{t('deleteConfirmPrompt')}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                {t('cancelUppercase')}
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                {t('deleteUppercase')}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="h-16 bg-[#183173] text-white flex items-center justify-between px-8 border-b-4 border-[#eab308] flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center font-bold text-[#183173] text-xl">VA</div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight uppercase">
              {t('systemName')}
            </h1>
            <p className="text-xs text-slate-300 opacity-80 mt-1">{t('systemSubname')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          
          <button 
            onClick={() => navigate('/teacher/eval')}
            className="flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white border border-transparent px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Báo cáo GV & PH
          </button>
          
          {(canManagePlacementTest || userRole === 'specialist' || isAdmin) && (
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-[#eab308] hover:bg-yellow-500 text-[#183173] border border-transparent px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('newTest')}
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
          >
            <LogOut className="w-4 h-4" /> {t('logout')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">{t('loading')}</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 font-medium">{t('noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map(sub => (
              <div key={sub.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{sub.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.currentGrade} ➔ {sub.targetGrade?.replace('Lớp ', '')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {sub.status === 'graded' ? (
                        <span className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> {t('graded')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> {t('waitingInterview')}
                        </span>
                      )}
                      <button 
                        onClick={() => setDeleteConfirmId(sub.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="{t('delete')} bài thi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100 flex-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('readingScore')}</span>
                      <span className="font-bold text-slate-700">{sub.readingScore} <span className="text-slate-400 font-medium">/ {sub.schoolType === 'VA1' ? 70 : 100}</span></span>
                    </div>
                    {sub.status === 'graded' && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalScore')}</span>
                          <span className="font-bold text-slate-700">{sub.totalScore}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('level')}</span>
                          <span className="font-bold text-[#dc2626]">{sub.englishLevel}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    {sub.status === 'pending_interview' ? (
                      <button 
                        onClick={() => navigate(`/teacher/grade/${sub.id}`)}
                        className="col-span-2 bg-[#dc2626] hover:bg-red-700 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wide transition-colors flex justify-center items-center"
                      >
                        {t('gradeInterview')}
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => navigate(`/report/${sub.id}`)}
                          className="bg-[#183173] hover:bg-blue-900 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wide transition-colors flex justify-center items-center"
                        >
                          {t('viewReport')}
                        </button>
                        <button 
                          onClick={() => navigate(`/review/${sub.id}`)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded text-[10px] uppercase tracking-wide transition-colors flex justify-center items-center"
                        >
                          Chi tiết
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
