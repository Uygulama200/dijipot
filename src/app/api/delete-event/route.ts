import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role key ile admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json({ error: 'eventId gerekli' }, { status: 400 })
    }

    console.log('🗑️ Deleting event:', eventId)

    // 1. Get all photo IDs for this event
    const { data: photosData } = await supabaseAdmin
      .from('photos')
      .select('id')
      .eq('event_id', eventId)

    const photoIds = photosData?.map(p => p.id) || []
    console.log(`📷 Found ${photoIds.length} photos to delete`)

    // 2. Delete face_tokens
    if (photoIds.length > 0) {
      const { error: faceTokensError } = await supabaseAdmin
        .from('face_tokens')
        .delete()
        .in('photo_id', photoIds)

      if (faceTokensError) {
        console.error('❌ face_tokens delete error:', faceTokensError)
      } else {
        console.log('✅ face_tokens deleted')
      }
    }

    // 3. Delete participant_matches
    if (photoIds.length > 0) {
      const { error: matchesError } = await supabaseAdmin
        .from('participant_matches')
        .delete()
        .in('photo_id', photoIds)

      if (matchesError) {
        console.error('❌ participant_matches delete error:', matchesError)
      } else {
        console.log('✅ participant_matches deleted')
      }
    }

    // 4. Delete participants
    const { error: participantsError } = await supabaseAdmin
      .from('participants')
      .delete()
      .eq('event_id', eventId)

    if (participantsError) {
      console.error('❌ participants delete error:', participantsError)
    } else {
      console.log('✅ participants deleted')
    }

    // 5. Delete photos
    const { error: photosError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('event_id', eventId)

    if (photosError) {
      console.error('❌ photos delete error:', photosError)
    } else {
      console.log('✅ photos deleted')
    }

    // 6. Delete storage files
    try {
      // Photos bucket
      const { data: storageFiles } = await supabaseAdmin.storage
        .from('photos')
        .list(eventId)

      if (storageFiles && storageFiles.length > 0) {
        const filePaths = storageFiles.map(file => `${eventId}/${file.name}`)
        await supabaseAdmin.storage
          .from('photos')
          .remove(filePaths)
        console.log(`✅ ${filePaths.length} files deleted from photos bucket`)
      }

      // Selfies bucket
      const { data: selfieFiles } = await supabaseAdmin.storage
        .from('selfies')
        .list(eventId)

      if (selfieFiles && selfieFiles.length > 0) {
        const filePaths = selfieFiles.map(file => `${eventId}/${file.name}`)
        await supabaseAdmin.storage
          .from('selfies')
          .remove(filePaths)
        console.log(`✅ ${filePaths.length} files deleted from selfies bucket`)
      }
    } catch (storageError) {
      console.error('⚠️ Storage cleanup error:', storageError)
      // Continue even if storage cleanup fails
    }

    // 7. Delete event
    const { error: eventError } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', eventId)

    if (eventError) {
      console.error('❌ event delete error:', eventError)
      throw eventError
    }

    console.log('✅ Event deleted successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('💥 Delete event error:', error)
    return NextResponse.json({ 
      error: 'Silme hatası',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
