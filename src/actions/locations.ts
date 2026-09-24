"use server"

import { db } from "@/db";
import { locations } from "@/db/schema/master";
import { locationSchema } from "@/lib/validations/master";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, unstable_noStore } from "next/cache";

export async function getLocations() {
  unstable_noStore();
  try {
    return await db.select().from(locations).orderBy(desc(locations.createdAt));
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return [];
  }
}

export async function createLocation(data: unknown) {
  try {
    const validated = locationSchema.parse(data);
    await db.insert(locations).values({
      code: validated.code,
      name: validated.name,
      description: validated.description,
    });
    revalidatePath("/dashboard/master/locations");
    return { success: true };
  } catch (error: any) {
    console.error("Create location error:", error);
    return { success: false, error: error.message || "Failed to create location" };
  }
}

export async function updateLocation(id: string, data: unknown) {
  try {
    const validated = locationSchema.parse(data);
    await db
      .update(locations)
      .set({
        code: validated.code,
        name: validated.name,
        description: validated.description,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id));
    revalidatePath("/dashboard/master/locations");
    return { success: true };
  } catch (error: any) {
    console.error("Update location error:", error);
    return { success: false, error: error.message || "Failed to update location" };
  }
}

export async function deleteLocation(id: string) {
  try {
    await db.delete(locations).where(eq(locations.id, id));
    revalidatePath("/dashboard/master/locations");
    return { success: true };
  } catch (error: any) {
    console.error("Delete location error:", error);
    if (error.message?.includes("foreign key constraint") || error.message?.includes("violates foreign key")) {
      return { success: false, error: "ไม่สามารถลบสถานที่นี้ได้ เนื่องจากมีทรัพย์สินที่ถูกจัดเก็บอยู่ในสถานที่นี้" };
    }
    return { success: false, error: error.message || "Failed to delete location" };
  }
}
