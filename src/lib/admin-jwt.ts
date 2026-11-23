import { jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "admin_session";

export function getAdminJwtSecretKey(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET?.trim();
  if (!secret || secret.length < 16) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function verifyAdminJwt(
  token: string | undefined
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secretKey = getAdminJwtSecretKey();
  if (!secretKey) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
