const fs = require('fs');

let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');

const replacement = `
        function initAppBasedOnRole(role) {
            // role from React: 'gv', 'cv', 'ph', or 'admin'
            // 'gv' -> can see 'gv' and 'ph'
            // 'cv' or 'admin' -> can see 'gv', 'cv', 'ph'
            
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
                switchRole('role-cv');
            } else {
                if(btnCv) btnCv.style.display = 'none';
                if(btnGv) btnGv.style.display = 'none';
                switchRole('role-ph');
            }
        }

        function switchRole(roleId) {
            const roleKey = roleId.replace('role-', '');
            currentRole = roleKey;

            const allRoleBtns = document.querySelectorAll('.role-btn');
            allRoleBtns.forEach(btn => {
                btn.classList.remove('role-active');
                btn.classList.add('role-inactive', 'opacity-50');
            });

            const activeBtn = document.getElementById(\`btn-\${roleId}\`);
            if (activeBtn) {
                activeBtn.classList.remove('role-inactive', 'opacity-50');
                activeBtn.classList.add('role-active');
            }
            
            const allSubnavs = document.querySelectorAll('.subnav-group');
            allSubnavs.forEach(nav => nav.classList.add('hidden'));
            
            const subnav = document.getElementById(\`subnav-\${roleId}\`);
            if (subnav) subnav.classList.remove('hidden');

            const allPages = document.querySelectorAll('.page-content');
            allPages.forEach(page => page.classList.remove('active'));

            if (roleKey === 'gv') switchTab('page-gv01');
            if (roleKey === 'cv') switchTab('page-cv01');
            if (roleKey === 'ph') switchTab('page-ph01-tuan');
        }
`;

const regex = /function initAppBasedOnRole\(role\) \{[\s\S]*?function switchTab\(pageId\)/;
content = content.replace(regex, replacement.trim() + '\n\n        function switchTab(pageId)');

fs.writeFileSync('public/cambridge-eval.html', content);
