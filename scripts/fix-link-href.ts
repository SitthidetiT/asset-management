import * as fs from 'fs';
import * as path from 'path';

let layoutPath = path.join(process.cwd(), 'src/app/dashboard/layout.tsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf-8');
// Link href={item.href} -> Link href={item.href || "#"}
layoutContent = layoutContent.replace(/href={item\.href}/g, 'href={item.href || "#"}');
fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
console.log('Fixed Link href');
