import Link from "next/link";

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

        <form action="/api/announcements" method="POST" className="space-y-6">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm text-zinc-400">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef]"
              placeholder="Announcement title"
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-2 block text-sm text-zinc-400">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef]"
              placeholder="Write your announcement content here..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[#d946ef] px-6 py-3 font-medium text-white transition-colors hover:bg-[#c026d3]"
            >
              Publish Announcement
            </button>
            <Link
              href="/dashboard"
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
