'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, Trash2, Save, X, ChevronLeft, ChevronRight, LogIn, LogOut, Loader2, AlertTriangle } from 'lucide-react'

interface Product {
    id: number
    name: string
    list_price: number
    categ_id: [number, string] | false
    default_code: string | false
    description_sale: string | false
}

interface ProductsResponse {
    products: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export default function AdminPage() {
    const [password, setPassword] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [authError, setAuthError] = useState('')

    // Data
    const [products, setProducts] = useState<Product[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(false)

    // Editing
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editData, setEditData] = useState<Partial<Product>>({})
    const [saving, setSaving] = useState(false)

    // Delete
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    const LIMIT = 50

    const headers = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`,
    }), [password])

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: LIMIT.toString(),
            })
            if (search) params.set('search', search)

            const res = await fetch(`/api/admin/products?${params}`, {
                headers: headers(),
            })

            if (res.status === 401) {
                setIsAuthenticated(false)
                setAuthError('Sesión expirada')
                return
            }

            const data: ProductsResponse = await res.json()
            setProducts(data.products)
            setTotal(data.total)
            setTotalPages(data.totalPages)
        } catch {
            console.error('Error fetching products')
        } finally {
            setLoading(false)
        }
    }, [page, search, headers])

    useEffect(() => {
        if (isAuthenticated) fetchProducts()
    }, [isAuthenticated, fetchProducts])

    const handleLogin = async () => {
        setAuthError('')
        try {
            const res = await fetch('/api/admin/products?page=1&limit=1', {
                headers: {
                    'Authorization': `Bearer ${password}`,
                    'Content-Type': 'application/json',
                },
            })
            if (res.ok) {
                setIsAuthenticated(true)
            } else {
                setAuthError('Contraseña incorrecta')
            }
        } catch {
            setAuthError('Error de conexión')
        }
    }

    const handleSearch = () => {
        setSearch(searchInput)
        setPage(1)
    }

    const startEdit = (product: Product) => {
        setEditingId(product.id)
        setEditData({
            name: product.name,
            list_price: product.list_price,
            description_sale: product.description_sale || '',
            default_code: product.default_code || '',
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditData({})
    }

    const saveEdit = async () => {
        if (!editingId) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/products', {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify({ id: editingId, ...editData }),
            })
            if (res.ok) {
                setEditingId(null)
                fetchProducts()
            }
        } catch {
            console.error('Error saving')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        setDeletingId(id)
        try {
            const res = await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: headers(),
                body: JSON.stringify({ id }),
            })
            if (res.ok) {
                setDeleteConfirm(null)
                fetchProducts()
            }
        } catch {
            console.error('Error deleting')
        } finally {
            setDeletingId(null)
        }
    }

    // ── Login Screen ──
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                        <p className="text-zinc-400 text-sm mt-1">Calcas para Maquinaria</p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
                        />
                        {authError && (
                            <p className="text-red-400 text-sm text-center">{authError}</p>
                        )}
                        <button
                            onClick={handleLogin}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg py-3 transition-colors"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Dashboard ──
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold">Panel de Administración</h1>
                        <p className="text-zinc-400 text-xs">{total.toLocaleString()} productos</p>
                    </div>
                    <button
                        onClick={() => { setIsAuthenticated(false); setPassword('') }}
                        className="flex items-center gap-2 text-zinc-400 hover:text-red-400 text-sm transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Salir
                    </button>
                </div>
            </header>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors"
                    >
                        Buscar
                    </button>
                    {search && (
                        <button
                            onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                            className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-2.5 text-sm transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                        <th className="text-left px-4 py-3 text-zinc-400 font-medium w-16">Img</th>
                                        <th className="text-left px-4 py-3 text-zinc-400 font-medium w-16">ID</th>
                                        <th className="text-left px-4 py-3 text-zinc-400 font-medium">Nombre</th>
                                        <th className="text-left px-4 py-3 text-zinc-400 font-medium w-28">Precio</th>
                                        <th className="text-left px-4 py-3 text-zinc-400 font-medium w-36">Categoría</th>
                                        <th className="text-left px-4 py-3 text-zinc-400 font-medium w-28">Código</th>
                                        <th className="text-center px-4 py-3 text-zinc-400 font-medium w-28">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                            {/* Image */}
                                            <td className="px-4 py-2">
                                                <Image
                                                    src={`/api/product-image/${product.id}/128`}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    className="rounded bg-zinc-800 object-contain"
                                                    unoptimized
                                                />
                                            </td>
                                            {/* ID */}
                                            <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{product.id}</td>

                                            {editingId === product.id ? (
                                                <>
                                                    {/* Editing Mode */}
                                                    <td className="px-4 py-2">
                                                        <input
                                                            value={editData.name || ''}
                                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                            className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editData.list_price || 0}
                                                            onChange={(e) => setEditData({ ...editData, list_price: parseFloat(e.target.value) })}
                                                            className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-zinc-400 text-xs">
                                                        {product.categ_id ? product.categ_id[1] : '—'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            value={editData.default_code || ''}
                                                            onChange={(e) => setEditData({ ...editData, default_code: e.target.value })}
                                                            className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={saveEdit}
                                                                disabled={saving}
                                                                className="p-1.5 bg-green-600 hover:bg-green-500 rounded transition-colors disabled:opacity-50"
                                                            >
                                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Display Mode */}
                                                    <td
                                                        className="px-4 py-2 text-white cursor-pointer hover:text-yellow-400 transition-colors"
                                                        onClick={() => startEdit(product)}
                                                        title="Click para editar"
                                                    >
                                                        {product.name}
                                                    </td>
                                                    <td className="px-4 py-2 text-green-400 font-mono">
                                                        ${product.list_price.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-zinc-400 text-xs">
                                                        {product.categ_id ? product.categ_id[1] : '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-zinc-500 font-mono text-xs">
                                                        {product.default_code || '—'}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => startEdit(product)}
                                                                className="p-1.5 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-400 rounded transition-colors text-zinc-400"
                                                                title="Editar"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                            {deleteConfirm === product.id ? (
                                                                <button
                                                                    onClick={() => handleDelete(product.id)}
                                                                    disabled={deletingId === product.id}
                                                                    className="p-1.5 bg-red-600 hover:bg-red-500 rounded transition-colors text-white text-xs px-2"
                                                                >
                                                                    {deletingId === product.id ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        '¿Seguro?'
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteConfirm(product.id)}
                                                                    className="p-1.5 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors text-zinc-400"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
                            <p className="text-zinc-500 text-sm">
                                Página {page} de {totalPages} &middot; {total.toLocaleString()} productos
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-sm transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                </button>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page >= totalPages}
                                    className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-sm transition-colors"
                                >
                                    Siguiente <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete confirmation overlay */}
            {deleteConfirm && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDeleteConfirm(null)}
                />
            )}
        </div>
    )
}
