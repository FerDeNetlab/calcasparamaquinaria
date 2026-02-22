import type { MetadataRoute } from 'next'
import { getAllProductsForSitemap, getCategories, getAllProductNames } from '@/lib/odoo'
import { extractBrands } from '@/lib/brands'
import { productUrl } from '@/lib/slugs'

const BASE_URL = 'https://www.calcasparamaquinaria.mx'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all products, categories, and brands in parallel
    const [products, categories, allNames] = await Promise.all([
        getAllProductsForSitemap(),
        getCategories(),
        getAllProductNames(),
    ])

    const brands = extractBrands(allNames)

    // ─── Static pages ─────────────────────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/catalogo`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
    ]

    // ─── Brand pages (high SEO value) ─────────────────────────────────────
    const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
        url: `${BASE_URL}/marcas/${brand.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }))

    // ─── Category pages ───────────────────────────────────────────────────
    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${BASE_URL}/catalogo?categoria=${encodeURIComponent(cat.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // ─── Individual product pages ─────────────────────────────────────────
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${BASE_URL}${productUrl(product.id, product.name, product.categ_id ? product.categ_id[1] : undefined)}`,
        lastModified: new Date(product.write_date),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    return [...staticPages, ...brandPages, ...categoryPages, ...productPages]
}
