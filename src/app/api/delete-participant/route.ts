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
    const { participantId, eventId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: 'participantId gerekli' }, { status: 400 })
    }

    console.log('🗑️ Deleting participant:', participantId)

    // 1. Get participant data for cleanup
    const { data: participantData } = await supabaseAdmin
      .from('participants')
      .select('selfie_url')
      .eq('id', participantId)
      .single()

    // 2. Delete participant_matches
    const { error: matchesError } = await supabaseAdmin
      .from('participant_matches')
      .delete()
      .eq('participant_id', participantId)

    if (matchesError) {
      console.error('❌ participant_matches delete error:', matchesError)
    } else {
      console.log('✅ participant_matches deleted')
    }

    // 3. Delete participant
    const { error: participantError } = await supabaseAdmin
      .from('participants')
      .delete()
      .eq('id', participantId)

    if (participantError) {
      console.error('❌ participant delete error:', participantError)
      throw participantError
    }

    console.log('✅ participant deleted from database')

    // 4. Delete selfie from storage
    if (participantData?.selfie_url) {
      try {
        const url = participantData.selfie_url
        const match = url.match(/\/selfies\/(.+)$/)
        
        if (match) {
          const filePath = match[1]
          await supabaseAdmin.storage
            .from('selfies')
            .remove([filePath])
          console.log('✅ Selfie deleted from storage')
        }
      } catch (storageError) {
        console.error('⚠️ Storage cleanup error:', storageError)
        // Continue even if storage fails
      }
    }

    // 5. Update event participant count
    if (eventId) {
      const { data: eventData } = await supabaseAdmin
        .from('events')
        .select('participant_count')
        .eq('id', eventId)
        .single()

      if (eventData) {
        const newCount = Math.max(0, (eventData.participant_count || 0) - 1)
        await supabaseAdmin
          .from('events')
          .update({ participant_count: newCount })
          .eq('id', eventId)
        console.log(`✅ Event participant count updated: ${newCount}`)
      }
    }

    console.log('✅ Participant delete completed')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('💥 Delete participant error:', error)
    return NextResponse.json({ 
      error: 'Silme hatası',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
