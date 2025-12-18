'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Camera, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { supabase, type Event } from '@/lib/supabase'

export default function JoinEventPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [code])

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_code', code.toUpperCase())
        .single()

      if (error || !data) {
        setError(true)
      } else {
        setEvent(data)
      }
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">
            Etkinlik Bulunamadı
          </h1>
          <p className="text-secondary-500 mb-6">
            Bu etkinlik kodu geçersiz veya etkinlik sona ermiş olabilir.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      {/* Header */}
      <header className="p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Camera className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-secondary-800">Dijipot</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="card max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">
            {event.name}
          </h1>
          
          {event.event_date && (
            <p className="flex items-center justify-center gap-2 text-secondary-500 mb-8">
              <Calendar className="h-5 w-5" />
              {new Date(event.event_date).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}

          <p className="text-secondary-600 mb-8">
            Bu etkinliğin fotoğraflarını görmek için selfie çekin ve fotoğraflarınızı bulalım!
          </p>

          <button
            onClick={() => router.push(`/selfie?event=${code}`)}
            className="btn-primary w-full text-lg py-4"
          >
            🎉 Fotoğraflarımı Bul
          </button>

          <p className="text-xs text-secondary-400 mt-6">
            Fotoğraflarınız yüz tanıma teknolojisi ile eşleştirilecektir.
          </p>
        </div>
      </main>
    </div>
  )
}
