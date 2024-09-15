'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { authActionClient } from './safe-actions';
import {
	updatePasswordSchema,
	updateUserSchema,
} from '@/schemas/auth.schemas.ts';

export const updateUser = authActionClient
	.schema(updateUserSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { email, username } = parsedInput;
		const { userId } = ctx;

		try {
			if (!username && !email) throw new Error('No data provided');
			const user = await prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					...(username && { username }),
					...(email && { email }),
				},
			});

			return { username: user.username, email: user.email };
		} catch (error) {
			throw new Error('Cannot update user');
		}
	});

export const updatePassword = authActionClient
	.schema(updatePasswordSchema)
	.action(async ({ parsedInput, ctx }) => {
		const { password, newPassword } = parsedInput;
		const { userId } = ctx;

		try {
			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (!user) throw new Error('User not found');
			const passwordsMatch = await bcrypt.compare(
				password,
				user.password
			);

			if (!passwordsMatch) throw new Error('Old password is incorrect');

			const saltRounds = Number(process.env.SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

			await prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					password: hashedPassword,
				},
			});

			return true;
		} catch (error) {
			throw new Error('Cannot update password');
		}
	});
