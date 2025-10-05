'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

import {
  LayoutDashboard, Users, Package, Plane, Shield, CreditCard,
  Wallet, Bell, MessageSquare, AlertTriangle, FileText,
  Settings, BarChart3, Activity, Lock, Receipt,
  UserCheck, MapPin, Star, Headphones, X,
  ChevronLeft, ChevronRight, Home, Building2,
  Zap
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
  description?: string
  badgeKey?: string // Key to map to real-time data
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface SidebarMetrics {
  users: string
  packages: string
  trips: string
  verifications: string
  messages: string
  disputes: string
}

function DashboardSidebar({ 
  collapsed, 
  onToggle, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}: SidebarProps) {
  const pathname = usePathname()
  const [metrics, setMetrics] = useState<SidebarMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const lastFetchRef = React.useRef<number>(0)

  // Optimized metrics fetching with intelligent caching
  const fetchMetrics = React.useCallback(async (force = false) => {
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchRef.current
    
    // Don't fetch if we just fetched recently (unless forced)
    if (!force && timeSinceLastFetch < 120000) return // 2 minutes minimum
    
    if (isLoading) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard/sidebar-metrics', {
        cache: 'no-store' // Prevent caching issues
      })
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
        lastFetchRef.current = now
      }
    } catch (error) {
      console.error('Failed to fetch sidebar metrics:', error)
      // Keep existing metrics as fallback
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  // Initialize metrics only once
  useEffect(() => {
    // Initial fetch only if no metrics exist
    if (!metrics) {
      fetchMetrics(true)
    }

    // Set up interval for periodic updates (much longer interval)
    const intervalId = setInterval(() => {
      fetchMetrics()
    }, 300000) // 5 minutes instead of 1 minute

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchMetrics, metrics])

  // Handle scroll position restoration only when navigating between pages
  useEffect(() => {
    const restoreScrollPosition = () => {
      const mainContent = document.querySelector('main')
      if (mainContent && pathname) {
        const savedScrollPosition = sessionStorage.getItem(`scroll-${pathname}`)
        if (savedScrollPosition) {
          // Only restore if we haven't scrolled yet (fresh navigation)
          if (mainContent.scrollTop === 0) {
            const scrollTop = parseInt(savedScrollPosition, 10)
            mainContent.scrollTop = scrollTop
          }
        }
      }
    }

    // Delay restoration to ensure DOM is ready and only on fresh navigation
    const timeoutId = setTimeout(restoreScrollPosition, 150)
    
    return () => clearTimeout(timeoutId)
  }, [pathname])

  // Clean up old scroll positions (keep only last 10 pages)
  useEffect(() => {
    const cleanupOldScrollPositions = () => {
      const keys = Object.keys(sessionStorage).filter(key => key.startsWith('scroll-'))
      if (keys.length > 10) {
        keys.slice(0, keys.length - 10).forEach(key => {
          sessionStorage.removeItem(key)
        })
      }
    }
    
    cleanupOldScrollPositions()
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const navigationSections: NavigationSection[] = [
    {
      title: 'Overview',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          description: 'Main dashboard overview'
        },
        {
          name: 'Analytics',
          href: '/dashboard/analytics',
          icon: BarChart3,
          badge: 'Pro',
          description: 'Business insights & metrics'
        },
        /* {
          name: 'Real-time Monitor',
          href: '/dashboard/monitor',
          icon: Activity,
          description: 'Live system monitoring'
        } */
      ]
    },
    {
      title: 'Core Management',
      items: [
        {
          name: 'Users',
          href: '/dashboard/users',
          icon: Users,
          badge: '2.1k',
          badgeKey: 'users',
          description: 'User profiles & verification'
        },
        /* {
          name: 'User Profiles',
          href: '/dashboard/user-profiles',
          icon: UserCheck,
          description: 'Detailed profile management'
        }, */
        {
          name: 'Packages',
          href: '/dashboard/packages',
          icon: Package,
          badge: '847',
          badgeKey: 'packages',
          description: 'Package tracking & management'
        },
        {
          name: 'Trips',
          href: '/dashboard/trips',
          icon: Plane,
          badge: '234',
          badgeKey: 'trips',
          description: 'Trip scheduling & routing'
        },
        {
          name: 'Verifications',
          href: '/dashboard/verifications',
          icon: Shield,
          badge: '23',
          badgeKey: 'verifications',
          description: 'Document verification system'
        }
      ]
    },
    {
      title: 'Financial',
      items: [
        {
          name: 'Transactions',
          href: '/dashboard/transactions',
          icon: Receipt,
          description: 'Payment transaction history'
        },
        {
          name: 'Wallets',
          href: '/dashboard/wallets',
          icon: Wallet,
          description: 'User wallet management'
        },
        {
          name: 'Payment Methods',
          href: '/dashboard/payment-methods',
          icon: CreditCard,
          description: 'Payment gateway integration'
        }
      ]
    },
    {
      title: 'Operations',
      items: [
        {
          name: 'Tracking Events',
          href: '/dashboard/tracking',
          icon: MapPin,
          description: 'Package location tracking'
        },
        {
          name: 'Reviews',
          href: '/dashboard/reviews',
          icon: Star,
          description: 'User ratings & feedback'
        },
        {
          name: 'Messages',
          href: '/dashboard/messages',
          icon: MessageSquare,
          badge: '12',
          badgeKey: 'messages',
          description: 'Communication hub'
        },
        {
          name: 'Chat Management',
          href: '/dashboard/chats',
          icon: Headphones,
          description: 'Chat system oversight'
        }
      ]
    },
    {
      title: 'Safety & Support',
      items: [
        {
          name: 'Disputes',
          href: '/dashboard/disputes',
          icon: AlertTriangle,
          badge: '5',
          badgeKey: 'disputes',
          description: 'Dispute resolution center'
        },
        {
          name: 'Safety Confirmations',
          href: '/dashboard/safety',
          icon: Shield,
          description: 'Safety verification system'
        },
        {
          name: 'Notifications',
          href: '/dashboard/notifications',
          icon: Bell,
          description: 'System notification management'
        }
      ]
    },
    {
      title: 'System Administration',
      items: [
        {
          name: 'Accounts',
          href: '/dashboard/accounts',
          icon: Building2,
          description: 'OAuth & external accounts'
        },
        {
          name: 'Sessions',
          href: '/dashboard/sessions',
          icon: Lock,
          description: 'Active user sessions'
        },
        {
          name: 'Audit Logs',
          href: '/dashboard/audit-logs',
          icon: FileText,
          description: 'System activity tracking'
        },
        {
          name: 'System Config',
          href: '/dashboard/system-config',
          icon: Settings,
          description: 'Global system settings'
        }
      ]
    }
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={cn(
        "border-b border-gray-200",
        collapsed ? "px-2 py-4" : "px-4"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "flex-col space-y-3" : "justify-between h-16"
        )}>
          <Link href="/dashboard" className={cn(
            "flex items-center",
            collapsed ? "flex-col space-y-1" : "space-x-2"
          )}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-600 text-white">
              <Home className="h-4 w-4" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">Amenade</span>
                <span className="text-xs text-gray-500">Admin Portal</span>
              </div>
            )}
            {collapsed && !isMobile && (
              <span className="text-xs font-medium text-gray-700 text-center">Admin</span>
            )}
          </Link>
          
          {/* Toggle button for desktop - positioned based on collapsed state */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
                collapsed && "mt-1"
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </button>
          )}

          {/* Close button for mobile */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className={cn(
          "flex-1 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-4"
        )}
      >
        <div className={cn(
          collapsed ? "space-y-2" : "space-y-8"
        )}>
          {navigationSections.map((section) => (
            <div key={section.title}>
              {(!collapsed || isMobile) && (
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </h3>
              )}
              <div className={cn(
                collapsed ? "space-y-1" : "space-y-1"
              )}>
                {section.items.map((item) => (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      onClick={(_e) => {
                        // Save current scroll position for this page only if we've scrolled
                        const mainContent = document.querySelector('main')
                        if (mainContent && mainContent.scrollTop > 0) {
                          sessionStorage.setItem(`scroll-${pathname}`, mainContent.scrollTop.toString())
                        }
                        
                        if (isMobile) {
                          onClose?.()
                        }
                      }}
                      className={cn(
                        'flex items-center rounded-lg font-medium transition-all duration-200',
                        collapsed 
                          ? 'justify-center p-2 mx-auto w-10 h-10' 
                          : 'justify-between px-3 py-2.5 text-sm',
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-teal-50 to-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      title={collapsed && !isMobile ? `${item.name}${item.description ? ` - ${item.description}` : ''}` : undefined}
                    >
                      <div className={cn(
                        "flex items-center",
                        collapsed ? "justify-center" : "space-x-3"
                      )}>
                        <div className={cn(
                          'flex items-center justify-center rounded-lg transition-colors',
                          collapsed ? 'h-5 w-5' : 'h-8 w-8',
                          isActive(item.href)
                            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                            : 'text-gray-500 group-hover:text-gray-700'
                        )}>
                          <item.icon className={cn(
                            collapsed ? "h-4 w-4" : "h-4 w-4"
                          )} />
                        </div>
                        {(!collapsed || isMobile) && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>
                      
                      {(!collapsed || isMobile) && item.badge && (
                        <div className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          isActive(item.href)
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-gray-100 text-gray-600'
                        )}>
                          {/* Use real-time data if available, fallback to static badge */}
                          {item.badgeKey && metrics ? metrics[item.badgeKey as keyof SidebarMetrics] : item.badge}
                        </div>
                      )}
                    </Link>

                    {/* Tooltip for collapsed state */}
                    {collapsed && !isMobile && (
                      <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                          {item.name}
                          {item.badge && (
                            <span className="ml-2 bg-gray-700 rounded px-1">
                              {item.badgeKey && metrics ? metrics[item.badgeKey as keyof SidebarMetrics] : item.badge}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-1.5 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-gray-200 p-4",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <Zap className="h-4 w-4" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">System Status</span>
              <span className="text-xs text-green-600">All systems operational</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-80 transform bg-white transition-transform duration-300 ease-in-out lg:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <SidebarContent />
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        'hidden bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:flex lg:flex-col',
        collapsed ? 'w-18' : 'w-80'
      )}
    >
      <SidebarContent />
    </div>
  )
}

export default DashboardSidebar
