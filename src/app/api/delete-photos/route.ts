import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role key ile admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { photoIds, eventId } = await request.json()

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: 'photoIds gerekli' }, { status: 400 })
    }

    console.log(`🗑️ Deleting ${photoIds.length} photos`)

    // 1. Delete face_tokens
    const { error: faceTokensError } = await supabaseAdmin
      .from('face_tokens')
      .delete()
      .in('photo_id', photoIds)

    if (faceTokensError) {
      console.error('❌ face_tokens delete error:', faceTokensError)
    } else {
      console.log('✅ face_tokens deleted')
    }

    // 2. Delete participant_matches
    const { error: matchesError } = await supabaseAdmin
      .from('participant_matches')
      .delete()
      .in('photo_id', photoIds)

    if (matchesError) {
      console.error('❌ participant_matches delete error:', matchesError)
    } else {
      console.log('✅ participant_matches deleted')
    }

    // 3. Get photo URLs for storage cleanup
    const { data: photosData } = await supabaseAdmin
      .from('photos')
      .select('original_url')
      .in('id', photoIds)

    // 4. Delete photos from database
    const { error: photosError } = await supabaseAdmin
      .from('photos')
      .delete()
      .in('id', photoIds)

    if (photosError) {
      console.error('❌ photos delete error:', photosError)
      throw photosError
    }

    console.log('✅ photos deleted from database')

    // 5. Delete from storage
    if (photosData && photosData.length > 0) {
      try {
        const filePaths = photosData.map(photo => {
          const url = photo.original_url
          const match = url.match(/\/photos\/(.+)$/)
          return match ? match[1] : null
        }).filter(Boolean) as string[]

        if (filePaths.length > 0) {
          await supabaseAdmin.storage
            .from('photos')
            .remove(filePaths)
          console.log(`✅ ${filePaths.length} files deleted from storage`)
        }
      } catch (storageError) {
        console.error('⚠️ Storage cleanup error:', storageError)
        // Continue even if storage fails
      }
    }

    // 6. Update event photo count
    if (eventId) {
      const { data: eventData } = await supabaseAdmin
        .from('events')
        .select('photo_count')
        .eq('id', eventId)
        .single()

      if (eventData) {
        const newCount = Math.max(0, (eventData.photo_count || 0) - photoIds.length)
        await supabaseAdmin
          .from('events')
          .update({ photo_count: newCount })
          .eq('id', eventId)
        console.log(`✅ Event photo count updated: ${newCount}`)
      }
    }

    console.log('✅ Bulk delete completed')

    return NextResponse.json({ 
      success: true,
      deletedCount: photoIds.length 
    })
  } catch (error) {
    console.error('💥 Bulk delete error:', error)
    return NextResponse.json({ 
      error: 'Silme hatası',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
