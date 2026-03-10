import { Suspense } from "react"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { BrandsSection } from "@/components/brands-section"
import { FeaturedProducts } from "@/components/featured-products"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaSection } from "@/components/cta-section"
import { FaqSection } from "@/components/faq-section"
import { QualitySection } from "@/components/quality-section"
import { MercadoLibreSection } from "@/components/mercadolibre-section"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export const revalidate = 300 // ISR: revalidate every 5 minutes

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Calcas para Maquinaria",
  image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RASGADO%20COM%20MX%20w%20v2-pwTMy809i4tSdCEEEOcXvXlI1HdQvM.png",
  url: "https://www.calcasparamaquinaria.mx",
  telephone: "+52-33-1528-9366",
  email: "ventas@calcasparamaquinaria.mx",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Cuauhtémoc 93, Analco",
    addressLocality: "Guadalajara",
    addressRegion: "Jalisco",
    postalCode: "44450",
    addressCountry: "MX",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  priceRange: "$$",
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto tiempo duran las calcomanías?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nuestras calcomanías están fabricadas con vinilo premium 3M o Avery con laminado de protección UV. En condiciones normales de uso a la intemperie, duran más de 6 años sin perder color ni adherencia.",
      },
    },
    {
      "@type": "Question",
      name: "¿Hacen envíos a toda la República Mexicana?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, enviamos a toda la República Mexicana a través de paqueterías confiables como FedEx, DHL y Estafeta. Todos los envíos incluyen número de rastreo.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo pedir calcas de un modelo que no está en el catálogo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "¡Por supuesto! Si no encuentra el modelo que busca en nuestro catálogo de +7,000 modelos, contáctenos por WhatsApp y fabricamos su calca a medida en tiempo récord.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo se instalan las calcomanías?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La instalación es sencilla. Las calcas vienen listas para aplicar: solo necesita limpiar la superficie, retirar el papel protector y pegar. Incluimos instrucciones con cada pedido.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué formas de pago aceptan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Aceptamos transferencia bancaria, depósito en efectivo (OXXO), y pago por WhatsApp. Para pedidos mayoristas ofrecemos condiciones especiales.",
      },
    },
    {
      "@type": "Question",
      name: "¿Tienen garantía?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Todas nuestras calcomanías tienen garantía total contra defectos de fabricación. Si su calca presenta algún problema, la reponemos sin costo adicional.",
      },
    },
  ],
}

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />
      <HeroSection />
      <MercadoLibreSection />
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
      <TestimonialsSection />
      <CtaSection />
      <FaqSection />
      <QualitySection />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}

