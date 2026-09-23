import { pgTable, text, timestamp, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { employees, locations } from "./master";
import { relations } from "drizzle-orm";

export const assetTransfers = pgTable("asset_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id").notNull().references(() => assets.id),
  fromEmployeeId: uuid("from_employee_id").references(() => employees.id),
  toEmployeeId: uuid("to_employee_id").references(() => employees.id),
  fromLocationId: uuid("from_location_id").references(() => locations.id),
  toLocationId: uuid("to_location_id").references(() => locations.id),
  transferDate: timestamp("transfer_date", { mode: "date" }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // PENDING, APPROVED, REJECTED
  approvedBy: uuid("approved_by").references(() => employees.id),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const assetTransfersRelations = relations(assetTransfers, ({ one }) => ({
  asset: one(assets, {
    fields: [assetTransfers.assetId],
    references: [assets.id],
  }),
  fromEmployee: one(employees, {
    fields: [assetTransfers.fromEmployeeId],
    references: [employees.id],
    relationName: "fromEmployee",
  }),
  toEmployee: one(employees, {
    fields: [assetTransfers.toEmployeeId],
    references: [employees.id],
    relationName: "toEmployee",
  }),
  fromLocation: one(locations, {
    fields: [assetTransfers.fromLocationId],
    references: [locations.id],
    relationName: "fromLocation",
  }),
  toLocation: one(locations, {
    fields: [assetTransfers.toLocationId],
    references: [locations.id],
    relationName: "toLocation",
  }),
}));
