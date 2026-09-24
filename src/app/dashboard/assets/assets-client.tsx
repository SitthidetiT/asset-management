"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import Link from "next/link";
import { deleteAsset } from "@/actions/assets";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LogoBase64, THSarabunNew } from "@/lib/fonts";

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
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterEmployee, setFilterEmployee] = useState("ALL");

  const uniqueCategories = Array.from(new Set(initialData.map(a => a.categoryCode).filter(Boolean))).sort();
  const uniqueDepartments = Array.from(new Set(initialData.map(a => a.departmentCode).filter(Boolean))).sort();
  const uniqueEmployees = Array.from(new Set(initialData.map(a => a.employeeName).filter(Boolean))).sort();

  const filteredData = initialData.filter((item) => {
    // Dropdown filters
    if (filterCategory !== "ALL" && item.categoryCode !== filterCategory) return false;
    if (filterDepartment !== "ALL" && item.departmentCode !== filterDepartment) return false;
    if (filterEmployee !== "ALL" && item.employeeName !== filterEmployee) return false;

    // Search input
    if (!searchTerm) return true;
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

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assets");

    // Configure for A4 Landscape Printing
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25, right: 0.25,
        top: 0.75, bottom: 0.75,
        header: 0.3, footer: 0.3
      }
    };

    // Add Logo (Shifted right to be closer to centered text)
    const logoId = workbook.addImage({
      base64: LogoBase64,
      extension: "png",
    });
    worksheet.addImage(logoId, {
      tl: { col: 1, row: 0 }, // Column C
      ext: { width: 180, height: 75 }
    });

    // Add Company Headers (Merged across A to L, so it is perfectly centered)
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = "AUTO - TECH SYSTEMS CO.,LTD";
    titleCell.font = { name: 'Arial', size: 24, bold: true, italic: true, color: { argb: 'FFFF0000' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:L2');
    const addressCell = worksheet.getCell('A2');
    addressCell.value = "Manufacturing : 58/2,58/71 Moo 9 T.Raikhing A.Samphran Nakornpathom 73210 Thailand (Head Office)";
    addressCell.font = { name: 'Arial', size: 10, bold: true };
    addressCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A3:L3');
    const contactCell = worksheet.getCell('A3');
    contactCell.value = "Tel : 065 789 5226 E-Mail : ats@auto-techsystems.com Mobile : (081 777 1669) TAX: 0735556004823";
    contactCell.font = { name: 'Arial', size: 10, bold: true };
    contactCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Give some row height to accommodate the logo
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 20;
    worksheet.getRow(3).height = 20;

    worksheet.addRow([]);
    worksheet.addRow([]); // Blank rows for spacing

    // Add Table Headers
    const headers = [
      "รหัสทรัพย์สิน", "ชื่อทรัพย์สิน", "S/N (ซีเรียลนัมเบอร์)", "หมวดหมู่",
      "แผนก", "สถานที่", "ผู้ถือครอง", "สถานะ", "สภาพเครื่อง", 
      "วันที่ซื้อ", "ราคา (บาท)", "วันหมดประกัน"
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add Data
    filteredData.forEach((item) => {
      const row = worksheet.addRow([
        item.assetCode,
        item.name,
        item.serialNumber || "-",
        item.categoryCode || "-",
        item.departmentCode || "-",
        item.locationName || "-",
        item.employeeName || "-",
        item.status,
        item.condition,
        item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString("th-TH") : "-",
        item.purchasePrice ? Number(item.purchasePrice).toLocaleString("th-TH") : "-",
        item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString("th-TH") : "-",
      ]);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
      });
    });

    // Adjust column widths
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });
    worksheet.getColumn(2).width = 25; // Name is wider
    worksheet.getColumn(3).width = 20; // SN
    worksheet.getColumn(7).width = 20; // Employee

    // Export
    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date();
    const fileName = `Asset_Report_${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add Thai Font
    doc.addFileToVFS("THSarabunNew.ttf", THSarabunNew);
    doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
    doc.setFont("THSarabunNew");

    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Add Logo (Aligned next to the text block)
    const logoWidth = 35;
    const logoHeight = 16;
    doc.addImage(LogoBase64, "PNG", 35, 12, logoWidth, logoHeight);

    // Add Header Text (Perfectly Centered, Adjusted Sizes)
    doc.setTextColor(255, 0, 0); // Red
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold"); // standard bold, not italic
    doc.text("AUTO - TECH SYSTEMS CO.,LTD", centerX, 18, { align: 'center' });
    
    doc.setTextColor(0, 0, 0); // Black
    doc.setFontSize(10);
    doc.text("Manufacturing : 58/2,58/71 Moo 9 T.Raikhing A.Samphran Nakornpathom 73210 Thailand (Head Office)", centerX, 24, { align: 'center' });
    doc.text("Tel : 065 789 5226 E-Mail : ats@auto-techsystems.com Mobile : (081 777 1669) TAX: 0735556004823", centerX, 29, { align: 'center' });

    // Reset font for Thai text in table
    doc.setFont("THSarabunNew", "normal");

    // Table Data
    const tableColumn = [
      "รหัสทรัพย์สิน", "ชื่อทรัพย์สิน", "S/N", "หมวดหมู่", 
      "แผนก", "สถานที่", "ผู้ถือครอง", "สถานะ", 
      "วันที่ซื้อ", "ราคา"
    ];
    
    const tableRows = filteredData.map(item => [
      item.assetCode,
      item.name,
      item.serialNumber || "-",
      item.categoryCode || "-",
      item.departmentCode || "-",
      item.locationName || "-",
      item.employeeName || "-",
      item.status,
      item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString("th-TH") : "-",
      item.purchasePrice ? Number(item.purchasePrice).toLocaleString("th-TH") : "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: {
        font: "THSarabunNew", // Use Thai font in table
        fontStyle: "normal",
        fontSize: 12,
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 20,
        font: "THSarabunNew",
        fontStyle: 'normal',
      },
    });

    const date = new Date();
    doc.save(`Asset_Report_${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}.pdf`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1">
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
            <select 
              className="flex h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="ALL">ทุกหมวดหมู่</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              className="flex h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
            >
              <option value="ALL">ทุกแผนก</option>
              {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
              className="flex h-9 w-full sm:w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}
            >
              <option value="ALL">ทุกคน</option>
              {uniqueEmployees.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={handleExportExcel} className="text-green-600 border-green-600 hover:bg-green-50">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="text-red-600 border-red-600 hover:bg-red-50">
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Link href="/dashboard/assets/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> ลงทะเบียนทรัพย์สิน
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
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
                      <Link href={`/dashboard/assets/${asset.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
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
