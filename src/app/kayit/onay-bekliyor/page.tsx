'use client'

import { useState, useEffect } from 'next'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function EmailVerificationPage() {
  const router = useRouter()
  const t = useTranslations('auth')
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

      toast.success(t('email_sent_again'))
      setCountdown(60)
    } catch (error) {
      toast.error(t('email_send_failed'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            {t('check_your_email')}
          </h1>
          <p className="text-secondary-600 mb-6">
            <strong>{email}</strong> {t('verification_sent')}
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm">1. {t('step_1')}</p>
                <p className="text-blue-700 text-xs">{t('step_1_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm">2. {t('step_2')}</p>
                <p className="text-blue-700 text-xs">{t('step_2_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm">3. {t('step_3')}</p>
                <p className="text-blue-700 text-xs">{t('step_3_desc')}</p>
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
                {t('resending')}
              </>
            ) : countdown > 0 ? (
              t('resend_countdown', { seconds: countdown })
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {t('resend_email')}
              </>
            )}
          </button>

          <p className="text-xs text-secondary-500">
            💡 {t('spam_notice')}
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-secondary-600">
            {t('having_trouble')}{' '}
            <a href="mailto:destek@dijipot.com" className="text-primary font-semibold hover:underline">
              {t('contact_support')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
