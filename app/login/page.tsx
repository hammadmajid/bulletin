import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-zinc-50">Welcome back</h1>
          <p className="text-zinc-400">Sign in to your account</p>
        </div>

        <form action="/api/auth/login" method="POST" className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-zinc-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef]"
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:border-[#d946ef] focus:outline-none focus:ring-1 focus:ring-[#d946ef]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#d946ef] px-4 py-3 font-medium text-white transition-colors hover:bg-[#c026d3]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#d946ef] hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
