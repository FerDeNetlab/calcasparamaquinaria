'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
    Search, Trash2, Save, X, ChevronLeft, ChevronRight,
    LogIn, LogOut, Loader2, ArrowUpDown, ArrowUp, ArrowDown,
    CheckCircle, XCircle
} from 'lucide-react'

interface Product {
    id: number
    name: string
    list_price: number
    categ_id: [number, string] | false
    default_code: string | false
    description_sale: string | false
    x_validated_by_direction: boolean
}

interface ProductsResponse {
    products: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
}

type SortKey = 'name' | 'list_price' | 'categ_id' | 'id'
type SortDir = 'asc' | 'desc'

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

    // Sorting
    const [sortKey, setSortKey] = useState<SortKey>('name')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    // Modal
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editName, setEditName] = useState('')
    const [editPrice, setEditPrice] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editValidated, setEditValidated] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Delete
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const LIMIT = 50

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`,
    }), [password])

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: LIMIT.toString(),
                sort: sortKey,
                order: sortDir,
            })
            if (search) params.set('search', search)

            const res = await fetch(`/api/admin/products?${params}`, {
                headers: authHeaders(),
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
    }, [page, search, sortKey, sortDir, authHeaders])

    useEffect(() => {
        if (isAuthenticated) fetchProducts()
    }, [isAuthenticated, fetchProducts])


    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
        setPage(1) // Reset to first page on sort change
    }

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />
        return sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 text-yellow-400" />
            : <ArrowDown className="w-3 h-3 text-yellow-400" />
    }

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

    const openProduct = (product: Product) => {
        setSelectedProduct(product)
        setEditName(product.name)
        setEditPrice(product.list_price.toString())
        setEditDesc(product.description_sale || '')
        setEditValidated(product.x_validated_by_direction || false)
        setSaveSuccess(false)
        setDeleteConfirm(false)
    }

    const closeModal = () => {
        setSelectedProduct(null)
        setSaveSuccess(false)
        setDeleteConfirm(false)
    }

    const saveProduct = async () => {
        if (!selectedProduct) return
        setSaving(true)
        setSaveSuccess(false)
        try {
            const body: Record<string, unknown> = { id: selectedProduct.id }
            if (editName !== selectedProduct.name) body.name = editName
            if (parseFloat(editPrice) !== selectedProduct.list_price) body.list_price = parseFloat(editPrice)
            if (editDesc !== (selectedProduct.description_sale || '')) body.description_sale = editDesc
            if (editValidated !== (selectedProduct.x_validated_by_direction || false)) body.x_validated_by_direction = editValidated

            if (Object.keys(body).length <= 1) {
                setSaving(false)
                return // Nothing changed
            }

            const res = await fetch('/api/admin/products', {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify(body),
            })
            if (res.ok) {
                setSaveSuccess(true)
                // Update local state
                setProducts(prev => prev.map(p =>
                    p.id === selectedProduct.id
                        ? {
                            ...p,
                            name: editName,
                            list_price: parseFloat(editPrice),
                            description_sale: editDesc || false,
                            x_validated_by_direction: editValidated,
                        }
                        : p
                ))
                setSelectedProduct({
                    ...selectedProduct,
                    name: editName,
                    list_price: parseFloat(editPrice),
                    description_sale: editDesc || false,
                    x_validated_by_direction: editValidated,
                })
            }
        } catch {
            console.error('Error saving')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedProduct) return
        setDeletingId(selectedProduct.id)
        try {
            const res = await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: authHeaders(),
                body: JSON.stringify({ id: selectedProduct.id }),
            })
            if (res.ok) {
                closeModal()
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
                    <button onClick={handleSearch} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors">
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
                                        <th
                                            className="text-left px-4 py-3 text-zinc-400 font-medium w-16 cursor-pointer hover:text-white select-none"
                                            onClick={() => toggleSort('id')}
                                        >
                                            <span className="flex items-center gap-1">ID <SortIcon col="id" /></span>
                                        </th>
                                        <th
                                            className="text-left px-4 py-3 text-zinc-400 font-medium cursor-pointer hover:text-white select-none"
                                            onClick={() => toggleSort('name')}
                                        >
                                            <span className="flex items-center gap-1">Nombre <SortIcon col="name" /></span>
                                        </th>
                                        <th
                                            className="text-left px-4 py-3 text-zinc-400 font-medium w-28 cursor-pointer hover:text-white select-none"
                                            onClick={() => toggleSort('list_price')}
                                        >
                                            <span className="flex items-center gap-1">Precio <SortIcon col="list_price" /></span>
                                        </th>
                                        <th
                                            className="text-left px-4 py-3 text-zinc-400 font-medium w-36 cursor-pointer hover:text-white select-none"
                                            onClick={() => toggleSort('categ_id')}
                                        >
                                            <span className="flex items-center gap-1">Categoría <SortIcon col="categ_id" /></span>
                                        </th>
                                        <th className="text-left px-4 py-3 text-zinc-400 font-medium w-28">Código</th>
                                        <th className="text-center px-4 py-3 text-zinc-400 font-medium w-20">✓ Dir.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                            onClick={() => openProduct(product)}
                                        >
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
                                            <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{product.id}</td>
                                            <td className="px-4 py-2 text-white">{product.name}</td>
                                            <td className="px-4 py-2 text-green-400 font-mono">${product.list_price.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-zinc-400 text-xs">{product.categ_id ? product.categ_id[1] : '—'}</td>
                                            <td className="px-4 py-2 text-zinc-500 font-mono text-xs">{product.default_code || '—'}</td>
                                            <td className="px-4 py-2 text-center">
                                                {product.x_validated_by_direction
                                                    ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                                                    : <XCircle className="w-4 h-4 text-zinc-700 mx-auto" />
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between">
                            <p className="text-zinc-500 text-sm">
                                Página {page} de {totalPages} · {total.toLocaleString()} productos
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

            {/* ── Product Detail Modal ── */}
            {
                selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

                        {/* Modal */}
                        <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            {/* Close button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Image */}
                            <div className="bg-zinc-950 rounded-t-2xl p-6 flex items-center justify-center">
                                <Image
                                    src={`/api/product-image/${selectedProduct.id}/512`}
                                    alt={selectedProduct.name}
                                    width={400}
                                    height={400}
                                    className="rounded-xl object-contain max-h-72"
                                    unoptimized
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {/* ID & Category (read-only) */}
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-mono text-xs">
                                        ID: {selectedProduct.id}
                                    </span>
                                    {selectedProduct.categ_id && (
                                        <span className="bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-full text-xs">
                                            {selectedProduct.categ_id[1]}
                                        </span>
                                    )}
                                    {selectedProduct.default_code && (
                                        <span className="bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-full font-mono text-xs">
                                            {selectedProduct.default_code}
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Nombre del producto</label>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Precio (MXN)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-4 py-2.5 text-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Descripción (opcional)</label>
                                    <textarea
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        rows={3}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all resize-none"
                                        placeholder="Descripción del producto..."
                                    />
                                </div>

                                {/* Validated by Direction */}
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={editValidated}
                                            onChange={(e) => setEditValidated(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-zinc-700 rounded-full peer-checked:bg-green-500 transition-colors" />
                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
                                    </div>
                                    <div>
                                        <span className="text-sm text-white font-medium">Validado por Dirección</span>
                                        <p className="text-xs text-zinc-500">El precio fue revisado y aprobado</p>
                                    </div>
                                    {editValidated && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                                </label>

                                {/* Success message */}
                                {saveSuccess && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2.5 text-green-400 text-sm text-center">
                                        ✓ Cambios guardados en Odoo
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2">
                                    {/* Delete */}
                                    <div>
                                        {deleteConfirm ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={deletingId !== null}
                                                    className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    Sí, eliminar
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(false)}
                                                    className="text-zinc-400 hover:text-white text-sm px-3 py-2 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(true)}
                                                className="flex items-center gap-2 text-zinc-500 hover:text-red-400 text-sm transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" /> Eliminar producto
                                            </button>
                                        )}
                                    </div>

                                    {/* Save */}
                                    <button
                                        onClick={saveProduct}
                                        disabled={saving}
                                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Guardar cambios
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
