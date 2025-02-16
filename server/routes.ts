// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGardenSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.post("/api/users/onboarding", async (req, res) => {
    try {
      const { id } = req.user as any;
      const { location, gardenSpace, sunlightHours } = req.body;
      const updatedUser = await storage.updateUser(id, {
        location,
        gardenSpace,
        sunlightHours: Number(sunlightHours),
      });
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      const message = error.message || "Failed to save onboarding data";
      res.status(400).json({ error: message });
    }
  });

  app.post("/api/gardens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id: userId } = req.user as any;
      const { name, width, length } = req.body;
      // Use cell size 25 to create the grid
      const columns = Math.ceil(width / 25);
      const rows = Math.ceil(length / 25);
      const gridData = Array(rows * columns).fill(null);
      const gardenData = { userId, name, width, length, gridData };
      const garden = await storage.createGarden(gardenData);
      res.json(garden);
    } catch (error) {
      console.error("Garden creation error:", error);
      const message =
        error instanceof Error ? error.message : "Invalid garden data";
      res.status(400).json({ error: message });
    }
  });

  app.get("/api/gardens", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id } = req.user as any;
      const gardens = await storage.getGardens(id);
      res.json(gardens);
    } catch (error) {
      console.error("Error fetching gardens:", error);
      res.status(500).json({ error: "Failed to fetch gardens" });
    }
  });

  app.get("/api/gardens/:id", async (req, res) => {
    console.log("Garden fetch request:", {
      params: req.params,
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
    });
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id: userId } = req.user as any;
      const gardenId = parseInt(req.params.id);
      if (isNaN(gardenId)) {
        return res.status(400).json({ error: "Invalid garden ID" });
      }
      const garden = await storage.getGardenById(gardenId, userId);
      if (!garden) {
        return res.status(404).json({ error: "Garden not found" });
      }
      console.log("Fetched garden gridData:", garden.gridData);
      res.json(garden);
    } catch (error) {
      console.error("Error fetching garden:", error);
      res.status(500).json({ error: "Failed to fetch garden" });
    }
  });

  // New route to update a single cell in the garden grid.
  // Expects: { x: number, y: number, plantData: { plantId: string, image: string, name: string } }
  app.patch("/api/gardens/:id/cell", async (req, res) => {
    try {
      const gardenId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { x, y, plantData } = req.body;
      if (
        x === undefined ||
        y === undefined ||
        !plantData ||
        !plantData.plantId
      ) {
        return res
          .status(400)
          .json({ error: "Missing required fields: x, y, or plantData" });
      }
      const garden = await storage.getGardenById(gardenId, userId);
      if (!garden) {
        return res.status(404).json({ error: "Garden not found" });
      }
      // Use cell size 25 as in the front-end
      let gridData: any[] = garden.gridData || [];
      const cellSize = 25;
      const columns = Math.ceil(garden.width / cellSize);
      const index = x * columns + y;
      gridData[index] = plantData;
      await storage.updateGarden(gardenId, userId, gridData);
      console.log(`Updated cell at (${x}, ${y}) with plantData:`, plantData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating garden cell:", error);
      res.status(500).json({ error: "Failed to update garden cell" });
    }
  });

  app.patch("/api/gardens/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id: userId } = req.user as any;
      const gardenId = parseInt(req.params.id);
      console.log("Updating garden:", {
        userId,
        gardenId,
        gridData: req.body.gridData,
      });
      const garden = await storage.updateGarden(
        gardenId,
        userId,
        req.body.gridData,
      );
      if (!garden) {
        return res.status(404).json({ error: "Garden not found" });
      }
      res.json(garden);
    } catch (error) {
      console.error("Garden update error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to update garden";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/gardens/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id: userId } = req.user as any;
      const gardenId = parseInt(req.params.id);
      const deletedGarden = await storage.deleteGarden(gardenId, userId);
      if (!deletedGarden) {
        return res.status(404).json({ error: "Garden not found" });
      }
      res.json(deletedGarden);
    } catch (error) {
      console.error("Garden deletion error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete garden";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/users/test", async (req, res) => {
    try {
      await storage.deleteTestUsers();
      res.json({ message: "Test users deleted successfully" });
    } catch (error) {
      console.error("Delete test users error:", error);
      res.status(500).json({ error: "Failed to delete test users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
