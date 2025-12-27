'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, Plus, Search, Calendar, Image, Users, ChevronRight, Loader2, ArrowLeft } from 'lucide-react'
import { supabase, type Event } from '@/lib/supabase'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function EventsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/giris')
      return
    }

    await loadEvents(session.user.id)
  }

  const loadEvents = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('studio_id', userId)
        .order('created_at', { ascending: false })

      if (data) {
        setEvents(data)
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
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
              <Link href="/panel" className="text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-white">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-2">
                <Camera className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-secondary-800 dark:text-white">Etkinlikler</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <Link href="/panel/etkinlik/olustur" className="btn-primary flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Yeni Etkinlik</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Etkinlik ara..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <div className="card dark:bg-gray-800 dark:border-gray-700 text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-secondary-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-secondary-800 dark:text-white mb-2">
              {searchTerm ? 'Sonuç bulunamadı' : 'Henüz etkinlik yok'}
            </h3>
            <p className="text-secondary-500 dark:text-gray-400 mb-6">
              {searchTerm ? 'Farklı bir arama deneyin' : 'İlk etkinliğinizi oluşturun'}
            </p>
            {!searchTerm && (
              <Link href="/panel/etkinlik/olustur" className="btn-primary inline-flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Yeni Etkinlik Oluştur
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={`/panel/etkinlik/${event.id}`}
                className="card dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between hover:shadow-lg dark:hover:bg-gray-700/50 transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-secondary-800 dark:text-white">{event.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {event.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-secondary-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {event.event_date ? new Date(event.event_date).toLocaleDateString('tr-TR') : 'Tarih yok'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Image className="h-4 w-4" />
                      {event.photo_count} fotoğraf
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.participant_count} katılımcı
                    </span>
                  </div>
                  <p className="text-sm text-primary font-medium mt-2">
                    Kod: {event.event_code}
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 text-secondary-400 dark:text-gray-500" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
