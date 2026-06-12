import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession, type Role } from "@/lib/session";

const viewerHash = process.env.VIEWER_PASSWORD_HASH;
const editorHash = process.env.EDITOR_PASSWORD_HASH;

export async function POST(request: Request) {
  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  if (!viewerHash || !editorHash) {
    return NextResponse.json(
      { error: "Server is not configured for authentication" },
      { status: 500 }
    );
  }

  // Compare against both hashes; editor takes precedence if both matched.
  const [isEditor, isViewer] = await Promise.all([
    bcrypt.compare(password, editorHash),
    bcrypt.compare(password, viewerHash)
  ]);

  let role: Role | null = null;
  if (isEditor) role = "editor";
  else if (isViewer) role = "viewer";

  if (!role) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const session = await getSession();
  session.role = role;
  await session.save();

  return NextResponse.json({ role });
}
