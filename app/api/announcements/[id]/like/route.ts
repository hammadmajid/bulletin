import { db } from "@/lib/db/client";
import { likes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcementId = parseInt(id);

    // In a real app, get user_id from session
    // For demo, we'll use 1 as placeholder
    const userId = 1;

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
