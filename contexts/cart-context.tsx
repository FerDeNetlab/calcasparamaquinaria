"use client"

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
    id: number
    name: string
    /** Price already includes IVA (list_price × 1.16) */
    price: number
    quantity: number
    /** Full product URL for the WhatsApp message */
    productUrl: string
}

interface CartContextValue {
    items: CartItem[]
    totalItems: number
    subtotal: number
    addToCart: (item: Omit<CartItem, "quantity">) => void
    removeFromCart: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    clearCart: () => void
}

// ─── Context ────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "cpm_cart"

// ─── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setItems(JSON.parse(stored))
            }
        } catch {
            // Ignore parse errors
        }
    }, [])

    // Persist to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }, [items])

    const addToCart = useCallback((newItem: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === newItem.id)
            if (existing) {
                return prev.map((i) =>
                    i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prev, { ...newItem, quantity: 1 }]
        })
    }, [])

    const removeFromCart = useCallback((id: number) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }, [])

    const updateQuantity = useCallback((id: number, quantity: number) => {
        if (quantity < 1) return
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        )
    }, [])

    const clearCart = useCallback(() => {
        setItems([])
    }, [])

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                subtotal,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
    const ctx = useContext(CartContext)
    if (!ctx) {
        throw new Error("useCart must be used inside <CartProvider>")
    }
    return ctx
}
