import { db } from "@/lib/db/client";
import { announcements, subscriptions, notifications } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check if user is logged in and is Faculty
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }
    if (session.role !== "Faculty") {
      return NextResponse.json(
        { error: "Only faculty can create announcements" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    await db.insert(announcements).values({
      title,
      content,
      faculty_id: session.user_id,
    });

    // Get the newly created announcement (workaround for Turso/libSQL)
    const [newAnnouncement] = await db
      .select({ announcement_id: announcements.announcement_id })
      .from(announcements)
      .where(
        and(
          eq(announcements.title, title),
          eq(announcements.faculty_id, session.user_id)
        )
      )
      .orderBy(desc(announcements.created_at))
      .limit(1);

    // Create notifications for all subscribed users
    const subscribedUsers = await db
      .select({ user_id: subscriptions.user_id })
      .from(subscriptions)
      .where(eq(subscriptions.notify_enabled, 1));

    if (subscribedUsers.length > 0 && newAnnouncement) {
      await db.insert(notifications).values(
        subscribedUsers.map((user) => ({
          user_id: user.user_id,
          announcement_id: newAnnouncement.announcement_id,
          is_read: 0,
        }))
      );
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
