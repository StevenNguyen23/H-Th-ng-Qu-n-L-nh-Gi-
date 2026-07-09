const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

// Change the query so teachers see all students in their school
content = content.replace(
    /where\('teacherId', '==', user\.uid\)/g,
    "where('schoolType', '==', userData ? (userData.schoolType || 'VA3') : 'VA3')"
);

// Rename the button to explicitly say "Báo cáo Giáo viên & Phụ huynh"
content = content.replace(
    /<BookOpen className="w-4 h-4" \/> \{t\('reportsTitle'\)\}/g,
    `<BookOpen className="w-4 h-4" /> Báo cáo GV & PH`
);

fs.writeFileSync('src/components/TeacherDashboard.tsx', content);
