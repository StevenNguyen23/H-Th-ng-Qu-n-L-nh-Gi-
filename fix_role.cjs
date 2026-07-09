const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

content = content.replace(
  /\.data\.role/g,
  ".get('role', '')"
);

fs.writeFileSync('firestore.rules', content);
