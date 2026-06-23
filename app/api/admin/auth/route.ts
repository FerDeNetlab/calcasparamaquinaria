import { NextRequest, NextResponse } from 'next/server'
import { signToken, getRoleForUid, COOKIE_NAME } from '@/lib/admin-auth'

const ODOO_URL = process.env.ODOO_URL!
const ODOO_DB = process.env.ODOO_DB!

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    if (!email || !password) {
        return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 })
    }

    // Authenticate against Odoo
    let uid: number | null = null
    let userName = ''

    try {
        const res = await fetch(`${ODOO_URL}/web/session/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                id: 1,
                params: { db: ODOO_DB, login: email, password },
            }),
        })

        const data = await res.json()

        if (data.error || !data.result?.uid) {
            return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
        }

        uid = data.result.uid
        userName = data.result.name ?? email
    } catch {
        return NextResponse.json({ error: 'Error conectando con Odoo' }, { status: 503 })
    }

    if (!uid) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    const role = getRoleForUid(uid)
    if (!role) {
        return NextResponse.json(
            { error: 'Tu usuario no tiene acceso al panel. Contacta al administrador.' },
            { status: 403 }
        )
    }

    const token = await signToken({ uid, name: userName, email, role })

    const response = NextResponse.json({ ok: true, name: userName, role })
    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
    })

    return response
}

export async function DELETE() {
    const response = NextResponse.json({ ok: true })
    response.cookies.delete(COOKIE_NAME)
    return response
}
