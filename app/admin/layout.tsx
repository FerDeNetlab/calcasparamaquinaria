import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { verifyToken, ROLE_MODULES, COOKIE_NAME, type AdminRole } from '@/lib/admin-auth'
import AdminShell from '@/components/admin/AdminShell'

export const metadata: Metadata = {
    title: 'Panel Interno · Calcas para Maquinaria',
    robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    // No token → middleware already redirects to /admin/login
    // This branch covers the login page itself (no shell needed)
    if (!token) return <>{children}</>

    const user = await verifyToken(token)
    if (!user) return <>{children}</>

    const modules = ROLE_MODULES[user.role as AdminRole] ?? []

    return (
        <AdminShell user={user} modules={modules}>
            {children}
        </AdminShell>
    )
}
