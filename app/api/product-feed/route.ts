import { NextResponse } from 'next/server'
import { getAllProductsForFeed } from '@/lib/odoo'
import { extractBrand } from '@/lib/brands'
import { productUrl } from '@/lib/slugs'

const BASE_URL = 'https://www.calcasparamaquinaria.mx'

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
 * Convert ALL CAPS text to Title Case.
 * Keeps brand abbreviations and model numbers intact.
 */
const KEEP_UPPERCASE = new Set(['CAT', 'JCB', 'JLG', 'P&H', 'USA', 'MX', 'II', 'III', 'IV', 'HP', 'HD', 'LC', 'LN'])
const LOWERCASE_WORDS = new Set(['de', 'del', 'para', 'por', 'con', 'en', 'y', 'o', 'la', 'el', 'las', 'los', 'un', 'una'])

function toTitleCase(text: string): string {
    const lower = text.toLowerCase().trim()
    return lower
        .split(/\s+/)
        .map((word, index) => {
            const upper = word.toUpperCase()
            if (KEEP_UPPERCASE.has(upper)) return upper
            if (/\d/.test(word)) return word.toUpperCase()
            if (index > 0 && LOWERCASE_WORDS.has(word)) return word
            return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
}

/**
 * Convert Odoo category name to a readable product type.
 * "COMPRESOR" → "Compresor", "ALL" → "Maquinaria Pesada"
 */
function formatCategory(category: string): string {
    if (!category || category === 'All' || category.toUpperCase() === 'ALL') {
        return 'Calcomanías > Maquinaria Pesada'
    }
    const name = toTitleCase(category)
    return `Calcomanías > ${name}`
}

export async function GET() {
    try {
        const products = await getAllProductsForFeed()

        const items = products.map((product) => {
            const brand = extractBrand(product.name) || 'Genérico'
            const categoryName = product.categ_id ? product.categ_id[1] : 'Maquinaria Pesada'
            const url = `${BASE_URL}${productUrl(product.id, product.name, categoryName)}`
            const imageUrl = `${BASE_URL}/api/product-image/${product.id}?size=512`
            const price = `${product.list_price.toFixed(2)} MXN`

            // Title Case + trim trailing whitespace
            const title = toTitleCase(product.name)

            // Product type as Google category path
            const productType = formatCategory(categoryName)

            // Unique description per product
            const desc = product.description_sale
                ? product.description_sale.trim()
                : `Calcomanías de restauración ${title}. Kit completo de calcas ${brand} fabricadas en vinilo premium con más de 6 años de duración a la intemperie. Envío gratis a toda la República Mexicana.`

            return `    <item>
      <g:id>${product.id}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(url)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
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
    <title>Calcas para Maquinaria</title>
    <link>${BASE_URL}</link>
    <description>Calcomanías para maquinaria pesada - www.calcasparamaquinaria.mx</description>
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
