import { z } from 'zod';

export const urlSchema = z
	.string()
	.min(1, {
		message: 'URL cannot be empty',
	})
	.url({ message: 'Please enter a valid URL' });

export const updateLinkSchema = z.strictObject({
	title: z.string().min(2, {
		message: 'Title must be at least 2 characters',
	}),
	url: urlSchema,
});
