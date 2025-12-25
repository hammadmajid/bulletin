import { db } from "@/lib/db/client";
import { announcements, users, likes, comments } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import Link from "next/link";

async function getAnnouncements() {
  const results = await db
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

  // Get likes and comments count for each announcement
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

export default async function Home() {
  const allAnnouncements = await getAnnouncements();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-50">
          University Bulletin Board
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Stay updated with the latest announcements from faculty. View, like, and
          comment on posts that matter to you.
        </p>
      </div>

      {/* Announcements Grid */}
      <div className="space-y-4">
        {allAnnouncements.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
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
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-50">
              No announcements yet
            </h3>
            <p className="mx-auto max-w-md text-zinc-400">
              The bulletin board is empty. Check back later for important
              announcements from faculty members.
            </p>
          </div>
        ) : (
          allAnnouncements.map((announcement) => (
            <Link
              key={announcement.id}
              href={`/announcement/${announcement.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
            >
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-xl font-semibold text-zinc-50">
                  {announcement.title}
                </h2>
                <span className="rounded-full bg-[#d946ef]/20 px-3 py-1 text-xs font-medium text-[#d946ef]">
                  New
                </span>
              </div>
              <p className="mb-4 line-clamp-2 text-zinc-400">
                {announcement.content}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-zinc-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {announcement.authorName || "Faculty"}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(announcement.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-zinc-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {announcement.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {announcement.commentsCount}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
