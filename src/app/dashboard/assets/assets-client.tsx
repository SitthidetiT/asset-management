"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAsset } from "@/actions/assets";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

type AssetRow = {
  id: string;
  assetCode: string;
  name: string;
  status: string;
  condition: string;
  serialNumber: string | null;
  purchaseDate: Date | null;
  purchasePrice: string | null;
  warrantyExpiry: Date | null;
  categoryCode: string | null;
  locationName: string | null;
  departmentCode: string | null;
  employeeName: string | null;
};

export function AssetsClient({ initialData }: { initialData: AssetRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = initialData.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.assetCode.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search) ||
      (item.categoryCode && item.categoryCode.toLowerCase().includes(search)) ||
      (item.locationName && item.locationName.toLowerCase().includes(search))
    );
  });

  const handleDelete = (id: string) => {
    if (confirm("คุณต้องการลบทรัพย์สินนี้ใช่หรือไม่?")) {
      startTransition(async () => {
        const result = await deleteAsset(id);
        if (result.success) {
          toast({
            title: "สำเร็จ",
            description: "ลบทรัพย์สินเรียบร้อยแล้ว",
          });
          router.refresh();
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: result.error || "ไม่สามารถลบทรัพย์สินได้",
            variant: "destructive",
          });
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge className="bg-green-500 hover:bg-green-600">ใช้งาน</Badge>;
      case "IN_MAINTENANCE": return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">ซ่อมบำรุง</Badge>;
      case "BROKEN": return <Badge className="bg-red-500 hover:bg-red-600">ชำรุด</Badge>;
      case "WRITTEN_OFF": return <Badge className="bg-gray-500 hover:bg-gray-600">แทงจำหน่าย</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleExportExcel = () => {
    // 1. Prepare data for Excel
    const excelData = filteredData.map((item) => ({
      "รหัสทรัพย์สิน": item.assetCode,
      "ชื่อทรัพย์สิน": item.name,
      "S/N (ซีเรียลนัมเบอร์)": item.serialNumber || "-",
      "หมวดหมู่": item.categoryCode || "-",
      "แผนก": item.departmentCode || "-",
      "สถานที่": item.locationName || "-",
      "ผู้ถือครอง": item.employeeName || "-",
      "สถานะ": item.status,
      "สภาพเครื่อง": item.condition,
      "วันที่ซื้อ": item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString("th-TH") : "-",
      "ราคา (บาท)": item.purchasePrice ? Number(item.purchasePrice).toLocaleString("th-TH") : "-",
      "วันหมดประกัน": item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString("th-TH") : "-",
    }));

    // 2. Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

    // 3. Generate file name with current date
    const date = new Date();
    const fileName = `Asset_Report_${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}.xlsx`;

    // 4. Download the file
    XLSX.writeFile(workbook, fileName);
  };

  return (
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-green-600"><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 18a3 3 0 1 0-6 0"/><path d="M15 18a3 3 0 1 1-6 0"/><path d="M12 12v6"/><path d="m15 15-3 3-3-3"/><path d="M18 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2Z"/></svg>
              Export Excel
            </Button>
            <Link href="/dashboard/assets/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> ลงทะเบียนทรัพย์สิน
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสทรัพย์สิน</TableHead>
                <TableHead>ชื่อทรัพย์สิน</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>สถานที่</TableHead>
                <TableHead>ผู้ถือครอง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    ไม่พบข้อมูลทรัพย์สิน
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.assetCode}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.categoryCode}</TableCell>
                    <TableCell>{asset.locationName}</TableCell>
                    <TableCell>{asset.employeeName || "-"}</TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/dashboard/assets/${asset.id}`}><Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button></Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(asset.id)}
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
