import { NextResponse } from 'next/server'
import { getAllProductsForFeed } from '@/lib/odoo'
import { extractBrand } from '@/lib/brands'
import { productUrl } from '@/lib/slugs'

const BASE_URL = 'https://calcasparamaquinaria.mx'

// Placeholder image for products without one (Google REQUIRES a valid image)
const PLACEHOLDER_IMAGE = `${BASE_URL}/placeholder-product.png`

// Cache the feed for 6 hours (Merchant Center fetches daily)
export const revalidate = 21600

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

/**
 * Convert ALL CAPS product name to Title Case.
 * Keeps brand abbreviations (CAT, JCB, JLG, P&H) uppercase.
 * Example: "JUEGO DE CALCAS DE RESTAURACION PARA CAT 320D2"
 *       → "Juego de Calcas de Restauración para Cat 320D2"
 */
const KEEP_UPPERCASE = new Set(['CAT', 'JCB', 'JLG', 'P&H', 'USA', 'MX'])
const LOWERCASE_WORDS = new Set(['de', 'del', 'para', 'por', 'con', 'en', 'y', 'o', 'la', 'el', 'las', 'los', 'un', 'una'])

function toTitleCase(text: string): string {
    return text
        .split(/\s+/)
        .map((word, index) => {
            const upper = word.toUpperCase()

            // Keep known abbreviations uppercase
            if (KEEP_UPPERCASE.has(upper)) return upper

            // Keep model numbers (contain digits) as-is
            if (/\d/.test(word)) return word.toUpperCase()

            const lower = word.toLowerCase()

            // Lowercase articles/prepositions (except first word)
            if (index > 0 && LOWERCASE_WORDS.has(lower)) return lower

            // Capitalize first letter
            return lower.charAt(0).toUpperCase() + lower.slice(1)
        })
        .join(' ')
}

export async function GET() {
    try {
        const products = await getAllProductsForFeed()

        const items = products.map((product) => {
            const brand = extractBrand(product.name) || 'Genérico'
            const categoryName = product.categ_id ? product.categ_id[1] : 'Maquinaria Pesada'
            const url = `${BASE_URL}${productUrl(product.id, product.name, categoryName)}`
            const imageUrl = `${BASE_URL}/api/product-image/${product.id}/512`
            const price = `${product.list_price.toFixed(2)} MXN`

            // Title Case for Merchant Center compliance
            const title = toTitleCase(product.name)

            // Build a description from available data
            let description = product.description_sale || ''
            if (!description) {
                description = `Kit de calcomanías de restauración para ${brand} ${categoryName}. Fabricadas en vinilo premium con +6 años de duración a la intemperie. Envío a toda la República Mexicana.`
            }

            return `    <item>
      <g:id>${product.id}</g:id>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(url)}</link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(categoryName)}</g:product_type>
      <g:identifier_exists>false</g:identifier_exists>
      <g:shipping>
        <g:country>MX</g:country>
        <g:service>Estándar</g:service>
        <g:price>0 MXN</g:price>
      </g:shipping>
    </item>`
        })

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Calcas para Maquinaria - Catálogo de Productos</title>
    <link>${BASE_URL}</link>
    <description>Calcomanías de alta calidad para maquinaria pesada. Más de 7,000 modelos disponibles.</description>
${items.join('\n')}
  </channel>
</rss>`

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=3600',
            },
        })
    } catch (error) {
        console.error('Error generating product feed:', error)
        return NextResponse.json(
            { error: 'Failed to generate product feed' },
            { status: 500 }
        )
    }
}
