import { db } from "@/db";
import { categories, locations, departments, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AssetForm } from "@/components/assets/asset-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลงทะเบียนทรัพย์สินใหม่ | Asset Management",
};

export default async function NewAssetPage() {
  // Fetch master data for dropdowns
  const [categoriesData, locationsData, departmentsData, employeesData] = await Promise.all([
    db.select({ id: categories.id, nameTh: categories.nameTh, code: categories.code }).from(categories),
    db.select({ id: locations.id, nameTh: locations.nameTh, code: locations.code }).from(locations),
    db.select({ id: departments.id, name: departments.name, code: departments.code }).from(departments),
    db.select({ id: employees.id, firstName: employees.firstName, lastName: employees.lastName, employeeCode: employees.employeeCode }).from(employees).where(eq(employees.isActive, true)),
  ]);

  const masterData = {
    categories: categoriesData,
    locations: locationsData,
    departments: departmentsData,
    employees: employeesData,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AssetForm masterData={masterData} />
    </div>
  );
}
