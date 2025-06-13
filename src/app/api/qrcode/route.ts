// app/api/qrcode/route.ts
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID não fornecido' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!baseUrl || typeof baseUrl !== 'string') {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SITE_URL não configurado' },
        { status: 500 }
      )
    }

    const urlConfirmacao = `${baseUrl}/confirmar/${id}`

    const qrCodeDataUrl = await QRCode.toDataURL(urlConfirmacao)

    if (!qrCodeDataUrl) {
      return NextResponse.json(
        { error: 'Falha ao gerar QR Code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ qrCodeDataUrl })
  } catch (error: any) {
    console.error('Erro ao gerar QR Code:', error)
    return NextResponse.json(
      { error: 'Erro interno ao gerar QR Code' },
      { status: 500 }
    )
  }
}
