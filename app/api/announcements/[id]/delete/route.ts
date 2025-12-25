import { db } from "@/lib/db/client";
import { announcements, comments, likes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcementId = parseInt(id);

    // Delete related comments first
    await db.delete(comments).where(eq(comments.announcement_id, announcementId));

    // Delete related likes
    await db.delete(likes).where(eq(likes.announcement_id, announcementId));

    // Delete announcement
    await db
      .delete(announcements)
      .where(eq(announcements.announcement_id, announcementId));

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
