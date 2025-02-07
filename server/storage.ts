import { db } from "./db";
import { users, gardens } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export const storage = {
  async createUser({ username, password }: { username: string; password: string }) {
    const hashedPassword = await bcrypt.hash(password, 10);
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
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user;
  },

  async getUserByUsername(username: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return user;
  },

  async createGarden(data: any) {
    const [garden] = await db.insert(gardens).values(data).returning();
    return garden;
  },

  async getGarden(userId: number) {
    const garden = await db.query.gardens.findFirst({
      where: eq(gardens.userId, userId),
    });
    return garden;
  },

  async updateGarden(id: number, gridData: any) {
    const [garden] = await db.update(gardens)
      .set({ gridData })
      .where(eq(gardens.id, id))
      .returning();
    return garden;
  }
};