import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'
import { cacheGet, cacheSet, cacheInvalidatePrefix, TTL } from '@/lib/server-cache'

const ODOO_URL     = process.env.ODOO_URL!
const ODOO_DB      = process.env.ODOO_DB!
const ODOO_UID     = 2
const ODOO_API_KEY = process.env.ODOO_API_KEY!

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

const LEAD_FIELDS = [
    'id', 'name', 'partner_id', 'user_id', 'stage_id',
    'expected_revenue', 'priority', 'kanban_state',
    'date_deadline', 'probability',
    'publim_time_status', 'publim_sale_amount_total', 'publim_invoice_paid',
    'tag_ids', 'date_last_stage_update',
]

const ALL_STAGE_IDS = [18, 11, 12, 14, 16, 17, 19, 4]

export async function GET(req: NextRequest) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const filterUserId = searchParams.get('userId')
    const showLost     = searchParams.get('lost') === 'true'

    const domain: unknown[] = [['type', '=', 'opportunity'], ['active', '=', true]]
    if (user.role === 'admin' && filterUserId && filterUserId !== 'all') {
        domain.push(['user_id', '=', parseInt(filterUserId)])
    } else if (user.role !== 'admin') {
        domain.push(['user_id', '=', user.uid])
    }
    if (!showLost) domain.push(['stage_id', '!=', 19])

    const leadsKey  = `pipeline:leads:${user.role === 'admin' ? (filterUserId ?? 'all') : user.uid}:lost=${showLost}`
    const stagesKey = 'pipeline:stages'
    const usersKey  = 'pipeline:salesUsers'

    try {
        const [stages, salesUsers] = await Promise.all([
            (async () => {
                const c = cacheGet<unknown[]>(stagesKey)
                if (c) return c
                const fresh = await execute('crm.stage', 'search_read', [[['id', 'in', ALL_STAGE_IDS]]], {
                    fields: ['id', 'name', 'sequence', 'is_won', 'fold'],
                    order: 'sequence asc',
                })
                cacheSet(stagesKey, fresh, TTL.LONG)
                return fresh
            })(),
            (async () => {
                if (user.role !== 'admin') return []
                const c = cacheGet<unknown[]>(usersKey)
                if (c) return c
                const fresh = await execute('res.users', 'search_read', [[['share', '=', false], ['active', '=', true]]], {
                    fields: ['id', 'name'], order: 'name asc',
                })
                cacheSet(usersKey, fresh, TTL.LONG)
                return fresh
            })(),
        ])

        let leads = cacheGet<unknown[]>(leadsKey)
        if (!leads) {
            leads = await execute('crm.lead', 'search_read', [domain], {
                fields: LEAD_FIELDS, limit: 2000, order: 'id desc',
            })
            cacheSet(leadsKey, leads, TTL.SHORT)
        }

        const visibleStages = showLost
            ? stages
            : (stages as { id: number }[]).filter(s => s.id !== 19)

        return NextResponse.json({ stages: visibleStages, leads, salesUsers, currentUid: user.uid, role: user.role })
    } catch (error) {
        console.error('Pipeline GET error:', error)
        return NextResponse.json({ error: 'Error al obtener pipeline' }, { status: 500 })
    }
}

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
        cacheInvalidatePrefix('pipeline:leads:')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Pipeline PATCH error:', error)
        return NextResponse.json({ error: 'Error al mover' }, { status: 500 })
    }
}
