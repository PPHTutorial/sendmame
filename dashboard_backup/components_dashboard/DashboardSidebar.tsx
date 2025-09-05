'use client'

import React from 'react'
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
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
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
      {
        name: 'Real-time Monitor',
        href: '/dashboard/monitor',
        icon: Activity,
        description: 'Live system monitoring'
      }
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
        description: 'User profiles & verification'
      },
      {
        name: 'User Profiles',
        href: '/dashboard/user-profiles',
        icon: UserCheck,
        description: 'Detailed profile management'
      },
      {
        name: 'Packages',
        href: '/dashboard/packages',
        icon: Package,
        badge: '847',
        description: 'Package tracking & management'
      },
      {
        name: 'Trips',
        href: '/dashboard/trips',
        icon: Plane,
        badge: '234',
        description: 'Trip scheduling & routing'
      },
      {
        name: 'Verifications',
        href: '/dashboard/verifications',
        icon: Shield,
        badge: '23',
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

export function DashboardSidebar({ 
  collapsed, 
  onToggle, 
  isMobile = false, 
  isOpen = false, 
  onClose 
}: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

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
                <span className="text-lg font-bold text-gray-900">Fakomame</span>
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
                      onClick={() => isMobile && onClose?.()}
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
                          {item.badge}
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t border-gray-200",
        collapsed ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "space-x-3"
        )}>
          <div className={cn(
            "flex items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-600 text-white",
            collapsed ? "h-6 w-6" : "h-8 w-8"
          )}>
            <Zap className={cn(
              collapsed ? "h-3 w-3" : "h-4 w-4"
            )} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900">System Status</div>
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>All Systems Operational</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
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
