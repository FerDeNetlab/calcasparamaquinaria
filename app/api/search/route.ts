import { NextRequest, NextResponse } from 'next/server'
import { getAllProductNames, getCategories } from '@/lib/odoo'
import { extractBrand, BRAND_LOGOS, BRAND_DISPLAY_NAMES } from '@/lib/brands'

export const revalidate = 300 // Cache for 5 minutes

interface SearchSuggestion {
    type: 'brand' | 'model' | 'category' | 'product'
    text: string
    subtitle?: string
    logo?: string
    count?: number
    url?: string
}

/**
 * Simple fuzzy match scoring.
 * Returns 0 (no match) to 1 (perfect match).
 */
function fuzzyScore(query: string, target: string): number {
    const q = query.toLowerCase()
    const t = target.toLowerCase()

    // Exact match → highest score
    if (t === q) return 1.0

    // Starts with → very high
    if (t.startsWith(q)) return 0.95

    // Contains → high
    if (t.includes(q)) return 0.8

    // Check if all query chars appear in order (fuzzy)
    let qi = 0
    let consecutiveBonus = 0
    let lastMatchIdx = -2

    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
        if (t[ti] === q[qi]) {
            if (ti === lastMatchIdx + 1) consecutiveBonus += 0.05
            lastMatchIdx = ti
            qi++
        }
    }

    if (qi === q.length) {
        // All chars matched
        const baseScore = 0.3 + (q.length / t.length) * 0.3 + consecutiveBonus
        return Math.min(baseScore, 0.75)
    }

    // No match at all — try without spaces/special chars
    const qClean = q.replace(/[^a-z0-9]/g, '')
    const tClean = t.replace(/[^a-z0-9]/g, '')
    if (qClean.length >= 2 && tClean.includes(qClean)) return 0.6

    return 0
}

// Cache for product data (refreshed every 5 min with ISR)
let cachedData: {
    products: { name: string }[]
    brands: Map<string, { count: number; logo?: string }>
    categories: { name: string; count: number }[]
    models: Map<string, { brand: string; count: number }>
    timestamp: number
} | null = null

const CACHE_TTL = 300_000 // 5 minutes in ms

async function getData() {
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        return cachedData
    }

    const [products, categories] = await Promise.all([
        getAllProductNames(),
        getCategories(),
    ])

    // Extract brands and models from product names
    const PREFIX = 'JUEGO DE CALCAS DE RESTAURACION PARA '
    const brands = new Map<string, { count: number; logo?: string }>()
    const models = new Map<string, { brand: string; count: number }>()

    for (const p of products) {
        const brandName = extractBrand(p.name)
        if (brandName) {
            const existing = brands.get(brandName)
            if (existing) {
                existing.count++
            } else {
                const upperBrand = brandName.toUpperCase()
                brands.set(brandName, {
                    count: 1,
                    logo: BRAND_LOGOS[upperBrand],
                })
            }

            // Extract model (everything after the brand in the name)
            const upper = p.name.toUpperCase()
            let afterPrefix = upper.startsWith(PREFIX)
                ? upper.slice(PREFIX.length).trim()
                : upper

            // Remove the brand from the start to get the model
            const brandUpper = brandName.toUpperCase()
            if (afterPrefix.startsWith(brandUpper)) {
                const model = afterPrefix.slice(brandUpper.length).trim()
                if (model.length >= 2) {
                    const modelKey = `${brandName} ${model}`
                    const existingModel = models.get(modelKey)
                    if (existingModel) {
                        existingModel.count++
                    } else {
                        models.set(modelKey, { brand: brandName, count: 1 })
                    }
                }
            }
        }
    }

    cachedData = {
        products,
        brands,
        categories: categories.map(c => ({
            name: c.name,
            count: c.product_count || 0,
        })),
        models,
        timestamp: Date.now(),
    }

    return cachedData
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q')?.trim()

    if (!query || query.length < 1) {
        return NextResponse.json({ suggestions: [] })
    }

    const data = await getData()
    const suggestions: (SearchSuggestion & { score: number })[] = []

    // 1. Search brands
    for (const [name, info] of data.brands) {
        const score = fuzzyScore(query, name)
        if (score > 0.25) {
            suggestions.push({
                type: 'brand',
                text: name,
                subtitle: `${info.count} productos`,
                logo: info.logo,
                count: info.count,
                url: `/catalogo?marca=${encodeURIComponent(name)}`,
                score: score + 0.2, // Boost brands slightly
            })
        }
    }

    // 2. Search categories
    for (const cat of data.categories) {
        const score = fuzzyScore(query, cat.name)
        if (score > 0.25) {
            suggestions.push({
                type: 'category',
                text: cat.name,
                subtitle: `${cat.count} productos`,
                count: cat.count,
                url: `/catalogo?categoria=${encodeURIComponent(cat.name)}`,
                score: score + 0.1, // Boost categories
            })
        }
    }

    // 3. Search product names / models (limit to avoid too many results)
    let productMatches = 0
    for (const p of data.products) {
        if (productMatches >= 8) break

        const score = fuzzyScore(query, p.name)
        if (score > 0.3) {
            const brand = extractBrand(p.name) || ''
            // Simplify the display name
            const PREFIX = 'JUEGO DE CALCAS DE RESTAURACION PARA '
            const displayName = p.name.toUpperCase().startsWith(PREFIX)
                ? p.name.slice(PREFIX.length).trim()
                : p.name

            suggestions.push({
                type: 'product',
                text: displayName,
                subtitle: brand ? `Marca: ${brand}` : undefined,
                url: `/catalogo?buscar=${encodeURIComponent(p.name.split(' ').slice(-3).join(' '))}`,
                score,
            })
            productMatches++
        }
    }

    // Sort by score descending, then deduplicate
    suggestions.sort((a, b) => b.score - a.score)

    // Deduplicate by text
    const seen = new Set<string>()
    const unique = suggestions.filter(s => {
        const key = `${s.type}:${s.text}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })

    // Return top 12 suggestions, grouped by type
    const result = unique.slice(0, 12).map(({ score: _score, ...s }) => s)

    return NextResponse.json(
        { suggestions: result },
        {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        }
    )
}
