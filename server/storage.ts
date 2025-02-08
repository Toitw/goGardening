import { db } from "./db";
import { users, gardens } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

export const storage = {
  async deleteTestUsers() {
    await db.delete(users).where(eq(users.username, "test"));
  },

  async verifyPassword(password: string, hashedPassword: string) {
    return bcryptjs.compare(password, hashedPassword);
  },

  async createUser({ username, password }: { username: string; password: string }) {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const [user] = await db.insert(users).values({
      username,
      password: hashedPassword,
    }).returning();
    return user;
  },

  async updateUser(id: number, data: any) {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },

  async createGarden(data: { userId: number; name: string; width: number; length: number; gridData: any[] }) {
    console.log('Creating garden in storage with data:', data);
    const [garden] = await db.insert(gardens)
      .values({
        userId: data.userId,
        name: data.name,
        width: data.width,
        length: data.length,
        gridData: data.gridData,
      })
      .returning();
    return garden;
  },

  async getGardens(userId: number) {
    return await db.select()
      .from(gardens)
      .where(eq(gardens.userId, userId));
  },

  async getGardenById(gardenId: number, userId: number) {
    const [garden] = await db.select()
      .from(gardens)
      .where(eq(gardens.id, gardenId))
      .where(eq(gardens.userId, userId));
    return garden;
  },

  async updateGarden(id: number, userId: number, gridData: any[]) {
    const [garden] = await db.update(gardens)
      .set({ gridData })
      .where(eq(gardens.id, id))
      .where(eq(gardens.userId, userId))
      .returning();
    return garden;
  },

  async deleteGarden(id: number, userId: number) {
    const [deletedGarden] = await db.delete(gardens)
      .where(eq(gardens.id, id))
      .where(eq(gardens.userId, userId))
      .returning();
    return deletedGarden;
  }
};