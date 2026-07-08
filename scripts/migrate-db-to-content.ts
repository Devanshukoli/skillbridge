import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import type { Lesson, Module, Project, Track } from '../frontend/src/types';

interface LegacyDb {
  tracks?: Track[];
  modules?: Module[];
  lessons?: Lesson[];
  projects?: Project[];
}

const DB_FILE = path.join(process.cwd(), 'db.json');
const CONTENT_DIR = path.join(process.cwd(), 'content');

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

function writeYaml(filePath: string, value: unknown) {
  fs.writeFileSync(filePath, yaml.dump(value, { lineWidth: 100 }), 'utf-8');
}

function writeLesson(filePath: string, lesson: Lesson) {
  const frontmatter = yaml.dump({
    id: lesson.id,
    title: lesson.title,
    order: lesson.order,
    estimatedMinutes: lesson.estimatedMinutes
  }, { lineWidth: 100 });

  fs.writeFileSync(filePath, `---\n${frontmatter}---\n\n${lesson.content.trim()}\n`, 'utf-8');
}

function main() {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error('Cannot migrate curriculum content because db.json does not exist.');
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as LegacyDb;
  const tracks = db.tracks || [];
  const modules = db.modules || [];
  const lessons = db.lessons || [];
  const projects = db.projects || [];

  if (tracks.length === 0) {
    throw new Error('No tracks found in db.json to migrate.');
  }

  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  tracks.forEach((track) => {
    const trackSlug = slugify(track.id.replace(/^track-/, '').replace(/-\d+$/, '') || track.name);
    const trackDir = path.join(CONTENT_DIR, trackSlug);
    fs.mkdirSync(trackDir, { recursive: true });
    writeYaml(path.join(trackDir, 'track.yaml'), track);

    modules
      .filter((module) => module.trackId === track.id)
      .sort((a, b) => a.order - b.order)
      .forEach((module, index) => {
        const moduleDirName = `${String(index + 1).padStart(2, '0')}-${slugify(module.title)}`;
        const moduleDir = path.join(trackDir, moduleDirName);
        fs.mkdirSync(moduleDir, { recursive: true });
        writeYaml(path.join(moduleDir, 'module.yaml'), {
          id: module.id,
          title: module.title,
          order: module.order
        });

        lessons
          .filter((lesson) => lesson.moduleId === module.id)
          .sort((a, b) => a.order - b.order)
          .forEach((lesson) => {
            const lessonFileName = `${String(lesson.order).padStart(2, '0')}-${slugify(lesson.title)}.md`;
            writeLesson(path.join(moduleDir, lessonFileName), lesson);
          });

        projects
          .filter((project) => project.moduleId === module.id)
          .sort((a, b) => a.id.localeCompare(b.id))
          .forEach((project) => {
            const projectFileName = `${project.type}-${slugify(project.id)}.yaml`;
            writeYaml(path.join(moduleDir, projectFileName), {
              id: project.id,
              type: project.type,
              title: project.title,
              description: project.description,
              requirements: project.requirements,
              rubric: project.rubric,
              rewardPoints: project.rewardPoints,
              rewardMoney: project.rewardMoney ?? 0
            });
          });
      });
  });

  console.log(`Migrated ${tracks.length} tracks to ${CONTENT_DIR}`);
}

main();
