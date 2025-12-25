import { db } from "@/lib/db/client";
import { comments } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcementId = parseInt(id);
    const formData = await request.formData();
    const content = formData.get("content") as string;

    // In a real app, get user_id from session
    // For demo, we'll use 1 as placeholder
    const userId = 1;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    await db.insert(comments).values({
      user_id: userId,
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
