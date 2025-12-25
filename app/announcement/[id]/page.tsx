import { db } from "@/lib/db/client";
import { announcements, users, likes, comments } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getAnnouncement(id: number) {
  const [announcement] = await db
    .select({
      id: announcements.announcement_id,
      title: announcements.title,
      content: announcements.content,
      createdAt: announcements.created_at,
      authorName: users.name,
      authorId: users.user_id,
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.faculty_id, users.user_id))
    .where(eq(announcements.announcement_id, id));

  if (!announcement) return null;

  const [likesResult] = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.announcement_id, id));

  const announcementComments = await db
    .select({
      id: comments.comment_id,
      content: comments.content,
      createdAt: comments.created_at,
      authorName: users.name,
    })
    .from(comments)
    .leftJoin(users, eq(comments.user_id, users.user_id))
    .where(eq(comments.announcement_id, id))
    .orderBy(desc(comments.created_at));

  return {
    ...announcement,
    likesCount: likesResult?.count ?? 0,
    comments: announcementComments,
  };
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "Unknown date";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncement(parseInt(id));

  if (!announcement) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back Link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-50"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to announcements
      </Link>

      {/* Announcement Card */}
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <header className="mb-6">
          <h1 className="mb-4 text-3xl font-bold text-zinc-50">
            {announcement.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
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
        </header>

        <div className="prose prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-zinc-300">
            {announcement.content}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-4 border-t border-zinc-800 pt-6">
          <form action={`/api/announcements/${announcement.id}/like`} method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-[#d946ef] hover:text-[#d946ef]"
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Like ({announcement.likesCount})
            </button>
          </form>
        </div>
      </article>

      {/* Comments Section */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-50">
          Comments ({announcement.comments.length})
        </h2>

        {/* Comment Form */}
        <form
          action={`/api/announcements/${announcement.id}/comments`}
          method="POST"
          className="mb-6"
        >
          <textarea
            name="content"
            rows={3}
            required
            className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef]"
            placeholder="Write a comment... (Login required)"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#d946ef] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c026d3]"
          >
            Post Comment
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {announcement.comments.length === 0 ? (
            <p className="text-center text-zinc-500">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            announcement.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
                  <span className="font-medium text-zinc-300">
                    {comment.authorName || "Anonymous"}
                  </span>
                  <span>•</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-zinc-300">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
