import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { offers } from "./schema";

// Таблица для хранения отдельных креативных файлов
export const creativeFiles = pgTable("creative_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // 'image', 'video', 'archive', 'document'
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(), // Путь в object storage
  publicUrl: text("public_url"), // URL для публичного доступа
  dimensions: text("dimensions"), // "1920x1080" для изображений/видео
  duration: integer("duration"), // Длительность в секундах для видео
  description: text("description"),
  tags: text("tags").array().default([]), // Теги для категоризации
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Связь для группировки файлов в наборы креативов
export const creativeSets = pgTable("creative_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offerId: varchar("offer_id").notNull().references(() => offers.id),
  name: text("name").notNull(),
  description: text("description"),
  version: text("version").default('1.0'),
  isDefault: boolean("is_default").default(false),
  archivePath: text("archive_path"), // Путь к ZIP архиву
  archiveSize: integer("archive_size"),
  downloadCount: integer("download_count").default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Связь файлов с наборами
export const creativeSetFiles = pgTable("creative_set_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  setId: varchar("set_id").notNull().references(() => creativeSets.id),
  fileId: varchar("file_id").notNull().references(() => creativeFiles.id),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type CreativeFile = typeof creativeFiles.$inferSelect;
export type InsertCreativeFile = typeof creativeFiles.$inferInsert;
export type CreativeSet = typeof creativeSets.$inferSelect;
export type InsertCreativeSet = typeof creativeSets.$inferInsert;
export type CreativeSetFile = typeof creativeSetFiles.$inferSelect;
export type InsertCreativeSetFile = typeof creativeSetFiles.$inferInsert;