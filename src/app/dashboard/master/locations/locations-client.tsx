"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { locationSchema } from "@/lib/validations/master";
import { createLocation, updateLocation, deleteLocation } from "@/actions/locations";
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

type Location = {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function LocationsClient({ initialData }: { initialData: Location[] }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      code: "",
      nameTh: "",
      nameEn: "",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof locationSchema>) => {
    setIsPending(true);
    let result;
    if (editingId) {
      result = await updateLocation(editingId, values);
    } else {
      result = await createLocation(values);
    }
    setIsPending(false);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: editingId ? "แก้ไขสถานที่เรียบร้อยแล้ว" : "เพิ่มสถานที่เรียบร้อยแล้ว",
        
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

  const handleEdit = (loc: Location) => {
    setEditingId(loc.id);
    form.reset({
      code: loc.code,
      nameTh: loc.nameTh,
      nameEn: loc.nameEn,
      description: loc.description || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบสถานที่นี้?")) return;
    setIsPending(true);
    const result = await deleteLocation(id);
    setIsPending(false);
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: "ลบสถานที่เรียบร้อยแล้ว",
        
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
      form.reset({ code: "", nameTh: "", nameEn: "", description: "" });
      setEditingId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="text" placeholder="ค้นหาสถานที่..." />
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button />}><Plus className="mr-2 h-4 w-4" /> เพิ่มสถานที่</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "แก้ไขสถานที่" : "เพิ่มสถานที่"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสสถานที่</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น HQ, F1" {...field} />
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
                        <FormLabel>ชื่อสถานที่ (ไทย)</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น โรงงาน 1" {...field} />
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
                        <FormLabel>ชื่อสถานที่ (อังกฤษ)</FormLabel>
                        <FormControl>
                          <Input placeholder="เช่น Factory 1" {...field} />
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

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อสถานที่ (ไทย)</TableHead>
                <TableHead>ชื่อสถานที่ (อังกฤษ)</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">ไม่พบข้อมูล</TableCell>
                </TableRow>
              ) : (
                initialData.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{loc.code}</TableCell>
                    <TableCell>{loc.nameTh}</TableCell>
                    <TableCell>{loc.nameEn}</TableCell>
                    <TableCell>{loc.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(loc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)}>
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
