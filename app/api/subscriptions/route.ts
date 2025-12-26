import { db } from "@/lib/db/client";
import { subscriptions, pushSubscriptions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// POST - Toggle subscription or save push subscription
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
    const contentType = request.headers.get("content-type");

    // Handle JSON body for push subscription
    if (contentType?.includes("application/json")) {
      const body = await request.json();

      // Save push subscription
      if (body.pushSubscription) {
        const { endpoint, keys } = body.pushSubscription;

        // Check if this push subscription already exists
        const [existingPush] = await db
          .select()
          .from(pushSubscriptions)
          .where(
            and(
              eq(pushSubscriptions.user_id, userId),
              eq(pushSubscriptions.endpoint, endpoint)
            )
          );

        if (!existingPush) {
          await db.insert(pushSubscriptions).values({
            user_id: userId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth,
          });
        }

        // Also ensure user has a subscription record
        const [existingSub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.user_id, userId));

        if (!existingSub) {
          await db.insert(subscriptions).values({
            user_id: userId,
            notify_enabled: 1,
          });
        } else if (existingSub.notify_enabled === 0) {
          await db
            .update(subscriptions)
            .set({ notify_enabled: 1 })
            .where(eq(subscriptions.subscription_id, existingSub.subscription_id));
        }

        return NextResponse.json({ success: true });
      }
    }

    // Toggle notification status (form submission)
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

      // If disabling, remove push subscriptions
      if (newStatus === 0) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.user_id, userId));
      }
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

// DELETE - Remove push subscription
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint } = body;

    if (endpoint) {
      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.user_id, session.user_id),
            eq(pushSubscriptions.endpoint, endpoint)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return NextResponse.json(
      { error: "Failed to remove push subscription" },
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

    const pushSubs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.user_id, session.user_id));

    return NextResponse.json({
      subscribed: !!subscription,
      notificationsEnabled: subscription?.notify_enabled === 1,
      hasPushSubscription: pushSubs.length > 0,
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
