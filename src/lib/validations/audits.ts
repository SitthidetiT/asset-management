import * as z from "zod";

export const auditSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "กรุณาระบุชื่อรอบการตรวจนับ").max(255),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED"]).default("PLANNED"),
  createdBy: z.string().uuid().optional().nullable().or(z.literal("")),
  notes: z.string().optional(),
});
