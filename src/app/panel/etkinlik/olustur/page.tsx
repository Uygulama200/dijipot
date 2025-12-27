'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, ArrowLeft, Calendar, Type, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import DarkModeToggle from '@/components/DarkModeToggle'

function generateEventCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    eventDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/giris')
        return
      }

      const eventCode = generateEventCode()

      const { data, error } = await supabase
        .from('events')
        .insert({
          studio_id: session.user.id,
          name: formData.name,
          event_date: formData.eventDate || null,
          event_code: eventCode,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        toast.error('Etkinlik oluşturulamadı: ' + error.message)
        return
      }

      toast.success('Etkinlik oluşturuldu!')
      router.push(`/panel/etkinlik/${data.id}`)
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
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
                <span className="text-2xl font-bold text-secondary-800 dark:text-white">Yeni Etkinlik</span>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-secondary-800 dark:text-white mb-6">
            Etkinlik Bilgileri
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                Etkinlik Adı *
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                <input
                  type="text"
                  required
                  className="input-field pl-10"
                  placeholder="Örn: Ali & Ayşe Düğünü"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                Etkinlik Tarihi
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
                <input
                  type="date"
                  className="input-field pl-10"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <p className="text-sm text-secondary-500 dark:text-gray-400">
                💡 Etkinlik oluşturulduktan sonra benzersiz bir QR kod alacaksınız. 
                Bu QR kodu misafirlerinizle paylaşabilirsiniz.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/panel" className="btn-outline flex-1 text-center">
                İptal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  'Etkinlik Oluştur'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
