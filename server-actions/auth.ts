'use server';

import { cookies } from 'next/headers';
import { encrypt } from '../lib/auth';
import prisma from '../lib/prisma';
import { loginFormType } from '../schemas/form';
import { redirect } from 'next/navigation';

export async function login(values: loginFormType) {
	try {
		const user = await prisma.user.findFirst({
			where: {
				name: values.username,
			},
		});
		if (!user) return { error: 'Utilisateur introuvable' };
		if (values.password !== user.password)
			return { error: 'Mdp incorrect' };

		if (values.password === user.password) {
			// Create the session
			const expires = new Date(Date.now() + 10000 * 1000);
			const session = await encrypt({ user, expires });

			// Save the session in a cookie
			cookies().set('session', session, { expires, httpOnly: true });
			redirect('/home');
		}
	} catch (error) {
		return { error: 'Erreur lors de la requête' };
	}
}
