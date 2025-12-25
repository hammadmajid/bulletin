import { db } from "@/lib/db/client";
import { likes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to like announcements" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const announcementId = parseInt(id);
    const userId = session.user_id;

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.user_id, userId),
          eq(likes.announcement_id, announcementId)
        )
      );

    if (existingLike) {
      // Unlike
      await db
        .delete(likes)
        .where(eq(likes.like_id, existingLike.like_id));
    } else {
      // Like
      await db.insert(likes).values({
        user_id: userId,
        announcement_id: announcementId,
      });
    }

    return NextResponse.redirect(
      new URL(`/announcement/${announcementId}`, request.url)
    );
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
