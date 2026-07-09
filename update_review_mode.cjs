const fs = require('fs');
let content = fs.readFileSync('src/components/ReviewMode.tsx', 'utf8');

content = content.replace(
    /<div className="text-right">/,
    `<div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher/eval')}
            className="flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white border border-transparent px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Báo cáo GV & PH
          </button>
          <div className="text-right">`
);

// We need to import BookOpen if it's not imported
if (!content.includes('BookOpen')) {
    content = content.replace(
        /import \{ (.*) \} from 'lucide-react';/,
        "import { $1, BookOpen } from 'lucide-react';"
    );
}

fs.writeFileSync('src/components/ReviewMode.tsx', content);
