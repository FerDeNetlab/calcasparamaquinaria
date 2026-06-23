'use client'

import { Users } from 'lucide-react'

export default function ClientesPage() {
    return (
        <div className="flex flex-col min-h-full">
            <div className="border-b border-zinc-800 bg-zinc-900/50">
                <div className="px-6 py-4">
                    <h1 className="text-lg font-bold text-white leading-none">Clientes</h1>
                    <p className="text-zinc-500 text-xs mt-1">Base de clientes · Odoo 17</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-zinc-600" />
                    </div>
                    <h2 className="text-white font-semibold mb-2">Módulo en construcción</h2>
                    <p className="text-zinc-500 text-sm max-w-xs">
                        Aquí podrás consultar el historial de clientes, sus órdenes y datos de contacto.
                        Próximamente disponible.
                    </p>
                </div>
            </div>
        </div>
    )
}
