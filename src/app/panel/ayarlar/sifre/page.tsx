'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor')
      return
    }

    if (formData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (error) {
        if (error.message.includes('should be different')) {
          toast.error('Yeni şifre eski şifrenizden farklı olmalıdır')
        } else {
          toast.error('Şifre güncellenemedi: ' + error.message)
        }
        return
      }

      toast.success('Şifreniz başarıyla güncellendi!')
      
      setFormData({
        newPassword: '',
        confirmPassword: '',
      })

      setTimeout(() => {
        router.push('/panel')
      }, 2000)
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/panel" 
              className="text-secondary-600 hover:text-secondary-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Şifre Değiştir
              </h1>
              <p className="text-secondary-600 text-sm mt-1">
                Hesabınızın güvenliği için güçlü bir şifre kullanın
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
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

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Yeni Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                📋 Şifre Gereksinimleri:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• En az 6 karakter uzunluğunda olmalı</li>
                <li>• Eski şifrenizden farklı olmalı</li>
                <li>• Güçlü bir şifre için harf, rakam ve sembol kullanın</li>
              </ul>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
