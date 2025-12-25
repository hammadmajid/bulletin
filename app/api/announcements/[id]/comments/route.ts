import { db } from "@/lib/db/client";
import { comments } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
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
        { error: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const announcementId = parseInt(id);
    const formData = await request.formData();
    const content = formData.get("content") as string;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    await db.insert(comments).values({
      user_id: session.user_id,
      announcement_id: announcementId,
      content,
    });

    return NextResponse.redirect(
      new URL(`/announcement/${announcementId}`, request.url)
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
