import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle } from "lucide-react"

const quickLinks = [
  { label: "Inicio", href: "/" },
  { label: "Catalogo", href: "/catalogo" },
  { label: "Marcas", href: "/#marcas" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
]

const brandLinks = [
  { label: "CAT", value: "CAT" },
  { label: "Komatsu", value: "Komatsu" },
  { label: "Volvo", value: "Volvo" },
  { label: "John Deere", value: "John Deere" },
  { label: "JCB", value: "JCB" },
  { label: "Case", value: "Case" },
  { label: "Terex", value: "Terex" },
  { label: "JLG", value: "JLG" },
]

export function Footer() {
  return (
    <footer id="contacto" className="bg-card border-t border-border">

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RASGADO%20COM%20MX%20w%20v2-pwTMy809i4tSdCEEEOcXvXlI1HdQvM.png"
              alt="Calcas para Maquinaria"
              width={220}
              height={50}
              className="h-10 w-auto object-contain"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Calcomanias de alta calidad para maquinaria pesada. Mas de 7,000 modelos
              disponibles con +6 anos de duracion a la intemperie.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com" // TODO: Reemplazar con URL real de Facebook
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com" // TODO: Reemplazar con URL real de Instagram
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://wa.me/523315289366"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="sr-only">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Navegacion
            </h3>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Marcas
            </h3>
            <ul className="flex flex-col gap-3">
              {brandLinks.map((brand) => (
                <li key={brand.value}>
                  <Link
                    href={`/catalogo?marca=${encodeURIComponent(brand.value)}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Calcas {brand.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Contacto
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <a href="tel:+523315289366" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    +52 (33) 1528 9366
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <a href="mailto:ventas@calcasparamaquinaria.mx" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ventas@calcasparamaquinaria.mx
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Calle Cuauhtemoc 93, Analco,<br />
                  Guadalajara, Jalisco, CP 44450
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Lun - Vie: 9:00 - 18:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/publim_logo_ok-gfPbQ4BtBvXrF5CKPpsUBazRiPQuG6.png"
              alt="Publim S.A. de C.V."
              width={80}
              height={30}
              className="h-5 w-auto opacity-50"
            />
            <span>© {new Date().getFullYear()} Publim S.A. de C.V. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/aviso-de-privacidad" className="hover:text-primary transition-colors">
              Aviso de Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-primary transition-colors">
              Terminos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
