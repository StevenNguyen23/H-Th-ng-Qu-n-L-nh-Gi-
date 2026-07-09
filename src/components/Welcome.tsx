import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { BookOpen, User, GraduationCap, Target, LogIn } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [currentGrade, setCurrentGrade] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schoolType, setSchoolType] = useState('VA3');
  const [canManagePlacementTest, setCanManagePlacementTest] = useState(false);
  const [userRole, setUserRole] = useState('teacher');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setTeacherId(currentUser.uid);
        if (currentUser.uid === 'AMZeFZGUWVe483YN8VJmmlDJMHD2' || currentUser.email === 'minhhoangbluesky6789@gmail.com') {
          setIsAdmin(true);
        }
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSchoolType(data.schoolType || 'VA3');
            setCanManagePlacementTest(!!data.canManagePlacementTest);
            setUserRole(data.role || 'teacher');
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentGrade || !targetGrade || !teacherId) return;
    
    // Check permission
    if (!isAdmin && userRole === 'teacher' && !canManagePlacementTest) {
      alert(t('noPermissionPlacementTest'));
      return;
    }

    // Save to local storage for the test session
    localStorage.setItem('studentInfo', JSON.stringify({ name, currentGrade, targetGrade, teacherId, schoolType }));
    navigate('/test');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#183173] p-8 text-center text-white border-b-4 border-[#eab308]">
          <img src="/logo.png" alt="Viet Anh School" className="w-16 h-auto mx-auto mb-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <h1 className="text-xl font-bold leading-none tracking-tight uppercase mb-2">
            {t('systemName')}
          </h1>
          <p className="text-xs text-slate-300 opacity-80">{t('systemSubname')}</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">{t('loading')}</div>
        ) : user ? (
          (!isAdmin && userRole === 'teacher' && !canManagePlacementTest) ? (
            <div className="p-8 text-center space-y-4">
              <div className="text-red-500 font-bold">{t('noPermissionPlacementTest')}</div>
              <button 
                onClick={() => navigate('/teacher/dashboard')}
                className="bg-[#183173] text-white px-4 py-2 rounded text-sm font-bold uppercase"
              >
                {t('backToDashboard')}
              </button>
            </div>
          ) : (
          <form onSubmit={handleStart} className="p-8 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('student')} {t('name')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all text-sm font-semibold text-slate-800"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('currentGrade')}</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select 
                  required
                  value={currentGrade}
                  onChange={e => setCurrentGrade(e.target.value)}
                  className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all appearance-none text-sm font-semibold text-slate-800"
                >
                  <option value="">Chọn lớp hiện tại</option>
                  {(schoolType === 'VA1' ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11, 12]).map(g => (
                    <option key={g} value={`Lớp ${g}`}>Lớp {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lớp đăng ký (Target Grade)</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select 
                  required
                  value={targetGrade}
                  onChange={e => setTargetGrade(e.target.value)}
                  className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all appearance-none text-sm font-semibold text-slate-800"
                >
                  <option value="">Chọn lớp đăng ký</option>
                  {(schoolType === 'VA1' ? [1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11, 12]).map(g => (
                    <option key={g} value={`Lớp ${g}`}>Lớp {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#183173] hover:bg-blue-900 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition-colors flex justify-center items-center gap-2 mt-4"
            >
              {t('startTest')}
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => navigate('/teacher/dashboard')}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-[#183173] transition-colors"
              >
                {t('manageTests')}
              </button>
            </div>
          </form>
          )
        ) : (
          <div className="p-8 text-center space-y-6">
            <p className="text-sm text-slate-600 font-medium">
              {t('loginTeacherToCreate')}
            </p>
            <button 
              onClick={() => navigate('/teacher/login')}
              className="w-full bg-[#183173] hover:bg-blue-900 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition-colors flex justify-center items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> {t('teacher')} {t('login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
