import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * Article bodies are authored as Markdown and stored as Markdown. We render to
 * HTML at display time and always sanitize: admin input is trusted-ish, but this
 * keeps a compromised account from turning into stored XSS for every reader.
 */
export function renderMarkdown(markdown: string) {
  const html = marked.parse(markdown, { async: false, breaks: true });
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
