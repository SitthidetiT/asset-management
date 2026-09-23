import * as fs from 'fs';
import * as path from 'path';

const filesToFix = [
  "src/app/dashboard/master/departments/departments-client.tsx",
  "src/app/dashboard/master/categories/categories-client.tsx",
  "src/app/dashboard/master/locations/locations-client.tsx",
  "src/app/dashboard/master/employees/employees-client.tsx",
];

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix type: "error" -> variant: "destructive"
  content = content.replace(/type:\s*"error"/g, 'variant: "destructive"');
  
  // Fix type: "success" -> remove it (default variant is success enough, or we can just leave it out)
  content = content.replace(/type:\s*"success",?/g, '');
  
  // Fix DialogTrigger asChild -> render={<Button />}
  content = content.replace(/<DialogTrigger asChild>\s*<Button>\s*([\s\S]*?)\s*<\/Button>\s*<\/DialogTrigger>/g, '<DialogTrigger render={<Button />}>$1</DialogTrigger>');
  
  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('Fixed all files');
