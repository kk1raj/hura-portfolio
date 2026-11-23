import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getCvData, getSiteSettings } from "@/lib/data";
import { getAdminSupabaseClient } from "@/lib/supabase/server";
import {
  CvDataSchema,
  SiteContentKeySchema,
  SiteSettingsSchema,
} from "@/types/portfolio";

const PutContentSchema = z.object({
  key: SiteContentKeySchema,
  content: z.unknown(),
});

export async function GET(request: NextRequest) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  try {
    const [cv_data, settings] = await Promise.all([
      getCvData(),
      getSiteSettings(),
    ]);
    return NextResponse.json({ cv_data, settings });
  } catch (error) {
    console.error("Admin content GET error:", error);
    return NextResponse.json(
      { error: "Failed to load site content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsedEnvelope = PutContentSchema.safeParse(body);
  if (!parsedEnvelope.success) {
    return NextResponse.json(
      { error: "Invalid content key or payload" },
      { status: 400 }
    );
  }

  const { key, content } = parsedEnvelope.data;
  const validatedContent =
    key === "cv_data"
      ? CvDataSchema.safeParse(content)
      : SiteSettingsSchema.safeParse(content);

  if (!validatedContent.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validatedContent.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const supabase = getAdminSupabaseClient();
    const now = new Date().toISOString();
    const rowsToUpsert =
      key === "cv_data"
        ? [{ key: "cv_data", content: validatedContent.data, updated_at: now }]
        : [
            { key: "settings", content: validatedContent.data, updated_at: now },
            {
              key: "profile_settings",
              content: validatedContent.data,
              updated_at: now,
            },
          ];

    const { error } = await supabase
      .from("site_content")
      .upsert(rowsToUpsert, { onConflict: "key" });

    if (error) {
      console.error("Failed to upsert site_content:", error.message);
      return NextResponse.json(
        { error: "Failed to save content" },
        { status: 500 }
      );
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ key, content: validatedContent.data });
  } catch (error) {
    console.error("Admin content PUT error:", error);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }
}
