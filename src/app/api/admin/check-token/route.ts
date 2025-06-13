import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function GET() {
  const cookieStore = await cookies()  // <-- aqui tem que ter await
  const token = cookieStore.get('admin-token')?.value

  console.log('Token do cookie:', token)
  console.log('JWT Secret:', process.env.ADMIN_JWT_SECRET)

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  try {
    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) throw new Error('Missing JWT secret')

    const secretKey = new TextEncoder().encode(secret)
    await jwtVerify(token, secretKey)

    return NextResponse.json({ valid: true })
  } catch (err) {
    console.log('Erro na verificação do token:', err)
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}
