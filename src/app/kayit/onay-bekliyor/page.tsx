'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function EmailVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
        
        if (user.confirmed_at) {
          router.push('/panel')
        }
      } else {
        router.push('/kayit')
      }
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const resendEmail = async () => {
    if (countdown > 0) return
    
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      toast.success('Doğrulama e-postası tekrar gönderildi!')
      setCountdown(60)
    } catch (error) {
      toast.error('E-posta gönderilemedi')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Dark Mode Toggle - Fixed Top Right */}
      <div className="fixed top-6 right-6 z-10">
        <DarkModeToggle />
      </div>

      <div className="max-w-md w-full">
        <div className="card dark:bg-gray-800 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
            E-postanızı Kontrol Edin
          </h1>
          <p className="text-secondary-600 dark:text-gray-400 mb-6">
            <strong>{email}</strong> adresine bir doğrulama linki gönderdik.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">1. E-postanızı açın</p>
                <p className="text-blue-700 dark:text-blue-400 text-xs">Gelen kutunuzu kontrol edin</p>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">2. Linke tıklayın</p>
                <p className="text-blue-700 dark:text-blue-400 text-xs">E-postadaki doğrulama linkini kullanın</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">3. Otomatik yönlendirileceksiniz</p>
                <p className="text-blue-700 dark:text-blue-400 text-xs">Panel sayfasına giriş yapacaksınız</p>
              </div>
            </div>
          </div>

          <button
            onClick={resendEmail}
            disabled={countdown > 0 || resending}
            className="btn-outline w-full mb-4 flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : countdown > 0 ? (
              `Tekrar gönder (${countdown}s)`
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                E-postayı Tekrar Gönder
              </>
            )}
          </button>

          <p className="text-xs text-secondary-500 dark:text-gray-400">
            💡 E-posta gelmedi mi? <strong>Spam/Gereksiz</strong> klasörünü kontrol edin.
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-secondary-600 dark:text-gray-400">
            Sorun mu yaşıyorsunuz?{' '}
            <a href="mailto:destek@dijipot.com" className="text-primary font-semibold hover:underline">
              Destek ekibimize yazın
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
