import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGardenSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express): Server {
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);

      if (existingUser) {
        return res.status(400).json({ 
          error: "Username already taken. Please choose a different username." 
        });
      }

      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error('User creation error:', error);
      const message = error instanceof Error ? error.message : "Invalid user data";
      res.status(400).json({ error: message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  });

  app.post("/api/gardens", async (req, res) => {
    try {
      const gardenData = insertGardenSchema.parse(req.body);
      const garden = await storage.createGarden(gardenData);
      res.json(garden);
    } catch (error) {
      console.error('Garden creation error:', error);
      const message = error instanceof Error ? error.message : "Invalid garden data";
      res.status(400).json({ error: message });
    }
  });

  app.get("/api/gardens/:userId", async (req, res) => {
    const garden = await storage.getGarden(parseInt(req.params.userId));
    if (!garden) {
      res.status(404).json({ error: "Garden not found" });
      return;
    }
    res.json(garden);
  });

  app.patch("/api/gardens/:id", async (req, res) => {
    try {
      const garden = await storage.updateGarden(parseInt(req.params.id), req.body.gridData);
      res.json(garden);
    } catch (error) {
      console.error('Garden update error:', error);
      const message = error instanceof Error ? error.message : "Failed to update garden";
      res.status(400).json({ error: message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}