"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isCategory } from "@/lib/categories";
import { slugify } from "@/lib/utils";
import { UploadError, deleteUpload, storeUpload } from "@/lib/uploads";

/** Public: bump the view counter. Fire-and-forget from the article page. */
export async function incrementViews(articleId: string) {
  await prisma.article.update({
    where: { id: articleId },
    data: { viewsCount: { increment: 1 } },
  });
}

/**
 * Public: add a like. Duplicate prevention is client-side via localStorage,
 * which is a deterrent rather than a guarantee — a determined visitor can still
 * POST repeatedly. Add rate limiting or per-visitor rows if that matters.
 */
export async function likeArticle(articleId: string) {
  const article = await prisma.article.update({
    where: { id: articleId },
    data: { likesCount: { increment: 1 } },
    select: { likesCount: true },
  });

  return article.likesCount;
}

export type ArticleFormState = { error?: string };

/** Store an optional uploaded file and return its MediaFile id. */
async function saveOptionalUpload(
  value: FormDataEntryValue | null,
  kind: "IMAGE" | "PDF",
) {
  if (!(value instanceof File) || value.size === 0) return null;

  const stored = await storeUpload(value, kind);
  const media = await prisma.mediaFile.create({
    data: stored,
    select: { id: true },
  });

  return { id: media.id, storageKey: stored.storageKey };
}

export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const isPremium = formData.get("isPremium") === "on";

  if (!title || !excerpt || !content) {
    return { error: "Titre, résumé et contenu sont obligatoires." };
  }
  if (!isCategory(category)) {
    return { error: "Catégorie invalide." };
  }

  // Track what landed on disk so a later failure doesn't orphan files.
  let cover: { id: string; storageKey: string } | null = null;
  let pdf: { id: string; storageKey: string } | null = null;

  try {
    cover = await saveOptionalUpload(formData.get("coverImage"), "IMAGE");
    pdf = await saveOptionalUpload(formData.get("pdf"), "PDF");

    // Slugs are unique; append a short suffix rather than failing on collision.
    const base = slugify(title);
    let slug = base;
    if (!slug) {
      return { error: "Le titre ne produit pas d'URL valide." };
    }
    if (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${base}-${Date.now().toString(36).slice(-4)}`;
    }

    await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        isPremium,
        coverImageId: cover?.id ?? null,
        pdfId: pdf?.id ?? null,
      },
    });
  } catch (error) {
    // Roll back uploaded bytes and their rows.
    for (const saved of [cover, pdf]) {
      if (!saved) continue;
      await deleteUpload(saved.storageKey);
      await prisma.mediaFile.delete({ where: { id: saved.id } }).catch(() => {});
    }

    if (error instanceof UploadError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(articleId: string) {
  await requireAdmin();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      coverImage: { select: { id: true, storageKey: true } },
      pdf: { select: { id: true, storageKey: true } },
    },
  });

  if (!article) return;

  // Comments cascade via the schema relation; media rows are SetNull, so the
  // files have to be cleaned up explicitly.
  await prisma.article.delete({ where: { id: articleId } });

  for (const media of [article.coverImage, article.pdf]) {
    if (!media) continue;
    await deleteUpload(media.storageKey);
    await prisma.mediaFile.delete({ where: { id: media.id } }).catch(() => {});
  }

  revalidatePath("/");
  revalidatePath("/admin/articles");
}
