import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import {
  getAdminSupabaseClient,
  getServerReadSupabaseClient,
  MissingSupabaseConfigError,
} from "@/lib/supabase/server";
import {
  normalizeProjectRow,
  ProjectFormInputSchema,
  ProjectSectionSchema,
} from "@/types/portfolio";

export async function GET(request: NextRequest) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  const sectionParam = request.nextUrl.searchParams.get("section");
  let sectionFilter: "design" | "websites" | null = null;
  if (sectionParam !== null) {
    const parsedSection = ProjectSectionSchema.safeParse(sectionParam);
    if (!parsedSection.success) {
      return NextResponse.json(
        { error: "Invalid section parameter" },
        { status: 400 }
      );
    }
    sectionFilter = parsedSection.data;
  }

  try {
    const supabase = getServerReadSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Не заданы NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        },
        { status: 500 }
      );
    }
    let query = supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (sectionFilter) {
      query = query.eq("section", sectionFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch admin projects:", error.message);
      return NextResponse.json(
        { error: "Failed to load projects" },
        { status: 500 }
      );
    }

    const projects = (data ?? [])
      .map((row) => normalizeProjectRow(row))
      .filter((item) => item !== null);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Admin projects GET error:", error);
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

export async function POST(request: NextRequest) {
  const authError = await requireAdminRequest(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = ProjectFormInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const normalizeOptional = (val: string | null) =>
    val && val.length > 0 ? val : null;

  const payload = {
    ...parsed.data,
    project_url: normalizeOptional(parsed.data.project_url),
    github_url: normalizeOptional(parsed.data.github_url),
    figma_url: normalizeOptional(parsed.data.figma_url),
    cover_image: normalizeOptional(parsed.data.cover_image),
  };

  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      const status = error.code === "23505" ? 409 : 500;
      const message =
        error.code === "23505"
          ? "A project with this slug already exists"
          : "Failed to create project";
      if (status === 500) {
        console.error("Failed to insert project:", error.message);
      }
      return NextResponse.json({ error: message }, { status });
    }

    revalidatePath("/", "layout");
    return NextResponse.json(
      { project: normalizeProjectRow(data) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin projects POST error:", error);
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
