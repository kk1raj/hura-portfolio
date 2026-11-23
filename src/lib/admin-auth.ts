import "server-only";
import { createHash, timingSafeEqual } from "crypto";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminJwtSecretKey,
  verifyAdminJwt,
} from "@/lib/admin-jwt";

export { ADMIN_COOKIE_NAME, verifyAdminJwt };

export function verifyAdminPassword(inputPassword: string): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  const normalizedInput = inputPassword.trim();
  if (!expected || !normalizedInput) {
    return false;
  }

  const inputHash = createHash("sha256").update(normalizedInput).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);
}

export async function signAdminJwt(): Promise<string> {
  const secretKey = getAdminJwtSecretKey();
  if (!secretKey) {
    throw new Error(
      "Missing or invalid ADMIN_JWT_SECRET (must be at least 16 characters)."
    );
  }

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminJwt(token);
}

export async function requireAdminRequest(
  request: NextRequest
): Promise<NextResponse | null> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isValid = await verifyAdminJwt(token);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
