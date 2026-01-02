import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FACEPP_API_KEY = process.env.FACEPP_API_KEY
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET
const MATCH_THRESHOLD = 55
const DELAY_MS = 1100
const MAX_FACES_TO_CHECK = 100 // İlk 100 en büyük yüzü kontrol et

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function detectFace(imageUrl: string): Promise<string | null> {
  const params = new URLSearchParams()
  params.append('api_key', FACEPP_API_KEY!)
  params.append('api_secret', FACEPP_API_SECRET!)
  params.append('image_url', imageUrl)

  const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = await res.json()
  
  if (data.error_message) {
    console.error('❌ Face++ Detect Error:', data.error_message)
    return null
  }
  
  return data.faces?.[0]?.face_token || null
}

async function compareFaces(token1: string, token2: string): Promise<number> {
  const params = new URLSearchParams()
  params.append('api_key', FACEPP_API_KEY!)
  params.append('api_secret', FACEPP_API_SECRET!)
  params.append('face_token1', token1)
  params.append('face_token2', token2)

  const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const data = await res.json()
  
  console.log('🎭 Face++ Compare Response:', JSON.stringify(data))
  
  if (data.error_message) {
    console.error('❌ Face++ Error:', data.error_message)
    return 0
  }
  
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

    // 2. Event'e ait fotoğrafları getir
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

    // 3. 🔥 TÜM FACE TOKENS + RECTANGLE (YÜZ BOYUTU) BİLGİSİYLE ÇEK
    const { data: faceTokens, error: tokensError } = await supabase
      .from('face_tokens')
      .select('id, photo_id, face_token, face_rectangle')
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

    // 4. 🔥 YÜZ ALANINA GÖRE SIRALA (EN BÜYÜK YÜZLER = EN NET FOTOĞRAFLAR)
    const sortedTokens = faceTokens
      .map(ft => {
        const rect = ft.face_rectangle
        const area = rect ? rect.width * rect.height : 0
        return { ...ft, faceArea: area }
      })
      .sort((a, b) => b.faceArea - a.faceArea) // Büyükten küçüğe
      .slice(0, MAX_FACES_TO_CHECK) // İlk 100 en büyük yüz

    console.log(`✨ Sorted by face size. Checking top ${sortedTokens.length} faces`)
    console.log(`📊 Face area range: ${sortedTokens[0]?.faceArea} - ${sortedTokens[sortedTokens.length - 1]?.faceArea}`)

    // 5. 🔥 HER YÜZÜ AYRI AYRI KONTROL ET (PHOTO_ID CHECK KALDIRILDI)
    const matches: string[] = []
    const matchedPhotoIds = new Set<string>() // Sadece istatistik için

    for (let i = 0; i < sortedTokens.length; i++) {
      const ft = sortedTokens[i]

      console.log(`🔄 [${i + 1}/${sortedTokens.length}] Comparing face_token ${ft.id} from photo ${ft.photo_id} (area: ${ft.faceArea})...`)
      
      const confidence = await compareFaces(selfieToken, ft.face_token)
      console.log(`📊 Confidence: ${confidence}`)

      if (confidence >= MATCH_THRESHOLD) {
        matches.push(ft.photo_id)
        matchedPhotoIds.add(ft.photo_id)
        
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
          console.log(`✅ Match saved: photo ${ft.photo_id} with ${confidence}%`)
        }
      }

      // Rate limit için bekle
      if (i < sortedTokens.length - 1) {
        await delay(DELAY_MS)
      }
    }

    // 6. Katılımcının eşleşme sayısını güncelle
    const uniquePhotoCount = matchedPhotoIds.size

    if (uniquePhotoCount > 0) {
      const { error: updateError } = await supabase
        .from('participants')
        .update({ photo_count: uniquePhotoCount })
        .eq('id', participantId)
      
      if (updateError) {
        console.error('❌ Photo count update error:', updateError)
      } else {
        console.log(`✅ Photo count updated: ${uniquePhotoCount} unique photos`)
      }
    }

    console.log(`🎉 Total matches: ${matches.length} faces across ${uniquePhotoCount} unique photos`)

    return NextResponse.json({ 
      success: true, 
      matchCount: uniquePhotoCount,
      totalFaceMatches: matches.length
    })

  } catch (error) {
    console.error('💥 Match error:', error)
    return NextResponse.json({ 
      error: 'Hata olustu' 
    }, { status: 500 })
  }
}
