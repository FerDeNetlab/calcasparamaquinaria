/**
 * Build a product image URL pointing directly to Odoo (no serverless proxy).
 * This eliminates Function Invocations on Vercel.
 * The write_date version param ensures fresh images when products change.
 */

const ODOO_IMAGE_BASE = 'https://odoo.calcasparamaquinaria.mx/web/image/product.template'

const SIZE_MAP: Record<number, string> = {
    128: 'image_128',
    256: 'image_256',
    512: 'image_512',
    1024: 'image_1024',
}

export function productImageUrl(
    productId: number,
    size: 128 | 256 | 512 | 1024,
    writeDate?: string
): string {
    const field = SIZE_MAP[size] || 'image_512'
    const base = `${ODOO_IMAGE_BASE}/${productId}/${field}`
    if (writeDate) {
        const v = writeDate.replace(/[^0-9]/g, '')
        return `${base}?v=${v}`
    }
    return base
}
