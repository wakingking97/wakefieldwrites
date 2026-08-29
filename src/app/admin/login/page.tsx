import type { Metadata } from "next";
import { login } from "./actions";

export const metadata: Metadata = { title: "Sign In" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Admin</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Sign In</h1>

        <form action={login} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="mt-2 w-full rounded-md border border-line bg-surface px-4 py-2.5 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-line bg-surface px-4 py-2.5 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              Invalid email or password.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
