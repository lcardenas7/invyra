import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const hasConfiguredSiteUrl =
    configuredSiteUrl && /^https?:\/\//i.test(configuredSiteUrl)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const publicOrigin = hasConfiguredSiteUrl
    ? configuredSiteUrl
    : forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : requestUrl.origin

  return NextResponse.redirect(new URL('/dashboard', publicOrigin))
}
