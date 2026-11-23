import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  signAdminJwt,
  verifyAdminPassword,
} from "@/lib/admin-auth";

const LoginBodySchema = z.object({
  password: z.string().trim().min(1, "Password is required"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = LoginBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  const missingVars: string[] = [];
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    missingVars.push("ADMIN_PASSWORD");
  }
  if (!process.env.ADMIN_JWT_SECRET?.trim()) {
    missingVars.push("ADMIN_JWT_SECRET");
  }

  if (missingVars.length > 0) {
    console.error(
      "Admin authentication environment variables are missing:",
      missingVars.join(", ")
    );
    return NextResponse.json(
      {
        error: `Missing environment variables: ${missingVars.join(", ")}`,
      },
      { status: 500 }
    );
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  try {
    const token = await signAdminJwt();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Failed to sign admin JWT:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create session",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
