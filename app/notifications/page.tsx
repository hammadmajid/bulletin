import { db } from "@/lib/db/client";
import { announcements, users, notifications, subscriptions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { NotificationButton } from "@/components/notification-button";
import { NotificationsList } from "@/components/notifications-list";

async function getRecentAnnouncements() {
  return await db
    .select({
      id: announcements.announcement_id,
      title: announcements.title,
      createdAt: announcements.created_at,
      authorName: users.name,
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.faculty_id, users.user_id))
    .orderBy(desc(announcements.created_at))
    .limit(20);
}

async function getUserNotifications(userId: number) {
  return await db
    .select({
      notification_id: notifications.notification_id,
      announcement_id: notifications.announcement_id,
      is_read: notifications.is_read,
      created_at: notifications.created_at,
      title: announcements.title,
      authorName: users.name,
    })
    .from(notifications)
    .leftJoin(
      announcements,
      eq(notifications.announcement_id, announcements.announcement_id)
    )
    .leftJoin(users, eq(announcements.faculty_id, users.user_id))
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.created_at))
    .limit(50);
}

async function getSubscriptionStatus(userId: number) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.user_id, userId));

  return {
    isSubscribed: !!subscription && subscription.notify_enabled === 1,
    hasPushSubscription: false, // This will be determined client-side
  };
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function NotificationsPage() {
  const session = await getSession();
  const recentAnnouncements = await getRecentAnnouncements();

  // Get user-specific notifications if logged in
  let userNotifications: Awaited<ReturnType<typeof getUserNotifications>> = [];
  let unreadCount = 0;
  let subscriptionStatus = { isSubscribed: false, hasPushSubscription: false };

  if (session) {
    userNotifications = await getUserNotifications(session.user_id);
    unreadCount = userNotifications.filter((n) => n.is_read === 0).length;
    subscriptionStatus = await getSubscriptionStatus(session.user_id);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">Notifications</h1>
        <p className="mt-1 text-zinc-400">
          Stay updated with the latest announcements
        </p>
      </div>

      {/* Subscription Banner */}
      {session ? (
        <div className="mb-8 rounded-2xl border border-[#d946ef]/30 bg-[#d946ef]/10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[#d946ef]/20 p-3">
              <svg
                className="h-6 w-6 text-[#d946ef]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-50">
                Browser Notifications
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Get notified instantly when new announcements are posted.
              </p>
            </div>
            <NotificationButton
              isSubscribed={subscriptionStatus.isSubscribed}
              hasPushSubscription={subscriptionStatus.hasPushSubscription}
            />
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-zinc-700 bg-zinc-800/50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-zinc-700 p-3">
              <svg
                className="h-6 w-6 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-50">
                Enable Browser Notifications
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                <Link href="/login" className="text-[#d946ef] hover:underline">
                  Sign in
                </Link>{" "}
                to enable push notifications for new announcements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Notifications (if logged in and has notifications) */}
      {session && userNotifications.length > 0 && (
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900">
          <NotificationsList
            initialNotifications={userNotifications}
            initialUnreadCount={unreadCount}
          />
        </div>
      )}

      {/* Recent Announcements List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-lg font-semibold text-zinc-50">
            Recent Announcements
          </h2>
        </div>

        {recentAnnouncements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <svg
                className="h-8 w-8 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-50">
              No announcements yet
            </h3>
            <p className="mx-auto max-w-md text-zinc-400">
              When faculty members post new announcements, you&apos;ll see them
              here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentAnnouncements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/announcement/${announcement.id}`}
                className="flex items-start gap-4 p-4 transition-colors hover:bg-zinc-800/50"
              >
                <div className="rounded-full bg-zinc-800 p-2">
                  <svg
                    className="h-4 w-4 text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-50">
                    {announcement.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Posted by {announcement.authorName || "Faculty"}
                  </p>
                </div>
                <span className="text-sm text-zinc-500">
                  {formatDate(announcement.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
