'use client'

import { FileText } from 'lucide-react'

export default function CotizacionesPage() {
    return (
        <div className="flex flex-col min-h-full">
            <div className="border-b border-zinc-800 bg-zinc-900/50">
                <div className="px-6 py-4">
                    <h1 className="text-lg font-bold text-white leading-none">Cotizaciones</h1>
                    <p className="text-zinc-500 text-xs mt-1">Módulo en construcción</p>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-700">
                <FileText className="w-12 h-12" />
                <p className="text-sm">Próximamente</p>
            </div>
        </div>
    )
}
