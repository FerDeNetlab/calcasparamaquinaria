'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
    Search, Trash2, Save, X, ChevronLeft, ChevronRight,
    Loader2, ArrowUpDown, ArrowUp, ArrowDown,
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
    write_date: string
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

export default function CaratulasPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(false)

    const [sortKey, setSortKey] = useState<SortKey>('name')
    const [sortDir, setSortDir] = useState<SortDir>('asc')

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editName, setEditName] = useState('')
    const [editPrice, setEditPrice] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editValidated, setEditValidated] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const LIMIT = 50

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
            const res = await fetch(`/api/admin/caratulas?${params}`)
            if (!res.ok) return
            const data: ProductsResponse = await res.json()
            setProducts(data.products)
            setTotal(data.total)
            setTotalPages(data.totalPages)
        } catch {
            console.error('Error fetching carátulas')
        } finally {
            setLoading(false)
        }
    }, [page, search, sortKey, sortDir])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
        setPage(1)
    }

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />
        return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-yellow-400" /> : <ArrowDown className="w-3 h-3 text-yellow-400" />
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

    const closeModal = () => { setSelectedProduct(null); setSaveSuccess(false); setDeleteConfirm(false) }

    const saveProduct = async () => {
        if (!selectedProduct) return
        setSaving(true); setSaveSuccess(false)
        try {
            const body: Record<string, unknown> = { id: selectedProduct.id }
            if (editName !== selectedProduct.name) body.name = editName
            if (parseFloat(editPrice) !== selectedProduct.list_price) body.list_price = parseFloat(editPrice)
            if (editDesc !== (selectedProduct.description_sale || '')) body.description_sale = editDesc
            if (editValidated !== (selectedProduct.x_validated_by_direction || false)) body.x_validated_by_direction = editValidated
            if (Object.keys(body).length <= 1) { setSaving(false); return }

            const res = await fetch('/api/admin/caratulas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            if (res.ok) {
                setSaveSuccess(true)
                setProducts(prev => prev.map(p => p.id === selectedProduct.id
                    ? { ...p, name: editName, list_price: parseFloat(editPrice), description_sale: editDesc || false, x_validated_by_direction: editValidated }
                    : p
                ))
                setSelectedProduct({ ...selectedProduct, name: editName, list_price: parseFloat(editPrice), description_sale: editDesc || false, x_validated_by_direction: editValidated })
            }
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        if (!selectedProduct) return
        setDeletingId(selectedProduct.id)
        try {
            const res = await fetch('/api/admin/caratulas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedProduct.id }) })
            if (res.ok) { closeModal(); fetchProducts() }
        } finally { setDeletingId(null) }
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Page header */}
            <div className="border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <h1 className="text-lg font-bold text-white leading-none">Carátulas</h1>
                    <p className="text-zinc-500 text-xs mt-1">{total.toLocaleString()} carátulas en Odoo</p>
                </div>
            </div>

            {/* Search */}
            <div className="px-6 py-4 border-b border-zinc-800/50">
                <div className="flex gap-2 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput), setPage(1))}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                        />
                    </div>
                    <button onClick={() => { setSearch(searchInput); setPage(1) }} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors">
                        Buscar
                    </button>
                    {search && (
                        <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }} className="bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-2.5 text-sm transition-colors text-zinc-400">
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 px-6 py-4">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-7 h-7 text-yellow-500 animate-spin" />
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="text-left px-4 py-3 text-zinc-500 font-medium w-14">Img</th>
                                        <th className="text-left px-4 py-3 text-zinc-500 font-medium w-14 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('id')}>
                                            <span className="flex items-center gap-1">ID <SortIcon col="id" /></span>
                                        </th>
                                        <th className="text-left px-4 py-3 text-zinc-500 font-medium cursor-pointer hover:text-white select-none" onClick={() => toggleSort('name')}>
                                            <span className="flex items-center gap-1">Nombre <SortIcon col="name" /></span>
                                        </th>
                                        <th className="text-left px-4 py-3 text-zinc-500 font-medium w-28 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('list_price')}>
                                            <span className="flex items-center gap-1">Precio <SortIcon col="list_price" /></span>
                                        </th>
                                        <th className="text-left px-4 py-3 text-zinc-500 font-medium w-36 cursor-pointer hover:text-white select-none hidden md:table-cell" onClick={() => toggleSort('categ_id')}>
                                            <span className="flex items-center gap-1">Categoría <SortIcon col="categ_id" /></span>
                                        </th>
                                        <th className="text-left px-4 py-3 text-zinc-500 font-medium w-28 hidden lg:table-cell">Código</th>
                                        <th className="text-center px-4 py-3 text-zinc-500 font-medium w-16">✓ Dir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/40 transition-colors cursor-pointer" onClick={() => openProduct(product)}>
                                            <td className="px-4 py-2">
                                                <Image src={`/api/product-image/${product.id}?size=128`} alt="" width={36} height={36} className="rounded bg-zinc-800 object-contain" unoptimized />
                                            </td>
                                            <td className="px-4 py-2 text-zinc-600 font-mono text-xs">{product.id}</td>
                                            <td className="px-4 py-2 text-white">{product.name}</td>
                                            <td className="px-4 py-2 text-green-400 font-mono">${product.list_price.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-zinc-400 text-xs hidden md:table-cell">{product.categ_id ? product.categ_id[1] : '—'}</td>
                                            <td className="px-4 py-2 text-zinc-600 font-mono text-xs hidden lg:table-cell">{product.default_code || '—'}</td>
                                            <td className="px-4 py-2 text-center">
                                                {product.x_validated_by_direction
                                                    ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                                                    : <XCircle className="w-4 h-4 text-zinc-700 mx-auto" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between">
                            <p className="text-zinc-600 text-sm">Página {page} de {totalPages} · {total.toLocaleString()} carátulas</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-sm transition-colors">
                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                </button>
                                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-sm transition-colors">
                                    Siguiente <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <button onClick={closeModal} className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors z-10">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="bg-zinc-950 rounded-t-2xl p-6 flex items-center justify-center">
                            <Image src={`/api/product-image/${selectedProduct.id}?size=512`} alt={selectedProduct.name} width={400} height={400} className="rounded-xl object-contain max-h-64" unoptimized />
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                <span className="bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-mono text-xs">ID: {selectedProduct.id}</span>
                                {selectedProduct.categ_id && <span className="bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-full text-xs">{selectedProduct.categ_id[1]}</span>}
                                {selectedProduct.default_code && <span className="bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-full font-mono text-xs">{selectedProduct.default_code}</span>}
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Nombre del producto</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/60 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Precio (MXN)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                    <input type="number" step="0.01" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-4 py-2.5 text-green-400 font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Descripción (opcional)</label>
                                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/40 transition-all resize-none" placeholder="Descripción del producto..." />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" checked={editValidated} onChange={e => setEditValidated(e.target.checked)} className="sr-only peer" />
                                    <div className="w-10 h-6 bg-zinc-700 rounded-full peer-checked:bg-green-500 transition-colors" />
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
                                </div>
                                <div>
                                    <span className="text-sm text-white font-medium">Validado por Dirección</span>
                                    <p className="text-xs text-zinc-500">El precio fue revisado y aprobado</p>
                                </div>
                                {editValidated && <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />}
                            </label>
                            {saveSuccess && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5 text-green-400 text-sm text-center">
                                    ✓ Cambios guardados en Odoo
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    {deleteConfirm ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleDelete} disabled={deletingId !== null} className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Sí, eliminar
                                            </button>
                                            <button onClick={() => setDeleteConfirm(false)} className="text-zinc-400 hover:text-white text-sm px-3 py-2 transition-colors">Cancelar</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 text-zinc-600 hover:text-red-400 text-sm transition-colors">
                                            <Trash2 className="w-4 h-4" /> Eliminar
                                        </button>
                                    )}
                                </div>
                                <button onClick={saveProduct} disabled={saving} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
