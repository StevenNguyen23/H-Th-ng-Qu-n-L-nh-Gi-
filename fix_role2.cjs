const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

content = content.replace(
  /\.get\('role', ''\)/g,
  ".data.get('role', '')"
);

content = content.replace(
  /\.data\.data/g,
  ".data"
);

fs.writeFileSync('firestore.rules', content);
