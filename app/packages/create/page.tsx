'use client'

import dynamic from 'next/dynamic'
import { NavHeader, FloatingActionButton } from '@/components/shared'
import { useAuth } from '@/lib/hooks/api'
import { Footer } from '@/components/navigation'

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
      <div className="min-h-screen ">
        {/* Sticky Header */}
        <NavHeader
          title="AMENADE"
          showCreatePackage={false}
          name={`${currentUser?.firstName} ${currentUser?.lastName}`}
          email={currentUser?.email || ''}
          showMenuItems={false}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-0">
            <PackageForm />
          </div>
        </main>

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton />
      </div>
      <Footer />
    </AuthGuard>
  )
}
