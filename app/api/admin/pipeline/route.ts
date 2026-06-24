import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'

const ODOO_URL     = process.env.ODOO_URL!
const ODOO_DB      = process.env.ODOO_DB!
const ODOO_UID     = 2
const ODOO_API_KEY = process.env.ODOO_API_KEY!

// ── In-memory cache (server-side) ──────────────────────────────────────────
// Avoids hammering Odoo on every page load.
// Leads: 30s TTL (changes often), stages+users: 5min TTL (almost static).

interface CacheEntry<T> { data: T; expiresAt: number }

const cache = new Map<string, CacheEntry<unknown>>()

function cacheGet<T>(key: string): T | null {
    const entry = cache.get(key) as CacheEntry<T> | undefined
    if (!entry || Date.now() > entry.expiresAt) { cache.delete(key); return null }
    return entry.data
}

function cacheSet<T>(key: string, data: T, ttlMs: number) {
    cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// ── Odoo client ────────────────────────────────────────────────────────────

async function execute(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}) {
    const payload = {
        jsonrpc: '2.0', method: 'call', id: 1,
        params: { service: 'object', method: 'execute_kw', args: [ODOO_DB, ODOO_UID, ODOO_API_KEY, model, method, args, kwargs] },
    }
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.data?.message ?? 'Odoo error')
    return data.result
}

// ── Config ─────────────────────────────────────────────────────────────────

const LEAD_FIELDS = [
    'id', 'name', 'partner_id', 'user_id', 'stage_id',
    'expected_revenue', 'priority', 'kanban_state',
    'date_deadline', 'probability',
    'publim_time_status', 'publim_sale_amount_total', 'publim_invoice_paid',
    'tag_ids', 'date_last_stage_update',
]

const ALL_STAGE_IDS  = [18, 11, 12, 14, 16, 17, 19, 4]
const LEADS_TTL      = 30_000   // 30 seconds
const STATIC_TTL     = 300_000  // 5 minutes

// ── GET ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const filterUserId = searchParams.get('userId')
    const showLost     = searchParams.get('lost') === 'true'

    // Build lead domain
    const domain: unknown[] = [['type', '=', 'opportunity'], ['active', '=', true]]

    if (user.role === 'admin' && filterUserId && filterUserId !== 'all') {
        domain.push(['user_id', '=', parseInt(filterUserId)])
    } else if (user.role !== 'admin') {
        domain.push(['user_id', '=', user.uid])
    }
    if (!showLost) domain.push(['stage_id', '!=', 19])

    // Cache key for leads depends on who's requesting + filters
    const leadsKey  = `leads:${user.role === 'admin' ? (filterUserId ?? 'all') : user.uid}:lost=${showLost}`
    const stagesKey = 'stages'
    const usersKey  = 'salesUsers'

    try {
        // Fetch stages and salesUsers from cache (rarely change)
        const [stages, salesUsers] = await Promise.all([
            (async () => {
                const cached = cacheGet<unknown[]>(stagesKey)
                if (cached) return cached
                const fresh = await execute('crm.stage', 'search_read', [[['id', 'in', ALL_STAGE_IDS]]], {
                    fields: ['id', 'name', 'sequence', 'is_won', 'fold'],
                    order: 'sequence asc',
                })
                cacheSet(stagesKey, fresh, STATIC_TTL)
                return fresh
            })(),
            (async () => {
                if (user.role !== 'admin') return []
                const cached = cacheGet<unknown[]>(usersKey)
                if (cached) return cached
                const fresh = await execute('res.users', 'search_read', [[['share', '=', false], ['active', '=', true]]], {
                    fields: ['id', 'name'],
                    order: 'name asc',
                })
                cacheSet(usersKey, fresh, STATIC_TTL)
                return fresh
            })(),
        ])

        // Fetch leads from cache (short TTL)
        let leads = cacheGet<unknown[]>(leadsKey)
        if (!leads) {
            leads = await execute('crm.lead', 'search_read', [domain], {
                fields: LEAD_FIELDS,
                limit: 2000,
                order: 'id desc',
            })
            cacheSet(leadsKey, leads, LEADS_TTL)
        }

        const visibleStages = showLost
            ? stages
            : (stages as { id: number }[]).filter(s => s.id !== 19)

        return NextResponse.json({
            stages: visibleStages,
            leads,
            salesUsers,
            currentUid: user.uid,
            role: user.role,
        })
    } catch (error) {
        console.error('Pipeline GET error:', error)
        return NextResponse.json({ error: 'Error al obtener pipeline' }, { status: 500 })
    }
}

// ── PATCH ──────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const { leadId, stageId } = await req.json()
        if (!leadId || !stageId) return NextResponse.json({ error: 'leadId y stageId requeridos' }, { status: 400 })

        if (user.role !== 'admin') {
            const lead = await execute('crm.lead', 'search_read', [[['id', '=', leadId]]], { fields: ['user_id'], limit: 1 })
            if (!lead.length || lead[0].user_id[0] !== user.uid)
                return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })
        }

        await execute('crm.lead', 'write', [[leadId], { stage_id: stageId }])

        // Invalidate all leads cache entries so next fetch reflects the move
        for (const key of cache.keys()) {
            if (key.startsWith('leads:')) cache.delete(key)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Pipeline PATCH error:', error)
        return NextResponse.json({ error: 'Error al mover' }, { status: 500 })
    }
}
