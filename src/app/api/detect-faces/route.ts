import { NextRequest, NextResponse } from 'next/server'
import { detectFaces } from '@/lib/facepp'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { photoId, imageUrl } = await request.json()

    if (!photoId || !imageUrl) {
      return NextResponse.json({ error: 'photoId ve imageUrl gerekli' }, { status: 400 })
    }

    console.log('Detecting faces for photo:', photoId)

    // Face++ ile yüzleri tespit et
    const faces = await detectFaces(imageUrl)
    
    console.log(`Found ${faces.length} faces`)

    // Her yüzü veritabanına kaydet
    for (const face of faces) {
      await supabase.from('face_tokens').insert({
        photo_id: photoId,
        face_token: face.face_token,
        face_rectangle: face.face_rectangle,
      })
    }

    return NextResponse.json({
      success: true,
      faceCount: faces.length,
      faces: faces,
    })
  } catch (error) {
    console.error('Detect faces error:', error)
    return NextResponse.json({ error: 'Yüz tespit hatası' }, { status: 500 })
  }
}
