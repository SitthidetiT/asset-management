import { Metadata } from "next";
import { getAssets } from "@/actions/assets";
import { AssetsClient } from "./assets-client";

export const metadata: Metadata = {
  title: "ระบบจัดการทรัพย์สิน | Asset Management",
  description: "จัดการข้อมูลทรัพย์สินของบริษัท",
};

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">ทรัพย์สินทั้งหมด</h2>
      </div>
      <AssetsClient initialData={assets} />
    </div>
  );
}
