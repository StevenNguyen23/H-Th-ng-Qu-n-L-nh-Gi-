const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');
content = content.replace(/class="subnav-group hidden flex gap-8"/g, 'class="subnav-group hidden gap-8"');
fs.writeFileSync('public/cambridge-eval.html', content);
