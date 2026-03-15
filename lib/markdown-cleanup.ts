import { promises as fs } from "fs";
import path from "path";

/**
 * Clean raw markdown content: NFC normalization, image map substitution,
 * and Notion export artifact cleanup.
 *
 * Pure function — no side effects.
 */
export function cleanMarkdownContent(
  raw: string,
  imageMap?: Record<string, string>,
): string {
  // Normalize Unicode (macOS uses NFD, TS literals use NFC)
  let content = raw.normalize("NFC");

  if (imageMap) {
    for (const [from, to] of Object.entries(imageMap)) {
      content = content.replaceAll(from, to);
    }
  }

  // Clean up Notion export artifacts:
  // 1. Remove excessive whitespace in image alt text
  content = content.replace(
    /!\[\s*(.*?)\s*\]/g,
    (_match, alt: string) => `![${alt.trim()}]`,
  );
  // 2. Remove indented caption lines after images (4+ spaces = code block in md)
  content = content.replace(
    /^[ \t]{4,}(.+)$/gm,
    (_match, text: string) => text.trim(),
  );

  return content;
}

/**
 * Read a markdown file from the filesystem and clean it.
 * Returns null if the file cannot be read.
 */
export async function loadMarkdownFromFile(
  markdownPath: string,
  imageMap?: Record<string, string>,
): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), markdownPath);
    const raw = await fs.readFile(filePath, "utf-8");
    return cleanMarkdownContent(raw, imageMap);
  } catch {
    return null;
  }
}
