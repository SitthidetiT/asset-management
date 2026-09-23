import * as z from "zod";

export const maintenanceSchema = z.object({
  id: z.string().uuid().optional(),
  assetId: z.string().uuid("กรุณาเลือกทรัพย์สิน"),
  reportedBy: z.string().uuid("กรุณาเลือกผู้แจ้งซ่อม").optional().nullable().or(z.literal("")),
  issueDescription: z.string().min(1, "กรุณาระบุอาการเสีย").max(1000),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/, "รูปแบบราคาไม่ถูกต้อง").optional().or(z.literal("")),
  vendor: z.string().max(255).optional(),
  repairDate: z.date().optional().nullable(),
  completionDate: z.date().optional().nullable(),
  notes: z.string().optional(),
});
