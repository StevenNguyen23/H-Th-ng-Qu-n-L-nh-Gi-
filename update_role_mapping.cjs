const fs = require('fs');

let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');

const replacement = `
                    const roleMapping = {
                        'teacher': 'gv',
                        'specialist': 'cv',
                        'parent': 'ph',
                        'admin': 'admin',
                        'gv': 'gv',
                        'cv': 'cv',
                        'ph': 'ph'
                    };
`;

const regex = /const roleMapping = \{[\s\S]*?\};/;
content = content.replace(regex, replacement.trim());

fs.writeFileSync('public/cambridge-eval.html', content);
