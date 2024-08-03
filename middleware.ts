import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/auth';

export async function middleware(req: NextRequest) {
	console.log('Route Middleware', req.nextUrl.pathname);
	// return await updateSession(req);
	// const accessToken = req.cookies.get('access-token')?.value;
	// const response = NextResponse.next();

	// response.cookies.set('access-token', 'Your secret token');

	// return response;
	// You can add additional middleware logic here
}

// Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
