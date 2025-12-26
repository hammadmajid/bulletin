"use client";

import { useState } from "react";

interface NotificationButtonProps {
  isSubscribed: boolean;
  hasPushSubscription: boolean;
}

export function NotificationButton({
  isSubscribed,
  hasPushSubscription,
}: NotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enabled, setEnabled] = useState(isSubscribed && hasPushSubscription);

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      // Check if browser supports notifications
      if (!("Notification" in window)) {
        alert("This browser does not support notifications");
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Please allow notifications to receive updates");
        return;
      }

      // Check for service worker support
      if (!("serviceWorker" in navigator)) {
        alert("Service workers are not supported");
        return;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      }

      // Get push subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create a new subscription
        // Note: In production, you'd use VAPID keys from environment variables
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
              "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
          ),
        });
      }

      // Save subscription to backend
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pushSubscription: subscription.toJSON(),
        }),
      });

      if (response.ok) {
        setEnabled(true);
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      alert("Failed to enable notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Unsubscribe from push
          await subscription.unsubscribe();

          // Remove from backend
          await fetch("/api/subscriptions", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          });
        }
      }

      setEnabled(false);
    } catch (error) {
      console.error("Error disabling notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={enabled ? handleDisableNotifications : handleEnableNotifications}
      disabled={isLoading}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        enabled
          ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
          : "bg-[#d946ef] text-white hover:bg-[#c026d3]"
      }`}
    >
      {isLoading ? "..." : enabled ? "Disable" : "Enable"}
    </button>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
