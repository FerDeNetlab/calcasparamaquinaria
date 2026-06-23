// Admin auth utilities using Web Crypto API (Edge-compatible, no extra deps)

export type AdminRole = 'admin' | 'gerente' | 'vendedor' | 'almacen'

export interface AdminUser {
    uid: number
    name: string
    email: string
    role: AdminRole
}

const SECRET = process.env.JWT_SECRET ?? 'fallback-dev-secret-change-in-prod'
const COOKIE_NAME = 'admin_session'
const EXPIRES_IN = 60 * 60 * 8 // 8 hours in seconds

// ── Web Crypto helpers ──────────────────────────────────────────────────────

function b64urlEncode(buf: ArrayBuffer | string): string {
    const bytes = typeof buf === 'string'
        ? new TextEncoder().encode(buf)
        : new Uint8Array(buf)
    let str = ''
    for (const b of bytes) str += String.fromCharCode(b)
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlDecode(str: string): Uint8Array {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')
    const raw = atob(padded)
    return new Uint8Array([...raw].map(c => c.charCodeAt(0)))
}

async function getKey(): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    )
}

// ── Token sign / verify ────────────────────────────────────────────────────

export async function signToken(user: AdminUser): Promise<string> {
    const header = b64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = b64urlEncode(JSON.stringify({
        ...user,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
    }))
    const data = `${header}.${payload}`
    const key = await getKey()
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
    return `${data}.${b64urlEncode(sig)}`
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const [header, payload, sig] = parts
        const key = await getKey()
        const valid = await crypto.subtle.verify(
            'HMAC', key,
            b64urlDecode(sig),
            new TextEncoder().encode(`${header}.${payload}`)
        )
        if (!valid) return null
        const decoded = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)))
        if (decoded.exp < Math.floor(Date.now() / 1000)) return null
        return { uid: decoded.uid, name: decoded.name, email: decoded.email, role: decoded.role }
    } catch {
        return null
    }
}

// ── Role helpers ───────────────────────────────────────────────────────────

export function getRoleForUid(uid: number): AdminRole | null {
    try {
        const roles: Record<string, AdminRole> = JSON.parse(process.env.ADMIN_ROLES ?? '{}')
        return roles[String(uid)] ?? null
    } catch {
        return null
    }
}

// What each role can access
export const ROLE_MODULES: Record<AdminRole, string[]> = {
    admin:    ['ventas', 'cotizaciones', 'clientes', 'inventario', 'caratulas', 'configuracion'],
    gerente:  ['ventas', 'cotizaciones', 'clientes'],
    vendedor: ['ventas', 'cotizaciones', 'clientes'],
    almacen:  ['inventario', 'caratulas'],
}

export function canAccess(role: AdminRole, module: string): boolean {
    return ROLE_MODULES[role]?.includes(module) ?? false
}

// ── Cookie name export ─────────────────────────────────────────────────────

export { COOKIE_NAME }
