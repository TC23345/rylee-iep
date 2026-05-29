import "server-only";

// Server-side reads of the in-repo markdown content. Ports the parse helpers from
// index.html (parseModulesMd, parseModuleContentSections, extractLeadingH1) so the
// rendered output matches the current app. Server-only (uses node:fs) — never import
// from a Client Component.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { CONTEXT_PLACEHOLDERS, type M1LensKey } from "@/lib/data";

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(process.cwd(), "content");

async function readFrom(baseDir: string, relPath: string): Promise<string | null> {
  try {
    // Normalize CRLF→LF: git checks these files out with CRLF on Windows, which
    // would break the LF-based parsers (parseModulesMd's `\n---\n` lookahead, etc.).
    const raw = await readFile(path.join(baseDir, relPath), "utf8");
    return raw.replace(/\r\n/g, "\n");
  } catch {
    return null;
  }
}

const readRoot = (relPath: string) => readFrom(ROOT_DIR, relPath);
const readContent = (relPath: string) => readFrom(CONTENT_DIR, relPath);

export async function getReadme(): Promise<string> {
  return (await readRoot("README.md")) ?? "";
}

export async function getArchive(): Promise<string> {
  return (await readRoot("archive.md")) ?? "";
}

// ── modules.md → per-module markdown chunk ────────────────────────────────
function parseModulesMd(text: string): Record<number, string> {
  const sections: Record<number, string> = {};
  const re = /## Module (\d+):[^\n]*\n([\s\S]*?)(?=\n---\n|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    const body = m[2].trim();
    const titleLine = text.match(new RegExp(`## Module ${n}: ([^\\n]+)`));
    const title = titleLine ? titleLine[1] : "";
    sections[n] = `## ${title}\n\n${body}`;
  }
  return sections;
}

export async function getModuleSection(n: number): Promise<string | null> {
  const text = await readRoot("modules.md");
  if (!text) return null;
  return parseModulesMd(text)[n] ?? null;
}

// ── content/module-N.md → deliverable sections ────────────────────────────
export interface ContentSection {
  heading: string;
  body: string;
}

function parseModuleContentSections(text: string): ContentSection[] {
  const sections: ContentSection[] = [];
  const parts = text.split(/^## /m).filter((s) => s.trim());
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim();
    const body = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    sections.push({ heading, body });
  }
  return sections;
}

export async function getModuleContent(n: number): Promise<ContentSection[] | null> {
  const text = await readContent(`module-${n}.md`);
  if (!text) return null;
  return parseModuleContentSections(text);
}

/** Body to render for a deliverable section: empty / "[Paragraph]" falls back to the
 *  three bracketed lens placeholders (matches index.html renderSectionBody). */
export function sectionBodyOrPlaceholder(body: string | undefined): string {
  const t = (body ?? "").trim();
  return !t || t === "[Paragraph]" ? CONTEXT_PLACEHOLDERS : body!;
}

// ── Module-1 skill lens files ─────────────────────────────────────────────
export interface LensContent {
  title: string | null;
  hint: string | null;
  body: string;
}

/** A leading `# H1` promotes to tab label + panel title; an `*italic*` line below it
 *  becomes the hint; the rest is the body (ported from index.html extractLeadingH1). */
export function extractLeadingH1(md: string): LensContent {
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  const titleMatch = (lines[i] || "").match(/^#\s+(.+?)\s*$/);
  if (!titleMatch) return { title: null, hint: null, body: md };
  i++;
  while (i < lines.length && lines[i].trim() === "") i++;
  const hintMatch = (lines[i] || "").match(/^\*(.+?)\*\s*$/);
  let hint: string | null = null;
  if (hintMatch) {
    hint = hintMatch[1];
    i++;
  }
  return {
    title: titleMatch[1],
    hint,
    body: lines.slice(i).join("\n").replace(/^\n+/, ""),
  };
}

/** Raw markdown for content/skills/<slug>/<lens>.md, or "" if missing. */
export async function getSkillLens(slug: string, lens: M1LensKey): Promise<string> {
  const md = await readContent(`skills/${slug}/${lens}.md`);
  return md ? md.trim() : "";
}

/** The bracketed placeholder for a lens when the lens file is missing. */
export function placeholderForLens(lens: M1LensKey): string {
  const parts = CONTEXT_PLACEHOLDERS.split(/\n\n+/);
  if (lens === "research") return parts[0];
  if (lens === "module") return parts[1];
  return parts[2];
}
