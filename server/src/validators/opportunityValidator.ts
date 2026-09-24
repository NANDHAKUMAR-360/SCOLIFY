import { z } from 'zod';

export const opportunityQuerySchema = z.object({
  category: z.enum(['scholarship', 'internship', 'fellowship', 'competition', 'grant', 'research', 'apprenticeship', 'career', 'other']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
