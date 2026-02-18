import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { BrandsSection } from "@/components/brands-section"
import { FeaturedProducts } from "@/components/featured-products"
import { CtaSection } from "@/components/cta-section"
import { QualitySection } from "@/components/quality-section"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const revalidate = 300 // ISR: revalidate every 5 minutes

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <BrandsSection />
      <Suspense fallback={
        <section className="bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center text-muted-foreground">
            Cargando productos destacados...
          </div>
        </section>
      }>
        <FeaturedProducts />
      </Suspense>
      <CtaSection />
      <QualitySection />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
