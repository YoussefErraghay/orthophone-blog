import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Article bodies are authored as Markdown and stored as Markdown. We render to
 * HTML at display time and always sanitize: admin input is trusted-ish, but this
 * keeps a compromised account from turning into stored XSS for every reader.
 *
 * Uses `sanitize-html` (htmlparser2) rather than DOMPurify: the isomorphic
 * build of DOMPurify depends on jsdom, a full browser emulation that does not
 * survive bundling into a serverless function — every article page returned a
 * 500 in production while working locally.
 */

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "strong", "em", "del", "blockquote",
  "ul", "ol", "li",
  "a", "img",
  "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
];

export function renderMarkdown(markdown: string) {
  const html = marked.parse(markdown, { async: false, breaks: true });

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title"],
      code: ["class"], // language-* from fenced blocks
    },
    // Block javascript: and data: URLs. Relative links (e.g. /media/[id])
    // are permitted by default and stay working.
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      // Outbound links open safely.
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}
