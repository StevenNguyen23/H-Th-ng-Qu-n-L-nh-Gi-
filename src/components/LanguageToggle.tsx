import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-white/20 p-1 rounded-lg">
      <button
        onClick={() => setLanguage('VIET')}
        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
          language === 'VIET' 
            ? 'bg-white text-[#183173] shadow-sm' 
            : 'text-white hover:bg-white/10'
        }`}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage('ENG')}
        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
          language === 'ENG' 
            ? 'bg-white text-[#183173] shadow-sm' 
            : 'text-white hover:bg-white/10'
        }`}
      >
        EN
      </button>
    </div>
  );
}
