// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJournalEntrySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from 'express';

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Image upload endpoint
  app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Journal Routes
  app.get("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id } = req.user as any;
      const entries = await storage.getJournalEntries(id);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id: userId } = req.user as any;
      const data = insertJournalEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createJournalEntry(data);
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      const message = error instanceof Error ? error.message : "Failed to create journal entry";
      res.status(400).json({ error: message });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id: userId } = req.user as any;
      const entryId = parseInt(req.params.id);
      const entry = await storage.updateJournalEntry(entryId, userId, req.body);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      const message = error instanceof Error ? error.message : "Failed to update journal entry";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { id: userId } = req.user as any;
      const entryId = parseInt(req.params.id);
      const entry = await storage.deleteJournalEntry(entryId, userId);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      const message = error instanceof Error ? error.message : "Failed to delete journal entry";
      res.status(400).json({ error: message });
    }
  });

  // Garden Routes
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
      res.json(garden);
    } catch (error) {
      console.error("Error fetching garden:", error);
      res.status(500).json({ error: "Failed to fetch garden" });
    }
  });

  app.patch("/api/gardens/:id/cell", async (req, res) => {
    try {
      const gardenId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { x, y, plantData } = req.body;
      if (x === undefined || y === undefined || !plantData || !plantData.plantId) {
        return res.status(400).json({ error: "Missing required fields: x, y, or plantData" });
      }
      const garden = await storage.getGardenById(gardenId, userId);
      if (!garden) {
        return res.status(404).json({ error: "Garden not found" });
      }
      let gridData: any[] = garden.gridData || [];
      const cellSize = 25;
      const columns = Math.ceil(garden.width / cellSize);
      const index = x * columns + y;
      gridData[index] = plantData;
      await storage.updateGardenGridData(gardenId, userId, gridData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating garden cell:", error);
      res.status(500).json({ error: "Failed to update garden cell" });
    }
  });

  app.delete("/api/gardens/:id/cell", async (req, res) => {
    try {
      const gardenId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { x, y } = req.body;
      if (x === undefined || y === undefined) {
        return res.status(400).json({ error: "Missing required fields: x or y" });
      }
      const garden = await storage.getGardenById(gardenId, userId);
      if (!garden) {
        return res.status(404).json({ error: "Garden not found" });
      }
      let gridData: any[] = garden.gridData || [];
      const cellSize = 25;
      const columns = Math.ceil(garden.width / cellSize);
      const index = x * columns + y;
      gridData[index] = null;
      await storage.updateGardenGridData(gardenId, userId, gridData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting plant from garden cell:", error);
      res.status(500).json({ error: "Failed to delete plant from garden cell" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}