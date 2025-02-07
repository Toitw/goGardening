import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  location: jsonb("location").notNull(),
  gardenSpace: text("garden_space").notNull(),
  sunlightHours: integer("sunlight_hours").notNull(),
});

export const gardens = pgTable("gardens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  gridData: jsonb("grid_data").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  location: true,
  gardenSpace: true,
  sunlightHours: true,
});

export const insertGardenSchema = createInsertSchema(gardens).pick({
  userId: true,
  name: true,
  gridData: true,
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
