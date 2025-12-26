import { db } from "@/lib/db/client";
import { notifications, announcements, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET - Get user's notifications
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const userNotifications = await db
      .select({
        notification_id: notifications.notification_id,
        announcement_id: notifications.announcement_id,
        is_read: notifications.is_read,
        created_at: notifications.created_at,
        title: announcements.title,
        authorName: users.name,
      })
      .from(notifications)
      .leftJoin(
        announcements,
        eq(notifications.announcement_id, announcements.announcement_id)
      )
      .leftJoin(users, eq(announcements.faculty_id, users.user_id))
      .where(eq(notifications.user_id, session.user_id))
      .orderBy(desc(notifications.created_at))
      .limit(50);

    const unreadCount = userNotifications.filter((n) => n.is_read === 0).length;

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    return NextResponse.json(
      { error: "Failed to get notifications" },
      { status: 500 }
    );
  }
}
