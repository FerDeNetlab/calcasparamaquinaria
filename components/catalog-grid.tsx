"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SmartSearch } from "@/components/smart-search"
import { useCart } from "@/contexts/cart-context"
import { withIVA, formatMXN } from "@/lib/utils"
import {
  Search,
  ShoppingCart,
  Eye,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import type { OdooProduct, OdooCategory } from "@/lib/odoo"
import { productUrl } from "@/lib/slugs"
import type { BrandInfo } from "@/lib/brands"

interface CatalogGridProps {
  products: OdooProduct[]
  total: number
  page: number
  totalPages: number
  categories: OdooCategory[]
  brands: BrandInfo[]
  currentCategory?: string
  currentSearch?: string
  currentBrand?: string
}

export function CatalogGrid({
  products,
  total,
  page,
  totalPages,
  categories,
  brands,
  currentCategory,
  currentSearch,
  currentBrand,
}: CatalogGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(!!currentCategory)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const { addToCart } = useCart()

  // Navigate with updated search params (triggers server-side fetch)
  function navigate(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    // Reset to page 1 when changing filters
    if (!updates.page) {
      params.delete("page")
    }
    router.push(`/catalogo?${params.toString()}`)
  }

  function handleCategoryClick(catName: string) {
    if (catName === currentCategory) {
      navigate({ categoria: undefined })
    } else {
      navigate({ categoria: catName })
    }
  }

  function handleBrandClick(brandName: string) {
    if (brandName === currentBrand) {
      navigate({ marca: undefined })
    } else {
      navigate({ marca: brandName })
    }
  }

  function clearFilters() {
    router.push("/catalogo")
  }

  function handleAddToCart(product: OdooProduct) {
    const url = `https://calcasparamaquinaria.mx${productUrl(product.id, product.name, product.categ_id ? product.categ_id[1] : undefined)}`
    addToCart({
      id: product.id,
      name: product.name,
      price: withIVA(product.list_price),
      productUrl: url,
    })
    // Show brief "added" feedback
    setAddedIds((prev) => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 1500)
  }

  const hasActiveFilters = !!currentCategory || !!currentSearch || !!currentBrand

  // Show top categories (those with most products) + current one
  const visibleCategories = categories.slice(0, 15)
  // Show top brands with logos first, then others
  const visibleBrands = brands.slice(0, 20)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Search and Filters Bar */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <SmartSearch currentSearch={currentSearch} currentBrand={currentBrand} />
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-border gap-2 ${showFilters ? "bg-primary text-primary-foreground" : "text-foreground"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          <div className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Brand suggestion pills */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filtrar por marca
          </label>
          <div className="flex flex-wrap gap-2">
            {visibleBrands.map((brand) => (
              <button
                key={brand.name}
                onClick={() => handleBrandClick(brand.name)}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${currentBrand === brand.name
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5"
                  }`}
              >
                {brand.logo && (
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={20}
                    height={20}
                    className={`object-contain ${currentBrand === brand.name
                      ? "brightness-200"
                      : "opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                      } transition-all duration-200`}
                  />
                )}
                {brand.name}
                <span className={`text-xs ${currentBrand === brand.name ? "opacity-75" : "opacity-50"}`}>
                  ({brand.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category filter pills */}
        {showFilters && (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo de maquinaria
              </label>
              <div className="flex flex-wrap gap-2">
                {visibleCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`rounded-sm px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${currentCategory === cat.name
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {cat.name} <span className="opacity-60">({cat.product_count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filters & count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{total.toLocaleString("es-MX")}</strong> productos encontrados
            {currentBrand && (
              <span> de <strong className="text-primary">{currentBrand}</strong></span>
            )}
            {currentCategory && (
              <span> en <strong className="text-primary">{currentCategory}</strong></span>
            )}
            {currentSearch && (
              <span> para &quot;<strong className="text-foreground">{currentSearch}</strong>&quot;</span>
            )}
          </p>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-primary gap-1"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const priceWithIVA = withIVA(product.list_price)
            const isAdded = addedIds.has(product.id)
            return (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50"
              >
                <div className="relative aspect-square overflow-hidden bg-white p-4">
                  <Image
                    src={`/api/product-image/${product.id}/256`}
                    alt={product.name}
                    fill
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Link href={productUrl(product.id, product.name, product.categ_id ? product.categ_id[1] : undefined)}>
                      <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalle</span>
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleAddToCart(product)}
                      className={`border-foreground/20 h-10 w-10 transition-all duration-200 ${isAdded
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
                        }`}
                    >
                      {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                      <span className="sr-only">Agregar al carrito</span>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  {product.categ_id && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {product.categ_id[1]}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-foreground line-clamp-2">{product.name}</h3>
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-foreground">
                        {formatMXN(priceWithIVA)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">IVA incluido</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className={`text-xs transition-all duration-200 ${isAdded
                        ? "bg-green-500 hover:bg-green-500 text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                    >
                      {isAdded ? (
                        <><Check className="mr-1 h-3 w-3" />Agregado</>
                      ) : (
                        <><ShoppingCart className="mr-1 h-3 w-3" />Agregar</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => {
            const priceWithIVA = withIVA(product.list_price)
            const isAdded = addedIds.has(product.id)
            return (
              <div
                key={product.id}
                className="group flex items-center gap-4 overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50"
              >
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={`/api/product-image/${product.id}/128`}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  {product.categ_id && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {product.categ_id[1]}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-foreground">{product.name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-foreground">
                      {formatMXN(priceWithIVA)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">IVA inc.</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={productUrl(product.id, product.name, product.categ_id ? product.categ_id[1] : undefined)}>
                      <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-primary hover:text-primary-foreground">
                        <Eye className="mr-1 h-3 w-3" />
                        Ver
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className={`transition-all duration-200 ${isAdded
                        ? "bg-green-500 hover:bg-green-500 text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                    >
                      {isAdded ? (
                        <><Check className="mr-1 h-3 w-3" />Listo</>
                      ) : (
                        <><ShoppingCart className="mr-1 h-3 w-3" />Agregar</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => navigate({ page: String(page - 1) })}
            className="border-border text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate({ page: String(pageNum) })}
                  className={
                    pageNum === page
                      ? "bg-primary text-primary-foreground"
                      : "border-border text-foreground"
                  }
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => navigate({ page: String(page + 1) })}
            className="border-border text-foreground"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No se encontraron productos</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            No encontramos resultados con esos filtros. Intenta ajustando tu busqueda o contactanos
            para fabricar la calca que necesitas a medida.
          </p>
          <a href="https://wa.me/523315289366" target="_blank" rel="noopener noreferrer">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Solicitar calca personalizada
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
