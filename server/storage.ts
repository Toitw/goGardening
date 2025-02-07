import { users, gardens, type User, type Garden, type InsertUser, type InsertGarden } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getGarden(userId: number): Promise<Garden | undefined>;
  createGarden(garden: InsertGarden): Promise<Garden>;
  updateGarden(id: number, gridData: any): Promise<Garden>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getGarden(userId: number): Promise<Garden | undefined> {
    const [garden] = await db.select().from(gardens).where(eq(gardens.userId, userId));
    return garden;
  }

  async createGarden(garden: InsertGarden): Promise<Garden> {
    const [newGarden] = await db
      .insert(gardens)
      .values(garden)
      .returning();
    return newGarden;
  }

  async updateGarden(id: number, gridData: any): Promise<Garden> {
    const [garden] = await db
      .update(gardens)
      .set({ gridData })
      .where(eq(gardens.id, id))
      .returning();

    if (!garden) {
      throw new Error("Garden not found");
    }

    return garden;
  }
}

export const storage = new DatabaseStorage();