import { Metadata } from "next";
import { getTransfers } from "@/actions/transfers";
import { TransfersClient } from "./transfers-client";

export const metadata: Metadata = {
  title: "ประวัติการโอนย้าย | Asset Management",
  description: "ประวัติการโอนย้ายทรัพย์สินและส่งมอบ",
};

export default async function TransfersPage() {
  const transfers = await getTransfers();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">ประวัติการโอนย้ายทรัพย์สิน</h2>
      </div>
      <TransfersClient initialData={transfers} />
    </div>
  );
}
