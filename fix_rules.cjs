const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');
content = content.replace("request.auth.token.email == 'minhhoangbluesky6789@gmail.com'", "('email' in request.auth.token && request.auth.token.email == 'minhhoangbluesky6789@gmail.com')");
fs.writeFileSync('firestore.rules', content);
