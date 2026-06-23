import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

// List of routes that require authentication
const protectedApiRoutes = [
  '/api/users',
  '/api/coaches',
  '/api/ukt/candidates',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

  // Allow public access to GET /api/coaches for the Landing Page
  if (pathname === '/api/coaches' && request.method === 'GET') {
    return NextResponse.next();
  }

  if (isProtectedApi) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const payload = await verifyJWT(token) as { userId: string, role: string };
      
      // We can pass user info to headers if needed by downstream APIs
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// Configure matcher to only run middleware on specific paths
export const config = {
  matcher: [
    '/api/users/:path*',
    '/api/coaches/:path*',
    '/api/ukt/candidates/:path*',
  ],
};
