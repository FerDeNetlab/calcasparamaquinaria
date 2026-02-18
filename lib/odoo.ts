import 'server-only'
import { extractBrand } from './brands'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OdooProduct {
    id: number
    name: string
    list_price: number
    categ_id: [number, string] | false
    default_code: string | false
    description_sale: string | false
    x_available_ecommerce: boolean
}

export interface OdooCategory {
    id: number
    name: string
    product_count?: number
}

export interface ProductsResult {
    products: OdooProduct[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// ─── Configuration ──────────────────────────────────────────────────────────

const ODOO_URL = process.env.ODOO_URL!
const ODOO_DB = process.env.ODOO_DB!
const ODOO_USER = process.env.ODOO_USER!
const ODOO_API_KEY = process.env.ODOO_API_KEY!
const ODOO_UID = 2 // Pre-authenticated uid for fer@calcasparamaquinaria.mx

// ─── JSON-RPC Client ────────────────────────────────────────────────────────

async function jsonRpc(service: string, method: string, args: unknown[]) {
    const payload = {
        jsonrpc: '2.0',
        method: 'call',
        params: { service, method, args },
        id: Date.now(),
    }

    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        throw new Error(`Odoo RPC failed: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    if (data.error) {
        throw new Error(`Odoo error: ${data.error.data?.message || data.error.message || 'Unknown'}`)
    }

    return data.result
}

/** Execute a method on an Odoo model (read-only) */
async function execute(
    model: string,
    method: string,
    args: unknown[],
    kwargs: Record<string, unknown> = {}
) {
    return jsonRpc('object', 'execute_kw', [
        ODOO_DB,
        ODOO_UID,
        ODOO_API_KEY,
        model,
        method,
        args,
        kwargs,
    ])
}

// ─── Base filter: only website-published products ───────────────────────────

const PUBLISHED_FILTER: unknown[] = [
    ['sale_ok', '=', true],
    ['x_available_ecommerce', '=', true],
]

// Fields we fetch for product lists (lightweight — no images)
const LIST_FIELDS = [
    'id',
    'name',
    'list_price',
    'categ_id',
    'default_code',
    'description_sale',
]

// Fields we fetch for product detail (full data, still no binary image)
const DETAIL_FIELDS = [
    'id',
    'name',
    'list_price',
    'categ_id',
    'default_code',
    'description_sale',
    'x_available_ecommerce',
]

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get published products with pagination, optional category, search, and brand filters.
 *
 * Brand filtering is done client-side (post-fetch) using extractBrand() to avoid
 * the ilike substring collision (e.g. searching "CAT" would also match "BOBCAT").
 */
export async function getProducts(
    page = 1,
    limit = 24,
    category?: string,
    search?: string,
    brand?: string
): Promise<ProductsResult> {
    const domain: unknown[] = [...PUBLISHED_FILTER]

    if (category) {
        domain.push(['categ_id.name', '=', category])
    }

    if (search) {
        domain.push(['name', 'ilike', search])
    }

    // When filtering by brand we need to fetch ALL matching products first,
    // then post-filter by exact brand using extractBrand(), then paginate.
    if (brand) {
        // Fetch all (up to 5000) without pagination so we can filter accurately
        const allProducts: OdooProduct[] = await execute(
            'product.template',
            'search_read',
            [domain],
            { fields: LIST_FIELDS, limit: 5000, order: 'name asc' }
        )

        // Post-filter: only keep products whose extracted brand matches exactly
        const filtered = allProducts.filter(
            (p) => extractBrand(p.name) === brand
        )

        const total = filtered.length
        const offset = (page - 1) * limit
        const products = filtered.slice(offset, offset + limit)

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }

    // No brand filter — use normal paginated query
    const offset = (page - 1) * limit

    const [products, total] = await Promise.all([
        execute('product.template', 'search_read', [domain], {
            fields: LIST_FIELDS,
            limit,
            offset,
            order: 'name asc',
        }),
        execute('product.template', 'search_count', [domain]),
    ])

    return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}


/**
 * Get all product names for brand extraction (lightweight).
 */
export async function getAllProductNames(): Promise<{ name: string }[]> {
    return execute(
        'product.template',
        'search_read',
        [PUBLISHED_FILTER],
        {
            fields: ['name'],
            limit: 5000,
            order: 'name asc',
        }
    )
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id: number): Promise<OdooProduct | null> {
    const products = await execute(
        'product.template',
        'search_read',
        [[['id', '=', id], ...PUBLISHED_FILTER]],
        { fields: DETAIL_FIELDS, limit: 1 }
    )
    return products.length > 0 ? products[0] : null
}

/**
 * Get the base64-encoded image for a product.
 * @param size - Odoo image field size: 128, 256, 512, 1024, 1920
 */
export async function getProductImage(
    id: number,
    size: 128 | 256 | 512 | 1024 | 1920 = 512
): Promise<string | null> {
    const field = size === 1920 ? 'image_1920' : `image_${size}`
    const result = await execute(
        'product.template',
        'search_read',
        [[['id', '=', id]]],
        { fields: [field], limit: 1 }
    )
    if (result.length > 0 && result[0][field]) {
        return result[0][field] as string
    }
    return null
}

/**
 * Get all unique categories (machine types) that have published products.
 * Returns sorted by product count descending.
 */
export async function getCategories(): Promise<OdooCategory[]> {
    // Fetch all published products' categ_id in one call
    const products = await execute(
        'product.template',
        'search_read',
        [PUBLISHED_FILTER],
        { fields: ['categ_id'], limit: 3000 }
    )

    // Count products per category
    const catMap = new Map<number, { name: string; count: number }>()
    for (const p of products) {
        if (p.categ_id) {
            const [id, name] = p.categ_id
            const existing = catMap.get(id)
            if (existing) {
                existing.count++
            } else {
                catMap.set(id, { name, count: 1 })
            }
        }
    }

    // Convert to array, sorted by count descending
    return Array.from(catMap.entries())
        .map(([id, { name, count }]) => ({ id, name, product_count: count }))
        .sort((a, b) => (b.product_count ?? 0) - (a.product_count ?? 0))
}

/**
 * Get featured products for the homepage.
 * Picks products that have images, sorted by ID desc (newest first).
 */
export async function getFeaturedProducts(limit = 8): Promise<OdooProduct[]> {
    return execute(
        'product.template',
        'search_read',
        [[...PUBLISHED_FILTER, ['image_1920', '!=', false]]],
        {
            fields: LIST_FIELDS,
            limit,
            order: 'id desc',
        }
    )
}

/**
 * Get all published product IDs and names for sitemap generation.
 * Only fetches minimal fields to keep the response lightweight.
 */
export async function getAllProductsForSitemap(): Promise<
    { id: number; name: string; write_date: string; categ_id: [number, string] | false }[]
> {
    return execute(
        'product.template',
        'search_read',
        [PUBLISHED_FILTER],
        {
            fields: ['id', 'name', 'write_date', 'categ_id'],
            limit: 5000,
            order: 'id asc',
        }
    )
}
