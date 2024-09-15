import { z } from 'zod';

const categoryTitleSchema = z.string().min(1, {
	message: 'Title must be at least 1 character.',
});

export const createCategorySchema = z.object({
	title: categoryTitleSchema,
	column: z.number().int().min(0).max(3),
});

export const updateCategorySchema = z.strictObject({
	id: z.number().int().min(0),
	title: categoryTitleSchema,
});

export const moveCategorySchema = z.strictObject({
	id: z.number().int(),
	newIndex: z.number().int().min(0),
});
