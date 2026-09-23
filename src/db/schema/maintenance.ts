import { pgTable, text, timestamp, uuid, varchar, numeric, boolean } from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { employees } from "./master";
import { relations } from "drizzle-orm";

export const maintenanceRecords = pgTable("maintenance_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id").notNull().references(() => assets.id),
  reportedBy: uuid("reported_by").references(() => employees.id),
  issueDescription: text("issue_description").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  priority: varchar("priority", { length: 50 }).notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, URGENT
  cost: numeric("cost", { precision: 12, scale: 2 }),
  vendor: varchar("vendor", { length: 255 }),
  repairDate: timestamp("repair_date", { mode: "date" }),
  completionDate: timestamp("completion_date", { mode: "date" }),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  asset: one(assets, {
    fields: [maintenanceRecords.assetId],
    references: [assets.id],
  }),
  reporter: one(employees, {
    fields: [maintenanceRecords.reportedBy],
    references: [employees.id],
  }),
}));
