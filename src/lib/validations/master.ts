import * as z from "zod";

export const departmentSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "กรุณาระบุรหัสแผนก").max(50),
  name: z.string().min(1, "กรุณาระบุชื่อแผนก").max(255),
  description: z.string().optional(),
});

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "กรุณาระบุรหัสหมวดหมู่").max(50),
  nameTh: z.string().min(1, "กรุณาระบุชื่อหมวดหมู่ (ไทย)").max(255),
  nameEn: z.string().min(1, "กรุณาระบุชื่อหมวดหมู่ (อังกฤษ)").max(255),
  icon: z.string().optional(),
});

export const locationSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "กรุณาระบุรหัสสถานที่").max(50),
  nameTh: z.string().min(1, "กรุณาระบุชื่อสถานที่ (ไทย)").max(255),
  nameEn: z.string().min(1, "กรุณาระบุชื่อสถานที่ (อังกฤษ)").max(255),
  description: z.string().optional(),
});

export const employeeSchema = z.object({
  id: z.string().uuid().optional(),
  employeeCode: z.string().min(1, "กรุณาระบุรหัสพนักงาน").max(50),
  firstName: z.string().min(1, "กรุณาระบุชื่อ").max(100),
  lastName: z.string().min(1, "กรุณาระบุนามสกุล").max(100),
  departmentId: z.string().uuid("กรุณาเลือกแผนก"),
  position: z.string().optional(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  isActive: z.boolean(),
});
