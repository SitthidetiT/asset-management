import { config } from "dotenv";
config();

import { db } from "../src/db";
import { departments } from "../src/db/schema";
import { eq } from "drizzle-orm";

const mapping: Record<string, string> = {
  "บริหาร (Management)": "DPT-MGT",
  "Assembly": "DPT-ASM",
  "CNC Milling": "DPT-MIL",
  "Logistics": "DPT-LOG",
  "CNC Lathe": "DPT-LTH",
  "ฝ่ายบริหาร/จัดซื้อจัดหา": "DPT-PUR",
  "Design & Development": "DPT-DND",
  "ทรัพยากรบุคคลและคลังพัสดุ": "DPT-HRW",
  "จัดซื้อจัดหา/Store": "DPT-STR",
  "บัญชี-การเงิน": "DPT-ACC",
  "ขาย": "DPT-SAL",
};

async function main() {
  console.log("Fixing department codes...");

  const allDepts = await db.select().from(departments);

  for (const dept of allDepts) {
    const newCode = mapping[dept.name];
    if (newCode) {
      await db.update(departments)
        .set({ code: newCode })
        .where(eq(departments.id, dept.id));
      console.log(`Updated ${dept.name}: ${dept.code} -> ${newCode}`);
    } else {
      console.log(`No mapping found for ${dept.name} (${dept.code})`);
    }
  }

  console.log("✅ Fix completed!");
}

main().catch(console.error);
