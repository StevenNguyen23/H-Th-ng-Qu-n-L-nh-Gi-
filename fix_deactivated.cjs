const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

content = content.replace(
  /get\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\)\.data\.status == 'deactivated'/g,
  "get(/databases/$(database)/documents/users/$(request.auth.uid)).data.get('status', '') == 'deactivated'"
);

fs.writeFileSync('firestore.rules', content);
