import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, ArrowRight } from "lucide-react"
import { getFeaturedProducts } from "@/lib/odoo"
import type { OdooProduct } from "@/lib/odoo"
import { productUrl } from "@/lib/slugs"
import { withIVA, formatMXN } from "@/lib/utils"

function ProductCard({ product }: { product: OdooProduct }) {
  const priceWithIVA = withIVA(product.list_price)
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white p-4">
        <Image
          src={`/api/product-image/${product.id}?size=256`}
          alt={product.name}
          fill
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Quick actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link href={productUrl(product.id, product.name, product.categ_id ? product.categ_id[1] : undefined)}>
            <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10">
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver detalle</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categ_id && (
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {product.categ_id[1]}
          </span>
        )}
        <h3 className="text-sm font-bold text-foreground line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-lg font-black text-foreground">
              {formatMXN(priceWithIVA)}
            </span>
            <span className="text-[10px] text-muted-foreground">IVA incluido</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(6)

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-12 bg-primary" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                Catalogo
              </span>
            </div>
            <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Productos destacados
            </h2>
          </div>
          <Link href="/catalogo">
            <Button variant="outline" className="border-border text-foreground hover:bg-primary hover:text-primary-foreground font-semibold uppercase tracking-wider">
              Ver todo el catalogo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
