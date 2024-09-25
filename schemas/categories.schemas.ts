import { z } from 'zod';

const categoryTitleSchema = z
	.string({ required_error: 'Title is required' })
	.min(1, {
		message: 'Title must be at least 1 character.',
	});

export const createCategorySchema = z.object({
	title: categoryTitleSchema,
	column: z
		.number({ required_error: 'Columnis required' })
		.int()
		.min(0)
		.max(3),
});

export const updateCategorySchema = z.strictObject({
	id: z.number({ required_error: 'Id is required' }).int().min(0),
	title: categoryTitleSchema,
});

export const moveCategorySchema = z.strictObject({
	id: z.number({ required_error: 'Id is required' }).int(),
	newIndex: z.number().int().min(0).optional(),
	newColumn: z
		.number({ required_error: 'newColumn is required' })
		.int()
		.min(0),
});
