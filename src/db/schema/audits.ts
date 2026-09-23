import { pgTable, text, timestamp, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { assets } from "./assets";
import { employees } from "./master";
import { relations } from "drizzle-orm";

export const audits = pgTable("audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),
  status: varchar("status", { length: 50 }).notNull().default("PLANNED"), // PLANNED, IN_PROGRESS, COMPLETED
  createdBy: uuid("created_by").references(() => employees.id),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const auditItems = pgTable("audit_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: uuid("audit_id").notNull().references(() => audits.id),
  assetId: uuid("asset_id").notNull().references(() => assets.id),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"), // PENDING, FOUND, MISSING, DAMAGED
  scannedAt: timestamp("scanned_at", { mode: "date" }),
  notes: text("notes"),
});

export const auditsRelations = relations(audits, ({ many }) => ({
  items: many(auditItems),
}));

export const auditItemsRelations = relations(auditItems, ({ one }) => ({
  audit: one(audits, {
    fields: [auditItems.auditId],
    references: [audits.id],
  }),
  asset: one(assets, {
    fields: [auditItems.assetId],
    references: [assets.id],
  }),
}));
