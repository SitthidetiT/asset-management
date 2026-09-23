import { getDepartments } from "@/actions/departments";
import DepartmentsClient from "./departments-client";

export const metadata = {
  title: "จัดการแผนก (Departments) | Asset Management",
};

export default async function DepartmentsPage() {
  const data = await getDepartments();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">แผนก (Departments)</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <DepartmentsClient initialData={data} />
      </div>
    </div>
  );
}
