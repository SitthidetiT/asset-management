"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { departmentSchema } from "@/lib/validations/master";
import { createDepartment, updateDepartment, deleteDepartment } from "@/actions/departments";
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
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Department = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function DepartmentsClient({ initialData }: { initialData: Department[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof departmentSchema>>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    setIsPending(true);
    let result;
    if (editingId) {
      result = await updateDepartment(editingId, values);
    } else {
      result = await createDepartment(values);
    }
    setIsPending(false);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: editingId ? "แก้ไขแผนกเรียบร้อยแล้ว" : "เพิ่มแผนกเรียบร้อยแล้ว",
        
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

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    form.reset({
      code: dept.code,
      name: dept.name,
      description: dept.description || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบแผนกนี้?")) return;
    setIsPending(true);
    const result = await deleteDepartment(id);
    setIsPending(false);
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: "ลบแผนกเรียบร้อยแล้ว",
        
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
      form.reset({ code: "", name: "", description: "" });
      setEditingId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="ค้นหาแผนก..." />
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button />}><Plus className="mr-2 h-4 w-4" /> เพิ่มแผนก</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "แก้ไขแผนก" : "เพิ่มแผนก"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสแผนก</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น IT, HR" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อแผนก</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น Information Technology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รายละเอียด (ไม่บังคับ)</FormLabel>
                        <FormControl>
                          <Input placeholder="..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending} className="w-full">
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
                <TableHead>ชื่อแผนก</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">ไม่พบข้อมูล</TableCell>
                </TableRow>
              ) : (
                initialData.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
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
