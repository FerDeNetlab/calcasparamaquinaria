"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { formatMXN } from "@/lib/utils"
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  MessageCircle,
  ChevronRight,
} from "lucide-react"

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Tu carrito esta vacio</h2>
        <p className="mt-2 text-muted-foreground">
          Agrega productos a tu carrito para comenzar tu pedido.
        </p>
      </div>
      <Link href="/catalogo">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider">
          Ver catalogo
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CartView() {
  const { items, subtotal, removeFromCart, updateQuantity } = useCart()

  // Customer form state
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [direccion, setDireccion] = useState("")
  const [factura, setFactura] = useState<"si" | "no">("no")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!nombre.trim()) e.nombre = "Por favor ingresa tu nombre"
    if (!correo.trim()) e.correo = "Por favor ingresa tu correo"
    if (!direccion.trim()) e.direccion = "Por favor ingresa tu direccion de envio"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function buildWhatsAppMessage() {
    const SITE = "https://calcasparamaquinaria.mx"

    const productLines = items
      .map((item, i) => {
        const url = item.productUrl.startsWith("http")
          ? item.productUrl
          : `${SITE}${item.productUrl}`
        const qty = item.quantity > 1 ? ` x${item.quantity}` : ""
        return `  ${i + 1}. *${item.name}*${qty}\n     ${url}\n     ${formatMXN(item.price * item.quantity)}`
      })
      .join("\n\n")

    const msg = [
      `Hola, soy *${nombre.trim()}* y me gustaria hacer un pedido.`,
      ``,
      `--------------------`,
      `*PRODUCTOS SELECCIONADOS*`,
      `--------------------`,
      ``,
      productLines,
      ``,
      `--------------------`,
      `*TOTAL: ${formatMXN(subtotal)}* _(IVA incluido)_`,
      `--------------------`,
      ``,
      `*MIS DATOS*`,
      `Correo: ${correo.trim()}`,
      `Direccion de envio: ${direccion.trim()}`,
      `Factura: ${factura === "si" ? "Si" : "No"}`,
      ``,
      `Quedo en espera de su confirmacion.`,
    ].join("\n")

    return msg
  }



  function handleSendWhatsApp() {
    if (!validate()) return
    const msg = buildWhatsAppMessage()
    const url = `https://wa.me/523315289366?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (items.length === 0) {
    return (
      <section className="bg-background pt-28">
        <div className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Carrito</span>
            </nav>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <h1 className="mb-8 text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl">
            Carrito de compras
          </h1>
          <EmptyCart />
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background pt-28">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Carrito</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <h1 className="mb-8 text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl">
          Carrito de compras
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column: items + form */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Cart Items */}
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={`/api/product-image/${item.id}/128`}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-foreground line-clamp-2 pr-2">
                        {item.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0 border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 text-muted-foreground rounded-none"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="flex h-8 w-10 items-center justify-center text-xs font-bold text-foreground border-x border-border">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 text-muted-foreground rounded-none"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-foreground">
                          {formatMXN(item.price * item.quantity)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">IVA incluido</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Data Form */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                <MessageCircle className="h-4 w-4 text-primary" />
                Tus datos para el pedido
              </h3>
              <p className="mb-5 text-sm text-muted-foreground">
                Completa tus datos y te enviamos al WhatsApp con tu pedido listo.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nombre completo <span className="text-primary">*</span>
                  </label>
                  <Input
                    placeholder="Tu nombre completo"
                    value={nombre}
                    onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: "" })) }}
                    className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${errors.nombre ? "border-red-500" : ""}`}
                  />
                  {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                </div>

                {/* Correo */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Correo electronico <span className="text-primary">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="tu@correo.com"
                    value={correo}
                    onChange={(e) => { setCorreo(e.target.value); setErrors((p) => ({ ...p, correo: "" })) }}
                    className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${errors.correo ? "border-red-500" : ""}`}
                  />
                  {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
                </div>

                {/* Dirección */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Direccion de envio <span className="text-primary">*</span>
                  </label>
                  <Input
                    placeholder="Calle, numero, colonia, ciudad, estado, CP"
                    value={direccion}
                    onChange={(e) => { setDireccion(e.target.value); setErrors((p) => ({ ...p, direccion: "" })) }}
                    className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${errors.direccion ? "border-red-500" : ""}`}
                  />
                  {errors.direccion && <p className="mt-1 text-xs text-red-500">{errors.direccion}</p>}
                </div>

                {/* Factura */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Necesitas factura?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFactura("no")}
                      className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all duration-200 ${factura === "no"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFactura("si")}
                      className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all duration-200 ${factura === "si"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                    >
                      Sí
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
                Resumen del pedido
              </h3>

              {/* Item list summary */}
              <div className="mb-4 flex flex-col gap-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-muted-foreground line-clamp-2 flex-1">
                      {item.name}
                      {item.quantity > 1 && <span className="text-primary"> ×{item.quantity}</span>}
                    </span>
                    <span className="flex-shrink-0 font-semibold text-foreground">
                      {formatMXN(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border mb-4" />

              <div className="flex items-center justify-between mb-1">
                <span className="font-bold uppercase tracking-wider text-foreground">Total</span>
                <span className="text-2xl font-black text-foreground">
                  {formatMXN(subtotal)}
                </span>
              </div>
              <p className="text-right text-xs text-muted-foreground mb-6">MXN · IVA incluido</p>

              {/* WhatsApp CTA */}
              <Button
                onClick={handleSendWhatsApp}
                className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90 font-bold uppercase tracking-wider text-sm"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar pedido por WhatsApp
              </Button>

              <Link href="/catalogo" className="block mt-3">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-secondary font-semibold"
                >
                  Seguir comprando
                </Button>
              </Link>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Al hacer clic se abrira WhatsApp con tu pedido listo para enviar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
