"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { employeeSchema } from "@/lib/validations/master";
import { createEmployee, updateEmployee, deleteEmployee } from "@/actions/employees";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  position: string | null;
  isActive: boolean;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
};

type Department = {
  id: string;
  name: string;
  code: string;
};

export default function EmployeesClient({ 
  initialData, 
  departments 
}: { 
  initialData: Employee[];
  departments: Department[];
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof employeeSchema>>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeCode: "",
      firstName: "",
      lastName: "",
      departmentId: "",
      position: "",
      email: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof employeeSchema>) => {
    setIsPending(true);
    let result;
    if (editingId) {
      result = await updateEmployee(editingId, values);
    } else {
      result = await createEmployee(values);
    }
    setIsPending(false);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: editingId ? "แก้ไขพนักงานเรียบร้อยแล้ว" : "เพิ่มพนักงานเรียบร้อยแล้ว",
        
      });
      setOpen(false);
      form.reset();
      setEditingId(null);
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    form.reset({
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      departmentId: emp.department?.id || "",
      position: emp.position || "",
      email: emp.email || "",
      isActive: emp.isActive,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?")) return;
    setIsPending(true);
    const result = await deleteEmployee(id);
    setIsPending(false);
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: "ลบพนักงานเรียบร้อยแล้ว",
        
      });
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      form.reset({ 
        employeeCode: "", firstName: "", lastName: "", 
        departmentId: "", position: "", email: "", isActive: true 
      });
      setEditingId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="ค้นหาพนักงาน..." />
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button />}><Plus className="mr-2 h-4 w-4" /> เพิ่มพนักงาน</DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name="employeeCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>รหัสพนักงาน</FormLabel>
                          <FormControl>
                            <Input placeholder="เช่น EMP001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>แผนก</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกแผนก" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.code} - {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อจริง</FormLabel>
                          <FormControl>
                            <Input placeholder="..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>นามสกุล</FormLabel>
                          <FormControl>
                            <Input placeholder="..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ตำแหน่ง</FormLabel>
                          <FormControl>
                            <Input placeholder="เช่น Manager" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>อีเมล</FormLabel>
                          <FormControl>
                            <Input placeholder="เช่น employee@company.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full mt-4">
                    {isPending ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อ - นามสกุล</TableHead>
                <TableHead>แผนก</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">ไม่พบข้อมูล</TableCell>
                </TableRow>
              ) : (
                initialData.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                    <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell>{emp.department?.name || "-"}</TableCell>
                    <TableCell>{emp.position || "-"}</TableCell>
                    <TableCell>{emp.email || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
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
