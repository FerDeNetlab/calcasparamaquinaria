import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** IVA rate in Mexico */
const IVA = 1.16

/** Return a price with IVA included (list_price × 1.16) */
export function withIVA(price: number): number {
  return price * IVA
}

/** Format a number as Mexican Peso string, e.g. "$1,160.00" */
export function formatMXN(price: number): string {
  return price.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  })
}
