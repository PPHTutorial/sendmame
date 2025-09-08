import DashboardHeader from "@/components/dashboard/DashboardHeader"
import DashboardOverview from "@/components/dashboard/DashboardOverview"
import EnhancedDashboardContent from "@/components/dashboard/EnhancedDashboardContent"
import { SkeletonLoader } from "@/components/ui/dashboard-components"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Enhanced Analytics Dashboard - SendMame",
  description: "Comprehensive analytics dashboard with real-time insights, interactive charts, and data-driven metrics for SendMame platform.",
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader className="h-8 w-64" />
          <SkeletonLoader className="h-4 w-96" />
        </div>
        <SkeletonLoader className="h-10 w-32" />
      </div>

      {/* Time Range Toggle Skeleton */}
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-9 w-16" />
        ))}
      </div>

      {/* Metrics Grid SkeletonLoader */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4 p-6 bg-white rounded-lg border">
            <SkeletonLoader className="h-4 w-24" />
            <SkeletonLoader className="h-8 w-16" />
            <SkeletonLoader className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Grid SkeletonLoader */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4 p-6 bg-white rounded-lg border">
            <SkeletonLoader className="h-6 w-32" />
            <SkeletonLoader className="h-64 w-full" />
          </div>
        ))}
      </div>

      {/* Activity Feed SkeletonLoader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 p-6 bg-white rounded-lg border">
          <SkeletonLoader className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded">
              <SkeletonLoader className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonLoader className="h-4 w-3/4" />
                <SkeletonLoader className="h-3 w-1/2" />
              </div>
              <SkeletonLoader className="h-6 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-4 p-6 bg-white rounded-lg border">
          <SkeletonLoader className="h-6 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <SkeletonLoader className="h-4 w-20" />
                <SkeletonLoader className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <DashboardHeader 
        title="Analytics Dashboard"
        description="Real-time insights and comprehensive metrics for your SendMame platform"
      />
      
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  )
}
