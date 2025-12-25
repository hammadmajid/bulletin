"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

interface DeleteButtonProps {
  announcementId: number;
  type: "announcement" | "comment";
  commentId?: number;
}

export function DeleteButton({
  announcementId,
  type,
  commentId,
}: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  async function handleDelete() {
    setLoading(true);

    const url =
      type === "announcement"
        ? `/api/announcements/${announcementId}/delete`
        : `/api/announcements/${announcementId}/comments/${commentId}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (response.redirected) {
        addToast(
          type === "announcement"
            ? "Announcement deleted"
            : "Comment deleted",
          "success"
        );
        router.push(new URL(response.url).pathname);
        router.refresh();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        addToast(data.error || "Failed to delete", "error");
      } else {
        addToast(
          type === "announcement"
            ? "Announcement deleted"
            : "Comment deleted",
          "success"
        );
        if (type === "announcement") {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">Confirm?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
      title="Delete"
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
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}
