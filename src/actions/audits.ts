"use server";

import { db } from "@/db";
import { audits, auditItems, assets, employees } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { auditSchema } from "@/lib/validations/audits";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getAudits() {
  return await db
    .select({
      id: audits.id,
      name: audits.name,
      startDate: audits.startDate,
      status: audits.status,
      creatorName: sql<string>`concat(${employees.firstName}, ' ', ${employees.lastName})`,
      totalItems: sql<number>`(SELECT count(*) FROM ${auditItems} WHERE ${auditItems.auditId} = ${audits.id})`,
      completedItems: sql<number>`(SELECT count(*) FROM ${auditItems} WHERE ${auditItems.auditId} = ${audits.id} AND ${auditItems.status} != 'PENDING')`,
    })
    .from(audits)
    .leftJoin(employees, eq(audits.createdBy, employees.id))
    .where(eq(audits.isDeleted, false))
    .orderBy(desc(audits.createdAt));
}

export async function getAuditById(id: string) {
  const result = await db.select().from(audits).where(and(eq(audits.id, id), eq(audits.isDeleted, false))).limit(1);
  return result[0] || null;
}

export async function getAuditItems(auditId: string) {
  return await db
    .select({
      id: auditItems.id,
      auditId: auditItems.auditId,
      assetId: auditItems.assetId,
      status: auditItems.status,
      scannedAt: auditItems.scannedAt,
      assetCode: assets.assetCode,
      assetName: assets.name,
    })
    .from(auditItems)
    .innerJoin(assets, eq(auditItems.assetId, assets.id))
    .where(eq(auditItems.auditId, auditId));
}

export async function createAudit(data: any) {
  try {
    const validatedData = auditSchema.parse(data);

    await db.transaction(async (tx) => {
      // 1. Create Audit Session
      const insertedAudit = await tx.insert(audits).values({
        name: validatedData.name,
        startDate: validatedData.startDate,
        status: validatedData.status,
        createdBy: validatedData.createdBy === "" ? null : validatedData.createdBy,
        notes: validatedData.notes || null,
      }).returning({ id: audits.id });

      const auditId = insertedAudit[0].id;

      // 2. Fetch all active assets (not deleted, not written off)
      const allAssets = await tx
        .select({ id: assets.id })
        .from(assets)
        .where(
          and(
            eq(assets.isDeleted, false),
            sql`${assets.status} != 'WRITTEN_OFF'`
          )
        );

      // 3. Create Audit Items for each asset
      if (allAssets.length > 0) {
        const auditItemsData = allAssets.map(asset => ({
          auditId,
          assetId: asset.id,
          status: "PENDING",
        }));
        
        await tx.insert(auditItems).values(auditItemsData);
      }
    });

    revalidatePath("/dashboard/audits");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create audit:", error);
    return { success: false, error: error.message || "Failed to create audit" };
  }
}

export async function updateAuditItemStatus(itemId: string, status: string) {
  try {
    await db.update(auditItems).set({
      status,
      scannedAt: new Date(),
    }).where(eq(auditItems.id, itemId));
    
    // In a real app, we might check if all items are scanned to complete the audit automatically
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update audit item:", error);
    return { success: false, error: error.message || "Failed to update item" };
  }
}

export async function completeAudit(id: string) {
  try {
    await db.update(audits).set({
      status: "COMPLETED",
      endDate: new Date(),
      updatedAt: new Date()
    }).where(eq(audits.id, id));
    
    revalidatePath("/dashboard/audits");
    revalidatePath(`/dashboard/audits/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to complete audit:", error);
    return { success: false, error: error.message || "Failed to complete audit" };
  }
}

export async function deleteAudit(id: string) {
  try {
    await db.update(audits).set({ 
      isDeleted: true,
      updatedAt: new Date()
    }).where(eq(audits.id, id));
    
    revalidatePath("/dashboard/audits");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete audit:", error);
    return { success: false, error: error.message || "Failed to delete audit" };
  }
}
