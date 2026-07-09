const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');
content = content.replace(
    /\{\(userRole === 'specialist' \|\| isAdmin\) && \(\s*<button \s*onClick=\{\(\) => navigate\('\/teacher\/eval'\)\}[\s\S]*?<\/button>\s*\)\}/,
    `<button 
            onClick={() => navigate('/teacher/eval')}
            className="flex items-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white border border-transparent px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
          >
            <BookOpen className="w-4 h-4" /> {t('reportsTitle')}
          </button>`
);
fs.writeFileSync('src/components/TeacherDashboard.tsx', content);
