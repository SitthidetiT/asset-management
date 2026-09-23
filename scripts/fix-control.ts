import * as fs from 'fs';
import * as path from 'path';

const file = "src/app/dashboard/master/employees/employees-client.tsx";
const filePath = path.join(process.cwd(), file);
let content = fs.readFileSync(filePath, 'utf-8');

// replace control={form.control} with control={form.control as any}
content = content.replace(/control={form\.control}/g, 'control={form.control as any}');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed control in employees-client.tsx');
