'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Loader2, Users, ShoppingCart,
    Target, ChevronRight, RefreshCw,
    CheckCircle2, Clock, DollarSign, ChevronDown
} from 'lucide-react'

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

// ── Constants ──────────────────────────────────────────────────────────────

const MONTHS = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
]

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
    sale:   { label: 'Confirmada', cls: 'bg-green-500/20 text-green-400' },
    draft:  { label: 'Cotización', cls: 'bg-yellow-500/20 text-yellow-400' },
    sent:   { label: 'Enviada',    cls: 'bg-blue-500/20 text-blue-400' },
    cancel: { label: 'Cancelada',  cls: 'bg-red-500/20 text-red-400' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Returns all months in a year, or the single selected month for bar chart
function getChartMonths(year: string, month: string | null): string[] {
    if (month) return [`${year}-${month}`]
    return Array.from({ length: 12 }, (_, i) =>
        `${year}-${String(i + 1).padStart(2, '0')}`
    )
}

// Available years based on known data range
function getYears(): string[] {
    const current = new Date().getFullYear()
    const years: string[] = []
    for (let y = current; y >= 2024; y--) years.push(String(y))
    return years
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function VentasPage() {
    const now = new Date()
    const currentYear = String(now.getFullYear())

    const [tab, setTab] = useState<'resumen' | 'pipeline' | 'ordenes'>('resumen')

    // Date filter state
    const [filterYear, setFilterYear] = useState(currentYear)
    const [filterMonth, setFilterMonth] = useState<string | null>(null) // null = todo el año

    const [overview, setOverview] = useState<OverviewData | null>(null)
    const [pipeline, setPipeline] = useState<PipelineData | null>(null)
    const [orders, setOrders] = useState<SaleOrder[]>([])
    const [selectedSeller, setSelectedSeller] = useState<number | null>(null)
    const [ordersMonths, setOrdersMonths] = useState(3)
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const fetchOverview = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true)
        try {
            const params = new URLSearchParams({ view: 'overview', year: filterYear })
            if (filterMonth) params.set('month', filterMonth)
            const res = await fetch(`/api/admin/crm?${params}`)
            if (res.ok) setOverview(await res.json())
        } finally { setLoading(false); setRefreshing(false) }
    }, [filterYear, filterMonth])

    const fetchPipeline = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/crm?view=pipeline')
            if (res.ok) setPipeline(await res.json())
        } finally { setLoading(false) }
    }, [])

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ view: 'orders', months: ordersMonths.toString() })
            if (selectedSeller) params.set('userId', selectedSeller.toString())
            const res = await fetch(`/api/admin/crm?${params}`)
            if (res.ok) setOrders((await res.json()).orders ?? [])
        } finally { setLoading(false) }
    }, [selectedSeller, ordersMonths])

    useEffect(() => {
        if (tab === 'resumen') fetchOverview()
        else if (tab === 'pipeline') fetchPipeline()
        else if (tab === 'ordenes') fetchOrders()
    }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

    // Re-fetch overview when date filter changes
    useEffect(() => {
        if (tab === 'resumen') fetchOverview()
    }, [filterYear, filterMonth]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (tab === 'ordenes') fetchOrders()
    }, [selectedSeller, ordersMonths]) // eslint-disable-line react-hooks/exhaustive-deps

    const periodLabel = filterMonth
        ? `${MONTHS.find(m => m.value === filterMonth)?.label} ${filterYear}`
        : `Año ${filterYear}`

    return (
        <div className="flex flex-col min-h-full">
            {/* Page header */}
            <div className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-white leading-none">Ventas</h1>
                        <p className="text-zinc-500 text-xs mt-1">Dashboard y métricas · Odoo 17</p>
                    </div>

                    {/* Date filter — only show on resumen tab */}
                    {tab === 'resumen' && (
                        <div className="flex items-center gap-2">
                            {/* Year selector */}
                            <div className="relative flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 cursor-pointer hover:border-zinc-600 transition-colors">
                                <select
                                    value={filterYear}
                                    onChange={e => setFilterYear(e.target.value)}
                                    className="bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none pr-4"
                                >
                                    {getYears().map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 w-3 h-3 text-zinc-500 pointer-events-none" />
                            </div>

                            {/* Month selector */}
                            <div className="relative flex items-center bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 cursor-pointer hover:border-zinc-600 transition-colors">
                                <select
                                    value={filterMonth ?? ''}
                                    onChange={e => setFilterMonth(e.target.value || null)}
                                    className="bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none pr-4"
                                >
                                    <option value="">Todo el año</option>
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 w-3 h-3 text-zinc-500 pointer-events-none" />
                            </div>

                            <button
                                onClick={() => fetchOverview(true)}
                                disabled={refreshing}
                                className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="px-6 flex gap-1">
                    {(['resumen', 'pipeline', 'ordenes'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                tab === t
                                    ? 'border-yellow-500 text-yellow-400'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {t === 'resumen' ? 'Resumen' : t === 'pipeline' ? 'Pipeline' : 'Órdenes'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-7 h-7 text-yellow-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        {tab === 'resumen' && overview && (
                            <ResumenTab
                                data={overview}
                                year={filterYear}
                                month={filterMonth}
                                periodLabel={periodLabel}
                            />
                        )}
                        {tab === 'pipeline' && pipeline && <PipelineTab data={pipeline} />}
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
            </div>
        </div>
    )
}

// ── Resumen Tab ────────────────────────────────────────────────────────────

function ResumenTab({ data, year, month, periodLabel }: {
    data: OverviewData
    year: string
    month: string | null
    periodLabel: string
}) {
    const chartMonths = getChartMonths(year, month)

    return (
        <div className="space-y-6">
            {/* Period label */}
            <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm">Período:</span>
                <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium px-3 py-1 rounded-full">
                    {periodLabel}
                </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<DollarSign className="w-5 h-5" />} label="Ingresos confirmados" value={fmt(data.globalRevenue)} accent="yellow" />
                <KpiCard icon={<CheckCircle2 className="w-5 h-5" />} label="Ventas confirmadas" value={data.globalConfirmed.toLocaleString()} accent="green" />
                <KpiCard icon={<Clock className="w-5 h-5" />} label="Cotizaciones abiertas" value={data.globalDraft.toLocaleString()} accent="blue" />
                <KpiCard icon={<Users className="w-5 h-5" />} label="Vendedores activos" value={data.sellers.length.toString()} accent="zinc" />
            </div>

            {/* Sellers Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="font-semibold text-sm text-white">Rendimiento por vendedor</h2>
                    <span className="text-zinc-600 text-xs">{data.totalOrders.toLocaleString()} órdenes en el período</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Vendedor</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Confirmadas</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Cotizaciones</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium hidden md:table-cell">Canceladas</th>
                                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Ingresos</th>
                                <th className="text-right px-5 py-3 text-zinc-500 font-medium">Conversión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sellers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-zinc-600 text-sm">
                                        Sin datos en este período
                                    </td>
                                </tr>
                            )}
                            {data.sellers.map((seller, i) => (
                                <tr key={seller.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                                {seller.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white leading-none">{seller.name}</p>
                                                {i === 0 && <p className="text-yellow-500 text-xs mt-0.5">Top vendedor</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-right text-green-400 font-mono font-medium">{seller.confirmed.toLocaleString()}</td>
                                    <td className="px-4 py-3.5 text-right text-yellow-400 font-mono">{(seller.draft + seller.sent).toLocaleString()}</td>
                                    <td className="px-4 py-3.5 text-right text-red-400/60 font-mono text-xs hidden md:table-cell">{seller.cancelled}</td>
                                    <td className="px-4 py-3.5 text-right text-white font-mono font-medium">{fmt(seller.totalConfirmed)}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className={`font-mono font-bold ${seller.conversionRate >= 85 ? 'text-green-400' : seller.conversionRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {seller.conversionRate.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts: one per top seller */}
            {data.sellers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.sellers.slice(0, 4).map(seller => (
                        <MonthlyChart
                            key={seller.id}
                            seller={seller}
                            months={chartMonths}
                            isMonthView={!!month}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function KpiCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
    const borderColor: Record<string, string> = { yellow: 'border-t-yellow-500', green: 'border-t-green-500', blue: 'border-t-blue-500', zinc: 'border-t-zinc-600' }
    const iconColor: Record<string, string> = { yellow: 'text-yellow-400', green: 'text-green-400', blue: 'text-blue-400', zinc: 'text-zinc-400' }
    return (
        <div className={`bg-zinc-900 border border-zinc-800 border-t-2 ${borderColor[accent]} rounded-xl p-4`}>
            <div className={`${iconColor[accent]} mb-3`}>{icon}</div>
            <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
            <p className="text-zinc-500 text-xs mt-1.5">{label}</p>
        </div>
    )
}

function MonthlyChart({ seller, months, isMonthView }: {
    seller: Seller
    months: string[]
    isMonthView: boolean
}) {
    const values = months.map(m => seller.monthlyRevenue[m] ?? 0)
    const max = Math.max(...values, 1)

    // Label: for yearly view show month abbreviation, for monthly show the month name
    const getLabel = (m: string) => {
        const [, mm] = m.split('-')
        return MONTHS.find(mo => mo.value === mm)?.label.slice(0, 3) ?? mm
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-yellow-400 shrink-0">
                    {seller.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white leading-none truncate">{seller.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        {isMonthView ? 'Ingresos del mes' : 'Ingresos por mes'}
                    </p>
                </div>
                <span className="ml-auto text-sm font-bold text-white font-mono shrink-0">
                    {fmt(values.reduce((a, b) => a + b, 0))}
                </span>
            </div>

            {isMonthView ? (
                // Month view: single big number
                <div className="flex items-center justify-center h-20">
                    <div className="text-center">
                        <p className="text-3xl font-extrabold text-yellow-400">{fmt(values[0])}</p>
                        <p className="text-zinc-600 text-xs mt-1">{getLabel(months[0])}</p>
                    </div>
                </div>
            ) : (
                // Year view: bar chart
                <div className="flex items-end gap-1 h-24">
                    {values.map((v, i) => {
                        const isCurrentMonth = months[i] === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
                        const height = Math.max(v > 0 ? 6 : 2, Math.round((v / max) * 100))
                        return (
                            <div key={months[i]} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex flex-col justify-end" style={{ height: 88 }}>
                                    <div
                                        className={`w-full rounded-t transition-all ${isCurrentMonth ? 'bg-yellow-500' : v > 0 ? 'bg-zinc-600' : 'bg-zinc-800'}`}
                                        style={{ height: `${height}%` }}
                                        title={fmt(v)}
                                    />
                                </div>
                                <span className="text-zinc-600 text-[10px]">{getLabel(months[i])}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ── Pipeline Tab ───────────────────────────────────────────────────────────

function PipelineTab({ data }: { data: PipelineData }) {
    const [expandedStage, setExpandedStage] = useState<number | null>(null)

    return (
        <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Target className="w-4 h-4 text-yellow-500" />
                    <h2 className="text-sm font-semibold text-white">Pipeline activo</h2>
                    <span className="text-zinc-500 text-xs ml-auto">{data.totalLeads} oportunidades</span>
                </div>
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                    {data.pipeline.filter(s => s.count > 0).map(stage => (
                        <div key={stage.id} className={STAGE_DOT[stage.name] ?? 'bg-zinc-600'} style={{ flex: stage.count }} title={`${stage.name}: ${stage.count}`} />
                    ))}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                    {data.pipeline.filter(s => s.count > 0).map(stage => (
                        <div key={stage.id} className="flex items-center gap-1.5 text-xs">
                            <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage.name] ?? 'bg-zinc-600'}`} />
                            <span className="text-zinc-400">{stage.name}</span>
                            <span className="text-zinc-600">({stage.count})</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid gap-2">
                {data.pipeline.map(stage => (
                    <div key={stage.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage.name] ?? 'bg-zinc-600'}`} />
                                <span className="font-medium text-sm text-white">{stage.name}</span>
                                {stage.is_won && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">Ganados</span>}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-zinc-400 text-sm font-mono">{fmt(stage.totalRevenue)}</span>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[stage.name] ?? 'bg-zinc-800 text-zinc-300'}`}>{stage.count}</span>
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
                                            <tr key={lead.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                                                <td className="px-5 py-2.5 text-zinc-300">{lead.partner}</td>
                                                <td className="px-4 py-2.5 text-zinc-500 hidden md:table-cell">{lead.seller}</td>
                                                <td className="px-5 py-2.5 text-right text-zinc-400 font-mono">{fmt(lead.revenue)}</td>
                                            </tr>
                                        ))}
                                        {stage.leads.length > 20 && (
                                            <tr><td colSpan={3} className="px-5 py-2 text-zinc-600 text-center">+{stage.leads.length - 20} más</td></tr>
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
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <select
                        value={selectedSeller ?? ''}
                        onChange={e => onSelectSeller(e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                    >
                        <option value="">Todos los vendedores</option>
                        {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                                        <td className="px-4 py-3 text-zinc-400 hidden md:table-cell max-w-[180px] truncate">{order.partner_id ? order.partner_id[1] : '—'}</td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">{order.user_id ? order.user_id[1] : '—'}</td>
                                        <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">{fmtDate(order.date_order)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono">
                                            <span className={order.state === 'sale' ? 'text-white font-semibold' : 'text-zinc-500'}>{fmt(order.amount_total)}</span>
                                        </td>
                                    </tr>
                                )
                            })}
                            {orders.length === 0 && (
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-zinc-600">No hay órdenes en el período seleccionado</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
