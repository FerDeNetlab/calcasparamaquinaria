"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Tag, Layers, Package, X, Loader2 } from "lucide-react"

interface Suggestion {
    type: "brand" | "model" | "category" | "product"
    text: string
    subtitle?: string
    logo?: string
    count?: number
    url?: string
}

interface SmartSearchProps {
    currentSearch?: string
    currentBrand?: string
}

export function SmartSearch({ currentSearch, currentBrand }: SmartSearchProps) {
    const router = useRouter()
    const [query, setQuery] = useState(currentSearch || "")
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    // Debounced fetch suggestions
    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 1) {
            setSuggestions([])
            setIsOpen(false)
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
            const data = await res.json()
            setSuggestions(data.suggestions || [])
            setIsOpen(data.suggestions?.length > 0)
            setActiveIndex(-1)
        } catch {
            setSuggestions([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Debounce input changes (250ms)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (query.length >= 1) {
            debounceRef.current = setTimeout(() => {
                fetchSuggestions(query)
            }, 250)
        } else {
            setSuggestions([])
            setIsOpen(false)
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query, fetchSuggestions])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function handleSelect(suggestion: Suggestion) {
        setIsOpen(false)
        setQuery("")
        if (suggestion.url) {
            router.push(suggestion.url)
        } else {
            router.push(`/catalogo?buscar=${encodeURIComponent(suggestion.text)}`)
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsOpen(false)
        if (query.trim()) {
            router.push(`/catalogo?buscar=${encodeURIComponent(query.trim())}`)
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === "Escape") {
                setIsOpen(false)
            }
            return
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setActiveIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                )
                break
            case "ArrowUp":
                e.preventDefault()
                setActiveIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                )
                break
            case "Enter":
                e.preventDefault()
                if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    handleSelect(suggestions[activeIndex])
                } else {
                    handleSubmit(e)
                }
                break
            case "Escape":
                setIsOpen(false)
                setActiveIndex(-1)
                break
        }
    }

    function clearSearch() {
        setQuery("")
        setSuggestions([])
        setIsOpen(false)
        inputRef.current?.focus()
    }

    // Group suggestions by type
    const grouped = {
        brand: suggestions.filter((s) => s.type === "brand"),
        category: suggestions.filter((s) => s.type === "category"),
        product: suggestions.filter((s) => s.type === "product"),
    }

    // Calculate flat index for keyboard navigation
    function getFlatIndex(type: string, indexInGroup: number): number {
        const order = ["brand", "category", "product"] as const
        let flatIdx = 0
        for (const t of order) {
            if (t === type) return flatIdx + indexInGroup
            flatIdx += grouped[t].length
        }
        return flatIdx
    }

    const typeConfig = {
        brand: {
            icon: Tag,
            label: "Marcas",
            color: "text-yellow-500",
        },
        category: {
            icon: Layers,
            label: "Categorías",
            color: "text-blue-400",
        },
        product: {
            icon: Package,
            label: "Productos",
            color: "text-green-400",
        },
    } as const

    return (
        <div className="relative flex-1">
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar por modelo, marca, categoría..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    className="w-full rounded-lg border border-border bg-secondary px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                {isLoading && (
                    <Loader2 className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
                )}
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[400px] overflow-auto rounded-lg border border-border bg-card shadow-xl shadow-black/20"
                >
                    {(["brand", "category", "product"] as const).map((type) => {
                        const items = grouped[type]
                        if (items.length === 0) return null
                        const config = typeConfig[type]
                        const Icon = config.icon

                        return (
                            <div key={type}>
                                {/* Group header */}
                                <div className="sticky top-0 z-10 flex items-center gap-2 bg-secondary/95 backdrop-blur-sm px-3 py-1.5 border-b border-border">
                                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {config.label}
                                    </span>
                                </div>

                                {/* Items */}
                                {items.map((suggestion, idx) => {
                                    const flatIdx = getFlatIndex(type, idx)
                                    const isActive = flatIdx === activeIndex

                                    return (
                                        <button
                                            key={`${type}-${suggestion.text}`}
                                            onClick={() => handleSelect(suggestion)}
                                            onMouseEnter={() => setActiveIndex(flatIdx)}
                                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${isActive
                                                    ? "bg-primary/10 text-foreground"
                                                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                                                }`}
                                        >
                                            {suggestion.logo ? (
                                                <Image
                                                    src={suggestion.logo}
                                                    alt={suggestion.text}
                                                    width={24}
                                                    height={24}
                                                    className="object-contain shrink-0"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                                    <Icon className={`h-4 w-4 ${config.color} opacity-50`} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {highlightMatch(suggestion.text, query)}
                                                </p>
                                                {suggestion.subtitle && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {suggestion.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                            {suggestion.count && (
                                                <span className="text-xs text-muted-foreground shrink-0">
                                                    {suggestion.count}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )
                    })}

                    {/* Footer hint */}
                    <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">↑↓</kbd>
                        <span>navegar</span>
                        <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono ml-2">↵</kbd>
                        <span>seleccionar</span>
                        <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono ml-2">esc</kbd>
                        <span>cerrar</span>
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * Highlight matching characters in a suggestion.
 */
function highlightMatch(text: string, query: string) {
    if (!query) return text

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const idx = lowerText.indexOf(lowerQuery)

    if (idx === -1) return text

    return (
        <>
            {text.slice(0, idx)}
            <span className="text-primary font-semibold">
                {text.slice(idx, idx + query.length)}
            </span>
            {text.slice(idx + query.length)}
        </>
    )
}
