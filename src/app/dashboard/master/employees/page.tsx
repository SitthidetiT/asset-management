import { getEmployees } from "@/actions/employees";
import { getDepartments } from "@/actions/departments";
import EmployeesClient from "./employees-client";

export const metadata = {
  title: "จัดการพนักงาน (Employees) | Asset Management",
};

export default async function EmployeesPage() {
  const employeesData = await getEmployees();
  const departmentsData = await getDepartments();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">พนักงาน (Employees)</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <EmployeesClient initialData={employeesData} departments={departmentsData} />
      </div>
    </div>
  );
}
