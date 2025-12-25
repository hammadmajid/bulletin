"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/loading-button";
import { useToast } from "@/components/toast";

interface CommentFormProps {
  announcementId: number;
  isLoggedIn: boolean;
}

export function CommentForm({ announcementId, isLoggedIn }: CommentFormProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const router = useRouter();
  const { addToast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isLoggedIn) {
      addToast("Please log in to comment", "error");
      router.push("/login");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("content", content);

    try {
      const response = await fetch(
        `/api/announcements/${announcementId}/comments`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.redirected) {
        addToast("Comment posted!", "success");
        setContent("");
        router.refresh();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        addToast(data.error || "Failed to post comment", "error");
      } else {
        addToast("Comment posted!", "success");
        setContent("");
        router.refresh();
      }
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        name="content"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        disabled={loading}
        className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef] disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={
          isLoggedIn ? "Write a comment..." : "Please log in to comment"
        }
      />
      <LoadingButton
        type="submit"
        loading={loading}
        loadingText="Posting..."
        className="px-4 py-2 text-sm"
      >
        Post Comment
      </LoadingButton>
    </form>
  );
}
