"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "¿Cuánto tiempo duran las calcomanías?",
        answer:
            "Nuestras calcomanías están fabricadas con vinilo premium 3M o Avery con laminado de protección UV. En condiciones normales de uso a la intemperie, duran más de 6 años sin perder color ni adherencia.",
    },
    {
        question: "¿Hacen envíos a toda la República Mexicana?",
        answer:
            "Sí, enviamos a toda la República Mexicana a través de paqueterías confiables como FedEx, DHL y Estafeta. Todos los envíos incluyen número de rastreo para que pueda seguir su pedido en tiempo real.",
    },
    {
        question: "¿Puedo pedir calcas de un modelo que no está en el catálogo?",
        answer:
            "¡Por supuesto! Si no encuentra el modelo que busca en nuestro catálogo de +7,000 modelos, contáctenos por WhatsApp y fabricamos su calca a medida en tiempo récord. Solo necesitamos las medidas y el modelo de su maquinaria.",
    },
    {
        question: "¿Cómo se instalan las calcomanías?",
        answer:
            "La instalación es sencilla. Las calcas vienen listas para aplicar: solo necesita limpiar la superficie, retirar el papel protector y pegar. Incluimos instrucciones con cada pedido. Si necesita ayuda, nuestro equipo le asiste por WhatsApp.",
    },
    {
        question: "¿Qué formas de pago aceptan?",
        answer:
            "Aceptamos transferencia bancaria, depósito en efectivo (OXXO), y pago por WhatsApp. Para pedidos mayoristas ofrecemos condiciones especiales de pago. Contáctenos para más información.",
    },
    {
        question: "¿Tienen garantía?",
        answer:
            "Sí. Todas nuestras calcomanías tienen garantía total contra defectos de fabricación. Si su calca presenta algún problema de color, impresión o adherencia, la reponemos sin costo adicional. Su satisfacción es nuestra prioridad.",
    },
]

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section className="bg-secondary py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 lg:px-8">
                {/* Section Header */}
                <div className="mb-12 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <div className="h-px w-12 bg-primary" />
                        <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                            FAQ
                        </span>
                        <div className="h-px w-12 bg-primary" />
                    </div>
                    <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
                        Preguntas frecuentes
                    </h2>
                </div>

                {/* FAQ Items */}
                <div className="flex flex-col gap-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-border bg-card overflow-hidden transition-colors hover:border-primary/30"
                        >
                            <button
                                onClick={() =>
                                    setOpenIndex(openIndex === index ? null : index)
                                }
                                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                            >
                                <span className="text-sm font-bold text-foreground sm:text-base">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <div
                                className={`grid transition-all duration-300 ease-in-out ${openIndex === index
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
