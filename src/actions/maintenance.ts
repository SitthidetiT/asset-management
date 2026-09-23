"use server";

import { db } from "@/db";
import { maintenanceRecords, assets, employees } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { maintenanceSchema } from "@/lib/validations/maintenance";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getMaintenanceRecords() {
  return await db
    .select({
      id: maintenanceRecords.id,
      issueDescription: maintenanceRecords.issueDescription,
      status: maintenanceRecords.status,
      priority: maintenanceRecords.priority,
      cost: maintenanceRecords.cost,
      repairDate: maintenanceRecords.repairDate,
      assetCode: assets.assetCode,
      assetName: assets.name,
      employeeName: sql<string>`concat(${employees.firstName}, ' ', ${employees.lastName})`,
    })
    .from(maintenanceRecords)
    .innerJoin(assets, eq(maintenanceRecords.assetId, assets.id))
    .leftJoin(employees, eq(maintenanceRecords.reportedBy, employees.id))
    .where(eq(maintenanceRecords.isDeleted, false))
    .orderBy(desc(maintenanceRecords.createdAt));
}

export async function getMaintenanceById(id: string) {
  const result = await db.select().from(maintenanceRecords).where(and(eq(maintenanceRecords.id, id), eq(maintenanceRecords.isDeleted, false))).limit(1);
  return result[0] || null;
}

export async function createMaintenance(data: any) {
  try {
    const validatedData = maintenanceSchema.parse(data);

    await db.transaction(async (tx) => {
      // 1. Create Maintenance Record
      await tx.insert(maintenanceRecords).values({
        assetId: validatedData.assetId,
        reportedBy: validatedData.reportedBy === "" ? null : validatedData.reportedBy,
        issueDescription: validatedData.issueDescription,
        status: validatedData.status,
        priority: validatedData.priority,
        cost: validatedData.cost ? validatedData.cost : null,
        vendor: validatedData.vendor || null,
        repairDate: validatedData.repairDate || null,
        completionDate: validatedData.completionDate || null,
        notes: validatedData.notes || null,
      });

      // 2. Update Asset Status if needed
      if (validatedData.status !== "COMPLETED" && validatedData.status !== "CANCELLED") {
        await tx.update(assets)
          .set({ status: "IN_MAINTENANCE", updatedAt: new Date() })
          .where(eq(assets.id, validatedData.assetId));
      }
    });

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create maintenance record:", error);
    return { success: false, error: error.message || "Failed to create maintenance record" };
  }
}

export async function updateMaintenance(id: string, data: any) {
  try {
    const validatedData = maintenanceSchema.parse(data);

    await db.transaction(async (tx) => {
      // 1. Update Maintenance Record
      await tx.update(maintenanceRecords).set({
        assetId: validatedData.assetId,
        reportedBy: validatedData.reportedBy === "" ? null : validatedData.reportedBy,
        issueDescription: validatedData.issueDescription,
        status: validatedData.status,
        priority: validatedData.priority,
        cost: validatedData.cost ? validatedData.cost : null,
        vendor: validatedData.vendor || null,
        repairDate: validatedData.repairDate || null,
        completionDate: validatedData.completionDate || null,
        notes: validatedData.notes || null,
        updatedAt: new Date(),
      }).where(eq(maintenanceRecords.id, id));

      // 2. Update Asset Status
      if (validatedData.status === "COMPLETED" || validatedData.status === "CANCELLED") {
         await tx.update(assets)
          .set({ status: "ACTIVE", updatedAt: new Date() })
          .where(eq(assets.id, validatedData.assetId));
      } else {
         await tx.update(assets)
          .set({ status: "IN_MAINTENANCE", updatedAt: new Date() })
          .where(eq(assets.id, validatedData.assetId));
      }
    });

    revalidatePath("/dashboard/maintenance");
    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update maintenance record:", error);
    return { success: false, error: error.message || "Failed to update maintenance record" };
  }
}

export async function deleteMaintenance(id: string) {
  try {
    await db.update(maintenanceRecords).set({ 
      isDeleted: true,
      updatedAt: new Date()
    }).where(eq(maintenanceRecords.id, id));
    
    revalidatePath("/dashboard/maintenance");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete maintenance record:", error);
    return { success: false, error: error.message || "Failed to delete maintenance record" };
  }
}
