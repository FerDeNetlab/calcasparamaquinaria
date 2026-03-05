/**
 * Build a product image URL with cache-busting version param.
 * When a product is updated in Odoo, write_date changes → URL changes → CDN fetches fresh.
 */
export function productImageUrl(
    productId: number,
    size: 128 | 256 | 512 | 1024,
    writeDate?: string
): string {
    const base = `/api/product-image/${productId}/${size}`
    if (writeDate) {
        // Use a compact timestamp as version (remove non-numeric chars)
        const v = writeDate.replace(/[^0-9]/g, '')
        return `${base}?v=${v}`
    }
    return base
}
