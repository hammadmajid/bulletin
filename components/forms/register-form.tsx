"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingButton } from "@/components/loading-button";
import { useToast } from "@/components/toast";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      if (response.redirected) {
        addToast("Account created successfully! Please log in.", "success");
        router.push(new URL(response.url).pathname);
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        addToast(data.error || "Registration failed", "error");
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
        <label htmlFor="name" className="mb-2 block text-sm text-zinc-400">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          disabled={loading}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="John Doe"
        />
      </div>

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
        <label htmlFor="role" className="mb-2 block text-sm text-zinc-400">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          disabled={loading}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
        </select>
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
        loadingText="Creating account..."
        className="w-full"
      >
        Create Account
      </LoadingButton>

      <div className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="text-[#d946ef] hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
