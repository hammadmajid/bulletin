import { db } from "@/lib/db/client";
import { announcements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
