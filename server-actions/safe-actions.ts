import { createSafeActionClient } from 'next-safe-action';
import { getSession } from '@/lib/jwt';

class ActionError extends Error {}

export const actionClient = createSafeActionClient({
	handleServerError(error) {
		console.error('Action error:', error.message);
		throw error;
	},
});

export const authActionClient = actionClient.use(async ({ next }) => {
	const session = await getSession();
	if (!session?.userId) throw new ActionError('User not logged in');

	const { userId } = session;
	return next({ ctx: { userId } });
});
