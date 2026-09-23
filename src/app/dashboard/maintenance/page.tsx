import { Metadata } from "next";
import { getMaintenanceRecords } from "@/actions/maintenance";
import { MaintenanceClient } from "./maintenance-client";

export const metadata: Metadata = {
  title: "ระบบแจ้งซ่อมบำรุง | Asset Management",
  description: "จัดการรายการแจ้งซ่อมทรัพย์สิน",
};

export default async function MaintenancePage() {
  const records = await getMaintenanceRecords();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">รายการแจ้งซ่อม</h2>
      </div>
      <MaintenanceClient initialData={records} />
    </div>
  );
}
