import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Lock, Mail, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        if (userDoc.exists() && userDoc.data().status === 'deactivated') {
          await auth.signOut();
          setError('Tài khoản của bạn đã bị vô hiệu hóa.');
          setLoading(false);
          return;
        }
      } else {
        if (!name) {
          setError('Vui lòng nhập tên.');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        await setDoc(doc(db, 'users', userCred.user.uid), {
          email,
          name,
          role: 'teacher',
          status: 'active',
          createdAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'teachers', userCred.user.uid), { // Keep this for backwards compatibility for now
          email,
          name
        });
      }
      navigate('/teacher/dashboard');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#183173] p-8 text-center text-white border-b-4 border-[#eab308]">
          <img src="/logo.png" alt="Viet Anh School" className="w-16 h-auto mx-auto mb-3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <h1 className="text-xl font-bold leading-none tracking-tight uppercase mb-2">{t('systemName')}</h1>
          <p className="text-xs text-slate-300 opacity-80">{isLogin ? t('login') : t('register')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-[10px] font-bold uppercase tracking-widest border border-red-200">
              {error}
            </div>
          )}
          
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('fullName')}</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  required={!isLogin}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all text-sm font-semibold text-slate-800"
                  placeholder="Nguyễn Văn B"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all text-sm font-semibold text-slate-800"
                placeholder="teacher@school.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all text-sm font-semibold text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#183173] hover:bg-blue-900 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wide transition-colors flex justify-center items-center mt-4"
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>
          
          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] uppercase font-bold text-slate-400 hover:text-[#183173] transition-colors"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <a href="/" className="text-[10px] uppercase font-bold text-slate-400 hover:text-[#183173] transition-colors block">
              Quay lại trang chủ
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
