const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/dashboard/transfers/transfers-client.tsx',
  'src/app/dashboard/master/locations/locations-client.tsx',
  'src/app/dashboard/master/employees/employees-client.tsx',
  'src/app/dashboard/master/departments/departments-client.tsx',
  'src/app/dashboard/master/categories/categories-client.tsx',
  'src/app/dashboard/maintenance/maintenance-client.tsx',
  'src/app/dashboard/audits/[id]/audit-session-client.tsx',
  'src/app/dashboard/audits/audits-client.tsx'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix table overflow
    content = content.replace(/className="rounded-md border"/g, 'className="rounded-md border overflow-x-auto"');
    
    // Fix flex header (mb-4)
    content = content.replace(/className="flex justify-between items-center mb-4"/g, 'className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4"');
    
    // Fix flex header (mb-6)
    content = content.replace(/className="flex justify-between items-center mb-6"/g, 'className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"');
    
    // Some pages might have a search bar div that needs max-w-sm to be responsive
    // <div className="flex w-full max-w-sm items-center space-x-2"> 
    // We don't strictly need to change it if it wraps naturally, but we can make sure the container doesn't force a bad layout.
    // Actually, flex-col with gap-4 on the parent will naturally make the search bar take full width up to max-w-sm.

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${filePath}`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});
