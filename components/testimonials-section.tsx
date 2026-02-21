import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        name: "José Magaña",
        company: "TRACSA",
        text: "Excelente servicio, tiempos de entrega excelentes y productos de altísima calidad. Cuentan con envíos a toda la República. 100% recomendado.",
        rating: 5,
    },
    {
        name: "Margarito Mijangos Santos",
        company: "Kubota México",
        text: "En Kubota México estamos muy satisfechos con rapidez de respuesta a nuestros requerimientos, las etiquetas de muy buena calidad.",
        rating: 5,
    },
    {
        name: "Jesus Esquivel",
        company: "GDL",
        text: "Calcas de la mejor calidad. Todas las marcas y modelos a buen precio. 13 años trabajando con ellos, pedidos en tiempo y forma.",
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
                    {/* Google aggregate rating */}
                    <div className="mx-auto mt-5 flex items-center justify-center gap-2">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                            ))}
                        </div>
                        <span className="text-lg font-bold text-foreground">4.9</span>
                        <span className="text-sm text-muted-foreground">— 32 reseñas en Google</span>
                    </div>
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
                                    {testimonial.company}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
