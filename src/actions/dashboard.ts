"use server";

import { db } from "@/db";
import { assets, categories, maintenanceRecords } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { unstable_noStore } from "next/cache";

export async function getDashboardStats() {
  unstable_noStore();
  const [statsResult] = await db
    .select({
      totalAssets: sql<number>`count(*)::int`,
      totalValue: sql<number>`coalesce(sum(${assets.purchasePrice}), 0)::float`,
      activeAssets: sql<number>`sum(case when ${assets.status} = 'ACTIVE' then 1 else 0 end)::int`,
      maintenanceAssets: sql<number>`sum(case when ${assets.status} = 'IN_MAINTENANCE' then 1 else 0 end)::int`,
      writtenOffAssets: sql<number>`sum(case when ${assets.status} = 'WRITTEN_OFF' then 1 else 0 end)::int`,
    })
    .from(assets)
    .where(eq(assets.isDeleted, false));

  const { totalAssets, totalValue, activeAssets, maintenanceAssets, writtenOffAssets } = statsResult || {
    totalAssets: 0,
    totalValue: 0,
    activeAssets: 0,
    maintenanceAssets: 0,
    writtenOffAssets: 0,
  };

  // Group by category
  const categoryData = await db
    .select({
      name: categories.nameTh,
      value: sql<number>`count(${assets.id})::int`,
    })
    .from(assets)
    .innerJoin(categories, eq(assets.categoryId, categories.id))
    .where(eq(assets.isDeleted, false))
    .groupBy(categories.nameTh);

  // Maintenance cost total
  const [maintenanceResult] = await db
    .select({
      totalCost: sql<number>`coalesce(sum(${maintenanceRecords.cost}), 0)::float`
    })
    .from(maintenanceRecords);
    
  const totalMaintenanceCost = maintenanceResult?.totalCost || 0;

  return {
    totalAssets,
    totalValue,
    activeAssets,
    maintenanceAssets,
    writtenOffAssets,
    totalMaintenanceCost,
    categoryData,
    statusData: [
      { name: "ใช้งานปกติ", value: activeAssets, fill: "#22c55e" },
      { name: "ซ่อมบำรุง", value: maintenanceAssets, fill: "#eab308" },
      { name: "ตัดจำหน่าย", value: writtenOffAssets, fill: "#ef4444" },
    ]
  };
}
