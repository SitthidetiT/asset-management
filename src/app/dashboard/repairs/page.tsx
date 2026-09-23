import { redirect } from "next/navigation";

export default function RepairsRedirect() {
  redirect("/dashboard/maintenance");
}
