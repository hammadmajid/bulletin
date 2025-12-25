import Link from "next/link";
import { AnnouncementForm } from "@/components/forms/announcement-form";

export default function NewAnnouncementPage() {
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
          Create New Announcement
        </h1>

        <AnnouncementForm mode="create" />
      </div>
    </div>
  );
}
