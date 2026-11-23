import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class MissingSupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingSupabaseConfigError";
  }
}

export function getAdminSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const key = serviceRoleKey || anonKey;

  if (!url || !key) {
    throw new MissingSupabaseConfigError(
      "Не заданы NEXT_PUBLIC_SUPABASE_URL или ключи Supabase в .env.local / Vercel Environment Variables."
    );
  }

  const adminSecret = process.env.ADMIN_JWT_SECRET?.trim() ?? "";

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: serviceRoleKey
      ? undefined
      : {
          headers: {
            "x-portfolio-admin-secret": adminSecret,
          },
        },
  });
}

export function getServerReadSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
