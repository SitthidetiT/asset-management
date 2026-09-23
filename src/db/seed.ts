import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema/users";
import { departments, categories, locations } from "./schema/master";
import * as bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  console.log("Seeding database...");

  // 1. Seed Admin User
  const hashedPassword = await bcrypt.hash("password123", 10);
  await db.insert(users).values({
    email: "admin@company.com",
    name: "System Administrator",
    passwordHash: hashedPassword,
    role: "SYSTEM_OWNER",
  }).onConflictDoNothing();

  // 2. Seed Departments
  console.log("Seeding Departments...");
  const initialDepartments = [
    { code: "IT", name: "Information Technology" },
    { code: "HR", name: "Human Resources" },
    { code: "AC", name: "Accounting" },
    { code: "PD", name: "Production" },
    { code: "QA", name: "Quality Assurance" },
    { code: "WH", name: "Warehouse" },
    { code: "EN", name: "Engineering" },
  ];
  for (const dept of initialDepartments) {
    await db.insert(departments).values(dept).onConflictDoNothing();
  }

  // 3. Seed Categories
  console.log("Seeding Categories...");
  const initialCategories = [
    { code: "COM", nameEn: "Computer / PC", nameTh: "คอมพิวเตอร์ตั้งโต๊ะ", icon: "monitor" },
    { code: "NB", nameEn: "Notebook / Laptop", nameTh: "คอมพิวเตอร์พกพา", icon: "laptop" },
    { code: "MON", nameEn: "Monitor", nameTh: "หน้าจอ", icon: "monitor-play" },
    { code: "PRN", nameEn: "Printer", nameTh: "เครื่องพิมพ์", icon: "printer" },
    { code: "NET", nameEn: "Network Equipment", nameTh: "อุปกรณ์เครือข่าย", icon: "network" },
    { code: "SRV", nameEn: "Server", nameTh: "เครื่องเซิร์ฟเวอร์", icon: "server" },
    { code: "UPS", nameEn: "UPS", nameTh: "เครื่องสำรองไฟ", icon: "battery-charging" },
    { code: "CCTV", nameEn: "CCTV", nameTh: "กล้องวงจรปิด", icon: "cctv" },
    { code: "CNC", nameEn: "CNC Machine", nameTh: "เครื่องจักร CNC", icon: "cog" },
    { code: "MAC", nameEn: "Machine", nameTh: "เครื่องจักรทั่วไป", icon: "factory" },
    { code: "MEA", nameEn: "Measuring Equipment", nameTh: "เครื่องมือวัด", icon: "ruler" },
    { code: "CAL", nameEn: "Calibration Equipment", nameTh: "อุปกรณ์สอบเทียบ", icon: "scale" },
    { code: "HT", nameEn: "Hand Tools", nameTh: "เครื่องมือช่าง", icon: "wrench" },
    { code: "PT", nameEn: "Power Tools", nameTh: "เครื่องมือไฟฟ้า", icon: "drill" },
    { code: "FUR", nameEn: "Furniture", nameTh: "เฟอร์นิเจอร์", icon: "sofa" },
    { code: "OFF", nameEn: "Office Equipment", nameTh: "อุปกรณ์สำนักงาน", icon: "paperclip" },
    { code: "OTH", nameEn: "Other", nameTh: "อื่นๆ", icon: "box" },
  ];
  for (const cat of initialCategories) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }

  // 4. Seed Locations
  console.log("Seeding Locations...");
  const initialLocations = [
    { code: "HQ", name: "Head Office", description: "สำนักงานใหญ่" },
    { code: "F1", name: "Factory 1", description: "โรงงาน 1" },
    { code: "WH1", name: "Warehouse 1", description: "คลังสินค้า 1" },
  ];
  for (const loc of initialLocations) {
    await db.insert(locations).values(loc).onConflictDoNothing();
  }

  console.log("Seeding finished.");
  await client.end();
}

main().catch((err) => {
  console.error("Seeding failed:");
  console.error(err);
  process.exit(1);
});
