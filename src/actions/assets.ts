"use server";

import { db } from "@/db";
import { assets, assetSequences, categories, locations, departments, employees } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { assetSchema } from "@/lib/validations/assets";
import { z } from "zod";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function getAssets() {
  noStore();
  return await db
    .select({
      id: assets.id,
      assetCode: assets.assetCode,
      name: assets.name,
      status: assets.status,
      condition: assets.condition,
      serialNumber: assets.serialNumber,
      purchaseDate: assets.purchaseDate,
      purchasePrice: assets.purchasePrice,
      warrantyExpiry: assets.warrantyExpiry,
      categoryCode: categories.code,
      locationName: locations.name,
      departmentCode: departments.code,
      employeeName: sql<string>`concat(${employees.firstName}, ' ', ${employees.lastName})`,
    })
    .from(assets)
    .leftJoin(categories, eq(assets.categoryId, categories.id))
    .leftJoin(locations, eq(assets.locationId, locations.id))
    .leftJoin(departments, eq(assets.departmentId, departments.id))
    .leftJoin(employees, eq(assets.employeeId, employees.id))
    .where(eq(assets.isDeleted, false))
    .orderBy(desc(assets.createdAt));
}

export async function getAssetById(id: string) {
  noStore();
  const result = await db.select().from(assets).where(and(eq(assets.id, id), eq(assets.isDeleted, false))).limit(1);
  return result[0] || null;
}

export async function createAsset(data: z.infer<typeof assetSchema>) {
  try {
    const validatedData = assetSchema.parse(data);

    // Run within a transaction to safely generate the next sequence number
    await db.transaction(async (tx) => {
      // 1. Get Category Code and Location Code for Prefix
      const category = await tx.select({ code: categories.code }).from(categories).where(eq(categories.id, validatedData.categoryId)).limit(1);
      const location = await tx.select({ code: locations.code }).from(locations).where(eq(locations.id, validatedData.locationId)).limit(1);
      
      if (!category[0] || !location[0]) {
        throw new Error("Category or Location not found");
      }

      const prefix = `${category[0].code}-${location[0].code}`; // e.g. COM-HQ

      // 2. Safely increment the sequence using UPSERT logic
      const sequenceResult = await tx
        .insert(assetSequences)
        .values({ prefix, currentValue: 1 })
        .onConflictDoUpdate({
          target: assetSequences.prefix,
          set: { currentValue: sql`${assetSequences.currentValue} + 1` }
        })
        .returning({ value: assetSequences.currentValue });
        
      const nextValue = sequenceResult[0].value;
      const runningNumber = nextValue.toString().padStart(4, "0"); // 0001
      const generatedCode = `${prefix}-${runningNumber}`;

      // 3. Insert the Asset
      await tx.insert(assets).values({
        assetCode: generatedCode,
        name: validatedData.name,
        description: validatedData.description || null,
        serialNumber: validatedData.serialNumber || null,
        categoryId: validatedData.categoryId,
        locationId: validatedData.locationId,
        departmentId: validatedData.departmentId,
        employeeId: validatedData.employeeId === "" ? null : validatedData.employeeId,
        status: validatedData.status,
        condition: validatedData.condition,
        purchaseDate: validatedData.purchaseDate || null,
        purchasePrice: validatedData.purchasePrice ? validatedData.purchasePrice : null,
        supplier: validatedData.supplier || null,
        warrantyExpiry: validatedData.warrantyExpiry || null,
        notes: validatedData.notes || null,
        imageUrl: validatedData.imageUrl || null,
      });
    });

    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create asset:", error);
    return { success: false, error: error.message || "Failed to create asset" };
  }
}

export async function updateAsset(id: string, data: z.infer<typeof assetSchema>) {
  try {
    const validatedData = assetSchema.parse(data);

    await db.update(assets).set({
      name: validatedData.name,
      description: validatedData.description || null,
      serialNumber: validatedData.serialNumber || null,
      categoryId: validatedData.categoryId,
      locationId: validatedData.locationId,
      departmentId: validatedData.departmentId,
      employeeId: validatedData.employeeId === "" ? null : validatedData.employeeId,
      status: validatedData.status,
      condition: validatedData.condition,
      purchaseDate: validatedData.purchaseDate || null,
      purchasePrice: validatedData.purchasePrice ? validatedData.purchasePrice : null,
      supplier: validatedData.supplier || null,
      warrantyExpiry: validatedData.warrantyExpiry || null,
      notes: validatedData.notes || null,
      imageUrl: validatedData.imageUrl || null,
      updatedAt: new Date(),
    }).where(eq(assets.id, id));

    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update asset:", error);
    return { success: false, error: error.message || "Failed to update asset" };
  }
}

export async function deleteAsset(id: string) {
  try {
    // Soft delete
    await db.update(assets).set({ 
      isDeleted: true,
      updatedAt: new Date()
    }).where(eq(assets.id, id));
    
    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete asset:", error);
    return { success: false, error: error.message || "Failed to delete asset" };
  }
}
