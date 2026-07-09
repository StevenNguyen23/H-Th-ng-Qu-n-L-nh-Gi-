import React from 'react';
import { X, Mail, Calendar, FileUp, FileText, Award } from 'lucide-react';

interface UserProfileModalProps {
  selectedUser: any;
  onClose: () => void;
  files: any[];
  submissions: any[];
  onViewReport: (submissionId: string) => void;
}

export default function UserProfileModal({ 
  selectedUser, 
  onClose, 
  files, 
  submissions, 
  onViewReport 
}: UserProfileModalProps) {
  
  const userFiles = files.filter(f => f.userId === selectedUser.id || f.uploaderEmail === selectedUser.email);
  
  const userSubmissions = selectedUser.role === 'teacher' 
    ? submissions.filter(s => s.teacherId === selectedUser.id)
    : submissions.filter(s => s.email?.toLowerCase() === selectedUser.email?.toLowerCase() || s.name?.toLowerCase() === selectedUser.name?.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 font-bold text-xl flex items-center justify-center uppercase">
              {selectedUser.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                  selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  selectedUser.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedUser.role || 'student'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                  selectedUser.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedUser.status || 'active'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account details card */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold break-all text-xs">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Tham gia: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FileUp className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Tài liệu tải lên: {selectedUser.fileCount || 0} file</span>
                </div>
              </div>
            </div>

            {/* Uploaded Files list */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Uploaded Documents ({userFiles.length})
              </h3>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-[180px] overflow-y-auto bg-white">
                {userFiles.map(file => (
                  <div key={file.id} className="p-3 text-xs flex justify-between items-center hover:bg-slate-50">
                    <div className="font-semibold text-slate-700 truncate max-w-[250px]" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-slate-400 flex items-center gap-3">
                      <span>{file.createdAt ? (file.createdAt.toDate ? file.createdAt.toDate().toLocaleDateString('vi-VN') : new Date(file.createdAt).toLocaleDateString('vi-VN')) : 'N/A'}</span>
                      <a 
                        href={file.url || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Tải về
                      </a>
                    </div>
                  </div>
                ))}
                {userFiles.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs font-medium">Không có tài liệu nào được tải lên.</div>
                )}
              </div>
            </div>
          </div>

          {/* Individual Performance / Graded History */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              {selectedUser.role === 'teacher' ? 'Mock Tests Graded by Teacher' : 'Mock Test Performance History'}
            </h3>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">Học sinh / Lớp</th>
                    <th className="p-3 text-center">Reading</th>
                    <th className="p-3 text-center">Speaking</th>
                    <th className="p-3 text-center">Final Level</th>
                    <th className="p-3">Assessor / Date</th>
                    <th className="p-3 text-right">Báo cáo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {userSubmissions.map(sub => {
                    const sLevel = sub.englishLevel || sub.level || 'Beginner';
                    const levelScore = sub.interviewScore?.levelScores?.[sLevel] || { vocab: 0, pronunciation: 0, fluency: 0 };
                    const sAvg = ((levelScore.vocab || 0) + (levelScore.pronunciation || 0) + (levelScore.fluency || 0)) / 3;

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{sub.name}</div>
                          <div className="text-slate-400 text-[10px]">{sub.currentGrade || 'N/A'}</div>
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-700">
                          {sub.readingScore !== undefined ? `${sub.readingScore}/100` : 'N/A'}
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-700">
                          {sAvg > 0 ? `${sAvg.toFixed(1)}/5.0` : 'Chưa chấm'}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                            {sub.englishLevel || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          <div>Date: {sub.createdAt ? (sub.createdAt.toDate ? sub.createdAt.toDate().toLocaleDateString('vi-VN') : new Date(sub.createdAt).toLocaleDateString('vi-VN')) : 'N/A'}</div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onViewReport(sub.id)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {userSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 font-medium">Không tìm thấy lịch sử bài kiểm tra nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg uppercase tracking-wider transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
