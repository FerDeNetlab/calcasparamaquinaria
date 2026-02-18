import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL('https://calcasparamaquinaria.mx'),
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
    url: 'https://calcasparamaquinaria.mx',
    siteName: 'Calcas para Maquinaria',
    title: 'Calcas para Maquinaria Pesada | +7,000 Modelos',
    description: 'Calcomanias de alta calidad para maquinaria pesada. CAT, Komatsu, Volvo, JCB, Deere y mas marcas. Envio a toda la Republica.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calcas para Maquinaria Pesada',
    description: 'Calcomanias de alta calidad para maquinaria pesada. +7,000 modelos disponibles.',
  },
  alternates: {
    canonical: 'https://calcasparamaquinaria.mx',
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
      <body className={`${_inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
