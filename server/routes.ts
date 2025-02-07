import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGardenSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
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
      res.status(400).json({ error: "Invalid garden data" });
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
      res.status(400).json({ error: "Failed to update garden" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
