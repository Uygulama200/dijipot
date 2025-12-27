'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      // Create auth user with email verification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { 
            full_name: formData.name,
            phone: formData.phone 
          }
        }
      })

      if (authError) {
        toast.error('Kayıt başarısız: ' + authError.message)
        return
      }

      // Create studio record
      if (authData.user) {
        const { error: studioError } = await supabase
          .from('studios')
          .insert({
            id: authData.user.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
          })

        if (studioError) {
          console.error('Studio creation error:', studioError)
        }
      }

      // E-posta doğrulama gerekiyorsa
      if (authData?.user && !authData.user.confirmed_at) {
        toast.success('Kayıt başarılı! Lütfen e-postanızı kontrol edin.')
        router.push('/kayit/onay-bekliyor')
        return
      }

      // Otomatik doğrulandıysa (test modu)
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
      router.push('/giris')
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-secondary-800 dark:text-white">Dijipot</span>
            </Link>
            <DarkModeToggle />
          </div>
        </nav>
      </header>

      {/* Register Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card dark:bg-gray-800 dark:border-gray-700 max-w-md w-full">
          <h1 className="text-2xl font-bold text-secondary-800 dark:text-white text-center mb-8">
            Hesap Oluştur
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                Stüdyo / İşletme Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="En az 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="Şifrenizi tekrar girin"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-secondary-500 dark:text-gray-400">
            Zaten hesabınız var mı?{' '}
            <Link href="/giris" className="text-primary font-semibold hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
