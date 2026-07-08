import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { loadCompiledContent } from '../backend/content/content-store';

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for content sync.');
}

const supabase = createClient(url, serviceRoleKey);

async function assertOk<T>(label: string, promise: PromiseLike<{ error: T | null }>) {
  const { error } = await promise;
  if (error) {
    throw new Error(`${label} failed: ${JSON.stringify(error)}`);
  }
}

async function main() {
  const content = loadCompiledContent();

  await assertOk('Track upsert', supabase.from('skillbridge_tracks').upsert(content.tracks));
  await assertOk('Module upsert', supabase.from('skillbridge_modules').upsert(
    content.modules.map((module) => ({
      id: module.id,
      track_id: module.trackId,
      title: module.title,
      order: module.order
    }))
  ));
  await assertOk('Lesson upsert', supabase.from('skillbridge_lessons').upsert(
    content.lessons.map((lesson) => ({
      id: lesson.id,
      module_id: lesson.moduleId,
      title: lesson.title,
      order: lesson.order,
      estimated_minutes: lesson.estimatedMinutes,
      content: lesson.content
    }))
  ));
  await assertOk('Project upsert', supabase.from('skillbridge_projects').upsert(
    content.projects.map((project) => ({
      id: project.id,
      track_id: project.trackId,
      module_id: project.moduleId,
      type: project.type,
      title: project.title,
      description: project.description,
      requirements: project.requirements,
      rubric: project.rubric,
      reward_points: project.rewardPoints,
      reward_money: project.rewardMoney ?? 0
    }))
  ));

  console.log('Supabase content synced.');
}

main();
