import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

export async function createSession(userId: number) {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	const session = await encrypt({ userId, expiresAt });

	cookies().set('session', session, {
		httpOnly: true,
		secure: true,
		expires: expiresAt,
	});
}

export async function deleteSession() {
	cookies().delete('session');
}

type SessionPayload = {
	userId: number;
	expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(secretKey);
}

export async function decrypt(session: string | undefined = '') {
	try {
		const { payload } = await jwtVerify(session, secretKey, {
			algorithms: ['HS256'],
		});
		return payload;
	} catch (error) {
		console.log('Failed to verify session');
	}
}

export async function getSession() {
	const cookie = cookies().get('session')?.value;
	const session = await decrypt(cookie);

	return session as SessionPayload;
}
