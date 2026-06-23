'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    LogIn, LogOut, Loader2, TrendingUp, Users, ShoppingCart,
    BarChart3, Target, ChevronRight, RefreshCw, ArrowLeft,
    CheckCircle2, Clock, XCircle, DollarSign
} from 'lucide-react'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────

interface Seller {
    id: number
    name: string
    confirmed: number
    draft: number
    cancelled: number
    sent: number
    totalConfirmed: number
    totalDraft: number
    conversionRate: number
    monthlyRevenue: Record<string, number>
}

interface OverviewData {
    globalConfirmed: number
    globalDraft: number
    globalRevenue: number
    totalOrders: number
    sellers: Seller[]
}

interface PipelineLead {
    id: number
    name: string
    partner: string
    seller: string
    revenue: number
    probability: number
    deadline: string | null
}

interface PipelineStage {
    id: number
    name: string
    sequence: number
    is_won: boolean
    count: number
    totalRevenue: number
    leads: PipelineLead[]
}

interface PipelineData {
    pipeline: PipelineStage[]
    totalLeads: number
}

interface SaleOrder {
    id: number
    name: string
    state: string
    user_id: [number, string] | false
    partner_id: [number, string] | false
    amount_total: number
    date_order: string
    invoice_status: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getLast6Months(): string[] {
    const months: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    return months
}

const STAGE_COLORS: Record<string, string> = {
    'PERFILANDO': 'bg-zinc-700 text-zinc-300',
    'COTIZACIÓN': 'bg-blue-500/20 text-blue-300',
    'SEGUIMIENTO DE COTIZACIÓN': 'bg-yellow-500/20 text-yellow-300',
    'PAGO': 'bg-orange-500/20 text-orange-300',
    'PROCESO DE ENTREGA': 'bg-amber-500/20 text-amber-300',
    'POST-VENTA': 'bg-green-500/20 text-green-300',
    'FINALIZADO': 'bg-emerald-500/20 text-emerald-400',
    'PERDIDOS': 'bg-red-500/20 text-red-400',
}

const STAGE_DOT: Record<string, string> = {
    'PERFILANDO': 'bg-zinc-500',
    'COTIZACIÓN': 'bg-blue-400',
    'SEGUIMIENTO DE COTIZACIÓN': 'bg-yellow-400',
    'PAGO': 'bg-orange-400',
    'PROCESO DE ENTREGA': 'bg-amber-400',
    'POST-VENTA': 'bg-green-400',
    'FINALIZADO': 'bg-emerald-400',
    'PERDIDOS': 'bg-red-500',
}

const STATE_BADGE: Record<string, { label: string; cls: string }> = {
    sale: { label: 'Confirmada', cls: 'bg-green-500/20 text-green-400' },
    draft: { label: 'Cotización', cls: 'bg-yellow-500/20 text-yellow-400' },
    sent: { label: 'Enviada', cls: 'bg-blue-500/20 text-blue-400' },
    cancel: { label: 'Cancelada', cls: 'bg-red-500/20 text-red-400' },
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CrmPage() {
    const [password, setPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authError, setAuthError] = useState('')

    const [tab, setTab] = useState<'resumen' | 'pipeline' | 'ordenes'>('resumen')
    const [overview, setOverview] = useState<OverviewData | null>(null)
    const [pipeline, setPipeline] = useState<PipelineData | null>(null)
    const [orders, setOrders] = useState<SaleOrder[]>([])
    const [selectedSeller, setSelectedSeller] = useState<number | null>(null)
    const [ordersMonths, setOrdersMonths] = useState(3)

    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const headers = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`,
    }), [password])

    const fetchOverview = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        else setRefreshing(true)
        try {
            const res = await fetch('/api/admin/crm?view=overview', { headers: headers() })
            if (res.status === 401) { setIsAuthenticated(false); return }
            setOverview(await res.json())
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [headers])

    const fetchPipeline = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/crm?view=pipeline', { headers: headers() })
            if (res.status === 401) { setIsAuthenticated(false); return }
            setPipeline(await res.json())
        } finally {
            setLoading(false)
        }
    }, [headers])

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ view: 'orders', months: ordersMonths.toString() })
            if (selectedSeller) params.set('userId', selectedSeller.toString())
            const res = await fetch(`/api/admin/crm?${params}`, { headers: headers() })
            if (res.status === 401) { setIsAuthenticated(false); return }
            const data = await res.json()
            setOrders(data.orders ?? [])
        } finally {
            setLoading(false)
        }
    }, [headers, selectedSeller, ordersMonths])

    useEffect(() => {
        if (!isAuthenticated) return
        if (tab === 'resumen') fetchOverview()
        else if (tab === 'pipeline') fetchPipeline()
        else if (tab === 'ordenes') fetchOrders()
    }, [isAuthenticated, tab]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isAuthenticated && tab === 'ordenes') fetchOrders()
    }, [selectedSeller, ordersMonths]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleLogin = async () => {
        setAuthError('')
        try {
            const res = await fetch('/api/admin/crm?view=overview', {
                headers: { 'Authorization': `Bearer ${password}`, 'Content-Type': 'application/json' },
            })
            if (res.ok) setIsAuthenticated(true)
            else setAuthError('Contraseña incorrecta')
        } catch {
            setAuthError('Error de conexión')
        }
    }

    // ── Login Screen ──────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h1 className="text-xl font-bold text-white">CRM · Ventas</h1>
                        <p className="text-zinc-400 text-sm mt-1">Calcas para Maquinaria</p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
                        />
                        {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
                        <button
                            onClick={handleLogin}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg py-3 transition-colors"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Dashboard ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-zinc-950 text-white">

            {/* Header */}
            <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Productos
                        </Link>
                        <ChevronRight className="w-4 h-4 text-zinc-700" />
                        <div>
                            <h1 className="text-lg font-bold leading-none">CRM · Ventas</h1>
                            <p className="text-zinc-400 text-xs mt-0.5">Métricas por vendedor · Odoo 17</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fetchOverview(true)}
                            disabled={refreshing}
                            className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Actualizar</span>
                        </button>
                        <button
                            onClick={() => { setIsAuthenticated(false); setPassword('') }}
                            className="flex items-center gap-2 text-zinc-400 hover:text-red-400 text-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
                    {(['resumen', 'pipeline', 'ordenes'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t
                                ? 'border-yellow-500 text-yellow-400'
                                : 'border-transparent text-zinc-400 hover:text-white'}`}
                        >
                            {t === 'resumen' ? 'Resumen' : t === 'pipeline' ? 'Pipeline CRM' : 'Órdenes'}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ── RESUMEN ── */}
                        {tab === 'resumen' && overview && (
                            <ResumenTab data={overview} />
                        )}

