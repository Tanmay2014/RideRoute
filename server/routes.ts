import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTourSchema, insertPhotoSchema, insertTourReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tour routes
  app.get('/api/tours', async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      console.error("Error fetching tours:", error);
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.get('/api/tours/:id', async (req, res) => {
    try {
      const tour = await storage.getTour(req.params.id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      const stops = await storage.getTourStops(tour.id);
      const participants = await storage.getTourParticipants(tour.id);
      const reviews = await storage.getTourReviews(tour.id);
      
      res.json({ ...tour, stops, participants, reviews });
    } catch (error) {
      console.error("Error fetching tour:", error);
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });

  app.post('/api/tours', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tourData = insertTourSchema.parse({ ...req.body, createdById: userId });
      
      const tour = await storage.createTour(tourData);
      res.status(201).json(tour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tour data", errors: error.errors });
      }
      console.error("Error creating tour:", error);
      res.status(500).json({ message: "Failed to create tour" });
    }
  });

  app.get('/api/my-tours', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tours = await storage.getMyTours(userId);
      res.json(tours);
    } catch (error) {
      console.error("Error fetching user tours:", error);
      res.status(500).json({ message: "Failed to fetch user tours" });
    }
  });

  app.post('/api/tours/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tourId = req.params.id;
      
      await storage.joinTour(tourId, userId);
      res.status(200).json({ message: "Successfully joined tour" });
    } catch (error) {
      console.error("Error joining tour:", error);
      res.status(500).json({ message: "Failed to join tour" });
    }
  });

  app.post('/api/tours/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tourId = req.params.id;
      
      await storage.leaveTour(tourId, userId);
      res.status(200).json({ message: "Successfully left tour" });
    } catch (error) {
      console.error("Error leaving tour:", error);
      res.status(500).json({ message: "Failed to leave tour" });
    }
  });

  app.post('/api/tours/:id/close', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tourId = req.params.id;
      
      await storage.closeTour(tourId, userId);
      res.status(200).json({ message: "Successfully closed tour" });
    } catch (error) {
      console.error("Error closing tour:", error);
      res.status(500).json({ message: "Failed to close tour" });
    }
  });

  // Photo routes
  app.get('/api/photos', async (req, res) => {
    try {
      const photos = await storage.getPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.get('/api/users/:userId/photos', async (req, res) => {
    try {
      const photos = await storage.getUserPhotos(req.params.userId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching user photos:", error);
      res.status(500).json({ message: "Failed to fetch user photos" });
    }
  });

  app.post('/api/photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoData = insertPhotoSchema.parse({ ...req.body, userId });
      
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid photo data", errors: error.errors });
      }
      console.error("Error creating photo:", error);
      res.status(500).json({ message: "Failed to create photo" });
    }
  });

  app.post('/api/photos/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoId = req.params.id;
      
      await storage.likePhoto(photoId, userId);
      res.status(200).json({ message: "Photo liked successfully" });
    } catch (error) {
      console.error("Error liking photo:", error);
      res.status(500).json({ message: "Failed to like photo" });
    }
  });

  app.delete('/api/photos/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoId = req.params.id;
      
      await storage.unlikePhoto(photoId, userId);
      res.status(200).json({ message: "Photo unliked successfully" });
    } catch (error) {
      console.error("Error unliking photo:", error);
      res.status(500).json({ message: "Failed to unlike photo" });
    }
  });

  // Review routes
  app.post('/api/tours/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tourId = req.params.id;
      const reviewData = insertTourReviewSchema.parse({ ...req.body, tourId, userId });
      
      const review = await storage.createTourReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Stats route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
