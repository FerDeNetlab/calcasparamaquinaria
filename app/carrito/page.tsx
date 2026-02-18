import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { CartView } from "@/components/cart-view"

export const metadata = {
  title: "Carrito | Calcas para Maquinaria",
  description: "Revisa tu carrito de compras y completa tu pedido.",
}

export default function CarritoPage() {
  return (
    <main>
      <Navbar />
      <CartView />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
