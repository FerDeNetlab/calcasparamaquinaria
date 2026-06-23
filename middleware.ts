import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Only guard /admin routes (except /admin/login)
    if (!pathname.startsWith('/admin')) return NextResponse.next()
    if (pathname === '/admin/login') return NextResponse.next()

    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const user = await verifyToken(token)
    if (!user) {
        const res = NextResponse.redirect(new URL('/admin/login', req.url))
        res.cookies.delete(COOKIE_NAME)
        return res
    }

    // Inject user info into headers for server components
    const res = NextResponse.next()
    res.headers.set('x-admin-uid', String(user.uid))
    res.headers.set('x-admin-role', user.role)
    res.headers.set('x-admin-name', user.name)
    return res
}

export const config = {
    matcher: ['/admin/:path*'],
}
