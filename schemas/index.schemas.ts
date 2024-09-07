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

export const registerSchema = z
	.strictObject({
		username: z.string({ required_error: 'Username is required' }).min(2, {
			message: 'Username must be at least 2 characters.',
		}),
		email: z
			.string({ required_error: 'Username is required' })
			.email('Invalid email address'),
		password: z
			.string({ required_error: 'Password is required' })
			.min(8, {
				message: 'Password must be at least 8 characters.',
			})
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-])/,
				'Password must contain an uppercase letter, a lowercase letter, a number, and a special character'
			),
		confirmPassword: z
			.string()
			.min(8, {
				message: 'Password confirmation must be at least 8 characters.',
			})
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-])/,
				'Password confirmation must contain an uppercase letter, a lowercase letter, a number, and a special character'
			),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Confirmation is different from the password',
		path: ['confirmPassword'],
	});

export const credentialsSchema = z.strictObject({
	username: z.string({ required_error: 'Username is required' }).min(2, {
		message: 'Username must be at least 2 characters.',
	}),
	password: z.string({ required_error: 'Password is required' }).min(8, {
		message: 'Password must be at least 8 characters.',
	}),
});

export const updateUserSchema = z.strictObject({
	username: z
		.string()
		.min(2, {
			message: 'Username must be at least 2 characters.',
		})
		.optional(),
	email: z.string().email('Invalid email address').optional(),
});
