import fs from 'fs';
import path from 'path';
import { CompiledContent, CompiledContentSchema } from './schema';

const COMPILED_CONTENT_FILE = path.join(process.cwd(), 'backend', 'content', 'compiled.json');

let cachedContent: CompiledContent | null = null;

export function loadCompiledContent(): CompiledContent {
  if (cachedContent) {
    return cachedContent;
  }

  if (!fs.existsSync(COMPILED_CONTENT_FILE)) {
    throw new Error('Compiled curriculum content is missing. Run npm run content:build.');
  }

  const raw = fs.readFileSync(COMPILED_CONTENT_FILE, 'utf-8');
  const parsed = JSON.parse(raw);
  cachedContent = CompiledContentSchema.parse(parsed);
  return cachedContent;
}

export function clearCompiledContentCache() {
  cachedContent = null;
}
