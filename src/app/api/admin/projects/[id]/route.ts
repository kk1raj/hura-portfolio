import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest } from "@/lib/admin-auth";
import {
  getAdminSupabaseClient,
  MissingSupabaseConfigError,
} from "@/lib/supabase/server";
import {
  normalizeProjectRow,
  ProjectFormInputSchema,
} from "@/types/portfolio";

const ProjectIdSchema = z.string().uuid("Invalid project id");
const ProjectPatchSchema = ProjectFormInputSchema.partial();

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const parsedId = ProjectIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = ProjectPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };
  for (const field of [
    "project_url",
    "github_url",
    "figma_url",
    "cover_image",
  ] as const) {
    const value = parsed.data[field];
    if (value !== undefined) {
      updates[field] = value && value.length > 0 ? value : null;
    }
  }

  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", parsedId.data)
      .select("*")
      .maybeSingle();

    if (error) {
      const status = error.code === "23505" ? 409 : 500;
      const message =
        error.code === "23505"
          ? "A project with this slug already exists"
          : "Failed to update project";
      if (status === 500) {
        console.error("Failed to update project:", error.message);
      }
      return NextResponse.json({ error: message }, { status });
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ project: normalizeProjectRow(data) });
  } catch (error) {
    console.error("Admin projects PATCH error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof MissingSupabaseConfigError
            ? error.message
            : "Server configuration error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  const { id } = await context.params;
  const parsedId = ProjectIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", parsedId.data)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Failed to delete project:", error.message);
      return NextResponse.json(
        { error: "Failed to delete project" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin projects DELETE error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof MissingSupabaseConfigError
            ? error.message
            : "Server configuration error",
      },
      { status: 500 }
    );
  }
}
