import { Shield, Sun, Droplets, Truck, Clock, Award } from "lucide-react"

const features = [
  {
    icon: Sun,
    title: "Resistente a UV",
    description: "Material de alta resistencia a los rayos ultravioleta que mantiene los colores vibrantes.",
  },
  {
    icon: Droplets,
    title: "A prueba de agua",
    description: "Totalmente resistentes al agua, lluvia y condiciones de humedad extrema.",
  },
  {
    icon: Clock,
    title: "+6 años de duración",
    description: "Garantía de más de 6 años de duración a la intemperie en condiciones normales de uso.",
  },
  {
    icon: Shield,
    title: "Calidad premium",
    description: "Vinilo de la mas alta calidad con impresion de alta definicion y colores exactos.",
  },
  {
    icon: Truck,
    title: "Envio nacional",
    description: "Enviamos a toda la República Mexicana con paqueterias confiables y rastreo.",
  },
  {
    icon: Award,
    title: "Garantía total",
    description: "Si su calca presenta defectos de fabrica, la reponemos sin costo adicional.",
  },
]

export function QualitySection() {
  return (
    <section id="nosotros" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Calidad
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Por que elegirnos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Nuestras calcomanías estan fabricadas con los mas altos estandares de calidad
            para soportar las condiciones mas exigentes de trabajo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
