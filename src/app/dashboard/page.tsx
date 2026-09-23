import { Metadata } from "next";
import { getDashboardStats } from "@/actions/dashboard";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "ภาพรวมระบบ | Asset Management",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">ภาพรวมระบบ (Dashboard)</h2>
      </div>
      <DashboardClient stats={stats} />
    </div>
  );
}
