import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, Package } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center bg-background pt-16 overflow-hidden">
      {/* Background texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg_ok-6A4YNS8D5rnjpkRHeRhgcHv1QuXWwM.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/80" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-4">

          {/* Left column: Text content */}
          <div className="flex-1 py-10 sm:py-14 lg:py-20">
            <div className="flex flex-col gap-5 sm:gap-6 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-primary" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Calcas para Maquinaria
                </span>
              </div>

              <h1 className="text-balance text-4xl font-black uppercase leading-none tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                Sumamos{" "}
                <span className="text-primary">VALOR</span>{" "}
                a su equipo
              </h1>

              <p className="max-w-md lg:max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground">
                Mas de <strong className="text-foreground">7,000 modelos</strong> de calcomanias
                de alta calidad para maquinaria pesada con{" "}
                <strong className="text-foreground">+6 anos de duracion</strong> a la intemperie.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link href="/catalogo">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-base px-8"
                  >
                    Encontrar Mi Calca
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="https://wa.me/523315289366?text=Hola%2C%20quiero%20cotizar%20calcas%20para%20mi%20maquinaria" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-border text-foreground hover:bg-secondary hover:text-primary font-bold uppercase tracking-wider text-base px-8"
                  >
                    Cotizar por WhatsApp
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl font-black text-foreground">7,000+</p>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">Modelos</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl font-black text-foreground">+6 años</p>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">Durabilidad</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl font-black text-foreground">20+</p>
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">Marcas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Excavator image - has its own dedicated space */}
          <div className="relative flex-shrink-0 lg:w-[55%] self-end pointer-events-none -mb-1" style={{ marginRight: 'calc(-1 * (100vw - 100%) / 2)' }}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/320CAT_2-wyWidLOuXCLdHtdoeZv3paV4g6rROr.png"
              alt="Excavadora CAT 320 con calcomanias de alta calidad"
              width={900}
              height={650}
              className="w-full h-auto object-contain"
              priority
            />
            {/* Fade bottom edge so dirt blends with background */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent" />
          </div>

        </div>
      </div>
    </section>
  )
}
