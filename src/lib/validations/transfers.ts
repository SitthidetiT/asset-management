import * as z from "zod";

export const transferSchema = z.object({
  id: z.string().uuid().optional(),
  assetId: z.string().uuid({ message: "กรุณาเลือกทรัพย์สิน" }),
  toEmployeeId: z.string().uuid().optional().nullable().or(z.literal("")),
  toLocationId: z.string().uuid().optional().nullable().or(z.literal("")),
  reason: z.string().min(1, "กรุณาระบุเหตุผลการโอนย้าย").max(1000),
}).refine((data) => {
  return data.toEmployeeId || data.toLocationId;
}, {
  message: "กรุณาระบุผู้รับโอน หรือสถานที่ใหม่ อย่างน้อย 1 อย่าง",
  path: ["toEmployeeId"], 
});
