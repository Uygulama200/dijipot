'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, Calendar, Image, Users, Plus, LogOut, Settings, ChevronRight, Loader2 } from 'lucide-react'
import { supabase, type Event, type Studio } from '@/lib/supabase'
import toast from 'react-hot-toast'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [studio, setStudio] = useState<Studio | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalPhotos: 0,
    totalParticipants: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/giris')
      return
    }

    await loadData(session.user.id)
  }

  const loadData = async (userId: string) => {
    try {
      // Get studio info
      const { data: studioData } = await supabase
        .from('studios')
        .select('*')
        .eq('id', userId)
        .single()

      if (studioData) {
        setStudio(studioData)
      }

      // Get events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('studio_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (eventsData) {
        setEvents(eventsData)
      }

      // Get stats
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('studio_id', userId)

      const { data: allEvents } = await supabase
        .from('events')
        .select('photo_count, participant_count')
        .eq('studio_id', userId)

      let totalPhotos = 0
      let totalParticipants = 0
      allEvents?.forEach(e => {
        totalPhotos += e.photo_count || 0
        totalParticipants += e.participant_count || 0
      })

      setStats({
        totalEvents: eventCount || 0,
        totalPhotos,
        totalParticipants,
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    toast.success('Çıkış yapıldı')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-secondary-800 dark:bg-gray-950 border-r border-gray-700 text-white p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-10">
          <Camera className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Dijipot</span>
        </div>
        
        <nav className="space-y-2">
          <Link href="/panel" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-700 dark:bg-gray-800">
            <Calendar className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/panel/etkinlikler" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-700 dark:hover:bg-gray-800 transition-colors">
            <Image className="h-5 w-5" />
            Etkinlikler
          </Link>
          <Link href="/panel/ayarlar" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-700 dark:hover:bg-gray-800 transition-colors">
            <Settings className="h-5 w-5" />
            Ayarlar
          </Link>
          <Link href="/fiyatlandirma" className="btn-primary">
            💎 Planları Gör
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-700 dark:hover:bg-gray-800 transition-colors text-secondary-400 dark:text-gray-400 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Çıkış Yap
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-secondary-800 dark:text-white">Dijipot</span>
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <button onClick={handleLogout} className="text-secondary-500 dark:text-gray-400">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        {/* Welcome */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-secondary-800 dark:text-white">
              Hoş geldin, {studio?.name || 'Kullanıcı'}! 👋
            </h1>
            <p className="text-secondary-500 dark:text-gray-400 mt-1">
              Etkinliklerini yönet ve fotoğraflarını paylaş.
            </p>
          </div>
          <div className="hidden lg:block">
            <DarkModeToggle />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 dark:text-gray-400 text-sm">Toplam Etkinlik</p>
                <p className="text-3xl font-bold text-secondary-800 dark:text-white mt-1">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 dark:text-gray-400 text-sm">Toplam Fotoğraf</p>
                <p className="text-3xl font-bold text-secondary-800 dark:text-white mt-1">{stats.totalPhotos}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Image className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-500 dark:text-gray-400 text-sm">Toplam Katılımcı</p>
                <p className="text-3xl font-bold text-secondary-800 dark:text-white mt-1">{stats.totalParticipants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <Link
          href="/panel/etkinlik/olustur"
          className="btn-primary inline-flex items-center gap-2 mb-8"
        >
          <Plus className="h-5 w-5" />
          Yeni Etkinlik Oluştur
        </Link>

        {/* Recent Events */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-800 dark:text-white">Son Etkinlikler</h2>
            <Link href="/panel/etkinlikler" className="text-primary hover:underline text-sm font-medium">
              Tümünü Gör
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-10 text-secondary-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz etkinlik oluşturmadınız.</p>
              <Link href="/panel/etkinlik/olustur" className="text-primary hover:underline mt-2 inline-block">
                İlk etkinliğinizi oluşturun
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/panel/etkinlik/${event.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-md dark:hover:bg-gray-700/50 transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-secondary-800 dark:text-white">{event.name}</h3>
                    <p className="text-sm text-secondary-500 dark:text-gray-400">
                      {event.event_date ? new Date(event.event_date).toLocaleDateString('tr-TR') : 'Tarih belirtilmemiş'}
                      {' • '}{event.photo_count} fotoğraf • {event.participant_count} katılımcı
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary-400 dark:text-gray-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-around">
          <Link href="/panel" className="flex flex-col items-center text-primary">
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link href="/panel/etkinlikler" className="flex flex-col items-center text-secondary-500 dark:text-gray-400">
            <Image className="h-6 w-6" />
            <span className="text-xs mt-1">Etkinlikler</span>
          </Link>
          <Link href="/panel/etkinlik/olustur" className="flex flex-col items-center text-secondary-500 dark:text-gray-400">
            <Plus className="h-6 w-6" />
            <span className="text-xs mt-1">Yeni</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
