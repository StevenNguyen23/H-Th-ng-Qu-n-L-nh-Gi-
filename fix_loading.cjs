const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

content = content.replace(
  /console\.error\("TeacherDashboard snapshot error:", error\);/g,
  'console.error("TeacherDashboard snapshot error:", error);\n          setLoading(false);'
);

fs.writeFileSync('src/components/TeacherDashboard.tsx', content);
