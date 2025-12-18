'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Camera, ArrowLeft, QrCode, Share2, Upload, Image, Users, Download, Copy, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase, type Event, type Photo, type Participant } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import QRCode from 'qrcode'

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; detecting: number }>({ current: 0, total: 0, detecting: 0 })

  useEffect(() => {
    loadEventData()
  }, [eventId])

  const loadEventData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/giris')
        return
      }

      // Get event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError || !eventData) {
        toast.error('Etkinlik bulunamadı')
        router.push('/panel')
        return
      }

      setEvent(eventData)

      // Generate QR Code
      const eventUrl = `${window.location.origin}/e/${eventData.event_code}`
      const qrDataUrl = await QRCode.toDataURL(eventUrl, { width: 300, margin: 2 })
      setQrCodeUrl(qrDataUrl)

      // Get photos
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (photosData) {
        setPhotos(photosData)
      }

      // Get participants
      const { data: participantsData } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (participantsData) {
        setParticipants(participantsData)
      }
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  // Yüz tespiti yap
  const detectFacesInPhoto = async (photoId: string, imageUrl: string) => {
    try {
      const response = await fetch('/api/detect-faces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, imageUrl }),
      })
      const data = await response.json()
      return data.faceCount || 0
    } catch (error) {
      console.error('Face detection error:', error)
      return 0
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!event) return
    
    setUploading(true)
    setUploadProgress({ current: 0, total: acceptedFiles.length, detecting: 0 })
    
    let uploadedCount = 0
    let totalFaces = 0
    const uploadedPhotos: { id: string; url: string }[] = []

    try {
      // 1. Önce tüm fotoğrafları yükle
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        setUploadProgress(prev => ({ ...prev, current: i + 1 }))

        const fileExt = file.name.split('.').pop()
        const fileName = `${eventId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)

        const { data: photoData, error: insertError } = await supabase
          .from('photos')
          .insert({
            event_id: eventId,
            original_url: publicUrl,
            thumbnail_url: publicUrl,
          })
          .select()
          .single()

        if (!insertError && photoData) {
          uploadedPhotos.push({ id: photoData.id, url: publicUrl })
          uploadedCount++
        }
      }

      // 2. Yüz tespiti yap
      setUploading(false)
      setProcessing(true)
      
      for (let i = 0; i < uploadedPhotos.length; i++) {
        setUploadProgress(prev => ({ ...prev, detecting: i + 1 }))
        const photo = uploadedPhotos[i]
        const faceCount = await detectFacesInPhoto(photo.id, photo.url)
        totalFaces += faceCount
      }

      // 3. Event photo count güncelle
      await supabase
        .from('events')
        .update({ photo_count: (event.photo_count || 0) + uploadedCount })
        .eq('id', eventId)

      toast.success(`${uploadedCount} fotoğraf yüklendi, ${totalFaces} yüz tespit edildi`)
      loadEventData()
    } catch (error) {
      toast.error('Yükleme hatası')
    } finally {
      setUploading(false)
      setProcessing(false)
      setUploadProgress({ current: 0, total: 0, detecting: 0 })
    }
  }, [event, eventId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: uploading || processing
  })

  const copyLink = () => {
    const url = `${window.location.origin}/e/${event?.event_code}`
    navigator.clipboard.writeText(url)
    toast.success('Link kopyalandı!')
  }

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/e/${event?.event_code}`
    const text = `🎉 ${event?.name} etkinliğinin fotoğraflarına erişmek için linke tıklayın: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.download = `dijipot-${event?.event_code}-qr.png`
    link.href = qrCodeUrl
    link.click()
  }

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return

    try {
      // Önce face_tokens sil
      await supabase.from('face_tokens').delete().eq('photo_id', photoId)
      
      // Sonra fotoğrafı sil
      await supabase.from('photos').delete().eq('id', photoId)
      
      await supabase
        .from('events')
        .update({ photo_count: Math.max(0, (event?.photo_count || 1) - 1) })
        .eq('id', eventId)

      toast.success('Fotoğraf silindi')
      loadEventData()
    } catch (error) {
      toast.error('Silme hatası')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/panel/etkinlikler" className="text-secondary-500 hover:text-secondary-700">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-secondary-800">{event.name}</h1>
              <p className="text-sm text-secondary-500">
                Kod: <span className="font-mono font-semibold text-primary">{event.event_code}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - QR & Share */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="card text-center">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Kod
              </h2>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4 rounded-lg" />
              )}
              <button onClick={downloadQR} className="btn-primary w-full flex items-center justify-center gap-2">
                <Download className="h-5 w-5" />
                QR Kodu İndir
              </button>
            </div>

            {/* Share */}
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Paylaş
              </h2>
              <div className="space-y-3">
                <button onClick={shareWhatsApp} className="w-full bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  WhatsApp ile Paylaş
                </button>
                <button onClick={copyLink} className="w-full btn-outline flex items-center justify-center gap-2">
                  <Copy className="h-5 w-5" />
                  Linki Kopyala
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="card">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-secondary-500 text-sm mb-1">
                    <Image className="h-4 w-4" />
                    Fotoğraf
                  </div>
                  <p className="text-2xl font-bold text-secondary-800">{event.photo_count}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-secondary-500 text-sm mb-1">
                    <Users className="h-4 w-4" />
                    Katılımcı
                  </div>
                  <p className="text-2xl font-bold text-secondary-800">{event.participant_count}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Photos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload */}
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Fotoğraf Yükle
              </h2>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary-50' : 'border-gray-300 hover:border-primary'
                } ${(uploading || processing) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-secondary-600 font-medium">
                      Yükleniyor... ({uploadProgress.current}/{uploadProgress.total})
                    </p>
                  </div>
                ) : processing ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
                      <CheckCircle className="h-6 w-6 text-green-500 absolute -right-1 -bottom-1" />
                    </div>
                    <p className="text-secondary-600 font-medium">
                      Yüzler tespit ediliyor... ({uploadProgress.detecting}/{uploadProgress.total})
                    </p>
                    <p className="text-sm text-secondary-400 mt-1">
                      Bu işlem biraz sürebilir
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-secondary-400 mb-4" />
                    <p className="text-secondary-600 mb-2">
                      Fotoğrafları sürükleyip bırakın veya tıklayın
                    </p>
                    <p className="text-sm text-secondary-400">
                      JPG, PNG, WebP (Çoklu seçim desteklenir)
                    </p>
                  </div>
                )}
              </div>
              
              {/* Bilgi notu */}
              <div className="mt-4 bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Yüklenen fotoğraflarda yüz tanıma yapılır. Misafirler selfie çektiğinde, 
                  sadece kendilerinin olduğu fotoğrafları görebilirler.
                </p>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Fotoğraflar ({photos.length})
              </h2>
              {photos.length === 0 ? (
                <div className="text-center py-12 text-secondary-500">
                  <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Henüz fotoğraf yüklenmemiş</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.thumbnail_url || photo.original_url}
                        alt=""
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="card">
              <h2 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Katılımcılar ({participants.length})
              </h2>
              {participants.length === 0 ? (
                <div className="text-center py-8 text-secondary-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz katılımcı yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {p.selfie_url ? (
                        <img src={p.selfie_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary-200 flex items-center justify-center">
                          <Users className="h-5 w-5 text-secondary-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-secondary-800">{p.phone || 'Telefon yok'}</p>
                        <p className="text-sm text-secondary-500">{p.photo_count} fotoğraf eşleşti</p>
                      </div>
                      {p.photo_count > 0 && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
