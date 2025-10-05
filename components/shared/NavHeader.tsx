'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  User, 
  Package, 
  Map, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Settings, 
  CreditCard, 
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui'

interface NavHeaderProps {
  title: string
  showCreateTrip?: boolean
  showCreatePackage?: boolean
  transparent?: boolean
  name?: string
  email?: string
}

export const NavHeader: React.FC<NavHeaderProps> = ({ 
  title, 
  showCreateTrip = true, 
  showCreatePackage = true,
  transparent = false,
  name, email
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Handle scroll events to apply styling to header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled || !transparent
      ? 'bg-white shadow shadow-neutral-100 py-3'
      : 'bg-transparent py-5'
  }`
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsUserMenuOpen(false)
  }
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className={headerClass}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-teal-600 hidden md:block">{title}</h1>
              <h1 className="text-xl font-bold text-teal-600 block md:hidden">{title}</h1>
            </div>
            
            {/* Center - Navigation for medium-large screens */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/account/profile" className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}>
                Dashboard
              </Link>
              <Link href="/packages" className={`text-sm font-medium ${pathname.startsWith('/packages') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}>
                Packages
              </Link>
              <Link href="/trips" className={`text-sm font-medium ${pathname.startsWith('/trips') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}>
                Trips
              </Link>
              <Link href="/messages" className={`text-sm font-medium ${pathname.startsWith('/messages') ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}>
                Messages
              </Link>
            </nav>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
              {/* Create buttons for medium-large screens */}
              <div className="hidden md:flex items-center space-x-3">
                {showCreatePackage && (
                  <Link href="/packages/create">
                    <Button size="sm" variant="outline" className="text-sm">
                      <Package className="w-4 h-4 mr-1" />
                      Send Package
                    </Button>
                  </Link>
                )}
                {showCreateTrip && (
                  <Link href="/trips/create">
                    <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700 text-sm">
                      <Map className="w-4 h-4 mr-1" />
                      Create Trip
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Notifications */}
              <button className="p-2 text-gray-700 hover:text-teal-600 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* User menu */}
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-1 rounded-full p-1 hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-gray-500">{email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link href="/account/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link href="/account/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <Link href="/subscription" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Billing
                      </Link>
                      <Link href="/help" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help Center
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-1">
                      <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 text-gray-700 hover:text-teal-600 rounded-full hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 pb-6 px-6 flex flex-col">
          <nav className="flex flex-col space-y-6 mt-6">
            <Link href="/dashboard" className="flex items-center py-3 border-b border-gray-100">
              <span className="text-lg font-medium">Dashboard</span>
            </Link>
            <Link href="/packages" className="flex items-center py-3 border-b border-gray-100">
              <span className="text-lg font-medium">Packages</span>
            </Link>
            <Link href="/trips" className="flex items-center py-3 border-b border-gray-100">
              <span className="text-lg font-medium">Trips</span>
            </Link>
            <Link href="/messages" className="flex items-center py-3 border-b border-gray-100">
              <span className="text-lg font-medium">Messages</span>
            </Link>
          </nav>
          
          <div className="mt-auto space-y-4">
            {showCreatePackage && (
              <Link href="/packages/create" className="w-full">
                <Button size="lg" variant="outline" className="w-full justify-center">
                  <Package className="w-5 h-5 mr-2" />
                  Send Package
                </Button>
              </Link>
            )}
            {showCreateTrip && (
              <Link href="/trips/create" className="w-full">
                <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700 w-full justify-center">
                  <Map className="w-5 h-5 mr-2" />
                  Create Trip
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20"></div>
    </>
  )
}