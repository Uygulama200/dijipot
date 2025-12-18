import { NextRequest, NextResponse } from 'next/server'
import { compareFaces, detectFaces } from '@/lib/facepp'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MATCH_THRESHOLD = 75 // %75 ve üzeri eşleşme kabul edilir

export async function POST(request: NextRequest) {
  try {
    const { participantId, selfieUrl, eventId } = await request.json()

    if (!participantId || !selfieUrl || !eventId) {
      return NextResponse.json(
        { error: 'participantId, selfieUrl ve eventId gerekli' },
        { status: 400 }
      )
    }

    console.log('Matching faces for participant:', participantId)

    // 1. Selfie'deki yüzü tespit et
    const selfieFaces = await detectFaces(selfieUrl)

    if (selfieFaces.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Selfie\'de yüz tespit edilemedi',
        matchCount: 0,
      })
    }

    const selfieFaceToken = selfieFaces[0].face_token
    console.log('Selfie face token:', selfieFaceToken)

    // 2. Bu etkinlikteki tüm fotoğrafların face_token'larını al
    const { data: photos } = await supabase
      .from('photos')
      .select('id, original_url')
      .eq('event_id', eventId)

    if (!photos || photos.length === 0) {
      return NextResponse.json({
        success: true,
        matchCount: 0,
        message: 'Etkinlikte fotoğraf bulunamadı',
      })
    }

    // 3. Her fotoğraftaki yüzlerle karşılaştır
    const { data: faceTokens } = await supabase
      .from('face_tokens')
      .select('photo_id, face_token')
      .in('photo_id', photos.map(p => p.id))

    if (!faceTokens || faceTokens.length === 0) {
      return NextResponse.json({
        success: true,
        matchCount: 0,
        message: 'Fotoğraflarda yüz bulunamadı',
      })
    }

    console.log(`Comparing with ${faceTokens.length} faces from ${photos.length} photos`)

    // 4. Her face_token ile karşılaştır
    const matches: { photoId: string; confidence: number }[] = []
    const matchedPhotoIds = new Set<string>()

    for (const faceToken of faceTokens) {
      // Aynı fotoğraf zaten eşleştiyse atla
      if (matchedPhotoIds.has(faceToken.photo_id)) continue

      const confidence = await compareFaces(selfieFaceToken, faceToken.face_token)

      if (confidence >= MATCH_THRESHOLD) {
        matches.push({
          photoId: faceToken.photo_id,
          confidence: confidence,
        })
        matchedPhotoIds.add(faceToken.photo_id)

        // Eşleşmeyi veritabanına kaydet
        await supabase.from('participant_matches').insert({
          participant_id: participantId,
          photo_id: faceToken.photo_id,
          confidence: confidence,
        })
      }
    }

    // 5. Katılımcının photo_count'unu güncelle
    await supabase
      .from('participants')
      .update({ photo_count: matches.length })
      .eq('id', participantId)

    console.log(`Found ${matches.length} matches`)

    return NextResponse.json({
      success: true,
      matchCount: matches.length,
      matches: matches,
    })
  } catch (error) {
    console.error('Match faces error:', error)
    return NextResponse.json({ error: 'Yüz eşleştirme hatası' }, { status: 500 })
  }
}
