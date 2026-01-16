"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "pokemon_user_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get or create a user session ID from cookies
 */
export async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    if (!sessionId) {
      throw new Error("Failed to generate session ID");
    }

    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  }

  return sessionId;
}
