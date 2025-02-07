import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGardenSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

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