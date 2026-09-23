"use server";

import { db } from "@/db";
import { assets, categories, maintenanceRecords } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getDashboardStats() {
  const allAssets = await db.select().from(assets).where(eq(assets.isDeleted, false));
  
  const totalAssets = allAssets.length;
  const totalValue = allAssets.reduce((sum, asset) => sum + Number(asset.purchasePrice || 0), 0);
  
  const activeAssets = allAssets.filter(a => a.status === 'ACTIVE').length;
  const maintenanceAssets = allAssets.filter(a => a.status === 'IN_MAINTENANCE').length;
  const writtenOffAssets = allAssets.filter(a => a.status === 'WRITTEN_OFF').length;

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
  const allMaintenance = await db.select().from(maintenanceRecords);
  const totalMaintenanceCost = allMaintenance.reduce((sum, rec) => sum + Number(rec.cost || 0), 0);

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
