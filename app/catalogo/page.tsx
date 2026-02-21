import { Suspense } from "react"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { CatalogGrid } from "@/components/catalog-grid"
import { getProducts, getCategories, getAllProductNames } from "@/lib/odoo"
import { extractBrands } from "@/lib/brands"

export const revalidate = 300 // ISR: revalidate every 5 minutes

interface Props {
  searchParams: Promise<{
    page?: string
    categoria?: string
    buscar?: string
    marca?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const marca = params.marca
  const categoria = params.categoria
  const buscar = params.buscar

  let title = "Catálogo de Calcas para Maquinaria Pesada"
  let description = "Explora nuestro catálogo completo de calcomanías para maquinaria pesada. Más de 7,000 modelos de CAT, Komatsu, Volvo, JCB y más."

  if (marca) {
    title = `Calcas ${marca} | Catálogo`
    description = `Calcomanías de alta calidad para maquinaria ${marca}. Kit completo de calcas con +6 años de duración. Envío a toda la República.`
  } else if (categoria) {
    title = `${categoria} | Catálogo de Calcas`
    description = `Calcomanías para ${categoria}. Más de 7,000 modelos disponibles con +6 años de duración a la intemperie.`
  } else if (buscar) {
    title = `"${buscar}" | Búsqueda de Calcas`
    description = `Resultados de búsqueda para "${buscar}" en calcomanías para maquinaria pesada.`
  }

  return {
    title,
    description,
    alternates: {
      canonical: 'https://calcasparamaquinaria.mx/catalogo',
    },
  }
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const categoria = params.categoria || undefined
  const buscar = params.buscar || undefined
  const marca = params.marca || undefined

  const [productsResult, categories, allNames] = await Promise.all([
    getProducts(page, 24, categoria, buscar, marca),
    getCategories(),
    getAllProductNames(),
  ])

  const brands = extractBrands(allNames)

  // Breadcrumb JSON-LD
  const breadcrumbItems = [
    { '@type': 'ListItem' as const, position: 1, name: 'Inicio', item: 'https://calcasparamaquinaria.mx' },
    { '@type': 'ListItem' as const, position: 2, name: 'Catálogo', item: 'https://calcasparamaquinaria.mx/catalogo' },
  ]
  if (marca) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: `Calcas ${marca}`, item: `https://calcasparamaquinaria.mx/catalogo?marca=${encodeURIComponent(marca)}` })
  } else if (categoria) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 3, name: categoria, item: `https://calcasparamaquinaria.mx/catalogo?categoria=${encodeURIComponent(categoria)}` })
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <section className="bg-background pt-20">
        {/* Page Header */}
        <div className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-primary" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                Tienda
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {marca ? `Calcas ${marca}` : categoria ? `Calcas para ${categoria}` : 'Catálogo de Calcas'}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              {productsResult.total.toLocaleString("es-MX")} modelos disponibles. Filtra por marca, tipo de maquinaria
              o busca directamente el modelo que necesitas.
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Cargando productos...</div>}>
          <CatalogGrid
            products={productsResult.products}
            total={productsResult.total}
            page={productsResult.page}
            totalPages={productsResult.totalPages}
            categories={categories}
            brands={brands}
            currentCategory={categoria}
            currentSearch={buscar}
            currentBrand={marca}
          />
        </Suspense>
      </section>
      <Footer />
      <WhatsAppButton />
    </main>
  )
}

