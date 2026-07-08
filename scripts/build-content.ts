import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import * as yaml from 'js-yaml';
import {
  CompiledContentSchema,
  LessonFrontmatterSchema,
  ModuleFileSchema,
  ProjectFileSchema,
  TrackSchema
} from '../backend/content/schema';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const OUT_FILE = path.join(process.cwd(), 'backend', 'content', 'compiled.json');

function readYamlFile(filePath: string) {
  try {
    return yaml.load(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    throw new Error(`Failed to read YAML file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function orderFromPrefix(name: string, fallback: number) {
  const match = name.match(/^(\d+)-/);
  return match ? Number(match[1]) : fallback;
}

function validateUniqueId(seen: Set<string>, id: string, filePath: string) {
  if (seen.has(id)) {
    throw new Error(`Duplicate content id "${id}" found at ${filePath}`);
  }
  seen.add(id);
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error('Missing content directory. Run npm run content:migrate or create content files first.');
  }

  const tracks: unknown[] = [];
  const modules: unknown[] = [];
  const lessons: unknown[] = [];
  const projects: unknown[] = [];
  const seenIds = new Set<string>();

  const trackFolders = fs.readdirSync(CONTENT_DIR)
    .filter((entry) => fs.statSync(path.join(CONTENT_DIR, entry)).isDirectory())
    .sort();

  for (const trackFolder of trackFolders) {
    const trackPath = path.join(CONTENT_DIR, trackFolder);
    const trackFile = path.join(trackPath, 'track.yaml');
    const track = TrackSchema.parse(readYamlFile(trackFile));
    validateUniqueId(seenIds, track.id, trackFile);
    tracks.push(track);

    const moduleFolders = fs.readdirSync(trackPath)
      .filter((entry) => fs.statSync(path.join(trackPath, entry)).isDirectory())
      .sort();

    moduleFolders.forEach((moduleFolder, moduleIndex) => {
      const modulePath = path.join(trackPath, moduleFolder);
      const moduleFile = path.join(modulePath, 'module.yaml');
      const moduleData = ModuleFileSchema.parse(readYamlFile(moduleFile));
      const moduleOrder = moduleData.order ?? orderFromPrefix(moduleFolder, moduleIndex + 1);
      validateUniqueId(seenIds, moduleData.id, moduleFile);
      modules.push({ ...moduleData, order: moduleOrder, trackId: track.id });

      const files = fs.readdirSync(modulePath).sort();
      files.forEach((file, fileIndex) => {
        const filePath = path.join(modulePath, file);
        if (file === 'module.yaml' || fs.statSync(filePath).isDirectory()) return;

        if (file.endsWith('.md')) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = matter(raw);
          const frontmatter = LessonFrontmatterSchema.parse(parsed.data);
          const lessonOrder = frontmatter.order ?? orderFromPrefix(file, fileIndex + 1);
          validateUniqueId(seenIds, frontmatter.id, filePath);
          lessons.push({
            ...frontmatter,
            order: lessonOrder,
            moduleId: moduleData.id,
            content: parsed.content.trim()
          });
          return;
        }

        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const project = ProjectFileSchema.parse(readYamlFile(filePath));
          validateUniqueId(seenIds, project.id, filePath);
          projects.push({ ...project, trackId: track.id, moduleId: moduleData.id });
        }
      });
    });
  }

  const compiled = CompiledContentSchema.parse({ tracks, modules, lessons, projects });
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(compiled, null, 2)}\n`, 'utf-8');
  console.log(`Compiled ${compiled.tracks.length} tracks, ${compiled.modules.length} modules, ${compiled.lessons.length} lessons, ${compiled.projects.length} projects to ${OUT_FILE}`);
}

main();
