import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ProductDetail } from "@/components/product-detail"
import { getProductById } from "@/lib/odoo"
import { extractIdFromSlug, productUrl } from "@/lib/slugs"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"

export const revalidate = 600 // ISR: revalidate every 10 minutes

type Props = {
    params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const id = extractIdFromSlug(slug)
    if (!id) return { title: "Producto no encontrado" }

    const product = await getProductById(id)
    if (!product) return { title: "Producto no encontrado" }

    const categoryName = product.categ_id ? product.categ_id[1] : "maquinaria pesada"
    const description =
        product.description_sale ||
        `Kit de calcomanias de alta calidad para ${product.name}. Tipo: ${categoryName}. +6 anos de duracion a la intemperie. Envio a toda la Republica.`

    return {
        title: product.name,
        description,
        openGraph: {
            title: `${product.name} | Calcas para Maquinaria`,
            description,
            url: `https://calcasparamaquinaria.mx${productUrl(product.id, product.name, categoryName)}`,
            images: [`https://calcasparamaquinaria.mx/api/product-image/${id}?size=1024`],
            type: 'article',
        },
        alternates: {
            canonical: `https://calcasparamaquinaria.mx${productUrl(product.id, product.name, categoryName)}`,
        },
    }
}

export default async function ProductoPage({ params }: Props) {
    const { category, slug } = await params
    const id = extractIdFromSlug(slug)

    if (!id) notFound()

    const product = await getProductById(id)
    if (!product) notFound()

    // If URL doesn't match the canonical slug, redirect (SEO canonical enforcement)
    const categoryName = product.categ_id ? product.categ_id[1] : ""
    const canonicalPath = productUrl(product.id, product.name, categoryName || undefined)
    const currentPath = `/producto/${category}/${slug}`
    if (currentPath !== canonicalPath) {
        redirect(canonicalPath)
    }

    // JSON-LD Product structured data for rich results
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description:
            product.description_sale ||
            `Kit de calcomanias de alta calidad para ${product.name}. +6 anos de duracion a la intemperie.`,
        image: `https://calcasparamaquinaria.mx/api/product-image/${id}?size=1024`,
        brand: {
            "@type": "Brand",
            name: "Calcas para Maquinaria",
        },
        category: categoryName || "Maquinaria Pesada",
        offers: {
            "@type": "Offer",
            url: `https://calcasparamaquinaria.mx${canonicalPath}`,
            priceCurrency: "MXN",
            price: product.list_price,
            availability: "https://schema.org/InStock",
            seller: {
                "@type": "Organization",
                name: "Calcas para Maquinaria",
            },
        },
    }

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />
            <ProductDetail product={product} />
            <Footer />
            <WhatsAppButton />
        </main>
    )
}
