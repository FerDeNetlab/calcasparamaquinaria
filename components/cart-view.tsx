"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  MessageCircle,
  ChevronRight,
  Package,
} from "lucide-react"

// This is a demo cart - in production, this would come from a cart state/context/DB
const demoCartItems = [
  {
    id: 1,
    name: "Kit Calcas CAT 320D2",
    brand: "CAT",
    price: 2850,
    quantity: 1,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/320CAT_2-wyWidLOuXCLdHtdoeZv3paV4g6rROr.png",
  },
  {
    id: 4,
    name: "Kit Calcas Komatsu PC200",
    brand: "Komatsu",
    price: 2650,
    quantity: 2,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/320CAT_1-YXHEGQlPiAbWjKumu3XyjGJWqHpxST.png",
  },
]

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

export function CartView() {
  const items = demoCartItems
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 350
  const total = subtotal + shipping

  return (
    <section className="bg-background pt-20">
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

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            {item.brand}
                          </span>
                          <h3 className="text-sm font-bold text-foreground">
                            {item.name}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0 border border-border rounded-lg">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-none">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="flex h-8 w-10 items-center justify-center text-xs font-bold text-foreground border-x border-border">
                            {item.quantity}
                          </span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-none">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-lg font-black text-foreground">
                          ${(item.price * item.quantity).toLocaleString("es-MX")}.00
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quote / Contact Form */}
              <div className="mt-8 rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Solicitar cotizacion
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Envianos tus datos y te contactamos para confirmar tu pedido y metodo de pago.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nombre
                    </label>
                    <Input
                      placeholder="Tu nombre"
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Telefono / WhatsApp
                    </label>
                    <Input
                      placeholder="+52 (___) ___ ____"
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Notas adicionales
                    </label>
                    <Textarea
                      placeholder="Modelo especifico, cantidad, dudas..."
                      rows={3}
                      className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider">
                  Enviar solicitud de cotizacion
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
                  Resumen del pedido
                </h3>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({items.length} productos)</span>
                    <span className="text-foreground">${subtotal.toLocaleString("es-MX")}.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Package className="h-3 w-3" />
                      Envio estimado
                    </span>
                    <span className="text-foreground">${shipping.toLocaleString("es-MX")}.00</span>
                  </div>
                  <div className="h-px bg-primary" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-foreground">
                      Total
                    </span>
                    <span className="text-2xl font-black text-foreground">
                      ${total.toLocaleString("es-MX")}.00
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground text-right">MXN</span>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={`https://wa.me/523315289366?text=Hola%2C%20me%20gustaria%20hacer%20un%20pedido%20por%20%24${total.toLocaleString("es-MX")}%20MXN`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90 font-bold uppercase tracking-wider">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Pedir por WhatsApp
                    </Button>
                  </a>
                  <Link href="/catalogo">
                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-secondary font-semibold"
                    >
                      Seguir comprando
                    </Button>
                  </Link>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Los precios pueden variar. Se confirmara el total al procesar tu pedido.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
