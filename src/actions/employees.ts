"use server"

import { db } from "@/db";
import { employees, departments } from "@/db/schema/master";
import { employeeSchema } from "@/lib/validations/master";
import { eq, asc } from "drizzle-orm";
import { revalidatePath, unstable_noStore } from "next/cache";

export async function getEmployees() {
  unstable_noStore();
  try {
    return await db
      .select({
        id: employees.id,
        employeeCode: employees.employeeCode,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        position: employees.position,
        isActive: employees.isActive,
        department: {
          id: departments.id,
          name: departments.name,
          code: departments.code,
        }
      })
      .from(employees)
      .leftJoin(departments, eq(employees.departmentId, departments.id))
      .orderBy(asc(employees.employeeCode));
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
}

export async function createEmployee(data: unknown) {
  try {
    const validated = employeeSchema.parse(data);
    await db.insert(employees).values({
      employeeCode: validated.employeeCode,
      firstName: validated.firstName,
      lastName: validated.lastName,
      departmentId: validated.departmentId,
      position: validated.position,
      email: validated.email || null,
      isActive: validated.isActive,
    });
    revalidatePath("/dashboard/master/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Create employee error:", error);
    return { success: false, error: error.message || "Failed to create employee" };
  }
}

export async function updateEmployee(id: string, data: unknown) {
  try {
    const validated = employeeSchema.parse(data);
    await db
      .update(employees)
      .set({
        employeeCode: validated.employeeCode,
        firstName: validated.firstName,
        lastName: validated.lastName,
        departmentId: validated.departmentId,
        position: validated.position,
        email: validated.email || null,
        isActive: validated.isActive,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id));
    revalidatePath("/dashboard/master/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Update employee error:", error);
    return { success: false, error: error.message || "Failed to update employee" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await db.delete(employees).where(eq(employees.id, id));
    revalidatePath("/dashboard/master/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Delete employee error:", error);
    return { success: false, error: error.message || "Failed to delete employee" };
  }
}
