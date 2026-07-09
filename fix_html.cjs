const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');
const idx = content.indexOf("} else if (role === 'cv' || role === 'admin') { switchRole('role-gv');");
console.log("Index:", idx);
if (idx > -1) {
  console.log(content.substring(idx, idx + 1000));
}
