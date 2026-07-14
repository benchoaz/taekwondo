import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

// List of routes that are completely public (no token required)
const publicApiRoutes = [
  '/api/auth/login', // Mobile Flutter Login
  '/api/auth',       // NextAuth operations (uses its own security)
  '/api/files',      // File serving (handles its own sensitive directory security)
  '/api/storage',    // Profile pictures & public uploads
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Middleware only intercepts /api/ requests
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 0. Handle CORS preflight (allow all OPTIONS requests to pass)
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // 1. Allow Vercel Crons
  if (pathname.startsWith('/api/cron')) {
    return NextResponse.next();
  }

  // 2. Allow specific GET requests for Landing Page
  if (pathname === '/api/coaches' && request.method === 'GET') {
    return NextResponse.next();
  }

  // 3. Check if it falls under public allowlist
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));

  // 4. Secure all other APIs
  if (!isPublicApi) {
    // Strategy: First look for Web Cookie, then fallback to Flutter's Bearer Header
    let token = request.cookies.get('auth_token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // Reject if no valid token found in both places
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify token authenticity & expiration
      const payload = await verifyJWT(token) as { userId: string, role: string };
      
      // Inject decoded payload securely into downstream API headers
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

// Global API matcher
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
