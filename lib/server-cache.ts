// Server-side in-memory cache with TTL.
// Lives in the Node.js process — survives across requests within the same instance.

interface Entry<T> { data: T; expiresAt: number }

const store = new Map<string, Entry<unknown>>()

export function cacheGet<T>(key: string): T | null {
    const entry = store.get(key) as Entry<T> | undefined
    if (!entry) return null
    if (Date.now() > entry.expiresAt) { store.delete(key); return null }
    return entry.data
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
    store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function cacheInvalidatePrefix(prefix: string): void {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key)
    }
}

// Common TTLs
export const TTL = {
    SHORT:  30_000,   // 30s  — data that changes often (leads, orders)
    MEDIUM: 120_000,  // 2min — data that changes sometimes (products)
    LONG:   300_000,  // 5min — near-static data (stages, users, categories)
}
