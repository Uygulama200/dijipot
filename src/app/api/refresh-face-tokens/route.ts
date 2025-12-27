import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FACEPP_API_KEY = process.env.FACEPP_API_KEY
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET
const DELAY_MS = 1100

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function detectFaces(imageUrl: string) {
  const params = new URLSearchParams()
  params.append('api_key', FACEPP_API_KEY!)
  params.append('api_secret', FACEPP_API_SECRET!)
  params.append('image_url', imageUrl)

  const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const data = await res.json()
  
  if (data.error_message) {
    console.error('Face++ Error:', data.error_message)
    return []
  }
  
  return data.faces || []
}

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    console.log('🔄 Refreshing face tokens for event:', eventId)

    // 1. Event'e ait fotoğrafları getir
    const { data: photos } = await supabase
      .from('photos')
      .select('id, original_url')
      .eq('event_id', eventId)

    if (!photos || photos.length === 0) {
      return NextResponse.json({ error: 'No photos found' }, { status: 404 })
    }

    console.log(`📸 Found ${photos.length} photos`)

    // 2. Eski tokenları sil
    const photoIds = photos.map(p => p.id)
    const { error: deleteError } = await supabase
      .from('face_tokens')
      .delete()
      .in('photo_id', photoIds)

    if (deleteError) {
      console.error('Delete error:', deleteError)
    } else {
      console.log('✅ Old tokens deleted')
    }

    // 3. Yeni tokenlar oluştur
    let processedCount = 0
    let totalFaces = 0

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      console.log(`[${i + 1}/${photos.length}] Processing photo ${photo.id}`)

      const faces = await detectFaces(photo.original_url)
      
      if (faces.length > 0) {
        const tokens = faces.map((face: any) => ({
          photo_id: photo.id,
          face_token: face.face_token,
        }))

        const { error: insertError } = await supabase
          .from('face_tokens')
          .insert(tokens)

        if (insertError) {
          console.error('Insert error:', insertError)
        } else {
          totalFaces += faces.length
          console.log(`✅ ${faces.length} faces detected`)
        }
      }

      processedCount++

      // Rate limit için bekle
      if (i < photos.length - 1) {
        await delay(DELAY_MS)
      }
    }

    console.log(`🎉 Refresh complete: ${processedCount} photos, ${totalFaces} faces`)

    return NextResponse.json({ 
      success: true, 
      processedPhotos: processedCount,
      totalFaces 
    })

  } catch (error) {
    console.error('Refresh error:', error)
    return NextResponse.json({ error: 'Failed to refresh' }, { status: 500 })
  }
}
