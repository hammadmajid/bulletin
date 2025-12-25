"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

interface LikeButtonProps {
  announcementId: number;
  likesCount: number;
  isLiked: boolean;
  isLoggedIn: boolean;
}

export function LikeButton({
  announcementId,
  likesCount,
  isLiked,
  isLoggedIn,
}: LikeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticCount, setOptimisticCount] = useState(likesCount);
  const router = useRouter();
  const { addToast } = useToast();

  async function handleLike() {
    if (!isLoggedIn) {
      addToast("Please log in to like announcements", "error");
      router.push("/login");
      return;
    }

    setLoading(true);

    // Optimistic update
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount((prev) => (optimisticLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(
        `/api/announcements/${announcementId}/like`,
        {
          method: "POST",
        }
      );

      if (!response.ok && !response.redirected) {
        // Revert optimistic update
        setOptimisticLiked(optimisticLiked);
        setOptimisticCount(likesCount);
        const data = await response.json();
        addToast(data.error || "Failed to update like", "error");
      } else {
        router.refresh();
      }
    } catch {
      // Revert optimistic update
      setOptimisticLiked(isLiked);
      setOptimisticCount(likesCount);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        optimisticLiked
          ? "border-[#d946ef] bg-[#d946ef]/10 text-[#d946ef]"
          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-[#d946ef] hover:text-[#d946ef]"
      }`}
    >
      <svg
        className="h-5 w-5"
        fill={optimisticLiked ? "currentColor" : "none"}
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
      {loading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        `Like (${optimisticCount})`
      )}
    </button>
  );
}
