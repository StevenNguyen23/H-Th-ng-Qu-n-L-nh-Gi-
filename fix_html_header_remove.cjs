const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');

// Remove the top header
content = content.replace(/<header class="bg-\[\#1a2b4c\] text-white[^>]*>[\s\S]*?<\/header>/, '');

// Ensure flex is in the subnav
content = content.replace(/class="subnav-group flex gap-8"/g, 'class="subnav-group flex flex-row gap-8"');
content = content.replace(/class="subnav-group hidden gap-8"/g, 'class="subnav-group flex flex-row gap-8"');

fs.writeFileSync('public/cambridge-eval.html', content);
