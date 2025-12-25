import { db } from "@/lib/db/client";
import { announcements } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: "Only faculty can edit announcements" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const announcementId = parseInt(id);
    const formData = await request.formData();
    const method = formData.get("_method");

    if (method === "PUT") {
      // Update announcement
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;

      if (!title || !content) {
        return NextResponse.json(
          { error: "Title and content are required" },
          { status: 400 }
        );
      }

      await db
        .update(announcements)
        .set({ title, content })
        .where(eq(announcements.announcement_id, announcementId));

      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}
