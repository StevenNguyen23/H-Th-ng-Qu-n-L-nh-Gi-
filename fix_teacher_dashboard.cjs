const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

const replacement = `
        let q;
        if (data && data.role === 'specialist') {
          q = query(collection(db, 'submissions'));
        } else {
          q = query(
            collection(db, 'submissions'),
            where('teacherId', '==', user.uid)
          );
        }
`;

content = content.replace(/const q = query\([\s\S]*?where\('teacherId', '==', user.uid\)\n\s*\);/, replacement.trim());
fs.writeFileSync('src/components/TeacherDashboard.tsx', content);
