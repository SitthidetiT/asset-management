import * as fs from 'fs';
import * as path from 'path';

let assetFormPath = path.join(process.cwd(), 'src/components/assets/asset-form.tsx');
let assetFormContent = fs.readFileSync(assetFormPath, 'utf-8');
assetFormContent = assetFormContent.replace(/<\/Link>\s*<\/Button>/g, '</Button>\n        </Link>');
fs.writeFileSync(assetFormPath, assetFormContent, 'utf-8');
console.log('Fixed tags');
