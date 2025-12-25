import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dijipot - Yapay Zeka ile Fotoğraf Dağıtımı',
  description: 'Etkinlik fotoğraflarınızı yapay zeka ile otomatik eşleştirin ve misafirlerinize anında ulaştırın.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
