'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/packages', label: 'Packages' },
    { href: '/account/profile', label: 'Profile' },
    { href: '/about', label: 'About' },
]

interface MainNavigationProps {
    isMobile?: boolean
    onLinkClick?: () => void
}

export function MainNavigation({ isMobile = false, onLinkClick }: MainNavigationProps) {
    const pathname = usePathname()

    return (
        <nav className={cn('flex', isMobile ? 'flex-col space-y-4' : 'items-center space-x-6')}>
            {navLinks.map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    onClick={onLinkClick}
                    className={cn(
                        'text-sm font-medium transition-colors hover:text-teal-600',
                        pathname === href
                            ? 'text-teal-600'
                            : 'text-gray-700',
                        isMobile && 'text-lg py-2'
                    )}
                >
                    {label}
                </Link>
            ))}
        </nav>
    )
}
