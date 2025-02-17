import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  location: jsonb("location"),
  gardenSpace: text("garden_space"),
  sunlightHours: integer("sunlight_hours"),
});

export const gardens = pgTable("gardens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  length: integer("length").notNull(),
  gridData: jsonb("grid_data").notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  gardenId: integer("garden_id"),
  plantId: text("plant_id"),
  type: text("type").notNull(), // 'observation', 'task', 'note'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  sunlightHours: true,
  location: true,
  gardenSpace: true,
}).extend({
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }).optional(),
  gardenSpace: z.string().optional(),
  sunlightHours: z.number().min(0).max(24),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  gardenId: true,
  plantId: true,
  type: true,
}).extend({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  content: z.string()
    .min(1, "Content is required")
    .max(2000, "Content cannot exceed 2000 characters"),
  type: z.enum(["observation", "task", "note"]),
  gardenId: z.number().optional(),
  plantId: z.string().optional(),
});

export const insertGardenSchema = createInsertSchema(gardens).pick({
  userId: true,
  name: true,
  width: true,
  length: true,
  gridData: true,
});

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGarden = z.infer<typeof insertGardenSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type User = typeof users.$inferSelect;
export type Garden = typeof gardens.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Location = z.infer<typeof locationSchema>;