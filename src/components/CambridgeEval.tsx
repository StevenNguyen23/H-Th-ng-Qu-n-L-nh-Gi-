import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function CambridgeEval() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [userRole, setUserRole] = useState<'teacher' | 'specialist' | 'admin' | 'parent'>('teacher');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.uid === 'AMZeFZGUWVe483YN8VJmmlDJMHD2' || user.email === 'minhhoangbluesky6789@gmail.com') {
          setIsAdmin(true);
          setUserRole('admin');
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setUserRole(userDoc.data().role || 'teacher');
            }
          } catch (error) {
            console.error("Error fetching role:", error);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getMappedRole = () => {
    if (isAdmin || userRole === 'admin') return 'admin';
    if (userRole === 'specialist') return 'cv';
    if (userRole === 'teacher') return 'gv';
    return 'ph'; // default fallback for parents
  };

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const activeRole = getMappedRole();
      iframeRef.current.contentWindow.postMessage({ type: 'SET_ROLE', role: activeRole }, '*');
      iframeRef.current.contentWindow.postMessage({ type: 'SET_LANGUAGE', language: language }, '*');
    }
  }, [userRole, isAdmin, language]);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const activeRole = getMappedRole();
      iframeRef.current.contentWindow.postMessage({ type: 'SET_ROLE', role: activeRole }, '*');
      iframeRef.current.contentWindow.postMessage({ type: 'SET_LANGUAGE', language: language }, '*');
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f1f5f9]">
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between z-10 shrink-0 relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-[#183173] transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToDashboard')}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageToggle />
        </div>
      </header>
      <div className="flex-1 w-full h-full relative">
        <iframe 
          ref={iframeRef}
          src="/cambridge-eval.html" 
          className="w-full h-full border-none absolute inset-0 bg-white"
          title="Cambridge Eval System"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}
