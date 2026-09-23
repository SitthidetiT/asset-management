import { config } from "dotenv";
config();

import { db } from "../src/db";
import { departments, employees } from "../src/db/schema";
import { eq } from "drizzle-orm";

const employeeData = [
  { code: "1ATS001", firstName: "นายอลงกรณ์", lastName: "ขุนทรง", position: "กรรมการผู้จัดการใหญ่", department: "บริหาร (Management)" },
  { code: "1ATS002", firstName: "นายสุนทร", lastName: "เปี่ยมโนรี", position: "ที่ปรึกษาอาวุโส / หัวหน้าแผนก", department: "Assembly" },
  { code: "1ATS003", firstName: "นายณัฐพล", lastName: "ศิริจรัสวัฒนชัย", position: "ช่างเทคนิค", department: "CNC Milling" },
  { code: "1ATS004", firstName: "นายพิพัฒ", lastName: "ทองเล็ก", position: "ช่างเทคนิคอาวุโส", department: "Assembly" },
  { code: "1ATS005", firstName: "นายณัฐพงษ์", lastName: "สมศักดิ์", position: "หัวหน้าแผนก", department: "Logistics" },
  { code: "1ATS006", firstName: "นายสุธินันท์", lastName: "แย้มกลิ่น", position: "ช่างเทคนิค", department: "CNC Milling" },
  { code: "1ATS007", firstName: "นายวัชรพล", lastName: "ปุญญาสาสน์", position: "หัวหน้าแผนก", department: "CNC Lathe" },
  { code: "1ATS009", firstName: "น.ส.ฐิติรัตน์", lastName: "เงาศรี", position: "หัวหน้าแผนก/เลขานุการ", department: "ฝ่ายบริหาร/จัดซื้อจัดหา" },
  { code: "1ATS010", firstName: "นายปรเมษฐ์", lastName: "ศรีนุช", position: "ช่างเทคนิค", department: "CNC Milling" },
  { code: "1ATS011", firstName: "น.ส.ปัทมา", lastName: "แสงงาม", position: "หัวหน้าแผนก", department: "Design & Development" },
  { code: "1ATS012", firstName: "นายวิชากร", lastName: "กุญชรรักษ์", position: "หัวหน้าแผนก", department: "CNC Milling" },
  { code: "1ATS013", firstName: "นายกนิษฐ์", lastName: "กิจบำรุง", position: "วิศวกร", department: "Assembly" },
  { code: "1ATS015", firstName: "นายสุรเชษฐ์", lastName: "บัวตูม", position: "ช่างเทคนิค", department: "CNC Milling" },
  { code: "1ATS026", firstName: "น.ส.สุพักตร์", lastName: "จันทะบัณฑิต", position: "พนักงาน", department: "CNC Lathe" },
  { code: "1ATS027", firstName: "นายรัตนพล", lastName: "สมบัติไพศาล", position: "พนักงาน", department: "CNC Lathe" },
  { code: "1ATS028", firstName: "นายธนวรรธน์", lastName: "ปานรักษา", position: "ช่างเทคนิค", department: "Assembly" },
  { code: "1ATS029", firstName: "นายณัฐพงษ์", lastName: "เพชรคง", position: "หัวหน้าแผนก", department: "ทรัพยากรบุคคลและคลังพัสดุ" },
  { code: "1ATS030", firstName: "Miss. Nan", lastName: "SAN KNAM", position: "พนักงาน", department: "CNC Lathe" },
  { code: "1ATS031", firstName: "MR. WAI", lastName: "YAN PHIYO", position: "พนักงาน", department: "CNC Lathe" },
  { code: "1ATS032", firstName: "น.ส.พรวิภา", lastName: "บำรุงบ้านทุ่ม", position: "พนักงาน", department: "Assembly" },
  { code: "1ATS035", firstName: "นายภานุพงษ์", lastName: "กิ่งดา", position: "พนักงาน", department: "CNC Lathe" },
  { code: "1ATS036", firstName: "นางสาวยุวรีย์", lastName: "เตียมนา", position: "เจ้าหน้าที่", department: "จัดซื้อจัดหา/Store" },
  { code: "1ATS038", firstName: "นางสาวอารีพร", lastName: "หาดเพชร", position: "หัวหน้าแผนก", department: "บัญชี-การเงิน" },
  { code: "1ATS039", firstName: "นางสาวฐิตา", lastName: "ประคำ", position: "เจ้าหน้าที่QC", department: "Design & Development" },
  { code: "1ATS043", firstName: "นายเอกรัฐ", lastName: "ตุละยากรณ์", position: "พนักงานขับรถ", department: "ทรัพยากรบุคคลและคลังพัสดุ" },
  { code: "1ATS044", firstName: "นายวรศักดิ์", lastName: "บริสุทธิ์", position: "วิศวกรการผลิต", department: "Design & Development" },
  { code: "1ATS045", firstName: "นางสาวศรินญา", lastName: "จันทวี", position: "เซลล์ฝ่ายขาย", department: "ขาย" },
  { code: "1ATS047", firstName: "นายสราวุฒิ", lastName: "รักษาเพชร", position: "ช่างเชื่อม", department: "Assembly" },
  { code: "1ATS050", firstName: "นายสิทธิเดช", lastName: "สีเรือง", position: "เจ้าหน้าที่ IT Support", department: "ทรัพยากรบุคคลและคลังพัสดุ" },
];

async function main() {
  console.log("Starting to import employees...");

  for (const emp of employeeData) {
    // 1. Ensure department exists
    let deptRecord = await db.select().from(departments).where(eq(departments.name, emp.department)).limit(1);
    
    if (deptRecord.length === 0) {
      // Create new department
      const deptCode = "DPT-" + emp.department.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000);
      const inserted = await db.insert(departments).values({
        code: deptCode,
        name: emp.department,
        description: "Auto-imported department"
      }).returning();
      deptRecord = inserted;
      console.log(`Created new department: ${emp.department}`);
    }

    const deptId = deptRecord[0].id;

    // 2. Insert employee
    // Check if employee already exists to avoid duplicates
    const existingEmp = await db.select().from(employees).where(eq(employees.employeeCode, emp.code)).limit(1);
    
    if (existingEmp.length === 0) {
      await db.insert(employees).values({
        employeeCode: emp.code,
        firstName: emp.firstName,
        lastName: emp.lastName,
        position: emp.position,
        departmentId: deptId,
        isActive: true,
      });
      console.log(`Imported employee: ${emp.code} - ${emp.firstName} ${emp.lastName}`);
    } else {
      console.log(`Skipped existing employee: ${emp.code}`);
    }
  }

  console.log("✅ Import completed successfully!");
}

main().catch(console.error);
