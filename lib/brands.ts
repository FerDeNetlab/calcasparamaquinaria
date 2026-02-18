/**
 * Map of known brand names to their logo image URLs.
 * Brand keys are UPPERCASE for matching against product names.
 * These logos are already hosted on Vercel Blob Storage.
 */
export const BRAND_LOGOS: Record<string, string> = {
    CAT: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cat-bAaDge5pmzj678ppBYbSqXY9gTle6s.png',
    VOLVO: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volvo-iY0XsNv8mpH1zHfuFLJBSpnfZ9rGh6.png',
    KOMATSU: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/komatsu-qH5Rhoq8YueOkOApalE49Wa1Qb29Xa.png',
    'JOHN DEERE': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deere-KUEMgOj4TyXW7wZqxjL89yQEJVmPej.png',
    DEERE: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deere-KUEMgOj4TyXW7wZqxjL89yQEJVmPej.png',
    JCB: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jcb-XbPsN6IA2mRABQDJ21d2HxQXFptFRV.png',
    CASE: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/case-JDX2HKA0Tlau8LTAvBv6YO3x25Wv7q.png',
    TEREX: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/terex-oiidT43cZtot4ySxfWDijlH57kLkE5.png',
    JLG: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jlg-JYmHcEUw6VHucj3axYSTe0X9lwPtEc.png',
    SKYJACK: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skyjack-KUPdGgTCbdxAd0yGvVGwknE0yTMEog.png',
    KALMAR: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kalmar-6lD8zAjPjJmhXrIw0nyeYc5z0bCIfN.png',
    METSO: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/metso-YKIhutwt2Q0Q8UwgwNyYLgKSIc0MSS.png',
    'P&H': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/p%26h-YF31BPANLsAGoAjKt82uBgbN7Q3Iii.png',
    TAMROCK: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tamrock-6aGUedhY1W1PKix0qtr2RlpFNFnIit.png',
    'BROCE BROOM': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/broce_broom-MPFw6Dx39tCOMnxDIxagS3YNgPu25b.png',
}

/** Display name for brands (proper casing) */
export const BRAND_DISPLAY_NAMES: Record<string, string> = {
    CAT: 'CAT',
    CATERPILLAR: 'CAT',
    VOLVO: 'Volvo',
    KOMATSU: 'Komatsu',
    'JOHN DEERE': 'John Deere',
    DEERE: 'John Deere',
    JCB: 'JCB',
    CASE: 'Case',
    TEREX: 'Terex',
    JLG: 'JLG',
    SKYJACK: 'Skyjack',
    KALMAR: 'Kalmar',
    METSO: 'Metso',
    'P&H': 'P&H',
    TAMROCK: 'Tamrock',
    'BROCE BROOM': 'Broce Broom',
    'ATLAS COPCO': 'Atlas Copco',
    AIRMAN: 'Airman',
    BOBCAT: 'Bobcat',
    HYUNDAI: 'Hyundai',
    HITACHI: 'Hitachi',
    LIEBHERR: 'Liebherr',
    DOOSAN: 'Doosan',
    KOBELCO: 'Kobelco',
    TAKEUCHI: 'Takeuchi',
    KUBOTA: 'Kubota',
    'NEW HOLLAND': 'New Holland',
    MANITOU: 'Manitou',
    GENIE: 'Genie',
    YALE: 'Yale',
    HYSTER: 'Hyster',
    GROVE: 'Grove',
    LINK: 'Link-Belt',
    INGERSOLL: 'Ingersoll Rand',
    VERMEER: 'Vermeer',
    DITCH: 'Ditch Witch',
    WACKER: 'Wacker',
    BOMAG: 'Bomag',
    DYNAPAC: 'Dynapac',
    HAMM: 'Hamm',
    SANDVIK: 'Sandvik',
}

/**
 * Known multi-word brands to check first (longest match wins).
 * Ordered by length descending for priority matching.
 */
const MULTI_WORD_BRANDS = [
    'ATLAS COPCO',
    'BROCE BROOM',
    'JOHN DEERE',
    'NEW HOLLAND',
    'INGERSOLL RAND',
    'DITCH WITCH',
    'LINK BELT',
]

const PREFIX = 'JUEGO DE CALCAS DE RESTAURACION PARA '

/**
 * Extract the brand name from an Odoo product name.
 * Pattern: "JUEGO DE CALCAS DE RESTAURACION PARA [BRAND] [MODEL]"
 * Returns the brand display name or null if not identifiable.
 */
export function extractBrand(productName: string): string | null {
    const upper = productName.toUpperCase()

    // Strip the common prefix
    const afterPrefix = upper.startsWith(PREFIX)
        ? upper.slice(PREFIX.length).trim()
        : upper

    // Try multi-word brands first (longest match)
    for (const brand of MULTI_WORD_BRANDS) {
        if (afterPrefix.startsWith(brand)) {
            return BRAND_DISPLAY_NAMES[brand] || brand
        }
    }

    // Try single-word brand (first word after prefix)
    const firstWord = afterPrefix.split(/\s+/)[0]
    if (firstWord && BRAND_DISPLAY_NAMES[firstWord]) {
        return BRAND_DISPLAY_NAMES[firstWord]
    }

    return null
}

export interface BrandInfo {
    name: string       // Display name (e.g. "CAT")
    slug: string       // URL-safe (e.g. "cat")
    logo?: string      // Logo URL if available
    count: number      // Number of products
}

/**
 * Analyze a list of product names and extract brand counts.
 * Returns brands sorted by product count descending.
 */
export function extractBrands(
    products: { name: string }[]
): BrandInfo[] {
    const brandMap = new Map<string, number>()

    for (const p of products) {
        const brand = extractBrand(p.name)
        if (brand) {
            brandMap.set(brand, (brandMap.get(brand) || 0) + 1)
        }
    }

    return Array.from(brandMap.entries())
        .map(([name, count]) => {
            const upperName = name.toUpperCase()
            // Find logo: check exact match, then check if any BRAND_LOGOS key starts with the name
            const logo = BRAND_LOGOS[upperName] ||
                Object.entries(BRAND_LOGOS).find(([key]) => key === upperName)?.[1]
            return {
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                logo,
                count,
            }
        })
        .sort((a, b) => b.count - a.count)
}
