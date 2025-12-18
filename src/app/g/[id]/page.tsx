'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Camera, Download, Image, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { supabase, type Photo, type Participant, type Event } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function GalleryPage() {
  const params = useParams()
  const participantId = params.id as string

  const [loading, setLoading] = useState(true)
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    loadData()
  }, [participantId])

  const loadData = async () => {
    try {
      // Get participant
      const { data: participantData } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single()

      if (!participantData) {
        return
      }

      setParticipant(participantData)

      // Get event
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', participantData.event_id)
        .single()

      if (eventData) {
        setEvent(eventData)
      }

      // Get photos (for MVP, show all event photos)
      // In production, this would be filtered by face matching
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', participantData.event_id)
        .order('created_at', { ascending: false })

      if (photosData) {
        setPhotos(photosData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo)
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
  }

  const nextPhoto = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
      setSelectedPhoto(photos[selectedIndex + 1])
    }
  }

  const prevPhoto = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
      setSelectedPhoto(photos[selectedIndex - 1])
    }
  }

  const downloadPhoto = async (url: string, fileName?: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName || `dijipot-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Fotoğraf indiriliyor...')
    } catch (error) {
      toast.error('İndirme hatası')
    }
  }

  const downloadAll = async () => {
    toast.success('Tüm fotoğraflar indiriliyor...')
    for (let i = 0; i < photos.length; i++) {
      await downloadPhoto(photos[i].original_url, `dijipot-${i + 1}.jpg`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-secondary-800">Dijipot</span>
            </div>
            {photos.length > 0 && (
              <button
                onClick={downloadAll}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Tümünü İndir
              </button>
            )}
          </div>
          {event && (
            <p className="text-sm text-secondary-500 mt-2">{event.name}</p>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="card text-center py-16">
            <Image className="h-20 w-20 mx-auto mb-4 text-secondary-300" />
            <h2 className="text-xl font-semibold text-secondary-800 mb-2">
              Henüz Fotoğrafınız Yok
            </h2>
            <p className="text-secondary-500 max-w-md mx-auto">
              Fotoğraflar yüklendikçe ve eşleştirildikçe burada görünecek. 
              Sayfayı daha sonra tekrar kontrol edin.
            </p>
          </div>
        ) : (
          <>
            <p className="text-secondary-500 mb-4">{photos.length} fotoğraf bulundu</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer"
                  onClick={() => openLightbox(photo, index)}
                >
                  <img
                    src={photo.thumbnail_url || photo.original_url}
                    alt=""
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadPhoto(photo.original_url)
                    }}
                    className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="h-4 w-4 text-secondary-700" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {selectedIndex > 0 && (
            <button
              onClick={prevPhoto}
              className="absolute left-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          <img
            src={selectedPhoto.original_url}
            alt=""
            className="max-w-full max-h-[90vh] object-contain"
          />

          <button
            onClick={() => downloadPhoto(selectedPhoto.original_url)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-secondary-800 px-6 py-3 rounded-full font-semibold flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            İndir
          </button>
        </div>
      )}
    </div>
  )
}
