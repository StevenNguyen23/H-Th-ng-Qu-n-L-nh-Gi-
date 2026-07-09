import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockQuestions, mockQuestionsVA1, Question, ANSWER_KEY, ANSWER_KEY_VA1 } from '../data/questions';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Clock, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Test() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const info = localStorage.getItem('studentInfo');
    if (!info) {
      navigate('/');
      return;
    }
    setStudentInfo(JSON.parse(info));
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string | number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const isPrimary = studentInfo?.schoolType === 'VA1';
  const activeQuestions = isPrimary ? mockQuestionsVA1 : mockQuestions;
  const activeAnswerKey = isPrimary ? ANSWER_KEY_VA1 : ANSWER_KEY;

  const calculateReadingScore = () => {
    let score = 0;
    activeQuestions.forEach(q => {
      const studentAns = answers[q.id]?.toLowerCase().trim();
      if (!studentAns) return;
      const correctAnswer = activeAnswerKey[q.id];
      if (Array.isArray(correctAnswer)) {
        if (correctAnswer.map(a => String(a).toLowerCase().trim()).includes(studentAns)) {
          score++;
        }
      } else if (correctAnswer) {
        if (studentAns === String(correctAnswer).toLowerCase().trim()) {
          score++;
        }
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const readingScore = calculateReadingScore();
      const docRef = await addDoc(collection(db, 'submissions'), {
        ...studentInfo,
        answers,
        readingScore,
        status: 'pending_interview',
        createdAt: serverTimestamp()
      });
      localStorage.removeItem('studentInfo');
      navigate(`/teacher/grade/${docRef.id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      setIsSubmitting(false);
    }
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];
  
  // Determine if we should show the reading passage block (questions 82-87)
  const isReadingPassageBlock = currentQuestion.id >= 82 && currentQuestion.id <= 87;
  const readingPassageQuestions = isReadingPassageBlock ? activeQuestions.filter(q => q.id >= 82 && q.id <= 87) : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar for Navigation */}
      <div className="w-full md:w-72 bg-white border-r border-slate-200 md:h-screen md:sticky md:top-0 flex flex-col shadow-sm">
        <div className="p-4 bg-[#183173] text-white flex items-center justify-between border-b-4 border-[#eab308]">
          <div className="flex flex-col items-start">
            <span className="text-[10px] opacity-70 uppercase tracking-widest">{t('timeRemaining')}</span>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-[#eab308]" />
              <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        <div className="p-5 flex-grow overflow-y-auto">
          <h2 className="text-xs font-bold text-[#183173] uppercase tracking-wider border-b border-slate-100 pb-2 mb-4 flex justify-between">
            <span>{t('questionList')}</span>
            <span className="text-[#dc2626]">{Object.keys(answers).length}/{activeQuestions.length}</span>
          </h2>
          <div className="grid grid-cols-5 gap-1 pr-1">
            {activeQuestions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`aspect-square rounded-[2px] text-[10px] font-bold flex items-center justify-center transition-colors ${
                  currentQuestionIndex === idx || (isReadingPassageBlock && q.id >= 82 && q.id <= 87)
                    ? 'ring-1 ring-[#183173] ring-offset-1 bg-[#183173] text-white'
                    : answers[q.id] 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {q.id}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-slate-400 mt-4 italic">Đã trả lời: {Object.keys(answers).length}/{activeQuestions.length}</div>
        </div>
        <div className="p-5 border-t border-slate-200 bg-white">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#dc2626] hover:bg-red-700 disabled:bg-slate-400 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wide transition-colors flex justify-center items-center gap-2"
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài sớm'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 p-4 md:p-6 w-full mx-auto max-w-4xl flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
            
            {isReadingPassageBlock ? (
              <>
                <div className="bg-[#183173] text-white p-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#eab308]" />
                  <h2 className="font-bold text-sm uppercase tracking-wider">READING PASSAGE</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
                    {readingPassageQuestions[0]?.instruction}
                  </p>
                  <div className="text-slate-800 leading-loose text-base">
                    {readingPassageQuestions.map((q, i) => (
                      <React.Fragment key={q.id}>
                        <span className="inline mr-2 text-slate-600">{q.text?.replace(`(${q.id})`, '')?.replace('___', '')?.trim()}</span>
                        <input
                          type="text"
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswer(q.id, e.target.value)}
                          className="inline-block w-24 mx-2 border-b-2 border-slate-300 bg-slate-50 text-center text-[#183173] font-bold focus:border-[#183173] focus:outline-none focus:bg-white transition-colors"
                        />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider mb-3 border border-slate-200">
                    {currentQuestion.type === 'mcq' && 'Trắc nghiệm'}
                    {currentQuestion.type === 'fill' && 'Điền từ'}
                    {currentQuestion.type === 'rewrite' && 'Viết lại câu'}
                  </span>
                  
                  {currentQuestion.type === 'rewrite' ? (
                    <>
                      <h2 className="text-lg font-bold text-[#183173] leading-snug mb-4">
                        {currentQuestion.instruction}
                      </h2>
                      <ul className="list-disc pl-6 space-y-4">
                        <li className="text-slate-600 font-medium">{currentQuestion.original}</li>
                        <li className="text-slate-800 font-bold flex items-center flex-wrap gap-2">
                          <span>{currentQuestion.target_start}</span>
                          <input
                            type="text"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                            className="inline-block min-w-[120px] px-2 py-1 border-b-2 border-slate-300 bg-slate-50 text-center text-[#183173] focus:border-[#183173] focus:outline-none focus:bg-white transition-colors"
                          />
                          <span>{currentQuestion.target_end}</span>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-bold text-[#183173] leading-snug">
                        <span className="text-slate-400 mr-2">{currentQuestion.id}.</span>
                        {currentQuestion.text}
                      </h2>
                      {currentQuestion.hasImage && (
                        <div className="mt-4 flex justify-center">
                          <img src={`/images/q${currentQuestion.id}.png`} alt={`Question ${currentQuestion.id}`} className="max-h-48 object-contain rounded border border-slate-200 shadow-sm" />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  {currentQuestion.type === 'mcq' && currentQuestion.options?.map((opt, i) => (
                    <label 
                      key={i} 
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        answers[currentQuestion.id] === opt.id 
                          ? 'border-[#183173] bg-slate-50 ring-1 ring-[#183173]' 
                          : 'border-slate-200 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        value={opt.id}
                        checked={answers[currentQuestion.id] === opt.id}
                        onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                        className="w-4 h-4 text-[#183173] border-slate-300 focus:ring-[#183173]"
                      />
                      <span className="ml-3 text-slate-700 text-sm font-medium"><strong className="mr-2">{opt.id}.</strong>{opt.text}</span>
                    </label>
                  ))}

                  {currentQuestion.type === 'fill' && (
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="w-full p-4 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#183173] focus:border-[#183173] outline-none text-sm bg-slate-50"
                      placeholder="Nhập câu trả lời của bạn..."
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center gap-4 mt-auto">
            <button
              onClick={() => setCurrentQuestionIndex(prev => isReadingPassageBlock ? 80 : Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded text-slate-700 text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Câu trước
            </button>
            {currentQuestionIndex === activeQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#dc2626] text-white rounded text-[10px] font-bold uppercase tracking-wide hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => isReadingPassageBlock ? 87 : Math.min(activeQuestions.length - 1, prev + 1))}
                disabled={isReadingPassageBlock && currentQuestionIndex === 86}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-wide hover:bg-slate-900 disabled:opacity-50 transition-colors"
              >
                Câu tiếp <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
