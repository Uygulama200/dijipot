import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // Desteklenen diller
  locales: ['tr'],
  
  // Varsayılan dil
  defaultLocale: 'tr'
})

export const config = {
  // Tüm path'leri kapsayacak şekilde
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
