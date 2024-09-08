'use server';

import prisma from '@/lib/prisma';
import { updateUserType } from '@/lib/types';
import { getSession } from './auth.actions';

export async function updateUser({ username, email }: updateUserType) {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');

	if (!username && !email) throw new Error('No data provided');

	try {
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
