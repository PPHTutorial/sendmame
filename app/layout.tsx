import type { Metadata } from "next"
import "./globals.css"
import localFont from 'next/font/local'
import QueryProvider from '@/components/providers/QueryProvider'
import { Toaster } from "react-hot-toast"
import { NavigationHeader, Footer } from '@/components/navigation'
import { Roboto } from 'next/font/google'

export const metadata: Metadata = {
  title: "Fakomame - Community-Driven Package Delivery",
  description: "Connect senders with travelers for fast, reliable, and cost-effective package delivery worldwide.",
  keywords: "package delivery, travel, shipping, logistics, community, global shipping, package transport, courier service",
  authors: [{ name: "Fakomame Team" }],
  creator: "Fakomame",
  publisher: "Fakomame",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fakomame.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Fakomame - Community-Driven Package Delivery",
    description: "Connect senders with travelers for fast, reliable, and cost-effective package delivery worldwide.",
    url: 'https://fakomame.com',
    siteName: 'Fakomame',
    images: [
      {
        url: 'https://fakomame.com/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Fakomame - Community-Driven Package Delivery',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Fakomame - Community-Driven Package Delivery",
    description: "Connect senders with travelers for fast, reliable, and cost-effective package delivery worldwide.",
    images: ['https://fakomame.com/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="h-full" lang="en">
      <body className={`${roboto.variable} ${roboto.variable} bg-white h-full`}>
        <Toaster />
        <QueryProvider>
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  )
}

