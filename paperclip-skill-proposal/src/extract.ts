/**
 * Document text extraction (docx/pdf/txt/md) — same approach as the memory brain,
 * kept local so this skill is self-contained.
 */
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export async function extractDocText(path: string): Promise<string> {
  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".docx": return (await mammoth.extractRawText({ path })).value?.trim() ?? "";
    case ".pdf": {
      const buf = await readFile(path);
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: true });
      return (Array.isArray(text) ? text.join("\n") : String(text ?? "")).trim();
    }
    case ".txt":
    case ".md": return (await readFile(path, "utf8")).trim();
    default: throw new Error(`Unsupported template type: ${ext}`);
  }
}
