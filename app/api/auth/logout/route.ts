import { destroySession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await destroySession();
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}

// Also support GET for simple logout links
export async function GET(request: Request) {
  try {
    await destroySession();
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
