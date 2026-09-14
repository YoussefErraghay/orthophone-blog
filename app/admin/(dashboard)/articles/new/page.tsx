import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[--c-text]">Nouvel article</h1>
      <ArticleEditor />
    </div>
  );
}
