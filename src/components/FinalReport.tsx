import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Printer, ChevronLeft } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export default function FinalReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<any>(null);
  const [teacherName, setTeacherName] = useState<string>('');

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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.displayName) {
           setTeacherName(user.displayName);
        } else {
           const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
           if (teacherDoc.exists() && teacherDoc.data().name) {
             setTeacherName(teacherDoc.data().name);
           } else {
             setTeacherName(user.email?.split('@')[0] || '');
           }
        }
      }
    });

    return () => unsubscribe();
  }, [id]);

  if (!submission) return <div className="p-8 text-center">Đang tải...</div>;

  const dateStr = submission.createdAt?.toDate().toLocaleDateString('en-GB') || new Date().toLocaleDateString('en-GB');

  const isPrimary = submission.schoolType === 'VA1';
  
  // Compute Reading Level based on score
  const getReadingLevel = (score: number) => {
    if (isPrimary) {
      if (score <= 12) return 'Pre-A1';
      if (score <= 26) return 'Pre-A1 Starters';
      if (score <= 40) return 'A1 Movers';
      if (score <= 50) return 'A2 Flyers';
      if (score <= 60) return 'A2 KET';
      return 'B1 PET';
    } else {
      if (score <= 15) return 'Beginner';
      if (score <= 30) return 'Pre-A1';
      if (score <= 45) return 'A1 Elementary';
      if (score <= 60) return 'A2 KET';
      if (score <= 75) return 'B1 PET';
      if (score <= 88) return 'B2 IELTS 1';
      return 'C1 IELTS 2';
    }
  };

  const readingLevel = getReadingLevel(submission.readingScore || 0);
  
  // Speaking computations
  const speakingTargetLevel = submission.englishLevel || 'N/A';
  const levelScore = submission.interviewScore?.levelScores?.[speakingTargetLevel] || 
                     { vocab: 0, pronunciation: 0, fluency: 0 };
  const interviewTotal = (levelScore.vocab || 0) + (levelScore.pronunciation || 0) + (levelScore.fluency || 0);
  
  const cefrTicks = submission.interviewScore?.cefrTicks || [];
  const questionsAnsweredCount = cefrTicks.length;

  return (
    <div className="min-h-screen bg-slate-100 py-8 font-sans text-slate-800 flex justify-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      {/* Floating Action Menu (Hidden on Print) */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden">
        <button 
          onClick={() => navigate('/teacher/eval')}
          className="bg-[#1e40af] text-white p-4 rounded-full shadow-lg shadow-blue-100 hover:bg-[#1e3a8a] transition-colors flex items-center justify-center"
          title="Báo cáo GV & PH"
        >
          <BookOpen className="w-5 h-5" />
        </button>
        <button 
          onClick={() => navigate('/teacher/dashboard')}
          className="bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-900 transition-colors flex items-center justify-center"
          title="Về bảng điều khiển"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-[#dc2626] text-white p-4 rounded-full shadow-lg shadow-red-100 hover:bg-red-700 transition-colors flex items-center justify-center"
          title="In báo cáo kết quả"
        >
          <Printer className="w-5 h-5" />
        </button>
      </div>

      {/* A4 Document Container */}
      <div className="w-full max-w-[210mm] bg-white shadow-md border-t-2 border-[#183173] min-h-[297mm] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-10 pt-10 pb-6 border-b border-slate-300">
          <div className="flex flex-col items-center justify-center w-24">
            <img src="/logo.png" alt="VA Logo" className="w-20 h-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="text-[10px] font-bold text-[#eab308] mt-1 text-center whitespace-nowrap uppercase">Viet Anh</div>
          </div>
          
          <div className="text-right flex-1 ml-4">
            <p className="text-[10px] font-bold text-slate-600 mb-1 whitespace-nowrap">VA - HỆ THỐNG ĐÁNH GIÁ VÀ BỘ CÔNG CỤ CHUẨN HÓA - {isPrimary ? 'PRIMARY' : 'SECONDARY'} PLACEMENT TEST</p>
            <h1 className="text-3xl font-bold text-[#183173] tracking-wide mb-1">PLACEMENT TEST REPORT</h1>
            <p className="text-sm text-slate-500">School Year 2026 - 2027</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-10 py-6 flex-1 flex flex-col">
          
          {/* Info Section */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6 text-[15px]">
            <div className="flex items-end">
              <span className="font-bold text-[#183173] whitespace-nowrap mr-3 w-32">Student's name:</span>
              <span className="border-b border-dotted border-slate-400 flex-1 pb-1">{submission.name}</span>
            </div>
            <div className="flex items-end">
              <span className="font-bold text-[#183173] whitespace-nowrap mr-3 w-28">Date of Test:</span>
              <span className="border-b border-dotted border-slate-400 flex-1 pb-1">{dateStr}</span>
            </div>
            <div className="flex items-end">
              <span className="font-bold text-[#183173] whitespace-nowrap mr-3 w-32">Current Grade:</span>
              <span className="border-b border-dotted border-slate-400 flex-1 pb-1">{submission.currentGrade?.replace('Lớp ', '') || ''}</span>
            </div>
            <div className="flex items-end">
              <span className="font-bold text-[#183173] whitespace-nowrap mr-3 w-28">Target Grade:</span>
              <span className="border-b border-dotted border-slate-400 flex-1 pb-1">{submission.targetGrade?.replace('Lớp ', '') || ''}</span>
            </div>
            <div className="flex items-end col-span-2">
              <span className="font-bold text-[#183173] whitespace-nowrap mr-3 w-32">Assessor:</span>
              <input 
                type="text" 
                value={teacherName} 
                onChange={(e) => setTeacherName(e.target.value)} 
                className="border-b border-dotted border-slate-400 flex-1 pb-1 bg-transparent outline-none focus:border-[#183173] text-slate-800 print:border-b-0 print:pb-1"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-8 flex items-center print:bg-transparent print:border-none print:p-0">
            <span className="font-bold text-xl text-[#dc2626] whitespace-nowrap mr-4">FINAL ENGLISH LEVEL:</span>
            <input type="text" className="flex-1 bg-transparent border-b-2 border-dotted border-slate-400 outline-none h-8 text-xl font-bold text-[#183173] px-2 print:border-b-0 print:p-0" placeholder="Nhập cấp độ tiếng Anh..." />
          </div>

          {/* Reading & Writing Table */}
          <div className="mb-6 rounded-t-lg overflow-hidden border border-slate-300">
            <div className="bg-[#183173] text-white py-3 px-4 font-bold tracking-widest text-sm uppercase">
              READING & WRITING
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#f0f4f8] text-[#183173] text-sm font-bold border-b border-slate-300">
                  <th className="py-3 px-2 border-r border-slate-300 w-1/4">Correct Answers</th>
                  <th className="py-3 px-2 border-r border-slate-300 w-1/4">Target Level</th>
                  <th className="py-3 px-2 w-2/4">Assessor's Comments</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-6 px-2 border-r border-slate-300">
                    <span className="text-3xl font-bold text-[#dc2626]">{submission.readingScore || 0}</span>
                    <span className="text-slate-500 font-semibold text-lg">/{isPrimary ? 70 : 100}</span>
                  </td>
                  <td className="py-6 px-2 border-r border-slate-300 font-bold text-[#183173] text-lg">
                    {readingLevel}
                  </td>
                  <td className="py-2 px-4 text-left align-top">
                    <textarea 
                      className="w-full h-full min-h-[80px] bg-transparent border-0 outline-none resize-none font-medium text-slate-700 leading-[32px] block print:bg-transparent print:resize-none" 
                      style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #cbd5e1 31px, #cbd5e1 32px)', lineHeight: '32px' }}
                      placeholder="Nhận xét của giáo viên..."
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Speaking Table */}
          <div className="rounded-t-lg overflow-hidden border border-slate-300">
            <div className="bg-[#183173] text-white py-3 px-4 font-bold tracking-widest text-sm uppercase">
              SPEAKING
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#f0f4f8] text-[#183173] text-sm font-bold border-b border-slate-300">
                  <th className="py-3 px-2 border-r border-slate-300 w-1/4">Questions Answered</th>
                  <th className="py-3 px-2 border-r border-slate-300 w-1/4">Assessment Criteria</th>
                  <th className="py-3 px-2 border-r border-slate-300 w-[10%]">Score</th>
                  <th className="py-3 px-2">Assessor's Comments</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={4} className="py-6 px-2 border-r border-slate-300 border-b border-slate-300 align-middle">
                    <span className="text-4xl font-bold text-[#183173]">{questionsAnsweredCount}</span>
                    <span className="text-slate-500 font-semibold text-xl">/{isPrimary ? 30 : 21}</span>
                  </td>
                  <td className="py-4 px-4 border-r border-slate-300 border-b border-slate-300 text-left font-bold text-slate-700 text-sm">
                    Vocab & Grammar
                  </td>
                  <td className="py-4 px-2 border-r border-slate-300 border-b border-slate-300 font-bold text-slate-800 text-lg">
                    {levelScore.vocab || ''}
                  </td>
                  <td rowSpan={3} className="py-2 px-4 border-b border-slate-300 align-top">
                    <textarea 
                      className="w-full h-full min-h-[150px] bg-transparent border-0 outline-none resize-none font-medium text-slate-700 leading-[32px] block print:bg-transparent print:resize-none" 
                      style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #cbd5e1 31px, #cbd5e1 32px)', lineHeight: '32px' }}
                      placeholder="Nhận xét của giáo viên..."
                    ></textarea>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 border-r border-slate-300 border-b border-slate-300 text-left font-bold text-slate-700 text-sm">
                    Pronunciation
                  </td>
                  <td className="py-4 px-2 border-r border-slate-300 border-b border-slate-300 font-bold text-slate-800 text-lg">
                    {levelScore.pronunciation || ''}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 border-r border-slate-300 border-b border-slate-300 text-left font-bold text-slate-700 text-sm">
                    Interactive & Fluency
                  </td>
                  <td className="py-4 px-2 border-r border-slate-300 border-b border-slate-300 font-bold text-slate-800 text-lg">
                    {levelScore.fluency || ''}
                  </td>
                </tr>
                <tr className="bg-[#fcf8ed]">
                  <td className="py-3 px-4 border-r border-slate-300 font-black text-[#183173] text-right">
                    TOTAL
                  </td>
                  <td className="py-3 px-2 border-r border-slate-300 font-bold">
                    <span className="text-[#dc2626] text-xl">{interviewTotal}</span>
                    <span className="text-slate-500 font-semibold text-sm">/15</span>
                  </td>
                  <td className="py-3 px-4 align-bottom">
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="bg-[#f8fafc] px-4 py-3 border-t border-slate-300 flex items-center">
               <span className="font-bold text-[#183173] mr-2">Target Level:</span>
               <span className="text-slate-400 font-medium italic">{speakingTargetLevel}</span>
            </div>
          </div>

          <div className="mt-12 pt-6 flex justify-end">
            <div className="text-center w-64">
              <p className="text-[16px] font-bold text-[#183173] mb-20">Assessor's Signature</p>
              <div className="border-t border-slate-300 pt-2">
                <p className="text-[16px] font-bold text-slate-600">{teacherName || 'Full Name'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
