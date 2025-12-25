import { db } from "@/lib/db/client";
import { announcements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnnouncementForm } from "@/components/forms/announcement-form";

async function getAnnouncement(id: number) {
  const [announcement] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.announcement_id, id));
  return announcement;
}

export default async function EditAnnouncementPage({
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
        href="/dashboard"
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
        Back to dashboard
      </Link>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-50">
          Edit Announcement
        </h1>

        <AnnouncementForm
          mode="edit"
          announcementId={announcement.announcement_id}
          initialTitle={announcement.title}
          initialContent={announcement.content}
        />
      </div>
    </div>
  );
}
