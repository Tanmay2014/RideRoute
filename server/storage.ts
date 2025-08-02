import {
  users,
  tours,
  tourStops,
  tourParticipants,
  photos,
  photoLikes,
  tourReviews,
  type User,
  type UpsertUser,
  type Tour,
  type InsertTour,
  type TourStop,
  type InsertTourStop,
  type TourParticipant,
  type Photo,
  type InsertPhoto,
  type PhotoLike,
  type TourReview,
  type InsertTourReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tour operations
  createTour(tour: InsertTour & { stops: Omit<InsertTourStop, "tourId">[] }): Promise<Tour>;
  getTour(id: string): Promise<Tour | undefined>;
  getTours(limit?: number): Promise<Tour[]>;
  getMyTours(userId: string): Promise<Tour[]>;
  joinTour(tourId: string, userId: string): Promise<void>;
  leaveTour(tourId: string, userId: string): Promise<void>;
  closeTour(tourId: string, userId: string): Promise<void>;
  getTourParticipants(tourId: string): Promise<(TourParticipant & { user: User })[]>;
  getTourStops(tourId: string): Promise<TourStop[]>;
  
  // Photo operations
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  getPhotos(limit?: number): Promise<(Photo & { user: User; likesCount: number })[]>;
  getUserPhotos(userId: string): Promise<(Photo & { user: User; likesCount: number })[]>;
  likePhoto(photoId: string, userId: string): Promise<void>;
  unlikePhoto(photoId: string, userId: string): Promise<void>;
  
  // Review operations
  createTourReview(review: InsertTourReview): Promise<TourReview>;
  getTourReviews(tourId: string): Promise<(TourReview & { user: User })[]>;
  
  // Stats
  getStats(): Promise<{ activeTours: number; totalRiders: number; completedTours: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tour operations
  async createTour(tourData: InsertTour & { stops: Omit<InsertTourStop, "tourId">[] }): Promise<Tour> {
    const { stops, ...tour } = tourData;
    
    const [createdTour] = await db.insert(tours).values(tour).returning();
    
    if (stops.length > 0) {
      const tourStopsData = stops.map((stop, index) => ({
        ...stop,
        tourId: createdTour.id,
        order: index + 1,
      }));
      await db.insert(tourStops).values(tourStopsData);
    }
    
    return createdTour;
  }

  async getTour(id: string): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }

  async getTours(limit = 20): Promise<Tour[]> {
    return await db
      .select()
      .from(tours)
      .where(and(eq(tours.isActive, true), eq(tours.isClosed, false)))
      .orderBy(desc(tours.createdAt))
      .limit(limit);
  }

  async getMyTours(userId: string): Promise<Tour[]> {
    return await db
      .select()
      .from(tours)
      .where(eq(tours.createdById, userId))
      .orderBy(desc(tours.createdAt));
  }

  async joinTour(tourId: string, userId: string): Promise<void> {
    await db.insert(tourParticipants).values({
      tourId,
      userId,
      status: "joined",
    });
  }

  async leaveTour(tourId: string, userId: string): Promise<void> {
    await db
      .update(tourParticipants)
      .set({ status: "left" })
      .where(and(eq(tourParticipants.tourId, tourId), eq(tourParticipants.userId, userId)));
  }

  async closeTour(tourId: string, userId: string): Promise<void> {
    await db
      .update(tours)
      .set({ isClosed: true })
      .where(and(eq(tours.id, tourId), eq(tours.createdById, userId)));
  }

  async getTourParticipants(tourId: string): Promise<(TourParticipant & { user: User })[]> {
    return await db
      .select({
        id: tourParticipants.id,
        tourId: tourParticipants.tourId,
        userId: tourParticipants.userId,
        joinedAt: tourParticipants.joinedAt,
        status: tourParticipants.status,
        user: users,
      })
      .from(tourParticipants)
      .innerJoin(users, eq(tourParticipants.userId, users.id))
      .where(and(eq(tourParticipants.tourId, tourId), eq(tourParticipants.status, "joined")));
  }

  async getTourStops(tourId: string): Promise<TourStop[]> {
    return await db
      .select()
      .from(tourStops)
      .where(eq(tourStops.tourId, tourId))
      .orderBy(tourStops.order);
  }

  // Photo operations
  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [createdPhoto] = await db.insert(photos).values(photo).returning();
    return createdPhoto;
  }

  async getPhotos(limit = 20): Promise<(Photo & { user: User; likesCount: number })[]> {
    return await db
      .select({
        id: photos.id,
        userId: photos.userId,
        tourId: photos.tourId,
        imageUrl: photos.imageUrl,
        caption: photos.caption,
        location: photos.location,
        likesCount: photos.likesCount,
        createdAt: photos.createdAt,
        user: users,
      })
      .from(photos)
      .innerJoin(users, eq(photos.userId, users.id))
      .orderBy(desc(photos.createdAt))
      .limit(limit);
  }

  async getUserPhotos(userId: string): Promise<(Photo & { user: User; likesCount: number })[]> {
    return await db
      .select({
        id: photos.id,
        userId: photos.userId,
        tourId: photos.tourId,
        imageUrl: photos.imageUrl,
        caption: photos.caption,
        location: photos.location,
        likesCount: photos.likesCount,
        createdAt: photos.createdAt,
        user: users,
      })
      .from(photos)
      .innerJoin(users, eq(photos.userId, users.id))
      .where(eq(photos.userId, userId))
      .orderBy(desc(photos.createdAt));
  }

  async likePhoto(photoId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(photoLikes).values({ photoId, userId });
      await tx
        .update(photos)
        .set({ likesCount: sql`${photos.likesCount} + 1` })
        .where(eq(photos.id, photoId));
    });
  }

  async unlikePhoto(photoId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(photoLikes)
        .where(and(eq(photoLikes.photoId, photoId), eq(photoLikes.userId, userId)));
      await tx
        .update(photos)
        .set({ likesCount: sql`${photos.likesCount} - 1` })
        .where(eq(photos.id, photoId));
    });
  }

  // Review operations
  async createTourReview(review: InsertTourReview): Promise<TourReview> {
    const [createdReview] = await db.insert(tourReviews).values(review).returning();
    return createdReview;
  }

  async getTourReviews(tourId: string): Promise<(TourReview & { user: User })[]> {
    return await db
      .select({
        id: tourReviews.id,
        tourId: tourReviews.tourId,
        userId: tourReviews.userId,
        rating: tourReviews.rating,
        comment: tourReviews.comment,
        createdAt: tourReviews.createdAt,
        user: users,
      })
      .from(tourReviews)
      .innerJoin(users, eq(tourReviews.userId, users.id))
      .where(eq(tourReviews.tourId, tourId))
      .orderBy(desc(tourReviews.createdAt));
  }

  // Stats
  async getStats(): Promise<{ activeTours: number; totalRiders: number; completedTours: number }> {
    const [activeTours] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tours)
      .where(and(eq(tours.isActive, true), eq(tours.isClosed, false)));

    const [totalRiders] = await db
      .select({ count: sql<number>`count(distinct ${tourParticipants.userId})` })
      .from(tourParticipants)
      .where(eq(tourParticipants.status, "joined"));

    const [completedTours] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tours)
      .where(eq(tours.isClosed, true));

    return {
      activeTours: activeTours.count || 0,
      totalRiders: totalRiders.count || 0,
      completedTours: completedTours.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
