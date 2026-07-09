const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');
content = content.replace(
    "switchRole('role-gv');\n            || role === 'admin') {\n                switchRole('role-cv');",
    "switchRole('role-gv');\n            } else if (role === 'cv' || role === 'admin') {\n                switchRole('role-cv');"
);
fs.writeFileSync('public/cambridge-eval.html', content);
