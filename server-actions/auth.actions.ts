'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { credentialsType } from '@/components/LoginForm';
import { registerSchema, registerType } from '../components/RegisterForm';

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

type SessionType = {
	user: { id: number; name: string };
	expires: string;
	iat: number;
	exp: number;
};

export async function login(values: credentialsType) {
	try {
		const user = await prisma.user.findFirst({
			where: {
				username: values.username,
			},
		});

		if (!user || values.password !== user.password)
			throw new Error('Incorrect credentials');
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

export async function encrypt(payload: any) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('12h')
		.sign(secretKey);
}

export async function decrypt(input: string): Promise<any> {
	const { payload } = await jwtVerify(input, secretKey, {
		algorithms: ['HS256'],
	});
	return payload;
}

export async function logout() {
	// Destroy the session
	cookies().delete('session');
}

export async function getSession() {
	const session = cookies().get('session')?.value;
	if (!session) return null;
	return (await decrypt(session)) as SessionType;
}

export async function updateSession(request: NextRequest) {
	const session = request.cookies.get('session')?.value;
	if (!session) return;

	// Refresh the session so it doesn't expire
	const parsed = await decrypt(session);
	parsed.expires = new Date(Date.now() + 60 * 60 * 1000);
	const res = NextResponse.next();
	res.cookies.set({
		name: 'session',
		value: await encrypt(parsed),
		httpOnly: true,
		expires: parsed.expires,
	});
	return res;
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

		return await prisma.user.create({
			data: {
				username: values.username,
				email: values.email,
				password: values.password,
			},
		});
	} catch (error) {
		throw new Error('Cannot register the user');
	}
}
