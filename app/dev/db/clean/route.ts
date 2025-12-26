import { db } from "@/lib/db/client";
import { users, announcements, likes, comments, subscriptions } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is not available in production" },
      { status: 403 }
    );
  }

  try {
    // Delete in order to respect foreign key constraints
    // First delete tables that reference other tables
    await db.delete(likes);
    await db.delete(comments);
    await db.delete(subscriptions);

    // Then delete announcements (references users)
    await db.delete(announcements);

    // Finally delete users
    await db.delete(users);

    return NextResponse.json({
      message: "Database cleaned successfully",
      tables: ["likes", "comments", "subscriptions", "announcements", "users"],
    });
  } catch (error) {
    console.error("Error cleaning database:", error);
    return NextResponse.json(
      { error: "Failed to clean database", details: String(error) },
      { status: 500 }
    );
  }
}
