import { pgTable, uuid, varchar, text, boolean, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { departments, categories, locations, employees } from "./master";

export const assetSequences = pgTable("asset_sequences", {
  prefix: varchar("prefix", { length: 50 }).primaryKey(),
  currentValue: integer("current_value").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetCode: varchar("asset_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  serialNumber: varchar("serial_number", { length: 100 }),
  
  // Relations
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  locationId: uuid("location_id").notNull().references(() => locations.id),
  departmentId: uuid("department_id").notNull().references(() => departments.id),
  employeeId: uuid("employee_id").references(() => employees.id), // Can be null if not assigned
  
  // Enums stored as varchar for simplicity in this project (as per typical drizzle setup without custom pgEnums if not needed)
  status: varchar("status", { length: 50 }).notNull().default("ACTIVE"), // ACTIVE, IN_MAINTENANCE, BROKEN, WRITTEN_OFF
  condition: varchar("condition", { length: 50 }).notNull().default("NEW"), // NEW, GOOD, FAIR, POOR
  
  // Purchase Info
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  warrantyExpiry: timestamp("warranty_expiry"),
  
  notes: text("notes"),
  
  // Soft Delete
  isDeleted: boolean("is_deleted").default(false).notNull(),
  
  // Audit
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
