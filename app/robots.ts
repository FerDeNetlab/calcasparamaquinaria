import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // Google requires EMPTY Disallow for Googlebot to crawl product pages
                // See: https://support.google.com/merchants/answer/12467444
                userAgent: 'Googlebot',
                allow: '/',
                disallow: '/admin',
            },
            {
                // Google requires EMPTY Disallow for Googlebot-Image to access product images
                userAgent: 'Googlebot-Image',
                allow: '/',
                disallow: '/admin',
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
