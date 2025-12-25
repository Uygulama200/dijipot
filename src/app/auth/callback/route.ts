import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/panel'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      return NextResponse.redirect(
        new URL(`${next}?verified=true`, requestUrl.origin)
      )
    } catch (error) {
      console.error('Error exchanging code:', error)
      return NextResponse.redirect(
        new URL('/giris?error=verification_failed', requestUrl.origin)
      )
    }
  }

  return NextResponse.redirect(new URL('/giris', requestUrl.origin))
}
