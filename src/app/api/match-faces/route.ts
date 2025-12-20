import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FACEPP_API_KEY = process.env.FACEPP_API_KEY
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET
const MATCH_THRESHOLD = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function detectFace(imageUrl: string): Promise<string | null> {
  const formData = new FormData()
  formData.append('api_key', FACEPP_API_KEY!)
  formData.append('api_secret', FACEPP_API_SECRET!)
  formData.append('image_url', imageUrl)

  const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return data.faces?.[0]?.face_token || null
}

async function compareFaces(token1: string, token2: string): Promise<number> {
  const formData = new FormData()
  formData.append('api_key', FACEPP_API_KEY!)
  formData.append('api_secret', FACEPP_API_SECRET!)
  formData.append('face_token1', token1)
  formData.append('face_token2', token2)

  const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  return data.confidence || 0
}

export async function POST(request: NextRequest) {
  try {
    const { participantId, selfieUrl, eventId } = await request.json()

    console.log('🔍 Match Faces Request:', { participantId, eventId, selfieUrl })

    if (!participantId || !selfieUrl || !eventId) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
    }

    // 1. Selfie'den yüz tespiti
    console.log('📸 Detecting face in selfie...')
    const selfieToken = await detectFace(selfieUrl)
    
    if (!selfieToken) {
      console.log('❌ No face detected in selfie')
      return NextResponse.json({ 
        success: false, 
        matchCount: 0, 
        error: 'Yuz bulunamadi' 
      })
    }
    
    console.log('✅ Selfie face token:', selfieToken)

    // 2. Event'e ait fotoğrafları getir (ÖNCE)
    console.log('📂 Fetching photos for event:', eventId)
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id')
      .eq('event_id', eventId)

    if (photosError) {
      console.error('❌ Photos query error:', photosError)
      return NextResponse.json({ 
        error: 'Fotograflar alinamadi' 
      }, { status: 500 })
    }

    if (!photos || photos.length === 0) {
      console.log('⚠️ No photos found for event')
      return NextResponse.json({ success: true, matchCount: 0 })
    }

    const photoIds = photos.map(p => p.id)
    console.log(`📷 Found ${photoIds.length} photos in event`)

    // 3. Bu fotoğraflara ait face token'ları getir (SONRA)
    const { data: faceTokens, error: tokensError } = await supabase
      .from('face_tokens')
      .select('photo_id, face_token')
      .in('photo_id', photoIds)

    if (tokensError) {
      console.error('❌ Face tokens query error:', tokensError)
      return NextResponse.json({ 
        error: 'Face token alinamadi' 
      }, { status: 500 })
    }

    if (!faceTokens || faceTokens.length === 0) {
      console.log('⚠️ No face tokens found for photos')
      return NextResponse.json({ success: true, matchCount: 0 })
    }

    console.log(`🎭 Found ${faceTokens.length} face tokens to compare`)

    // 4. Yüz karşılaştırması
    const matches: string[] = []
    const checked = new Set<string>()

    // İlk 20 face token ile karşılaştır (daha fazla eşleşme için)
    for (const ft of faceTokens.slice(0, 20)) {
      if (checked.has(ft.photo_id)) continue
      checked.add(ft.photo_id)

      console.log(`🔄 Comparing with photo ${ft.photo_id}...`)
      const confidence = await compareFaces(selfieToken, ft.face_token)
      console.log(`📊 Confidence: ${confidence}`)

      if (confidence >= MATCH_THRESHOLD) {
        matches.push(ft.photo_id)
        
        // Eşleşmeyi kaydet
        const { error: insertError } = await supabase
          .from('participant_matches')
          .insert({
            participant_id: participantId,
            photo_id: ft.photo_id,
            confidence,
          })

        if (insertError) {
          console.error('❌ Match insert error:', insertError)
        } else {
          console.log(`✅ Match saved: ${confidence}%`)
        }
      }
    }

    // 5. Katılımcının eşleşme sayısını güncelle
    await supabase
      .from('participants')
      .update({ photo_count: matches.length })
      .eq('id', participantId)

    console.log(`🎉 Total matches: ${matches.length}`)

    return NextResponse.json({ 
      success: true, 
      matchCount: matches.length 
    })

  } catch (error) {
    console.error('💥 Match error:', error)
    return NextResponse.json({ 
      error: 'Hata olustu' 
    }, { status: 500 })
  }
}
