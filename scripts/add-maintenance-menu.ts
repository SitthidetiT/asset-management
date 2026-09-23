import * as fs from 'fs';
import * as path from 'path';

let layoutPath = path.join(process.cwd(), 'src/app/dashboard/layout.tsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf-8');

const oldMenu = `        href: "/dashboard/assets",
        icon: Package,
      },
    ],
  },`;

const newMenu = `        href: "/dashboard/assets",
        icon: Package,
      },
      {
        title: "การซ่อมบำรุง",
        href: "/dashboard/maintenance",
        icon: Wrench,
      },
    ],
  },`;

layoutContent = layoutContent.replace(oldMenu, newMenu);
fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
console.log('Fixed layout with maintenance menu');
