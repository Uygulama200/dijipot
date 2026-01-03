'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Building2, ArrowLeft, Loader2, CheckCircle, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Lütfen giriş yapın')
        router.push('/giris')
        return
      }

      // Get studio data
      const { data: studio, error } = await supabase
        .from('studios')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Profile load error:', error)
        toast.error('Profil yüklenemedi')
        return
      }

      if (studio) {
        setFormData({
          name: studio.name || '',
          email: studio.email || session.user.email || '',
          phone: studio.phone || '',
        })
      }

      setChecking(false)
    } catch (error) {
      console.error('Load profile error:', error)
      router.push('/giris')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Stüdyo adı boş olamaz')
      return
    }

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Oturum bulunamadı')
        router.push('/giris')
        return
      }

      // Update studio data
      const { error } = await supabase
        .from('studios')
        .update({
          name: formData.name,
          phone: formData.phone,
        })
        .eq('id', session.user.id)

      if (error) {
        toast.error('Profil güncellenemedi: ' + error.message)
        return
      }

      toast.success('Profil başarıyla güncellendi!')
      
      setTimeout(() => {
        router.push('/panel')
      }, 1500)
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
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
              <Link 
                href="/panel/ayarlar" 
                className="text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-white"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-2">
                <Camera className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-secondary-800 dark:text-white">
                    Profil Bilgileri
                  </h1>
                  <p className="text-secondary-600 dark:text-gray-400 text-sm">
                    Hesap bilgilerinizi güncelleyin
                  </p>
                </div>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                  Stüdyo / İşletme Adı
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    className="input-field pl-10"
                    placeholder="Stüdyo adınız"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                  <input
                    type="email"
                    disabled
                    className="input-field pl-10 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60"
                    value={formData.email}
                  />
                </div>
                <p className="text-xs text-secondary-500 dark:text-gray-400 mt-1">
                  E-posta adresi değiştirilemez
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    className="input-field pl-10"
                    placeholder="05XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </button>

                <Link href="/panel/ayarlar" className="btn-outline">
                  İptal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
