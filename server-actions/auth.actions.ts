'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { registerType } from '@/components/RegisterForm';
import { credentialsType, SessionType } from '@/lib/types';
import bcrypt from 'bcrypt';
import { decrypt, encrypt } from '@/lib/jwt';

export async function login(values: credentialsType) {
	try {
		const user = await prisma.user.findFirst({
			where: {
				username: values.username,
			},
		});
		if (!user) throw new Error('Incorrect credentials');

		const passwordsMatch = await bcrypt.compare(
			values.password,
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
}

export async function getAuth() {
	const session = await getSession();
	if (!session) throw new Error('Session not found or invalid');
	const user = await prisma.user.findUnique({
		where: {
			id: session.user.id,
		},
	});
	if (!user) throw new Error('Session not found or invalid');
	const { username, email } = user;
	return { username, email };
}

export async function register(values: registerType) {
	// const result = registerSchema.safeParse(values);
	// if (result.error) throw new Error('Invalid data');

	try {
		const alreadyExistingUser = await prisma.user.findFirst({
			where: {
				OR: [{ username: values.username }, { email: values.email }],
			},
		});
		if (alreadyExistingUser) throw new Error('User already exists');

		const saltRounds = Number(process.env.SALT_ROUNDS);
		const hashedPassword = await bcrypt.hash(values.password, saltRounds);

		return await prisma.user.create({
			data: {
				username: values.username,
				email: values.email,
				password: hashedPassword,
			},
		});
	} catch (error) {
		throw new Error('Cannot register the user');
	}
}

export async function logout() {
	cookies().delete('session');
}

export async function getSession() {
	const session = cookies().get('session')?.value;
	if (!session) return null;

	return (await decrypt(session)) as SessionType;
}
