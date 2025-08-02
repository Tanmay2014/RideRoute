import { db } from "./db";
import { users, tours, notifications } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import type { InsertNotification } from "@shared/schema";

export class NotificationService {
  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Send notifications to users near a new tour
  async notifyNearbyUsers(tourId: string): Promise<void> {
    try {
      // Get the new tour details
      const [tour] = await db
        .select()
        .from(tours)
        .where(eq(tours.id, tourId));

      if (!tour || !tour.startLatitude || !tour.startLongitude) {
        console.log("Tour not found or missing coordinates");
        return;
      }

      const tourLat = parseFloat(tour.startLatitude);
      const tourLon = parseFloat(tour.startLongitude);

      // Get all users with notifications enabled and location set
      const usersWithLocation = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.notificationsEnabled, true),
            sql`${users.latitude} IS NOT NULL`,
            sql`${users.longitude} IS NOT NULL`
          )
        );

      const notificationsToCreate: InsertNotification[] = [];

      for (const user of usersWithLocation) {
        // Skip the tour creator
        if (user.id === tour.createdById) continue;

        const userLat = parseFloat(user.latitude!);
        const userLon = parseFloat(user.longitude!);
        const userRadius = user.notificationRadius || 50;

        const distance = this.calculateDistance(tourLat, tourLon, userLat, userLon);

        // If the tour is within the user's notification radius
        if (distance <= userRadius) {
          notificationsToCreate.push({
            userId: user.id,
            tourId: tour.id,
            type: "nearby_tour",
            title: "New Ride Near You!",
            message: `"${tour.title}" starts ${Math.round(distance)}km from your location on ${tour.startDate.toLocaleDateString()}`,
            distance: distance.toString(),
          });
        }
      }

      // Bulk create notifications
      if (notificationsToCreate.length > 0) {
        await db.insert(notifications).values(notificationsToCreate);
        console.log(`Created ${notificationsToCreate.length} nearby tour notifications for tour: ${tour.title}`);
      }
    } catch (error) {
      console.error("Error sending nearby tour notifications:", error);
    }
  }

  // Get user's notifications
  async getUserNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const userNotifications = await db
        .select({
          id: notifications.id,
          type: notifications.type,
          title: notifications.title,
          message: notifications.message,
          isRead: notifications.isRead,
          distance: notifications.distance,
          createdAt: notifications.createdAt,
          tour: {
            id: tours.id,
            title: tours.title,
            startLocation: tours.startLocation,
            startDate: tours.startDate,
            imageUrl: tours.imageUrl,
          },
        })
        .from(notifications)
        .leftJoin(tours, eq(notifications.tourId, tours.id))
        .where(eq(notifications.userId, userId))
        .orderBy(sql`${notifications.createdAt} DESC`)
        .limit(limit);

      return userNotifications;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
          )
        );

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );

      return result?.count || 0;
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }
  }

  // Update user location and notification preferences
  async updateUserLocationSettings(
    userId: string, 
    latitude?: number, 
    longitude?: number, 
    location?: string,
    notificationRadius?: number,
    notificationsEnabled?: boolean
  ): Promise<boolean> {
    try {
      const updates: any = {};
      
      if (latitude !== undefined) updates.latitude = latitude.toString();
      if (longitude !== undefined) updates.longitude = longitude.toString();
      if (location !== undefined) updates.location = location;
      if (notificationRadius !== undefined) updates.notificationRadius = notificationRadius;
      if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled;

      await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error("Error updating user location settings:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();