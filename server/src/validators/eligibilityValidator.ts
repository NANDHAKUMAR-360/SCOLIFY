import { z } from 'zod';

export const eligibilityQuerySchema = z.object({
  aiExplanation: z.string().optional(),
});
