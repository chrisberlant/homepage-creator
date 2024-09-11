import { NextRequest } from 'next/server';
import { updateSession } from './lib/jwt';

export async function middleware(request: NextRequest) {
	console.log('Route Middleware', request.nextUrl.pathname);
	return await updateSession(request);
}

// Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
