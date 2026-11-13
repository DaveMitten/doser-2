import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

/**
 * Renders a legal document from src/content/legal/*.md at build time.
 *
 * The source of truth is docs/PRIVACY.md and docs/TERMS.md in the doser-mobile
 * repo; these files are copies, so edit there first and copy across.
 *
 * Publishing a draft is the mistake this guards against: while a document
 * still says "Status: DRAFT" or holds a placeholder, the build fails, so
 * Vercel keeps serving the previous deployment instead. A placeholder is any
 * bracketed text starting with a capital — `[TRIAL LENGTH, OR “none”]`,
 * `[FLOOR — e.g. £50]` — except a Markdown link label, `[Text](url)`.
 */
const PLACEHOLDER = /\[[A-Z][^\]\n]*\](?![(\[:])/;

export function readLegalDocument(file: "privacy.md" | "terms.md"): string {
  const markdown = fs.readFileSync(path.join(process.cwd(), "src/content/legal", file), "utf8");
  const placeholder = markdown.match(PLACEHOLDER);
  if (/Status:\s*DRAFT/i.test(markdown) || placeholder) {
    throw new Error(
      `${file} is still a draft (${placeholder ? `placeholder ${placeholder[0]}` : "marked DRAFT"}). ` +
        "Finish it in doser-mobile/docs, copy it here, then deploy."
    );
  }
  return marked.parse(markdown, { async: false });
}

export function LegalDocument({ html }: { html: string }) {
  return (
    <div className="min-h-screen bg-doser-background">
      <article
        className={[
          "container mx-auto max-w-3xl px-6 py-16 text-doser-text leading-relaxed",
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6",
          "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4",
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2",
          "[&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_li]:my-1 [&_a]:text-doser-primary [&_a]:underline [&_strong]:font-semibold",
          "[&_hr]:my-8 [&_hr]:border-doser-border",
          "[&_table]:w-full [&_table]:my-4 [&_table]:text-sm [&_th]:text-left [&_th]:p-2",
          "[&_th]:border-b [&_th]:border-doser-border [&_td]:p-2 [&_td]:align-top",
          "[&_td]:border-b [&_td]:border-doser-border [&_code]:text-sm",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
