const fs = require('fs');
let content = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

const target = `
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSchoolType(data.schoolType || 'VA3');
            setUserRole(data.role || 'teacher');
            setCanManagePlacementTest(!!data.canManagePlacementTest);
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }

        let q;
        if (data && data.role === 'specialist') {
`;

const replacement = `
        let userData = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            userData = userDoc.data();
            setSchoolType(userData.schoolType || 'VA3');
            setUserRole(userData.role || 'teacher');
            setCanManagePlacementTest(!!userData.canManagePlacementTest);
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }

        let q;
        if (userData && userData.role === 'specialist') {
`;

content = content.replace(target.trim(), replacement.trim());
fs.writeFileSync('src/components/TeacherDashboard.tsx', content);
