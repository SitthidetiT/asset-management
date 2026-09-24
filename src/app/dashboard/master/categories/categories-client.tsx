"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { categorySchema } from "@/lib/validations/master";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
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

type Category = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function CategoriesClient({ initialData }: { initialData: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: "",
      nameTh: "",
      nameEn: "",
      icon: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    setIsPending(true);
    let result;
    if (editingId) {
      result = await updateCategory(editingId, values);
    } else {
      result = await createCategory(values);
    }
    setIsPending(false);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: editingId ? "แก้ไขหมวดหมู่เรียบร้อยแล้ว" : "เพิ่มหมวดหมู่เรียบร้อยแล้ว",
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

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    form.reset({
      code: cat.code,
      nameTh: cat.nameTh,
      nameEn: cat.nameEn,
      icon: cat.icon || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้?")) return;
    setIsPending(true);
    const result = await deleteCategory(id);
    setIsPending(false);
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: "ลบหมวดหมู่เรียบร้อยแล้ว",
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
      form.reset({ code: "", nameTh: "", nameEn: "", icon: "" });
      setEditingId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="ค้นหาหมวดหมู่..." />
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" /> เพิ่มหมวดหมู่
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสหมวดหมู่</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น COM, NB" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameTh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อหมวดหมู่ (ภาษาไทย)</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น คอมพิวเตอร์" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อหมวดหมู่ (English)</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น Computer / PC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon (lucide-react name)</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น monitor" {...field} value={field.value || ""} />
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

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อ (ไทย)</TableHead>
                <TableHead>ชื่อ (อังกฤษ)</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">ไม่พบข้อมูล</TableCell>
                </TableRow>
              ) : (
                initialData.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.code}</TableCell>
                    <TableCell>{cat.nameTh}</TableCell>
                    <TableCell>{cat.nameEn}</TableCell>
                    <TableCell>{cat.icon || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
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
