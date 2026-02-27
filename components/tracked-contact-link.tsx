"use client"

import { type AnchorHTMLAttributes } from "react"

interface TrackedContactLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    contactMethod: string
    children: React.ReactNode
}

export function TrackedContactLink({ contactMethod, children, onClick, ...rest }: TrackedContactLinkProps) {
    function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: 'contact',
            contact_method: contactMethod,
        })
        onClick?.(e)
    }

    return (
        <a onClick={handleClick} {...rest}>
            {children}
        </a>
    )
}
