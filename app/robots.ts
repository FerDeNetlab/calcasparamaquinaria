import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/admin'],
            },
            {
                userAgent: 'Googlebot-Image',
                allow: '/api/product-image/',
                disallow: ['/admin'],
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin'],
            },
        ],
        sitemap: 'https://calcasparamaquinaria.mx/sitemap.xml',
    }
}
