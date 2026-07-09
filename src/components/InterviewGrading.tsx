import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CEFR_QUESTIONS, CEFR_QUESTIONS_VA1 } from '../data/questions';
import { Check, ChevronLeft, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LevelScore {
  vocab: number;
  pronunciation: number;
  fluency: number;
}

export default function InterviewGrading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [levelScores, setLevelScores] = useState<Record<string, LevelScore>>({});
  const [cefrTicks, setCefrTicks] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return;
      const docRef = doc(db, 'submissions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSubmission({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert('Không tìm thấy bài thi.');
        navigate('/teacher/dashboard');
      }
      setLoading(false);
    };
    fetchSubmission();
  }, [id, navigate]);

  const activeCefrQuestions = submission?.schoolType === 'VA1' ? CEFR_QUESTIONS_VA1 : CEFR_QUESTIONS;

  const toggleCefrTick = (question: string) => {
    setCefrTicks(prev => 
      prev.includes(question) 
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const handleScoreChange = (level: string, field: keyof LevelScore, value: string) => {
    const numValue = Math.min(5, Math.max(0, Number(value) || 0));
    setLevelScores(prev => ({
      ...prev,
      [level]: {
        vocab: '',
        pronunciation: '',
        fluency: '',
        ...(prev[level] || {}),
        [field]: numValue
      } as any
    }));
  };

  const determineLevel = () => {
    let highestLevelIndex = -1;
    activeCefrQuestions.forEach((block, index) => {
      const hasTick = block.questions.some(q => cefrTicks.includes(q));
      if (hasTick) {
        highestLevelIndex = index;
      }
    });
    
    // If no ticks, maybe fallback to reading score or 'Beginner'
    if (highestLevelIndex === -1) return 'Not Evaluated'; 
    return activeCefrQuestions[highestLevelIndex].level;
  };

  const handleSave = async () => {
    if (!id || !submission) return;
    setIsSaving(true);
    
    const finalScore = submission.readingScore || 0;
    const englishLevel = determineLevel();

    try {
      const docRef = doc(db, 'submissions', id);
      await updateDoc(docRef, {
        status: 'graded',
        interviewScore: {
          levelScores,
          cefrTicks
        },
        teacherComments: comments,
        totalScore: finalScore,
        englishLevel
      });
      navigate(`/report/${id}`);
    } catch (error) {
      console.error('Lỗi khi lưu kết quả:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;
  if (!submission) return null;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans text-slate-800">
      <header className="h-16 bg-[#183173] text-white flex items-center justify-between px-8 border-b-4 border-[#eab308] flex-shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher/dashboard')} 
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight uppercase">Chấm phỏng vấn</h1>
            <p className="text-xs text-slate-300 opacity-80 mt-1">{submission.name} - {submission.currentGrade}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Điểm Đọc hiểu</p>
          <p className="font-bold text-xl text-[#eab308] leading-none mt-1">{submission.readingScore}<span className="text-sm text-slate-300 font-normal">/100</span></p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6 mt-4">
        
        <div className="space-y-6">
          {activeCefrQuestions.map((levelBlock, i) => {
            const level = levelBlock.level;
            const currentScores = levelScores[level] || { vocab: '', pronunciation: '', fluency: '' };
            let questionIndexOffset = 1;
            for(let k=0; k<i; k++) {
              questionIndexOffset += activeCefrQuestions[k].questions.length;
            }

            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-[#eab308] px-6 py-4">
                  <h2 className="text-lg font-bold text-[#183173]">Level: {level}</h2>
                </div>
                
                {/* Questions */}
                <div className="p-6 border-b border-slate-100">
                  <div className="space-y-4">
                    {levelBlock.questions.map((q, j) => {
                      const isTicked = cefrTicks.includes(q);
                      const qNumber = questionIndexOffset + j;
                      return (
                        <label key={j} className="flex items-start gap-4 cursor-pointer group p-2 hover:bg-slate-50 rounded transition-colors">
                          <div className={`mt-0.5 w-6 h-6 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors ${
                            isTicked ? 'bg-[#183173] border-[#183173] text-white' : 'border-slate-300 group-hover:border-[#183173] bg-white'
                          }`}>
                            {isTicked && <Check className="w-4 h-4" />}
                          </div>
                          <span className={`text-base ${isTicked ? 'text-[#183173] font-bold' : 'text-slate-700'}`}>
                            {qNumber}. {q}
                          </span>
                          <input type="checkbox" className="hidden" checked={isTicked} onChange={() => toggleCefrTick(q)} />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Scoring */}
                <div className="p-6 bg-[#f8fafc]">
                  <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-4">ĐIỂM KỸ NĂNG CHO {level.toUpperCase()} (0-5)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#183173] mb-2">Vocab & Grammar</label>
                      <input 
                        type="number" 
                        min="0" max="5" step="0.5"
                        value={currentScores.vocab ?? ''} 
                        onChange={e => handleScoreChange(level, 'vocab', e.target.value)} 
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all text-sm font-medium bg-white" 
                        placeholder="Max: 5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#183173] mb-2">Pronunciation</label>
                      <input 
                        type="number" 
                        min="0" max="5" step="0.5"
                        value={currentScores.pronunciation ?? ''} 
                        onChange={e => handleScoreChange(level, 'pronunciation', e.target.value)} 
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all text-sm font-medium bg-white" 
                        placeholder="Max: 5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#183173] mb-2">Interactive & Fluency</label>
                      <input 
                        type="number" 
                        min="0" max="5" step="0.5"
                        value={currentScores.fluency ?? ''} 
                        onChange={e => handleScoreChange(level, 'fluency', e.target.value)} 
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#183173] focus:border-[#183173] outline-none transition-all text-sm font-medium bg-white" 
                        placeholder="Max: 5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-bold text-[#183173] uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Nhận xét của giáo viên</h2>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            className="w-full p-4 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#183173] focus:border-[#183173] outline-none min-h-[120px] text-sm bg-slate-50 font-medium text-slate-700"
            placeholder="Nhập nhận xét chi tiết về điểm mạnh, điểm yếu của học sinh..."
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#dc2626] hover:bg-red-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-lg uppercase tracking-wide transition-colors flex justify-center items-center gap-2 text-sm shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Đang lưu...' : 'Hoàn tất & Lưu kết quả'}
        </button>

      </main>
    </div>
  );
}

