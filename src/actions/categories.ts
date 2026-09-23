"use server"

import { db } from "@/db";
import { categories } from "@/db/schema/master";
import { categorySchema } from "@/lib/validations/master";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    return await db.select().from(categories).orderBy(desc(categories.createdAt));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(data: unknown) {
  try {
    const validated = categorySchema.parse(data);
    await db.insert(categories).values({
      code: validated.code,
      nameTh: validated.nameTh,
      nameEn: validated.nameEn,
      icon: validated.icon,
    });
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Create category error:", error);
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: unknown) {
  try {
    const validated = categorySchema.parse(data);
    await db
      .update(categories)
      .set({
        code: validated.code,
        nameTh: validated.nameTh,
        nameEn: validated.nameEn,
        icon: validated.icon,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id));
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Update category error:", error);
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Delete category error:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
