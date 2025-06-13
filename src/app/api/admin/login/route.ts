import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../../lib/prisma'
import { SignJWT } from 'jose'

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json()

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ success: false, error: 'PIN inválido ou não enviado' }, { status: 400 })
    }

    let pinEntry = await prisma.adminConfig.findFirst()

    if (!pinEntry) {
      const hash = await bcrypt.hash(pin, 10)
      pinEntry = await prisma.adminConfig.create({
        data: {
          id: 'admin',
          pinHash: hash,
          pin: pin,
        },
      })
      // Gera o token JWT após criar o PIN
    } else {
      if (!pinEntry.pinHash) {
        return NextResponse.json({ success: false, error: 'PIN não configurado corretamente' }, { status: 500 })
      }
      const match = await bcrypt.compare(pin, pinEntry.pinHash)
      if (!match) {
        return NextResponse.json({ success: false, error: 'PIN incorreto' }, { status: 401 })
      }
    }

    // Gera o JWT
    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) throw new Error('ADMIN_JWT_SECRET não definido')

    const secretKey = new TextEncoder().encode(secret)

    // Você pode incluir payload que quiser dentro do token, ex:
    const jwt = await new SignJWT({ admin: true }) // payload básico
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d') // token válido 1 dia
      .sign(secretKey)

    // Retorna resposta com cookie contendo o token JWT real
    const response = NextResponse.json({ success: true, message: 'Acesso liberado' })
    response.cookies.set('admin-token', jwt, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 dia
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (err) {
    console.error('[LOGIN] Erro interno:', err)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
export const config = {
  runtime: 'edge',
}
