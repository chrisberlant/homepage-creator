import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SessionType } from './types';

export const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

export async function getSession() {
	const session = cookies().get('session')?.value;
	if (!session) return null;

	return (await decrypt(session)) as SessionType;
}

export async function encrypt(payload: any) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('12h')
		.sign(secretKey);
}

export async function decrypt(input: string): Promise<any> {
	try {
		const { payload } = await jwtVerify(input, secretKey, {
			algorithms: ['HS256'],
		});
		return payload;
	} catch (error) {
		return null;
	}
}

export async function updateSession(request: NextRequest) {
	try {
		const session = request.cookies.get('session')?.value;
		if (!session) return NextResponse.redirect(new URL('/', request.url));

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
	} catch (error) {
		const res = NextResponse.redirect(new URL('/', request.url));
		res.cookies.delete('session');

		return res;
	}
}
