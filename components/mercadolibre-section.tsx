import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, CreditCard, Truck, Star, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const MELI_STORE_URL = "https://www.mercadolibre.com.mx/pagina/calcasparamaquinariamx"

const benefits = [
    {
        icon: ShieldCheck,
        title: "Compra protegida",
        description: "Tu dinero está seguro hasta que recibas el producto.",
    },
    {
        icon: CreditCard,
        title: "Paga como quieras",
        description: "Tarjeta de crédito, débito, efectivo en OXXO, o a meses sin intereses.",
    },
    {
        icon: Truck,
        title: "Envío gratis",
        description: "Envíos gratis en productos seleccionados a toda la República.",
    },
    {
        icon: Star,
        title: "Vendedor certificado",
        description: "Somos MercadoLíder con reputación dorada y cientos de ventas.",
    },
]

export function MercadoLibreSection() {
    return (
        <section className="relative overflow-hidden bg-background py-20 lg:py-28">
            {/* Subtle MeLi yellow gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FFE600]/[0.03] via-transparent to-transparent" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <div className="text-center mb-14">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-px w-12 bg-[#FFE600]" />
                        <span className="text-sm font-semibold uppercase tracking-widest text-[#FFE600]">
                            También en MercadoLibre
                        </span>
                        <div className="h-px w-12 bg-[#FFE600]" />
                    </div>
                    <h2 className="text-balance text-3xl font-black uppercase leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
                        Compra con total{" "}
                        <span className="text-[#FFE600]">confianza</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Si prefieres la seguridad de MercadoLibre, también puedes encontrar
                        nuestros productos ahí. Misma calidad, con la protección de compra de Meli.
                    </p>
                </div>

                {/* Benefits grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
                    {benefits.map((benefit) => (
                        <div
                            key={benefit.title}
                            className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-[#FFE600]/50 hover:shadow-lg hover:shadow-[#FFE600]/5"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE600]/10 transition-colors group-hover:bg-[#FFE600]/20">
                                <benefit.icon className="h-6 w-6 text-[#FFE600]" />
                            </div>
                            <h3 className="mb-2 text-base font-bold text-foreground">{benefit.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Card */}
                <div className="relative rounded-2xl border border-[#FFE600]/20 bg-gradient-to-r from-[#FFE600]/5 to-[#FFE600]/10 p-8 sm:p-10">
                    <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
                        {/* MeLi logo / branding */}
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl overflow-hidden bg-[#FFE600]">
                            <Image
                                src="/mercadolibre-icon.jpg"
                                alt="MercadoLibre"
                                width={80}
                                height={80}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                                Visita nuestra tienda oficial en MercadoLibre
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                                Encuentra nuestro catálogo de calcomanías con envío a todo México,
                                pago a meses sin intereses y garantía de compra protegida.
                            </p>
                        </div>

                        <Link
                            href={MELI_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0"
                        >
                            <Button
                                size="lg"
                                className="bg-[#FFE600] text-black hover:bg-[#FFE600]/90 font-bold uppercase tracking-wider text-base px-8 shadow-lg shadow-[#FFE600]/20"
                            >
                                Ir a MercadoLibre
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Trust note */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    MercadoLibre® es una marca registrada de MercadoLibre S.R.L. No tenemos relación comercial directa con MercadoLibre más allá de ser vendedores en su plataforma.
                </p>
            </div>
        </section>
    )
}
