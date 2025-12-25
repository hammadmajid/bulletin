import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SESSION_COOKIE_NAME = "session";
const SALT_ROUNDS = 10;

export type SessionUser = {
  user_id: number;
  name: string;
  email: string;
  role: "Student" | "Faculty";
};

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a session for a user (sets cookie)
 * Using a simple base64 encoded JSON for MVP - in production use JWT or encrypted sessions
 */
export async function createSession(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = Buffer.from(JSON.stringify(user)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

/**
 * Get the current session user from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = Buffer.from(sessionCookie.value, "base64").toString(
      "utf-8"
    );
    return JSON.parse(sessionData) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Destroy the current session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current user from database (refreshes session data)
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Optionally verify user still exists in database
  const [user] = await db
    .select({
      user_id: users.user_id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.user_id, session.user_id));

  if (!user) {
    // User no longer exists, destroy session
    await destroySession();
    return null;
  }

  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Check if user is faculty
 */
export async function isFaculty(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "Faculty";
}
