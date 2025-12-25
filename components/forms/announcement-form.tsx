"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingButton } from "@/components/loading-button";
import { useToast } from "@/components/toast";

interface AnnouncementFormProps {
  mode: "create" | "edit";
  announcementId?: number;
  initialTitle?: string;
  initialContent?: string;
}

export function AnnouncementForm({
  mode,
  announcementId,
  initialTitle = "",
  initialContent = "",
}: AnnouncementFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const router = useRouter();
  const { addToast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    const url =
      mode === "create"
        ? "/api/announcements"
        : `/api/announcements/${announcementId}`;

    try {
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        body: formData,
      });

      if (response.redirected) {
        addToast(
          mode === "create"
            ? "Announcement published successfully!"
            : "Announcement updated successfully!",
          "success"
        );
        router.push(new URL(response.url).pathname);
        router.refresh();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        addToast(data.error || "Something went wrong", "error");
      } else {
        addToast(
          mode === "create"
            ? "Announcement published successfully!"
            : "Announcement updated successfully!",
          "success"
        );
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="mb-2 block text-sm text-zinc-400">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef] disabled:cursor-not-allowed disabled:opacity-50"
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Write your announcement content here..."
        />
      </div>

      <div className="flex gap-3">
        <LoadingButton
          type="submit"
          loading={loading}
          loadingText={mode === "create" ? "Publishing..." : "Updating..."}
          className="px-6"
        >
          {mode === "create" ? "Publish Announcement" : "Update Announcement"}
        </LoadingButton>
        <Link
          href="/dashboard"
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
