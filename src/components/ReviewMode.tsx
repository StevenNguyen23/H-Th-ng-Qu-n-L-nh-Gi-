import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { mockQuestions, mockQuestionsVA1, Question, ANSWER_KEY, ANSWER_KEY_VA1 } from '../data/questions';
import { ChevronLeft, CheckCircle, XCircle, BookOpen } from 'lucide-react';

export default function ReviewMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return;
      const docRef = doc(db, 'submissions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSubmission(docSnap.data());
      }
    };
    fetchSubmission();
  }, [id]);

  if (!submission) return <div className="p-8 text-center">Đang tải...</div>;

  const isPrimary = submission.schoolType === 'VA1';
  const activeQuestions = isPrimary ? mockQuestionsVA1 : mockQuestions;
  const activeAnswerKey = isPrimary ? ANSWER_KEY_VA1 : ANSWER_KEY;

  const readingPassageQuestions = activeQuestions.filter(q => q.id >= 82 && q.id <= 87);
  
  const checkIsCorrect = (qId: number) => {
    const studentAns = submission.answers[qId]?.toLowerCase().trim();
    if (!studentAns) return false;
    const correctAnswer = activeAnswerKey[qId];
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.map(a => String(a).toLowerCase().trim()).includes(studentAns);
    } else if (correctAnswer) {
      return studentAns === String(correctAnswer).toLowerCase().trim();
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans text-slate-800">
      <header className="h-16 bg-[#183173] text-white flex items-center justify-between px-8 border-b-4 border-[#eab308] flex-shrink-0 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher/dashboard')} 
            className="w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight uppercase">Chế độ Xem lại (Review)</h1>
            <p className="text-xs text-slate-300 opacity-80 mt-1">{submission.name}</p>
          </div>
          <button 
            onClick={() => navigate('/teacher/eval')}
            className="ml-4 flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white border border-transparent px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Báo cáo GV & PH
          </button>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl text-[#eab308] leading-none mt-1">{submission.readingScore}<span className="text-sm text-slate-300 font-normal">/100</span></p>
        </div>
      </header>
      
      <div className="hidden print:block mb-8 mt-4 text-center">
        <h1 className="text-2xl font-bold uppercase text-[#183173] mb-2">Kết quả bài thi</h1>
        <p className="text-lg font-bold">Học sinh: {submission.name} - Điểm: {submission.readingScore}/100</p>
      </div>

      <main className="max-w-4xl mx-auto p-6 space-y-4 mt-4 print:p-0 print:mt-0">
        {activeQuestions.map((q) => {
          // Skip individual rendering for reading passage, we will render it as a block at ID 82
          if (q.id > 82 && q.id <= 87) return null;

          if (q.id === 82) {
            return (
              <div key="reading-passage-block" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 print:shadow-none print:border-2">
                <div className="bg-[#183173] text-white p-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#eab308]" />
                  <h2 className="font-bold text-sm uppercase tracking-wider">READING PASSAGE</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
                    {readingPassageQuestions[0]?.instruction}
                  </p>
                  <div className="text-slate-800 leading-loose text-base">
                    {readingPassageQuestions.map((rq) => {
                      const isCorrect = checkIsCorrect(rq.id);
                      const studentAns = submission.answers[rq.id] || '';
                      return (
                        <React.Fragment key={rq.id}>
                          <span className="inline mr-2 text-slate-600">{rq.text?.replace(`(${rq.id})`, '')?.replace('___', '')?.trim()}</span>
                          <span className={`inline-block px-3 py-1 mx-2 border-b-2 font-bold text-center ${isCorrect ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
                            {studentAns || <span className="italic opacity-50 text-xs">Trống</span>}
                            {!isCorrect && (
                               <span className="ml-2 text-xs text-green-700 bg-green-100 px-1 rounded block mt-1 text-center font-normal">
                                 Đáp án: {Array.isArray(activeAnswerKey[rq.id]) ? (activeAnswerKey[rq.id] as string[]).join(' / ') : activeAnswerKey[rq.id]}
                               </span>
                            )}
                          </span>
                        </React.Fragment>
                      )
                    })}
                  </div>
                </div>
              </div>
            );
          }

          const studentAnswer = submission.answers[q.id] || '';
          const isCorrect = checkIsCorrect(q.id);

          return (
            <div key={q.id} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-[#dc2626]'} border-y border-r border-slate-200 print:shadow-none print:break-inside-avoid`}>
              <div className="flex items-start justify-between mb-4">
                {q.type === 'rewrite' ? (
                  <h3 className="font-bold text-slate-800 text-sm">{q.instruction}</h3>
                ) : (
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Câu {q.id}: <span className="font-medium text-slate-700">{q.text}</span></h3>
                    {q.hasImage && (
                      <div className="mt-3">
                        <img src={`/images/q${q.id}.png`} alt={`Question ${q.id}`} className="max-h-32 object-contain rounded border border-slate-200" />
                      </div>
                    )}
                  </div>
                )}
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-4" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 ml-4" />
                )}
              </div>
              
              {q.type === 'mcq' ? (
                <div className="space-y-2">
                  {q.options?.map((opt, i) => {
                    const isSelected = studentAnswer === opt.id;
                    const isActuallyCorrect = activeAnswerKey[q.id] === opt.id;
                    
                    let bgClass = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (isActuallyCorrect) bgClass = 'bg-green-50 border-green-200 text-green-800 font-bold';
                    else if (isSelected && !isActuallyCorrect) bgClass = 'bg-red-50 border-red-200 text-[#dc2626] font-bold';

                    return (
                      <div key={i} className={`p-3 border rounded-lg flex items-center text-sm ${bgClass}`}>
                        <div className={`w-3.5 h-3.5 rounded-full border mr-3 flex items-center justify-center ${isSelected ? 'border-current' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                        <strong className="mr-2">{opt.id}.</strong>{opt.text}
                      </div>
                    )
                  })}
                </div>
              ) : q.type === 'rewrite' ? (
                <div className="space-y-3">
                  <ul className="list-disc pl-6 space-y-4 mb-4">
                    <li className="text-slate-600 font-medium">{q.original}</li>
                    <li className="text-slate-800 font-bold flex items-center flex-wrap gap-2">
                      <span>{q.target_start}</span>
                      <span className={`inline-block px-3 py-1 border-b-2 text-center ${isCorrect ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
                        {studentAnswer || <span className="italic opacity-50 text-xs">Trống</span>}
                      </span>
                      <span>{q.target_end}</span>
                    </li>
                  </ul>
                  {!isCorrect && (
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Đáp án đúng</span>
                      <div className="p-3 rounded-lg border bg-green-50 border-green-200 text-green-800 font-bold text-sm">
                        {Array.isArray(ANSWER_KEY[q.id]) ? (ANSWER_KEY[q.id] as string[]).join(' / ') : ANSWER_KEY[q.id]}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Câu trả lời của học sinh</span>
                    <div className={`p-3 rounded-lg border text-sm ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-[#dc2626]'}`}>
                      {studentAnswer || <span className="italic opacity-50">Không trả lời</span>}
                    </div>
                  </div>
                  {!isCorrect && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Đáp án đúng</span>
                      <div className="p-3 rounded-lg border bg-green-50 border-green-200 text-green-800 font-bold text-sm">
                         {Array.isArray(ANSWER_KEY[q.id]) ? (ANSWER_KEY[q.id] as string[]).join(' / ') : ANSWER_KEY[q.id]}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  );
}
