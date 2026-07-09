const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');
const badStr = "} else if (role === 'cv' || role === 'admin') { switchRole('role-gv');";
// Remove all occurrences of badStr
content = content.split(badStr).join('');
fs.writeFileSync('public/cambridge-eval.html', content);
