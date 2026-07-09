const fs = require('fs');

let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');

const replacement = `
        function initAppBasedOnRole(role) {
            const btnGv = document.getElementById('btn-role-gv');
            const btnCv = document.getElementById('btn-role-cv');
            const btnPh = document.getElementById('btn-role-ph');

            // Reset display and locked classes
            const allRoleBtns = [btnGv, btnCv, btnPh];
            allRoleBtns.forEach(btn => {
                if(btn) {
                    btn.classList.remove('cursor-not-allowed', 'pointer-events-none');
                    btn.style.display = 'flex';
                }
            });

            if (role === 'gv') {
                if(btnCv) btnCv.style.display = 'none';
                switchRole('role-gv');
            } else if (role === 'cv' || role === 'admin') {
                // For admin or specialist, show all buttons, but default to GV tab for consistency
                switchRole('role-gv');
            } else {
                if(btnCv) btnCv.style.display = 'none';
                if(btnGv) btnGv.style.display = 'none';
                switchRole('role-ph');
            }
        }
`;

const regex = /function initAppBasedOnRole\(role\) \{[\s\S]*?function switchRole\(roleId\)/;
content = content.replace(regex, replacement.trim() + '\n\n        function switchRole(roleId)');

fs.writeFileSync('public/cambridge-eval.html', content);
