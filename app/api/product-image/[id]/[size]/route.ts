import { NextResponse } from 'next/server'
import { getProductImage } from '@/lib/odoo'

const VALID_SIZES = [128, 256, 512, 1024, 1920] as const
type ImageSize = (typeof VALID_SIZES)[number]

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string; size: string }> }
) {
    const { id, size: sizeParam } = await params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const size = VALID_SIZES.includes(Number(sizeParam) as ImageSize)
        ? (Number(sizeParam) as ImageSize)
        : 512

    try {
        const base64 = await getProductImage(productId, size)

        if (!base64) {
            // Return a 1x1 transparent PNG instead of JSON error
            // (Google Merchant Center expects image data, not JSON)
            const transparentPng = Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                'base64'
            )
            return new NextResponse(transparentPng, {
                status: 200,
                headers: {
                    'Content-Type': 'image/png',
                    'Content-Length': transparentPng.length.toString(),
                    'Cache-Control': 'public, s-maxage=3600, max-age=3600',
                },
            })
        }

        // Decode base64 to binary
        const buffer = Buffer.from(base64, 'base64')

        // Detect image type from first bytes
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50
        const contentType = isPng ? 'image/png' : 'image/jpeg'

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                // Cache for 7 days on CDN, 1 hour in browser
                'Cache-Control': 'public, s-maxage=604800, max-age=3600, stale-while-revalidate=604800',
            },
        })
    } catch (error) {
        console.error('Image proxy error:', error)
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }
}
