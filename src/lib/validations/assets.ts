import * as z from "zod";

export const assetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "กรุณาระบุชื่อทรัพย์สิน").max(255),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  categoryId: z.string().uuid("กรุณาเลือกหมวดหมู่"),
  locationId: z.string().uuid("กรุณาเลือกสถานที่"),
  departmentId: z.string().uuid("กรุณาเลือกแผนก"),
  employeeId: z.string().uuid().optional().nullable().or(z.literal("")),
  status: z.enum(["ACTIVE", "IN_MAINTENANCE", "BROKEN", "WRITTEN_OFF"]).default("ACTIVE"),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR"]).default("NEW"),
  purchaseDate: z.date().optional().nullable(),
  purchasePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "รูปแบบราคาไม่ถูกต้อง").optional().or(z.literal("")),
  supplier: z.string().optional(),
  warrantyExpiry: z.date().optional().nullable(),
  notes: z.string().optional(),
});
