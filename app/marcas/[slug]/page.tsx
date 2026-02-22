import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { CatalogGrid } from "@/components/catalog-grid"
import { getProducts, getCategories, getAllProductNames } from "@/lib/odoo"
import { extractBrands, BRAND_LOGOS } from "@/lib/brands"

export const revalidate = 300

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string; categoria?: string }>
}

// Find the brand by slug
async function findBrand(slug: string) {
    const allNames = await getAllProductNames()
    const brands = extractBrands(allNames)
    return brands.find((b) => b.slug === slug) || null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const brand = await findBrand(slug)

    if (!brand) {
        return { title: "Marca no encontrada" }
    }

    return {
        title: `Calcas para ${brand.name} | Calcas para Maquinaria`,
        description: `Calcomanías de alta calidad para maquinaria ${brand.name}. ${brand.count}+ modelos disponibles con +6 años de duración a la intemperie. Envío a toda la República Mexicana.`,
        alternates: {
            canonical: `https://www.calcasparamaquinaria.mx/marcas/${brand.slug}`,
        },
        openGraph: {
            title: `Calcas para ${brand.name} | Calcas para Maquinaria`,
            description: `${brand.count}+ modelos de calcomanías para ${brand.name}. Envío a toda la República.`,
            url: `https://www.calcasparamaquinaria.mx/marcas/${brand.slug}`,
            type: "website",
        },
    }
}

export default async function BrandPage({ params, searchParams }: Props) {
    const { slug } = await params
    const sp = await searchParams
    const page = Number(sp.page) || 1
    const categoria = sp.categoria || undefined

    // Fetch brand info
    const allNames = await getAllProductNames()
    const brands = extractBrands(allNames)
    const brand = brands.find((b) => b.slug === slug)

    if (!brand) {
        notFound()
    }

    const [productsResult, categories] = await Promise.all([
        getProducts(page, 24, categoria, undefined, brand.name),
        getCategories(),
    ])

    // Find brand logo
    const upperName = brand.name.toUpperCase()
    const logo = BRAND_LOGOS[upperName]

    // JSON-LD BreadcrumbList
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Inicio",
                item: "https://www.calcasparamaquinaria.mx",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Marcas",
                item: "https://www.calcasparamaquinaria.mx/catalogo",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: `Calcas ${brand.name}`,
                item: `https://www.calcasparamaquinaria.mx/marcas/${brand.slug}`,
            },
        ],
    }

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <Navbar />
            <section className="bg-background pt-28">
                {/* Brand Header */}
                <div className="border-b border-border bg-secondary">
                    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px w-12 bg-primary" />
                            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                                Marca
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            {logo && (
                                <div className="relative h-16 w-32 flex-shrink-0">
                                    <Image
                                        src={logo}
                                        alt={`Logo ${brand.name}`}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
                                    Calcas para {brand.name}
                                </h1>
                                <p className="mt-2 text-muted-foreground leading-relaxed">
                                    {productsResult.total.toLocaleString("es-MX")} modelos de calcomanías de alta calidad para maquinaria {brand.name}.
                                    Fabricadas en vinilo premium con +6 años de duración a la intemperie.
                                </p>
                            </div>
                        </div>
                        {/* CTA */}
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href={`https://wa.me/523315289366?text=Hola%2C%20necesito%20calcas%20para%20${encodeURIComponent(brand.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1DA851]"
                            >
                                Cotizar por WhatsApp
                            </a>
                            <Link
                                href="/catalogo"
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                            >
                                Ver todas las marcas
                            </Link>
                        </div>
                    </div>
                </div>

                <Suspense
                    fallback={
                        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">
                            Cargando productos...
                        </div>
                    }
                >
                    <CatalogGrid
                        products={productsResult.products}
                        total={productsResult.total}
                        page={productsResult.page}
                        totalPages={productsResult.totalPages}
                        categories={categories}
                        brands={brands}
                        currentCategory={categoria}
                        currentBrand={brand.name}
                    />
                </Suspense>
            </section>
            <Footer />
            <WhatsAppButton />
        </main>
    )
}
