import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ADMIN_PAGES = ['/admin/login', '/', '/confirmar']
const PUBLIC_ADMIN_API = ['/api/admin/login', '/api/admin/config']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isApiRoute = pathname.startsWith('/api/')
  const isPublicPage = PUBLIC_ADMIN_PAGES.includes(pathname)
  const isPublicApi = PUBLIC_ADMIN_API.includes(pathname)

  console.log('[middleware] pathname:', pathname)
  console.log('[middleware] isApiRoute:', isApiRoute)
  console.log('[middleware] isPublicPage:', isPublicPage)
  console.log('[middleware] isPublicApi:', isPublicApi)

  if (isPublicPage || isPublicApi) {
    console.log('[middleware] Página ou API pública, liberando acesso')
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin-token')?.value
   

    if (!token) {
      console.log('[middleware] Token ausente, redirecionando para login')
      if (!isApiRoute) {
        return NextResponse.redirect(new URL('/admin/login', req.url), { status: 303 })
      }
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) {
      console.error('[middleware] ADMIN_JWT_SECRET não definido no ambiente')
      return new NextResponse('Erro interno: segredo não definido', { status: 500 })
    }

    try {
      const secretKey = new TextEncoder().encode(secret)
      await jwtVerify(token, secretKey)
      console.log('[middleware] Token válido, liberando acesso')
      return NextResponse.next()
    } catch (err) {
      console.warn('[middleware] Token inválido ou expirado:', err)
      if (!isApiRoute) {
        return NextResponse.redirect(new URL('/admin/login', req.url), { status: 303 })
      }
      return new NextResponse(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  console.log('[middleware] Rota não protegida, liberando acesso')
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
