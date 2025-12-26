"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkAsReadButton, MarkAllAsReadButton } from "./mark-read-button";

interface Notification {
  notification_id: number;
  announcement_id: number;
  is_read: number | null;
  created_at: number | null;
  title: string | null;
  authorName: string | null;
}

interface NotificationsListProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "Unknown";
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationsList({
  initialNotifications,
  initialUnreadCount,
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const handleMarkAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notificationId ? { ...n, is_read: 1 } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  };

  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
          <svg
            className="h-8 w-8 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-zinc-50">
          No notifications yet
        </h3>
        <p className="mx-auto max-w-md text-zinc-400">
          When faculty members post new announcements, you&apos;ll see them
          here. Enable notifications to get instant alerts!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <h2 className="text-lg font-semibold text-zinc-50">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-[#d946ef] px-2 py-0.5 text-xs text-white">
              {unreadCount} new
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <MarkAllAsReadButton onMarkedAllAsRead={handleMarkAllAsRead} />
        )}
      </div>

      <div className="divide-y divide-zinc-800">
        {notifications.map((notification) => (
          <Link
            key={notification.notification_id}
            href={`/announcement/${notification.announcement_id}`}
            className={`flex items-start gap-4 p-4 transition-colors hover:bg-zinc-800/50 ${
              notification.is_read === 0 ? "bg-[#d946ef]/5" : ""
            }`}
          >
            <div
              className={`rounded-full p-2 ${
                notification.is_read === 0
                  ? "bg-[#d946ef]/20"
                  : "bg-zinc-800"
              }`}
            >
              <svg
                className={`h-4 w-4 ${
                  notification.is_read === 0
                    ? "text-[#d946ef]"
                    : "text-zinc-500"
                }`}
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
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={`font-medium ${
                      notification.is_read === 0
                        ? "text-zinc-50"
                        : "text-zinc-400"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Posted by {notification.authorName || "Faculty"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-zinc-500">
                    {formatDate(notification.created_at)}
                  </span>
                  {notification.is_read === 0 && (
                    <MarkAsReadButton
                      notificationId={notification.notification_id}
                      onMarkedAsRead={() =>
                        handleMarkAsRead(notification.notification_id)
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
