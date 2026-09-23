import { db } from "@/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NewAuditForm } from "@/components/audits/new-audit-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เปิดรอบตรวจนับทรัพย์สิน | Asset Management",
};

export default async function NewAuditPage() {
  const employeesData = await db
    .select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName, employeeCode: employees.employeeCode })
    .from(employees)
    .where(eq(employees.isActive, true));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <NewAuditForm employees={employeesData} />
    </div>
  );
}
