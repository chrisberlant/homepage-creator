import { z } from 'zod';

export const createCategorySchema = z.object({
	title: z.string().min(1, {
		message: 'Title must be at least 1 character.',
	}),
});
