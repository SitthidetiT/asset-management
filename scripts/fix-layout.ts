import * as fs from 'fs';
import * as path from 'path';

let layoutPath = path.join(process.cwd(), 'src/app/dashboard/layout.tsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf-8');

layoutContent = layoutContent.replace(/User,\n  Bell/g, "User,\n  Bell,\n  Package");

// Fix line 129: isActive = pathname.startsWith(item.href); -> pathname.startsWith(item.href || "")
layoutContent = layoutContent.replace(/pathname\.startsWith\(item\.href\)/g, 'pathname.startsWith(item.href || "")');

fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
console.log('Fixed layout');
