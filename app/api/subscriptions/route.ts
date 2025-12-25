import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check if user is logged in
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to manage subscriptions" },
        { status: 401 }
      );
    }

    const userId = session.user_id;

    // Check if subscription exists
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, userId));

    if (existingSub) {
      // Toggle notification status
      const newStatus = existingSub.notify_enabled === 1 ? 0 : 1;
      await db
        .update(subscriptions)
        .set({ notify_enabled: newStatus })
        .where(eq(subscriptions.subscription_id, existingSub.subscription_id));
    } else {
      // Create new subscription with notifications enabled
      await db.insert(subscriptions).values({
        user_id: userId,
        notify_enabled: 1,
      });
    }

    return NextResponse.redirect(new URL("/notifications", request.url));
  } catch (error) {
    console.error("Error toggling subscription:", error);
    return NextResponse.json(
      { error: "Failed to toggle subscription" },
      { status: 500 }
    );
  }
}

// GET - Check subscription status
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, session.user_id));

    return NextResponse.json({
      subscribed: !!subscription,
      notificationsEnabled: subscription?.notify_enabled === 1,
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
