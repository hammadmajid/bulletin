import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    user_id: integer("user_id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: text("role", { enum: ["Student", "Faculty"] }).notNull(),
    password: text("password").notNull(),
});

export const announcements = sqliteTable("announcements", {
    announcement_id: integer("announcement_id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    created_at: integer("created_at").default(sql`(unixepoch())`),
    faculty_id: integer("faculty_id")
        .notNull()
        .references(() => users.user_id),
});

export const likes = sqliteTable(
    "likes",
    {
        like_id: integer("like_id").primaryKey({ autoIncrement: true }),
        user_id: integer("user_id")
            .notNull()
            .references(() => users.user_id),
        announcement_id: integer("announcement_id")
            .notNull()
            .references(() => announcements.announcement_id),
    }
);

export const comments = sqliteTable("comments", {
    comment_id: integer("comment_id").primaryKey({ autoIncrement: true }),
    user_id: integer("user_id")
        .notNull()
        .references(() => users.user_id),
    announcement_id: integer("announcement_id")
        .notNull()
        .references(() => announcements.announcement_id),
    content: text("content").notNull(),
    created_at: integer("created_at").default(sql`(unixepoch())`),
});

export const subscriptions = sqliteTable("subscriptions", {
    subscription_id: integer("subscription_id").primaryKey({ autoIncrement: true }),
    user_id: integer("user_id")
        .notNull()
        .references(() => users.user_id),
    notify_enabled: integer("notify_enabled").default(1),
});

// Store browser push subscription data
export const pushSubscriptions = sqliteTable("push_subscriptions", {
    push_subscription_id: integer("push_subscription_id").primaryKey({ autoIncrement: true }),
    user_id: integer("user_id")
        .notNull()
        .references(() => users.user_id),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    created_at: integer("created_at").default(sql`(unixepoch())`),
});

// Track notification read status per user
export const notifications = sqliteTable("notifications", {
    notification_id: integer("notification_id").primaryKey({ autoIncrement: true }),
    user_id: integer("user_id")
        .notNull()
        .references(() => users.user_id),
    announcement_id: integer("announcement_id")
        .notNull()
        .references(() => announcements.announcement_id),
    is_read: integer("is_read").default(0),
    created_at: integer("created_at").default(sql`(unixepoch())`),
});