"use server"

import { db } from "@/db";
import { categories } from "@/db/schema/master";
import { categorySchema } from "@/lib/validations/master";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, unstable_noStore } from "next/cache";

export async function getCategories() {
  unstable_noStore();
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
    revalidatePath("/dashboard/master/categories");
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
    revalidatePath("/dashboard/master/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Update category error:", error);
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/dashboard/master/categories");
    return { success: true };
  } catch (error: any) {
    console.error("Delete category error:", error);
    if (error.message?.includes("foreign key constraint") || error.message?.includes("violates foreign key")) {
      return { success: false, error: "ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีทรัพย์สินที่กำลังใช้งานหมวดหมู่นี้อยู่" };
    }
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
