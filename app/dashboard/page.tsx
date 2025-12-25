import { db } from "@/lib/db/client";
import { announcements, users, likes, comments } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import Link from "next/link";

// In a real app, you'd get this from the session
// For now, this is just a placeholder dashboard
async function getFacultyAnnouncements(facultyId: number) {
  const results = await db
    .select({
      id: announcements.announcement_id,
      title: announcements.title,
      content: announcements.content,
      createdAt: announcements.created_at,
    })
    .from(announcements)
    .where(eq(announcements.faculty_id, facultyId))
    .orderBy(desc(announcements.created_at));

  const announcementsWithCounts = await Promise.all(
    results.map(async (a) => {
      const [likesResult] = await db
        .select({ count: count() })
        .from(likes)
        .where(eq(likes.announcement_id, a.id));
      const [commentsResult] = await db
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.announcement_id, a.id));
      return {
        ...a,
        likesCount: likesResult?.count ?? 0,
        commentsCount: commentsResult?.count ?? 0,
      };
    })
  );

  return announcementsWithCounts;
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "Unknown date";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  // Placeholder: In real app, get faculty ID from session
  // For demo, we'll show all announcements or empty state
  const allAnnouncements = await db
    .select({
      id: announcements.announcement_id,
      title: announcements.title,
      content: announcements.content,
      createdAt: announcements.created_at,
      authorName: users.name,
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.faculty_id, users.user_id))
    .orderBy(desc(announcements.created_at));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50">Faculty Dashboard</h1>
          <p className="mt-1 text-zinc-400">
            Manage your announcements
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 rounded-xl bg-[#d946ef] px-4 py-2 font-medium text-white transition-colors hover:bg-[#c026d3]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Announcement
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-3xl font-bold text-[#d946ef]">
            {allAnnouncements.length}
          </div>
          <div className="text-sm text-zinc-400">Total Announcements</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-3xl font-bold text-[#d946ef]">0</div>
          <div className="text-sm text-zinc-400">Total Likes</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-3xl font-bold text-[#d946ef]">0</div>
          <div className="text-sm text-zinc-400">Total Comments</div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-lg font-semibold text-zinc-50">Your Announcements</h2>
        </div>

        {allAnnouncements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d946ef]/10">
              <svg
                className="h-8 w-8 text-[#d946ef]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-50">
              No announcements yet
            </h3>
            <p className="mx-auto mb-6 max-w-md text-zinc-400">
              You haven&apos;t created any announcements. Start sharing
              important updates with your students!
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#d946ef] px-4 py-2 font-medium text-white transition-colors hover:bg-[#c026d3]"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Your First Announcement
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {allAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex-1">
                  <Link
                    href={`/announcement/${announcement.id}`}
                    className="font-medium text-zinc-50 hover:text-[#d946ef]"
                  >
                    {announcement.title}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(announcement.createdAt)} • by {announcement.authorName || "Faculty"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/edit/${announcement.id}`}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-50"
                  >
                    Edit
                  </Link>
                  <form action={`/api/announcements/${announcement.id}/delete`} method="POST">
                    <button
                      type="submit"
                      className="rounded-lg border border-red-900 bg-red-950 px-3 py-1.5 text-sm text-red-400 hover:border-red-800 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
