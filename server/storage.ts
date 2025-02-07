import { users, gardens, type User, type Garden, type InsertUser, type InsertGarden } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getGarden(userId: number): Promise<Garden | undefined>;
  createGarden(garden: InsertGarden): Promise<Garden>;
  updateGarden(id: number, gridData: any): Promise<Garden>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gardens: Map<number, Garden>;
  private currentUserId: number;
  private currentGardenId: number;

  constructor() {
    this.users = new Map();
    this.gardens = new Map();
    this.currentUserId = 1;
    this.currentGardenId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getGarden(userId: number): Promise<Garden | undefined> {
    return Array.from(this.gardens.values()).find(
      (garden) => garden.userId === userId
    );
  }

  async createGarden(garden: InsertGarden): Promise<Garden> {
    const id = this.currentGardenId++;
    const newGarden: Garden = { ...garden, id };
    this.gardens.set(id, newGarden);
    return newGarden;
  }

  async updateGarden(id: number, gridData: any): Promise<Garden> {
    const garden = this.gardens.get(id);
    if (!garden) throw new Error("Garden not found");
    
    const updatedGarden = { ...garden, gridData };
    this.gardens.set(id, updatedGarden);
    return updatedGarden;
  }
}

export const storage = new MemStorage();
