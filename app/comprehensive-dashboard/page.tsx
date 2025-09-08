import { Suspense } from 'react'
import ComprehensiveDashboard from '@/components/comprehensive-dashboard'
import { Card, CardContent } from '@/components/ui/card'

export default function ComprehensiveDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          📊 Comprehensive Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Complete database insights covering all 21 tables with transparent data analytics
        </p>
      </div>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <ComprehensiveDashboard />
      </Suspense>
    </div>
  )
}
