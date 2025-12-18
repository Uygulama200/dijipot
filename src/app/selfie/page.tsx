'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Camera, RefreshCw, Check, Phone, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SelfiePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const eventCode = searchParams.get('event')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [matchingStatus, setMatchingStatus] = useState<string>('')
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => {
    if (!eventCode) {
      router.push('/')
      return
    }
    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [eventCode])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 720 }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
      setCameraError(false)
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError(true)
      toast.error('Kamera erişimi sağlanamadı')
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Flip horizontally for selfie mirror effect
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
  }

  const retake = () => {
    setCapturedImage(null)
  }

  const confirmPhoto = () => {
    setShowPhoneModal(true)
  }

  const submitParticipant = async () => {
    if (!capturedImage || !eventCode) return

    setLoading(true)
    setMatchingStatus('Selfie yükleniyor...')

    try {
      // Get event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, participant_count')
        .eq('event_code', eventCode.toUpperCase())
        .single()

      if (eventError || !event) {
        toast.error('Etkinlik bulunamadı')
        return
      }

      // Convert base64 to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()

      // Upload selfie
      const fileName = `${event.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
      
      const { error: uploadError } = await supabase.storage
        .from('selfies')
        .upload(fileName, blob)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Fotoğraf yüklenemedi')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('selfies')
        .getPublicUrl(fileName)

      setMatchingStatus('Kayıt oluşturuluyor...')

      // Create participant
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          event_id: event.id,
          phone: phone || null,
          selfie_url: publicUrl,
        })
        .select()
        .single()

      if (participantError) {
        console.error('Participant error:', participantError)
        toast.error('Kayıt oluşturulamadı')
        return
      }

      // Update participant count
      await supabase
        .from('events')
        .update({ participant_count: (event.participant_count || 0) + 1 })
        .eq('id', event.id)

      setMatchingStatus('Yüzünüz fotoğraflarla eşleştiriliyor...')

      // Yüz eşleştirme yap
      try {
        const matchResponse = await fetch('/api/match-faces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: participant.id,
            selfieUrl: publicUrl,
            eventId: event.id,
          }),
        })

        const matchData = await matchResponse.json()

        if (matchData.success) {
          if (matchData.matchCount > 0) {
            toast.success(`${matchData.matchCount} fotoğrafınız bulundu!`)
          } else {
            toast.success('Kaydınız alındı! Fotoğraflar yüklendikçe eşleşmeler görünecek.')
          }
        }
      } catch (matchError) {
        console.error('Match error:', matchError)
        // Eşleştirme hatası olsa bile devam et
      }

      router.push(`/bekle/${participant.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
      setMatchingStatus('')
    }
  }

  if (cameraError) {
    return (
      <div className="min-h-screen bg-secondary-900 flex flex-col items-center justify-center px-4 text-white">
        <Camera className="h-16 w-16 mb-4 opacity-50" />
        <h1 className="text-xl font-semibold mb-2">Kamera Erişimi Gerekli</h1>
        <p className="text-secondary-400 text-center mb-6">
          Selfie çekebilmek için kamera izni vermeniz gerekmektedir.
        </p>
        <button onClick={startCamera} className="btn-primary">
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-900 flex flex-col">
      {/* Header */}
      <header className="p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-white">Dijipot</span>
        </div>
        <p className="text-secondary-400 text-sm mt-1">Selfie çekin</p>
      </header>

      {/* Camera / Preview */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="mt-8 flex items-center gap-6">
          {capturedImage ? (
            <>
              <button
                onClick={retake}
                className="w-14 h-14 rounded-full bg-secondary-700 flex items-center justify-center text-white"
              >
                <RefreshCw className="h-6 w-6" />
              </button>
              <button
                onClick={confirmPhoto}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white"
              >
                <Check className="h-10 w-10" />
              </button>
            </>
          ) : (
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full border-4 border-primary" />
            </button>
          )}
        </div>

        {capturedImage && (
          <p className="text-secondary-400 text-sm mt-4">
            Fotoğrafı onaylamak için ✓ butonuna basın
          </p>
        )}
      </main>

      {/* Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-secondary-700 font-medium">{matchingStatus}</p>
                <p className="text-sm text-secondary-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-secondary-800">
                    Telefon Numaranız
                  </h2>
                  <button onClick={() => setShowPhoneModal(false)} className="text-secondary-400">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <p className="text-secondary-500 mb-4">
                  Fotoğraflarınız hazır olduğunda WhatsApp ile bildirim alın.
                </p>

                <div className="relative mb-6">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="tel"
                    className="input-field pl-10"
                    placeholder="05XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <button
                  onClick={submitParticipant}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Kaydet ve Fotoğraflarımı Bul
                </button>

                <button
                  onClick={() => {
                    setPhone('')
                    submitParticipant()
                  }}
                  disabled={loading}
                  className="w-full mt-3 text-secondary-500 text-sm hover:text-secondary-700"
                >
                  Telefon numarası olmadan devam et
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
