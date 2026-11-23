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

  if (!url) {
    throw new MissingSupabaseConfigError(
      "Не задан NEXT_PUBLIC_SUPABASE_URL в .env.local или Vercel Environment Variables."
    );
  }

  if (!serviceRoleKey) {
    throw new MissingSupabaseConfigError(
      "Не задан SUPABASE_SERVICE_ROLE_KEY. Добавьте service_role ключ из Supabase Dashboard (Project Settings → API) в .env.local и Vercel Environment Variables."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
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
