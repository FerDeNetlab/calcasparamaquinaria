/**
 * Generate an SEO-friendly slug from product name and category.
 * Example: "JUEGO DE CALCAS DE RESTAURACION PARA EXCAVADORA CAT 320D2" → "juego-de-calcas-de-restauracion-para-excavadora-cat-320d2"
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with dashes
        .replace(/^-+|-+$/g, '')         // Trim leading/trailing dashes
        .replace(/-{2,}/g, '-')          // Collapse multiple dashes
}

/**
 * Build the full product URL path.
 * Format: /producto/{category-slug}/{product-slug}-{id}
 * The ID at the end allows us to look up the product from Odoo.
 */
export function productUrl(
    id: number,
    name: string,
    category?: string
): string {
    const productSlug = slugify(name)
    const categorySlug = category ? slugify(category) : 'general'
    return `/producto/${categorySlug}/${productSlug}-${id}`
}

/**
 * Extract the product ID from a slug.
 * The ID is always the last number after the last dash.
 * Example: "juego-de-calcas-cat-320d2-50975" → 50975
 */
export function extractIdFromSlug(slug: string): number | null {
    const match = slug.match(/-(\d+)$/)
    return match ? parseInt(match[1], 10) : null
}
