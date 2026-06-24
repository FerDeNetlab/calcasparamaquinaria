import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'
import { cacheGet, cacheSet, TTL } from '@/lib/server-cache'

const ODOO_URL = process.env.ODOO_URL!
const ODOO_DB = process.env.ODOO_DB!
const ODOO_UID = 2
const ODOO_API_KEY = process.env.ODOO_API_KEY!

async function authenticate(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return false
    return (await verifyToken(token)) !== null
}

async function odoo(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}) {
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: { service: 'object', method: 'execute_kw', args: [ODOO_DB, ODOO_UID, ODOO_API_KEY, model, method, args, kwargs] },
        }),
        cache: 'no-store',
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.data?.message ?? 'Odoo error')
    return data.result
}

export async function GET(req: NextRequest) {
    if (!await authenticate(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const view = req.nextUrl.searchParams.get('view') ?? 'overview'

    if (view === 'overview') {
        const year  = req.nextUrl.searchParams.get('year')  // e.g. "2026"
        const month = req.nextUrl.searchParams.get('month') // e.g. "06" or null = full year

        // Build date domain
        const domain: unknown[] = []
        if (year && month) {
            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
            domain.push(['date_order', '>=', `${year}-${month}-01 00:00:00`])
            domain.push(['date_order', '<=', `${year}-${month}-${lastDay} 23:59:59`])
        } else if (year) {
            domain.push(['date_order', '>=', `${year}-01-01 00:00:00`])
            domain.push(['date_order', '<=', `${year}-12-31 23:59:59`])
        }

        const crmKey = `crm:overview:${year ?? 'all'}:${month ?? 'all'}`
        const cachedOverview = cacheGet<unknown>(crmKey)
        if (cachedOverview) return NextResponse.json(cachedOverview)

        const orders: Array<{
            id: number
            name: string
            state: string
            user_id: [number, string] | false
            partner_id: [number, string] | false
            amount_total: number
            date_order: string
            invoice_status: string
        }> = await odoo('sale.order', 'search_read', [domain], {
            fields: ['name', 'state', 'user_id', 'partner_id', 'amount_total', 'date_order', 'invoice_status'],
            limit: 5000,
            order: 'date_order asc',
        })

        // Aggregate per salesperson
        const sellersMap = new Map<number, {
            id: number
            name: string
            confirmed: number
            draft: number
            cancelled: number
            sent: number
            totalConfirmed: number
            totalDraft: number
            monthlyRevenue: Record<string, number>
        }>()

        let globalConfirmed = 0
        let globalDraft = 0
        let globalRevenue = 0

        for (const o of orders) {
            if (!o.user_id) continue
            const [uid, uname] = o.user_id
            if (!sellersMap.has(uid)) {
                sellersMap.set(uid, { id: uid, name: uname, confirmed: 0, draft: 0, cancelled: 0, sent: 0, totalConfirmed: 0, totalDraft: 0, monthlyRevenue: {} })
            }
            const s = sellersMap.get(uid)!

            if (o.state === 'sale') {
                s.confirmed++
                s.totalConfirmed += o.amount_total
                globalConfirmed++
                globalRevenue += o.amount_total
                const month = o.date_order.slice(0, 7)
                s.monthlyRevenue[month] = (s.monthlyRevenue[month] ?? 0) + o.amount_total
            } else if (o.state === 'draft') {
                s.draft++
                s.totalDraft += o.amount_total
                globalDraft++
            } else if (o.state === 'cancel') {
                s.cancelled++
            } else if (o.state === 'sent') {
                s.sent++
                s.totalDraft += o.amount_total
                globalDraft++
            }
        }

        const sellers = Array.from(sellersMap.values())
            .map(s => ({
                ...s,
                conversionRate: s.confirmed + s.draft + s.sent > 0
                    ? Math.round((s.confirmed / (s.confirmed + s.draft + s.sent + s.cancelled)) * 1000) / 10
                    : 0,
                monthlyRevenue: s.monthlyRevenue,
            }))
            .sort((a, b) => b.totalConfirmed - a.totalConfirmed)

        const overview = { globalConfirmed, globalDraft, globalRevenue, totalOrders: orders.length, sellers }
        cacheSet(crmKey, overview, TTL.MEDIUM)
        return NextResponse.json(overview)
    }

    if (view === 'pipeline') {
        // CRM pipeline by stage
        const leads: Array<{
            id: number
            name: string
            stage_id: [number, string] | false
            user_id: [number, string] | false
            partner_id: [number, string] | false
            expected_revenue: number
            probability: number
            date_deadline: string | false
            type: string
        }> = await odoo('crm.lead', 'search_read', [[]], {
            fields: ['name', 'stage_id', 'user_id', 'partner_id', 'expected_revenue', 'probability', 'date_deadline', 'type'],
            limit: 1000,
        })

        const stages: Array<{ id: number; name: string; sequence: number; is_won: boolean }> = await odoo('crm.stage', 'search_read', [[]], {
            fields: ['id', 'name', 'sequence', 'is_won'],
            limit: 20,
        })

        const stagesOrdered = stages.sort((a, b) => a.sequence - b.sequence)

        const pipeline = stagesOrdered.map(stage => {
            const stageLeads = leads.filter(l => l.stage_id && l.stage_id[0] === stage.id)
            return {
                id: stage.id,
                name: stage.name,
                sequence: stage.sequence,
                is_won: stage.is_won,
                count: stageLeads.length,
                totalRevenue: stageLeads.reduce((sum, l) => sum + (l.expected_revenue ?? 0), 0),
                leads: stageLeads.map(l => ({
                    id: l.id,
                    name: l.name,
                    partner: l.partner_id ? l.partner_id[1] : '—',
                    seller: l.user_id ? l.user_id[1] : '—',
                    revenue: l.expected_revenue ?? 0,
                    probability: l.probability ?? 0,
                    deadline: l.date_deadline || null,
                })),
            }
        })

        return NextResponse.json({ pipeline, totalLeads: leads.length })
    }

    if (view === 'orders') {
        const userId = req.nextUrl.searchParams.get('userId')
        const months = parseInt(req.nextUrl.searchParams.get('months') ?? '3')

        const cutoff = new Date()
        cutoff.setMonth(cutoff.getMonth() - months)
        const cutoffStr = cutoff.toISOString().slice(0, 19).replace('T', ' ')

        const domain: unknown[] = [['date_order', '>=', cutoffStr]]
        if (userId) domain.push(['user_id', '=', parseInt(userId)])

        const orders = await odoo('sale.order', 'search_read', [domain], {
            fields: ['name', 'state', 'user_id', 'partner_id', 'amount_total', 'date_order', 'invoice_status'],
            limit: 500,
            order: 'date_order desc',
        })

        return NextResponse.json({ orders })
    }

    return NextResponse.json({ error: 'Invalid view' }, { status: 400 })
}
