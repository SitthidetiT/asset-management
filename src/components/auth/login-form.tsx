"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authenticate } from "@/actions/auth";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "กรุณาระบุชื่อผู้ใช้",
  }),
  password: z.string().min(1, {
    message: "กรุณาระบุรหัสผ่าน",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("password", values.password);
      
      const result = await authenticate(undefined, formData);
      if (result === "SUCCESS") {
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: "กำลังนำคุณเข้าสู่ระบบ...",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center flex flex-col items-center">
        <div className="relative h-16 w-48 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ATS Logo" className="object-contain h-full w-full" />
        </div>
        <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
        <CardDescription>
          ระบบบริหารจัดการทรัพย์สินบริษัท
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>ชื่อผู้ใช้ (Username)</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น admin" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && (
              <div className="text-sm font-medium text-destructive text-center">
                {error}
              </div>
            )}
            
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ลงชื่อเข้าใช้
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
