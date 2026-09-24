"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { maintenanceSchema } from "@/lib/validations/maintenance";
import { createMaintenance, updateMaintenance } from "@/actions/maintenance";
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
  assets: { id: string; name: string; assetCode: string }[];
  employees: { id: string; firstName: string; lastName: string; employeeCode: string }[];
};

export function MaintenanceForm({
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
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      assetId: initialData?.assetId || "",
      reportedBy: initialData?.reportedBy || "",
      issueDescription: initialData?.issueDescription || "",
      status: initialData?.status || "PENDING",
      priority: initialData?.priority || "MEDIUM",
      cost: initialData?.cost?.toString() || "",
      vendor: initialData?.vendor || "",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      let result;
      // Handle Date manually for now if needed, or rely on defaults
      const payload = {
        ...values,
        repairDate: isEdit ? initialData?.repairDate : new Date(),
        completionDate: values.status === "COMPLETED" ? new Date() : null
      };

      if (isEdit && initialData?.id) {
        result = await updateMaintenance(initialData.id, payload);
      } else {
        result = await createMaintenance(payload);
      }

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: isEdit ? "อัปเดตรายการซ่อมเรียบร้อยแล้ว" : "สร้างรายการแจ้งซ่อมเรียบร้อยแล้ว",
        });
        router.push("/dashboard/maintenance");
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
        <Link href="/dashboard/maintenance">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">{isEdit ? "อัปเดตสถานะซ่อม" : "แจ้งซ่อมใหม่"}</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">ข้อมูลการแจ้งซ่อม</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ทรัพย์สิน <span className="text-destructive">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={isEdit}
                        items={masterData.assets.map((a) => ({ value: a.id, label: `${a.assetCode} - ${a.name}` }))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกทรัพย์สินที่ต้องการแจ้งซ่อม" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {masterData.assets.map((a) => (
                            <SelectItem key={a.id} value={a.id} label={`${a.assetCode} - ${a.name}`}>
                              {a.assetCode} - {a.name}
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
                  name="reportedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ผู้แจ้ง</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        items={[
                          { value: "", label: "-- ไม่ระบุ --" },
                          ...masterData.employees.map((e) => ({ value: e.id, label: `${e.employeeCode} - ${e.firstName} ${e.lastName}` }))
                        ]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกผู้แจ้ง" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">-- ไม่ระบุ --</SelectItem>
                          {masterData.employees.map((e) => (
                            <SelectItem key={e.id} value={e.id} label={`${e.employeeCode} - ${e.firstName} ${e.lastName}`}>
                              {e.employeeCode} - {e.firstName} {e.lastName}
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ความเร่งด่วน</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        items={[
                          { value: "LOW", label: "ต่ำ" },
                          { value: "MEDIUM", label: "ปานกลาง" },
                          { value: "HIGH", label: "สูง" },
                          { value: "URGENT", label: "ด่วนมาก" }
                        ]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกความเร่งด่วน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">ต่ำ</SelectItem>
                          <SelectItem value="MEDIUM">ปานกลาง</SelectItem>
                          <SelectItem value="HIGH">สูง</SelectItem>
                          <SelectItem value="URGENT">ด่วนมาก</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEdit && (
                  <FormField
                    control={formControl}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สถานะการซ่อม</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          items={[
                            { value: "PENDING", label: "รอดำเนินการ" },
                            { value: "IN_PROGRESS", label: "กำลังซ่อม" },
                            { value: "COMPLETED", label: "ซ่อมเสร็จสิ้น" },
                            { value: "CANCELLED", label: "ยกเลิก" }
                          ]}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสถานะ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
                            <SelectItem value="IN_PROGRESS">กำลังซ่อม</SelectItem>
                            <SelectItem value="COMPLETED">ซ่อมเสร็จสิ้น</SelectItem>
                            <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="mt-4">
                <FormField
                  control={formControl}
                  name="issueDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>อาการเสีย / ปัญหาที่พบ <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="รายละเอียดอาการเสียเบื้องต้น..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {isEdit && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">ส่วนของผู้ซ่อม / ค่าใช้จ่าย</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formControl}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ร้านที่ซ่อม / ช่างซ่อม</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อบริษัทหรือผู้รับเหมา" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formControl}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ค่าใช้จ่าย (บาท)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
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
                        <FormLabel>บันทึกผลการซ่อม (Notes)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="รายละเอียดการแก้ปัญหา..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard/maintenance")} disabled={isPending}>
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
