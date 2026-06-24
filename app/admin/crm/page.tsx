'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
    ChevronLeft, ChevronRight, Loader2, RefreshCw,
    Star, AlertCircle, CheckCircle2, Clock, Filter,
    ChevronDown, Trophy, Skull, DollarSign
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface Stage {
    id: number
    name: string
    sequence: number
    is_won: boolean
    fold: boolean
    requirements: string | false
}

interface Lead {
    id: number
    name: string
    partner_id: [number, string] | false
    user_id: [number, string] | false
    stage_id: [number, string] | false
    expected_revenue: number
    priority: '0' | '1' | '2' | '3'
    kanban_state: 'grey' | 'red' | 'green'
    date_deadline: string | false
    probability: number
    publim_time_status: 'green' | 'yellow' | 'red' | 'grey' | false
    publim_sale_amount_total: number
    publim_invoice_paid: boolean
    tag_ids: number[]
    date_last_stage_update: string | false
}

interface SalesUser { id: number; name: string }

interface PipelineData {
    stages: Stage[]
    leads: Lead[]
    salesUsers: SalesUser[]
    currentUid: number
    role: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
    return `$${n.toFixed(0)}`
}

function daysSince(dateStr: string | false): number {
    if (!dateStr) return 0
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function isOverdue(dateStr: string | false): boolean {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TimeChip({ status }: { status: Lead['publim_time_status'] }) {
    if (!status || status === 'grey') return null
    const cfg = {
        green:  { cls: 'bg-green-500/15 text-green-400 border-green-500/20',   label: 'A tiempo' },
        yellow: { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', label: 'Advertencia' },
        red:    { cls: 'bg-red-500/15 text-red-400 border-red-500/20',          label: 'Fuera de tiempo' },
    }[status]
    return (
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${cfg.cls}`}>
            {cfg.label}
        </span>
    )
}

function PriorityStars({ priority }: { priority: Lead['priority'] }) {
    const n = parseInt(priority)
    if (n === 0) return null
    return (
        <span className="flex gap-0.5">
            {[1, 2, 3].map(i => (
                <Star key={i} className={`w-3 h-3 ${i <= n ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`} />
            ))}
        </span>
    )
}

interface CardProps {
    lead: Lead
    onMoveLeft:  (() => void) | null
    onMoveRight: (() => void) | null
    isDragging: boolean
    onDragStart: (e: React.DragEvent) => void
    onDragEnd:   (e: React.DragEvent) => void
}

function KanbanCard({ lead, onMoveLeft, onMoveRight, isDragging, onDragStart, onDragEnd }: CardProps) {
    const customerName = lead.partner_id ? lead.partner_id[1] : lead.name
    const revenue      = lead.publim_sale_amount_total > 0 ? lead.publim_sale_amount_total : lead.expected_revenue
    const days         = daysSince(lead.date_last_stage_update)
    const overdue      = isOverdue(lead.date_deadline)

    const kanbanDot = { grey: 'bg-zinc-600', red: 'bg-red-500', green: 'bg-green-500' }[lead.kanban_state]

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className={`
                bg-zinc-800 border border-zinc-700 rounded-xl p-3 cursor-grab active:cursor-grabbing
                hover:border-zinc-600 transition-all select-none
                ${isDragging ? 'opacity-40 scale-95 rotate-1' : ''}
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${kanbanDot}`} />
                    <p className="text-white text-xs font-semibold leading-tight truncate">{customerName}</p>
                </div>
                <PriorityStars priority={lead.priority} />
            </div>

            {/* Revenue */}
            {revenue > 0 && (
                <div className="flex items-center gap-1 mb-2">
                    <DollarSign className="w-3 h-3 text-zinc-500" />
                    <span className="text-green-400 text-xs font-mono font-medium">{fmt(revenue)}</span>
                    {lead.publim_invoice_paid && (
                        <CheckCircle2 className="w-3 h-3 text-green-500 ml-1" />
                    )}
                </div>
            )}

            {/* Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <TimeChip status={lead.publim_time_status} />
                {overdue && (
                    <span className="flex items-center gap-0.5 text-[10px] text-red-400">
                        <AlertCircle className="w-3 h-3" /> Vencida
                    </span>
                )}
                {days > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-zinc-600">
                        <Clock className="w-3 h-3" /> {days}d en etapa
                    </span>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1.5 border-t border-zinc-700/50">
                <span className="text-zinc-600 font-mono text-[10px]">#{lead.id}</span>
                <div className="flex gap-1">
                    {onMoveLeft && (
                        <button
                            onClick={e => { e.stopPropagation(); onMoveLeft() }}
                            className="p-1 rounded bg-zinc-700/50 hover:bg-zinc-600 transition-colors text-zinc-400 hover:text-white"
                            title="Etapa anterior"
                        >
                            <ChevronLeft className="w-3 h-3" />
                        </button>
                    )}
                    {onMoveRight && (
                        <button
                            onClick={e => { e.stopPropagation(); onMoveRight() }}
                            className="p-1 rounded bg-zinc-700/50 hover:bg-zinc-600 transition-colors text-zinc-400 hover:text-white"
                            title="Siguiente etapa"
                        >
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── KanbanColumn ───────────────────────────────────────────────────────────

interface ColumnProps {
    stage:          Stage
    leads:          Lead[]
    allStages:      Stage[]
    onMove:         (leadId: number, stageId: number) => void
    dragOverStageId: number | null
    onDragOver:     (e: React.DragEvent, stageId: number) => void
    onDragLeave:    () => void
    onDrop:         (e: React.DragEvent, stageId: number) => void
    draggingLeadId: number | null
    onDragStart:    (e: React.DragEvent, leadId: number) => void
    onDragEnd:      () => void
}

function KanbanColumn({ stage, leads, allStages, onMove, dragOverStageId, onDragOver, onDragLeave, onDrop, draggingLeadId, onDragStart, onDragEnd }: ColumnProps) {
    const stageIdx   = allStages.findIndex(s => s.id === stage.id)
    const totalRev   = leads.reduce((s, l) => s + (l.publim_sale_amount_total > 0 ? l.publim_sale_amount_total : l.expected_revenue), 0)
    const isDragOver = dragOverStageId === stage.id

    const isLost = stage.id === 19

    const headerCls = stage.is_won
        ? 'border-green-500/40 bg-green-500/8'
        : isLost
        ? 'border-red-500/40 bg-red-500/8'
        : 'border-zinc-700 bg-zinc-900'

    const countCls = stage.is_won
        ? 'bg-green-500/15 text-green-400'
        : isLost
        ? 'bg-red-500/15 text-red-400'
        : 'bg-zinc-800 text-zinc-400'

    return (
        <div className="flex flex-col w-60 shrink-0">
            {/* Header */}
            <div className={`border border-b-0 rounded-t-xl px-3 py-2.5 ${headerCls}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {stage.is_won && <Trophy className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                        {isLost && <Skull className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        <h3 className="text-[11px] font-bold text-white uppercase tracking-wider truncate">{stage.name}</h3>
                    </div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${countCls}`}>{leads.length}</span>
                </div>
                {totalRev > 0 && (
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">{fmt(totalRev)}</p>
                )}
            </div>

            {/* Cards drop zone */}
            <div
                onDragOver={e => onDragOver(e, stage.id)}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, stage.id)}
                className={`
                    flex-1 rounded-b-xl border border-t-0 p-2 space-y-2 min-h-[100px] overflow-y-auto max-h-[calc(100vh-200px)] transition-colors
                    ${isDragOver
                        ? 'border-yellow-500/50 bg-yellow-500/5'
                        : stage.is_won
                        ? 'border-green-500/30 bg-green-500/3'
                        : isLost
                        ? 'border-red-500/30 bg-red-500/3'
                        : 'border-zinc-700 bg-zinc-900/40'}
                `}
            >
                {leads.map(lead => {
                    const prevStage = stageIdx > 0 ? allStages[stageIdx - 1] : null
                    const nextStage = stageIdx < allStages.length - 1 ? allStages[stageIdx + 1] : null
                    return (
                        <KanbanCard
                            key={lead.id}
                            lead={lead}
                            isDragging={draggingLeadId === lead.id}
                            onDragStart={e => onDragStart(e, lead.id)}
                            onDragEnd={onDragEnd}
                            onMoveLeft={prevStage  ? () => onMove(lead.id, prevStage.id)  : null}
                            onMoveRight={nextStage ? () => onMove(lead.id, nextStage.id) : null}
                        />
                    )
                })}
                {leads.length === 0 && (
                    <div className="flex items-center justify-center h-16 text-zinc-700 text-xs select-none">
                        Sin oportunidades
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function CotizacionesPage() {
    const [data, setData]                 = useState<PipelineData | null>(null)
    const [loading, setLoading]           = useState(true)
    const [selectedUser, setSelectedUser] = useState<string>('all')
    const [showLost, setShowLost]         = useState(false)
    const [draggingLeadId, setDraggingLeadId]   = useState<number | null>(null)
    const [dragOverStageId, setDragOverStageId] = useState<number | null>(null)
    const [movingLeadId, setMovingLeadId] = useState<number | null>(null)
    const [userDropdown, setUserDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchPipeline = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedUser !== 'all') params.set('userId', selectedUser)
            if (showLost) params.set('lost', 'true')
            const res = await fetch(`/api/admin/pipeline?${params}`)
            if (!res.ok) return
            const json: PipelineData = await res.json()
            // Default: non-admin sees only their own — already filtered by API
            setData(json)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [selectedUser, showLost])

    useEffect(() => { fetchPipeline() }, [fetchPipeline])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setUserDropdown(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const moveLeadToStage = async (leadId: number, stageId: number) => {
        if (!data) return
        setMovingLeadId(leadId)
        // Optimistic update
        setData(prev => prev ? {
            ...prev,
            leads: prev.leads.map(l => l.id === leadId
                ? { ...l, stage_id: [stageId, prev.stages.find(s => s.id === stageId)?.name ?? ''] as [number, string] }
                : l
            ),
        } : null)
        try {
            const res = await fetch('/api/admin/pipeline', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, stageId }),
            })
            if (!res.ok) fetchPipeline()
        } catch {
            fetchPipeline()
        } finally {
            setMovingLeadId(null)
        }
    }

    const handleDragStart = (e: React.DragEvent, leadId: number) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('leadId', String(leadId))
        setDraggingLeadId(leadId)
    }
    const handleDragEnd   = () => { setDraggingLeadId(null); setDragOverStageId(null) }
    const handleDragOver  = (e: React.DragEvent, stageId: number) => { e.preventDefault(); setDragOverStageId(stageId) }
    const handleDragLeave = () => setDragOverStageId(null)
    const handleDrop      = (e: React.DragEvent, stageId: number) => {
        e.preventDefault()
        const leadId = parseInt(e.dataTransfer.getData('leadId'))
        if (!isNaN(leadId)) moveLeadToStage(leadId, stageId)
        setDragOverStageId(null)
        setDraggingLeadId(null)
    }

    const leadsByStage = (stageId: number) =>
        data?.leads.filter(l => l.stage_id && l.stage_id[0] === stageId) ?? []

    const totalActive  = data?.leads.length ?? 0
    const totalRevenue = data?.leads.reduce((s, l) => s + (l.publim_sale_amount_total > 0 ? l.publim_sale_amount_total : l.expected_revenue), 0) ?? 0

    const isAdmin          = data?.role === 'admin'
    const selectedUserName = selectedUser === 'all'
        ? 'Todos los vendedores'
        : data?.salesUsers.find(u => String(u.id) === selectedUser)?.name ?? 'Vendedor'

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-20">
                <div className="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-lg font-bold text-white leading-none">Pipeline CRM</h1>
                        <p className="text-zinc-500 text-xs mt-0.5">
                            {totalActive} oportunidades ·{' '}
                            <span className="text-green-400 font-mono">{fmt(totalRevenue)}</span> en pipeline
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* User filter (admin only) */}
                        {isAdmin && data && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setUserDropdown(v => !v)}
                                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white transition-colors"
                                >
                                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                                    <span className="max-w-[140px] truncate">{selectedUserName}</span>
                                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                                </button>
                                {userDropdown && (
                                    <div className="absolute right-0 mt-1 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-30 py-1">
                                        {[
                                            { id: 'all', name: 'Todos los vendedores' },
                                            ...data.salesUsers.map(u => ({ id: String(u.id), name: u.name })),
                                        ].map(u => (
                                            <button
                                                key={u.id}
                                                onClick={() => { setSelectedUser(u.id); setUserDropdown(false) }}
                                                className={`w-full text-left px-3 py-2 text-xs transition-colors ${selectedUser === u.id ? 'bg-yellow-500/10 text-yellow-400' : 'text-zinc-300 hover:bg-zinc-700'}`}
                                            >
                                                {u.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Lost toggle */}
                        <button
                            onClick={() => setShowLost(v => !v)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs border transition-colors ${showLost ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                        >
                            <Skull className="w-3.5 h-3.5" /> Perdidos
                        </button>

                        {/* Refresh */}
                        <button
                            onClick={fetchPipeline}
                            disabled={loading}
                            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Cargando…' : 'Actualizar'}
                        </button>

                        {movingLeadId && (
                            <span className="flex items-center gap-1.5 text-yellow-400 text-xs">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Board */}
            {loading && !data ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-3 p-4 h-full items-start min-w-max">
                        {data?.stages.map(stage => (
                            <KanbanColumn
                                key={stage.id}
                                stage={stage}
                                leads={leadsByStage(stage.id)}
                                allStages={data.stages}
                                onMove={moveLeadToStage}
                                dragOverStageId={dragOverStageId}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                draggingLeadId={draggingLeadId}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
