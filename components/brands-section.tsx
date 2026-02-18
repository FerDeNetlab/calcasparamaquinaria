import Link from "next/link"
import Image from "next/image"

const brands = [
  { name: "CAT", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cat-bAaDge5pmzj678ppBYbSqXY9gTle6s.png" },
  { name: "Volvo", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/volvo-iY0XsNv8mpH1zHfuFLJBSpnfZ9rGh6.png" },
  { name: "Komatsu", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/komatsu-qH5Rhoq8YueOkOApalE49Wa1Qb29Xa.png" },
  { name: "John Deere", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deere-KUEMgOj4TyXW7wZqxjL89yQEJVmPej.png" },
  { name: "JCB", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jcb-XbPsN6IA2mRABQDJ21d2HxQXFptFRV.png" },
  { name: "Case", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/case-JDX2HKA0Tlau8LTAvBv6YO3x25Wv7q.png" },
  { name: "Terex", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/terex-oiidT43cZtot4ySxfWDijlH57kLkE5.png" },
  { name: "JLG", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jlg-JYmHcEUw6VHucj3axYSTe0X9lwPtEc.png" },
  { name: "Skyjack", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skyjack-KUPdGgTCbdxAd0yGvVGwknE0yTMEog.png" },
  { name: "Kalmar", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kalmar-6lD8zAjPjJmhXrIw0nyeYc5z0bCIfN.png" },
  { name: "Metso", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/metso-YKIhutwt2Q0Q8UwgwNyYLgKSIc0MSS.png" },
  { name: "P&H", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/p%26h-YF31BPANLsAGoAjKt82uBgbN7Q3Iii.png" },
  { name: "Tamrock", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tamrock-6aGUedhY1W1PKix0qtr2RlpFNFnIit.png" },
  { name: "Broce Broom", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/broce_broom-MPFw6Dx39tCOMnxDIxagS3YNgPu25b.png" },
]

export function BrandsSection() {
  return (
    <section id="marcas" className="relative bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Marcas
            </span>
            <div className="h-px w-12 bg-primary" />
          </div>
          <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Las marcas mas importantes del mercado
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Trabajamos con todas las marcas lideres de maquinaria pesada.
            Si no encuentra el modelo que busca, nos lo indica y creamos su calca a medida.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/catalogo?marca=${encodeURIComponent(brand.name)}`}
              title={`Ver calcas para ${brand.name}`}
              className="group flex items-center justify-center rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 h-20"
            >
              <div className="relative w-full h-full">
                <Image
                  src={brand.src}
                  alt={`Calcomanias para ${brand.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 14vw"
                  className="object-contain p-1 opacity-50 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
