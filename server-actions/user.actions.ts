'use server';

import prisma from '@/lib/prisma';
import { updatePasswordType, updateUserType } from '@/lib/types';
import { getSession } from './auth.actions';

export async function updateUser({ username, email }: updateUserType) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		if (!username && !email) throw new Error('No data provided');
		const user = await prisma.user.update({
			where: {
				id: session.user.id,
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
}

export async function updatePassword({
	password,
	newPassword,
}: updatePasswordType) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	try {
		if (!password && !newPassword) throw new Error('No data provided');
		if (password === newPassword)
			throw new Error('Old and new passwords are identical');

		const user = await prisma.user.findUnique({
			where: {
				id: session.user.id,
			},
		});
		if (!user) throw new Error('User not found');
		if (user.password !== password)
			throw new Error('Old password is incorrect');

		await prisma.user.update({
			where: {
				id: session.user.id,
			},
			data: {
				password: newPassword,
			},
		});

		return true;
	} catch (error) {
		throw new Error('Cannot update password');
	}
}
