import { getAuditById, getAuditItems } from "@/actions/audits";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { AuditSessionClient } from "./audit-session-client";

export const metadata: Metadata = {
  title: "กระดานตรวจนับ | Asset Management",
};

export default async function AuditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  const items = await getAuditItems(id);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AuditSessionClient audit={audit} initialItems={items} />
    </div>
  );
}
