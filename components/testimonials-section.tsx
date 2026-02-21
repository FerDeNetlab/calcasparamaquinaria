import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        name: "Roberto Hernández",
        role: "Gerente de Flotilla",
        company: "Constructora del Norte",
        text: "Llevamos 3 años comprando con ellos. Las calcas son idénticas a las originales y resisten lluvia, sol y tierra sin problema. Excelente calidad.",
        rating: 5,
    },
    {
        name: "María Luisa Torres",
        role: "Encargada de Mantenimiento",
        company: "Grupo Minero Occidental",
        text: "Necesitábamos calcas para 12 excavadoras CAT y nos las entregaron en tiempo récord. La atención por WhatsApp fue muy rápida y profesional.",
        rating: 5,
    },
    {
        name: "Carlos Martínez",
        role: "Propietario",
        company: "Renta de Maquinaria GMC",
        text: "Lo que más me gusta es que tienen prácticamente cualquier modelo. He pedido calcas para Komatsu, Volvo y JCB y todas han quedado perfectas.",
        rating: 5,
    },
]

export function TestimonialsSection() {
    return (
        <section className="bg-background py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Section Header */}
                <div className="mb-16 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <div className="h-px w-12 bg-primary" />
                        <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                            Testimonios
                        </span>
                        <div className="h-px w-12 bg-primary" />
                    </div>
                    <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
                        Lo que dicen nuestros clientes
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                        Empresas y operadores de toda la República confían en nuestras calcomanías para mantener su maquinaria como nueva.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.name}
                            className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50"
                        >
                            {/* Quote icon */}
                            <Quote className="h-8 w-8 text-primary/20" />

                            {/* Stars */}
                            <div className="flex gap-0.5">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-4 w-4 fill-primary text-primary"
                                    />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="flex-1 text-sm leading-relaxed text-muted-foreground italic">
                                &ldquo;{testimonial.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="border-t border-border pt-4">
                                <p className="text-sm font-bold text-foreground">
                                    {testimonial.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {testimonial.role} — {testimonial.company}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
