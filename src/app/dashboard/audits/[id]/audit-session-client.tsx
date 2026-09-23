"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle, XCircle, AlertTriangle, ChevronLeft, CalendarCheck } from "lucide-react";
import Link from "next/link";
import { completeAudit, updateAuditItemStatus } from "@/actions/audits";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type AuditItemRow = {
  id: string;
  auditId: string;
  assetId: string;
  status: string;
  scannedAt: Date | null;
  assetCode: string;
  assetName: string;
};

export function AuditSessionClient({ audit, initialItems }: { audit: any; initialItems: AuditItemRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = initialItems.filter((item) => {
    const search = searchTerm.toLowerCase();
    return item.assetCode.toLowerCase().includes(search) || item.assetName.toLowerCase().includes(search);
  });

  const handleUpdateStatus = (itemId: string, status: string) => {
    startTransition(async () => {
      const result = await updateAuditItemStatus(itemId, status);
      if (result.success) {
        toast({
          title: "บันทึกสถานะ",
          description: `อัปเดตทรัพย์สินเป็น ${status} เรียบร้อย`,
        });
        router.refresh();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.error || "ไม่สามารถอัปเดตได้",
          variant: "destructive",
        });
      }
    });
  };

  const handleCompleteAudit = () => {
    if (confirm("ยืนยันการปิดรอบตรวจนับ? ทรัพย์สินที่ยังไม่ได้ตรวจจะถูกบันทึกว่า PENDING เช่นเดิม และไม่สามารถแก้ไขได้อีก")) {
      startTransition(async () => {
        const result = await completeAudit(audit.id);
        if (result.success) {
          toast({
            title: "เสร็จสิ้น",
            description: "ปิดรอบการตรวจนับเรียบร้อยแล้ว",
          });
          router.refresh();
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: result.error || "ไม่สามารถปิดรอบได้",
            variant: "destructive",
          });
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge variant="outline" className="text-gray-500">รอตรวจสอบ</Badge>;
      case "FOUND": return <Badge className="bg-green-500 hover:bg-green-600">พบ</Badge>;
      case "MISSING": return <Badge className="bg-red-500 hover:bg-red-600">สูญหาย</Badge>;
      case "DAMAGED": return <Badge className="bg-orange-500 hover:bg-orange-600">ชำรุด</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const isCompleted = audit.status === "COMPLETED";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/audits">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">{audit.name}</h2>
            <p className="text-muted-foreground text-sm">
              สถานะรอบตรวจนับ: {isCompleted ? "ปิดรอบแล้ว" : "กำลังดำเนินการ"}
            </p>
          </div>
        </div>
        {!isCompleted && (
          <Button onClick={handleCompleteAudit} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            <CalendarCheck className="mr-2 h-4 w-4" /> ปิดรอบตรวจนับ
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ค้นหารหัส หรือชื่อทรัพย์สิน..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสทรัพย์สิน</TableHead>
                  <TableHead>ชื่อทรัพย์สิน</TableHead>
                  <TableHead>เวลาที่อัปเดต</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">บันทึกผลการตรวจ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      ไม่พบรายการทรัพย์สิน
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className={item.status !== "PENDING" ? "bg-muted/30" : ""}>
                      <TableCell className="font-medium">{item.assetCode}</TableCell>
                      <TableCell>{item.assetName}</TableCell>
                      <TableCell>
                        {item.scannedAt ? new Date(item.scannedAt).toLocaleTimeString("th-TH") : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(item.id, "FOUND")}
                          disabled={isPending || isCompleted || item.status === "FOUND"}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" /> พบ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          onClick={() => handleUpdateStatus(item.id, "DAMAGED")}
                          disabled={isPending || isCompleted || item.status === "DAMAGED"}
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" /> ชำรุด
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => handleUpdateStatus(item.id, "MISSING")}
                          disabled={isPending || isCompleted || item.status === "MISSING"}
                        >
                          <XCircle className="mr-1 h-3 w-3" /> หาย
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
    </div>
  );
}
