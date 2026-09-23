import { db } from "@/db";
import { assets, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { getMaintenanceById } from "@/actions/maintenance";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "อัปเดตสถานะการซ่อม | Asset Management",
};

export default async function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getMaintenanceById(id);

  if (!record) {
    notFound();
  }

  const [assetsData, employeesData] = await Promise.all([
    db.select({ id: assets.id, name: assets.name, assetCode: assets.assetCode }).from(assets).where(eq(assets.isDeleted, false)),
    db.select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName, employeeCode: employees.employeeCode }).from(employees).where(eq(employees.isActive, true)),
  ]);

  const masterData = {
    assets: assetsData,
    employees: employeesData,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <MaintenanceForm masterData={masterData} initialData={record} isEdit={true} />
    </div>
  );
}
