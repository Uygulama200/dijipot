import { NextRequest, NextResponse } from 'next/server'
import { compareFaces, detectFaces } from '@/lib/facepp'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MATCH_THRESHOLD = 75

export async function POST(request: NextRequest) {
  try {
    const { participantId, selfieUrl, eventId } = await request.json()

    console.log('Match request:', { participantId, selfieUrl, eventId })

    if (!participantId || !selfieUrl || !eventId) {
      return NextResponse.json(
        { error: 'participantId, selfieUrl ve eventId gerekli' },
        { status: 400 }
      )
    }

    // 1. Selfie'deki yüzü tespit et
    console.log('Detecting face in selfie...')
    const selfieFaces = await detectFaces(selfieUrl)

    if (selfieFaces.length === 0) {
      console.log('No face found in selfie')
      return NextResponse.json({
        success: false,
        error: 'Selfie\'de yüz tespit edilemedi',
        matchCount: 0,
      })
    }

    const selfieFaceToken = selfieFaces[0].face_token
    console.log('Selfie face token:', selfieFaceToken)

    // 2. Bu etkinlikteki tüm fotoğrafları al
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id')
      .eq('event_id', eventId)

    console.log('Photos found:', photos?.length || 0)

    if (photosError || !photos || photos.length === 0) {
      return NextResponse.json({
        success: true,
        matchCount: 0,
        message: 'Etkinlikte fotoğraf bulunamadı',
      })
    }

    // 3. Bu fotoğraflardaki face_token'ları al
    const photoIds = photos.map(p => p.id)
    
    const { data: faceTokens, error: faceError } = await supabase
      .from('face_tokens')
      .select('photo_id, face_token')
      .in('photo_id', photoIds)

    console.log('Face tokens found:', faceTokens?.length || 0)

    if (faceError || !faceTokens || faceTokens.length === 0) {
      return NextResponse.json({
        success: true,
        matchCount: 0,
        message: 'Fotoğraflarda yüz bulunamadı',
      })
    }

    // 4. Her face_token ile karşılaştır
    const matches: { photoId: string; confidence: number }[] = []
    const matchedPhotoIds = new Set<string>()

    for (const faceToken of faceTokens) {
      if (matchedPhotoIds.has(faceToken.photo_id)) continue

      console.log('Comparing with photo:', faceToken.photo_id)
      const confidence = await compareFaces(selfieFaceToken, faceToken.face_token)
      console.log('Confidence:', confidence)

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

    console.log('Total matches:', matches.length)

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
```

---

## Nasıl Güncellersin:
```
1. GitHub → dijipot repo
2. src/app/api/match-faces/route.ts dosyasına git
3. Sağ üstte kalem ✏️ ikonuna tıkla
4. TÜM içeriği sil
5. Yukarıdaki kodu yapıştır
6. "Commit changes" tıkla
7. 1-2 dk bekle (Vercel deploy)
8. Tekrar test et
```

---

## Ayrıca Kontrol:

Vercel → Logs sekmesine git. Selfie çektiğinde loglar ne diyor?
```
- "Detecting face in selfie..." görüyor musun?
- "Photos found: X" kaç diyor?
- "Face tokens found: X" kaç diyor?
