import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Define Protected Routes and their required Roles
  const protectedRoutes: Record<string, string[]> = {
    '/finance': ['super_admin', 'admin'],
    '/settings': ['super_admin', 'admin', 'manager'],
  }

  // 2. Check if the current path is protected
  const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  )?.[1]

  if (requiredRoles) {
    const session = await getSession()
    
    // If no session, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Role check
    if (!requiredRoles.includes(session.role.toLowerCase())) {
      // If unauthorized, redirect to dashboard or show 403
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
