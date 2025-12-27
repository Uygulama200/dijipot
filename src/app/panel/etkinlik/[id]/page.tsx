'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Camera, ArrowLeft, QrCode, Share2, Upload, Image, Users, Download, Copy, Loader2, X, CheckCircle, AlertCircle, Settings } from 'lucide-react'
import { supabase, type Event, type Photo } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import QRCode from 'qrcode'
import DarkModeToggle from '@/components/DarkModeToggle'

// Participant type with dynamic match count
type ParticipantWithMatches = {
  id: string
  event_id: string
  phone: string | null
  selfie_url: string | null
  photo_count: number
  created_at: string
  match_count: number
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [participants, setParticipants] = useState<ParticipantWithMatches[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; detecting: number }>({ current: 0, total: 0, detecting: 0 })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', event_date: '', status: 'active' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [deletingParticipant, setDeletingParticipant] = useState<string | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantWithMatches | null>(null)
  const [participantPhotos, setParticipantPhotos] = useState<Array<{ photo: Photo; confidence: number }>>([])
  const [loadingParticipant, setLoadingParticipant] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'analysis'>('general')
  const [analysisData, setAnalysisData] = useState<{
    totalFaces: number
    avgFacesPerPhoto: number
    participantsWithMatches: number
    participantsWithoutMatches: number
    highConfidenceMatches: number
    mediumConfidenceMatches: number
    lowConfidenceMatches: number
    avgConfidence: number
    photosWithoutFaces: number
    topParticipants: Array<{ phone: string | null; matchCount: number }>
  } | null>(null)

  useEffect(() => {
    loadEventData()
  }, [eventId])

  useEffect(() => {
    if (activeTab === 'analysis' && !analysisData) {
      loadAnalysisData()
    }
  }, [activeTab])

  const loadEventData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/giris')
        return
      }

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

      setEditForm({
        name: eventData.name,
        event_date: eventData.event_date || '',
        status: eventData.status || 'active'
      })

      const eventUrl = `${window.location.origin}/e/${eventData.event_code}`
      const qrDataUrl = await QRCode.toDataURL(eventUrl, { width: 300, margin: 2 })
      setQrCodeUrl(qrDataUrl)

      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (photosData) {
        setPhotos(photosData)
      }

      const { data: participantsData } = await supabase
        .from('participants')
        .select(`
          id,
          event_id,
          phone,
          selfie_url,
          photo_count,
          created_at
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (participantsData) {
        const participantsWithMatches = await Promise.all(
          participantsData.map(async (p) => {
            const { count } = await supabase
              .from('participant_matches')
              .select('*', { count: 'exact', head: true })
              .eq('participant_id', p.id)

            return {
              ...p,
              match_count: count || 0
            }
          })
        )

        setParticipants(participantsWithMatches)
      }
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

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

      setUploading(false)
      setProcessing(true)
      
      for (let i = 0; i < uploadedPhotos.length; i++) {
        setUploadProgress(prev => ({ ...prev, detecting: i + 1 }))
        const photo = uploadedPhotos[i]
        const faceCount = await detectFacesInPhoto(photo.id, photo.url)
        totalFaces += faceCount
      }

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
      await supabase.from('face_tokens').delete().eq('photo_id', photoId)
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

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    )
  }

  const selectAllPhotos = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([])
    } else {
      setSelectedPhotos(photos.map(p => p.id))
    }
  }

  const openBulkDeleteModal = () => {
    if (selectedPhotos.length === 0) {
      toast.error('Lütfen silinecek fotoğrafları seçin')
      return
    }
    setShowBulkDeleteModal(true)
  }

  const closeBulkDeleteModal = () => {
    setShowBulkDeleteModal(false)
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    
    try {
      const response = await fetch('/api/delete-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photoIds: selectedPhotos,
          eventId: event?.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Silme hatası')
      }

      toast.success(`${selectedPhotos.length} fotoğraf silindi`)
      setSelectedPhotos([])
      setShowBulkDeleteModal(false)
      loadEventData()
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Silme hatası')
    } finally {
      setBulkDeleting(false)
    }
  }

  const deleteParticipant = async (participantId: string) => {
    if (!confirm('Bu katılımcıyı silmek istediğinize emin misiniz? Tüm eşleşme kayıtları da silinecek.')) {
      return
    }

    setDeletingParticipant(participantId)

    try {
      const response = await fetch('/api/delete-participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          participantId,
          eventId: event?.id 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Silme hatası')
      }

      toast.success('Katılımcı silindi')
      loadEventData()
    } catch (error) {
      console.error('Delete participant error:', error)
      toast.error(error instanceof Error ? error.message : 'Silme hatası')
    } finally {
      setDeletingParticipant(null)
    }
  }

  const openParticipantDetail = async (participant: ParticipantWithMatches) => {
    setSelectedParticipant(participant)
    setLoadingParticipant(true)
    
    try {
      const { data: matchesData } = await supabase
        .from('participant_matches')
        .select('photo_id, confidence')
        .eq('participant_id', participant.id)
        .order('confidence', { ascending: false })

      if (matchesData && matchesData.length > 0) {
        const photoIds = matchesData.map(m => m.photo_id)
        const { data: photosData } = await supabase
          .from('photos')
          .select('*')
          .in('id', photoIds)

        if (photosData) {
          const photosWithConfidence = matchesData.map(match => {
            const photo = photosData.find(p => p.id === match.photo_id)
            return {
              photo: photo!,
              confidence: match.confidence
            }
          }).filter(item => item.photo)

          setParticipantPhotos(photosWithConfidence)
        }
      }
    } catch (error) {
      console.error('Error loading participant details:', error)
      toast.error('Detaylar yüklenemedi')
    } finally {
      setLoadingParticipant(false)
    }
  }

  const closeParticipantDetail = () => {
    setSelectedParticipant(null)
    setParticipantPhotos([])
  }

  const loadAnalysisData = async () => {
    if (!eventId) return
    
    try {
      const { data: eventPhotos } = await supabase
        .from('photos')
        .select('id')
        .eq('event_id', eventId)

      const photoIds = eventPhotos?.map(p => p.id) || []

      if (photoIds.length === 0) {
        setAnalysisData({
          totalFaces: 0,
          avgFacesPerPhoto: 0,
          participantsWithMatches: 0,
          participantsWithoutMatches: 0,
          highConfidenceMatches: 0,
          mediumConfidenceMatches: 0,
          lowConfidenceMatches: 0,
          avgConfidence: 0,
          photosWithoutFaces: 0,
          topParticipants: []
        })
        return
      }

      const { count: totalFaces } = await supabase
        .from('face_tokens')
        .select('*', { count: 'exact', head: true })
        .in('photo_id', photoIds)

      const { data: photosWithFaces } = await supabase
        .from('face_tokens')
        .select('photo_id')
        .in('photo_id', photoIds)

      const photosWithFacesIds = new Set(photosWithFaces?.map(f => f.photo_id) || [])
      const photosWithoutFaces = photoIds.filter(id => !photosWithFacesIds.has(id)).length

      const { data: eventParticipants } = await supabase
        .from('participants')
        .select('id')
        .eq('event_id', eventId)

      const participantIds = eventParticipants?.map(p => p.id) || []

      const { data: participantMatchCounts } = await supabase
        .from('participant_matches')
        .select('participant_id')
        .in('participant_id', participantIds)

      const participantsWithMatchesSet = new Set(participantMatchCounts?.map(m => m.participant_id) || [])
      const participantsWithMatches = participantsWithMatchesSet.size
      const participantsWithoutMatches = participantIds.length - participantsWithMatches

      const { data: allMatches } = await supabase
        .from('participant_matches')
        .select('confidence, participant_id')
        .in('participant_id', participantIds)

      let highConfidence = 0
      let mediumConfidence = 0
      let lowConfidence = 0
      let totalConfidence = 0

      if (allMatches) {
        allMatches.forEach(m => {
          if (m.confidence >= 70) highConfidence++
          else if (m.confidence >= 60) mediumConfidence++
          else lowConfidence++
          totalConfidence += m.confidence
        })
      }

      const avgConfidence = allMatches && allMatches.length > 0 
        ? totalConfidence / allMatches.length 
        : 0

      const participantMatchMap = new Map<string, number>()
      if (allMatches) {
        allMatches.forEach(m => {
          participantMatchMap.set(
            m.participant_id, 
            (participantMatchMap.get(m.participant_id) || 0) + 1
          )
        })
      }

      const topParticipantIds = Array.from(participantMatchMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id)

      const { data: topParticipantsData } = await supabase
        .from('participants')
        .select('id, phone')
        .in('id', topParticipantIds)

      const topParticipants = topParticipantIds
        .map(id => {
          const participant = topParticipantsData?.find(p => p.id === id)
          return {
            phone: participant?.phone || null,
            matchCount: participantMatchMap.get(id) || 0
          }
        })

      setAnalysisData({
        totalFaces: totalFaces || 0,
        avgFacesPerPhoto: photoIds.length > 0 ? (totalFaces || 0) / photoIds.length : 0,
        participantsWithMatches,
        participantsWithoutMatches,
        highConfidenceMatches: highConfidence,
        mediumConfidenceMatches: mediumConfidence,
        lowConfidenceMatches: lowConfidence,
        avgConfidence,
        photosWithoutFaces,
        topParticipants
      })
    } catch (error) {
      console.error('Error loading analysis data:', error)
    }
  }

  const openEditModal = () => {
    if (event) {
      setEditForm({
        name: event.name,
        event_date: event.event_date || '',
        status: event.status || 'active'
      })
      setShowEditModal(true)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editForm.name.trim()) {
      toast.error('Etkinlik adı boş olamaz')
      return
    }

    try {
      const { error } = await supabase
        .from('events')
        .update({
          name: editForm.name,
          event_date: editForm.event_date || null,
          status: editForm.status,
        })
        .eq('id', eventId)

      if (error) throw error

      toast.success('Etkinlik güncellendi')
      setShowEditModal(false)
      loadEventData()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Güncelleme hatası')
    }
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
  }

  const handleDeleteEvent = async () => {
    if (!event) return
    
    setDeleting(true)
    
    try {
      const response = await fetch('/api/delete-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Silme hatası')
      }

      toast.success('Etkinlik silindi')
      router.push('/panel/etkinlikler')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Silme hatası')
    } finally {
      setDeleting(false)
    }
  }
  const refreshTokens = async () => {
    if (!confirm('Tüm yüz tokenları yenilenecek. Devam?')) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/refresh-face-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event?.id })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`${data.totalFaces} yüz yenilendi!`)
        loadEventData()
      } else {
        toast.error('Hata oluştu')
      }
    } catch (error) {
      toast.error('Yenileme başarısız')
    } finally {
      setProcessing(false)
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/panel/etkinlikler" className="text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-white">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-secondary-800 dark:text-white">{event.name}</h1>
                <p className="text-sm text-secondary-500 dark:text-gray-400">
                  Kod: <span className="font-mono font-semibold text-primary">{event.event_code}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <button
                onClick={refreshTokens}
                disabled={processing}
                className="btn-outline flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Yenileniyor...
                  </>
                ) : (
                  <>
                    🔄 Yüz Tokenlarını Yenile
                  </>
                )}
              </button>
              <button
                onClick={openEditModal}
                className="btn-outline flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Düzenle
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'general'
                ? 'text-primary border-primary'
                : 'text-secondary-500 dark:text-gray-400 border-transparent hover:text-secondary-700 dark:hover:text-white'
            }`}
          >
            Genel
          </button>
          <button
            onClick={() => {
              setActiveTab('analysis')
              if (!analysisData) {
                loadAnalysisData()
              }
            }}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'analysis'
                ? 'text-primary border-primary'
                : 'text-secondary-500 dark:text-gray-400 border-transparent hover:text-secondary-700 dark:hover:text-white'
            }`}
          >
            📊 Analiz & Raporlar
          </button>
        </div>

        {activeTab === 'general' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="card dark:bg-gray-800 dark:border-gray-700 text-center">
                <h2 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4 flex items-center justify-center gap-2">
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

              <div className="card dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4 flex items-center gap-2">
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

              <div className="card dark:bg-gray-800 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-secondary-500 dark:text-gray-400 text-sm mb-1">
                      <Image className="h-4 w-4" />
                      Fotoğraf
                    </div>
                    <p className="text-2xl font-bold text-secondary-800 dark:text-white">{event.photo_count}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-secondary-500 dark:text-gray-400 text-sm mb-1">
                      <Users className="h-4 w-4" />
                      Katılımcı
                    </div>
                    <p className="text-2xl font-bold text-secondary-800 dark:text-white">{event.participant_count}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="card dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Fotoğraf Yükle
                </h2>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary-50 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                  } ${(uploading || processing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getInputProps()} />
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <p className="text-secondary-600 dark:text-gray-400 font-medium">
                        Yükleniyor... ({uploadProgress.current}/{uploadProgress.total})
                      </p>
                    </div>
                  ) : processing ? (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
                        <CheckCircle className="h-6 w-6 text-green-500 absolute -right-1 -bottom-1" />
                      </div>
                      <p className="text-secondary-600 dark:text-gray-400 font-medium">
                        Yüzler tespit ediliyor... ({uploadProgress.detecting}/{uploadProgress.total})
                      </p>
                      <p className="text-sm text-secondary-400 dark:text-gray-500 mt-1">
                        Bu işlem biraz sürebilir
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-secondary-400 dark:text-gray-500 mb-4" />
                      <p className="text-secondary-600 dark:text-gray-400 mb-2">
                        Fotoğrafları sürükleyip bırakın veya tıklayın
                      </p>
                      <p className="text-sm text-secondary-400 dark:text-gray-500">
                        JPG, PNG, WebP (Çoklu seçim desteklenir)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Yüklenen fotoğraflarda yüz tanıma yapılır. Misafirler selfie çektiğinde, 
                    sadece kendilerinin olduğu fotoğrafları görebilirler.
                  </p>
                </div>
              </div>

              <div className="card dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-secondary-800 dark:text-white flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Fotoğraflar ({photos.length})
                  </h2>
                  {photos.length > 0 && (
                    <div className="flex items-center gap-2">
                      {selectedPhotos.length > 0 && (
                        <>
                          <span className="text-sm text-secondary-500 dark:text-gray-400">
                            {selectedPhotos.length} seçildi
                          </span>
                          <button
                            onClick={openBulkDeleteModal}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Seçilenleri Sil
                          </button>
                        </>
                      )}
                      <button
                        onClick={selectAllPhotos}
                        className="btn-outline text-sm"
                      >
                        {selectedPhotos.length === photos.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                      </button>
                    </div>
                  )}
                </div>
                {photos.length === 0 ? (
                  <div className="text-center py-12 text-secondary-500 dark:text-gray-400">
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
                          className={`w-full aspect-square object-cover rounded-lg transition-all ${
                            selectedPhotos.includes(photo.id) ? 'ring-4 ring-primary' : ''
                          }`}
                        />
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedPhotos.includes(photo.id)}
                            onChange={() => togglePhotoSelection(photo.id)}
                            className="w-5 h-5 rounded border-2 border-white cursor-pointer"
                          />
                        </div>
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

              <div className="card dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Katılımcılar ({participants.length})
                </h2>
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-secondary-500 dark:text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz katılımcı yok</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {participants.map((p) => (
                      <div 
                        key={p.id} 
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                        onClick={() => openParticipantDetail(p)}
                      >
                        {p.selfie_url ? (
                          <img src={p.selfie_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-gray-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-secondary-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-secondary-800 dark:text-white">{p.phone || 'Telefon yok'}</p>
                          <p className="text-sm text-secondary-500 dark:text-gray-400">{p.match_count} fotoğraf eşleşti</p>
                        </div>
                        {p.match_count > 0 && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteParticipant(p.id)
                          }}
                          disabled={deletingParticipant === p.id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                          title="Katılımcıyı Sil"
                        >
                          {deletingParticipant === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card dark:bg-gray-800 dark:border-gray-700 text-center">
                <p className="text-secondary-500 dark:text-gray-400 text-sm mb-2">Toplam Fotoğraf</p>
                <p className="text-4xl font-bold text-primary">{photos.length}</p>
              </div>
              <div className="card dark:bg-gray-800 dark:border-gray-700 text-center">
                <p className="text-secondary-500 dark:text-gray-400 text-sm mb-2">Tespit Edilen Yüz</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-500">{analysisData?.totalFaces || 0}</p>
                <p className="text-xs text-secondary-400 dark:text-gray-500 mt-1">
                  Ort: {analysisData?.avgFacesPerPhoto.toFixed(1)} yüz/fotoğraf
                </p>
              </div>
              <div className="card dark:bg-gray-800 dark:border-gray-700 text-center">
                <p className="text-secondary-500 dark:text-gray-400 text-sm mb-2">Toplam Katılımcı</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-500">{participants.length}</p>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4 flex items-center gap-2">
                🎯 Eşleşme Durumu
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Başarılı</span>
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {analysisData?.participantsWithMatches || 0}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    {participants.length > 0 
                      ? `%${((analysisData?.participantsWithMatches || 0) / participants.length * 100).toFixed(0)}`
                      : '%0'
                    }
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Eşleşme Yok</span>
                    <X className="h-5 w-5 text-red-600 dark:text-red-500" />
                  </div>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                    {analysisData?.participantsWithoutMatches || 0}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    {participants.length > 0 
                      ? `%${((analysisData?.participantsWithoutMatches || 0) / participants.length * 100).toFixed(0)}`
                      : '%0'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4 flex items-center gap-2">
                📊 Eşleşme Kalitesi
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium text-green-700 dark:text-green-400">Yüksek Güven (%70+)</span>
                  </div>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {analysisData?.highConfidenceMatches || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">Orta Güven (%60-70)</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {analysisData?.mediumConfidenceMatches || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-orange-700 dark:text-orange-400">Düşük Güven (%45-60)</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {analysisData?.lowConfidenceMatches || 0}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-secondary-700 dark:text-gray-300">Ortalama Güven Skoru</span>
                    <span className="text-3xl font-bold text-primary">
                      {analysisData?.avgConfidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {((analysisData?.participantsWithoutMatches || 0) > 0 || 
              (analysisData?.lowConfidenceMatches || 0) > 0 || 
              (analysisData?.photosWithoutFaces || 0) > 0) && (
              <div className="card dark:bg-gray-800 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  Dikkat Gereken Durumlar
                </h3>
                <div className="space-y-3">
                  {(analysisData?.participantsWithoutMatches || 0) > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-secondary-800 dark:text-white">
                          {analysisData?.participantsWithoutMatches} katılımcı eşleşme bulamadı
                        </p>
                        <p className="text-sm text-secondary-500 dark:text-gray-400">
                          Selfie kalitesi düşük veya fotoğraflarda olmayabilirler
                        </p>
                      </div>
                    </div>
                  )}
                  {(analysisData?.lowConfidenceMatches || 0) > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-secondary-800 dark:text-white">
                          {analysisData?.lowConfidenceMatches} şüpheli eşleşme
                        </p>
                        <p className="text-sm text-secondary-500 dark:text-gray-400">
                          Güven skoru %60'ın altında, manuel kontrol edilmeli
                        </p>
                      </div>
                    </div>
                  )}
                  {(analysisData?.photosWithoutFaces || 0) > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-secondary-800 dark:text-white">
                          {analysisData?.photosWithoutFaces} fotoğrafta yüz tespit edilemedi
                        </p>
                        <p className="text-sm text-secondary-500 dark:text-gray-400">
                          Fotoğraf bulanık, profil veya çok uzak çekilmiş olabilir
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {analysisData?.topParticipants && analysisData.topParticipants.length > 0 && (
              <div className="card dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4 flex items-center gap-2">
                  🏆 En Çok Fotoğrafı Olan Katılımcılar
                </h3>
                <div className="space-y-3">
                  {analysisData.topParticipants.map((p, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700 dark:bg-gray-500 dark:text-gray-200' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-secondary-800 dark:text-white">
                          {p.phone || 'Telefon yok'}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {p.matchCount} fotoğraf
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-800 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Etkinliği Düzenle
              </h2>
              <button onClick={closeEditModal} className="text-secondary-400 dark:text-gray-500 hover:text-secondary-600 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                  Etkinlik Adı *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                  Etkinlik Tarihi
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={editForm.event_date}
                  onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                  Durum
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={editForm.status === 'active'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="text-primary"
                    />
                    <span className="text-secondary-700 dark:text-gray-300">Aktif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="completed"
                      checked={editForm.status === 'completed'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="text-primary"
                    />
                    <span className="text-secondary-700 dark:text-gray-300">Tamamlandı</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn-outline flex-1"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Kaydet
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="h-5 w-5" />
                  Etkinliği Sil
                </button>
                <p className="text-xs text-secondary-400 dark:text-gray-500 mt-2 text-center">
                  Bu işlem geri alınamaz. Tüm fotoğraflar ve veriler silinecek.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-800 dark:text-white mb-2">
                Etkinliği Silmek İstediğinize Emin Misiniz?
              </h2>
              <p className="text-secondary-500 dark:text-gray-400 mb-6">
                <strong>{event?.name}</strong> etkinliği ve tüm verileri kalıcı olarak silinecek:
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 text-left border border-red-200 dark:border-red-800">
                <ul className="space-y-2 text-sm text-red-700 dark:text-red-400">
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>{event?.photo_count || 0} fotoğraf</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>{event?.participant_count || 0} katılımcı</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>Tüm yüz tanıma verileri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>Tüm eşleşme kayıtları</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-red-600 dark:text-red-500 font-semibold mb-6">
                ⚠️ Bu işlem geri alınamaz!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="btn-outline flex-1"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex-1 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      Evet, Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-secondary-800 dark:text-white mb-2">
                {selectedPhotos.length} Fotoğrafı Sil?
              </h2>
              <p className="text-secondary-500 dark:text-gray-400 mb-4">
                Seçilen fotoğraflar ve ilişkili tüm veriler kalıcı olarak silinecek.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 text-left border border-red-200 dark:border-red-800">
                <ul className="space-y-2 text-sm text-red-700 dark:text-red-400">
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>{selectedPhotos.length} fotoğraf</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>Tüm yüz tanıma verileri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span>İlgili eşleşme kayıtları</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-red-600 dark:text-red-500 font-semibold mb-6">
                ⚠️ Bu işlem geri alınamaz!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeBulkDeleteModal}
                  disabled={bulkDeleting}
                  className="btn-outline flex-1"
                >
                  İptal
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex-1 flex items-center justify-center gap-2"
                >
                  {bulkDeleting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      Evet, Sil
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedParticipant && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-secondary-800 dark:text-white flex items-center gap-2">
                <Users className="h-6 w-6" />
                Katılımcı Detayları
              </h2>
              <button onClick={closeParticipantDetail} className="text-secondary-400 dark:text-gray-500 hover:text-secondary-600 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  {selectedParticipant.selfie_url ? (
                    <img 
                      src={selectedParticipant.selfie_url} 
                      alt="Selfie" 
                      className="w-32 h-32 rounded-lg object-cover border-4 border-primary"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-secondary-200 dark:bg-gray-600 flex items-center justify-center">
                      <Users className="h-16 w-16 text-secondary-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-gray-400">Telefon</p>
                      <p className="font-semibold text-secondary-800 dark:text-white">{selectedParticipant.phone || 'Telefon yok'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-gray-400">Katılım Tarihi</p>
                      <p className="font-semibold text-secondary-800 dark:text-white">
                        {new Date(selectedParticipant.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-gray-400">Eşleşme Sayısı</p>
                      <p className="text-2xl font-bold text-primary">{selectedParticipant.match_count}</p>
                    </div>
                    {participantPhotos.length > 0 && (
                      <>
                        <div>
                          <p className="text-sm text-secondary-500 dark:text-gray-400">Ortalama Güven</p>
                          <p className="text-2xl font-bold text-secondary-800 dark:text-white">
                            {(participantPhotos.reduce((sum, p) => sum + p.confidence, 0) / participantPhotos.length).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500 dark:text-gray-400">En Yüksek Güven</p>
                          <p className="font-semibold text-green-600 dark:text-green-500">
                            {Math.max(...participantPhotos.map(p => p.confidence)).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500 dark:text-gray-400">En Düşük Güven</p>
                          <p className="font-semibold text-orange-600 dark:text-orange-500">
                            {Math.min(...participantPhotos.map(p => p.confidence)).toFixed(1)}%
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-800 dark:text-white mb-4">
                  Eşleşen Fotoğraflar ({participantPhotos.length})
                </h3>

                {loadingParticipant ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : participantPhotos.length === 0 ? (
                  <div className="text-center py-12 text-secondary-500 dark:text-gray-400">
                    <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Eşleşen fotoğraf bulunamadı</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {participantPhotos.map((item) => (
                      <div key={item.photo.id} className="relative group">
                        <img
                          src={item.photo.thumbnail_url || item.photo.original_url}
                          alt=""
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                          item.confidence >= 80 ? 'bg-green-500 text-white' :
                          item.confidence >= 70 ? 'bg-green-400 text-white' :
                          item.confidence >= 60 ? 'bg-yellow-500 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {item.confidence.toFixed(1)}%
                        </div>
                        <div className="absolute top-2 left-2">
                          {item.confidence >= 70 ? (
                            <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {participantPhotos.filter(p => p.confidence < 60).length > 0 && (
                  <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                        {participantPhotos.filter(p => p.confidence < 60).length} şüpheli eşleşme
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                        %60'ın altındaki güven skorları hatalı eşleşme olabilir. Manuel kontrol edilmesi önerilir.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button onClick={closeParticipantDetail} className="btn-primary">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
