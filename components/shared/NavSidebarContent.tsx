/* eslint-disable @next/next/no-img-element */
'use client'

import React from 'react'
import Link from 'next/link'
import { MainNavigation } from './MainNavigation'
import { Button } from '@/components/ui'
import {
    LogIn,
    LogOut,
    User as UserIcon,
    Package,
    Plane,
    User,
    Crown,
    Plus,
    Settings
} from 'lucide-react'

// This should be replaced with the actual user type from your auth hook
interface User {
    id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    avatar?: string;
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
        <div className="flex flex-col justify-between h-full bg-white border-r border-gray-200">
            {/* Clean Header with Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Amenade</h1>
                        <p className="text-xs text-gray-500">Global Delivery</p>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="p-4 flex-grow">
                <MainNavigation isMobile isAdmin={user?.role === 'admin'} onLinkClick={onLinkClick} />

                {/* Quick Actions */}
                <div className="mt-8">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Quick Actions</h3>
                    <div className="flex flex-col space-y-2 gap-4">
                        <Link href="/packages/create" onClick={onLinkClick}>
                            <Button className="w-full flex items-center justify-start gap-3 h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                                <Plus className="w-4 h-4" />
                                <span className="font-medium">Send Package</span>
                            </Button>
                        </Link>
                        <Link href="/trips/create" onClick={onLinkClick}>
                            <Button className="w-full flex items-center justify-start gap-3 h-11 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors" variant="outline">
                                <Plane className="w-4 h-4" />
                                <span className="font-medium">Create Trip</span>
                            </Button>
                        </Link>

                    </div>
                </div>
            </div>

            {/* Footer with User Info/Auth */}
            <div className="p-4 border-t border-gray-200">
                {user ? (
                    <div className="space">
                        {/* Enhanced User Profile Section */}
                        <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg p-4">
                            <Link href="/account/profile" onClick={onLinkClick}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12  rounded-full flex items-center justify-center">
                                        {user.avatar ? <img src={user.avatar} alt={user.firstName ? user.firstName : 'User Avatar'} className='rounded-full' /> : <UserIcon className="w-6 h-6 text-white" />}
                                        
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                            {user.firstName && user.lastName
                                                ? `${user.firstName} ${user.lastName}`
                                                : user.username || 'User'
                                            }
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        {user.role && (
                                            <p className="text-xs text-teal-600 font-medium capitalize">{user.role}</p>
                                        )}
                                    </div>
                                </div>

                            </Link>
                            <Link href="/account/settings" onClick={onLinkClick}>
                                <Settings className="size-5 text-neutral-500 hover:text-teal-900" />
                            </Link>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-10 border-gray-300 hover:bg-gray-50 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span className="font-medium">Logout</span>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Link href="/login" onClick={onLinkClick}>
                            <Button className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                                <LogIn className="mr-2 h-4 w-4" />
                                <span className="font-medium">Login</span>
                            </Button>
                        </Link>
                        <Link href="/register" onClick={onLinkClick}>
                            <Button variant="outline" className="w-full h-11 border-gray-300 hover:bg-gray-50 transition-colors">
                                <span className="font-medium">Sign Up</span>
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div >
    )
}
