import { NextResponse } from 'next/server'
import { getProducts, updateProduct, deleteProduct } from '@/lib/odoo'

// Password from Vercel env variable (no default — must be configured)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

function unauthorized() {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function checkAuth(request: Request): boolean {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return false
    return authHeader.slice(7) === ADMIN_PASSWORD
}

/** GET /api/admin/products?page=1&limit=50&search=...&sort=list_price&order=asc */
export async function GET(request: Request) {
    if (!checkAuth(request)) return unauthorized()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const brand = searchParams.get('brand') || undefined

    // Server-side sorting via Odoo
    const sortField = searchParams.get('sort') || 'name'
    const sortOrder = searchParams.get('order') || 'asc'
    const validFields = ['name', 'list_price', 'id', 'categ_id']
    const field = validFields.includes(sortField) ? sortField : 'name'
    const orderBy = `${field} ${sortOrder === 'desc' ? 'desc' : 'asc'}`

    try {
        const result = await getProducts(page, limit, category, search, brand, orderBy)
        return NextResponse.json(result)
    } catch (error) {
        console.error('Admin GET error:', error)
        return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
    }
}

/** PUT /api/admin/products  body: { id, name?, list_price?, description_sale?, default_code? } */
export async function PUT(request: Request) {
    if (!checkAuth(request)) return unauthorized()

    try {
        const body = await request.json()
        const { id, ...data } = body

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
        }

        // Only allow specific fields
        const allowed: Record<string, unknown> = {}
        if (data.name !== undefined) allowed.name = data.name
        if (data.list_price !== undefined) allowed.list_price = Number(data.list_price)
        if (data.description_sale !== undefined) allowed.description_sale = data.description_sale
        if (data.default_code !== undefined) allowed.default_code = data.default_code

        if (Object.keys(allowed).length === 0) {
            return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
        }

        await updateProduct(id, allowed)
        return NextResponse.json({ success: true, id })
    } catch (error) {
        console.error('Admin PUT error:', error)
        return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
    }
}

/** DELETE /api/admin/products  body: { id } */
export async function DELETE(request: Request) {
    if (!checkAuth(request)) return unauthorized()

    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
        }

        await deleteProduct(id)
        return NextResponse.json({ success: true, id })
    } catch (error) {
        console.error('Admin DELETE error:', error)
        return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
    }
}
