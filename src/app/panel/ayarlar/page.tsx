'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, User, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/giris')
        return
      }

      // Get user name
      const { data: studio } = await supabase
        .from('studios')
        .select('name')
        .eq('id', session.user.id)
        .single()

      if (studio) {
        setUserName(studio.name)
      }

      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/giris')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Hesap Ayarları
            </h1>
            {userName && (
              <p className="text-secondary-600 dark:text-gray-400 mt-2">
                Merhaba, <strong>{userName}</strong>
              </p>
            )}
          </div>
          <DarkModeToggle />
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <Link href="/panel/ayarlar/profil" className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg dark:hover:bg-gray-700/50 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900 dark:text-white">Profil Bilgileri</h3>
                <p className="text-sm text-secondary-600 dark:text-gray-400">İsim, telefon gibi bilgilerinizi güncelleyin</p>
              </div>
              <div className="text-secondary-400 dark:text-gray-500">→</div>
            </div>
          </Link>

          {/* Password */}
          <Link href="/panel/ayarlar/sifre" className="card dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg dark:hover:bg-gray-700/50 transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900 dark:text-white">Şifre Değiştir</h3>
                <p className="text-sm text-secondary-600 dark:text-gray-400">Hesap şifrenizi güncelleyin</p>
              </div>
              <div className="text-secondary-400 dark:text-gray-500">→</div>
            </div>
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/panel" className="text-primary hover:underline">
            ← Panel'e Dön
          </Link>
        </div>
      </div>
    </div>
  )
}
