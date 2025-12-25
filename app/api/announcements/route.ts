import { db } from "@/lib/db/client";
import { announcements } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
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

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
