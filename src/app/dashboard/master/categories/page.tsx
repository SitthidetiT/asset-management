import { getCategories } from "@/actions/categories";
import CategoriesClient from "./categories-client";

export const metadata = {
  title: "จัดการหมวดหมู่ (Categories) | Asset Management",
};

export default async function CategoriesPage() {
  const data = await getCategories();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">หมวดหมู่ (Categories)</h2>
      </div>
      <div className="flex h-full flex-1 flex-col space-y-8">
        <CategoriesClient initialData={data} />
      </div>
    </div>
  );
}
