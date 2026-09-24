import { getLocations } from "@/actions/locations";
import LocationsClient from "./locations-client";

export const metadata = {
  title: "จัดการสถานที่ (Locations) | Asset Management",
};

export default async function LocationsPage() {
  const data = await getLocations();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">สถานที่ (Locations)</h2>
      </div>
      <div className="flex h-full flex-1 flex-col space-y-8">
        <LocationsClient initialData={data} />
      </div>
    </div>
  );
}
