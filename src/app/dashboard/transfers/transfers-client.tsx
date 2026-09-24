"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { approveTransfer, rejectTransfer } from "@/actions/transfers";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type TransferRow = {
  id: string;
  assetCode: string;
  assetName: string;
  transferDate: Date;
  status: string;
  reason: string;
  fromEmployeeName: string | null;
  toEmployeeName: string | null;
};

export function TransfersClient({ initialData }: { initialData: TransferRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = initialData.filter((item) => {
    const search = searchTerm.toLowerCase();
    return item.assetCode.toLowerCase().includes(search) || item.assetName.toLowerCase().includes(search);
  });

  const handleApprove = (id: string) => {
    if (confirm("ยืนยันการอนุมัติโอนย้าย? เมื่ออนุมัติแล้ว ข้อมูลผู้ถือครองทรัพย์สินจะถูกอัปเดตทันที")) {
      startTransition(async () => {
        const result = await approveTransfer(id);
        if (result.success) {
          toast({ title: "สำเร็จ", description: "อนุมัติการโอนย้ายเรียบร้อยแล้ว" });
          router.refresh();
        } else {
          toast({ title: "ข้อผิดพลาด", description: result.error || "ไม่สามารถอนุมัติได้", variant: "destructive" });
        }
      });
    }
  };

  const handleReject = (id: string) => {
    if (confirm("คุณต้องการปฏิเสธคำขอโอนย้ายนี้ใช่หรือไม่?")) {
      startTransition(async () => {
        const result = await rejectTransfer(id);
        if (result.success) {
          toast({ title: "สำเร็จ", description: "ปฏิเสธการโอนย้ายเรียบร้อยแล้ว" });
          router.refresh();
        } else {
          toast({ title: "ข้อผิดพลาด", description: result.error || "ไม่สามารถทำรายการได้", variant: "destructive" });
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <Badge className="bg-yellow-500 hover:bg-yellow-600">รออนุมัติ</Badge>;
      case "APPROVED": return <Badge className="bg-green-500 hover:bg-green-600">อนุมัติแล้ว</Badge>;
      case "REJECTED": return <Badge className="bg-red-500 hover:bg-red-600">ปฏิเสธ</Badge>;
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
              placeholder="ค้นหารหัส หรือชื่อทรัพย์สิน..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/dashboard/transfers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> แจ้งโอนย้าย
            </Button>
          </Link>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>ทรัพย์สิน</TableHead>
                <TableHead>จากผู้ถือครองเดิม</TableHead>
                <TableHead>ผู้รับโอนใหม่</TableHead>
                <TableHead>เหตุผล</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    ไม่พบข้อมูลการโอนย้าย
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.transferDate).toLocaleDateString("th-TH")}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item.assetCode}</div>
                      <div className="text-xs text-muted-foreground">{item.assetName}</div>
                    </TableCell>
                    <TableCell>{item.fromEmployeeName || "ส่วนกลาง"}</TableCell>
                    <TableCell className="font-semibold text-blue-600">{item.toEmployeeName || "ส่วนกลาง (คืนคลัง)"}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={item.reason}>{item.reason}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {item.status === "PENDING" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(item.id)}
                            disabled={isPending}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" /> อนุมัติ
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(item.id)}
                            disabled={isPending}
                          >
                            <XCircle className="mr-1 h-3 w-3" /> ปฏิเสธ
                          </Button>
                        </>
                      )}
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
