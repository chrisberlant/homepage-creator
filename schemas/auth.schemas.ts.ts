import { z } from 'zod';

const usernameSchema = z
	.string({ required_error: 'Username is required' })
	.min(2, {
		message: 'Username must be at least 2 characters.',
	});

const passwordSchema = z
	.string({ required_error: 'Password is required' })
	.min(8, {
		message: 'Password must be at least 8 characters.',
	})
	.regex(
		/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-])/,
		'Password must contain an uppercase letter, a lowercase letter, a number, and a special character'
	);

export const loginSchema = z.strictObject({
	username: usernameSchema,
	password: passwordSchema,
});

export const registerSchema = z
	.strictObject({
		username: usernameSchema,
		email: z
			.string({ required_error: 'Username is required' })
			.email('Invalid email address'),
		password: passwordSchema,
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

export const updateUserSchema = z.strictObject({
	username: usernameSchema.optional(),
	email: z.string().email('Invalid email address').optional(),
});

export const updatePasswordSchema = z
	.strictObject({
		password: passwordSchema,
		newPassword: z
			.string({ required_error: 'New password is required' })
			.min(8, {
				message: 'New password must be at least 8 characters.',
			})
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-])/,
				'New password must contain an uppercase letter, a lowercase letter, a number, and a special character'
			),
		confirmPassword: z
			.string({ required_error: 'New password confirmation is required' })
			.min(8, {
				message: 'Password confirmation must be at least 8 characters.',
			})
			.regex(
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-])/,
				'Password confirmation must contain an uppercase letter, a lowercase letter, a number, and a special character'
			),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Confirmation is different from the new password',
		path: ['confirmPassword'],
	})
	.refine((data) => data.password !== data.newPassword, {
		message: 'Old and new passwords are identical',
		path: ['newPassword'],
	});
