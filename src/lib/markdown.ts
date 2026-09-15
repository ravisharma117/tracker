/**
 * Import/export between a page and a single Markdown file.
 *
 * Runs entirely in the browser — no server round trip for the parsing itself
 * (extraction, which does need the server, is driven separately by the
 * caller — see ImportMarkdown.tsx). Much simpler than the old Project
 * version: a page has no status/priority/tags to parse out of "Key: value"
 * lines, so anything that isn't the title is content, verbatim. Lines like
 * "Status: In progress" from a real Notion export simply stay as visible
 * content — there's nowhere left to put them, and that's honestly what they
 * are: text on the page.
 */

export type ParsedPage = {
  name: string;
  content: string;
};

export function parsePageMarkdown(markdown: string): ParsedPage {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;

  const titleMatch = lines[i]?.match(/^#\s+(.*)$/);
  const name = titleMatch ? titleMatch[1].trim() : "Untitled";
  if (titleMatch) i++;

  // One blank line commonly follows the title (our own export writes one,
  // and so do real Notion exports) — skipped rather than kept, so content
  // doesn't start with a stray blank line on every import.
  if (lines[i]?.trim() === "") i++;

  const content = lines.slice(i).join("\n").trim();

  return { name, content };
}

export function serializePageMarkdown(page: { name: string; content: string }): string {
  const body = page.content.trim();
  return `# ${page.name}\n\n${body}\n`;
}

/** A filesystem-safe filename for one page's export. */
export function pageFilename(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug || "page"}.md`;
}

/** Trigger a browser download of `content` as a file named `filename`. */
export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/** A GFM checkbox list item, matched the same way the importer's
 * auto-extraction and the page viewer's per-line rendering both need. */
export const CHECKBOX_LINE = /^(\s*)-\s*\[( |x|X)\]\s*(.*)$/;
