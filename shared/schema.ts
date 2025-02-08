import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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

export const insertGardenSchema = createInsertSchema(gardens).extend({
  width: z.number()
    .int("Width must be a whole number")
    .min(30, "Minimum width is 30cm")
    .max(500, "Maximum width is 500cm"),
  length: z.number()
    .int("Length must be a whole number")
    .min(30, "Minimum length is 30cm")
    .max(500, "Maximum length is 500cm"),
  name: z.string().min(1, "Garden name is required"),
  gridData: z.array(z.any()).optional().default([]),
});

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertGarden = z.infer<typeof insertGardenSchema>;
export type User = typeof users.$inferSelect;
export type Garden = typeof gardens.$inferSelect;
export type Location = z.infer<typeof locationSchema>;