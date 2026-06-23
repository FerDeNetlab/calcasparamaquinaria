'use client'

import { FileText, Plus } from 'lucide-react'

export default function CotizacionesPage() {
    return (
        <div className="flex flex-col min-h-full">
            <div className="border-b border-zinc-800 bg-zinc-900/50">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-white leading-none">Cotizaciones</h1>
                        <p className="text-zinc-500 text-xs mt-1">Gestión de cotizaciones · Odoo 17</p>
                    </div>
                    <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg px-4 py-2 text-sm transition-colors">
                        <Plus className="w-4 h-4" /> Nueva cotización
                    </button>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7 text-zinc-600" />
                    </div>
                    <h2 className="text-white font-semibold mb-2">Módulo en construcción</h2>
                    <p className="text-zinc-500 text-sm max-w-xs">
                        Aquí podrás crear y gestionar cotizaciones directamente desde Odoo.
                        Próximamente disponible.
                    </p>
                </div>
            </div>
        </div>
    )
}
