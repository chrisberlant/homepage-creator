import { z } from 'zod';

const categoryTitleSchema = z.string().min(1, {
	message: 'Title must be at least 1 character.',
});

export const createCategorySchema = z.object({
	title: categoryTitleSchema,
});

export const updateCategorySchema = z.strictObject({
	id: z.number(),
	title: categoryTitleSchema,
});

export const moveCategorySchema = z.strictObject({
	id: z.number(),
	newIndex: z.number(),
});
