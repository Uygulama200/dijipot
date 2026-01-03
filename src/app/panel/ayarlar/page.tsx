'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, User, Loader2, ArrowLeft, Camera, ChevronRight } from 'lucide-react'
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/panel" className="text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-white">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-2">
                <Camera className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-secondary-800 dark:text-white">Hesap Ayarları</span>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userName && (
          <div className="mb-6">
            <p className="text-secondary-600 dark:text-gray-400">
              Merhaba, <strong className="text-secondary-800 dark:text-white">{userName}</strong>
            </p>
          </div>
        )}

        {/* Settings Grid */}
        <div className="grid gap-4">
          {/* Profile */}
          <Link 
            href="/panel/ayarlar/profil" 
            className="card dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between hover:shadow-lg dark:hover:bg-gray-700/50 transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-white">Profil Bilgileri</h3>
                <p className="text-sm text-secondary-500 dark:text-gray-400">İsim, telefon gibi bilgilerinizi güncelleyin</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-secondary-400 dark:text-gray-500 flex-shrink-0" />
          </Link>

          {/* Password */}
          <Link 
            href="/panel/ayarlar/sifre" 
            className="card dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between hover:shadow-lg dark:hover:bg-gray-700/50 transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-white">Şifre Değiştir</h3>
                <p className="text-sm text-secondary-500 dark:text-gray-400">Hesap şifrenizi güncelleyin</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-secondary-400 dark:text-gray-500 flex-shrink-0" />
          </Link>
        </div>
      </main>
    </div>
  )
}
