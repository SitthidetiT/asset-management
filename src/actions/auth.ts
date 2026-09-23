"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "กรุณาระบุอีเมลให้ถูกต้อง" }),
  password: z.string().min(1, { message: "กรุณาระบุรหัสผ่าน" }),
});

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = loginSchema.safeParse(data);
    
    if (!parsed.success) {
      return "ข้อมูลไม่ถูกต้อง";
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    
    return "SUCCESS";
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        default:
          return "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      }
    }
    throw error;
  }
}
