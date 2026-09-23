import * as fs from 'fs';
import * as path from 'path';

let layoutPath = path.join(process.cwd(), 'src/app/dashboard/layout.tsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf-8');

const oldMenu = `        href: "/dashboard/audits",
        icon: ClipboardCheck,
      },
    ],
  },`;

const newMenu = `        href: "/dashboard/audits",
        icon: ClipboardCheck,
      },
      {
        title: "ประวัติการโอนย้าย",
        href: "/dashboard/transfers",
        icon: ArrowRightLeft,
      },
    ],
  },`;

layoutContent = layoutContent.replace(oldMenu, newMenu);
if (!layoutContent.includes('ArrowRightLeft')) {
    layoutContent = layoutContent.replace('ClipboardCheck,', 'ClipboardCheck, ArrowRightLeft,');
}
fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
console.log('Fixed layout with transfer menu');
