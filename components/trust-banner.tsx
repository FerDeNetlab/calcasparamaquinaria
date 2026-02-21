import { Truck, Phone, Package } from "lucide-react"

export function TrustBanner() {
    return (
        <div className="bg-primary text-primary-foreground">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2 text-xs font-semibold tracking-wide sm:gap-8 sm:text-sm lg:px-8">
                <span className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Envío a toda la República</span>
                    <span className="sm:hidden">Envío nacional</span>
                </span>
                <span className="hidden sm:inline text-primary-foreground/40">|</span>
                <a
                    href="tel:+523315289366"
                    className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                >
                    <Phone className="h-3.5 w-3.5" />
                    (33) 1528-9366
                </a>
                <span className="hidden sm:inline text-primary-foreground/40">|</span>
                <span className="hidden sm:flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    +7,000 modelos
                </span>
            </div>
        </div>
    )
}
