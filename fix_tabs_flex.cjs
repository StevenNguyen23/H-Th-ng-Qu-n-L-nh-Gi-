const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');

content = content.replace(/class="subnav-group flex gap-8"/g, 'class="subnav-group flex gap-8" style="display: flex;"');
content = content.replace(/class="subnav-group hidden gap-8"/g, 'class="subnav-group flex gap-8" style="display: none;"');

// Now update switchRole to use style.display
content = content.replace(
    /const allSubnavs = document\.querySelectorAll\('\.subnav-group'\);\n\s*allSubnavs\.forEach\(nav => nav\.classList\.add\('hidden'\)\);\n\s*const subnav = document\.getElementById\(`subnav-\$\{roleId\}`\);\n\s*if \(subnav\) subnav\.classList\.remove\('hidden'\);/g,
    `const allSubnavs = document.querySelectorAll('.subnav-group');
            allSubnavs.forEach(nav => nav.style.display = 'none');
            
            const subnav = document.getElementById(\`subnav-\${roleId}\`);
            if (subnav) subnav.style.display = 'flex';`
);

fs.writeFileSync('public/cambridge-eval.html', content);
