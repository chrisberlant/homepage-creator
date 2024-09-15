'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { encrypt } from '@/lib/jwt';
import { loginSchema, registerSchema } from '../schemas/auth.schemas.ts';
import { actionClient, authActionClient } from './safe-actions';

export const login = actionClient
	.schema(loginSchema)
	.action(async ({ parsedInput }) => {
		try {
			const user = await prisma.user.findFirst({
				where: {
					username: parsedInput.username,
				},
			});
			if (!user) throw new Error('Incorrect credentials');

			const passwordsMatch = await bcrypt.compare(
				parsedInput.password,
				user.password
			);
			if (!passwordsMatch) throw new Error('Incorrect credentials');

			// Create the session
			const expires = new Date(Date.now() + 60 * 60 * 10000);
			const { id, username, email } = user;
			const session = await encrypt({ user: { id }, expires });
			// Save the session in a cookie
			cookies().set('session', session, { expires, httpOnly: true });
			return { username, email };
		} catch (error) {
			throw new Error('Incorrect credentials');
		}
	});

export const getAuth = authActionClient.action(async ({ ctx }) => {
	const { userId } = ctx;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});
	if (!user) throw new Error('User not found or invalid');

	const { username, email } = user;
	return { username, email };
});

export const register = actionClient
	.schema(registerSchema)
	.action(async ({ parsedInput }) => {
		const { username, password, email } = parsedInput;

		try {
			const alreadyExistingUser = await prisma.user.findFirst({
				where: {
					OR: [{ username }, { email }],
				},
			});
			if (alreadyExistingUser) throw new Error('User already exists');

			const saltRounds = Number(process.env.SALT_ROUNDS);
			const hashedPassword = await bcrypt.hash(password, saltRounds);

			return await prisma.user.create({
				data: {
					username,
					email,
					password: hashedPassword,
				},
			});
		} catch (error) {
			throw new Error('Cannot register the user');
		}
	});

export async function logout() {
	cookies().delete('session');
}
