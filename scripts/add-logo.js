const fs = require('fs');
const img = fs.readFileSync('public/logo.png', 'base64');
fs.appendFileSync('src/lib/fonts.ts', '\nexport const LogoBase64 = "data:image/png;base64,' + img + '";\n');
console.log('Logo added');
