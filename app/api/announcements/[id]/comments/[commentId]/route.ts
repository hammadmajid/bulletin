import { db } from "@/lib/db/client";
import { comments } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to delete comments" },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;
    const announcementId = parseInt(id);
    const commentIdNum = parseInt(commentId);

    // Get the comment to check ownership
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.comment_id, commentIdNum));

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Only allow deletion if user owns the comment or is Faculty
    if (comment.user_id !== session.user_id && session.role !== "Faculty") {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete the comment
    await db
      .delete(comments)
      .where(
        and(
          eq(comments.comment_id, commentIdNum),
          eq(comments.announcement_id, announcementId)
        )
      );

    return NextResponse.redirect(
      new URL(`/announcement/${announcementId}`, request.url)
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
