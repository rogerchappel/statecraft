import { promises as fs } from "node:fs";
import path from "node:path";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const IGNORED_DIRS = new Set([".git", "node_modules", "dist", "build", "coverage", ".next"]);

export interface SourceFile {
  path: string;
  relativePath: string;
  text: string;
}

export async function collectSourceFiles(root: string): Promise<SourceFile[]> {
  const absoluteRoot = path.resolve(root);
  const files: SourceFile[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) await walk(fullPath);
        continue;
      }
      if (!entry.isFile() || !SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
      const text = await fs.readFile(fullPath, "utf8");
      files.push({ path: fullPath, relativePath: path.relative(absoluteRoot, fullPath), text });
    }
  }

  await walk(absoluteRoot);
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}
