'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Home,
    Package,
    User,
    Info,
    MapPin,
    MessageSquare,
    BarChart3,
    Crown
} from 'lucide-react'

const navLinks = [
    { href: '/packages', label: 'Posts', icon: Package },
    { href: '/subscription', label: 'Payment Plans', icon: Crown },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/contact', label: 'Contact Info', icon: Info },
    { href: '/about', label: 'About', icon: Info },
    { href: '/help-support', label: 'Help & Support', icon: Home },
]

interface MainNavigationProps {
    isMobile?: boolean
    isAdmin: boolean
    onLinkClick?: () => void
}

export function MainNavigation({ isMobile = false, isAdmin = false, onLinkClick }: MainNavigationProps) {
    const pathname = usePathname()

    // Filter nav links based on user role
    const filteredNavLinks = navLinks.filter(link => {
        if (link.href === '/dashboard' && !isAdmin) {
            return false
        }
        return true
    })

    return (
        <nav className={cn('flex', isMobile ? 'flex-col space-y-2' : 'items-center space-x-6')}>
            {filteredNavLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onLinkClick}
                        className={cn(
                            'group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium',
                            isActive
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                            isMobile && 'text-base'
                        )}
                    >
                        <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                            isActive
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 group-hover:bg-gray-200 text-gray-500 group-hover:text-gray-700'
                        )}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className={cn(
                            'transition-colors duration-200',
                            isActive && 'font-semibold'
                        )}>
                            {label}
                        </span>
                        {isActive && (
                            <div className="w-2 h-2 bg-teal-600 rounded-full ml-auto" />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
