import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout realizado com sucesso' })

  // Remove o cookie do token JWT
  response.cookies.set('admin-token', '', {
    path: '/',
    maxAge: 0, // Expira imediatamente
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
