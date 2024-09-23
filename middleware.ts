import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/jwt';

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const unprotectedRoutes = ['/', '/login', '/register'];
	console.log('Route Middleware', pathname);

	if (!unprotectedRoutes.includes(pathname)) {
		console.log('protected route');
		// await updateSession(request);
	}

	return NextResponse.next();
}

// Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
