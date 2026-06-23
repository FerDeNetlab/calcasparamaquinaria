'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) return
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (res.ok) {
                router.push('/admin/ventas')
                router.refresh()
            } else {
                setError(data.error ?? 'Error de autenticación')
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            {/* Background texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-yellow-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RASGADO%20COM%20MX%20w%20v2-pwTMy809i4tSdCEEEOcXvXlI1HdQvM.png"
                        alt="Calcas para Maquinaria"
                        width={200}
                        height={46}
                        className="h-11 w-auto"
                    />
                </div>

                {/* Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-white">Panel interno</h1>
                        <p className="text-zinc-500 text-sm mt-1">Inicia sesión con tu cuenta de Odoo</p>
                    </div>

                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Correo electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="email"
                                    placeholder="usuario@calcasparamaquinaria.mx"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    autoComplete="email"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/60 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    autoComplete="current-password"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/60 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading || !email || !password}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {loading ? 'Verificando...' : 'Entrar'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-zinc-700 text-xs mt-6">
                    Solo para personal autorizado · Calcas para Maquinaria
                </p>
            </div>
        </div>
    )
}
