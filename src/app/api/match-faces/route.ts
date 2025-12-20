import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FACEPP_API_KEY = process.env.FACEPP_API_KEY
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET
const MATCH_THRESHOLD = 70

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

    if (!participantId || !selfieUrl || !eventId) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 })
    }

    const selfieToken = await detectFace(selfieUrl)
    if (!selfieToken) {
      return NextResponse.json({ success: false, matchCount: 0, error: 'Yuz bulunamadi' })
    }

    const { data: faceTokens } = await supabase
      .from('face_tokens')
      .select('photo_id, face_token')
      .in('photo_id', 
        (await supabase.from('photos').select('id').eq('event_id', eventId)).data?.map(p => p.id) || []
      )

    if (!faceTokens || faceTokens.length === 0) {
      return NextResponse.json({ success: true, matchCount: 0 })
    }

    const matches: string[] = []
    const checked = new Set<string>()

    for (const ft of faceTokens.slice(0, 10)) {
      if (checked.has(ft.photo_id)) continue
      checked.add(ft.photo_id)

      const confidence = await compareFaces(selfieToken, ft.face_token)
      
      if (confidence >= MATCH_THRESHOLD) {
        matches.push(ft.photo_id)
        await supabase.from('participant_matches').insert({
          participant_id: participantId,
          photo_id: ft.photo_id,
          confidence,
        })
      }
    }

    await supabase.from('participants').update({ photo_count: matches.length }).eq('id', participantId)

    return NextResponse.json({ success: true, matchCount: matches.length })
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json({ error: 'Hata olustu' }, { status: 500 })
  }
}
