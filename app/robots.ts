import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // Google Merchant Center requires completely empty Disallow for Googlebot
                // See: https://support.google.com/merchants/answer/12467444
                // The /admin path is protected by noindex meta tag + wildcard rule below
                userAgent: 'Googlebot',
                allow: '/',
            },
            {
                // Google Merchant Center requires completely empty Disallow for Googlebot-Image
                userAgent: 'Googlebot-Image',
                allow: '/',
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

