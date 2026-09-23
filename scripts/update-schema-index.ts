import * as fs from 'fs';
import * as path from 'path';

let indexPath = path.join(process.cwd(), 'src/db/schema/index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf-8');
if (!indexContent.includes('./maintenance')) {
    indexContent += '\nexport * from "./maintenance";\n';
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
}
console.log('Added maintenance to schema index');
