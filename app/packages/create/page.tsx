'use client'

import dynamic from 'next/dynamic'

const AuthGuard = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.AuthGuard })),
  { ssr: false }
)

const PackageForm = dynamic(
  () => import('@/components/packages/PackageForm').then(mod => ({ default: mod.PackageForm })),
  { ssr: false }
)

export default function CreatePackagePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Send Package</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <PackageForm />
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
