"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { assetSchema } from "@/lib/validations/assets";
import { createAsset, updateAsset } from "@/actions/assets";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type MasterDataProps = {
  categories: { id: string; nameTh: string; code: string }[];
  locations: { id: string; name: string; code: string }[];
  departments: { id: string; name: string; code: string }[];
  employees: { id: string; firstName: string; lastName: string; employeeCode: string }[];
};

export function AssetForm({
  initialData,
  masterData,
  isEdit = false,
}: {
  initialData?: any;
  masterData: MasterDataProps;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<any>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      serialNumber: initialData?.serialNumber || "",
      categoryId: initialData?.categoryId || "",
      locationId: initialData?.locationId || "",
      departmentId: initialData?.departmentId || "",
      employeeId: initialData?.employeeId || "",
      status: initialData?.status || "ACTIVE",
      condition: initialData?.condition || "NEW",
      purchasePrice: initialData?.purchasePrice?.toString() || "",
      supplier: initialData?.supplier || "",
      notes: initialData?.notes || "",
      imageUrl: initialData?.imageUrl || "",
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      let result;
      if (isEdit && initialData?.id) {
        result = await updateAsset(initialData.id, values);
      } else {
        result = await createAsset(values);
      }

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: isEdit ? "แก้ไขทรัพย์สินเรียบร้อยแล้ว" : "ลงทะเบียนทรัพย์สินเรียบร้อยแล้ว",
        });
        router.push("/dashboard/assets");
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.error || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive",
        });
      }
    });
  };

  const formControl = form.control as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/assets"><Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">{isEdit ? "แก้ไขทรัพย์สิน" : "ลงทะเบียนทรัพย์สินใหม่"}</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">ข้อมูลทั่วไป</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อทรัพย์สิน <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น MacBook Pro M2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formControl}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="SN หรือหมายเลขเครื่อง" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={formControl}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมวดหมู่ <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {masterData.categories.map((c) => (
                            <SelectItem key={c.id} value={c.id} label={`${c.code} - ${c.nameTh}`}>
                              {`${c.code} - ${c.nameTh}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formControl}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สถานที่ตั้ง <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสถานที่ตั้ง" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {masterData.locations.map((l) => (
                            <SelectItem key={l.id} value={l.id} label={`${l.code} - ${l.name}`}>
                              {`${l.code} - ${l.name}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formControl}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แผนกที่รับผิดชอบ <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแผนก" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {masterData.departments.map((d) => (
                            <SelectItem key={d.id} value={d.id} label={`${d.code} - ${d.name}`}>
                              {`${d.code} - ${d.name}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formControl}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ผู้ถือครอง (พนักงาน)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ไม่มีผู้ถือครอง / เป็นของกองกลาง" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">-- ไม่มีผู้ถือครอง --</SelectItem>
                          {masterData.employees.map((e) => (
                            <SelectItem key={e.id} value={e.id} label={`${e.employeeCode} - ${e.firstName} ${e.lastName}`}>
                              {`${e.employeeCode} - ${e.firstName} ${e.lastName}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">สถานะการใช้งาน และสภาพ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สถานะทรัพย์สิน</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสถานะ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">ใช้งาน</SelectItem>
                          <SelectItem value="IN_MAINTENANCE">ซ่อมบำรุง</SelectItem>
                          <SelectItem value="BROKEN">ชำรุด</SelectItem>
                          <SelectItem value="WRITTEN_OFF">แทงจำหน่าย</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formControl}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สภาพทรัพย์สิน</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสภาพ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEW">ใหม่</SelectItem>
                          <SelectItem value="GOOD">ดี</SelectItem>
                          <SelectItem value="FAIR">พอใช้</SelectItem>
                          <SelectItem value="POOR">เสื่อมโทรม</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">ข้อมูลการจัดซื้อ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ราคาจัดซื้อ (บาท)</FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น 25000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formControl}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ผู้จัดจำหน่าย / Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4">
                <FormField
                  control={formControl}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หมายเหตุเพิ่มเติม</FormLabel>
                      <FormControl>
                        <Textarea placeholder="รายละเอียดอื่นๆ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">รูปภาพทรัพย์สิน</h3>
              <FormField
                control={formControl}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>อัปโหลดรูปภาพ (แนะนำให้ย่อขนาดก่อนอัปโหลด หรือขนาดไม่เกิน 1MB)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {field.value && (
                          <div className="relative w-40 h-40 border rounded-md overflow-hidden">
                            <img src={field.value} alt="Asset preview" className="object-cover w-full h-full" />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                              onClick={() => field.onChange("")}
                            >
                              &times;
                            </Button>
                          </div>
                        )}
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            // Check size (1MB limit for Base64 DB storage is recommended)
                            if (file.size > 1 * 1024 * 1024) {
                              toast({
                                title: "ไฟล์ภาพใหญ่เกินไป",
                                description: "กรุณาอัปโหลดรูปภาพขนาดไม่เกิน 1MB เพื่อไม่ให้ฐานข้อมูลหนักเกินไป",
                                variant: "destructive"
                              });
                              e.target.value = '';
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              field.onChange(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard/assets")} disabled={isPending}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
