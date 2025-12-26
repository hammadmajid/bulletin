"use client";

import { useState } from "react";

interface MarkAsReadButtonProps {
  notificationId: number;
  onMarkedAsRead?: () => void;
}

export function MarkAsReadButton({
  notificationId,
  onMarkedAsRead,
}: MarkAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "POST",
      });

      if (response.ok && onMarkedAsRead) {
        onMarkedAsRead();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isLoading}
      className="rounded-lg bg-zinc-700 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-600 disabled:opacity-50"
    >
      {isLoading ? "..." : "Mark read"}
    </button>
  );
}

interface MarkAllAsReadButtonProps {
  onMarkedAllAsRead?: () => void;
}

export function MarkAllAsReadButton({
  onMarkedAllAsRead,
}: MarkAllAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (response.ok && onMarkedAllAsRead) {
        onMarkedAllAsRead();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkAllAsRead}
      disabled={isLoading}
      className="text-sm text-[#d946ef] transition-colors hover:text-[#c026d3] disabled:opacity-50"
    >
      {isLoading ? "..." : "Mark all as read"}
    </button>
  );
}
