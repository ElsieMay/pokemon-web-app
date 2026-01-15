"use server";

import { cookies } from "next/headers";
import { env } from "./env";

const SESSION_ID = "pokemon_user_id";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year max

/**
 * Get or create a user session ID from cookies
 */
export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_ID)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set(SESSION_ID, sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });
  }

  return sessionId;
}
