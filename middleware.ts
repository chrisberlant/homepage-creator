import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/jwt';

const publicRoutes = ['/', '/register'];
const protectedRoutes = ['/home'];

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const isProtectedRoute = protectedRoutes.includes(pathname);
	const isPublicRoute = publicRoutes.includes(pathname);
	console.log('Route Middleware', pathname);

	const session = await getSession();

	if (isProtectedRoute && !session?.userId) {
		return NextResponse.redirect(new URL('/', req.nextUrl));
	}

	if (isPublicRoute && session?.userId) {
		return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
	}

	return NextResponse.next();
}

// Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
