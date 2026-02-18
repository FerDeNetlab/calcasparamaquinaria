import { NextRequest, NextResponse } from 'next/server'
import { getProductImage } from '@/lib/odoo'

const VALID_SIZES = [128, 256, 512, 1024, 1920] as const
type ImageSize = (typeof VALID_SIZES)[number]

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Parse size from query params (default 512)
    const sizeParam = request.nextUrl.searchParams.get('size')
    const size = sizeParam && VALID_SIZES.includes(Number(sizeParam) as ImageSize)
        ? (Number(sizeParam) as ImageSize)
        : 512

    try {
        const base64 = await getProductImage(productId, size)

        if (!base64) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 })
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
                // Cache for 24 hours on CDN, 1 hour in browser
                'Cache-Control': 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=86400',
            },
        })
    } catch (error) {
        console.error('Image proxy error:', error)
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }
}
