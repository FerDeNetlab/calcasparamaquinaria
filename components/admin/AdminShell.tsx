'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    BarChart3, FileText, Users, Package, Settings,
    LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import type { AdminUser, AdminRole } from '@/lib/admin-auth'

const MODULE_META: Record<string, { label: string; icon: React.ReactNode; href: string }> = {
    ventas:        { label: 'Ventas',        icon: <BarChart3 className="w-4 h-4" />,  href: '/admin/ventas' },
    cotizaciones:  { label: 'Cotizaciones',  icon: <FileText className="w-4 h-4" />,   href: '/admin/cotizaciones' },
    clientes:      { label: 'Clientes',      icon: <Users className="w-4 h-4" />,      href: '/admin/clientes' },
    inventario:    { label: 'Inventario',    icon: <Package className="w-4 h-4" />,    href: '/admin/inventario' },
    configuracion: { label: 'Configuración', icon: <Settings className="w-4 h-4" />,   href: '/admin/configuracion' },
}

const ROLE_LABELS: Record<AdminRole, string> = {
    admin:    'Administrador',
    gerente:  'Gerente',
    vendedor: 'Vendedor',
    almacen:  'Almacén',
}

interface Props {
    user: AdminUser
    modules: string[]
    children: React.ReactNode
}

export default function AdminShell({ user, modules, children }: Props) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' })
        router.push('/admin/login')
        router.refresh()
    }

    const navItems = modules
        .filter(m => MODULE_META[m])
        .map(m => MODULE_META[m])

    const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    return (
        <div className="min-h-screen bg-zinc-950 flex">

            {/* ── Sidebar overlay (mobile) ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside className={`
                fixed top-0 left-0 h-full w-60 bg-zinc-900 border-r border-zinc-800 z-40
                flex flex-col transition-transform duration-200
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-auto
            `}>
                {/* Logo */}
                <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                    <Link href="/admin/ventas" onClick={() => setSidebarOpen(false)}>
                        <div className="relative h-8 w-36">
                            <Image
                                src="/logo.png"
                                alt="Calcas para Maquinaria"
                                fill
                                className="object-contain object-left"
                                onError={() => {}}
                            />
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Section label */}
                <div className="px-4 pt-5 pb-2">
                    <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider">Panel</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 space-y-0.5">
                    {navItems.map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                    ${isActive
                                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
                                `}
                            >
                                <span className={isActive ? 'text-yellow-400' : 'text-zinc-500'}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {isActive && <ChevronRight className="w-3 h-3 ml-auto text-yellow-500/60" />}
                            </Link>
                        )
                    })}
                </nav>

                {/* User info + logout */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate leading-none">{user.name}</p>
                            <p className="text-zinc-500 text-xs mt-0.5">{ROLE_LABELS[user.role]}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-zinc-500 hover:text-red-400 text-xs py-1.5 transition-colors"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile topbar */}
                <header className="lg:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="relative h-7 w-32">
                        <Image
                            src="/logo.png"
                            alt="Calcas para Maquinaria"
                            fill
                            className="object-contain object-left"
                            onError={() => {}}
                        />
                    </div>
                    <div className="ml-auto w-7 h-7 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-400 text-xs font-bold">
                        {initials}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
