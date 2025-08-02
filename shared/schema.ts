import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  startLocation: varchar("start_location").notNull(),
  endLocation: varchar("end_location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  difficulty: varchar("difficulty", { enum: ["easy", "moderate", "hard"] }).default("moderate"),
  distance: integer("distance"), // in miles
  imageUrl: varchar("image_url"),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  isClosed: boolean("is_closed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tourStops = pgTable("tour_stops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  location: varchar("location").notNull(),
  stopType: varchar("stop_type", { enum: ["fuel", "food", "scenic", "accommodation", "repair"] }).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tourParticipants = pgTable("tour_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
  status: varchar("status", { enum: ["joined", "left", "completed"] }).default("joined"),
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tourId: varchar("tour_id").references(() => tours.id, { onDelete: "set null" }),
  imageUrl: varchar("image_url").notNull(),
  caption: text("caption"),
  location: varchar("location"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photoLikes = pgTable("photo_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  photoId: varchar("photo_id").notNull().references(() => photos.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tourReviews = pgTable("tour_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => tours.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTours: many(tours),
  tourParticipants: many(tourParticipants),
  photos: many(photos),
  photoLikes: many(photoLikes),
  tourReviews: many(tourReviews),
}));

export const toursRelations = relations(tours, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tours.createdById],
    references: [users.id],
  }),
  stops: many(tourStops),
  participants: many(tourParticipants),
  photos: many(photos),
  reviews: many(tourReviews),
}));

export const tourStopsRelations = relations(tourStops, ({ one }) => ({
  tour: one(tours, {
    fields: [tourStops.tourId],
    references: [tours.id],
  }),
}));

export const tourParticipantsRelations = relations(tourParticipants, ({ one }) => ({
  tour: one(tours, {
    fields: [tourParticipants.tourId],
    references: [tours.id],
  }),
  user: one(users, {
    fields: [tourParticipants.userId],
    references: [users.id],
  }),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id],
  }),
  tour: one(tours, {
    fields: [photos.tourId],
    references: [tours.id],
  }),
  likes: many(photoLikes),
}));

export const photoLikesRelations = relations(photoLikes, ({ one }) => ({
  photo: one(photos, {
    fields: [photoLikes.photoId],
    references: [photos.id],
  }),
  user: one(users, {
    fields: [photoLikes.userId],
    references: [users.id],
  }),
}));

export const tourReviewsRelations = relations(tourReviews, ({ one }) => ({
  tour: one(tours, {
    fields: [tourReviews.tourId],
    references: [tours.id],
  }),
  user: one(users, {
    fields: [tourReviews.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export const insertTourStopSchema = createInsertSchema(tourStops).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
  likesCount: true,
});

export const insertTourReviewSchema = createInsertSchema(tourReviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type TourStop = typeof tourStops.$inferSelect;
export type InsertTourStop = z.infer<typeof insertTourStopSchema>;
export type TourParticipant = typeof tourParticipants.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type PhotoLike = typeof photoLikes.$inferSelect;
export type TourReview = typeof tourReviews.$inferSelect;
export type InsertTourReview = z.infer<typeof insertTourReviewSchema>;
