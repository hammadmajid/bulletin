"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingButton } from "@/components/loading-button";
import { useToast } from "@/components/toast";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      if (response.redirected) {
        addToast("Welcome back!", "success");
        router.push(new URL(response.url).pathname);
        router.refresh();
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        addToast(data.error || "Login failed", "error");
      }
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-zinc-400">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          disabled={loading}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="you@university.edu"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-zinc-400">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          disabled={loading}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      <LoadingButton
        type="submit"
        loading={loading}
        loadingText="Signing in..."
        className="w-full"
      >
        Sign In
      </LoadingButton>

      <div className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#d946ef] hover:underline">
          Register
        </Link>
      </div>
    </form>
  );
}
