import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "viewer" | "editor";

export interface SessionData {
  role?: Role;
}

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET environment variable must be set and at least 32 characters long"
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "scrumbox_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  }
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getRole(): Promise<Role | undefined> {
  const session = await getSession();
  return session.role;
}

/**
 * Ensures the current session satisfies the minimum required role.
 * - "viewer" requires viewer or editor.
 * - "editor" requires editor.
 * Redirects to the appropriate page when the requirement is not met.
 */
export async function requireRole(minimum: Role): Promise<Role> {
  const role = await getRole();

  if (!role) {
    redirect("/");
  }

  if (minimum === "editor" && role !== "editor") {
    redirect("/dashboard");
  }

  return role;
}
