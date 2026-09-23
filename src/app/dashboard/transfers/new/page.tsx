import { db } from "@/db";
import { assets, employees, locations } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NewTransferForm } from "@/components/transfers/new-transfer-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "แจ้งโอนย้ายทรัพย์สิน | Asset Management",
};

export default async function NewTransferPage() {
  const [assetsData, employeesData, locationsData] = await Promise.all([
    db.select({ 
      id: assets.id, 
      assetCode: assets.assetCode, 
      name: assets.name,
      employeeName: sql<string>`concat(${employees.firstName}, ' ', ${employees.lastName})`
    })
    .from(assets)
    .leftJoin(employees, eq(assets.employeeId, employees.id))
    .where(eq(assets.isDeleted, false)),
    db.select().from(employees).where(eq(employees.isActive, true)),
    db.select().from(locations),
  ]);

  const masterData = {
    assets: assetsData,
    employees: employeesData,
    locations: locationsData,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <NewTransferForm masterData={masterData} />
    </div>
  );
}
