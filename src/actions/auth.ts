"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, { message: "กรุณาระบุชื่อผู้ใช้" }),
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
      username: parsed.data.username,
      password: parsed.data.password,
      redirect: false,
    });
    
    return "SUCCESS";
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        default:
          return "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      }
    }
    throw error;
  }
}
