import { createSafeActionClient } from 'next-safe-action';
import { deleteSession, getSession } from '@/lib/jwt';
import prisma from '../lib/prisma';

class ActionError extends Error {}

export const actionClient = createSafeActionClient({
	handleServerError(error) {
		console.error('Action error:', error.message);
		throw error;
	},
});

export const authActionClient = actionClient.use(async ({ next }) => {
	const session = await getSession();
	if (!session) throw new ActionError('User not logged in');
	const { userId } = session;

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		deleteSession();
		throw new ActionError('User not found');
	}

	return next({ ctx: { userId } });
});
