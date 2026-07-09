const fs = require('fs');
let content = fs.readFileSync('public/cambridge-eval.html', 'utf8');

// The block to extract
const regex = /\/\/ Xử lý thông điệp từ React Parent[\s\S]*?\}\);/;
const match = content.match(regex);
if (match) {
    const listenerBlock = match[0];
    content = content.replace(listenerBlock, ''); // remove it from inside window.onload
    
    // add it right after window.onload = function() { ... }
    content = content.replace('};\n    </script>', '};\n\n    ' + listenerBlock + '\n    </script>');
    fs.writeFileSync('public/cambridge-eval.html', content);
}
