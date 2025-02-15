import { db } from "./db";
import { users, gardens } from "@shared/schema";
import { eq } from "drizzle-orm";
import { InsertGarden } from "@shared/schema";
import { log } from "./vite";

async function getGardenById(id: number, userId: number) {
  const garden = await db.select().from(gardens)
    .where(eq(gardens.id, id))
    .then(rows => rows[0]);

  if (garden && garden.userId !== userId) {
    return null;
  }

  if (garden && typeof garden.gridData === "string") {
    garden.gridData = JSON.parse(garden.gridData);
  }
  return garden;
}

async function updateGardenGridData(gardenId: number, userId: number, gridData: any[]) {
  const garden = await getGardenById(gardenId, userId);
  if (!garden) {
    return null;
  }

  return await db.update(gardens)
    .set({ gridData: JSON.stringify(gridData) })
    .where(eq(gardens.id, gardenId))
    .returning();
}

export const storage = {
  async deleteTestUsers() {
    await db.delete(users).where(eq(users.username, "test"));
  },

  async verifyPassword(password: string, hashedPassword: string) {
    return bcryptjs.compare(password, hashedPassword);
  },

  async createUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning();
    return user;
  },

  async updateUser(id: number, data: any) {
    const [user] = await db
      .update(users)
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
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  },

  async createGarden(data: {
    userId: number;
    name: string;
    width: number;
    length: number;
    gridData: any[];
  }) {
    console.log("Creating garden in storage with data:", data);
    const [garden] = await db
      .insert(gardens)
      .values({
        userId: data.userId,
        name: data.name,
        width: data.width,
        length: data.length,
        gridData: JSON.stringify(data.gridData),
      })
      .returning();
    return garden;
  },

  async getGardens(userId: number) {
    return await db.select().from(gardens).where(eq(gardens.userId, userId));
  },

  getGardenById,

  async updateGarden(id: number, userId: number, gridData: any[]) {
    const garden = await getGardenById(id, userId);
    if(!garden) {
      return null;
    }
    const [updatedGarden] = await db
      .update(gardens)
      .set({ gridData: JSON.stringify(gridData) })
      .where(eq(gardens.id, id))
      .returning();
    return updatedGarden;
  },

  async updateGardenGridData: updateGardenGridData,

  async deleteGarden(id: number, userId: number) {
    const [deletedGarden] = await db
      .delete(gardens)
      .where(and(eq(gardens.id, id), eq(gardens.userId, userId)))
      .returning();
    return deletedGarden;
  },
};
import bcryptjs from "bcryptjs";
import { and } from "drizzle-orm";