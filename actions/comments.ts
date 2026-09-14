"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type CommentFormState = { error?: string; success?: boolean };

/**
 * Public: submit a comment. Always stored unapproved — nothing reaches readers
 * until an admin approves it from the moderation queue.
 */
export async function addComment(
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const articleId = String(formData.get("articleId") ?? "");
  const authorName = String(formData.get("authorName") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!articleId || !authorName || !content) {
    return { error: "Nom et commentaire sont obligatoires." };
  }
  if (authorName.length > 80) {
    return { error: "Le nom est trop long." };
  }
  if (content.length > 2000) {
    return { error: "Le commentaire est trop long (2000 caractères max)." };
  }

  // Confirm the article exists so the FK error doesn't surface as a crash.
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });
  if (!article) {
    return { error: "Article introuvable." };
  }

  await prisma.comment.create({
    data: { articleId, authorName, content, isApproved: false },
  });

  revalidatePath(`/articles/${article.slug}`);
  return { success: true };
}

export async function approveComment(commentId: string) {
  await requireAdmin();

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { isApproved: true },
    select: { article: { select: { slug: true } } },
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/articles/${comment.article.slug}`);
}

export async function deleteComment(commentId: string) {
  await requireAdmin();

  const comment = await prisma.comment.delete({
    where: { id: commentId },
    select: { article: { select: { slug: true } } },
  });

  revalidatePath("/admin/comments");
  revalidatePath(`/articles/${comment.article.slug}`);
}
