import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGardenSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express): Server {
  app.post("/api/gardens", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { id: userId } = req.user as any;

      // Validate and parse the request body
      const gardenData = insertGardenSchema.parse({
        ...req.body,
        userId, // Add authenticated user's ID
      });

      const garden = await storage.createGarden(gardenData);
      res.json(garden);
    } catch (error) {
      console.error('Garden creation error:', error);
      const message = error instanceof Error ? error.message : "Invalid garden data";
      res.status(400).json({ error: message });
    }
  });

  app.get("/api/gardens/:userId", async (req, res) => {
    try {
      const garden = await storage.getGarden(parseInt(req.params.userId));
      if (!garden) {
        res.status(404).json({ error: "Garden not found" });
        return;
      }
      res.json(garden);
    } catch (error) {
      console.error('Garden fetch error:', error);
      res.status(500).json({ error: "Failed to fetch garden" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}