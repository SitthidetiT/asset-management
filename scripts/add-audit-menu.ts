import * as fs from 'fs';
import * as path from 'path';

let layoutPath = path.join(process.cwd(), 'src/app/dashboard/layout.tsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf-8');

const oldMenu = `        href: "/dashboard/maintenance",
        icon: Wrench,
      },
    ],
  },`;

const newMenu = `        href: "/dashboard/maintenance",
        icon: Wrench,
      },
      {
        title: "การตรวจนับ (Audit)",
        href: "/dashboard/audits",
        icon: ClipboardCheck,
      },
    ],
  },`;

layoutContent = layoutContent.replace(oldMenu, newMenu);
fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
console.log('Fixed layout with audit menu');
