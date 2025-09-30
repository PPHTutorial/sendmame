'use client'

import React from 'react'
import Link from 'next/link'
import { MainNavigation } from './MainNavigation'
import { Button } from '@/components/ui'
import { LogIn, LogOut, User as UserIcon, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// This should be replaced with the actual user type from your auth hook
interface User {
    id: string;
    username?: string;
    email?: string;
}

interface NavSidebarContentProps {
    user: User | null | undefined
    onLinkClick?: () => void
}

export function NavSidebarContent({ user, onLinkClick }: NavSidebarContentProps) {
    const handleLogout = () => {
        // Implement your logout logic here
        console.log('Logging out...')
        if (onLinkClick) onLinkClick()
    }

    return (
        <div className="flex flex-col justify-between h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 uppercase">Pauggage</h1>
                <p className="text-sm text-gray-500">Your Delivery Partner</p>
            </div>

            {/* Main Navigation */}
            <div className="p-4 flex-grow">
                <MainNavigation isMobile onLinkClick={onLinkClick} />
                 <div className="mt-6 md:hidden">
                    <Link href="/packages/create" onClick={onLinkClick}>
                        <Button className="w-full flex items-center justify-center gap-2">
                            <PlusCircle className="w-4 h-4" />
                            <span>Add Package</span>
                        </Button>
                    </Link>
                    <Link href="/trips/create" onClick={onLinkClick}>
                        <Button className="w-full flex items-center justify-center gap-2 mt-2" variant="secondary">
                            <PlusCircle className="w-4 h-4" />
                            <span>Add Trip</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer with User Info/Auth */}
            <div className="p-4 border-t border-gray-200">
                {user ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-gray-800">{user.username || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Link href="/login" onClick={onLinkClick}>
                            <Button className="w-full">
                                <LogIn className="mr-2 h-4 w-4" />
                                Login
                            </Button>
                        </Link>
                        <Link href="/register" onClick={onLinkClick}>
                            <Button variant="outline" className="w-full">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
