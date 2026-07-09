const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewMode.tsx', 'utf8');

content = content.replace(
    /<div className="flex items-center gap-4">[\s\S]*?<div className="text-right">/m,
    `<div className="flex items-center gap-4">
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
        <div className="text-right">`
);

fs.writeFileSync('src/components/ReviewMode.tsx', content);
