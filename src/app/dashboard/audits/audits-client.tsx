"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAudit } from "@/actions/audits";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type AuditRow = {
  id: string;
  name: string;
  startDate: Date;
  status: string;
  creatorName: string | null;
  totalItems: number;
  completedItems: number;
};

export function AuditsClient({ initialData }: { initialData: AuditRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = initialData.filter((item) => {
    const search = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(search);
  });

  const handleDelete = (id: string) => {
    if (confirm("คุณต้องการลบรอบการตรวจนับนี้ใช่หรือไม่? ข้อมูลการตรวจนับทั้งหมดในรอบนี้จะถูกลบด้วย")) {
      startTransition(async () => {
        const result = await deleteAudit(id);
        if (result.success) {
          toast({
            title: "สำเร็จ",
            description: "ลบรอบการตรวจนับเรียบร้อยแล้ว",
          });
          router.refresh();
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: result.error || "ไม่สามารถลบได้",
            variant: "destructive",
          });
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNED": return <Badge className="bg-gray-500 hover:bg-gray-600">วางแผน</Badge>;
      case "IN_PROGRESS": return <Badge className="bg-blue-500 hover:bg-blue-600">กำลังตรวจนับ</Badge>;
      case "COMPLETED": return <Badge className="bg-green-500 hover:bg-green-600">เสร็จสิ้น</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ค้นหาชื่อรอบการตรวจนับ..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/dashboard/audits/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> เปิดรอบตรวจนับใหม่
            </Button>
          </Link>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อรอบตรวจนับ</TableHead>
                <TableHead>วันที่เริ่ม</TableHead>
                <TableHead>ผู้สร้าง</TableHead>
                <TableHead>ความคืบหน้า</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    ไม่พบข้อมูลรอบการตรวจนับ
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{new Date(item.startDate).toLocaleDateString("th-TH")}</TableCell>
                    <TableCell>{item.creatorName || "-"}</TableCell>
                    <TableCell>
                      {item.completedItems} / {item.totalItems} 
                      <span className="text-muted-foreground text-xs ml-2">
                        ({item.totalItems > 0 ? Math.round((item.completedItems / item.totalItems) * 100) : 0}%)
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/dashboard/audits/${item.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
