'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui'
import { useAuth } from '@/lib/hooks/api'
import {
  Home,
  Package,
  MapPin,
  User,
  Settings,
  Search,
  Filter,
  SortAsc,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Bell,
  PlusCircle,
  List,
  Grid3X3
} from 'lucide-react'

interface SidebarProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  subItems?: NavItem[]
}

interface FilterOption {
  label: string
  value: string
  count?: number
}

export function Sidebar({ children }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const pathname = usePathname()
  const { getCurrentUser } = useAuth()
  const { data: user } = getCurrentUser

  // Determine if we're on packages or trips page
  const isPackagesPage = pathname?.includes('/packages')
  const isTripsPage = pathname?.includes('/trips')
  const showSearchAndFilters = isPackagesPage || isTripsPage

  // Navigation items
  const navigationItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Packages', href: '/packages', icon: Package, badge: 5 },
    { name: 'Trips', href: '/trips', icon: MapPin, badge: 2 },
    { name: 'Messages', href: '/messages', icon: MessageCircle, badge: 3 },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: 1 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Filter options for packages
  const packageFilters: FilterOption[] = [
    { label: 'Posted', value: 'POSTED', count: 12 },
    { label: 'Matched', value: 'MATCHED', count: 8 },
    { label: 'In Transit', value: 'IN_TRANSIT', count: 5 },
    { label: 'Delivered', value: 'DELIVERED', count: 23 },
    { label: 'Fragile', value: 'fragile', count: 7 },
    { label: 'Express', value: 'express', count: 4 },
  ]

  // Filter options for trips
  const tripFilters: FilterOption[] = [
    { label: 'Posted', value: 'POSTED', count: 8 },
    { label: 'Active', value: 'ACTIVE', count: 6 },
    { label: 'Completed', value: 'COMPLETED', count: 15 },
    { label: 'Flight', value: 'flight', count: 10 },
    { label: 'Car', value: 'car', count: 5 },
    { label: 'Train', value: 'train', count: 3 },
  ]

  // Sort options
  const sortOptions = [
    { label: 'Newest First', value: 'date' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Distance', value: 'distance' },
    { label: 'Rating', value: 'rating' },
  ]

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleFilter = (filterValue: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterValue)
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue]
    )
  }

  const clearFilters = () => {
    setSelectedFilters([])
    setSearchQuery('')
    setSortBy('date')
  }

  const currentFilters = isPackagesPage ? packageFilters : tripFilters

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isExpanded ? 'w-80' : 'w-20'}
        lg:${isExpanded ? 'w-80' : 'w-20'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className={`flex items-center space-x-3 ${!isExpanded && 'lg:justify-center'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              {isExpanded && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Fakomame</h1>
                  <p className="text-xs text-gray-500">Package Delivery</p>
                </div>
              )}
            </div>
            
            {/* Desktop Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Mobile Close */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Section */}
          {showSearchAndFilters && isExpanded && (
            <div className="p-4 border-b border-gray-200 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${isPackagesPage ? 'packages' : 'trips'}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {/* Add new item logic */}}
                >
                  <PlusCircle className="w-3 h-3 mr-1" />
                  Add {isPackagesPage ? 'Package' : 'Trip'}
                </Button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group
                    ${isActive 
                      ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${!isExpanded && 'lg:justify-center'}
                  `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-700' : 'text-gray-500'}`} />
                  {isExpanded && (
                    <>
                      <span className="flex-1 font-medium">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Filters Section */}
          {showSearchAndFilters && isExpanded && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              {/* Sort */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <SortAsc className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sort By</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters</span>
                  </div>
                  {selectedFilters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-teal-600 hover:text-teal-800"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {currentFilters.map((filter) => (
                    <label key={filter.value} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(filter.value)}
                          onChange={() => toggleFilter(filter.value)}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">{filter.label}</span>
                      </div>
                      {filter.count && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {filter.count}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Applied Filters */}
              {selectedFilters.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedFilters.map((filter) => {
                    const filterOption = currentFilters.find(f => f.value === filter)
                    return (
                      <span
                        key={filter}
                        className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                      >
                        {filterOption?.label}
                        <button
                          onClick={() => toggleFilter(filter)}
                          className="ml-1 hover:text-teal-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* User Info */}
          {user && isExpanded && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.firstName} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-600 font-medium text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Fakomame</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
