"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { withIVA, formatMXN } from "@/lib/utils"
import { productUrl } from "@/lib/slugs"
import {
  ShoppingCart,
  Zap,
  Truck,
  Shield,
  Clock,
  ChevronRight,
  Check,
} from "lucide-react"
import type { OdooProduct } from "@/lib/odoo"

const features = [
  "Vinilo de alta calidad 3M o Avery",
  "Impresion digital de alta definicion",
  "Laminado UV para proteccion solar",
  "Resistente al agua y quimicos",
  "+6 anos de duracion a la intemperie",
  "Colores exactos al original",
  "Facil instalacion",
  "Kit completo para el modelo",
]

export function ProductDetail({ product }: { product: OdooProduct }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const router = useRouter()
  const { addToCart } = useCart()

  const categoryName = product.categ_id ? product.categ_id[1] : ""
  const imageUrl = `/api/product-image/${product.id}/1024`
  const priceWithIVA = withIVA(product.list_price)

  // GTM: view_item
  useEffect(() => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ ecommerce: null })
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'MXN',
        value: priceWithIVA,
        items: [{
          item_id: String(product.id),
          item_name: product.name,
          item_category: categoryName,
          price: priceWithIVA,
          quantity: 1,
        }],
      },
    })
  }, [product.id, product.name, categoryName, priceWithIVA])

  function handleAddToCart() {
    const url = `https://calcasparamaquinaria.mx${productUrl(product.id, product.name, categoryName || undefined)}`
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: priceWithIVA,
        productUrl: url,
      })
    }

    // GTM: add_to_cart
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ ecommerce: null })
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'MXN',
        value: priceWithIVA * quantity,
        items: [{
          item_id: String(product.id),
          item_name: product.name,
          item_category: categoryName,
          price: priceWithIVA,
          quantity,
        }],
      },
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleBuyNow() {
    const url = `https://calcasparamaquinaria.mx${productUrl(product.id, product.name, categoryName || undefined)}`
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: priceWithIVA,
        productUrl: url,
      })
    }
    router.push("/carrito")
  }

  return (
    <section className="bg-background pt-28">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/catalogo" className="hover:text-primary transition-colors">Catalogo</Link>
            {categoryName && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link
                  href={`/catalogo?categoria=${encodeURIComponent(categoryName)}`}
                  className="hover:text-primary transition-colors"
                >
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-white">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              {categoryName && (
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  {categoryName}
                </span>
              )}
              <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl lg:text-4xl">
                {product.name}
              </h1>
            </div>

            {/* Price with IVA */}
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground">
                  {formatMXN(priceWithIVA)}
                </span>
                <span className="text-sm text-muted-foreground">MXN</span>
              </div>
              <span className="text-xs text-muted-foreground">Precio con IVA incluido</span>
            </div>

            {product.description_sale && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description_sale}
              </p>
            )}

            {!product.description_sale && (
              <p className="text-muted-foreground leading-relaxed">
                Kit completo de calcomanias de alta calidad para maquinaria pesada. Fabricadas en
                vinil premium con impresion de alta definicion y laminado de proteccion UV.
                Mas de 6 anos de duracion a la intemperie.
              </p>
            )}

            {/* Quantity & CTA */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Cantidad:
                </span>
                <div className="flex items-center gap-0 border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-none"
                  >
                    <span className="text-lg">−</span>
                  </Button>
                  <span className="flex h-10 w-12 items-center justify-center text-sm font-bold text-foreground border-x border-border">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 text-muted-foreground hover:text-foreground rounded-none"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Add to cart */}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAddToCart}
                  className={`flex-1 font-bold uppercase tracking-wider border-2 transition-all duration-200 ${added
                    ? "border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500/10"
                    : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                >
                  {added ? (
                    <><Check className="mr-2 h-5 w-5" />Agregado al carrito</>
                  ) : (
                    <><ShoppingCart className="mr-2 h-5 w-5" />Agregar al carrito</>
                  )}
                </Button>

                {/* Buy now → goes to cart */}
                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Comprar ahora
                </Button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <Truck className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Envio nacional</p>
                  <p className="text-xs text-muted-foreground">A toda la Republica</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <Shield className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">Garantia</p>
                  <p className="text-xs text-muted-foreground">Calidad premium</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <Clock className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-bold text-foreground">+6 anos</p>
                  <p className="text-xs text-muted-foreground">De duracion</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                Caracteristicas
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
