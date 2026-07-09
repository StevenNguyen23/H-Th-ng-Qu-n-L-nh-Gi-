const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');

// Reduce header padding
content = content.replace(
    'class="bg-[#1a2b4c] text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0 relative z-50"',
    'class="bg-[#1a2b4c] text-white px-4 py-2 flex justify-between items-center shadow-sm shrink-0 relative z-50"'
);

// Reduce role tab padding
content = content.replace(
    'class="flex flex-wrap gap-4 py-4 border-b border-gray-100"',
    'class="flex flex-wrap gap-4 py-2 border-b border-gray-100"'
);

content = content.replace(
    'class="role-btn role-active px-6 py-2.5 rounded-xl',
    'class="role-btn role-active px-4 py-1.5 rounded-lg'
);
content = content.replace(
    'class="role-btn role-inactive px-6 py-2.5 rounded-xl',
    'class="role-btn role-inactive px-4 py-1.5 rounded-lg'
);
content = content.replace(
    'class="role-btn role-inactive px-6 py-2.5 rounded-xl',
    'class="role-btn role-inactive px-4 py-1.5 rounded-lg'
); // there are two role-inactive initially

fs.writeFileSync('public/cambridge-eval.html', content);
