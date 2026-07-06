/**
 * Build a product image URL via the internal proxy (/api/product-image).
 * The proxy fetches from Odoo with API key auth and sets long CDN cache headers,
 * so Vercel caches the image for 30 days after the first request.
 * The write_date version param busts the cache when a product's image changes.
 */

export function productImageUrl(
    productId: number,
    size: 128 | 256 | 512 | 1024,
    writeDate?: string
): string {
    const base = `/api/product-image/${productId}?size=${size}`
    if (writeDate) {
        const v = writeDate.replace(/[^0-9]/g, '')
        return `${base}&v=${v}`
    }
    return base
}
