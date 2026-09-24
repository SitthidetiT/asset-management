"use server"

import { db } from "@/db";
import { departments } from "@/db/schema/master";
import { departmentSchema } from "@/lib/validations/master";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, unstable_noStore } from "next/cache";

export async function getDepartments() {
  unstable_noStore();
  try {
    return await db.select().from(departments).orderBy(desc(departments.createdAt));
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return [];
  }
}

export async function createDepartment(data: unknown) {
  try {
    const validated = departmentSchema.parse(data);
    await db.insert(departments).values({
      code: validated.code,
      name: validated.name,
      description: validated.description,
    });
    revalidatePath("/dashboard/master/departments");
    return { success: true };
  } catch (error: any) {
    console.error("Create department error:", error);
    return { success: false, error: error.message || "Failed to create department" };
  }
}

export async function updateDepartment(id: string, data: unknown) {
  try {
    const validated = departmentSchema.parse(data);
    await db
      .update(departments)
      .set({
        code: validated.code,
        name: validated.name,
        description: validated.description,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id));
    revalidatePath("/dashboard/master/departments");
    return { success: true };
  } catch (error: any) {
    console.error("Update department error:", error);
    return { success: false, error: error.message || "Failed to update department" };
  }
}

export async function deleteDepartment(id: string) {
  try {
    await db.delete(departments).where(eq(departments.id, id));
    revalidatePath("/dashboard/master/departments");
    return { success: true };
  } catch (error: any) {
    console.error("Delete department error:", error);
    return { success: false, error: error.message || "Failed to delete department" };
  }
}
