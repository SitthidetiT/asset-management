const fs = require('fs');
const https = require('https');

// TH Sarabun New URL (a reliable github source for the TTF)
const fontUrl = 'https://raw.githubusercontent.com/wichit2s/thaifonts/master/THSarabunNew.ttf';

https.get(fontUrl, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString('base64');
    const content = `export const THSarabunNew = "${base64}";\n`;
    fs.writeFileSync('./src/lib/fonts.ts', content);
    console.log('Font generated at src/lib/fonts.ts');
  });
}).on('error', (err) => {
  console.error('Error downloading font:', err);
});
