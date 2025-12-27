'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sifre-sifirla`,
      })

      if (error) {
        toast.error('Bir hata oluştu: ' + error.message)
        return
      }

      setEmailSent(true)
      toast.success('Şifre sıfırlama linki gönderildi!')
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="card dark:bg-gray-800 dark:border-gray-700 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
              E-postanızı Kontrol Edin
            </h1>
            <p className="text-secondary-600 dark:text-gray-400 mb-6">
              <strong>{email}</strong> adresine bir şifre sıfırlama linki gönderdik.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left text-sm">
              <p className="text-blue-900 dark:text-blue-300 font-medium mb-2">📧 Sonraki adımlar:</p>
              <ol className="space-y-2 text-blue-700 dark:text-blue-400">
                <li>1. E-posta kutunuzu kontrol edin</li>
                <li>2. Şifre sıfırlama linkine tıklayın</li>
                <li>3. Yeni şifrenizi oluşturun</li>
              </ol>
            </div>

            <p className="text-xs text-secondary-500 dark:text-gray-400 mb-4">
              💡 E-posta gelmedi mi? Spam/Gereksiz klasörünü kontrol edin.
            </p>

            <Link href="/giris" className="btn-outline w-full flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    )
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

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card dark:bg-gray-800 dark:border-gray-700 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-secondary-800 dark:text-white mb-2">
              Şifrenizi mi Unuttunuz?
            </h1>
            <p className="text-secondary-500 dark:text-gray-400">
              E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Gönderiliyor...
                </>
              ) : (
                'Sıfırlama Linki Gönder'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/giris" className="text-secondary-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
