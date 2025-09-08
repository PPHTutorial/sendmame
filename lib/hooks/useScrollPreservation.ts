import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Custom hook to manage scroll position in dashboard
export function useScrollPreservation() {
  const pathname = usePathname()

  useEffect(() => {
    // Prevent automatic scroll to top on route changes within dashboard
    if (pathname.startsWith('/dashboard')) {
      // Save current scroll position
      const scrollPosition = window.scrollY
      
      // Use setTimeout to allow the route change to complete
      const timer = setTimeout(() => {
        // Only scroll to top if we're navigating to a completely different section
        // or if the user explicitly wants to go to top
        const isDifferentSection = sessionStorage.getItem('dashboardScrollReset') === 'true'
        
        if (!isDifferentSection) {
          window.scrollTo(0, scrollPosition)
        } else {
          // Reset the flag after using it
          sessionStorage.removeItem('dashboardScrollReset')
        }
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [pathname])
}

// Helper function to reset scroll when needed (call this on specific navigation)
export function resetDashboardScroll() {
  sessionStorage.setItem('dashboardScrollReset', 'true')
}