                        {/* ── PIPELINE ── */}
                        {tab === 'pipeline' && pipeline && (
                            <PipelineTab data={pipeline} />
                        )}

                        {/* ── ÓRDENES ── */}
                        {tab === 'ordenes' && (
                            <OrdenesTab
                                orders={orders}
                                sellers={overview?.sellers ?? []}
                                selectedSeller={selectedSeller}
                                onSelectSeller={setSelectedSeller}
                                months={ordersMonths}
                                onChangeMonths={setOrdersMonths}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

// ── Resumen Tab ────────────────────────────────────────────────────────────

function ResumenTab({ data }: { data: OverviewData }) {
    const months = getLast6Months()
    const topSeller = data.sellers[0]

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Ingresos totales"
                    value={fmt(data.globalRevenue)}
                    accent="yellow"
                />
                <KpiCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    label="Ventas confirmadas"
                    value={data.globalConfirmed.toLocaleString()}
                    accent="green"
                />
                <KpiCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Cotizaciones abiertas"
                    value={data.globalDraft.toLocaleString()}
                    accent="blue"
                />
                <KpiCard
                    icon={<Users className="w-5 h-5" />}
                    label="Vendedores activos"
                    value={data.sellers.length.toString()}
                    accent="zinc"
                />
            </div>

            {/* Sellers Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="font-semibold text-sm">Rendimiento por vendedor</h2>
                    <span className="text-zinc-500 text-xs">{data.totalOrders.toLocaleString()} órdenes totales</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Vendedor</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Confirmadas</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Cotizaciones</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Canceladas</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Ingresos</th>
                                <th className="text-right px-5 py-3 text-zinc-500 font-medium">Conversión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sellers.map((seller, i) => (
                                <tr key={seller.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {seller.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white leading-none">{seller.name}</p>
                                                {i === 0 && <p className="text-yellow-400 text-xs mt-0.5">Top vendedor</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <span className="text-green-400 font-mono font-medium">{seller.confirmed.toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <span className="text-yellow-400 font-mono">{(seller.draft + seller.sent).toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <span className="text-red-400/70 font-mono text-xs">{seller.cancelled}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <span className="text-white font-mono font-medium">{fmt(seller.totalConfirmed)}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <ConversionBadge rate={seller.conversionRate} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            {topSeller && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.sellers.slice(0, 2).map(seller => (
                        <MonthlyChart key={seller.id} seller={seller} months={months} />
                    ))}
                </div>
            )}
        </div>
    )
}

function KpiCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
    const accents: Record<string, string> = {
        yellow: 'border-t-yellow-500 text-yellow-400',
        green: 'border-t-green-500 text-green-400',
        blue: 'border-t-blue-500 text-blue-400',
        zinc: 'border-t-zinc-600 text-zinc-400',
    }
    const iconColor = accents[accent] ?? accents.zinc

    return (
        <div className={`bg-zinc-900 border border-zinc-800 border-t-2 ${iconColor.split(' ')[0]} rounded-xl p-4`}>
            <div className={`${iconColor.split(' ')[1]} mb-3`}>{icon}</div>
            <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
            <p className="text-zinc-500 text-xs mt-1.5">{label}</p>
        </div>
    )
}

function ConversionBadge({ rate }: { rate: number }) {
    const cls = rate >= 85 ? 'text-green-400' : rate >= 60 ? 'text-yellow-400' : 'text-red-400'
    return <span className={`font-mono font-bold ${cls}`}>{rate.toFixed(1)}%</span>
}

function MonthlyChart({ seller, months }: { seller: Seller; months: string[] }) {
    const values = months.map(m => seller.monthlyRevenue[m] ?? 0)
    const max = Math.max(...values, 1)

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-yellow-400">
                    {seller.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                    <p className="text-sm font-semibold text-white leading-none">{seller.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Ingresos últimos 6 meses</p>
                </div>
            </div>
            <div className="flex items-end gap-1.5 h-28">
                {values.map((v, i) => {
                    const isLast = i === values.length - 1
                    const height = Math.max(4, Math.round((v / max) * 100))
                    const monthLabel = months[i].slice(5)
                    return (
                        <div key={months[i]} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex flex-col justify-end" style={{ height: '96px' }}>
                                <div
                                    className={`w-full rounded-t ${isLast ? 'bg-yellow-500' : 'bg-zinc-700'} transition-all`}
                                    style={{ height: `${height}%` }}
                                    title={fmt(v)}
                                />
                            </div>
                            <span className="text-zinc-600 text-xs">{monthLabel}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ── Pipeline Tab ───────────────────────────────────────────────────────────

function PipelineTab({ data }: { data: PipelineData }) {
    const [expandedStage, setExpandedStage] = useState<number | null>(null)

    return (
        <div className="space-y-4">
            {/* Summary strip */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Target className="w-4 h-4 text-yellow-500" />
                    <h2 className="text-sm font-semibold">Pipeline activo</h2>
                    <span className="text-zinc-500 text-xs ml-auto">{data.totalLeads} oportunidades</span>
                </div>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    {data.pipeline.filter(s => s.count > 0).map(stage => (
                        <div
                            key={stage.id}
                            className={`${STAGE_DOT[stage.name] ?? 'bg-zinc-600'}`}
                            style={{ flex: stage.count }}
                            title={`${stage.name}: ${stage.count}`}
                        />
                    ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                    {data.pipeline.filter(s => s.count > 0).map(stage => (
                        <div key={stage.id} className="flex items-center gap-1.5 text-xs">
                            <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage.name] ?? 'bg-zinc-600'}`} />
                            <span className="text-zinc-400">{stage.name}</span>
                            <span className="text-zinc-600">({stage.count})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stage cards */}
            <div className="grid gap-3">
                {data.pipeline.map(stage => (
                    <div key={stage.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${STAGE_DOT[stage.name] ?? 'bg-zinc-600'}`} />
                                <span className="font-medium text-sm">{stage.name}</span>
                                {stage.is_won && (
                                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">Ganados</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-zinc-400 text-sm font-mono">{fmt(stage.totalRevenue)}</span>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[stage.name] ?? 'bg-zinc-800 text-zinc-300'}`}>
                                    {stage.count}
                                </span>
                                <ChevronRight className={`w-4 h-4 text-zinc-600 transition-transform ${expandedStage === stage.id ? 'rotate-90' : ''}`} />
                            </div>
                        </button>

                        {expandedStage === stage.id && stage.leads.length > 0 && (
                            <div className="border-t border-zinc-800">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-zinc-800/60">
                                            <th className="text-left px-5 py-2.5 text-zinc-600 font-medium">Cliente</th>
                                            <th className="text-left px-4 py-2.5 text-zinc-600 font-medium hidden md:table-cell">Vendedor</th>
                                            <th className="text-right px-5 py-2.5 text-zinc-600 font-medium">Ingreso est.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stage.leads.slice(0, 20).map(lead => (
                                            <tr key={lead.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                                                <td className="px-5 py-2.5 text-zinc-300">{lead.partner}</td>
                                                <td className="px-4 py-2.5 text-zinc-500 hidden md:table-cell">{lead.seller}</td>
                                                <td className="px-5 py-2.5 text-right text-zinc-400 font-mono">{fmt(lead.revenue)}</td>
                                            </tr>
                                        ))}
                                        {stage.leads.length > 20 && (
                                            <tr>
                                                <td colSpan={3} className="px-5 py-2 text-zinc-600 text-center">
                                                    +{stage.leads.length - 20} más
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Órdenes Tab ────────────────────────────────────────────────────────────

function OrdenesTab({
    orders, sellers, selectedSeller, onSelectSeller, months, onChangeMonths
}: {
    orders: SaleOrder[]
    sellers: Seller[]
    selectedSeller: number | null
    onSelectSeller: (id: number | null) => void
    months: number
    onChangeMonths: (m: number) => void
}) {
    const totalShown = orders.reduce((s, o) => s + (o.state === 'sale' ? o.amount_total : 0), 0)

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <select
                        value={selectedSeller ?? ''}
                        onChange={e => onSelectSeller(e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                    >
                        <option value="">Todos los vendedores</option>
                        {sellers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <ShoppingCart className="w-4 h-4 text-zinc-500" />
                    <select
                        value={months}
                        onChange={e => onChangeMonths(parseInt(e.target.value))}
                        className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                    >
                        <option value={1}>Último mes</option>
                        <option value={3}>Últimos 3 meses</option>
                        <option value={6}>Últimos 6 meses</option>
                        <option value={12}>Último año</option>
                        <option value={36}>Últimos 3 años</option>
                    </select>
                </div>

                <div className="ml-auto flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">{orders.length} órdenes</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-green-400 font-mono font-medium">{fmt(totalShown)}</span>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Orden</th>
                                <th className="text-left px-4 py-3 text-zinc-500 font-medium hidden md:table-cell">Cliente</th>
                                <th className="text-left px-4 py-3 text-zinc-500 font-medium hidden lg:table-cell">Vendedor</th>
                                <th className="text-left px-4 py-3 text-zinc-500 font-medium hidden sm:table-cell">Fecha</th>
                                <th className="text-center px-4 py-3 text-zinc-500 font-medium">Estado</th>
                                <th className="text-right px-5 py-3 text-zinc-500 font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const badge = STATE_BADGE[order.state] ?? { label: order.state, cls: 'bg-zinc-800 text-zinc-400' }
                                return (
                                    <tr key={order.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-5 py-3 font-mono text-zinc-300 font-medium">{order.name}</td>
                                        <td className="px-4 py-3 text-zinc-400 hidden md:table-cell max-w-[180px] truncate">
                                            {order.partner_id ? order.partner_id[1] : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">
                                            {order.user_id ? order.user_id[1] : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                                            {fmtDate(order.date_order)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono">
                                            <span className={order.state === 'sale' ? 'text-white font-semibold' : 'text-zinc-500'}>
                                                {fmt(order.amount_total)}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-600">
                                        No hay órdenes en el período seleccionado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
