import { adminDb } from "@/lib/supabase";
import { requireAdmin, apiError } from "@/lib/auth";

// GET — Admin ke liye sabhi articles
export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const { data, error } = await adminDb
      .from("daily_articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return Response.json({
      articles: data || [],
    });
  } catch (e) {
    return apiError(e);
  }
}

// POST — Admin manually article insert karega
export async function POST(req: Request) {
  try {
    const { user } = await requireAdmin(req);
    const b = await req.json();

    const title = String(b.title || "").trim();
    const content = String(b.content || "").trim();
    const category = String(b.category || "Astrology").trim();

    if (!title || !content) {
      throw new Error("INVALID_ARTICLE");
    }

    const allowedStatus = [
      "draft",
      "published",
      "unpublished",
    ];

    const status = allowedStatus.includes(b.status)
      ? b.status
      : "draft";

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const slug = `${baseSlug || "article"}-${Date.now()}`;

    const row = {
      title,
      slug,
      category,
      content,

      featured_image_url:
        String(b.featured_image_url || "").trim() || null,

      source: "admin",

      status,

      published_at:
        status === "published"
          ? new Date().toISOString()
          : null,

      updated_at: new Date().toISOString(),
    };

    const { data, error } = await adminDb
      .from("daily_articles")
      .insert(row)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return Response.json(
      {
        success: true,
        message: "Article inserted successfully.",
        article: data,
        created_by: user.id,
      },
      { status: 201 }
    );
  } catch (e) {
    return apiError(e);
  }
}

// PATCH — Edit / Publish / Unpublish / Draft
export async function PATCH(req: Request) {
  try {
    await requireAdmin(req);

    const b = await req.json();

    if (!b.id) {
      throw new Error("INVALID_ID");
    }

    const patch: Record<string, unknown> = {};

    if (b.title !== undefined) {
      const title = String(b.title).trim();

      if (!title) throw new Error("INVALID_ARTICLE");

      patch.title = title;
    }

    if (b.category !== undefined) {
      patch.category =
        String(b.category).trim() || "Astrology";
    }

    if (b.content !== undefined) {
      const content = String(b.content).trim();

      if (!content) throw new Error("INVALID_ARTICLE");

      patch.content = content;
    }

    if (b.featured_image_url !== undefined) {
      patch.featured_image_url =
        String(b.featured_image_url || "").trim() || null;
    }

    if (b.status !== undefined) {
      const allowedStatus = [
        "draft",
        "published",
        "unpublished",
      ];

      if (!allowedStatus.includes(b.status)) {
        throw new Error("INVALID_STATUS");
      }

      patch.status = b.status;

      patch.published_at =
        b.status === "published"
          ? new Date().toISOString()
          : null;
    }

    patch.updated_at = new Date().toISOString();

    const { data, error } = await adminDb
      .from("daily_articles")
      .update(patch)
      .eq("id", b.id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    return Response.json({
      success: true,
      message: "Article updated successfully.",
      article: data,
    });
  } catch (e) {
    return apiError(e);
  }
}

// DELETE — Article permanently delete
export async function DELETE(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      throw new Error("INVALID_ID");
    }

    const { error } = await adminDb
      .from("daily_articles")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return Response.json({
      success: true,
      message: "Article deleted successfully.",
    });
  } catch (e) {
    return apiError(e);
  }
}