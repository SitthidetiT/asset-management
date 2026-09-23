"use server";

import { db } from "@/db";
import { assetTransfers, assets, employees, locations } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { transferSchema } from "@/lib/validations/transfers";
import { revalidatePath } from "next/cache";

export async function getTransfers() {
  const fromEmployee = db.select({ id: employees.id, name: sql<string>`concat(${employees.firstName}, ' ', ${employees.lastName})`.as('from_name') }).from(employees).as('fromEmployee');
  const toEmployee = db.select({ id: employees.id, name: sql<string>`concat(${employees.firstName}, ' ', ${employees.lastName})`.as('to_name') }).from(employees).as('toEmployee');

  return await db
    .select({
      id: assetTransfers.id,
      assetCode: assets.assetCode,
      assetName: assets.name,
      transferDate: assetTransfers.transferDate,
      status: assetTransfers.status,
      reason: assetTransfers.reason,
      fromEmployeeName: fromEmployee.name,
      toEmployeeName: toEmployee.name,
    })
    .from(assetTransfers)
    .innerJoin(assets, eq(assetTransfers.assetId, assets.id))
    .leftJoin(fromEmployee, eq(assetTransfers.fromEmployeeId, fromEmployee.id))
    .leftJoin(toEmployee, eq(assetTransfers.toEmployeeId, toEmployee.id))
    .where(eq(assetTransfers.isDeleted, false))
    .orderBy(desc(assetTransfers.createdAt));
}

export async function createTransfer(data: any) {
  try {
    const validatedData = transferSchema.parse(data);

    // Get current asset details to know "from"
    const currentAsset = await db.select().from(assets).where(eq(assets.id, validatedData.assetId)).limit(1);
    
    if (!currentAsset || currentAsset.length === 0) {
      throw new Error("Asset not found");
    }

    await db.insert(assetTransfers).values({
      assetId: validatedData.assetId,
      fromEmployeeId: currentAsset[0].employeeId,
      fromLocationId: currentAsset[0].locationId,
      toEmployeeId: validatedData.toEmployeeId === "" ? null : validatedData.toEmployeeId,
      toLocationId: validatedData.toLocationId === "" ? null : validatedData.toLocationId,
      transferDate: new Date(),
      reason: validatedData.reason,
      status: "PENDING",
    });

    revalidatePath("/dashboard/transfers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to request transfer:", error);
    return { success: false, error: error.message || "Failed to request transfer" };
  }
}

export async function approveTransfer(id: string) {
  try {
    await db.transaction(async (tx) => {
      const transfer = await tx.select().from(assetTransfers).where(eq(assetTransfers.id, id)).limit(1);
      
      if (!transfer || transfer.length === 0) {
        throw new Error("Transfer not found");
      }

      if (transfer[0].status !== "PENDING") {
        throw new Error("Only pending transfers can be approved");
      }

      // Update transfer status
      await tx.update(assetTransfers).set({
        status: "APPROVED",
        updatedAt: new Date()
      }).where(eq(assetTransfers.id, id));

      // Update actual asset
      const updateData: any = {
        employeeId: transfer[0].toEmployeeId,
        updatedAt: new Date()
      };
      if (transfer[0].toLocationId) {
        updateData.locationId = transfer[0].toLocationId;
      }

      await tx.update(assets).set(updateData).where(eq(assets.id, transfer[0].assetId));
    });
    
    revalidatePath("/dashboard/transfers");
    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve transfer:", error);
    return { success: false, error: error.message || "Failed to approve transfer" };
  }
}

export async function rejectTransfer(id: string) {
  try {
    await db.update(assetTransfers).set({
      status: "REJECTED",
      updatedAt: new Date()
    }).where(eq(assetTransfers.id, id));
    
    revalidatePath("/dashboard/transfers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reject transfer:", error);
    return { success: false, error: error.message || "Failed to reject transfer" };
  }
}
