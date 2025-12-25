'use client'

import Link from 'next/link'
import { Lock, User, Building2, Mail, Phone } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">
          Hesap Ayarları
        </h1>

        <div className="space-y-4">
          {/* Password */}
          <Link href="/panel/ayarlar/sifre" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">Şifre Değiştir</h3>
                <p className="text-sm text-secondary-600">Hesap şifrenizi güncelleyin</p>
              </div>
              <div className="text-secondary-400">→</div>
            </div>
          </Link>

          {/* Profile (placeholder for future) */}
          <div className="card opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-600">Profil Bilgileri</h3>
                <p className="text-sm text-gray-500">Yakında eklenecek</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
