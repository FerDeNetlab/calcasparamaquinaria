import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth'
import { getAdminProductsByCategory, updateProduct, deleteProduct } from '@/lib/odoo'

const CARATULA_CATEGORY_ID = 474

async function checkAuth(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return false
    return (await verifyToken(token)) !== null
}

export async function GET(req: NextRequest) {
    if (!await checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = req.nextUrl
    const page   = parseInt(searchParams.get('page')  ?? '1')
    const limit  = parseInt(searchParams.get('limit') ?? '50')
    const search = searchParams.get('search') ?? undefined
    const sort   = searchParams.get('sort')  ?? 'name'
    const order  = searchParams.get('order') ?? 'asc'

    const validFields = ['name', 'list_price', 'id', 'categ_id']
    const field = validFields.includes(sort) ? sort : 'name'
    const orderBy = `${field} ${order === 'desc' ? 'desc' : 'asc'}`

    try {
        const result = await getAdminProductsByCategory(CARATULA_CATEGORY_ID, page, limit, search, orderBy)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Carátulas GET error:', error)
        return NextResponse.json({ error: 'Error al obtener carátulas' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    if (!await checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const body = await req.json()
        const { id, ...data } = body
        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

        const allowed: Record<string, unknown> = {}
        if (data.name !== undefined) allowed.name = data.name
        if (data.list_price !== undefined) allowed.list_price = Number(data.list_price)
        if (data.description_sale !== undefined) allowed.description_sale = data.description_sale
        if (data.default_code !== undefined) allowed.default_code = data.default_code
        if (data.x_validated_by_direction !== undefined) allowed.x_validated_by_direction = Boolean(data.x_validated_by_direction)
        if (data.x_available_ecommerce !== undefined) allowed.x_available_ecommerce = Boolean(data.x_available_ecommerce)

        if (Object.keys(allowed).length === 0) return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })

        await updateProduct(id, allowed)
        return NextResponse.json({ success: true, id })
    } catch (error) {
        console.error('Carátulas PUT error:', error)
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    if (!await checkAuth(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
        await deleteProduct(id)
        return NextResponse.json({ success: true, id })
    } catch (error) {
        console.error('Carátulas DELETE error:', error)
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }
}
