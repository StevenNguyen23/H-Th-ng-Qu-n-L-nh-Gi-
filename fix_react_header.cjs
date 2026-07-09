const fs = require('fs');
let content = fs.readFileSync('src/components/CambridgeEval.tsx', 'utf8');
content = content.replace(
    'header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10 shrink-0 relative"',
    'header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between z-10 shrink-0 relative"'
);
fs.writeFileSync('src/components/CambridgeEval.tsx', content);
