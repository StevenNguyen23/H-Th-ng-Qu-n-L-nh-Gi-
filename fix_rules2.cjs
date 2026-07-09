const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

const replacement = `
    function isSpecialist() {
      return canAccess() && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'specialist';
    }

    match /submissions/{submissionId} {
      allow get: if isAdmin() || isSpecialist() || (isTeacher() && resource.data.teacherId == request.auth.uid);
      allow list: if isAdmin() || isSpecialist() || (isSignedIn() && resource.data.teacherId == request.auth.uid);
      allow update, delete: if isAdmin() || isSpecialist() || (isTeacher() && resource.data.teacherId == request.auth.uid);
      allow create: if true;
    }
`;

content = content.replace(/match \/submissions\/\{submissionId\} \{[\s\S]*?allow create: if true;\n    \}/, replacement.trim());
fs.writeFileSync('firestore.rules', content);
