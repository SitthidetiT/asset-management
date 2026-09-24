"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { auditSchema } from "@/lib/validations/audits";
import { createAudit } from "@/actions/audits";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NewAuditForm({ employees }: { employees: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<any>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      name: "",
      status: "IN_PROGRESS",
      createdBy: "",
      notes: "",
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const payload = {
        ...values,
        startDate: new Date(),
      };

      const result = await createAudit(payload);

      if (result.success) {
        toast({
          title: "สำเร็จ",
          description: "เปิดรอบตรวจนับเรียบร้อยแล้ว",
        });
        router.push("/dashboard/audits");
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.error || "ไม่สามารถเปิดรอบตรวจนับได้",
          variant: "destructive",
        });
      }
    });
  };

  const formControl = form.control as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/audits">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">เปิดรอบตรวจนับทรัพย์สินใหม่</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                การเปิดรอบตรวจนับ จะดึงรายการทรัพย์สินที่ยัง Active อยู่ในระบบทั้งหมดมาเพื่อทำการ Audit โดยอัตโนมัติ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อรอบการตรวจนับ <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น เช็คสต๊อกประจำปี 2026 สาขาหลัก" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formControl}
                  name="createdBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ผู้ดูแลการตรวจนับ (Auditor)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        items={[
                          { value: "", label: "-- ไม่ระบุ --" },
                          ...employees.map((e) => ({ value: e.id, label: `${e.employeeCode} - ${e.firstName} ${e.lastName}` }))
                        ]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกพนักงาน..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">-- ไม่ระบุ --</SelectItem>
                          {employees.map((e) => (
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
              </div>

              <div className="mt-4">
                <FormField
                  control={formControl}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียด / ขอบเขตการตรวจนับ</FormLabel>
                      <FormControl>
                        <Textarea placeholder="..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => router.push("/dashboard/audits")} disabled={isPending}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังสร้าง..." : "เริ่มต้นการตรวจนับ"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
