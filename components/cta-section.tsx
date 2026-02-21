import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-secondary py-20 lg:py-28">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cargador_retro_moto-9Vza7unoEqWvQhcBLBkEZBpq62cnAF.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-secondary/90" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-primary" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                Personalizado
              </span>
            </div>
            <h2 className="text-balance text-3xl font-black uppercase leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
              ¿No encuentra el modelo que busca?
            </h2>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Con más de <strong className="text-foreground">7,000 modelos</strong> en catálogo,
              tenemos lo que necesita. Y si no lo tenemos, lo{" "}
              <strong className="text-foreground">fabricamos a su medida</strong> en tiempo récord.
            </p>
            <p className="text-sm font-semibold text-primary">
              ⭐ Más de 500 empresas ya confían en nuestras calcas
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="https://wa.me/523315289366?text=Hola%2C%20necesito%20cotizar%20calcas%20personalizadas%20para%20mi%20maquinaria" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Escribenos por WhatsApp
                </Button>
              </a>
              <a href="tel:+523315289366">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider"
                >
                  Llamar ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Slogan Image */}
          <div className="flex items-center justify-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sumamos%20Valor-KruGlxY1oUkNo4jqfiukTpCDFcQbjC.png"
              alt="Sumamos VALOR a su equipo"
              width={500}
              height={200}
              className="w-full max-w-md"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
