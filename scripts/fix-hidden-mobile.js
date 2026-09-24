const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/dashboard/master/locations/page.tsx',
  'src/app/dashboard/master/employees/page.tsx',
  'src/app/dashboard/master/departments/page.tsx',
  'src/app/dashboard/master/categories/page.tsx'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove hidden on mobile
    content = content.replace(/className="hidden h-full flex-1 flex-col space-y-8 md:flex"/g, 'className="flex h-full flex-1 flex-col space-y-8"');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed hidden class on ${filePath}`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});
