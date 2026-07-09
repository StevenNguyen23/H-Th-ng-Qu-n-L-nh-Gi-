const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

content = content.replace(
    /match \/submissions\/\{submissionId\} \{[\s\S]*?allow create: if true;\s*\}/,
    `match /submissions/{submissionId} {
      allow get: if isAdmin() || isTeacher();
      allow list: if isAdmin() || isTeacher();
      allow update, delete: if isAdmin() || isTeacher();
      allow create: if true;
    }`
);

fs.writeFileSync('firestore.rules', content);
