import { Metadata } from "next";
import { getAudits } from "@/actions/audits";
import { AuditsClient } from "./audits-client";

export const metadata: Metadata = {
  title: "ระบบตรวจนับทรัพย์สิน | Asset Management",
  description: "จัดการรอบการตรวจนับทรัพย์สิน",
};

export default async function AuditsPage() {
  const audits = await getAudits();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">รอบการตรวจนับ (Audit Sessions)</h2>
      </div>
      <AuditsClient initialData={audits} />
    </div>
  );
}
