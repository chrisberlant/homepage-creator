import { z } from 'zod';

export const urlSchema = z
	.string()
	.min(1, {
		message: 'URL cannot be empty',
	})
	.url({ message: 'Please enter a valid URL' })
	.optional();

export const createLinkSchema = z.object({
	title: z.string().min(1, {
		message: 'Link title must be at least 1 character.',
	}),
	url: z.string().min(1, {
		message: 'URL must be at least 1 character.',
	}),
	categoryId: z.number().int().min(0),
});

export const updateLinkSchema = z.strictObject({
	id: z.number().int().min(0),
	title: z
		.string()
		.min(1, {
			message: 'Title must be at least 1 character',
		})
		.optional(),
	url: urlSchema,
});

export const moveLinkSchema = z.strictObject({
	id: z.number().int().min(0),
	newIndex: z.number().int().min(0).optional(),
	newCategoryId: z.number().int().min(0),
});
