const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

const replacement = `
    function isTeacher() {
      return canAccess() && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'specialist');
    }
`;

content = content.replace(/function isTeacher\(\) \{[\s\S]*?\}/, replacement.trim());
fs.writeFileSync('firestore.rules', content);
