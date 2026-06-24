import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'

const ODOO_URL = process.env.ODOO_URL!
const ODOO_DB  = process.env.ODOO_DB!
const ODOO_UID = 2
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
    'tag_ids', 'date_last_stage_update', 'active',
]

// Stages we always show (active pipeline — excludes PERDIDOS and FINALIZADO from main board)
const ALL_STAGE_IDS = [18, 11, 12, 14, 16, 17, 19, 4]

export async function GET(req: NextRequest) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const filterUserId = searchParams.get('userId') // admin can pass a userId or 'all'
    const showLost     = searchParams.get('lost') === 'true'

    // Build lead domain
    const domain: unknown[] = [['type', '=', 'opportunity'], ['active', '=', true]]

    // Scope by user: admins can see all or filter; others see only their own
    if (user.role === 'admin' && filterUserId && filterUserId !== 'all') {
        domain.push(['user_id', '=', parseInt(filterUserId)])
    } else if (user.role !== 'admin') {
        domain.push(['user_id', '=', user.uid])
    }

    // Exclude lost unless explicitly requested
    if (!showLost) {
        domain.push(['stage_id', '!=', 19]) // PERDIDOS id=19
    }

    try {
        const [stages, leads, salesUsers] = await Promise.all([
            execute('crm.stage', 'search_read', [[['id', 'in', ALL_STAGE_IDS]]], {
                fields: ['id', 'name', 'sequence', 'is_won', 'fold', 'requirements'],
                order: 'sequence asc',
            }),
            execute('crm.lead', 'search_read', [domain], {
                fields: LEAD_FIELDS,
                limit: 2000,
                order: 'id desc',
            }),
            // Only admins get the full user list for filtering
            user.role === 'admin'
                ? execute('res.users', 'search_read', [[['share', '=', false], ['active', '=', true]]], {
                    fields: ['id', 'name'],
                    order: 'name asc',
                })
                : Promise.resolve([]),
        ])

        // Filter stages based on showLost
        const visibleStages = showLost ? stages : stages.filter((s: { id: number }) => s.id !== 19)

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

        // Verify the lead belongs to this user (unless admin)
        if (user.role !== 'admin') {
            const lead = await execute('crm.lead', 'search_read', [[['id', '=', leadId]]], { fields: ['user_id'], limit: 1 })
            if (!lead.length || lead[0].user_id[0] !== user.uid) {
                return NextResponse.json({ error: 'Sin permiso para mover esta oportunidad' }, { status: 403 })
            }
        }

        await execute('crm.lead', 'write', [[leadId], { stage_id: stageId }])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Pipeline PATCH error:', error)
        return NextResponse.json({ error: 'Error al mover oportunidad' }, { status: 500 })
    }
}
