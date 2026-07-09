const fs = require('fs');
let content = fs.readFileSync('src/components/FinalReport.tsx', 'utf8');

content = content.replace(
    /<div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden">/,
    `<div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden">
        <button 
          onClick={() => navigate('/teacher/eval')}
          className="bg-[#1e40af] text-white p-4 rounded-full shadow-lg shadow-blue-100 hover:bg-[#1e3a8a] transition-colors flex items-center justify-center"
          title="Báo cáo GV & PH"
        >
          <BookOpen className="w-5 h-5" />
        </button>`
);

// We need to import BookOpen if it's not imported
if (!content.includes('BookOpen')) {
    content = content.replace(
        /import \{ (.*) \} from 'lucide-react';/,
        "import { $1, BookOpen } from 'lucide-react';"
    );
}

fs.writeFileSync('src/components/FinalReport.tsx', content);
