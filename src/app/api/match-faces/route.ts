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

    if (!participantId || !selfieUrl || !eventId) {
      return NextResponse.json(
        { error: 'participantId, selfieUrl ve eventId gerekli' },
        { status: 400 }
      )
    }

    const selfieFaces = await detectFaces(selfieUrl)

    if (selfieFaces.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Selfie de yuz tespit edilemedi',
        matchCount: 0,
      })
    }

    const selfieFaceToken = selfieFaces[0].face_token

    const { data: photos } = await supabase
      .from('photos')
      .select('id')
      .eq('event_id', eventId)

    if (!photos || photos.length === 0) {
      return NextResponse.json({
        success: true,
        matchCount: 0,
        message: 'Etkinlikte fotograf bulunamadi',
      })
    }

    const photoIds = photos.map(p => p.id)
    
    const { data: faceTokens } = await supabase
      .from('face_tokens')
      .select('photo_id, face_token')
      .in('photo_id', photoIds)

    if (!faceTokens || faceTokens.length === 0) {
      return NextResponse.json({
        success: true,
        matchCount: 0,
        message: 'Fotograflarda yuz bulunamadi',
      })
    }

    const matches: { photoId: string; confidence: number }[] = []
    const matchedPhotoIds = new Set<string>()

    for (const faceToken of faceTokens) {
      if (matchedPhotoIds.has(faceToken.photo_id)) continue

      const confidence = await compareFaces(selfieFaceToken, faceToken.face_token)

      if (confidence >= MATCH_THRESHOLD) {
        matches.push({
          photoId: faceToken.photo_id,
          confidence: confidence,
        })
        matchedPhotoIds.add(faceToken.photo_id)

        await supabase.from('participant_matches').insert({
          participant_id: participantId,
          photo_id: faceToken.photo_id,
          confidence: confidence,
        })
      }
    }

    await supabase
      .from('participants')
      .update({ photo_count: matches.length })
      .eq('id', participantId)

    return NextResponse.json({
      success: true,
      matchCount: matches.length,
      matches: matches,
    })
  } catch (error) {
    console.error('Match faces error:', error)
    return NextResponse.json({ error: 'Yuz eslestirme hatasi' }, { status: 500 })
  }
}
