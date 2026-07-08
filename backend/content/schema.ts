import { z } from 'zod';

export const TrackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1)
});

export const ModuleFileSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().positive().optional()
});

export const LessonFrontmatterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().positive().optional(),
  estimatedMinutes: z.number().int().positive()
});

export const ProjectFileSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['practice', 'capstone']),
  title: z.string().min(1),
  description: z.string().min(1),
  requirements: z.array(z.string().min(1)),
  rubric: z.array(z.string().min(1)),
  rewardPoints: z.number().int().nonnegative(),
  rewardMoney: z.number().int().nonnegative().optional()
});

export const CompiledContentSchema = z.object({
  tracks: z.array(TrackSchema),
  modules: z.array(ModuleFileSchema.extend({
    order: z.number().int().positive(),
    trackId: z.string().min(1)
  })),
  lessons: z.array(LessonFrontmatterSchema.extend({
    order: z.number().int().positive(),
    moduleId: z.string().min(1),
    content: z.string()
  })),
  projects: z.array(ProjectFileSchema.extend({
    trackId: z.string().min(1),
    moduleId: z.string().min(1)
  }))
});

export type CompiledContent = z.infer<typeof CompiledContentSchema>;
