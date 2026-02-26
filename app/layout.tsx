import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/contexts/cart-context'
import './globals.css'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Calcas para Maquinaria',
  legalName: 'Publim S.A. de C.V.',
  url: 'https://www.calcasparamaquinaria.mx',
  logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RASGADO%20COM%20MX%20w%20v2-pwTMy809i4tSdCEEEOcXvXlI1HdQvM.png',
  description: 'Calcomanías de alta calidad para maquinaria pesada. +7,000 modelos disponibles.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Cuauhtémoc 93, Analco',
    addressLocality: 'Guadalajara',
    addressRegion: 'Jalisco',
    postalCode: '44450',
    addressCountry: 'MX',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+52-33-1528-9366',
    contactType: 'sales',
    availableLanguage: 'Spanish',
  },
  sameAs: [
    'https://wa.me/523315289366',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Calcas para Maquinaria',
  url: 'https://www.calcasparamaquinaria.mx',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.calcasparamaquinaria.mx/catalogo?buscar={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.calcasparamaquinaria.mx'),
  verification: {
    google: 'c6eUd9y9djgY2AIIIZNcBwbvFhToawu2GL0HaexPZ5c',
  },
  title: {
    default: 'Calcas para Maquinaria Pesada | calcasparamaquinaria.mx',
    template: '%s | Calcas para Maquinaria',
  },
  description: 'Calcomanias y stickers de alta calidad para maquinaria pesada. CAT, Volvo, Komatsu, JCB, John Deere, Case, Terex y mas. +7,000 modelos disponibles con +6 anos de duracion a la intemperie. Envio a toda la Republica Mexicana.',
  keywords: [
    'calcomanias para maquinaria pesada',
    'calcas para maquinaria',
    'stickers para excavadora',
    'calcomanias CAT',
    'calcomanias Caterpillar',
    'calcomanias Komatsu',
    'calcomanias Volvo',
    'calcomanias John Deere',
    'calcomanias JCB',
    'calcomanias Case',
    'calcomanias Terex',
    'calcas excavadora',
    'calcas retroexcavadora',
    'calcas cargador frontal',
    'calcas bulldozer',
    'stickers maquinaria pesada',
    'kit calcomanias maquinaria',
    'calcas de seguridad maquinaria',
    'calcas restauracion maquinaria',
    'maquinaria pesada Mexico',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://www.calcasparamaquinaria.mx',
    siteName: 'Calcas para Maquinaria',
    title: 'Calcas para Maquinaria Pesada | +7,000 Modelos',
    description: 'Calcomanias de alta calidad para maquinaria pesada. CAT, Komatsu, Volvo, JCB, Deere y mas marcas. Envio a toda la Republica.',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/320CAT_2-wyWidLOuXCLdHtdoeZv3paV4g6rROr.png',
        width: 900,
        height: 650,
        alt: 'Calcas para Maquinaria Pesada - Excavadora CAT 320',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calcas para Maquinaria Pesada',
    description: 'Calcomanias de alta calidad para maquinaria pesada. +7,000 modelos disponibles.',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/320CAT_2-wyWidLOuXCLdHtdoeZv3paV4g6rROr.png'],
  },
  alternates: {
    canonical: 'https://www.calcasparamaquinaria.mx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17968621246"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17968621246');
          `}
        </Script>
      </head>
      <body className={`${_inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
