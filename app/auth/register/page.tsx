'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'

const RegisterForm = dynamic(
  () => import('@/components/auth').then(mod => ({ default: mod.RegisterForm })),
  { ssr: false }
)

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto h-12 w-auto"
          src="/logo.jpg"
          alt="Fakomame"
          width={48}
          height={48}
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join Fakomame
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect with travelers worldwide
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </div>
  )
}
