"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { transferSchema } from "@/lib/validations/transfers";
import { createTransfer } from "@/actions/transfers";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NewTransferForm({ masterData }: { masterData: { assets: any[]; employees: any[]; locations: any[] } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<any>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      assetId: "",
      toEmployeeId: "",
      toLocationId: "",
      reason: "",
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const result = await createTransfer(values);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "ส่งคำขอโอนย้ายเรียบร้อยแล้ว รอการอนุมัติ",
        });
        router.push("/dashboard/transfers");
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.error || "ไม่สามารถทำรายการได้",
          variant: "destructive",
        });
      }
    });
  };

  const formControl = form.control as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/transfers">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">ฟอร์มแจ้งโอนย้าย/ส่งมอบทรัพย์สิน</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <FormField
                  control={formControl}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เลือกทรัพย์สินที่ต้องการโอน <span className="text-destructive">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        items={masterData.assets.map((a) => ({ value: a.id, label: `[${a.assetCode}] ${a.name}` }))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ค้นหาและเลือกทรัพย์สิน..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {masterData.assets.map((a) => (
                            <SelectItem key={a.id} value={a.id} label={`[${a.assetCode}] ${a.name}`}>
                              [{a.assetCode}] {a.name} (ปัจจุบัน: {a.employeeName || 'ส่วนกลาง'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={formControl}
                    name="toEmployeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>โอนให้พนักงาน (ผู้รับใหม่)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          items={[
                            { value: "", label: "-- ไม่ระบุ / คืนส่วนกลาง --" },
                            ...masterData.employees.map((e) => ({ value: e.id, label: `${e.employeeCode} - ${e.firstName} ${e.lastName}` }))
                          ]}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกพนักงาน (ถ้ามี)..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">-- ไม่ระบุ / คืนส่วนกลาง --</SelectItem>
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
                    name="toLocationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ย้ายไปสถานที่ใหม่</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          items={[
                            { value: "", label: "-- ไม่ระบุ --" },
                            ...masterData.locations.map((l) => ({ value: l.id, label: l.name }))
                          ]}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสถานที่ (ถ้ามี)..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">-- ไม่ระบุ --</SelectItem>
                            {masterData.locations.map((l) => (
                              <SelectItem key={l.id} value={l.id} label={l.name}>
                                {l.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={formControl}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เหตุผลในการโอนย้าย <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="เช่น พนักงานใหม่เข้ามารับช่วงต่อ, ย้ายเครื่องไปสาขา 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard/transfers")} disabled={isPending}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "ส่งคำขอโอนย้าย"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
