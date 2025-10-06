'use client'

import dynamic from 'next/dynamic'
import { NavHeader, FloatingActionButton } from '@/components/shared'
import { useAuth } from '@/lib/hooks/api'

const AuthGuard = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.AuthGuard })),
  { ssr: false }
)

const PackageForm = dynamic(
  () => import('@/components/packages/PackageForm').then(mod => ({ default: mod.PackageForm })),
  { ssr: false }
)

export default function CreatePackagePage() {

  const { getCurrentUser } = useAuth()
  const { data: currentUser } = getCurrentUser
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {/* Sticky Header */}
        <NavHeader
          title="Send Package"
          showCreatePackage={false}
          name={`${currentUser?.firstName} ${currentUser?.lastName}`}
          email={currentUser?.email || ''}
          showMenuItems={false}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <PackageForm />
          </div>
        </main>

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton />
      </div>
    </AuthGuard>
  )
}
