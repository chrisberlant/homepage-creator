'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { loginFormType } from '../components/LoginForm';

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

type SessionType = {
	user: { id: number; name: string };
	expires: string;
	iat: number;
	exp: number;
};
export async function login(values: loginFormType) {
	try {
		const user = await prisma.user.findFirst({
			where: {
				name: values.username,
			},
		});
		if (!user || values.password !== user.password)
			return { error: 'Username or password incorrect' };

		if (values.password === user.password) {
			// Create the session
			const expires = new Date(Date.now() + 60 * 60 * 1000);
			const { id, name } = user;
			const session = await encrypt({ user: { id, name }, expires });
			// Save the session in a cookie
			cookies().set('session', session, { expires, httpOnly: true });
		}
	} catch (error) {
		throw error;
	}
	redirect('/home');
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
