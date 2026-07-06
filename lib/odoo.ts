import 'server-only'
import { extractBrand } from './brands'
import { cacheGet, cacheSet, cacheInvalidatePrefix, TTL } from './server-cache'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OdooProduct {
    id: number
    name: string
    list_price: number
    categ_id: [number, string] | false
    default_code: string | false
    description_sale: string | false
    x_available_ecommerce: boolean
    write_date: string
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

/** Execute a method on an Odoo model.
 *  Read operations (search_read, search_count, fields_get) are cached by default.
 *  Write operations (write, unlink, create) skip the cache and invalidate products cache.
 */
async function execute(
    model: string,
    method: string,
    args: unknown[],
    kwargs: Record<string, unknown> = {}
) {
    const isWrite = ['write', 'unlink', 'create'].includes(method)

    if (!isWrite) {
        // Never cache image fields — they're large binary blobs; CDN handles that via proxy headers
        const fields = (kwargs.fields as string[] | undefined) ?? []
        const isImageFetch = fields.some(f => f.startsWith('image_'))
        if (!isImageFetch) {
            const key = `odoo:${model}:${method}:${JSON.stringify(args)}:${JSON.stringify(kwargs)}`
            const ttl = model === 'product.category' ? TTL.LONG
                      : method === 'search_count'     ? TTL.MEDIUM
                      : TTL.MEDIUM
            const cached = cacheGet<unknown>(key)
            if (cached !== null) return cached
            const result = await jsonRpc('object', 'execute_kw', [ODOO_DB, ODOO_UID, ODOO_API_KEY, model, method, args, kwargs])
            cacheSet(key, result, ttl)
            return result
        }
    }

    // Write — flush all cached entries for this model
    cacheInvalidatePrefix(`odoo:${model}:`)
    return jsonRpc('object', 'execute_kw', [ODOO_DB, ODOO_UID, ODOO_API_KEY, model, method, args, kwargs])
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
    'x_validated_by_direction',
    'write_date',
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
    'write_date',
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
    brand?: string,
    orderBy = 'name asc'
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
            { fields: LIST_FIELDS, limit: 5000, order: orderBy }
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
            order: orderBy,
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

/**
 * Get all published products with full data for Google Merchant Center feed.
 */
export async function getAllProductsForFeed(): Promise<OdooProduct[]> {
    return execute(
        'product.template',
        'search_read',
        [PUBLISHED_FILTER],
        {
            fields: LIST_FIELDS,
            limit: 5000,
            order: 'id asc',
        }
    )
}

// ─── Admin API (write operations) ───────────────────────────────────────────

/**
 * Update a product's fields in Odoo.
 * Only allows updating name, list_price, description_sale, default_code.
 */
export async function updateProduct(
    id: number,
    data: Partial<Pick<OdooProduct, 'name' | 'list_price' | 'description_sale' | 'default_code'>>
): Promise<boolean> {
    return execute(
        'product.template',
        'write',
        [[id], data]
    )
}

/**
 * Delete (unlink) a product from Odoo.
 */
export async function deleteProduct(id: number): Promise<boolean> {
    return execute(
        'product.template',
        'unlink',
        [[id]]
    )
}

// ─── Admin catalog queries (no ecommerce filter) ─────────────────────────────

const ADMIN_FIELDS = [
    'id', 'name', 'list_price', 'categ_id', 'default_code',
    'description_sale', 'x_available_ecommerce', 'x_validated_by_direction', 'write_date',
]

/**
 * Get products by category ID without ecommerce filter.
 * Used for admin modules like Carátulas.
 */
export async function getAdminProductsByCategory(
    categoryId: number,
    page = 1,
    limit = 50,
    search?: string,
    orderBy = 'name asc'
): Promise<ProductsResult & { products: OdooProduct[] }> {
    const domain: unknown[] = [['categ_id', '=', categoryId]]
    if (search) domain.push(['name', 'ilike', search])

    const offset = (page - 1) * limit
    const [products, total] = await Promise.all([
        execute('product.template', 'search_read', [domain], {
            fields: ADMIN_FIELDS, limit, offset, order: orderBy,
        }),
        execute('product.template', 'search_count', [domain]),
    ])

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) }
}
