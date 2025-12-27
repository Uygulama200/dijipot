'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Lütfen giriş yapın')
        router.push('/giris')
        return
      }

      setUserEmail(session.user.email || '')
      setChecking(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/giris')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır')
      return
    }

    if (formData.newPassword === formData.currentPassword) {
      toast.error('Yeni şifre eski şifrenizden farklı olmalıdır')
      return
    }

    setLoading(true)

    try {
      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: formData.currentPassword,
      })

      if (verifyError) {
        toast.error('Mevcut şifre yanlış')
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) {
        if (updateError.message.includes('should be different')) {
          toast.error('Yeni şifre eski şifrenizden farklı olmalıdır')
        } else {
          toast.error('Şifre güncellenemedi: ' + updateError.message)
        }
        setLoading(false)
        return
      }

      toast.success('Şifreniz başarıyla güncellendi!')
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        router.push('/panel')
      }, 2000)
    } catch (error) {
      console.error('Password change error:', error)
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/panel" 
                className="text-secondary-600 dark:text-gray-400 hover:text-secondary-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  Şifre Değiştir
                </h1>
                <p className="text-secondary-600 dark:text-gray-400 text-sm mt-1">
                  Hesabınızın güvenliği için güçlü bir şifre kullanın
                </p>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="Mevcut şifreniz"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                  <input
                    type="password"
                    required
                    className="input-field pl-10"
                    placeholder="En az 6 karakter"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                  Yeni Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                  <input
                    type="password"
                    required
                    className="input-field pl-10"
                    placeholder="Yeni şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                📋 Şifre Gereksinimleri:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• En az 6 karakter uzunluğunda olmalı</li>
                <li>• Eski şifrenizden farklı olmalı</li>
                <li>• Güçlü bir şifre için harf, rakam ve sembol kullanın</li>
              </ul>
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
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Şifreyi Güncelle
                  </>
                )}
              </button>

              <Link href="/panel" className="btn-outline">
                İptal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
