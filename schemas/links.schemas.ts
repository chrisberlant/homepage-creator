import { z } from 'zod';

export const urlSchema = z
	.string({ required_error: 'URL is required' })
	.min(1, {
		message: 'URL cannot be empty',
	})
	.url({ message: 'Please enter a valid URL' });

export const urlObjectSchema = z.strictObject({ url: urlSchema });

export const createLinkSchema = z.strictObject({
	title: z.string({ required_error: 'Title is required' }).min(1, {
		message: 'Link title must be at least 1 character.',
	}),
	url: urlSchema,
	categoryId: z.number().int().min(0),
});

export const updateLinkSchema = z.strictObject({
	id: z.number({ required_error: 'Id is required' }).int().min(0),
	title: z
		.string()
		.min(1, {
			message: 'Title must be at least 1 character',
		})
		.optional(),
	url: urlSchema.optional(),
});

export const moveLinkSchema = z.strictObject({
	id: z.number({ required_error: 'Id is required' }).int().min(0, {
		message: 'Id must be positive',
	}),
	newIndex: z
		.number()
		.int()
		.min(0, {
			message: 'Index must be positive',
		})
		.optional(),
	newCategoryId: z
		.number({ required_error: 'New category id is required' })
		.int()
		.min(0, {
			message: 'New category must be positive',
		}),
});
