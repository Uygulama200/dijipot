'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Camera, Loader2, Image, MessageCircle } from 'lucide-react'
import { supabase, type Participant } from '@/lib/supabase'

export default function WaitingPage() {
  const params = useParams()
  const participantId = params.id as string

  const [participant, setParticipant] = useState<Participant | null>(null)

  useEffect(() => {
    loadParticipant()
  }, [participantId])

  const loadParticipant = async () => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single()

    if (data) {
      setParticipant(data)
    }
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
          {/* Animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-25" />
            <div className="relative w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-secondary-800 mb-4">
            Fotoğraflarınız Aranıyor...
          </h1>

          <p className="text-secondary-500 mb-8">
            Yüz tanıma teknolojimiz fotoğraflarınızı eşleştiriyor. 
            Bu işlem birkaç dakika sürebilir.
          </p>

          {participant?.phone && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">WhatsApp Bildirimi</span>
              </div>
              <p className="text-sm text-green-600">
                Fotoğraflarınız hazır olduğunda {participant.phone} numarasına bildirim göndereceğiz.
              </p>
            </div>
          )}

          <Link
            href={`/g/${participantId}`}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Image className="h-5 w-5" />
            Galerime Git
          </Link>

          <p className="text-xs text-secondary-400 mt-6">
            Galeriyi istediğiniz zaman ziyaret edebilirsiniz. 
            Yeni fotoğraflar otomatik olarak eklenecektir.
          </p>
        </div>
      </main>
    </div>
  )
}
