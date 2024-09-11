import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

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
